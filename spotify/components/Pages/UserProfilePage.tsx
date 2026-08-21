"use client";

import { useLibraryStore } from "@/store/libraryStore";
import { useUIStore } from "@/store/useUIStore";
import { useSession, signIn, signOut } from "next-auth/react";
import { MdLogout, MdLogin, MdMusicNote, MdFavorite, MdPlaylistPlay } from "react-icons/md";
import { motion } from "framer-motion";

interface UserProfilePageProps {
  userId?: string;
}

export default function UserProfilePage({ userId }: UserProfilePageProps) {
  const { data: session, status } = useSession();
  const playlists = useLibraryStore((s) => s.playlists);
  const likedSongs = useLibraryStore((s) => s.likedSongs);
  const { setActivePage } = useUIStore();

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const displayName = session?.user?.name || (isAuthenticated ? session?.user?.email?.split("@")[0] : "Guest Music Lover");
  const displayEmail = session?.user?.email || "Sign in to sync your playlists and library across devices.";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  const topArtists = [
    { name: "The Weeknd", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Coldplay", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Arijit Singh", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Dua Lipa", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80", type: "Artist" },
  ];

  return (
    <div className="min-h-full pb-28 text-white">
      {/* ── Profile Header ── */}
      <div className="p-8 bg-gradient-to-b from-purple-900/60 via-indigo-950/40 to-[#121212] flex flex-col sm:flex-row items-center sm:items-end gap-6">
        {/* Avatar */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center font-black text-6xl text-white border-4 border-black/40">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={displayName || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
            {isAuthenticated ? "Verified Profile" : "Guest Profile"}
          </span>
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight my-2 drop-shadow truncate">
            {displayName}
          </h1>
          <p className="text-sm text-gray-400 font-medium mb-3">{displayEmail}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-300 font-medium">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
              <MdPlaylistPlay size={16} className="text-[#1ed760]" />
              {playlists.length} {playlists.length === 1 ? "Playlist" : "Playlists"}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
              <MdFavorite size={14} className="text-[#1ed760]" />
              {likedSongs.length} Liked {likedSongs.length === 1 ? "Track" : "Tracks"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-8 py-6 flex items-center gap-4 border-b border-white/5">
        {isAuthenticated ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-red-400 font-bold text-sm rounded-full transition-all hover:scale-105"
          >
            <MdLogout size={18} />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1ed760] text-black font-black text-sm rounded-full transition-all hover:scale-105 shadow-xl"
          >
            <MdLogin size={18} />
            <span>Sign in with Google</span>
          </button>
        )}

        <button
          onClick={() => setActivePage("library")}
          className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-white text-sm font-bold transition-colors"
        >
          View Library
        </button>
      </div>

      {/* ── Top Artists This Month ── */}
      <div className="px-8 my-8">
        <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topArtists.map((artist, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActivePage("search")}
              className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group text-center"
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform"
              />
              <h3 className="font-bold text-sm truncate">{artist.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{artist.type}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── User's Playlists ── */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Playlists</h2>
          <span
            onClick={() => setActivePage("library")}
            className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider cursor-pointer"
          >
            Show All
          </span>
        </div>

        {playlists.length === 0 ? (
          <div className="bg-[#181818] rounded-xl p-8 text-center text-gray-400">
            <MdMusicNote size={40} className="mx-auto mb-2 text-gray-500" />
            <p className="text-sm font-semibold">No playlists created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setActivePage("playlist", pl.id)}
                className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group shadow-md"
              >
                {pl.coverUrl ? (
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-full aspect-square object-cover rounded-lg mb-3 shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500 to-emerald-800 flex items-center justify-center font-bold text-2xl mb-3 shadow-lg text-black">
                    ♪
                  </div>
                )}
                <h3 className="font-bold text-sm truncate text-white mb-1">{pl.name}</h3>
                <p className="text-xs text-gray-400 truncate">By {displayName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
