"use client";

import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/useUIStore";
import { MdPlayArrow, MdPause, MdFavorite } from "react-icons/md";

export default function MobileMiniPlayer() {
  const { currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { setShowFullPlayer } = useUIStore();

  if (!currentTrack) return null;

  return (
    <div
      onClick={() => setShowFullPlayer(true)}
      className="md:hidden fixed bottom-14 inset-x-2 z-40 bg-[#282828] text-white rounded-xl p-2 flex items-center justify-between shadow-2xl border border-gray-700 cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-green-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
            ♪
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-xs truncate">{currentTrack.title}</p>
          <p className="text-[10px] text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"
        >
          {isPlaying ? <MdPause size={20} /> : <MdPlayArrow size={20} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
