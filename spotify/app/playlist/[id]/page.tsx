"use client";

import { use } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdPlayArrow,
  MdPause,
  MdDelete,
  MdShare,
  MdMusicNote,
  MdAdd,
  MdSearch,
} from "react-icons/md";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { searchYouTubeTracks } from "@/lib/youtube";

export default function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const playlistId = resolvedParams.id;

  const { playlists, deletePlaylist, renamePlaylist, removeFromPlaylist, addToPlaylist } =
    useLibraryStore();
  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { addToast } = useUIStore();

  const playlist = playlists.find((p) => p.id === playlistId);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(playlist?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!playlist) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-[#1ed760] text-black font-bold rounded-full"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const isCurrentPlaylist =
    currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id);

  function handleTitleSubmit() {
    if (titleInput.trim()) {
      renamePlaylist(playlist!.id, titleInput.trim());
      addToast("Playlist renamed", "success");
    }
    setIsEditingTitle(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.tracks || []);
    setIsSearching(false);
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast("Playlist link copied to clipboard!", "info");
    }
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${playlist!.name}"?`)) {
      deletePlaylist(playlist!.id);
      addToast(`Deleted playlist "${playlist!.name}"`, "info");
      router.push("/");
    }
  }

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar bg-gradient-to-b from-[#2a2a2a] via-[#121212] to-[#121212] text-white p-6 pb-24">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-8 pt-4">
        {/* Cover collage */}
        <div
          className="w-48 h-48 rounded-xl shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: playlist.gradient || "linear-gradient(135deg, #4b00e0, #1a0060)" }}
        >
          {playlist.tracks.length > 0 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {playlist.tracks.slice(0, 4).map((t, idx) => (
                <div
                  key={idx}
                  className="w-full h-full flex items-center justify-center font-bold text-xs"
                  style={{
                    background:
                      t.bgGradient ||
                      `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #121212)`,
                  }}
                >
                  ♪
                </div>
              ))}
            </div>
          ) : (
            <MdMusicNote size={64} className="text-white/40" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b3b3b3]">Playlist</p>

          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="text-4xl md:text-6xl font-black bg-black/40 border-b border-white outline-none w-full my-2 text-white"
              autoFocus
            />
          ) : (
            <h1
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-4xl md:text-6xl font-black tracking-tight my-2 truncate cursor-pointer hover:opacity-90"
              title="Double-click to rename"
            >
              {playlist.name}
            </h1>
          )}

          <p className="text-sm text-[#b3b3b3] mb-2">{playlist.description || "Created by User"}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3]">
            <span className="text-white">Vaibhav Ghoshi</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            if (playlist.tracks.length > 0) {
              if (isCurrentPlaylist) {
                togglePlay();
              } else {
                play(playlist.tracks[0], playlist.tracks);
              }
            }
          }}
          disabled={playlist.tracks.length === 0}
          className="w-14 h-14 rounded-full bg-[#1ed760] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl disabled:opacity-50"
        >
          {isCurrentPlaylist && isPlaying ? <MdPause size={32} /> : <MdPlayArrow size={32} className="ml-1" />}
        </button>

        <button
          onClick={handleShare}
          className="p-3 text-[#b3b3b3] hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Share playlist"
        >
          <MdShare size={22} />
        </button>

        {playlist.id !== "pl-liked" && (
          <button
            onClick={handleDelete}
            className="p-3 text-[#b3b3b3] hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
            title="Delete playlist"
          >
            <MdDelete size={22} />
          </button>
        )}
      </div>

      {/* Track List Table */}
      {playlist.tracks.length > 0 ? (
        <div className="mb-12">
          <div className="grid grid-cols-[32px_1fr_auto] gap-4 px-4 py-2 text-xs font-bold text-[#b3b3b3] border-b border-[#2a2a2a] mb-2 uppercase">
            <span>#</span>
            <span>Title</span>
            <span>Action</span>
          </div>

          <div className="flex flex-col gap-1">
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => play(track, playlist.tracks)}
                className="grid grid-cols-[32px_1fr_auto] gap-4 items-center px-4 py-3 rounded-lg hover:bg-[#252525] group cursor-pointer transition-colors"
              >
                <span className="text-sm font-semibold text-[#b3b3b3] group-hover:text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{track.title}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(playlist.id, track.id);
                    addToast("Removed from playlist", "info");
                  }}
                  className="p-2 text-[#b3b3b3] hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from playlist"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-[#2a2a2a] rounded-2xl mb-12 text-[#b3b3b3]">
          <p className="text-lg font-bold text-white mb-1">Let&apos;s find something for your playlist</p>
          <p className="text-sm">Search for tracks below to add them to this playlist</p>
        </div>
      )}

      {/* Add Tracks Search Engine */}
      <div className="bg-[#181818] p-6 rounded-2xl border border-[#2a2a2a]">
        <h3 className="text-lg font-bold text-white mb-4">Find tracks to add</h3>
        <form onSubmit={handleSearch} className="relative max-w-md mb-6">
          <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3]" />
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-white rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none"
          />
        </form>

        {isSearching && <p className="text-sm text-[#b3b3b3] animate-pulse">Searching...</p>}

        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2">
            {searchResults.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#121212] hover:bg-[#252525]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate">{t.title}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{t.artist}</p>
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
