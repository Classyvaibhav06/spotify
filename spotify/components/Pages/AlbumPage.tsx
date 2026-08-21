"use client";

import { MdPlayArrow, MdPause, MdAccessTime, MdMoreHoriz, MdFavoriteBorder } from "react-icons/md";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { motion } from "framer-motion";

interface AlbumPageProps {
  albumId?: string;
}

export default function AlbumPage({ albumId = "a1" }: AlbumPageProps) {
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore();
  const { openContextMenu, setActivePage } = useUIStore();

  const album = {
    id: albumId,
    title: "Meteora (20th Anniversary Edition)",
    artist: "Linkin Park",
    artistId: "linkin-park",
    releaseYear: "2003",
    totalTracks: 13,
    totalDuration: "36 min 40 sec",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
    bgGradient: "from-amber-900/60 to-[#121212]",
  };

  const albumTracks: Track[] = [
    {
      id: "yt-alb-1",
      title: "Numb",
      artist: "Linkin Park",
      album: "Meteora",
      duration: 187,
      youtubeId: "kXYiU_JCYtU",
      coverUrl: album.coverUrl,
    },
    {
      id: "yt-alb-2",
      title: "Somewhere I Belong",
      artist: "Linkin Park",
      album: "Meteora",
      duration: 213,
      youtubeId: "eVTXPUF4Oz4",
      coverUrl: album.coverUrl,
    },
    {
      id: "yt-alb-3",
      title: "Faint",
      artist: "Linkin Park",
      album: "Meteora",
      duration: 162,
      youtubeId: "pB-5XG-DbAA",
      coverUrl: album.coverUrl,
    },
    {
      id: "yt-alb-4",
      title: "Breaking the Habit",
      artist: "Linkin Park",
      album: "Meteora",
      duration: 196,
      youtubeId: "AJtDXIazrMo",
      coverUrl: album.coverUrl,
    },
    {
      id: "yt-alb-5",
      title: "From the Inside",
      artist: "Linkin Park",
      album: "Meteora",
      duration: 175,
      youtubeId: "fJ9rUzIMcZQ",
      coverUrl: album.coverUrl,
    },
  ];

  const isAlbumPlaying = currentTrack?.album === "Meteora" && isPlaying;

  return (
    <div className="min-h-full pb-28 text-white">
      {/* ── Header ── */}
      <div className={`p-8 bg-gradient-to-b ${album.bgGradient} flex flex-col sm:flex-row items-end gap-6`}>
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-cover shadow-2xl flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Album</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight my-3 drop-shadow">
            {album.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-300 font-medium flex-wrap">
            <span
              onClick={() => setActivePage("artist", album.artistId)}
              className="font-bold text-white hover:underline cursor-pointer"
            >
              {album.artist}
            </span>
            <span>•</span>
            <span>{album.releaseYear}</span>
            <span>•</span>
            <span>{album.totalTracks} songs, {album.totalDuration}</span>
          </div>
        </div>
      </div>

      {/* ── Action Controls ── */}
      <div className="px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => {
            if (isAlbumPlaying) {
              togglePlay();
            } else {
              play(albumTracks[0], albumTracks);
            }
          }}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        >
          {isAlbumPlaying ? <MdPause size={28} /> : <MdPlayArrow size={32} className="ml-1" />}
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MdFavoriteBorder size={32} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MdMoreHoriz size={28} />
        </button>
      </div>

      {/* ── Tracklist Table ── */}
      <div className="px-8">
        <div className="grid grid-cols-[32px_1fr_120px_60px] gap-4 px-4 py-2 border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Plays</span>
          <span className="flex justify-end"><MdAccessTime size={16} /></span>
        </div>

        <div className="flex flex-col gap-1">
          {albumTracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => play(track, albumTracks)}
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

                <div className="min-w-0">
                  <p className={`font-semibold text-sm truncate ${isPlayingThis ? "text-green-500" : "text-white"}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>

                <div className="text-xs text-gray-400 text-right">
                  {(8540000 - idx * 620000).toLocaleString()}
                </div>

                <div className="text-xs text-gray-400 text-right">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
