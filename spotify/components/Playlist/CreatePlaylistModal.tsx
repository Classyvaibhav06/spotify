"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdQueueMusic } from "react-icons/md";
import { useUIStore } from "@/store/useUIStore";
import { useLibraryStore } from "@/store/libraryStore";

export default function CreatePlaylistModal() {
  const { createPlaylistModalOpen, setCreatePlaylistModalOpen, addToast } = useUIStore();
  const { createPlaylist } = useLibraryStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createPlaylist(name.trim(), description.trim());
    addToast(`Created playlist "${name.trim()}"`, "success");
    setName("");
    setDescription("");
    setCreatePlaylistModalOpen(false);
  }

  return (
    <AnimatePresence>
      {createPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setCreatePlaylistModalOpen(false)}
            className="fixed inset-0 bg-black"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl z-10 text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a] mb-5">
              <div className="flex items-center gap-3">
                <MdQueueMusic size={24} className="text-[#1ed760]" />
                <h2 className="text-xl font-bold">Create Playlist</h2>
              </div>
              <button
                onClick={() => setCreatePlaylistModalOpen(false)}
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#252525]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="My Awesome Playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-white rounded-lg p-3 text-sm text-white outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Add an optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-white rounded-lg p-3 text-sm text-white outline-none resize-none h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreatePlaylistModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#b3b3b3] hover:text-white hover:bg-[#252525] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#1ed760] text-black hover:scale-105 disabled:opacity-50 transition-transform shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
