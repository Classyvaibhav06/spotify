"use client";

import { useUIStore, Page } from "@/store/useUIStore";
import { MdHome, MdSearch, MdLibraryMusic, MdStar } from "react-icons/md";

export default function MobileNav() {
  const { activePage, setActivePage } = useUIStore();

  const navItems: { page: Page; label: string; icon: typeof MdHome }[] = [
    { page: "home", label: "Home", icon: MdHome },
    { page: "search", label: "Search", icon: MdSearch },
    { page: "library", label: "Your Library", icon: MdLibraryMusic },
    { page: "user", label: "Premium", icon: MdStar },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-gray-800 flex items-center justify-around py-2 px-4 text-xs font-semibold text-gray-400">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => setActivePage(item.page)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-white" : "hover:text-gray-200"
            }`}
          >
            <Icon size={24} className={isActive ? "text-white" : "text-gray-400"} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
