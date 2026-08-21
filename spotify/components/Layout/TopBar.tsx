"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import { MdLogin, MdLogout, MdPerson, MdSettings } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useUIStore } from "@/store/useUIStore";

export default function TopBar() {
  const { data: session, status } = useSession();
  const setActivePage = useUIStore((s) => s.setActivePage);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navBtnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.7)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-base)",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-30">
      {/* Back / Forward Controls */}
      <div className="flex items-center gap-2">
        <button
          style={navBtnStyle}
          onClick={() => setActivePage("home")}
          title="Go to Home"
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          <HiChevronLeft size={20} />
        </button>
        <button
          style={navBtnStyle}
          onClick={() => setActivePage("search")}
          title="Search"
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          <HiChevronRight size={20} />
        </button>
      </div>

      {/* User profile / Authentication button */}
      <div className="relative" ref={menuRef}>
        {status === "authenticated" && session?.user ? (
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] bg-black/70 hover:bg-black/90 rounded-full py-1 px-3 border border-white/10"
          >
            {/* Avatar */}
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
            ) : (
              <span className="w-7 h-7 rounded-full bg-emerald-600 font-bold text-xs flex items-center justify-center text-white">
                {userInitial}
              </span>
            )}
            <span className="text-sm font-semibold text-white max-w-[120px] truncate">
              {userName}
            </span>
            <HiChevronRight
              size={14}
              className={`text-gray-300 transition-transform duration-200 ${menuOpen ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            <MdLogin size={18} />
            <span>Log in</span>
          </button>
        )}

        {/* Dynamic Dropdown menu */}
        <AnimatePresence>
          {menuOpen && status === "authenticated" && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#282828] border border-white/10 shadow-2xl p-1.5 z-50 text-white"
            >
              {/* User summary header */}
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs text-gray-400 font-medium truncate">Signed in as</p>
                <p className="text-sm font-bold truncate text-white">{session?.user?.email}</p>
              </div>

              {/* Profile navigation */}
              <button
                onClick={() => {
                  setActivePage("user");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                <MdPerson size={18} className="text-gray-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setActivePage("library");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                <MdSettings size={18} className="text-gray-400" />
                <span>Your Library</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* Logout */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-semibold text-red-400 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MdLogout size={18} />
                <span>Log out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
