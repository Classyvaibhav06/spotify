"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function YouTubeAudioEngine() {
  const {
    currentTrack,
    queue,
    isPlaying,
    volume,
    progress,
    setProgress,
    setDuration,
    next,
  } = usePlayerStore();


  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackRetryIndexRef = useRef<number>(0);
  const lastFailedTrackIdRef = useRef<string | null>(null);

  // Reset fallback retry counter when current track changes
  useEffect(() => {
    fallbackRetryIndexRef.current = 0;
    lastFailedTrackIdRef.current = null;
  }, [currentTrack?.id]);


  // Prevent mobile browser / Android WebView from pausing YouTube audio when backgrounded or locked
  useEffect(() => {
    try {
      Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
      Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
      Object.defineProperty(document, "webkitHidden", { get: () => false, configurable: true });
      Object.defineProperty(document, "webkitVisibilityState", { get: () => "visible", configurable: true });
      const blockVisibility = (e: Event) => e.stopImmediatePropagation();
      window.addEventListener("visibilitychange", blockVisibility, true);
      document.addEventListener("visibilitychange", blockVisibility, true);
      window.addEventListener("webkitvisibilitychange", blockVisibility, true);
    } catch (err) {
      // Ignore
    }
  }, []);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isApiReadyRef.current = true;
      initPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      isApiReadyRef.current = true;
      initPlayer();
    };
  }, []);


  // Initialize YouTube Player
  function initPlayer() {
    if (playerRef.current || !window.YT) return;

    const initialVideoId =
      currentTrack?.youtubeId && !currentTrack.youtubeId.startsWith("query:")
        ? currentTrack.youtubeId
        : "vB1o7X-y68A";

    playerRef.current = new window.YT.Player("youtube-audio-bridge", {
      height: "0",
      width: "0",
      videoId: initialVideoId,
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED === 0
          if (event.data === 0) {
            next();
          }
        },
        onError: async (e: any) => {
          console.warn("YouTube player notice:", e);
          const current = usePlayerStore.getState().currentTrack;

          // Handle Error 150, 101, 100, 2: Embedding blocked or video unavailable
          if (current && (e.data === 150 || e.data === 101 || e.data === 100 || e.data === 2)) {
            const attempt = fallbackRetryIndexRef.current;
            if (attempt < 3) {
              fallbackRetryIndexRef.current += 1;
              try {
                const searchVariants = [
                  `${current.title} ${current.artist} audio`,
                  `${current.title} ${current.artist} lyrics`,
                  `${current.title} topic`,
                ];
                const queryVariant = searchVariants[attempt] || searchVariants[0];
                const altRes = await fetch(`/api/search?q=${encodeURIComponent(queryVariant)}`);
                const altData = await altRes.json();
                const candidates = (altData?.tracks || []).filter(
                  (t: any) => t.youtubeId && t.youtubeId !== current.youtubeId
                );

                const nextCandidate = candidates[attempt] || candidates[0];
                if (nextCandidate?.youtubeId && playerRef.current?.loadVideoById) {
                  usePlayerStore.setState((s) => ({
                    currentTrack: s.currentTrack
                      ? {
                          ...s.currentTrack,
                          youtubeId: nextCandidate.youtubeId,
                          coverUrl: nextCandidate.coverUrl || s.currentTrack.coverUrl,
                        }
                      : s.currentTrack,
                  }));
                  playerRef.current.loadVideoById(nextCandidate.youtubeId);
                  setTimeout(() => {
                    try {
                      playerRef.current?.playVideo?.();
                    } catch (playErr) {}
                  }, 150);
                  return;
                }
              } catch (altErr) {
                console.warn("Alternative track resolution error:", altErr);
              }
            }
          }

          const toast = useUIStore.getState().addToast;
          if (toast) {
            toast("Track playback restricted by owner. Auto-advancing to next song...", "warning");
          }
          // Auto advance to next track on error
          setTimeout(() => next(), 500);
        },

      },
    });
  }


  // Update track videoId when currentTrack changes
  useEffect(() => {
    if (!currentTrack) return;

    let targetVideoId = currentTrack.youtubeId;

    // If track is pending search resolution
    if (targetVideoId && targetVideoId.startsWith("query:")) {
      const searchQuery = decodeURIComponent(targetVideoId.replace("query:", ""));
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          const matchId = data?.tracks?.[0]?.youtubeId || "4NRXx6U8ABQ";
          const matchCover = data?.tracks?.[0]?.coverUrl;
          
          usePlayerStore.setState((s) => ({
            currentTrack:
              s.currentTrack && s.currentTrack.id === currentTrack.id
                ? {
                    ...s.currentTrack,
                    youtubeId: matchId,
                    coverUrl: matchCover || s.currentTrack.coverUrl,
                  }
                : s.currentTrack,
          }));

          if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
            playerRef.current.loadVideoById(matchId);
            if (isPlaying) {
              setTimeout(() => {
                try {
                  playerRef.current?.playVideo?.();
                } catch (err) {}
              }, 150);
            }
          }
        })
        .catch((err) => {
          console.warn("Dynamic track resolution error:", err);
          if (playerRef.current?.loadVideoById) {
            playerRef.current.loadVideoById("4NRXx6U8ABQ");
            if (isPlaying) playerRef.current.playVideo?.();
          }
        });
      return;
    }


    if (playerRef.current && targetVideoId) {
      try {
        if (typeof playerRef.current.loadVideoById === "function") {
          playerRef.current.loadVideoById(targetVideoId);
          if (isPlaying) {
            setTimeout(() => {
              try {
                playerRef.current?.playVideo?.();
              } catch (err) {
                // Ignore initial play tick errors
              }
            }, 150);
          }
        }
      } catch (e) {
        console.warn("Error loading YouTube video:", e);
      }
    }
  }, [currentTrack?.id]);

  // Performance Optimization: Background prefetch upcoming queue tracks for instant gapless transitions
  const upcomingTrack = queue[0];
  useEffect(() => {
    if (!upcomingTrack || !upcomingTrack.youtubeId) return;
    if (upcomingTrack.youtubeId.startsWith("query:")) {
      const q = decodeURIComponent(upcomingTrack.youtubeId.replace("query:", ""));
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          const matchId = data?.tracks?.[0]?.youtubeId;
          const matchCover = data?.tracks?.[0]?.coverUrl;
          if (matchId) {
            usePlayerStore.setState((s) => {
              if (s.queue.length > 0 && s.queue[0].id === upcomingTrack.id) {
                const newQueue = [...s.queue];
                newQueue[0] = {
                  ...newQueue[0],
                  youtubeId: matchId,
                  coverUrl: matchCover || newQueue[0].coverUrl,
                };
                return { queue: newQueue };
              }
              return s;
            });
          }
        })
        .catch(() => {});
    }
  }, [upcomingTrack?.id, upcomingTrack?.youtubeId]);




  // Sync Play / Pause state
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch (e) {
      console.warn("YouTube play/pause error:", e);
    }
  }, [isPlaying]);

  // Timeline seek listener (scrubbing/clicking progress slider)
  const prevProgressRef = useRef(progress);
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      // If progress changed by more than 2 seconds (user seeked manually)
      if (Math.abs(progress - prevProgressRef.current) > 2) {
        try {
          playerRef.current.seekTo(progress, true);
        } catch (e) {
          // Ignore seek errors
        }
      }
    }
    prevProgressRef.current = progress;
  }, [progress]);

  // Sync Volume
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Progress ticker & duration reader
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          try {
            const currentTime = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 180;
            setProgress(Math.floor(currentTime));
            if (dur > 0) setDuration(Math.floor(dur));
          } catch (e) {
            // Ignore polling errors
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <div
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div id="youtube-audio-bridge" />
    </div>
  );
}
