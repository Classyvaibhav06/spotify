"use client";

import { useRef, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function ProgressBar({ className = "" }: { className?: string }) {
  const { progress, currentTime, currentTrack, isPlaying, setProgress } = usePlayerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate 1-second playback tick
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        usePlayerStore.setState(s => {
          if (!s.currentTrack || !s.isPlaying) return s;
          const newTime = Math.min(s.currentTime + 1, s.currentTrack.duration);
          if (newTime >= s.currentTrack.duration) {
            clearInterval(intervalRef.current!);
            setTimeout(() => s.next(), 0);
            return s;
          }
          return { ...s, currentTime: newTime, progress: (newTime / s.currentTrack.duration) * 100 };
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentTrack?.id]);

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const duration = currentTrack?.duration ?? 0;

  return (
    <div className={`flex items-center gap-2 w-full group/bar ${className}`}>
      {/* Current time — micro 10px */}
      <span
        className="type-micro flex-shrink-0 tabular-nums"
        style={{ color: "var(--text-secondary)", minWidth: 32, textAlign: "right" }}
      >
        {fmt(currentTime)}
      </span>

      {/* Track */}
      <div className="relative flex-1" style={{ height: 4 }}>
        {/* Background track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "#535353" }}
        />
        {/* Filled portion — white by default, green on hover */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-colors duration-150 group-hover/bar:bg-[#1ed760]"
          style={{ width: `${progress}%`, background: "var(--text-base)" }}
        />
        {/* Invisible range for interaction */}
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "100%" }}
        />
        {/* Thumb dot — hidden until hover */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            width:      12,
            height:     12,
            background: "var(--text-base)",
            left:       `calc(${progress}% - 6px)`,
          }}
        />
      </div>

      {/* Duration — micro 10px */}
      <span
        className="type-micro flex-shrink-0 tabular-nums"
        style={{ color: "var(--text-secondary)", minWidth: 32 }}
      >
        {fmt(duration)}
      </span>
    </div>
  );
}
