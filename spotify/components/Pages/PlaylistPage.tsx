"use client";

import { useState } from "react";
import {
  MdPlayArrow,
  MdPause,
  MdDelete,
  MdShare,
  MdMusicNote,
  MdAdd,
  MdSearch,
  MdMoreHoriz,
} from "react-icons/md";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { searchYouTubeTracks } from "@/lib/youtube";
import { motion } from "framer-motion";

interface PlaylistPageProps {
  playlistId?: string;
}

export default function PlaylistPage({ playlistId = "pl-liked" }: PlaylistPageProps) {
  const { playlists, deletePlaylist, renamePlaylist, removeFromPlaylist, addToPlaylist, likedSongs } =
    useLibraryStore();
  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { addToast, setEditPlaylistOpen, openContextMenu } = useUIStore();

  const playlist = playlists.find((p) => p.id === playlistId) || {
    id: "pl-liked",
    name: "Liked Songs",
    description: "Your saved tracks",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #450af5, #c4efd9)",
    tracks: likedSongs,
  };

  // If playlistId is pl-liked, ensure tracks are always the latest likedSongs
  const displayTracks = playlist.id === "pl-liked" ? likedSongs : playlist.tracks;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(playlist.name);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isCurrentPlaylist =
    currentTrack && displayTracks.some((t) => t.id === currentTrack.id);

  function handleTitleSubmit() {
    if (titleInput.trim() && playlist.id !== "pl-liked") {
      renamePlaylist(playlist.id, titleInput.trim());
      addToast("Playlist renamed", "success");
    }
    setIsEditingTitle(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const { tracks } = await searchYouTubeTracks(searchQuery);
    setSearchResults(tracks);
    setIsSearching(false);
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Playlist link copied to clipboard!", "info");
    }
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      addToast(`Deleted playlist "${playlist.name}"`, "info");
    }
  }

  return (
    <div className="min-h-full pb-28 text-white">
      {/* ── Hero Header ── */}
      <div
        className="p-8 flex flex-col sm:flex-row items-end gap-6"
        style={{ background: playlist.gradient || "linear-gradient(135deg, #450af5, #121212)" }}
      >
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden bg-[#181818]">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : displayTracks.length > 0 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {displayTracks.slice(0, 4).map((t, idx) => (
                <div key={idx} className="w-full h-full bg-[#282828] overflow-hidden">
                  {t.coverUrl && <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          ) : (
            <MdMusicNote size={64} className="text-white/40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Playlist</p>
          {isEditingTitle && playlist.id !== "pl-liked" ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="text-4xl sm:text-6xl font-black bg-black/40 border-b border-white outline-none w-full my-2 text-white"
              autoFocus
            />
          ) : (
            <h1
              onDoubleClick={() => playlist.id !== "pl-liked" && setIsEditingTitle(true)}
              className="text-4xl sm:text-6xl font-black tracking-tight my-2 truncate cursor-pointer hover:opacity-90 drop-shadow-lg"
              title={playlist.id !== "pl-liked" ? "Double-click to rename" : ""}
            >
              {playlist.name}
            </h1>
          )}
          <p className="text-sm text-gray-300 mb-2">{playlist.description || "Your favorite collection"}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
            <span className="text-white">Vaibhav Ghoshi</span>
            <span>•</span>
            <span>{displayTracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* ── Action Controls ── */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => {
            if (displayTracks.length > 0) {
              if (isCurrentPlaylist && isPlaying) {
                togglePlay();
              } else {
                play(displayTracks[0], displayTracks);
              }
            }
          }}
          disabled={displayTracks.length === 0}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {isCurrentPlaylist && isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={32} className="ml-1" />}
        </button>

        <button
          onClick={handleShare}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          title="Share playlist"
        >
          <MdShare size={24} />
        </button>

        {playlist.id !== "pl-liked" && (
          <button
            onClick={() => setEditPlaylistOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 text-xs font-bold border border-gray-600 px-4"
          >
            Edit Playlist
          </button>
        )}

        {playlist.id !== "pl-liked" && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/10"
            title="Delete playlist"
          >
            <MdDelete size={24} />
          </button>
        )}
      </div>

      {/* ── Tracklist Table ── */}
      <div className="px-8 mb-12">
        {displayTracks.length > 0 ? (
          <div>
            <div className="grid grid-cols-[32px_1fr_120px_60px] gap-4 px-4 py-2 border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              <span>#</span>
              <span>Title</span>
              <span className="hidden sm:block">Album</span>
              <span className="text-right">Action</span>
            </div>

            <div className="flex flex-col gap-1">
              {displayTracks.map((track, idx) => {
                const isPlayingThis = currentTrack?.id === track.id && isPlaying;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => play(track, displayTracks)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        trackId: track.id,
                        title: track.title,
                        artist: track.artist,
                        coverUrl: track.coverUrl,
                      });
                    }}
                    className={`grid grid-cols-[32px_1fr_120px_60px] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer group transition-all ${
                      isPlayingThis ? "bg-[#282828]" : "hover:bg-[#282828]/70"
                    }`}
                  >
                    <span className={`text-sm font-bold text-gray-400 group-hover:hidden ${isPlayingThis ? "text-green-500" : ""}`}>
                      {idx + 1}
                    </span>
                    <button className="hidden group-hover:flex items-center justify-center text-white">
                      <MdPlayArrow size={18} />
                    </button>

                    <div className="flex items-center gap-3 min-w-0">
                      {track.coverUrl && (
                        <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover flex-shrink-0 shadow" />
                      )}
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate ${isPlayingThis ? "text-green-500" : "text-white"}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 truncate hidden sm:block">
                      {track.album || "Single"}
                    </div>

                    <div className="flex justify-end">
                      {playlist.id !== "pl-liked" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromPlaylist(playlist.id, track.id);
                            addToast("Removed from playlist", "info");
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MdDelete size={18} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl text-gray-400">
            <p className="text-lg font-bold text-white mb-1">No songs in this playlist yet</p>
            <p className="text-xs">Search for tracks below to add them to your playlist</p>
          </div>
        )}
      </div>

      {/* ── Find & Add Tracks Search Bar ── */}
      <div className="mx-8 bg-[#181818] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Find songs to add</h3>
        <form onSubmit={handleSearch} className="relative max-w-md mb-6">
          <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242424] border border-gray-700 focus:border-white rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none"
          />
        </form>

        {isSearching && <p className="text-xs text-gray-400 animate-pulse">Searching YouTube tracks...</p>}

        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {searchResults.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {t.coverUrl && <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 truncate">{t.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    addToPlaylist(playlist.id, t);
                    addToast(`Added "${t.title}" to ${playlist.name}`, "success");
                  }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 transition-transform"
                >
                  <MdAdd size={16} /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
