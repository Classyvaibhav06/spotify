"use client";

import PlaylistCard from "@/components/Cards/PlaylistCard";
import { Playlist } from "@/lib/mockData";

interface RecentlyPlayedGridProps {
  playlists: Playlist[];
}

export default function RecentlyPlayedGrid({ playlists }: RecentlyPlayedGridProps) {
  return (
    <div
      className="grid gap-2 mb-8"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
    >
      {playlists.slice(0, 6).map((pl, i) => (
        <PlaylistCard key={pl.id} playlist={pl} index={i} variant="small" />
      ))}
    </div>
  );
}
