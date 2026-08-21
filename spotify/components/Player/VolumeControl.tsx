"use client";

import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { MdVolumeDown } from "react-icons/md";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function VolumeControl() {
  const { volume, setVolume } = usePlayerStore();

  function Icon() {
    if (volume === 0) return <HiVolumeOff size={18} />;
    if (volume < 50)  return <MdVolumeDown size={18} />;
    return <HiVolumeUp size={18} />;
  }

  return (
    <div className="flex items-center gap-2 group/vol">
      {/* Icon — toggles mute */}
      <button
        onClick={() => setVolume(volume === 0 ? 70 : 0)}
        title={volume === 0 ? "Unmute" : "Mute"}
        style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", lineHeight: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <Icon />
      </button>

      {/* Slider */}
      <div
        className="relative flex-shrink-0 group/slider"
        style={{ width: 93, height: 4 }}
      >
        {/* Track */}
        <div className="absolute inset-0 rounded-full" style={{ background: "#535353" }} />
        {/* Fill — white, green on hover */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-colors duration-150 group-hover/slider:bg-[#1ed760]"
          style={{ width: `${volume}%`, background: "var(--text-base)" }}
        />
        {/* Invisible range */}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "100%" }}
        />
        {/* Thumb dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{ width: 12, height: 12, background: "var(--text-base)", left: `calc(${volume}% - 6px)` }}
        />
      </div>
    </div>
  );
}
