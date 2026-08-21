"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdInfo, MdWarning, MdClose } from "react-icons/md";
import { useUIStore } from "@/store/useUIStore";

export default function ToastNotification() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-[104px] right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#1ed760] text-black font-bold px-4 py-3 rounded-full shadow-2xl min-w-[240px] max-w-sm"
          >
            {toast.type === "info" ? (
              <MdInfo size={20} className="text-black flex-shrink-0" />
            ) : toast.type === "warning" ? (
              <MdWarning size={20} className="text-black flex-shrink-0" />
            ) : (
              <MdCheckCircle size={20} className="text-black flex-shrink-0" />
            )}
            <span className="text-xs flex-1 truncate">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
            >
              <MdClose size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
