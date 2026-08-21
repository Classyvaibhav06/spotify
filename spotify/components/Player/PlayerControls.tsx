"use client";

import { motion } from "framer-motion";
import {
  BsFillPlayFill, BsFillPauseFill,
  BsSkipStartFill, BsSkipEndFill,
  BsShuffle, BsRepeat, BsRepeat1,
} from "react-icons/bs";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function PlayerControls() {
  const { isPlaying, isShuffle, repeatMode, togglePlay, next, prev, toggleShuffle, cycleRepeat } =
    usePlayerStore();

  const iconStyle = (active = false): React.CSSProperties => ({
    color:      active ? "var(--color-green)" : "var(--text-secondary)",
    background: "none",
    border:     "none",
    cursor:     "pointer",
    lineHeight: 0,
    position:   "relative",
    transition: "color 0.15s ease",
  });

  return (
    <div className="flex items-center gap-5">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        style={iconStyle(isShuffle)}
        title="Shuffle"
        onMouseEnter={e => { if (!isShuffle) e.currentTarget.style.color = "var(--text-base)"; }}
        onMouseLeave={e => { if (!isShuffle) e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        <BsShuffle size={16} />
        {isShuffle && (
          <span
            className="absolute"
            style={{ bottom: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--color-green)" }}
          />
        )}
      </button>

      {/* Previous */}
      <button
        onClick={prev}
        style={iconStyle()}
        title="Previous"
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <BsSkipStartFill size={22} />
      </button>

      {/* Play / Pause — white circle, black icon, 32px */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play"}
        className="flex items-center justify-center"
        style={{
          width:        32,
          height:       32,
          borderRadius: "50%",
          background:   "var(--text-base)",
          border:       "none",
          cursor:       "pointer",
          transition:   "transform 0.15s ease",
          flexShrink:   0,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isPlaying
          ? <BsFillPauseFill size={17} style={{ color: "#000" }} />
          : <BsFillPlayFill  size={17} style={{ color: "#000", marginLeft: 2 }} />
        }
      </motion.button>

      {/* Next */}
      <button
        onClick={next}
        style={iconStyle()}
        title="Next"
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <BsSkipEndFill size={22} />
      </button>

      {/* Repeat */}
      <button
        onClick={cycleRepeat}
        style={iconStyle(repeatMode !== "off")}
        title="Repeat"
        onMouseEnter={e => { if (repeatMode === "off") e.currentTarget.style.color = "var(--text-base)"; }}
        onMouseLeave={e => { if (repeatMode === "off") e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        {repeatMode === "one" ? <BsRepeat1 size={16} /> : <BsRepeat size={16} />}
        {repeatMode !== "off" && (
          <span
            className="absolute"
            style={{ bottom: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--color-green)" }}
          />
        )}
      </button>
    </div>
  );
}
