// lib/mockData.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  coverUrl: string;
  youtubeId?: string;
  bgGradient?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  owner: string;
}

export interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  badge?: string;
  gradient?: string;
  tracks?: Track[];
}

export interface SectionData {
  id: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  items: CardItem[];
}

// Quick Access Grid Items (Top 8 matching Spotify screenshot)
export const quickGridItems: CardItem[] = [
  {
    id: "q-liked",
    title: "Liked Songs",
    subtitle: "Playlist • 145 songs",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #450af5, #c4efd9)",
  },
  {
    id: "q-spiderman",
    title: "Spider-Man Brand New Day Soundtrack",
    subtitle: "Playlist",
    coverUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #b8860b, #5a4000)",
  },
  {
    id: "q-phonk",
    title: "Instagram Reels Trending Phonks of 2026",
    subtitle: "Playlist",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #9333ea, #3b0764)",
  },
  {
    id: "q-chatpate",
    title: "Chatpate gaane 💖",
    subtitle: "Playlist",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #ec4899, #831843)",
  },
  {
    id: "q-egomode",
    title: "EGO MODE 💀 Scroll to latest 🗿",
    subtitle: "Playlist",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #111827, #374151)",
  },
  {
    id: "q-fredagain",
    title: "Fred again..",
    subtitle: "Artist",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #059669, #064e3b)",
  },
  {
    id: "q-cas",
    title: "Cigarettes After Sex",
    subtitle: "Artist",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #1f2937, #111827)",
  },
  {
    id: "q-strangerthings",
    title: "all stranger things songs :)",
    subtitle: "Playlist",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80",
    gradient: "linear-gradient(135deg, #dc2626, #7f1d1d)",
  },
];

// Recommended Stations
export const recommendedStations: CardItem[] = [
  {
    id: "st-1",
    title: "Barsaat Radio",
    subtitle: "With Banjaare, Harsh Nussi, Lost Stories and more",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    badge: "RADIO",
    gradient: "linear-gradient(135deg, #60a5fa, #1d4ed8)",
  },
  {
    id: "st-2",
    title: "Justin Bieber Radio",
    subtitle: "With One Direction, Bruno Mars, Ed Sheeran and more",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    badge: "RADIO",
    gradient: "linear-gradient(135deg, #34d399, #047857)",
  },
  {
    id: "st-3",
    title: "Rahat Fateh Ali Khan",
    subtitle: "With Shankar-Ehsaan-Loy, Pritam, Salim-Sulaiman",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    badge: "RADIO",
    gradient: "linear-gradient(135deg, #f87171, #b91c1c)",
  },
  {
    id: "st-4",
    title: "Atif Aslam Radio",
    subtitle: "With Sachin-Jigar, Sachet Tandon, Pritam and more",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    badge: "RADIO",
    gradient: "linear-gradient(135deg, #4ade80, #15803d)",
  },
  {
    id: "st-5",
    title: "Cigarettes After Sex Radio",
    subtitle: "With Mac DeMarco, Mitski, Strawberry Guy",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    badge: "RADIO",
    gradient: "linear-gradient(135deg, #94a3b8, #334155)",
  },
];

// Recommended For Today
export const recommendedForToday: CardItem[] = [
  {
    id: "rec-1",
    title: "Aarzu",
    subtitle: "Noor, Khan, Madhurxo",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-2",
    title: "LAAVAN",
    subtitle: "Jasmine Sandlas, Mofusion",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-3",
    title: "Zulfein",
    subtitle: "Mehul Mahesh, Dj AYnik",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-4",
    title: "Arz Kiya Hai | Coke Studio Bharat",
    subtitle: "Anuv Jain",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rec-5",
    title: "Rabbi",
    subtitle: "Rabbi Shergill",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
  },
];

// More Like Aparshakti Khurana
export const aparshaktiMoreLike: CardItem[] = [
  {
    id: "apar-1",
    title: "Suniyan Suniyan",
    subtitle: "Juss, MixSingh",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "apar-2",
    title: "Dil Tu Jaan Tu",
    subtitle: "Gurnazar, Chet Singh",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "apar-3",
    title: "Tere Bina Na Guzara E",
    subtitle: "Josh Brar",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "apar-4",
    title: "Trending Now India",
    subtitle: "Every track you're listening to right now",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "apar-5",
    title: "Pyaar, Ishq aur.. I-Pop Mohabbat 💖",
    subtitle: "I-Pop Mohabbat Hits",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
  },
];

// Albums Featuring Songs You Like
export const albumsFeaturingYouLike: CardItem[] = [
  {
    id: "alb-1",
    title: "REVOLVER",
    subtitle: "The Beatles",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "alb-2",
    title: "CURRENTS",
    subtitle: "Tame Impala",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "alb-3",
    title: "JHOOM",
    subtitle: "Ali Zafar",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "alb-4",
    title: "No Dogs Allowed",
    subtitle: "Sidney Gish",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "alb-5",
    title: "Dil-Fenk Ke Maranga 2",
    subtitle: "Wolf & Cryman",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
  },
];

// Made For User
export const madeForUserItems: CardItem[] = [
  {
    id: "mf-1",
    title: "DISCOVER WEEKLY",
    subtitle: "Your shortcut to hidden gems, deep cuts & fresh tracks",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    badge: "DISCOVER",
  },
  {
    id: "mf-2",
    title: "Daily Mix 01",
    subtitle: "Pritam, A.R. Rahman, Shankar Mahadevan and more",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    badge: "Daily Mix 01",
  },
  {
    id: "mf-3",
    title: "Daily Mix 02",
    subtitle: "The Beatles, TOTO, Queen and more",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    badge: "Daily Mix 02",
  },
  {
    id: "mf-4",
    title: "Daily Mix 03",
    subtitle: "Kickss, Repsaj, DJ KOALA6 and more",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    badge: "Daily Mix 03",
  },
  {
    id: "mf-5",
    title: "Daily Mix 04",
    subtitle: "Kushagra, Shreya Ghoshal, Anuv Jain and more",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    badge: "Daily Mix 04",
  },
];

// More Of What You Like
export const moreOfWhatYouLike: CardItem[] = [
  {
    id: "mow-1",
    title: "Made in India",
    subtitle: "Global Hits from India's finest artists",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "mow-2",
    title: "Trending Now India",
    subtitle: "The tracks everyone is playing",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "mow-3",
    title: "#GRWM Hindi",
    subtitle: "Get Ready With Me Punjabi & Hindi hits",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "mow-4",
    title: "Old is Gold",
    subtitle: "Timeless classic melodies",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "mow-5",
    title: "Chai & Classics",
    subtitle: "Unwind with gentle classic acoustic beats",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
  },
];

// Legacy Compatibility Exports
export const mockTracks: Track[] = [
  { id: "1", title: "Teri Naar", artist: "Nikk", album: "Teri Naar - Single", duration: 159, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80" },
  { id: "2", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: 200, coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80" },
  { id: "3", title: "Pillowtalk", artist: "ZAYN", album: "Mind of Mine", duration: 203, coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80" },
  { id: "4", title: "Skyfall", artist: "Adele", album: "Skyfall", duration: 286, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80" },
];

export const mockPlaylists: Playlist[] = [
  {
    id: "p1",
    name: "Today's Top Hits",
    description: "Hottest 50 tracks on repeat!",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    owner: "Spotify",
    tracks: mockTracks,
  },
  {
    id: "p2",
    name: "Discover Weekly",
    description: "Your weekly custom mix",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    owner: "Spotify",
    tracks: mockTracks,
  },
];

export const recentlyPlayed = mockPlaylists;
export const madeForYou = mockPlaylists;
export const topMixes = mockPlaylists;
export const popularPlaylists = mockPlaylists;
export const userPlaylists = [
  { id: "u1", name: "Liked Songs", tracks: 145 },
  { id: "u2", name: "Spider-Man Brand New Day", tracks: 24 },
  { id: "u3", name: "Instagram Reels Phonks", tracks: 50 },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
