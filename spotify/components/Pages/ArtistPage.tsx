"use client";

import { useState } from "react";
import { MdVerified, MdPlayArrow, MdPause, MdMoreHoriz, MdPersonAdd } from "react-icons/md";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { motion } from "framer-motion";

interface ArtistPageProps {
  artistId?: string;
}

export default function ArtistPage({ artistId = "nikk" }: ArtistPageProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"popular" | "albums" | "singles">("popular");
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore();
  const openContextMenu = useUIStore((s) => s.openContextMenu);

  const artistData = {
    name: "Nikk",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
    listeners: "1,245,890",
    bio: "Nikk is an Indian pop and R&B singer-songwriter known for viral Punjabi romantic hits including 'Teri Naar' and 'Yaari'.",
  };

  const popularTracks: Track[] = [
    {
      id: "yt-artist-1",
      title: "Teri Naar",
      artist: "Nikk",
      album: "Teri Naar - Single",
      duration: 159,
      youtubeId: "vB1o7X-y68A",
      coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: "yt-artist-2",
      title: "Yaari",
      artist: "Nikk ft. Avneet Kaur",
      album: "Yaari - Single",
      duration: 198,
      youtubeId: "34Na4j8AVgA",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: "yt-artist-3",
      title: "Badaami Color",
      artist: "Nikk",
      album: "Badaami Color - Single",
      duration: 174,
      youtubeId: "kXYiU_JCYtU",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: "yt-artist-4",
      title: "Relation",
      artist: "Nikk ft. Mahira Sharma",
      album: "Relation - Single",
      duration: 210,
      youtubeId: "AJtDXIazrMo",
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: "yt-artist-5",
      title: "Nakhre",
      artist: "Nikk",
      album: "Nakhre - Single",
      duration: 185,
      youtubeId: "eVTXPUF4Oz4",
      coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    },
  ];

  const albums = [
    { title: "Teri Naar (Deluxe)", year: "2024", tracks: 10, cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80" },
    { title: "Punjabi Romance Mix", year: "2023", tracks: 14, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80" },
  ];

  const singles = [
    { title: "Yaari", year: "2024", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" },
    { title: "Badaami Color", year: "2023", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80" },
    { title: "Relation", year: "2022", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
  ];

  const isCurrentArtistPlaying = currentTrack?.artist?.toLowerCase().includes("nikk") && isPlaying;

  return (
    <div className="min-h-full pb-28 text-white">
      {/* ── Hero Banner Header ── */}
      <div className="relative h-80 w-full overflow-hidden flex flex-col justify-end p-8 bg-gradient-to-b from-indigo-900/60 to-[#121212]">
        <img
          src={artistData.bannerUrl}
          alt={artistData.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40 filter brightness-90 mix-blend-overlay"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold mb-2">
            <MdVerified size={20} />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4 drop-shadow-lg">
            {artistData.name}
          </h1>
          <p className="text-gray-300 text-sm font-medium">
            {artistData.listeners} monthly listeners
          </p>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => {
            if (isCurrentArtistPlaying) {
              togglePlay();
            } else {
              play(popularTracks[0], popularTracks);
            }
          }}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        >
          {isCurrentArtistPlaying ? <MdPause size={28} /> : <MdPlayArrow size={32} className="ml-1" />}
        </button>

        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
            isFollowing
              ? "border-green-500 text-green-500 hover:border-red-500 hover:text-red-500"
              : "border-gray-500 text-white hover:border-white"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>

        <button className="text-gray-400 hover:text-white transition-colors">
          <MdMoreHoriz size={28} />
        </button>
      </div>

      {/* ── Popular Tracks ── */}
      <div className="px-8 mb-10">
        <h2 className="text-2xl font-bold mb-4">Popular</h2>
        <div className="flex flex-col gap-1">
          {popularTracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => play(track, popularTracks)}
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
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer group transition-all ${
                  isPlayingThis ? "bg-[#282828]" : "hover:bg-[#282828]/70"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-6 text-center text-sm font-bold text-gray-400 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <button className="w-6 hidden group-hover:flex items-center justify-center text-white">
                    <MdPlayArrow size={20} />
                  </button>
                  <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded object-cover shadow flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm truncate ${isPlayingThis ? "text-green-500" : "text-white"}`}>
                      {track.title}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 w-32 hidden md:block text-right pr-6">
                  {(1240500 - idx * 180000).toLocaleString()} plays
                </div>
                <div className="text-xs text-gray-400">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Discography Section ── */}
      <div className="px-8">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-3">
          <h2 className="text-2xl font-bold">Discography</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                activeTab === "popular" ? "bg-white text-black" : "bg-[#242424] text-white hover:bg-[#333]"
              }`}
            >
              Popular Releases
            </button>
            <button
              onClick={() => setActiveTab("albums")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                activeTab === "albums" ? "bg-white text-black" : "bg-[#242424] text-white hover:bg-[#333]"
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setActiveTab("singles")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                activeTab === "singles" ? "bg-white text-black" : "bg-[#242424] text-white hover:bg-[#333]"
              }`}
            >
              Singles & EPs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(activeTab === "albums" ? albums : singles).map((album, idx) => (
            <div key={idx} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all cursor-pointer group">
              <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover rounded-lg mb-3 shadow-lg" />
              <h3 className="font-bold text-sm truncate">{album.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{album.year} • Single</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
