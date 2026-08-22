"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { usePlayerStore } from "@/store/playerStore";
import { searchYouTubeTracks } from "@/lib/youtube";
import { Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { MdPlayArrow, MdFavorite } from "react-icons/md";
import { useLibraryStore } from "@/store/libraryStore";

const categories = [
  { name: "Pop", color: "linear-gradient(135deg, #e91e63, #8e24aa)", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80" },
  { name: "Hip-Hop", color: "linear-gradient(135deg, #ff9800, #e65100)", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
  { name: "Bollywood", color: "linear-gradient(135deg, #ff4081, #c2185b)", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" },
  { name: "Workout", color: "linear-gradient(135deg, #00e676, #1b5e20)", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80" },
  { name: "Gaming", color: "linear-gradient(135deg, #7c4dff, #311b92)", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80" },
  { name: "Podcasts", color: "linear-gradient(135deg, #00b0ff, #01579b)", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80" },
  { name: "Chart Top 50", color: "linear-gradient(135deg, #ffd600, #ff6d00)", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80" },
  { name: "Chill", color: "linear-gradient(135deg, #26a69a, #004d40)", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80" },
  { name: "Romance", color: "linear-gradient(135deg, #ff5252, #b71c1c)", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80" },
  { name: "Party", color: "linear-gradient(135deg, #ab47bc, #4a148c)", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80" },
  { name: "Indie", color: "linear-gradient(135deg, #66bb6a, #1b5e20)", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=80" },
  { name: "Rock", color: "linear-gradient(135deg, #ef5350, #b71c1c)", image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=300&auto=format&fit=crop&q=80" },
];

export default function SearchPage() {
  const { searchQuery, setSearchQuery, openContextMenu, posterFit, setPosterFit, addToast, setActivePage } = useUIStore();
  const [query, setQuery] = useState(searchQuery || "");
  const [results, setResults] = useState<Track[]>([]);
  const [importedPlaylistData, setImportedPlaylistData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked, importPlaylist } = useLibraryStore();

  useEffect(() => {
    if (searchQuery !== query) {
      setQuery(searchQuery || "");
    }
  }, [searchQuery]);

  // Debounced search with AbortController
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setImportedPlaylistData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.tracks || []);
          setImportedPlaylistData(data.playlist || null);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.warn("Search fetch error in SearchPage:", e);
        }
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setSearchQuery(searchTerm);
  };

  const handleAddPlaylistToLibrary = () => {
    if (!importedPlaylistData) return;
    const newId = importPlaylist({
      name: importedPlaylistData.name,
      description: importedPlaylistData.description,
      coverUrl: importedPlaylistData.coverUrl,
      tracks: importedPlaylistData.tracks,
    });
    addToast(`Added "${importedPlaylistData.name}" to Your Library!`, "success");
    setActivePage("playlist", newId);
  };

  return (
    <div className="px-4 sm:px-6 py-4 text-white pb-36 md:pb-28 min-h-full">
      {/* ── Imported Playlist Banner ── */}

      {importedPlaylistData && (
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#183a22] to-[#121212] border border-green-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={importedPlaylistData.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"}
              alt={importedPlaylistData.name}
              className="w-20 h-20 rounded-xl object-cover shadow-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-green-400">
                {importedPlaylistData.provider === "spotify" ? "Spotify Playlist" : "YouTube Playlist"}
              </span>
              <h3 className="text-xl font-black text-white truncate">{importedPlaylistData.name}</h3>
              <p className="text-xs text-gray-300 line-clamp-1">{importedPlaylistData.description || `${importedPlaylistData.tracks.length} tracks`}</p>
              <p className="text-xs text-gray-400 mt-0.5">{importedPlaylistData.tracks.length} songs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleAddPlaylistToLibrary}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-xs shadow-md transition-all hover:scale-105"
            >
              + Add to Library
            </button>
            <button
              onClick={() => {
                if (importedPlaylistData.tracks.length > 0) {
                  play(importedPlaylistData.tracks[0], importedPlaylistData.tracks);
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs shadow-md transition-all hover:scale-105 flex items-center justify-center gap-1"
            >
              <MdPlayArrow size={18} /> Play All
            </button>
          </div>
        </div>
      )}

      {/* ── Live Search Results Tracklist ── */}
      {results.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-2xl font-black truncate">Top Results for &quot;{query}&quot;</h2>
            <button
              onClick={() => {
                if (results.length > 0) play(results[0], results);
              }}
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs shadow-lg transition-transform hover:scale-105 flex-shrink-0"
            >
              <MdPlayArrow size={18} /> Play All
            </button>
          </div>

          <div className="flex flex-col gap-2">

            {results.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlaying;
              const isLikedTrack = isLiked(track.id);

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      play(track, results);
                    }
                  }}
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
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all ${
                    isPlayingThis ? "bg-[#282828] border border-green-500/40" : "bg-[#181818]/80 hover:bg-[#282828]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-[#181818] shadow-md">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-green-500">
                          ♪
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <MdPlayArrow size={24} className="text-white" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${isPlayingThis ? "text-green-500" : "text-white"}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Save to Liked Songs"
                    >
                      <MdFavorite size={18} className={isLikedTrack ? "text-green-500" : ""} />
                    </button>
                    <span className="text-xs text-gray-500 hidden sm:block">YouTube Music</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Cards Grid ── */}
      {!query && (
        <>
          <h2 className="text-2xl font-black mb-6">Browse All Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSearch(cat.name)}
                className="relative h-40 rounded-xl p-4 overflow-hidden cursor-pointer shadow-lg hover:scale-[1.03] transition-transform duration-200"
                style={{ background: cat.color }}
              >
                <span className="font-bold text-lg text-white drop-shadow">{cat.name}</span>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute -bottom-2 -right-3 w-24 h-24 rounded-lg object-cover rotate-[25deg] shadow-2xl opacity-90"
                />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
