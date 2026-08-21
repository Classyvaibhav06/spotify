"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BsFillPlayFill } from "react-icons/bs";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Playlist } from "@/lib/mockData";

function makeCover(id: string, index: number) {
  const palette = [
    ["#1ed760","#0d7a36"], ["#e91429","#8b0a18"], ["#4b00e0","#1a0060"],
    ["#ff6d00","#BF360C"], ["#8400e7","#4a0080"], ["#00bcd4","#006064"],
    ["#f50057","#880E4F"], ["#76ff03","#33691E"], ["#ffab00","#FF6F00"],
    ["#00e5ff","#006064"], ["#d500f9","#4A148C"], ["#ff1744","#B71C1C"],
  ];
  const [c1, c2] = palette[index % palette.length];
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='${encodeURIComponent(c1)}'/><stop offset='100%25' stop-color='${encodeURIComponent(c2)}'/></linearGradient></defs><rect width='300' height='300' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='110' fill='rgba(0,0,0,0.25)'>♪</text></svg>`;
}

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  variant?: "small" | "large";
}

export default function PlaylistCard({ playlist, index, variant = "large" }: PlaylistCardProps) {
  const play = usePlayerStore(s => s.play);
  const [hovered, setHovered] = useState(false);

  // ── Compact / recently-played horizontal card ───────────
  if (variant === "small") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.035 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => play(playlist.tracks[0], playlist.tracks)}
        className="flex items-center gap-3 overflow-hidden cursor-pointer transition-colors duration-200 pr-3 relative"
        style={{
          background:   hovered ? "var(--bg-elevated)" : "var(--bg-card)",
          borderRadius: 6,
          minHeight:    56,
        }}
      >
        <img
          src={makeCover(playlist.id, index)}
          alt={playlist.name}
          className="flex-shrink-0 object-cover"
          style={{ width: 56, height: 56 }}
          draggable={false}
        />
        <span
          className="type-body-bold truncate flex-1"
          style={{ color: "var(--text-base)" }}
        >
          {playlist.name}
        </span>
        {/* Circular play – appears on hover */}
        <motion.button
          animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="btn-circle-play flex-shrink-0"
          style={{ width: 36, height: 36 }}
          onClick={e => { e.stopPropagation(); play(playlist.tracks[0], playlist.tracks); }}
        >
          <BsFillPlayFill size={16} style={{ color: "#000", marginLeft: 2 }} />
        </motion.button>
      </motion.div>
    );
  }

  // ── Full vertical card ───────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => play(playlist.tracks[0], playlist.tracks)}
      className="relative p-4 flex-shrink-0 cursor-pointer"
      style={{
        width:        180,
        borderRadius: 6,
        background:   hovered ? "var(--bg-elevated)" : "var(--bg-surface)",
        boxShadow:    hovered ? "var(--shadow-medium)" : "none",
        transform:    hovered ? "translateY(-4px)" : "translateY(0)",
        transition:   "background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Cover */}
      <div className="relative mb-4 overflow-hidden" style={{ borderRadius: 4, aspectRatio: "1/1" }}>
        <img
          src={makeCover(playlist.id, index)}
          alt={playlist.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Green circular play button */}
        <motion.button
          animate={hovered
            ? { opacity: 1, scale: 1,    y: 0 }
            : { opacity: 0, scale: 0.86, y: 6 }
          }
          transition={{ duration: 0.18 }}
          className="btn-circle-play absolute"
          style={{ bottom: 8, right: 8, width: 40, height: 40, boxShadow: "var(--shadow-heavy)" }}
          onClick={e => { e.stopPropagation(); play(playlist.tracks[0], playlist.tracks); }}
        >
          <BsFillPlayFill size={18} style={{ color: "#000", marginLeft: 2 }} />
        </motion.button>
      </div>

      {/* Title — body-bold 16px/700 */}
      <p className="type-body-bold truncate mb-1" style={{ color: "var(--text-base)" }}>
        {playlist.name}
      </p>
      {/* Description — caption 14px/400 silver, max 2 lines */}
      <p className="type-caption truncate-2" style={{ color: "var(--text-secondary)" }}>
        {playlist.description}
      </p>
    </motion.div>
  );
}
