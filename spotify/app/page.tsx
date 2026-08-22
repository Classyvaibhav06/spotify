"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  MdHome,
  MdSearch,
  MdLibraryMusic,
  MdAdd,
  MdQueueMusic,
  MdMic,
  MdKeyboard,
  MdFavorite,
  MdPlayArrow,
  MdPause,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
  MdSkipPrevious,
  MdSkipNext,
  MdVolumeUp,
  MdVolumeDown,
  MdVolumeOff,
  MdFullscreen,
  MdOutlinePictureInPictureAlt,
  MdSort,
  MdFormatListBulleted,
  MdGridView,
  MdClose,
  MdAddCircleOutline,
  MdMoreHoriz,
  MdPerson,
  MdLogout,
  MdLogin,
  MdLink,
} from "react-icons/md";
import { FaSpotify } from "react-icons/fa6";
import { usePlayerStore, Track } from "@/store/playerStore";

import { useLibraryStore } from "@/store/libraryStore";
import { useUIStore } from "@/store/useUIStore";
import { searchYouTubeTracks } from "@/lib/youtube";
import {
  quickGridItems,
  recommendedStations,
  recommendedForToday,
  aparshaktiMoreLike,
  albumsFeaturingYouLike,
  madeForUserItems,
  moreOfWhatYouLike,
  CardItem,
} from "@/lib/mockData";
import YouTubeAudioEngine from "@/components/Player/YouTubeAudioEngine";
import QueueDrawer from "@/components/Queue/QueueDrawer";
import LyricsModal from "@/components/Lyrics/LyricsModal";
import ShortcutsModal from "@/components/Shortcuts/ShortcutsModal";
import CreatePlaylistModal from "@/components/Playlist/CreatePlaylistModal";
import ImportPlaylistModal from "@/components/Playlist/ImportPlaylistModal";

import ToastNotification from "@/components/Notification/ToastNotification";
import SearchPage from "@/components/Pages/SearchPage";
import ArtistPage from "@/components/Pages/ArtistPage";
import AlbumPage from "@/components/Pages/AlbumPage";
import UserProfilePage from "@/components/Pages/UserProfilePage";
import PlaylistPage from "@/components/Pages/PlaylistPage";
import FullPlayerModal from "@/components/Player/FullPlayerModal";
import ConnectDeviceModal from "@/components/Modals/ConnectDeviceModal";
import EqualizerModal from "@/components/Modals/EqualizerModal";
import EditPlaylistModal from "@/components/Playlist/EditPlaylistModal";
import ContextMenu from "@/components/UI/ContextMenu";
import MobileNav from "@/components/Layout/MobileNav";
import MobileMiniPlayer from "@/components/Layout/MobileMiniPlayer";
import RightSidebar from "@/components/Sidebar/RightSidebar";
import { MdDevices, MdEqualizer } from "react-icons/md";

export default function Home() {
  const router = useRouter();

  // Stores
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    shuffleMode,
    repeatMode,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
  } = usePlayerStore();

  // Session & Auth
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const {
    playlists,
    likedSongs,
    recentlyPlayed,
    deletePlaylist,
    toggleLike,
    isLiked,
    addToRecent,
    setLikedSongs,
  } = useLibraryStore();


  const {
    activePage,
    activePlaylistId,
    activeArtistId,
    activeAlbumId,
    activeUserId,
    setActivePage,
    queueOpen,
    toggleQueue,
    lyricsOpen,
    toggleLyrics,
    shortcutsOpen,
    toggleShortcuts,
    setCreatePlaylistModalOpen,
    setImportPlaylistModalOpen,
    setConnectDeviceOpen,
    setEqualizerOpen,

    setEditPlaylistOpen,
    setShowFullPlayer,
    rightPanelOpen,
    toggleRightPanel,
    openContextMenu,
    searchQuery,
    setSearchQuery,
    addToast,
  } = useUIStore();

  // Sync user's liked songs dynamically from database when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/me/likes")
        .then((res) => res.json())
        .then((data) => {
          if (data?.likedSongs && Array.isArray(data.likedSongs) && data.likedSongs.length > 0) {
            setLikedSongs(data.likedSongs);
          }
        })
        .catch((err) => console.warn("Failed to fetch user liked songs from DB:", err));
    }
  }, [status, setLikedSongs]);

  // Click outside listener for profile menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Local state
  const [libFilter, setLibFilter] = useState<"Playlists" | "Artists" | "Albums">("Playlists");
  const [libSort, setLibSort] = useState<"Alphabetical" | "Recently Added" | "Creator">("Alphabetical");
  const [libView, setLibView] = useState<"grid" | "list">("list");
  const [mainFilter, setMainFilter] = useState<"All" | "Music" | "Podcasts">("All");

  // Search state & Recent Searches Popover
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchApiError, setSearchApiError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click & Touch outside listener for search popup panel
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowRecentPopup(false);
      }
    };
    if (showRecentPopup) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showRecentPopup]);

  const [recentItems, setRecentItems] = useState([
    {
      id: "rec-1",
      title: "Top 10 Romantic Songs 2026 | Bollywood Lov...",
      subtitle: "Album • Pragati Parihar",
      coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-1", title: "Top 10 Romantic Songs", artist: "Pragati Parihar", duration: 210, youtubeId: "b853m6x-5u8" },
    },
    {
      id: "rec-2",
      title: "All Time Top Bollywood Hindi Songs",
      subtitle: "Playlist • Anish Tripathi",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-2", title: "Bollywood Hindi Hits", artist: "Anish Tripathi", duration: 195, youtubeId: "34Na4j8AVgA" },
    },
    {
      id: "rec-3",
      title: "All time Best BOLLYWOOD songs",
      subtitle: "Playlist • Ankur Pansare",
      coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-3", title: "All Time Best Bollywood", artist: "Ankur Pansare", duration: 220, youtubeId: "4NRXx6U8ABQ" },
    },
    {
      id: "rec-4",
      title: "TOP 10 MOST VIRAL PHONK/FUNK 2026",
      subtitle: "Playlist • Hitsi",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-4", title: "VIRAL PHONK 2026", artist: "Hitsi", duration: 165, youtubeId: "DeumyOzKqgI" },
    },
    {
      id: "rec-5",
      title: "phonk",
      subtitle: "Playlist • Spotify",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-5", title: "Phonk Drift", artist: "Spotify", duration: 150, youtubeId: "wp43OdtAAkM" },
    },
    {
      id: "rec-6",
      title: "What's Up?",
      subtitle: "Song • 4 Non Blondes",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
      track: { id: "yt-rec-6", title: "What's Up?", artist: "4 Non Blondes", duration: 295, youtubeId: "6NXnxT8889I" },
    },
  ]);


  // Load search history and sync stored playlists on client mount
  useEffect(() => {
    useLibraryStore.getState().initClientStorage();
    if (typeof window !== "undefined") {
      const history = localStorage.getItem("sp_search_history");
      if (history) setSearchHistory(JSON.parse(history));
    }
  }, []);


  // Handle Search Input with 700ms Debounce and AbortController
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchApiError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.tracks || []);
          setSearchApiError(data.error || null);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Search fetch error:", err);
        }
      } finally {
        setIsSearching(false);
      }

      // Add to search history
      setSearchHistory((prev) => {
        const updated = [searchQuery.trim(), ...prev.filter((q) => q !== searchQuery.trim())].slice(0, 10);
        if (typeof window !== "undefined") localStorage.setItem("sp_search_history", JSON.stringify(updated));
        return updated;
      });
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);



  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "n":
        case "N":
          next();
          break;
        case "p":
        case "P":
          previous();
          break;
        case "s":
        case "S":
          toggleShuffle();
          addToast(shuffleMode ? "Shuffle off" : "Shuffle on", "info");
          break;
        case "r":
        case "R":
          cycleRepeat();
          break;
        case "m":
        case "M":
          setVolume(volume === 0 ? 70 : 0);
          break;
        case "ArrowRight":
          seek(Math.min(progress + 5, duration));
          break;
        case "ArrowLeft":
          seek(Math.max(progress - 5, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(volume + 10, 100));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(volume - 10, 0));
          break;
        case "?":
          toggleShortcuts();
          break;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setActivePage("search");
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, next, previous, toggleShuffle, shuffleMode, cycleRepeat, setVolume, volume, seek, progress, duration, toggleShortcuts, setActivePage, addToast]);

  // Track playback listener for recents
  useEffect(() => {
    if (currentTrack && isPlaying) {
      addToRecent(currentTrack);
    }
  }, [currentTrack?.id, isPlaying, addToRecent]);

  function fmtTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const currentPlaylist = playlists.find((p) => p.id === activePlaylistId);

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white text-sm selection:bg-[#1ed760] selection:text-black overflow-hidden select-none">
      {/* Invisible YouTube Audio Streaming Engine */}
      <YouTubeAudioEngine />

      {/* Slide-over Queue Drawer */}
      <QueueDrawer />

      {/* Lyrics Modal */}
      <LyricsModal />

      {/* Shortcuts Modal */}
      <ShortcutsModal />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal />

      {/* Import Playlist Modal */}
      <ImportPlaylistModal />

      {/* Toast Notification Alerts */}
      <ToastNotification />

      {/* ════════════════════════════════════ MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2 pb-[94px]">
        {/* ═══════════════════════════════ LEFT SIDEBAR */}
        <aside className="w-[280px] flex-shrink-0 flex flex-col bg-[#121212] rounded-xl overflow-hidden hidden md:flex">
          {/* Library Header */}
          <div className="p-4 flex items-center justify-between">
            <div
              onClick={() => setActivePage("library")}
              className="flex items-center gap-2 cursor-pointer text-[#b3b3b3] hover:text-white transition-colors"
            >
              <MdLibraryMusic size={24} />
              <span className="font-bold text-base text-white">Your Library</span>
            </div>
            <div className="flex items-center gap-1 text-[#b3b3b3]">
              <button
                onClick={() => setImportPlaylistModalOpen(true)}
                className="hover:text-white hover:bg-[#1f1f1f] p-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold px-2"
                title="Import playlist from link"
              >
                <MdLink size={18} />
                <span className="text-[11px]">Import</span>
              </button>
              <button
                onClick={() => setCreatePlaylistModalOpen(true)}
                className="hover:text-white hover:bg-[#1f1f1f] p-1.5 rounded-full transition-all"
                title="Create playlist"
              >
                <MdAdd size={20} />
              </button>
            </div>
          </div>


          {/* Filter Pills */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {(["Playlists", "Artists", "Albums"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLibFilter(filter)}
                className={`font-bold px-3 py-1.5 rounded-full text-xs tracking-wide transition-colors ${
                  libFilter === filter
                    ? "bg-white text-black"
                    : "bg-[#1f1f1f] text-white hover:bg-[#252525] font-semibold"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search / Recents Row */}
          <div className="px-4 py-2 flex items-center justify-between text-[#b3b3b3] text-xs">
            <button
              onClick={() => setActivePage("search")}
              className="hover:bg-[#1f1f1f] p-1.5 rounded-full hover:text-white transition-all"
            >
              <MdSearch size={18} />
            </button>
            <button className="flex items-center gap-1 hover:text-white transition-colors font-semibold">
              <span>Recents</span>
              <MdSort size={16} />
            </button>
          </div>

          {/* Scrollable Library List */}
          <div suppressHydrationWarning className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-2 flex flex-col gap-1">
            {/* Liked Songs Auto-Playlist */}
            <div
              onClick={() => setActivePage("playlist", "pl-liked")}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-colors ${
                activePlaylistId === "pl-liked" ? "bg-[#252525]" : "hover:bg-[#1f1f1f]"
              }`}
            >
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-liked-songs flex items-center justify-center shadow-md">
                <MdFavorite size={22} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0" suppressHydrationWarning>
                <span className="font-bold text-white truncate text-sm">Liked Songs</span>
                <span className="text-[#b3b3b3] text-xs truncate flex items-center gap-1" suppressHydrationWarning>
                  Playlist • {likedSongs.length} songs
                </span>
              </div>
            </div>

            {/* Custom User Playlists */}
            {playlists.filter((p) => p.id !== "pl-liked").map((pl) => {
              const posterUrl = pl.coverUrl || (pl.tracks.length > 0 ? pl.tracks[0].coverUrl : undefined);
              return (

                <div
                  key={pl.id}
                  onClick={() => setActivePage("playlist", pl.id)}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer group transition-colors ${
                    activePlaylistId === pl.id ? "bg-[#252525]" : "hover:bg-[#1f1f1f]"
                  }`}
                  suppressHydrationWarning
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818] shadow">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-bold text-xs"
                          style={{ background: pl.gradient || "linear-gradient(135deg, #1ed760, #0d7a36)" }}
                        >
                          ♪
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0" suppressHydrationWarning>
                      <span className="font-bold text-white truncate text-sm" suppressHydrationWarning>{pl.name}</span>
                      <span className="text-[#b3b3b3] text-xs truncate" suppressHydrationWarning>Playlist • {pl.tracks.length} songs</span>
                    </div>
                  </div>

                  {/* Remove Playlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove playlist "${pl.name}" from your library?`)) {
                        deletePlaylist(pl.id);
                        addToast(`Removed "${pl.name}" from library`, "info");
                        if (activePlaylistId === pl.id) {
                          setActivePage("home");
                        }
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-[#333] text-[#b3b3b3] hover:text-red-400 transition-all flex-shrink-0"
                    title="Remove playlist from library"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              );
            })}
          </div>


        </aside>

        {/* ═══════════════════════════════ CENTER MAIN AREA */}
        <main className="flex-1 bg-[#121212] rounded-xl overflow-hidden flex flex-col relative">
          {/* Sticky Top Bar */}
          <header className="h-16 flex items-center justify-between px-3 sm:px-5 sticky top-0 z-10 bg-gradient-to-b from-[#1a1a2e]/95 to-[#121212]/90 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
              {/* Spotify Logo & Brand */}
              <div
                onClick={() => setActivePage("home")}
                className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 group"
                title="Spotify"
              >
                <FaSpotify className="text-[#1ed760] text-2xl sm:text-3xl group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline-block font-black text-white tracking-tight text-base sm:text-lg">Spotify</span>
              </div>

              <button
                onClick={() => setActivePage("home")}
                className="w-9 h-9 rounded-full bg-black/70 flex items-center justify-center text-white/70 hover:text-white hover:bg-black transition-all flex-shrink-0"
                title="Home"
              >
                <MdHome size={20} />
              </button>

              {/* Pill Search Input with Spotify Autocomplete & Recent Searches Popover */}
              <div ref={searchContainerRef} className="relative flex items-center flex-1 max-w-[260px] xs:max-w-[320px] sm:max-w-[380px] md:max-w-[480px]">

                <div className="flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-1 focus-within:ring-white rounded-full px-3 py-1.5 w-full transition-all border border-transparent">
                  <MdSearch size={20} className="text-[#b3b3b3] mr-2 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onFocus={() => {
                      setShowRecentPopup(true);
                    }}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowRecentPopup(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowRecentPopup(false);
                      }
                    }}

                    className="bg-transparent text-white text-sm outline-none w-full placeholder-[#b3b3b3] truncate"
                    placeholder="What do you want to play?"
                    type="text"
                  />

                  {/* Clear Button */}
                  {searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="p-1 text-[#b3b3b3] hover:text-white mr-1.5 transition-colors"
                    >
                      <MdClose size={18} />
                    </button>
                  ) : (
                    /* Hotkey Badges */
                    <div className="hidden lg:flex items-center gap-1 mr-2 text-[10px] font-mono text-[#b3b3b3] flex-shrink-0">
                      <span className="px-1.5 py-0.5 bg-[#2a2a2a] border border-[#383838] rounded font-bold">Ctrl</span>
                      <span className="px-1.5 py-0.5 bg-[#2a2a2a] border border-[#383838] rounded font-bold">Shift</span>
                      <span className="px-1.5 py-0.5 bg-[#2a2a2a] border border-[#383838] rounded font-bold">L</span>
                    </div>
                  )}

                  <span className="material-symbols-outlined text-[18px] text-[#b3b3b3] hover:text-white cursor-pointer border-l border-[#383838] pl-2 flex-shrink-0 hidden md:inline-flex">
                    vertical_split
                  </span>
                </div>

                {/* Spotify Search Autocomplete / Recent Popover Dropdown Overlay */}
                {showRecentPopup && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowRecentPopup(false)}
                    />
                    <div className="fixed sm:absolute top-[64px] sm:top-[calc(100%+6px)] inset-x-2 sm:inset-x-auto sm:left-0 w-auto sm:w-[420px] md:w-[460px] bg-[#1f1f1f] text-white rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-black/90 z-50 border border-[#333333] flex flex-col gap-1 max-h-[75vh] sm:max-h-[500px] overflow-y-auto hide-scrollbar animate-in fade-in zoom-in-95 duration-100">
                      
                      {/* CASE A: USER IS TYPING A QUERY (Show Keyword Suggestions + Live Results) */}
                      {searchQuery ? (
                        <>
                          {/* 1. Keyword Text Suggestions */}
                          <div className="flex flex-col gap-0.5 pb-2 border-b border-[#333333]">
                            {[
                              `${searchQuery} x phonk`,
                              `${searchQuery} songs`,
                              `${searchQuery} slow and reverb`,
                            ].map((sug, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setSearchQuery(sug);
                                }}

                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#282828] cursor-pointer transition-colors"
                              >
                                <MdSearch size={20} className="text-[#a7a7a7]" />
                                <p className="text-sm text-[#a7a7a7]">
                                  <strong className="text-white font-bold">{searchQuery}</strong>
                                  {sug.slice(searchQuery.length)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* 2. Live Search Track Results */}
                          <div className="pt-2 flex flex-col gap-1">
                            {isSearching ? (
                              <div className="flex flex-col gap-2 p-2">
                                <div className="h-12 bg-[#282828] rounded-xl animate-pulse" />
                                <div className="h-12 bg-[#282828] rounded-xl animate-pulse" />
                                <div className="h-12 bg-[#282828] rounded-xl animate-pulse" />
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => {
                                    play(t, searchResults);
                                    setShowRecentPopup(false);
                                  }}
                                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#282828] group cursor-pointer transition-colors relative"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#181818] shadow-md">
                                      {t.coverUrl ? (
                                        <img
                                          src={t.coverUrl}
                                          alt={t.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="w-full h-full flex items-center justify-center font-bold text-xs"
                                          style={{ background: t.bgGradient || "linear-gradient(135deg, #1ed760, #0d7a36)" }}
                                        >
                                          ♪
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <MdPlayArrow size={24} className="text-white fill-white" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-white text-[13.5px] truncate leading-tight">
                                        {t.title}
                                      </p>
                                      <p className="text-[12px] text-[#a7a7a7] truncate mt-0.5">
                                        Song • {t.artist}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToast(`Options for "${t.title}"`, "info");
                                      }}
                                      className="p-1 text-[#a7a7a7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="More options"
                                    >
                                      <MdMoreHoriz size={20} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToQueue(t);
                                        addToast(`Added "${t.title}" to Queue`, "success");
                                      }}
                                      className="p-1 text-[#a7a7a7] hover:text-white transition-colors"
                                      title="Add to playlist / queue"
                                    >
                                      <MdAddCircleOutline size={20} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-[#a7a7a7]">
                                Searching for &quot;{searchQuery}&quot;...
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* CASE B: RECENT SEARCHES (Empty Query) */
                        <>
                          <div className="font-extrabold text-[14px] text-white px-3 pt-2 pb-1">
                            Recent searches
                          </div>

                          {recentItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                play(item.track);
                                setShowRecentPopup(false);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#282828] group cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#181818] shadow-md">
                                  <img
                                    src={item.coverUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <MdPlayArrow size={24} className="text-white fill-white" />
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-white text-[13.5px] truncate leading-tight">
                                    {item.title}
                                  </p>
                                  <p className="text-[12px] text-[#a7a7a7] truncate mt-0.5">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentItems((prev) => prev.filter((i) => i.id !== item.id));
                                }}
                                className="p-1.5 text-[#a7a7a7] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10 flex-shrink-0"
                                title="Remove from recent searches"
                              >
                                <MdClose size={18} />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Top Bar Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={toggleShortcuts}
                className="w-8 h-8 rounded-full bg-[#1f1f1f] hidden md:flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#252525] transition-all"
                title="Keyboard Shortcuts (?)"
              >
                <MdKeyboard size={18} />
              </button>


              {status === "authenticated" && session?.user ? (
                <div className="relative" ref={profileMenuRef}>
                  {/* Google PFP Button */}
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full bg-[#181818] hover:bg-[#282828] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-md group"
                    title={session.user.name || "Account Profile"}
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center font-bold text-xs shadow-md">
                        {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Profile Details Modal / Dropdown Popover */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#282828] text-white rounded-2xl p-4 shadow-2xl z-50 border border-[#383838] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#1ed760] shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#1ed760] text-black flex items-center justify-center font-black text-lg shadow-md">
                            {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate">
                            {session.user.name || "Music Listener"}
                          </h4>
                          <p className="text-xs text-gray-400 truncate font-medium">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      {/* User Stats */}
                      <div className="grid grid-cols-2 gap-2 bg-[#1f1f1f] p-2.5 rounded-xl text-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#1ed760]">{likedSongs.length}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Liked Songs</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10">
                          <span className="text-sm font-black text-white">{playlists.length}</span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Playlists</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => {
                            setActivePage("user");
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-white rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          <MdPerson size={18} className="text-[#1ed760]" />
                          <span>View Full Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setActivePage("library");
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-white rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          <MdLibraryMusic size={18} className="text-gray-400" />
                          <span>Your Library</span>
                        </button>
                        <div className="h-[1px] bg-white/10 my-0.5" />
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            signOut();
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-left"
                        >
                          <MdLogout size={18} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-1.5"
                >
                  <MdLogin size={16} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Page Views */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-3 sm:px-6 pb-36 md:pb-8">

            {/* HOME VIEW */}
            {activePage === "home" && (
              <div className="space-y-10 pt-4">
                {/* Top Filter Pills */}
                <div className="flex gap-2 sticky top-0 z-[5] bg-[#121212] py-2 overflow-x-auto hide-scrollbar">

                  {(["All", "Music", "Podcasts"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMainFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        mainFilter === filter ? "bg-white text-black" : "bg-[#1f1f1f] text-white hover:bg-[#252525]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* 1. Quick Access Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {quickGridItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.id === "q-liked") {
                          setActivePage("playlist", "pl-liked");
                        } else {
                          setSearchQuery(item.title);
                          setActivePage("search");
                        }
                      }}
                      className="flex items-center bg-white/10 hover:bg-white/20 transition-all rounded-lg overflow-hidden group cursor-pointer relative pr-4 h-[56px] shadow-sm"
                    >
                      <div
                        className="w-14 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md"
                        style={{ background: item.gradient || "linear-gradient(135deg, #450af5, #c4efd9)" }}
                      >
                        {item.id === "q-liked" ? (
                          <MdFavorite size={24} className="text-white" />
                        ) : (
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-bold ml-3 text-xs sm:text-sm text-white truncate flex-1 pr-8">
                        {item.title}
                      </span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (item.id === "q-liked" && likedSongs.length > 0) {
                            play(likedSongs[0], likedSongs);
                          } else {
                            const { tracks } = await searchYouTubeTracks(item.title);
                            if (tracks.length > 0) play(tracks[0], tracks);
                          }
                        }}
                        className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg absolute right-3 hover:scale-105"
                      >
                        <MdPlayArrow size={24} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 2. Recommended Stations */}
                <div>
                  <p className="text-xs text-[#b3b3b3] font-semibold mb-1">
                    Non-stop music based on your favorite songs and artists.
                  </p>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl font-black text-white hover:underline cursor-pointer">
                      Recommended Stations
                    </h2>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {recommendedStations.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSearchQuery(st.title);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div
                          className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg p-3 flex flex-col justify-between"
                          style={{ background: st.gradient || "linear-gradient(135deg, #3b82f6, #1e3a8a)" }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black tracking-widest text-black bg-white/80 px-2 py-0.5 rounded">
                              RADIO
                            </span>
                          </div>
                          <h4 className="text-xl font-black text-white leading-tight drop-shadow">
                            {st.title.replace(" Radio", "")}
                          </h4>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(st.title);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{st.title}</h3>
                        <p className="text-[#b3b3b3] text-xs line-clamp-2">{st.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Recommended for Today */}
                <div>
                  <p className="text-xs text-[#b3b3b3] font-semibold mb-1">Inspired by your recent activity</p>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl font-black text-white hover:underline cursor-pointer">
                      Recommended for today
                    </h2>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {recommendedForToday.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(`${item.title} ${item.subtitle}`);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[#252525]">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(`${item.title} ${item.subtitle}`);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[#b3b3b3] text-xs truncate">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. More Like Aparshakti Khurana */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&auto=format&fit=crop&q=80"
                      alt="Aparshakti Khurana"
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#b3b3b3] font-semibold block">More like</span>
                      <h2 className="text-2xl font-black text-white hover:underline cursor-pointer truncate">
                        Aparshakti Khurana
                      </h2>
                    </div>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {aparshaktiMoreLike.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(`${item.title} ${item.subtitle}`);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[#252525]">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(`${item.title} ${item.subtitle}`);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[#b3b3b3] text-xs truncate">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Albums Featuring Songs You Like */}
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl font-black text-white hover:underline cursor-pointer">
                      Albums featuring songs you like
                    </h2>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {albumsFeaturingYouLike.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(`${item.title} ${item.subtitle}`);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[#252525]">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(`${item.title} ${item.subtitle}`);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[#b3b3b3] text-xs truncate">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Made For Vaibhav Ghoshi */}
                <div>
                  <p className="text-xs text-[#b3b3b3] font-semibold mb-1">Made For</p>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl font-black text-white hover:underline cursor-pointer">
                      Vaibhav Ghoshi
                    </h2>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {madeForUserItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(`${item.title} ${item.subtitle}`);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[#252525]">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(`${item.title} ${item.subtitle}`);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[#b3b3b3] text-xs line-clamp-2">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. More Of What You Like */}
                <div>
                  <p className="text-xs text-[#b3b3b3] font-semibold mb-1">Hear a little bit of everything you love.</p>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="text-2xl font-black text-white hover:underline cursor-pointer">
                      More of what you like
                    </h2>
                    <span className="text-xs text-[#b3b3b3] font-bold uppercase tracking-widest hover:text-white cursor-pointer">
                      Show all
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {moreOfWhatYouLike.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(`${item.title} ${item.subtitle}`);
                          setActivePage("search");
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl w-[180px] flex-shrink-0 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[#252525]">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { tracks } = await searchYouTubeTracks(`${item.title} ${item.subtitle}`);
                              if (tracks.length > 0) play(tracks[0], tracks);
                            }}
                            className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl absolute right-2 bottom-2 play-btn-overlay hover:scale-105"
                          >
                            <MdPlayArrow size={26} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-white truncate mb-1">{item.title}</h3>
                        <p className="text-[#b3b3b3] text-xs truncate">{item.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEARCH VIEW */}
            {activePage === "search" && <SearchPage />}

            {/* ARTIST VIEW */}
            {activePage === "artist" && <ArtistPage artistId={activeArtistId || undefined} />}

            {/* ALBUM VIEW */}
            {activePage === "album" && <AlbumPage albumId={activeAlbumId || undefined} />}

            {/* USER PROFILE VIEW */}
            {activePage === "user" && <UserProfilePage userId={activeUserId || undefined} />}

            {/* PLAYLIST / LIKED SONGS VIEW */}
            {activePage === "playlist" && <PlaylistPage playlistId={activePlaylistId || "pl-liked"} />}

            {/* LIBRARY VIEW */}
            {activePage === "library" && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-black">Your Library</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLibView(libView === "grid" ? "list" : "grid")}
                      className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#1f1f1f]"
                    >
                      {libView === "grid" ? <MdFormatListBulleted size={20} /> : <MdGridView size={20} />}
                    </button>
                    <button
                      onClick={() => setImportPlaylistModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#282828] hover:bg-[#333] border border-[#3e3e3e] text-white font-bold text-xs hover:scale-105 transition-all"
                    >
                      <MdLink size={18} className="text-[#1ed760]" /> Import from Link
                    </button>
                    <button
                      onClick={() => setCreatePlaylistModalOpen(true)}
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#1ed760] text-black font-bold text-xs hover:scale-105 transition-transform"
                    >
                      <MdAdd size={18} /> New Playlist
                    </button>

                  </div>
                </div>

                <div suppressHydrationWarning className={libView === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => setActivePage("playlist", pl.id)}
                      className={`p-4 rounded-xl bg-[#181818] hover:bg-[#252525] cursor-pointer transition-colors group relative ${
                        libView === "list" ? "flex items-center gap-4" : ""
                      }`}
                      suppressHydrationWarning
                    >
                      <div
                        className={`rounded-lg flex items-center justify-center font-bold text-lg shadow-md overflow-hidden bg-[#252525] ${
                          libView === "grid" ? "w-full aspect-square mb-3" : "w-14 h-14 flex-shrink-0"
                        }`}
                        style={{ background: pl.gradient || "linear-gradient(135deg, #1ed760, #0d7a36)" }}
                      >
                        {pl.coverUrl ? (
                          <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                        ) : (
                          "♪"
                        )}
                      </div>
                      <div className="min-w-0 flex-1" suppressHydrationWarning>
                        <p className="font-bold text-sm text-white truncate" suppressHydrationWarning>{pl.name}</p>
                        <p className="text-xs text-[#b3b3b3] truncate" suppressHydrationWarning>Playlist • {pl.tracks.length} songs</p>
                      </div>
                      {pl.id !== "pl-liked" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove playlist "${pl.name}"?`)) {
                              deletePlaylist(pl.id);
                              addToast(`Removed "${pl.name}"`, "info");
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-[#333] text-[#b3b3b3] hover:text-red-400 transition-all absolute right-3 top-3 bg-black/50 shadow"
                          title="Delete playlist"
                        >
                          <MdClose size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Spotify Now Playing View) */}
        <RightSidebar />
      </div>

      {/* Mobile Floating Mini Player */}
      <MobileMiniPlayer />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav />

      {/* Modals & Overlays */}
      <FullPlayerModal />
      <ConnectDeviceModal />
      <EqualizerModal />
      <EditPlaylistModal />
      <ContextMenu />


      {/* ════════════════════════════════════ FIXED BOTTOM PLAYER BAR (Desktop Only) */}
      <footer className="fixed bottom-0 left-0 w-full h-[90px] bg-[#181818] hidden md:flex items-center justify-between px-4 z-40 border-t border-[#2a2a2a]">

        {/* LEFT: Track Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
          {currentTrack?.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-md flex-shrink-0 flex items-center justify-center font-bold text-base shadow-md"
              style={{ background: currentTrack?.bgGradient || "linear-gradient(135deg, #d4a373, #faedcd)" }}
            >
              ♪
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate text-white cursor-pointer hover:underline">
              {currentTrack?.title ?? "Teri Naar"}
            </span>
            <span className="text-xs text-[#b3b3b3] truncate cursor-pointer hover:underline">
              {currentTrack?.artist ?? "Nikk"}
            </span>
          </div>
          {currentTrack && (
            <button
              onClick={() => {
                toggleLike(currentTrack);
                addToast(isLiked(currentTrack.id) ? "Removed from Liked Songs" : "Added to Liked Songs", "success");
              }}
              className="p-1.5 text-[#b3b3b3] hover:text-[#1ed760] transition-colors ml-1"
            >
              <MdFavorite size={20} className={isLiked(currentTrack.id) ? "text-[#1ed760]" : ""} />
            </button>
          )}
        </div>

        {/* CENTER: Playback Controls + Progress Slider */}
        <div className="flex flex-col items-center max-w-[722px] w-[40%] px-2 gap-1.5">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${shuffleMode ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
              title="Shuffle"
            >
              <MdShuffle size={18} />
            </button>
            <button onClick={previous} className="text-[#b3b3b3] hover:text-white transition-colors">
              <MdSkipPrevious size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              {isPlaying ? <MdPause size={22} /> : <MdPlayArrow size={22} className="ml-0.5" />}
            </button>
            <button onClick={next} className="text-[#b3b3b3] hover:text-white transition-colors">
              <MdSkipNext size={24} />
            </button>
            <button
              onClick={cycleRepeat}
              className={`transition-colors ${repeatMode !== "off" ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? <MdRepeatOne size={18} /> : <MdRepeat size={18} />}
            </button>
          </div>

          {/* Seek Progress Bar */}
          <div className="w-full flex items-center gap-2 text-[11px] text-[#b3b3b3]">
            <span className="min-w-[32px] text-right tabular-nums">{fmtTime(progress)}</span>
            <div className="progress-track flex-1 h-1 bg-[#535353] rounded-full relative cursor-pointer">
              <div
                className="progress-fill absolute top-0 left-0 h-full bg-white rounded-full transition-colors duration-150"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
            <span className="min-w-[32px] tabular-nums">{fmtTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Volume & Secondary Controls */}
        <div className="flex items-center justify-end gap-2 w-[30%] min-w-[200px] text-[#b3b3b3]">
          <button onClick={toggleLyrics} className={`p-1 transition-colors ${lyricsOpen ? "text-[#1ed760]" : "hover:text-white"}`} title="Lyrics">
            <MdMic size={18} />
          </button>
          <button onClick={toggleQueue} className={`p-1 transition-colors ${queueOpen ? "text-[#1ed760]" : "hover:text-white"}`} title="Queue">
            <MdQueueMusic size={18} />
          </button>
          <button onClick={() => setConnectDeviceOpen(true)} className="p-1 transition-colors hover:text-white" title="Connect Device">
            <MdDevices size={18} />
          </button>
          <button onClick={() => setEqualizerOpen(true)} className="p-1 transition-colors hover:text-white" title="Equalizer & Quality">
            <MdEqualizer size={18} />
          </button>
          <button onClick={toggleRightPanel} className={`p-1 transition-colors ${rightPanelOpen ? "text-[#1ed760]" : "hover:text-white"}`} title="Now Playing View">
            <MdOutlinePictureInPictureAlt size={18} />
          </button>
          <button onClick={() => setShowFullPlayer(true)} className="p-1 transition-colors hover:text-white" title="TV Fullscreen Mode">
            <MdFullscreen size={20} />
          </button>


          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setVolume(volume === 0 ? 70 : 0)} className="hover:text-white transition-colors">
              {volume === 0 ? <MdVolumeOff size={18} /> : volume < 50 ? <MdVolumeDown size={18} /> : <MdVolumeUp size={18} />}
            </button>
            <div className="vol-track w-[93px] h-1 bg-[#535353] rounded-full relative cursor-pointer">
              <div
                className="vol-fill absolute top-0 left-0 h-full bg-white rounded-full transition-colors duration-150"
                style={{ width: `${volume}%` }}
                suppressHydrationWarning
              />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
