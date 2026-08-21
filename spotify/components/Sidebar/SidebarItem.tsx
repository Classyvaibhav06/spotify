"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/store/useUIStore";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  page: "home" | "search" | "library";
  active?: boolean;
  collapsed: boolean;
}

export default function SidebarItem({ icon, label, page, collapsed }: SidebarItemProps) {
  const { activePage, setActivePage } = useUIStore();
  const active = activePage === page;

  return (
    <button
      onClick={() => setActivePage(page)}
      title={collapsed ? label : undefined}
      className="flex items-center gap-4 w-full px-3 py-3 rounded-spx-section transition-all duration-200"
      style={{
        color:      active ? "var(--text-base)" : "var(--text-secondary)",
        background: active ? "var(--bg-elevated)" : "transparent",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = "var(--text-base)";
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && (
        <span className={active ? "type-nav-bold" : "type-nav"}>{label}</span>
      )}
    </button>
  );
}
