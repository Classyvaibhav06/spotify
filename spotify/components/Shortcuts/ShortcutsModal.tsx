"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdKeyboard } from "react-icons/md";
import { useUIStore } from "@/store/useUIStore";

const shortcuts = [
  { key: "Space", description: "Play / Pause" },
  { key: "N", description: "Next track" },
  { key: "P", description: "Previous track" },
  { key: "S", description: "Toggle shuffle mode" },
  { key: "R", description: "Cycle repeat mode (Off / All / One)" },
  { key: "M", description: "Mute / Unmute audio" },
  { key: "← / →", description: "Seek 5s backward / forward" },
  { key: "↑ / ↓", description: "Volume up / down" },
  { key: "Ctrl + L", description: "Focus search bar" },
  { key: "?", description: "Toggle keyboard shortcuts cheat-sheet" },
];

export default function ShortcutsModal() {
  const { shortcutsOpen, toggleShortcuts } = useUIStore();

  return (
    <AnimatePresence>
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={toggleShortcuts}
            className="fixed inset-0 bg-black"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-[#181818] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl z-10 text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a] mb-6">
              <div className="flex items-center gap-3">
                <MdKeyboard size={24} className="text-[#1ed760]" />
                <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={toggleShortcuts}
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#252525]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto hide-scrollbar pr-1">
              {shortcuts.map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]"
                >
                  <span className="text-sm font-semibold text-[#b3b3b3]">{sc.description}</span>
                  <kbd className="px-3 py-1 bg-[#252525] border border-[#4d4d4d] text-[#1ed760] font-mono font-bold text-xs rounded shadow">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
