"use client";

import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { useLibraryStore } from "@/store/libraryStore";
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder } from "react-icons/md";

export default function MobileMiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, currentTime, duration } = usePlayerStore();
  const { setShowFullPlayer } = useUIStore();
  const { toggleLike, isLiked } = useLibraryStore();

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setShowFullPlayer(true)}
      className="md:hidden fixed bottom-[60px] inset-x-2 z-40 bg-[#242424]/95 backdrop-blur-xl text-white rounded-xl p-2.5 flex items-center justify-between shadow-2xl border border-white/10 cursor-pointer overflow-hidden transition-all active:scale-[0.99]"
    >
      {/* Mini Progress Bar Line on Bottom of Card */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10">
        <div
          className="h-full bg-[#1ed760] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-md"
          />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-[#1ed760] text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-xs text-white truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentTrack);
          }}
          className={`p-1 transition-transform active:scale-125 ${
            liked ? "text-[#1ed760]" : "text-gray-400 hover:text-white"
          }`}
        >
          {liked ? <MdFavorite size={22} /> : <MdFavoriteBorder size={22} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          {isPlaying ? <MdPause size={22} /> : <MdPlayArrow size={22} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
