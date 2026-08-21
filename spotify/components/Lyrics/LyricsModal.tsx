"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdMic } from "react-icons/md";
import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";

export default function LyricsModal() {
  const { lyricsOpen, toggleLyrics } = useUIStore();
  const { currentTrack } = usePlayerStore();

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTrack || !lyricsOpen) return;

    let isMounted = true;
    setLoading(true);
    setLyrics(null);

    async function fetchLyrics() {
      try {
        const cleanArtist = encodeURIComponent(currentTrack!.artist.split("ft.")[0].trim());
        const cleanTitle = encodeURIComponent(currentTrack!.title.split("(")[0].trim());

        const res = await fetch(`https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`);
        if (!res.ok) throw new Error("Lyrics unavailable");

        const data = await res.json();
        if (isMounted && data.lyrics) {
          setLyrics(data.lyrics);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Fallback placeholder lyrics
      }

      if (isMounted) {
        setLyrics(
          `[Intro]\nYeah, yeah\nMusic in the air...\n\n[Verse 1]\n${currentTrack!.title} playing loud and clear\nEvery note is floating near\nFeel the rhythm, feel the beat\nDancing down Spotify street\n\n[Chorus]\nOh ${currentTrack!.artist}, play it once again\nFrom the start until the end\nMusic streaming, dark mode glow\nLet the audio system flow!\n\n[Outro]\n(Fade out...)`
        );
        setLoading(false);
      }
    }

    fetchLyrics();
    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, lyricsOpen]);

  return (
    <AnimatePresence>
      {lyricsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 top-0 bottom-[90px] bg-gradient-to-b from-[#450af5]/90 to-[#121212] z-40 p-8 flex flex-col backdrop-blur-md overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <MdMic size={28} className="text-[#1ed760]" />
              <div>
                <h2 className="text-2xl font-black">{currentTrack?.title ?? "Lyrics"}</h2>
                <p className="text-sm text-white/70">{currentTrack?.artist}</p>
              </div>
            </div>
            <button
              onClick={toggleLyrics}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <MdClose size={28} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto hide-scrollbar py-12 px-4 max-w-3xl mx-auto w-full text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-white/60 animate-pulse">
                <MdMic size={48} />
                <p className="text-lg font-bold">Fetching lyrics...</p>
              </div>
            ) : (
              <pre className="font-sans text-2xl md:text-3xl font-bold leading-relaxed whitespace-pre-wrap tracking-wide text-white/90 drop-shadow">
                {lyrics}
              </pre>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
