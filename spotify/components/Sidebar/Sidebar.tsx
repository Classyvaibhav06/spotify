"use client";

import { motion } from "framer-motion";
import { HiHome, HiSearch } from "react-icons/hi";
import { MdLibraryMusic, MdAdd, MdFavorite } from "react-icons/md";
import SidebarItem from "./SidebarItem";
import PlaylistItem from "./PlaylistItem";
import { useUIStore } from "@/store/useUIStore";
import { userPlaylists } from "@/lib/mockData";

export default function Sidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{ background: "var(--bg-base)", height: "100%" }}
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-6 pt-6 pb-5 flex-shrink-0"
        style={{ minHeight: 72 }}
      >
        {/* Spotify wordmark SVG */}
        <svg
          viewBox="0 0 1134 340"
          className="flex-shrink-0"
          style={{ width: sidebarCollapsed ? 28 : 120, height: "auto" }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Spotify"
        >
          <path
            d="M8 171c0 92 76 168 168 168s168-76 168-168S268 4 176 4 8 79 8 171zm230 78c-39-24-89-30-147-17-14 2-16-18-4-20 63-13 116-7 160 19 11 7 0 24-9 18zm17-45c-45-28-114-36-167-20-17 5-23-21-7-25 61-18 136-9 188 23 14 9 0 31-14 22zM80 133c-17 6-28-23-9-30 59-18 159-15 221 22 17 9 1 37-16 27C226 119 133 113 80 133z"
            fill="var(--color-green)"
          />
          {!sidebarCollapsed && (
            <>
              <path
                d="M364 204v-85h-4l-31 48-31-48h-4v85h19v-55l16 25h1l16-24v54h18zm84-37c0-14-9-21-22-25l-10-4c-7-2-10-5-10-9 0-5 5-8 12-8 7 0 13 3 18 9l12-11c-7-9-16-14-30-14-18 0-30 11-30 25 0 13 8 20 22 25l10 3c8 3 11 6 11 10 0 5-5 9-13 9-9 0-16-4-21-10l-13 11c8 11 18 16 34 16 19 0 32-10 32-27zm48-48h-19v85h19v-85zm62 0h-4l-43 85h21l8-16h32l8 16h21l-43-85zm-14 55 11-22 10 22h-21zm68-55h-20v85h55v-17h-35v-68zm64 0h-20v85h55v-17h-35v-68zm96 43c0 16-8 28-24 28-16 0-24-12-24-28v-43h-19v43c0 28 16 44 43 44s43-16 43-44v-43h-19v43zm60-43h-19v85h54v-17h-35v-68zm64 0h-4l-43 85h21l8-16h32l8 16h21l-43-85zm-14 55 11-22 10 22h-21z"
                fill="var(--text-base)"
              />
            </>
          )}
        </svg>
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="px-2 mb-4 flex-shrink-0">
        <SidebarItem icon={<HiHome size={22} />}        label="Home"         page="home"    collapsed={sidebarCollapsed} />
        <SidebarItem icon={<HiSearch size={22} />}      label="Search"       page="search"  collapsed={sidebarCollapsed} />
        <SidebarItem icon={<MdLibraryMusic size={22} />} label="Your Library" page="library" collapsed={sidebarCollapsed} />
      </nav>

      {/* ── Library actions ────────────────────────────── */}
      {!sidebarCollapsed && (
        <div className="px-3 mb-2 flex flex-col gap-1 flex-shrink-0">
          {/* Create Playlist */}
          <button
            className="flex items-center gap-3 w-full rounded-spx-section px-3 py-2 transition-colors duration-200 group"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <span
              className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors duration-200"
              style={{ background: "var(--text-secondary)" }}
            >
              <MdAdd size={18} style={{ color: "var(--bg-base)" }} />
            </span>
            <span className="type-nav-bold">Create Playlist</span>
          </button>

          {/* Liked Songs */}
          <button
            className="flex items-center gap-3 w-full rounded-spx-section px-3 py-2 transition-colors duration-200"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <span className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4b00e0 0%, #c0c0c0 100%)" }}
            >
              <MdFavorite size={14} style={{ color: "#fff" }} />
            </span>
            <span className="type-nav-bold">Liked Songs</span>
          </button>

          {/* Separator */}
          <div className="h-px mx-2 mt-1" style={{ background: "#2a2a2a" }} />
        </div>
      )}

      {/* ── Playlist list ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 min-h-0">
        {userPlaylists.map((pl) => (
          <PlaylistItem key={pl.id} name={pl.name} tracks={pl.tracks} collapsed={sidebarCollapsed} />
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      {!sidebarCollapsed && (
        <div
          className="px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid #2a2a2a" }}
        >
          <button
            className="type-small block mb-1 transition-colors duration-150"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Install App
          </button>
          <p className="type-small" style={{ color: "var(--text-secondary)" }}>
            {userPlaylists.length} playlists
          </p>
        </div>
      )}
    </motion.aside>
  );
}
