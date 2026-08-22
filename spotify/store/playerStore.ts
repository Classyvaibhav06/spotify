import { create } from "zustand";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  duration: number; // in seconds
  youtubeId?: string;
  bgGradient?: string;
}

export type RepeatMode = "off" | "all" | "one";

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number; // in seconds
  currentTime: number; // alias for progress
  duration: number;
  shuffleMode: boolean;
  isShuffle: boolean; // alias for shuffleMode
  repeatMode: RepeatMode;
  isLiked: boolean;

  // Actions
  play: (track?: Track, newQueue?: Track[]) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void; // alias for previous
  previous: () => void;
  seek: (time: number) => void;
  setProgress: (prog: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (newQueue: Track[]) => void;
}

export const defaultInitialTrack: Track = {
  id: "yt-1",
  title: "Teri Naar",
  artist: "Nikk",
  album: "Teri Naar - Single",
  duration: 159,
  youtubeId: "vB1o7X-y68A",
  coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
  bgGradient: "linear-gradient(to bottom, #d4a373, #faedcd)",
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: defaultInitialTrack,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 70,
  progress: 61,
  currentTime: 61,
  duration: 159,
  shuffleMode: false,
  isShuffle: false,
  repeatMode: "off",
  isLiked: true,

  play: (track, newQueue) => {
    const state = get();
    const targetTrack = track ?? state.currentTrack ?? defaultInitialTrack;
    
    const updatedHistory = state.currentTrack && state.currentTrack.id !== targetTrack.id
      ? [state.currentTrack, ...state.history.slice(0, 19)]
      : state.history;

    let updatedQueue: Track[] = state.queue;
    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      const idx = newQueue.findIndex((t) => t.id === targetTrack.id);
      if (idx !== -1) {
        // Circular sequence: next song in playlist plays immediately next
        const after = newQueue.slice(idx + 1);
        const before = newQueue.slice(0, idx);
        const ordered = [...after, ...before];
        
        updatedQueue = state.shuffleMode
          ? [...ordered].sort(() => Math.random() - 0.5)
          : ordered;
      } else {
        updatedQueue = newQueue.filter((t) => t.id !== targetTrack.id);
      }
    }

    set({
      currentTrack: targetTrack,
      queue: updatedQueue,
      history: updatedHistory,
      isPlaying: true,
      duration: targetTrack.duration || 180,
      progress: 0,
      currentTime: 0,
    });
  },


  pause: () => set({ isPlaying: false }),

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: !isPlaying });
  },

  next: () => {
    const { queue, history, currentTrack, repeatMode, shuffleMode } = get();
    if (repeatMode === "one" && currentTrack) {
      set({ progress: 0, currentTime: 0, isPlaying: true });
      return;
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (shuffleMode && queue.length > 1) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextTrack = queue[nextIndex];
      const remainingQueue = queue.filter((_, idx) => idx !== nextIndex);
      const newHistory = currentTrack ? [currentTrack, ...history] : history;

      set({
        currentTrack: nextTrack,
        queue: remainingQueue,
        history: newHistory,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
        duration: nextTrack.duration || 180,
      });
    } else {
      if (repeatMode === "all" && history.length > 0) {
        const loopTrack = history[history.length - 1];
        set({ currentTrack: loopTrack, isPlaying: true, progress: 0, currentTime: 0 });
      } else {
        set({ isPlaying: false, progress: 0, currentTime: 0 });
      }
    }
  },

  previous: () => {
    const { history, currentTrack, progress } = get();
    if (progress > 3 && currentTrack) {
      set({ progress: 0, currentTime: 0 });
      return;
    }

    if (history.length > 0) {
      const prevTrack = history[0];
      const remainingHistory = history.slice(1);
      set({
        currentTrack: prevTrack,
        history: remainingHistory,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
        duration: prevTrack.duration || 180,
      });
    } else {
      set({ progress: 0, currentTime: 0 });
    }
  },

  prev: () => get().previous(),

  seek: (time: number) => set({ progress: time, currentTime: time }),

  setProgress: (prog: number) => set({ progress: prog, currentTime: prog }),

  setCurrentTime: (time: number) => set({ progress: time, currentTime: time }),

  setDuration: (dur: number) => set({ duration: dur }),

  setVolume: (vol: number) => {
    if (typeof window !== "undefined") localStorage.setItem("sp_vol", String(vol));
    set({ volume: vol });
  },

  toggleShuffle: () => {
    const { shuffleMode, queue } = get();
    const newShuffle = !shuffleMode;
    let newQueue = [...queue];
    if (newShuffle && newQueue.length > 1) {
      newQueue = newQueue.sort(() => Math.random() - 0.5);
    }
    set({ shuffleMode: newShuffle, isShuffle: newShuffle, queue: newQueue });
  },


  cycleRepeat: () => {
    const modes: RepeatMode[] = ["off", "all", "one"];
    const current = get().repeatMode;
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    set({ repeatMode: modes[nextIdx] });
  },

  toggleLike: () => set((s) => ({ isLiked: !s.isLiked })),

  addToQueue: (track: Track) => {
    set((s) => ({ queue: [...s.queue, track] }));
  },

  removeFromQueue: (index: number) => {
    set((s) => ({ queue: s.queue.filter((_, i) => i !== index) }));
  },

  clearQueue: () => set({ queue: [] }),

  reorderQueue: (newQueue: Track[]) => set({ queue: newQueue }),
}));
