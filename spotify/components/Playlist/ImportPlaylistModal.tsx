"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdLink,
  MdDownload,
  MdCheckCircle,
  MdErrorOutline,
  MdMusicNote,
  MdPlayArrow,
} from "react-icons/md";
import { FaSpotify, FaYoutube } from "react-icons/fa6";
import { useUIStore } from "@/store/useUIStore";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlayerStore, Track } from "@/store/playerStore";

interface ImportedData {
  provider: "spotify" | "youtube";
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  totalTracks: number;
}

export default function ImportPlaylistModal() {
  const { importPlaylistModalOpen, setImportPlaylistModalOpen, addToast, setActivePage } =
    useUIStore();
  const { importPlaylist } = useLibraryStore();
  const { play } = usePlayerStore();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImportedData | null>(null);

  // Detect Provider on typing
  const isSpotify = url.includes("spotify.com") || url.includes("spotify.link");
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  async function handleFetch() {
    if (!url.trim()) return;
    setError(null);
    setLoading(true);
    setPreviewData(null);

    try {
      const res = await fetch("/api/playlist/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load playlist.");
      }

      setPreviewData(data);
    } catch (err: any) {
      setError(err?.message || "An error occurred while importing the playlist.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave(autoPlay = false) {
    if (!previewData) return;

    const newId = importPlaylist({
      name: previewData.name,
      description: previewData.description,
      coverUrl: previewData.coverUrl,
      tracks: previewData.tracks,
    });

    addToast(`Successfully imported "${previewData.name}"!`, "success");

    if (autoPlay && previewData.tracks.length > 0) {
      play(previewData.tracks[0], previewData.tracks);
    }

    // Reset & Close
    setUrl("");
    setPreviewData(null);
    setError(null);
    setImportPlaylistModalOpen(false);
    setActivePage("playlist", newId);
  }

  function handleClose() {
    setUrl("");
    setPreviewData(null);
    setError(null);
    setImportPlaylistModalOpen(false);
  }

  return (
    <AnimatePresence>
      {importPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-[#181818] border border-[#2a2a2a] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 text-white flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#2a2a2a] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760]">
                  <MdDownload size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">Import Playlist</h2>
                  <p className="text-xs text-[#a7a7a7]">Paste any Spotify or YouTube playlist link</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#252525] transition-colors"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Input & Form */}
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
                Playlist URL
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#b3b3b3] flex items-center gap-1.5">
                  {isSpotify ? (
                    <FaSpotify className="text-[#1ed760] text-lg" />
                  ) : isYouTube ? (
                    <FaYoutube className="text-[#ff0000] text-lg" />
                  ) : (
                    <MdLink size={20} />
                  )}
                </div>

                <input
                  type="url"
                  placeholder="https://open.spotify.com/playlist/... or https://youtube.com/playlist?list=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim() && !loading) {
                      e.preventDefault();
                      handleFetch();
                    }
                  }}
                  className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-[#1ed760] rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={handleFetch}
                  disabled={!url.trim() || loading}
                  className="absolute right-1.5 px-4 py-2 bg-[#1ed760] text-black text-xs font-bold rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md flex items-center gap-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </button>
              </div>

              {/* Supported Badges */}
              <div className="flex items-center gap-2 text-[11px] text-[#888] pt-0.5">
                <span>Supports:</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#222] border border-[#333] text-[#1ed760]">
                  <FaSpotify size={12} /> Spotify
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#222] border border-[#333] text-[#ff4444]">
                  <FaYoutube size={12} /> YouTube Music
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2"
              >
                <MdErrorOutline size={18} className="flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="mt-4 flex flex-col items-center justify-center p-8 bg-[#121212] rounded-xl border border-[#222] gap-3 text-center">
                <div className="w-10 h-10 border-3 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-white">Extracting Playlist & Stream Tracks...</p>
                <p className="text-xs text-[#888]">Fetching metadata and resolving high-res audio IDs</p>
              </div>
            )}

            {/* Preview Card */}
            {previewData && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-col gap-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-3 bg-[#1f1f1f] rounded-xl border border-[#2d2d2d]">
                  <img
                    src={previewData.coverUrl}
                    alt={previewData.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      {previewData.provider === "spotify" ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1ed760]/20 text-[#1ed760] flex items-center gap-1">
                          <FaSpotify size={10} /> Spotify
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-400 flex items-center gap-1">
                          <FaYoutube size={10} /> YouTube
                        </span>
                      )}
                      <span className="text-xs text-[#888]">
                        {previewData.tracks.length} songs ready
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white truncate">{previewData.name}</h3>
                    <p className="text-xs text-[#a7a7a7] truncate">{previewData.description}</p>
                  </div>
                </div>

                {/* Tracklist Preview */}
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto hide-scrollbar bg-[#121212] p-2 rounded-xl border border-[#222]">
                  {previewData.tracks.map((track, i) => (
                    <div
                      key={track.id || i}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1a1a] text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <span className="text-[#666] w-4 text-center font-mono">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{track.title}</p>
                          <p className="text-[11px] text-[#888] truncate">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#666]">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Save Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-full text-xs font-bold text-[#b3b3b3] hover:text-white hover:bg-[#252525] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#282828] hover:bg-[#333] text-white border border-[#444] transition-colors"
                  >
                    Import to Library
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-[#1ed760] text-black hover:scale-105 active:scale-95 transition-transform shadow-lg flex items-center gap-1.5"
                  >
                    <MdPlayArrow size={16} /> Import & Play
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
