"use client";

import { usePlayerStore } from "@/store/playerStore";
import { useLibraryStore } from "@/store/libraryStore";
import { useUIStore } from "@/store/useUIStore";
import { useState } from "react";
import {
  MdClose,
  MdMoreHoriz,
  MdFavorite,
  MdShare,
  MdAdd,
  MdPlayArrow,
  MdCheck,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function RightSidebar() {
  const { currentTrack, queue, play } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { rightPanelOpen, toggleRightPanel, addToast, setActivePage } = useUIStore();
  const [isFollowing, setIsFollowing] = useState(false);

  if (!rightPanelOpen) return null;

  // Fallback track if none is playing yet
  const track = currentTrack || {
    id: "yt-1",
    title: "Teri Naar",
    artist: "Nikk",
    album: "Teri Naar - Single",
    duration: 159,
    youtubeId: "vB1o7X-y68A",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(to bottom, #d4a373, #faedcd)",
  };

  const nextTrack = queue.length > 0 ? queue[0] : null;
  const isLikedTrack = isLiked(track.id);

  return (
    <AnimatePresence>
      <aside className="w-[320px] flex-shrink-0 bg-[#121212] rounded-xl overflow-hidden hidden xl:flex flex-col border border-[#2a2a2a]/60 shadow-xl">
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2a2a2a]/40 bg-[#181818]/60 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-extrabold text-white truncate max-w-[190px]">
              {track.album || track.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => addToast(`Options for "${track.title}"`, "info")}
              className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="More options"
            >
              <MdMoreHoriz size={20} />
            </button>
            <button
              onClick={toggleRightPanel}
              className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Close panel"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Content ── */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-6">
          {/* ── 1. Hero Artwork Poster Card ── */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#181818] group">
            <img
              src={track.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"}
              alt={track.title}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
              <h2 className="text-xl font-black text-white leading-tight drop-shadow-md truncate">
                {track.title}
              </h2>
              <p
                onClick={() => setActivePage("artist")}
                className="text-sm font-semibold text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors mt-0.5"
              >
                {track.artist}
              </p>

              {/* Quick Actions Bar inside Poster */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      addToast("Track link copied to clipboard!", "info");
                    }
                  }}
                  className="p-2 text-gray-300 hover:text-white rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all"
                  title="Share track"
                >
                  <MdShare size={18} />
                </button>

                <button
                  onClick={() => {
                    toggleLike(track);
                    addToast(isLikedTrack ? "Removed from Liked Songs" : "Added to Liked Songs", "success");
                  }}
                  className="p-2.5 rounded-full bg-green-500 hover:bg-green-400 text-black shadow-lg hover:scale-105 transition-transform"
                  title="Save to Liked Songs"
                >
                  <MdFavorite size={20} className={isLikedTrack ? "fill-black" : "fill-white"} />
                </button>
              </div>
            </div>
          </div>

          {/* ── 2. About The Artist Card ── */}
          <div className="bg-[#181818] rounded-2xl p-4 border border-[#2a2a2a]/60 shadow-lg space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              About the artist
            </span>

            <div
              onClick={() => setActivePage("artist")}
              className="relative h-40 rounded-xl overflow-hidden cursor-pointer group shadow-md"
            >
              <img
                src={track.coverUrl || "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80"}
                alt={track.artist}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                <h3 className="font-extrabold text-lg text-white group-hover:underline">
                  {track.artist}
                </h3>
                <p className="text-xs text-gray-300 font-medium">1,245,890 monthly listeners</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
              {track.artist} is a popular artist with romantic chart-topping releases. Known for blending modern pop rhythms with soulful vocal production.
            </p>

            <button
              onClick={() => {
                setIsFollowing(!isFollowing);
                addToast(isFollowing ? `Unfollowed ${track.artist}` : `Following ${track.artist}`, "info");
              }}
              className={`w-full py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isFollowing
                  ? "border border-green-500 text-green-500 hover:border-red-500 hover:text-red-500"
                  : "bg-white text-black hover:scale-[1.02]"
              }`}
            >
              {isFollowing ? (
                <>
                  <MdCheck size={16} /> Following
                </>
              ) : (
                <>
                  <MdAdd size={16} /> Follow
                </>
              )}
            </button>
          </div>

          {/* ── 3. Credits Section ── */}
          <div className="bg-[#181818] rounded-2xl p-4 border border-[#2a2a2a]/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Credits
              </span>
              <span
                onClick={() => setActivePage("artist")}
                className="text-xs font-bold text-gray-400 hover:text-white hover:underline cursor-pointer"
              >
                Show all
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-800">
                <span className="font-semibold text-white">{track.artist}</span>
                <span className="text-gray-400">Main Artist</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-800">
                <span className="font-semibold text-white">{track.artist} & Team</span>
                <span className="text-gray-400">Writer, Composer</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-white">YouTube Music Audio</span>
                <span className="text-gray-400">Producer</span>
              </div>
            </div>
          </div>

          {/* ── 4. Next Up In Queue Preview ── */}
          {nextTrack && (
            <div className="bg-[#181818] rounded-2xl p-4 border border-[#2a2a2a]/60 shadow-lg space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Next in queue
              </span>

              <div
                onClick={() => play(nextTrack, queue)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {nextTrack.coverUrl ? (
                    <img
                      src={nextTrack.coverUrl}
                      alt={nextTrack.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0 shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-green-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ♪
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate group-hover:text-green-400 transition-colors">
                      {nextTrack.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{nextTrack.artist}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <MdPlayArrow size={20} className="ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </AnimatePresence>
  );
}
