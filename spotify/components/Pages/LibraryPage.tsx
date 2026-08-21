"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MdFavorite } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { mockPlaylists } from "@/lib/mockData";
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

const filterTabs = ["Playlists", "Albums", "Artists"] as const;
type Filter = (typeof filterTabs)[number];

export default function LibraryPage() {
  const play = usePlayerStore(s => s.play);
  const [active, setActive] = useState<Filter>("Playlists");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="px-6 py-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="type-section-title" style={{ color: "var(--text-base)" }}>Your Library</h1>

        {/* Filter pills */}
        <div className="flex gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="type-small-bold transition-colors duration-150"
              style={{
                background:   active === tab ? "var(--text-base)" : "var(--bg-elevated)",
                color:        active === tab ? "var(--bg-base)"   : "var(--text-base)",
                padding:      "6px 14px",
                borderRadius: 9999,
                border:       "none",
                cursor:       "pointer",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={e => {
                if (active !== tab) e.currentTarget.style.background = "var(--bg-card)";
              }}
              onMouseLeave={e => {
                if (active !== tab) e.currentTarget.style.background = "var(--bg-elevated)";
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liked Songs — special gradient card ─────────────────── */}
      <div
        className="flex items-center gap-4 px-4 py-3 mb-1 cursor-pointer transition-colors duration-150 group"
        style={{ borderRadius: 6 }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"; setHoveredId("liked"); }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; setHoveredId(null); }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width:      48,
            height:     48,
            borderRadius: 4,
            background: "linear-gradient(135deg, #4b00e0 0%, #cbcbcb 100%)",
            boxShadow:  "var(--shadow-medium)",
          }}
        >
          <MdFavorite size={22} style={{ color: "#fff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="type-body-bold truncate" style={{ color: "var(--text-base)" }}>Liked Songs</p>
          <p className="type-small" style={{ color: "var(--text-secondary)" }}>Playlist · 432 songs</p>
        </div>
        <motion.button
          animate={{ opacity: hoveredId === "liked" ? 1 : 0, scale: hoveredId === "liked" ? 1 : 0.8 }}
          onClick={e => e.stopPropagation()}
          className="btn-circle-play flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <BsFillPlayFill size={17} style={{ color: "#000", marginLeft: 2 }} />
        </motion.button>
      </div>

      {/* ── Playlist list ──────────────────────────────────────── */}
      {mockPlaylists.map((pl, i) => (
        <motion.div
          key={pl.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.035 }}
          onClick={() => play(pl.tracks[0], pl.tracks)}
          className="flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-150"
          style={{ borderRadius: 6 }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"; setHoveredId(pl.id); }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; setHoveredId(null); }}
        >
          <div className="flex-shrink-0 overflow-hidden" style={{ width: 48, height: 48, borderRadius: 4, boxShadow: "var(--shadow-medium)" }}>
            <img src={makeCover(i)} alt={pl.name} className="w-full h-full object-cover" draggable={false} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="type-body-bold truncate" style={{ color: "var(--text-base)" }}>{pl.name}</p>
            <p className="type-small" style={{ color: "var(--text-secondary)" }}>
              Playlist · {pl.tracks.length} songs
            </p>
          </div>
          <motion.button
            animate={{ opacity: hoveredId === pl.id ? 1 : 0, scale: hoveredId === pl.id ? 1 : 0.8 }}
            onClick={e => { e.stopPropagation(); play(pl.tracks[0], pl.tracks); }}
            className="btn-circle-play flex-shrink-0"
            style={{ width: 40, height: 40 }}
          >
            <BsFillPlayFill size={17} style={{ color: "#000", marginLeft: 2 }} />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
