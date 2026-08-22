import { Track } from "@/store/playerStore";

// Rich fallback dataset containing popular tracks across categories & artists
const fallbackTracks: Track[] = [
  {
    id: "yt-jb1",
    title: "Peaches ft. Daniel Caesar, Giveon",
    artist: "Justin Bieber",
    album: "Justice",
    duration: 198,
    youtubeId: "tQ0yjYUFKAE",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #f59e0b, #b45309)",
  },
  {
    id: "yt-jb2",
    title: "Stay (with Justin Bieber)",
    artist: "The Kid LAROI & Justin Bieber",
    album: "F*CK LOVE 3",
    duration: 141,
    youtubeId: "kTJczUoc26U",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    id: "yt-jb3",
    title: "Ghost",
    artist: "Justin Bieber",
    album: "Justice",
    duration: 153,
    youtubeId: "Fp8msa5uYsc",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #10b981, #047857)",
  },
  {
    id: "yt-az1",
    title: "Jhoom (R&B Mix)",
    artist: "Ali Zafar",
    album: "Jhoom",
    duration: 254,
    youtubeId: "mN2q8_9k-0o",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #8b5cf6, #5b21b6)",
  },
  {
    id: "yt-az2",
    title: "Psorye",
    artist: "Ali Zafar & Shae Gill",
    album: "Coke Studio",
    duration: 215,
    youtubeId: "vB1o7X-y68A",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #ec4899, #9d174d)",
  },
  {
    id: "yt-101",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    duration: 187,
    youtubeId: "kXYiU_JCYtU",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #b8860b, #5a4000)",
  },
  {
    id: "yt-102",
    title: "In The End",
    artist: "Linkin Park",
    album: "Hybrid Theory",
    duration: 216,
    youtubeId: "eVTXPUF4Oz4",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #6b7280, #1f2937)",
  },
  {
    id: "yt-106",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    duration: 230,
    youtubeId: "34Na4j8AVgA",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #450af5, #c4efd9)",
  },
  {
    id: "yt-107",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 200,
    youtubeId: "4NRXx6U8ABQ",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(to bottom right, #f87171, #b91c1c)",
  },
  {
    id: "yt-108",
    title: "Pillowtalk",
    artist: "ZAYN",
    album: "Mind of Mine",
    duration: 203,
    youtubeId: "C_3d6GflJY8",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(to bottom right, #fb923c, #c2410c)",
  },
  {
    id: "yt-109",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷",
    duration: 233,
    youtubeId: "JGwWNGJdvx8",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(to bottom right, #2dd4bf, #0f766e)",
  },
  {
    id: "yt-110",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 203,
    youtubeId: "TUVcZfQe-Kw",
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(to bottom right, #facc15, #a16207)",
  },
];

// Global in-memory cache with 2-hour TTL for lightning-fast 0ms responses
const SEARCH_CACHE = new Map<string, { tracks: Track[]; expiresAt: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_CACHE_SIZE = 500;

export async function searchYouTubeTracks(query: string): Promise<{ tracks: Track[]; error?: string }> {
  if (!query || !query.trim()) return { tracks: fallbackTracks };

  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, " ");

  // Check in-memory cache for 0ms instantaneous hit
  const cached = SEARCH_CACHE.get(normalizedQuery);
  if (cached && Date.now() < cached.expiresAt) {
    return { tracks: cached.tracks };
  }

  // 1. Try FastAPI InnerTube Backend (Unlimited, Live Data) with 3.5s timeout
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const backendUrl = `${apiBase}/api/search?q=${encodeURIComponent(normalizedQuery)}&limit=20`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(backendUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
        const tracks: Track[] = data.videos.map((item: any) => ({
          id: `yt-${item.video_id}`,
          title: item.title
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, "&")
            .replace(/\(Official Audio\)/gi, "")
            .replace(/\(Audio\)/gi, "")
            .replace(/\(Lyric Video\)/gi, "")
            .replace(/\[Official Audio\]/gi, "")
            .trim(),
          artist: item.author.replace(" - Topic", "").replace("VEVO", "").trim(),
          album: "YouTube Music",
          coverUrl: item.thumbnail || `https://i.ytimg.com/vi/${item.video_id}/hqdefault.jpg`,
          duration: item.duration_seconds || 180,
          youtubeId: item.video_id,
          bgGradient: `linear-gradient(135deg, #1e1b4b, #312e81)`,
        }));

        // Cache result
        if (SEARCH_CACHE.size > MAX_CACHE_SIZE) {
          const oldestKey = SEARCH_CACHE.keys().next().value;
          if (oldestKey) SEARCH_CACHE.delete(oldestKey);
        }
        SEARCH_CACHE.set(normalizedQuery, { tracks, expiresAt: Date.now() + CACHE_TTL_MS });

        return { tracks };
      }
    }
  } catch (err) {
    // Backend offline or timed out, proceed to direct fallback
  }



  // 2. Try YouTube Data API v3 if key exists
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = fallbackTracks.filter((t) => {
      const text = `${t.title} ${t.artist} ${t.album || ""}`.toLowerCase();
      return qTerms.some((term) => text.includes(term));
    });

    return {
      tracks: filtered.length > 0 ? filtered : fallbackTracks,
    };
  }

  try {
    const searchQuery = query.toLowerCase().includes("audio") ? query : `${query} audio`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(
      searchQuery
    )}&key=${apiKey.trim()}`;

    const res = await fetch(url);

    if (!res.ok) {
      const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const filtered = fallbackTracks.filter((t) => {
        const text = `${t.title} ${t.artist} ${t.album || ""}`.toLowerCase();
        return qTerms.some((term) => text.includes(term));
      });

      return {
        tracks: filtered.length > 0 ? filtered : fallbackTracks,
      };
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return { tracks: fallbackTracks };
    }

    const tracks = data.items
      .filter((item: any) => item.id && item.id.videoId)
      .map((item: any) => ({
        id: `yt-${item.id.videoId}`,
        title: item.snippet.title
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/\(Official Audio\)/gi, "")
          .replace(/\(Audio\)/gi, "")
          .replace(/\(Lyric Video\)/gi, "")
          .replace(/\[Official Audio\]/gi, "")
          .trim(),
        artist: item.snippet.channelTitle.replace(" - Topic", "").replace("VEVO", ""),
        album: "YouTube Music",
        coverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: 180,
        youtubeId: item.id.videoId,
        bgGradient: `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)}, #${Math.floor(Math.random() * 16777215).toString(16)})`,
      }));

    return { tracks: tracks.length > 0 ? tracks : fallbackTracks };
  } catch (error: any) {
    console.warn("YouTube API search error:", error);
  }

  // 3. Try Direct YouTube Web Search (Zero API Key needed, 100% live coverage)
  try {

    const searchQuery = query.toLowerCase().includes("audio") ? query : `${query} audio`;
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    const ytRes = await fetch(ytUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (ytRes.ok) {
      const html = await ytRes.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const items =
          data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const liveTracks: Track[] = [];
        for (const item of items) {
          const v = item.videoRenderer;
          if (v && v.videoId) {
            const rawTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || "YouTube Track";
            const rawArtist =
              v.ownerText?.runs?.[0]?.text ||
              v.shortBylineText?.runs?.[0]?.text ||
              "Artist";
            const thumb =
              v.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
              `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
            const durationSec = parseInt(v.lengthSeconds || "180", 10);

            liveTracks.push({
              id: `yt-${v.videoId}`,
              title: rawTitle
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, "&")
                .replace(/\(Official Audio\)/gi, "")
                .replace(/\(Audio\)/gi, "")
                .replace(/\(Lyric Video\)/gi, "")
                .replace(/\[Official Audio\]/gi, "")
                .trim(),
              artist: rawArtist.replace(" - Topic", "").replace("VEVO", "").trim(),
              album: "YouTube Music",
              coverUrl: thumb,
              duration: isNaN(durationSec) ? 180 : durationSec,
              youtubeId: v.videoId,
              bgGradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
            });

            if (liveTracks.length >= 10) break;
          }
        }

        if (liveTracks.length > 0) {
          if (SEARCH_CACHE.size > MAX_CACHE_SIZE) {
            const oldestKey = SEARCH_CACHE.keys().next().value;
            if (oldestKey) SEARCH_CACHE.delete(oldestKey);
          }
          SEARCH_CACHE.set(normalizedQuery, { tracks: liveTracks, expiresAt: Date.now() + CACHE_TTL_MS });
          return { tracks: liveTracks };
        }

      }
    }
  } catch (directErr) {
    console.warn("Direct YouTube search fallback error:", directErr);
  }

  // 4. Final Fallback Dataset
  const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = fallbackTracks.filter((t) => {
    const text = `${t.title} ${t.artist} ${t.album || ""}`.toLowerCase();
    return qTerms.some((term) => text.includes(term));
  });
  return {
    tracks: filtered.length > 0 ? filtered : fallbackTracks,
  };
}

