import { create } from "zustand";
import { Track } from "./playerStore";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  gradient?: string;
  tracks: Track[];
  createdAt: string;
}

interface LibraryStore {
  playlists: Playlist[];
  likedSongs: Track[];
  recentlyPlayed: Track[];

  // Actions
  createPlaylist: (name: string, description?: string) => string;
  importPlaylist: (data: { name: string; description?: string; coverUrl?: string; tracks: Track[] }) => string;
  deletePlaylist: (id: string) => void;

  renamePlaylist: (id: string, name: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  setLikedSongs: (songs: Track[]) => void;
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  addToRecent: (track: Track) => void;
  reorderPlaylistTracks: (playlistId: string, newTracks: Track[]) => void;
  initClientStorage: () => void;
}

// Initial real playlists with real high-definition album art cover posters
const defaultPlaylists: Playlist[] = [

  {
    id: "pl-liked",
    name: "Liked Songs",
    description: "Your saved tracks",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #450af5, #c4efd9)",
    tracks: [
      {
        id: "yt-1",
        title: "Teri Naar",
        artist: "Nikk",
        album: "Teri Naar - Single",
        duration: 159,
        youtubeId: "vB1o7X-y68A",
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(to bottom, #d4a373, #faedcd)",
      },
      {
        id: "yt-2",
        title: "Spider-Man Brand New Day",
        artist: "Sebastián Galaviz",
        album: "Brand New Day Soundtrack",
        duration: 210,
        youtubeId: "b853m6x-5u8",
        coverUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #b8860b, #5a4000)",
      },
      {
        id: "yt-3",
        title: "Chetpete gaane",
        artist: "Indian Pop Favorites",
        album: "Best of Desi Beats",
        duration: 184,
        youtubeId: "mN2q8_9k-0o",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #6b7280, #1f2937)",
      },
      {
        id: "yt-4",
        title: "Pillowtalk",
        artist: "ZAYN",
        album: "Mind of Mine",
        duration: 203,
        youtubeId: "C_3d6GflJY8",
        coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(to bottom right, #fb923c, #c2410c)",
      },
      {
        id: "yt-5",
        title: "Starboy",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy",
        duration: 230,
        youtubeId: "34Na4j8AVgA",
        coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #450af5, #c4efd9)",
      },
      {
        id: "yt-6",
        title: "Skyfall",
        artist: "Adele",
        album: "Skyfall Soundtrack",
        duration: 286,
        youtubeId: "DeumyOzKqgI",
        coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #0e7490, #0c4a6e)",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pl-zayn",
    name: "ZAYN Mix",
    description: "Best of ZAYN and pop favorites",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom right, #f87171, #b91c1c)",
    tracks: [
      {
        id: "yt-4",
        title: "Pillowtalk",
        artist: "ZAYN",
        album: "Mind of Mine",
        duration: 203,
        youtubeId: "C_3d6GflJY8",
        coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(to bottom right, #fb923c, #c2410c)",
      },
      {
        id: "yt-8",
        title: "Dusk Till Dawn",
        artist: "ZAYN ft. Sia",
        album: "Icarus Falls",
        duration: 239,
        youtubeId: "tt2k8PGm-TI",
        coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #7c3aed, #3b0764)",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pl-top",
    name: "My top tracks playlist",
    description: "Curated by Vaibhav Ghoshi",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom right, #60a5fa, #1d4ed8)",
    tracks: [
      {
        id: "yt-5",
        title: "Starboy",
        artist: "The Weeknd ft. Daft Punk",
        album: "Starboy",
        duration: 230,
        youtubeId: "34Na4j8AVgA",
        coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(135deg, #450af5, #c4efd9)",
      },
      {
        id: "yt-7",
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        duration: 200,
        youtubeId: "4NRXx6U8ABQ",
        coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
        bgGradient: "linear-gradient(to bottom right, #f87171, #b91c1c)",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pl-workout",
    name: "WORKOUT PLAYLIST 2026",
    description: "High energy beats for intense gym sessions",
    coverUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom right, #facc15, #a16207)",
    tracks: [
      {
        id: "yt-101",
        title: "Numb",
        artist: "Linkin Park",
        album: "Meteora",
        duration: 187,
        youtubeId: "kXYiU_JCYtU",
        coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
      },
      {
        id: "yt-102",
        title: "In The End",
        artist: "Linkin Park",
        album: "Hybrid Theory",
        duration: 216,
        youtubeId: "eVTXPUF4Oz4",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pl-stranger",
    name: "Stranger Things Retro Mix",
    description: "Synthwave & 80s nostalgia classics",
    coverUrl: "https://images.unsplash.com/photo-151173511819-9a3f7709049c?w=400&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(to bottom right, #2dd4bf, #0f766e)",
    tracks: [
      {
        id: "yt-rec-5",
        title: "Running Up That Hill",
        artist: "Kate Bush",
        album: "Hounds of Love",
        duration: 298,
        youtubeId: "wp43OdtAAkM",
        coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Helper to ensure playlists and tracks have valid coverUrls
function loadInitialPlaylists(): Playlist[] {
  if (typeof window === "undefined") return defaultPlaylists;
  const stored = localStorage.getItem("sp_playlists");
  if (!stored) return defaultPlaylists;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultPlaylists;
    return parsed.map((p: any) => {
      const pTracks = Array.isArray(p.tracks) ? p.tracks : [];
      const def = defaultPlaylists.find((d) => d.id === p.id);
      return {
        id: p.id || `pl-${Date.now()}`,
        name: p.name || "My Playlist",
        description: p.description || "",
        coverUrl: p.coverUrl || def?.coverUrl || (pTracks.length > 0 ? pTracks[0].coverUrl : undefined),
        gradient: p.gradient || "linear-gradient(135deg, #1ed760, #121212)",
        createdAt: p.createdAt || new Date().toISOString(),
        tracks: pTracks.map((t: any) => {
          const defT = def?.tracks?.find((dt) => dt.id === t.id);
          return {
            id: t.id || `track-${Date.now()}`,
            title: t.title || "Unknown Title",
            artist: t.artist || "Unknown Artist",
            album: t.album || "Unknown Album",
            duration: typeof t.duration === "number" ? t.duration : 180,
            youtubeId: t.youtubeId || "vB1o7X-y68A",
            coverUrl: t.coverUrl || defT?.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
            bgGradient: t.bgGradient || "linear-gradient(135deg, #1e1b4b, #312e81)",
          };
        }),
      };
    });
  } catch (e) {
    console.warn("Corrupted sp_playlists in localStorage, using defaults:", e);
    return defaultPlaylists;
  }
}

function loadInitialLiked(): Track[] {
  if (typeof window === "undefined") return defaultPlaylists[0].tracks;
  const stored = localStorage.getItem("sp_liked");
  if (!stored) return defaultPlaylists[0].tracks;
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultPlaylists[0].tracks;
    return parsed.map((t: any) => {
      const defT = defaultPlaylists[0].tracks.find((dt) => dt.id === t.id);
      return {
        id: t.id || `track-${Date.now()}`,
        title: t.title || "Unknown Title",
        artist: t.artist || "Unknown Artist",
        album: t.album || "Unknown Album",
        duration: typeof t.duration === "number" ? t.duration : 180,
        youtubeId: t.youtubeId || "vB1o7X-y68A",
        coverUrl: t.coverUrl || defT?.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
        bgGradient: t.bgGradient || "linear-gradient(135deg, #1e1b4b, #312e81)",
      };
    });
  } catch (e) {
    return defaultPlaylists[0].tracks;
  }
}


export const useLibraryStore = create<LibraryStore>((set, get) => ({
  playlists: defaultPlaylists,
  likedSongs: defaultPlaylists[0].tracks,
  recentlyPlayed: [],


  createPlaylist: (name: string, description = "") => {
    const newId = `pl-${Date.now()}`;
    const newPl: Playlist = {
      id: newId,
      name,
      description,
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      gradient: `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
      tracks: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newPl, ...get().playlists];
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
    return newId;
  },

  importPlaylist: (data: { name: string; description?: string; coverUrl?: string; tracks: Track[] }) => {
    const newId = `pl-${Date.now()}`;
    const newPl: Playlist = {
      id: newId,
      name: data.name,
      description: data.description || "Imported playlist",
      coverUrl:
        data.coverUrl ||
        (data.tracks[0]?.coverUrl ??
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"),
      gradient: "linear-gradient(135deg, #1ed760, #121212)",
      tracks: data.tracks,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPl, ...get().playlists];
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
    return newId;
  },


  deletePlaylist: (id: string) => {
    const updated = get().playlists.filter((p) => p.id !== id);
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  renamePlaylist: (id: string, name: string) => {
    const updated = get().playlists.map((p) => (p.id === id ? { ...p, name } : p));
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  updatePlaylist: (id: string, updates: Partial<Playlist>) => {
    const updated = get().playlists.map((p) => (p.id === id ? { ...p, ...updates } : p));
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  addToPlaylist: (playlistId: string, track: Track) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        if (p.tracks.some((t) => t.id === track.id)) return p;
        return {
          ...p,
          coverUrl: p.coverUrl || track.coverUrl,
          tracks: [...p.tracks, track],
        };
      }
      return p;
    });
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  removeFromPlaylist: (playlistId: string, trackId: string) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
      }
      return p;
    });
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  setLikedSongs: (songs: Track[]) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map((p) =>
      p.id === "pl-liked" ? { ...p, tracks: songs } : p
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("sp_liked", JSON.stringify(songs));
      localStorage.setItem("sp_playlists", JSON.stringify(updatedPlaylists));
    }
    set({ likedSongs: songs, playlists: updatedPlaylists });
  },

  toggleLike: (track: Track) => {
    const { likedSongs, playlists } = get();
    const exists = likedSongs.some((t) => t.id === track.id);
    const updatedLiked = exists
      ? likedSongs.filter((t) => t.id !== track.id)
      : [track, ...likedSongs];

    const updatedPlaylists = playlists.map((p) =>
      p.id === "pl-liked" ? { ...p, tracks: updatedLiked } : p
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("sp_liked", JSON.stringify(updatedLiked));
      localStorage.setItem("sp_playlists", JSON.stringify(updatedPlaylists));

      // Async sync to Database
      fetch("/api/me/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      }).catch((err) => console.warn("DB like sync skipped:", err));
    }

    set({ likedSongs: updatedLiked, playlists: updatedPlaylists });
  },

  isLiked: (trackId: string) => {
    return get().likedSongs.some((t) => t.id === trackId);
  },

  addToRecent: (track: Track) => {
    const filtered = get().recentlyPlayed.filter((t) => t.id !== track.id);
    const updated = [track, ...filtered].slice(0, 20);
    if (typeof window !== "undefined") localStorage.setItem("sp_recent", JSON.stringify(updated));
    set({ recentlyPlayed: updated });
  },

  reorderPlaylistTracks: (playlistId: string, newTracks: Track[]) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, tracks: newTracks };
      }
      return p;
    });
    if (typeof window !== "undefined") localStorage.setItem("sp_playlists", JSON.stringify(updated));
    set({ playlists: updated });
  },

  initClientStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const storedPl = localStorage.getItem("sp_playlists");
      const storedLiked = localStorage.getItem("sp_liked");
      const storedRecent = localStorage.getItem("sp_recent");

      const parsedPlaylists = storedPl ? loadInitialPlaylists() : defaultPlaylists;
      const parsedLiked = storedLiked ? loadInitialLiked() : defaultPlaylists[0].tracks;
      const parsedRecent = storedRecent ? JSON.parse(storedRecent) : [];

      set({
        playlists: parsedPlaylists,
        likedSongs: parsedLiked,
        recentlyPlayed: parsedRecent,
      });
    } catch (e) {
      console.warn("Storage init skipped:", e);
    }
  },
}));

