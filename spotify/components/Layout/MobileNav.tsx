"use client";

import { useUIStore, Page } from "@/store/useUIStore";
import { MdHome, MdSearch, MdLibraryMusic, MdPerson } from "react-icons/md";

export default function MobileNav() {
  const { activePage, setActivePage } = useUIStore();

  const navItems: { page: Page; label: string; icon: typeof MdHome }[] = [
    { page: "home", label: "Home", icon: MdHome },
    { page: "search", label: "Search", icon: MdSearch },
    { page: "library", label: "Library", icon: MdLibraryMusic },
    { page: "user", label: "Profile", icon: MdPerson },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 text-[11px] font-medium text-gray-400">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive ? "text-[#1ed760]" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={22} className={isActive ? "text-[#1ed760]" : "text-gray-400"} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
