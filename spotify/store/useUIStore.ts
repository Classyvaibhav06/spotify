import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type?: "info" | "success" | "warning";
}

export type Page = "home" | "search" | "library" | "playlist" | "artist" | "album" | "user";

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  trackId?: string;
  artistId?: string;
  albumId?: string;
  playlistId?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
}

interface UIState {
  activePage: Page;
  activePlaylistId: string | null;
  activeArtistId: string | null;
  activeAlbumId: string | null;
  activeUserId: string | null;
  sidebarCollapsed: boolean;
  showFullPlayer: boolean;
  queueOpen: boolean;
  lyricsOpen: boolean;
  shortcutsOpen: boolean;
  createPlaylistModalOpen: boolean;
  importPlaylistModalOpen: boolean;
  connectDeviceOpen: boolean;
  equalizerOpen: boolean;
  editPlaylistOpen: boolean;
  rightPanelOpen: boolean;
  posterFit: "contain" | "cover" | "fill";
  searchQuery: string;
  toasts: Toast[];
  contextMenu: ContextMenuState;

  // Actions
  setActivePage: (page: Page, entityId?: string) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setPosterFit: (fit: "contain" | "cover" | "fill") => void;
  setShowFullPlayer: (val: boolean) => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  toggleShortcuts: () => void;
  setCreatePlaylistModalOpen: (open: boolean) => void;
  setImportPlaylistModalOpen: (open: boolean) => void;
  setConnectDeviceOpen: (open: boolean) => void;

  setEqualizerOpen: (open: boolean) => void;
  setEditPlaylistOpen: (open: boolean) => void;
  openContextMenu: (data: Omit<ContextMenuState, "isOpen">) => void;
  closeContextMenu: () => void;
  setSearchQuery: (query: string) => void;
  addToast: (message: string, type?: "info" | "success" | "warning") => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: "home",
  activePlaylistId: null,
  activeArtistId: null,
  activeAlbumId: null,
  activeUserId: null,
  sidebarCollapsed: false,
  showFullPlayer: false,
  queueOpen: false,
  lyricsOpen: false,
  shortcutsOpen: false,
  createPlaylistModalOpen: false,
  importPlaylistModalOpen: false,
  connectDeviceOpen: false,
  equalizerOpen: false,
  editPlaylistOpen: false,
  rightPanelOpen: true,
  posterFit: "contain",
  searchQuery: "",
  toasts: [],
  contextMenu: { isOpen: false, x: 0, y: 0 },

  setActivePage: (page, entityId) =>
    set({
      activePage: page,
      activePlaylistId: page === "playlist" ? (entityId ?? null) : null,
      activeArtistId: page === "artist" ? (entityId ?? null) : null,
      activeAlbumId: page === "album" ? (entityId ?? null) : null,
      activeUserId: page === "user" ? (entityId ?? null) : null,
    }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setPosterFit: (fit) => set({ posterFit: fit }),
  setShowFullPlayer: (val) => set({ showFullPlayer: val }),
  toggleQueue: () => set((s) => ({ queueOpen: !s.queueOpen })),
  toggleLyrics: () => set((s) => ({ lyricsOpen: !s.lyricsOpen })),
  toggleShortcuts: () => set((s) => ({ shortcutsOpen: !s.shortcutsOpen })),
  setCreatePlaylistModalOpen: (open) => set({ createPlaylistModalOpen: open }),
  setImportPlaylistModalOpen: (open) => set({ importPlaylistModalOpen: open }),
  setConnectDeviceOpen: (open) => set({ connectDeviceOpen: open }),

  setEqualizerOpen: (open) => set({ equalizerOpen: open }),
  setEditPlaylistOpen: (open) => set({ editPlaylistOpen: open }),
  openContextMenu: (data) => set({ contextMenu: { ...data, isOpen: true } }),
  closeContextMenu: () => set((s) => ({ contextMenu: { ...s.contextMenu, isOpen: false } })),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addToast: (message, type = "success") => {
    const id = `toast-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

