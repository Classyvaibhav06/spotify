import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeTracks } from "@/lib/youtube";
import { Track } from "@/store/playerStore";

interface ImportedTrackDraft {
  title: string;
  artist: string;
  duration?: number;
  coverUrl?: string;
  youtubeId?: string;
}

// Extract YouTube Playlist ID
function getYouTubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("list")) {
      return parsed.searchParams.get("list");
    }
    // Match /playlist?list=...
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
}

// Extract Spotify Playlist ID
function getSpotifyPlaylistId(url: string): { type: "playlist" | "album" | "track"; id: string } | null {
  const playlistMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) return { type: "playlist", id: playlistMatch[1] };

  const albumMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?album\/([a-zA-Z0-9]+)/);
  if (albumMatch) return { type: "album", id: albumMatch[1] };

  const trackMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/);
  if (trackMatch) return { type: "track", id: trackMatch[1] };

  return null;
}

// Parse YouTube Playlist HTML / InitialData
async function fetchYouTubePlaylist(listId: string): Promise<{
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
}> {
  const url = `https://www.youtube.com/playlist?list=${listId}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch YouTube playlist page");
  }

  const html = await res.text();
  const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);

  if (!jsonMatch) {
    throw new Error("Could not parse YouTube playlist structure");
  }

  const data = JSON.parse(jsonMatch[1]);
  const header =
    data?.header?.playlistHeaderRenderer ||
    data?.metadata?.playlistMetadataRenderer ||
    {};

  const name =
    header?.title?.simpleText ||
    header?.title?.runs?.[0]?.text ||
    data?.microformat?.microformatDataRenderer?.title ||
    "Imported YouTube Playlist";

  const description =
    header?.description?.simpleText ||
    header?.description?.runs?.[0]?.text ||
    "Imported from YouTube";

  let coverUrl =
    header?.playlistHeaderBanner?.heroDetails?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
    data?.microformat?.microformatDataRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80";

  const videoList =
    data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
      ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]
      ?.playlistVideoListRenderer?.contents || [];

  const tracks: Track[] = [];

  for (const item of videoList) {
    const v = item?.playlistVideoRenderer;
    if (!v || !v.videoId) continue;

    const videoId = v.videoId;
    const title =
      v?.title?.runs?.[0]?.text ||
      v?.title?.simpleText ||
      "Unknown Track";

    const artist =
      v?.shortBylineText?.runs?.[0]?.text ||
      v?.shortBylineText?.simpleText ||
      "YouTube Artist";

    const durationSeconds = parseInt(v?.lengthSeconds || "180", 10);
    const thumb =
      v?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    if (!coverUrl && thumb) {
      coverUrl = thumb;
    }

    tracks.push({
      id: `yt-${videoId}`,
      title: title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim(),
      artist: artist.replace(" - Topic", "").replace("VEVO", "").trim(),
      album: name,
      duration: isNaN(durationSeconds) ? 180 : durationSeconds,
      youtubeId: videoId,
      coverUrl: thumb,
      bgGradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
    });
  }

  return { name, description, coverUrl, tracks };
}

// Parse Spotify Playlist Embed
async function fetchSpotifyPlaylist(
  type: "playlist" | "album" | "track",
  id: string
): Promise<{
  name: string;
  description: string;
  coverUrl: string;
  draftTracks: ImportedTrackDraft[];
}> {
  const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load Spotify playlist");
  }

  const html = await res.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

  if (!nextDataMatch) {
    throw new Error("Could not parse Spotify playlist data");
  }

  const nextData = JSON.parse(nextDataMatch[1]);
  const entity = nextData?.props?.pageProps?.state?.data?.entity;

  if (!entity) {
    throw new Error("Invalid Spotify entity");
  }

  const name = entity?.name || entity?.title || "Imported Spotify Playlist";
  const description = entity?.description || `Imported ${type} from Spotify`;
  const coverUrl =
    entity?.coverArt?.sources?.[0]?.url ||
    entity?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80";

  const rawTrackList = entity?.trackList || [];
  const draftTracks: ImportedTrackDraft[] = [];

  for (const item of rawTrackList) {
    const title = item?.title || item?.name;
    const artist = item?.subtitle || item?.artists?.[0]?.name || "Spotify Artist";
    const duration = item?.duration ? Math.round(item.duration / 1000) : 180;

    if (title) {
      draftTracks.push({
        title,
        artist,
        duration,
        coverUrl,
      });
    }
  }

  return { name, description, coverUrl, draftTracks };
}

export async function parseAndImportPlaylist(url: string) {
  // 1. Check if it's a YouTube Playlist
  const ytListId = getYouTubePlaylistId(url);
  if (ytListId) {
    const playlist = await fetchYouTubePlaylist(ytListId);
    return {
      provider: "youtube" as const,
      name: playlist.name,
      description: playlist.description,
      coverUrl: playlist.coverUrl,
      tracks: playlist.tracks,
      totalTracks: playlist.tracks.length,
    };
  }

  // 2. Check if it's a Spotify Playlist / Album / Track
  const spotifyEntity = getSpotifyPlaylistId(url);
  if (spotifyEntity) {
    const { name, description, coverUrl, draftTracks } = await fetchSpotifyPlaylist(
      spotifyEntity.type,
      spotifyEntity.id
    );

    if (draftTracks.length === 0) {
      throw new Error("Could not find any playable tracks in this Spotify playlist.");
    }

    // Convert all tracks from the Spotify playlist
    const resolvedTracks: Track[] = draftTracks.map((draft, idx) => ({
      id: `yt-imp-${idx}-${Date.now()}`,
      title: draft.title,
      artist: draft.artist,
      album: name,
      duration: draft.duration || 180,
      youtubeId: `query:${encodeURIComponent(`${draft.title} ${draft.artist}`)}`,
      coverUrl: draft.coverUrl || coverUrl,
      bgGradient: "linear-gradient(135deg, #10b981, #047857)",
    }));

    // Pre-resolve top 8 tracks in parallel for instant zero-lag playback
    const topCount = Math.min(8, draftTracks.length);
    await Promise.all(
      draftTracks.slice(0, topCount).map(async (draft, idx) => {
        try {
          const query = `${draft.title} ${draft.artist}`;
          const res = await searchYouTubeTracks(query);
          if (res.tracks?.[0]?.youtubeId) {
            resolvedTracks[idx].youtubeId = res.tracks[0].youtubeId;
            if (res.tracks[0].coverUrl) {
              resolvedTracks[idx].coverUrl = res.tracks[0].coverUrl;
            }
          }
        } catch (err) {
          console.warn(`Track ${idx} pre-resolve skipped:`, err);
        }
      })
    );

    return {
      provider: "spotify" as const,
      name,
      description,
      coverUrl,
      tracks: resolvedTracks,
      totalTracks: draftTracks.length,
    };
  }

  throw new Error("Unsupported link. Please paste a valid Spotify or YouTube Playlist link.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "Please provide a valid playlist link" }, { status: 400 });
    }

    const result = await parseAndImportPlaylist(url);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("Playlist Import failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to import playlist. Please check the URL and try again." },
      { status: 400 }
    );
  }
}

