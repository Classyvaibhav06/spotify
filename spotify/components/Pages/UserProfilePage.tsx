"use client";

import { useLibraryStore } from "@/store/libraryStore";
import { useUIStore } from "@/store/useUIStore";
import { MdEdit, MdMoreHoriz } from "react-icons/md";
import { motion } from "framer-motion";

interface UserProfilePageProps {
  userId?: string;
}

export default function UserProfilePage({ userId = "u1" }: UserProfilePageProps) {
  const playlists = useLibraryStore((s) => s.playlists);
  const { setActivePage } = useUIStore();

  const topArtists = [
    { name: "The Weeknd", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Linkin Park", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Nikk", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80", type: "Artist" },
    { name: "Sam Smith", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80", type: "Artist" },
  ];

  return (
    <div className="min-h-full pb-28 text-white">
      {/* ── Profile Header ── */}
      <div className="p-8 bg-gradient-to-b from-purple-900/60 via-indigo-950/40 to-[#121212] flex flex-col sm:flex-row items-end gap-6">
        <div className="relative group w-44 h-44 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-orange-600 flex items-center justify-center font-black text-6xl text-white">
          <span>V</span>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <MdEdit size={32} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Profile</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight my-2 drop-shadow">
            Vaibhav Ghoshi
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
            <span>{playlists.length} Public Playlists</span>
            <span>•</span>
            <span>24 Followers</span>
            <span>•</span>
            <span>18 Following</span>
          </div>
        </div>
      </div>

      {/* ── More Action Controls ── */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button className="text-gray-400 hover:text-white transition-colors">
          <MdMoreHoriz size={28} />
        </button>
      </div>

      {/* ── Top Artists This Month ── */}
      <div className="px-8 mb-10">
        <h2 className="text-2xl font-bold mb-4">Top artists this month</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topArtists.map((artist, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActivePage("artist")}
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

      {/* ── Public Playlists ── */}
      <div className="px-8">
        <h2 className="text-2xl font-bold mb-4">Public Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl, idx) => (
            <div
              key={pl.id}
              onClick={() => setActivePage("playlist", pl.id)}
              className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group"
            >
              {pl.coverUrl ? (
                <img src={pl.coverUrl} alt={pl.name} className="w-full aspect-square object-cover rounded-lg mb-3 shadow-lg" />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-green-500 to-emerald-800 flex items-center justify-center font-bold text-2xl mb-3 shadow-lg">
                  ♪
                </div>
              )}
              <h3 className="font-bold text-sm truncate">{pl.name}</h3>
              <p className="text-xs text-gray-400 mt-1">By Vaibhav Ghoshi</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
