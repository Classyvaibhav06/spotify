"use client";

import PlaylistCard from "@/components/Cards/PlaylistCard";
import { Playlist } from "@/lib/mockData";

interface HorizontalScrollSectionProps {
  title: string;
  playlists: Playlist[];
  startIndex?: number;
}

export default function HorizontalScrollSection({
  title,
  playlists,
  startIndex = 0,
}: HorizontalScrollSectionProps) {
  return (
    <section className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        {/* feature-heading: SpotifyMixUI 18px/600 */}
        <h2
          className="type-feature-heading hover:underline cursor-pointer"
          style={{ color: "var(--text-base)" }}
        >
          {title}
        </h2>
        {/* "See all" — small-bold 12px/700, silver, uppercase */}
        <button
          className="type-small-bold uppercase tracking-widest transition-colors duration-150"
          style={{ color: "var(--text-secondary)", letterSpacing: "0.14em", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-base)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          Show all
        </button>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {playlists.map((pl, i) => (
          <PlaylistCard key={pl.id} playlist={pl} index={startIndex + i} variant="large" />
        ))}
      </div>
    </section>
  );
}
