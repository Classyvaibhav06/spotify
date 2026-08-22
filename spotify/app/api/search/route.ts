import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeTracks } from "@/lib/youtube";
import { parseAndImportPlaylist } from "@/app/api/playlist/import/route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ tracks: [], error: null });
  }

  // Auto-detect Spotify / YouTube playlist link pasted into search
  if (
    q.includes("spotify.com/") ||
    q.includes("spotify.link/") ||
    q.includes("youtube.com/playlist") ||
    (q.includes("youtube.com/watch") && q.includes("list="))
  ) {
    try {
      const playlistData = await parseAndImportPlaylist(q.trim());
      return NextResponse.json(
        {
          playlist: {
            name: playlistData.name,
            description: playlistData.description,
            coverUrl: playlistData.coverUrl,
            tracks: playlistData.tracks,
            provider: playlistData.provider,
          },
          tracks: playlistData.tracks,
          error: null,
        },
        {
          headers: {
            "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    } catch (err: any) {
      console.warn("Direct playlist search parse skipped, falling back to query search:", err);
    }
  }

  const result = await searchYouTubeTracks(q);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}


