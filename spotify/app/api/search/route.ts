import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeTracks } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ tracks: [], error: null });
  }

  const result = await searchYouTubeTracks(q);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

