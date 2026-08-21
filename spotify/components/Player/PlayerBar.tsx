"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MdFavorite, MdFavoriteBorder, MdPictureInPicture, MdLyrics, MdQueue, MdFullscreen } from "react-icons/md";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import { usePlayerStore } from "@/store/usePlayerStore";

function makeCover(index: number) {
  const palette = [
    ["#1ed760","#0d7a36"], ["#e91429","#8b0a18"], ["#4b00e0","#1a0060"],
    ["#ff6d00","#BF360C"], ["#8400e7","#4a0080"], ["#00bcd4","#006064"],
    ["#f50057","#880E4F"], ["#76ff03","#33691E"], ["#ffab00","#FF6F00"],
    ["#00e5ff","#006064"], ["#d500f9","#4A148C"], ["#ff1744","#B71C1C"],
  ];
  const [c1, c2] = palette[index % palette.length];
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='${encodeURIComponent(c1)}'/><stop offset='100%25' stop-color='${encodeURIComponent(c2)}'/></linearGradient></defs><rect width='300' height='300' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='110' fill='rgba(0,0,0,0.2)'>♪</text></svg>`;
}

const iconBtn: React.CSSProperties = {
  color:      "var(--text-secondary)",
  background: "none",
  border:     "none",
  cursor:     "pointer",
  lineHeight: 0,
  transition: "color 0.15s ease",
};

export default function PlayerBar() {
  const { currentTrack, isLiked, toggleLike } = usePlayerStore();
  const [likeAnim, setLikeAnim] = useState(false);

  function handleLike() {
    setLikeAnim(true);
    toggleLike();
    setTimeout(() => setLikeAnim(false), 300);
  }

  if (!currentTrack) return null;

  const coverIdx = (parseInt(currentTrack.id, 10) - 1 + 12) % 12;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 gap-4"
      style={{
        height:     90,
        background: "var(--bg-surface)",
        borderTop:  "1px solid #2a2a2a",
      }}
    >
      {/* ── LEFT — track info ──────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ width: "30%" }}>
        {/* Album art 56×56 */}
        <div
          className="overflow-hidden flex-shrink-0"
          style={{ width: 56, height: 56, borderRadius: 4, boxShadow: "var(--shadow-medium)" }}
        >
          <img
            src={makeCover(coverIdx)}
            alt={currentTrack.album}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Track title + artist */}
        <div className="min-w-0">
          <p
            className="type-caption truncate cursor-pointer hover:underline"
            style={{ color: "var(--text-base)", fontWeight: 700 }}
          >
            {currentTrack.title}
          </p>
          <p
            className="type-small truncate cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-base)"; e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.textDecoration = "none"; }}
          >
            {currentTrack.artist}
          </p>
        </div>

        {/* Like + PiP buttons */}
        <div className="flex items-center gap-2 ml-1 flex-shrink-0">
          <motion.button
            animate={likeAnim ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={handleLike}
            title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            style={{ ...iconBtn, color: isLiked ? "var(--color-green)" : "var(--text-secondary)" }}
            onMouseEnter={e => { if (!isLiked) e.currentTarget.style.color = "var(--text-base)"; }}
            onMouseLeave={e => { if (!isLiked) e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {isLiked ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
          </motion.button>
          <button
            style={iconBtn}
            title="Picture in Picture"
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <MdPictureInPicture size={16} />
          </button>
        </div>
      </div>

      {/* ── CENTER — controls + progress ──────────────── */}
      <div
        className="flex flex-col items-center gap-2 flex-1 min-w-0 mx-auto"
        style={{ maxWidth: 722 }}
      >
        <PlayerControls />
        <ProgressBar className="w-full" />
      </div>

      {/* ── RIGHT — extra controls ─────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0 justify-end" style={{ width: "30%" }}>
        <button
          style={iconBtn}
          title="Lyrics"
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <MdLyrics size={18} />
        </button>
        <button
          style={iconBtn}
          title="Queue"
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <MdQueue size={18} />
        </button>
        <VolumeControl />
        <button
          style={iconBtn}
          title="Full Screen"
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <MdFullscreen size={20} />
        </button>
      </div>
    </div>
  );
}
