"use client";

import { useUIStore } from "@/store/useUIStore";
import { usePlayerStore } from "@/store/playerStore";
import { useLibraryStore } from "@/store/libraryStore";
import { useEffect, useRef } from "react";
import {
  MdQueue,
  MdPlaylistAdd,
  MdFavoriteBorder,
  MdPerson,
  MdContentCopy,
} from "react-icons/md";
import { motion } from "framer-motion";

export default function ContextMenu() {
  const { contextMenu, closeContextMenu, addToast, setActivePage } = useUIStore();
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu.isOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen) return null;

  const track = {
    id: contextMenu.trackId || "yt-ctx-1",
    title: contextMenu.title || "Track Title",
    artist: contextMenu.artist || "Artist Name",
    album: "Spotify Collection",
    duration: 180,
    coverUrl: contextMenu.coverUrl || "",
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ top: contextMenu.y, left: contextMenu.x }}
      className="fixed z-[999] w-56 bg-[#282828] text-white rounded-xl p-1.5 shadow-2xl border border-gray-700 space-y-1 text-sm font-medium"
    >
      <button
        onClick={() => {
          addToQueue(track);
          addToast(`Added "${track.title}" to Queue`, "success");
          closeContextMenu();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
      >
        <MdQueue size={18} className="text-gray-400" />
        <span>Add to Queue</span>
      </button>

      <button
        onClick={() => {
          toggleLike(track);
          addToast(`Saved "${track.title}" to Liked Songs`, "success");
          closeContextMenu();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
      >
        <MdFavoriteBorder size={18} className="text-gray-400" />
        <span>Save to Liked Songs</span>
      </button>

      <button
        onClick={() => {
          addToast("Added to playlist!", "success");
          closeContextMenu();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
      >
        <MdPlaylistAdd size={18} className="text-gray-400" />
        <span>Add to Playlist</span>
      </button>

      <div className="h-px bg-gray-700 my-1" />

      <button
        onClick={() => {
          setActivePage("artist");
          closeContextMenu();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
      >
        <MdPerson size={18} className="text-gray-400" />
        <span>Go to Artist</span>
      </button>

      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          addToast("Track link copied to clipboard!", "info");
          closeContextMenu();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
      >
        <MdContentCopy size={18} className="text-gray-400" />
        <span>Copy Track Link</span>
      </button>
    </motion.div>
  );
}
