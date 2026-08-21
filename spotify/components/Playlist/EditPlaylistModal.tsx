"use client";

import { useUIStore } from "@/store/useUIStore";
import { useLibraryStore } from "@/store/libraryStore";
import { useState, useEffect } from "react";
import { MdClose, MdImage } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function EditPlaylistModal() {
  const { editPlaylistOpen, setEditPlaylistOpen, activePlaylistId, addToast } = useUIStore();
  const { playlists, updatePlaylist } = useLibraryStore();

  const currentPlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    if (currentPlaylist) {
      setTitle(currentPlaylist.name || "");
      setDescription(currentPlaylist.description || "");
      setCoverUrl(currentPlaylist.coverUrl || "");
    }
  }, [currentPlaylist, editPlaylistOpen]);

  if (!editPlaylistOpen || !currentPlaylist) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updatePlaylist(currentPlaylist.id, {
      name: title,
      description,
      coverUrl,
    });

    addToast("Playlist updated successfully!", "success");
    setEditPlaylistOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#282828] text-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Edit Playlist Details</h2>
            <button onClick={() => setEditPlaylistOpen(false)} className="text-gray-400 hover:text-white">
              <MdClose size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Cover Image Upload Preview */}
              <div className="w-36 h-36 rounded-xl bg-[#1e1e1e] flex flex-col items-center justify-center border border-dashed border-gray-600 relative overflow-hidden flex-shrink-0 group">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <MdImage size={36} />
                    <span className="text-xs font-semibold mt-1">Choose Photo</span>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Paste Image URL..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-white p-1 outline-none text-center opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Title & Description Fields */}
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Playlist Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#333333] text-white rounded-lg p-3 outline-none border border-gray-600 focus:border-green-500 text-sm font-semibold"
                  required
                />
                <textarea
                  placeholder="Add an optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#333333] text-white rounded-lg p-3 outline-none border border-gray-600 focus:border-green-500 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setEditPlaylistOpen(false)}
                className="px-6 py-2 rounded-full text-xs font-bold text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full text-xs font-bold bg-green-500 hover:bg-green-400 text-black shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
