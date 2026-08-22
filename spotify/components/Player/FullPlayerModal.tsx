"use client";

import { useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useLibraryStore } from "@/store/libraryStore";
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
  MdRepeatOne,
  MdMoreVert,
  MdClose,
  MdAddCircleOutline,
  MdCheckCircle,
  MdDevices,
  MdShare,
  MdQueueMusic,
  MdTimer,
} from "react-icons/md";
import { SiSpotify } from "react-icons/si";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function FullPlayerModal() {
  const { showFullPlayer, setShowFullPlayer, toggleLyrics, addToast, openContextMenu } = useUIStore();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    progress,
    duration,
    togglePlay,
    next,
    previous,
    seek,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLibraryStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  if (!showFullPlayer || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const activeTime = isDragging ? dragTime : currentTime || progress || 0;
  const progressPercent = duration > 0 ? (activeTime / duration) * 100 : 0;

  // Rich dynamic ambient background colors
  const bgGradient =
    currentTrack.bgGradient ||
    "linear-gradient(180deg, #58151c 0%, #290a0f 45%, #121212 100%)";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="fixed inset-0 z-[100] flex flex-col justify-between p-5 sm:p-7 text-white select-none overflow-y-auto hide-scrollbar"
        style={{ background: bgGradient }}
      >
        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 pointer-events-none" />

        {/* ── Top Header Navigation ── */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <button
            onClick={() => setShowFullPlayer(false)}
            className="p-2 -ml-2 rounded-full text-white/80 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Minimize"
          >
            <MdKeyboardArrowDown size={30} />
          </button>

          <div className="text-center px-4 min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/70 block truncate">
              Recommended for you
            </span>
            <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[240px] mx-auto mt-0.5">
              {currentTrack.album || "Spotify Music"}
            </p>
          </div>

          <button
            onClick={(e) => {
              openContextMenu({
                x: e.clientX || window.innerWidth - 80,
                y: e.clientY || 60,
                trackId: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artist,
              });
            }}
            className="p-2 -mr-2 rounded-full text-white/80 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="More Options"
          >
            <MdMoreVert size={24} />
          </button>
        </div>

        {/* ── Center Large Album Artwork ── */}
        <div className="relative z-10 my-auto py-4 flex items-center justify-center">
          <div className="relative w-[78vw] max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-white/10 group">
            <img
              src={
                currentTrack.coverUrl ||
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80"
              }
              alt={currentTrack.title}
              className="w-full h-full object-cover select-none"
            />
          </div>
        </div>

        {/* ── Bottom Interactive Controls Section ── */}
        <div className="relative z-10 w-full max-w-md mx-auto space-y-4 pb-2">
          {/* Track Title & Quick Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate leading-tight tracking-tight">
                {currentTrack.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <SiSpotify size={13} className="text-[#1ed760] flex-shrink-0" />
                <p className="text-sm font-semibold text-[#b3b3b3] truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => addToast("Song hidden from recommendations", "info")}
                className="p-2 text-white/70 hover:text-white active:scale-90 transition-transform"
                title="Hide song"
              >
                <MdClose size={24} />
              </button>

              <button
                onClick={() => {
                  toggleLike(currentTrack);
                  addToast(
                    liked ? "Removed from Liked Songs" : "Added to Liked Songs",
                    liked ? "info" : "success"
                  );
                }}
                className={`p-2 transition-transform active:scale-125 ${
                  liked ? "text-[#1ed760]" : "text-white/80 hover:text-white"
                }`}
                title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
              >
                {liked ? <MdCheckCircle size={26} /> : <MdAddCircleOutline size={26} />}
              </button>
            </div>
          </div>

          {/* Interactive Seekbar / Progress Timeline */}
          <div className="space-y-1.5 pt-1">
            <div className="relative flex items-center w-full h-6 cursor-pointer touch-none select-none">
              {/* Background Track */}
              <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden relative">
                {/* Active Progress Fill */}
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>

              {/* Draggable White Circle Thumb Dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-black/60 pointer-events-none transition-transform"
                style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />

              {/* Invisible Full-Hitbox Range Slider Input */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={activeTime}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                onChange={(e) => setDragTime(Number(e.target.value))}
                onMouseUp={(e) => {
                  setIsDragging(false);
                  seek(Number((e.target as HTMLInputElement).value));
                }}
                onTouchEnd={() => {
                  setIsDragging(false);
                  seek(dragTime);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>

            <div className="flex justify-between text-[11.5px] font-semibold text-[#b3b3b3]">
              <span>{formatTime(activeTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>


          {/* Main Playback Buttons Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 relative transition-all active:scale-90 ${
                shuffleMode ? "text-[#1ed760]" : "text-white/70 hover:text-white"
              }`}
              title="Shuffle mode"
            >
              <MdShuffle size={24} />
              {shuffleMode && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />
              )}
            </button>

            {/* Previous */}
            <button
              onClick={previous}
              className="p-2 text-white/90 hover:text-white active:scale-90 transition-transform"
              title="Previous song"
            >
              <MdSkipPrevious size={36} />
            </button>

            {/* Big Center Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 hover:scale-105 transition-all"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <MdPause size={34} />
              ) : (
                <MdPlayArrow size={36} className="ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="p-2 text-white/90 hover:text-white active:scale-90 transition-transform"
              title="Next song"
            >
              <MdSkipNext size={36} />
            </button>

            {/* Repeat / Sleep Timer */}
            <button
              onClick={cycleRepeat}
              className={`p-2 relative transition-all active:scale-90 ${
                repeatMode !== "off" ? "text-[#1ed760]" : "text-white/70 hover:text-white"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? <MdRepeatOne size={24} /> : <MdRepeat size={24} />}
              {repeatMode !== "off" && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full" />
              )}
            </button>
          </div>

          {/* Bottom Secondary Actions (Devices, Share, Queue) */}
          <div className="flex items-center justify-between pt-2 px-1 text-white/70">
            <button
              onClick={() => addToast("Playing on This Phone / Web Browser", "info")}
              className="p-1.5 hover:text-white transition-colors"
              title="Devices"
            >
              <MdDevices size={20} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                    addToast("Track link copied to clipboard!", "success");
                  }
                }}
                className="p-1.5 hover:text-white transition-colors"
                title="Share track"
              >
                <MdShare size={20} />
              </button>

              <button
                onClick={toggleLyrics}
                className="p-1.5 hover:text-white transition-colors"
                title="View Lyrics / Queue"
              >
                <MdQueueMusic size={22} />
              </button>
            </div>
          </div>

          {/* ── Bottom Lyrics Preview Drawer ── */}
          <div
            onClick={toggleLyrics}
            className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md cursor-pointer transition-all active:scale-[0.99] group shadow-xl"
          >
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-white/80 mb-1">
              <span>Lyrics preview</span>
              <span className="text-[11px] font-bold text-[#1ed760] group-hover:underline">
                Open Full Lyrics
              </span>
            </div>
            <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">
              &quot;{currentTrack.title}&quot; by {currentTrack.artist}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
