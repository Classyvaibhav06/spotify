"use client";

import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdKeyboardArrowDown,
  MdPlayArrow,
  MdPause,
  MdSkipPrevious,
  MdSkipNext,
  MdShuffle,
  MdRepeat,
  MdVolumeUp,
  MdFavorite,
} from "react-icons/md";

export default function FullPlayerModal() {
  const { showFullPlayer, setShowFullPlayer } = useUIStore();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    next,
    previous,
    seek,
  } = usePlayerStore();

  if (!showFullPlayer || !currentTrack) return null;

  const bgGradient = currentTrack.bgGradient || "linear-gradient(135deg, #1e1b4b, #0f172a)";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] flex flex-col justify-between p-8 text-white overflow-hidden"
        style={{ background: bgGradient }}
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />

        {/* ── Top Header ── */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setShowFullPlayer(false)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <MdKeyboardArrowDown size={32} />
          </button>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Playing from Album</span>
            <p className="font-bold text-sm truncate max-w-xs">{currentTrack.album || "Spotify Music"}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* ── Center Content: Spinning Vinyl Disc & Enlarged Lyrics ── */}
        <div className="relative z-10 my-auto flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto w-full">
          {/* Vinyl Disc Container */}
          <div className="relative flex items-center justify-center">
            {/* Vinyl Record */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-black border-4 border-gray-900 shadow-2xl flex items-center justify-center relative overflow-hidden"
            >
              {/* Vinyl Groove Rings */}
              <div className="absolute inset-2 rounded-full border border-gray-800/80" />
              <div className="absolute inset-8 rounded-full border border-gray-800/60" />
              <div className="absolute inset-16 rounded-full border border-gray-800/40" />

              {/* Center Album Art Label */}
              <img
                src={currentTrack.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"}
                alt={currentTrack.title}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-inner"
              />
              <div className="absolute w-6 h-6 rounded-full bg-black border-2 border-gray-700 z-10" />
            </motion.div>
          </div>

          {/* Enlarged Synchronized Lyrics Preview */}
          <div className="flex-1 max-w-md text-center lg:text-left space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {currentTrack.title}
            </h2>
            <p className="text-xl text-gray-300 font-medium">{currentTrack.artist}</p>

            <div className="pt-6 space-y-3 font-semibold text-lg sm:text-xl text-gray-400">
              <p className="hover:text-white transition-colors">I've become so numb, I can't feel you there</p>
              <p className="text-green-400 font-bold text-xl sm:text-2xl scale-105 transition-all drop-shadow">
                Become so tired, so much more aware
              </p>
              <p className="hover:text-white transition-colors">By becoming this all I want to do</p>
              <p className="hover:text-white transition-colors">Is be more like me and be less like you</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Controls & Timeline Bar ── */}
        <div className="relative z-10 max-w-3xl mx-auto w-full space-y-4">
          {/* Progress Timeline Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-600/50 rounded-lg appearance-none cursor-pointer accent-green-500 hover:h-2 transition-all"
            />
            <div className="flex justify-between text-xs text-gray-300 font-medium">
              <span>{Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, "0")}</span>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}</span>
            </div>
          </div>

          {/* Playback Action Buttons */}
          <div className="flex items-center justify-between">
            <button className="text-gray-400 hover:text-green-400 transition-colors">
              <MdShuffle size={24} />
            </button>

            <div className="flex items-center gap-6">
              <button onClick={previous} className="text-gray-300 hover:text-white transition-colors">
                <MdSkipPrevious size={36} />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-xl"
              >
                {isPlaying ? <MdPause size={36} /> : <MdPlayArrow size={40} className="ml-1" />}
              </button>
              <button onClick={next} className="text-gray-300 hover:text-white transition-colors">
                <MdSkipNext size={36} />
              </button>
            </div>

            <button className="text-gray-400 hover:text-green-400 transition-colors">
              <MdRepeat size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
