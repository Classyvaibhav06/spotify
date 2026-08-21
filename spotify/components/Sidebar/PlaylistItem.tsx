"use client";

import { MdMusicNote } from "react-icons/md";

interface PlaylistItemProps {
  name: string;
  tracks: number;
  collapsed: boolean;
}

export default function PlaylistItem({ name, tracks, collapsed }: PlaylistItemProps) {
  return (
    <button
      className="flex items-center gap-3 w-full px-3 py-2 rounded-spx-card text-left transition-colors duration-200"
      style={{
        color: "var(--text-secondary)",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      title={collapsed ? name : undefined}
      onMouseEnter={e => {
        e.currentTarget.style.color = "var(--text-base)";
        e.currentTarget.style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <MdMusicNote size={collapsed ? 18 : 16} className="flex-shrink-0" />
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="type-caption truncate" style={{ color: "inherit", fontWeight: 400 }}>{name}</p>
          <p className="type-small" style={{ color: "var(--text-secondary)" }}>Playlist · {tracks}</p>
        </div>
      )}
    </button>
  );
}
