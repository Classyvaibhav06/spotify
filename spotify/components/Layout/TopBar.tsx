"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { label: "Account" },
  { label: "Profile" },
  { label: "Private Session" },
  { label: "Settings" },
  { label: "Log out" },
];

export default function TopBar() {
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

  return (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
      {/* Back / Forward */}
      <div className="flex items-center gap-2">
        <button
          style={navBtnStyle}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          <HiChevronLeft size={20} />
        </button>
        <button
          style={navBtnStyle}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          <HiChevronRight size={20} />
        </button>
      </div>

      {/* User profile button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-2 transition-colors duration-200"
          style={{
            background: "rgba(0,0,0,0.7)",
            borderRadius: "9999px",
            padding: "4px 12px 4px 4px",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
        >
          {/* Avatar circle */}
          <span
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#535353",
            }}
          >
            <FaUser size={12} style={{ color: "var(--text-secondary)" }} />
          </span>
          <span
            className="type-btn"
            style={{ color: "var(--text-base)", letterSpacing: "0.14px" }}
          >
            User
          </span>
          <HiChevronRight
            size={14}
            style={{
              color: "var(--text-base)",
              transform: menuOpen ? "rotate(90deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              exit={   { opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 overflow-hidden"
              style={{
                background:   "var(--bg-card)",
                borderRadius: "6px",
                boxShadow:    "var(--shadow-heavy)",
                minWidth:     200,
                zIndex:       999,
                padding:      "4px 0",
              }}
            >
              {menuItems.map((item, i) => (
                <>
                  <button
                    key={item.label}
                    className="block w-full text-left px-4 py-3 type-caption transition-colors duration-150"
                    style={{ color: "var(--text-base)", background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {item.label}
                  </button>
                  {/* Separator before Log out */}
                  {i === menuItems.length - 2 && (
                    <div style={{ height: 1, background: "#2a2a2a", margin: "4px 0" }} />
                  )}
                </>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
