"use client";

export function SkeletonCard() {
  return (
    <div className="bg-spotify-gray rounded-md p-4 flex-shrink-0 w-[180px] animate-pulse">
      <div className="aspect-square rounded-md bg-spotify-medgray mb-4" />
      <div className="h-3 bg-spotify-medgray rounded mb-2 w-3/4" />
      <div className="h-2 bg-spotify-medgray rounded w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 bg-spotify-gray/50 rounded-md overflow-hidden pr-4 animate-pulse">
      <div className="w-14 h-14 flex-shrink-0 bg-spotify-medgray" />
      <div className="h-3 bg-spotify-medgray rounded flex-1" />
    </div>
  );
}

export function SkeletonSection({ count = 5 }: { count?: number }) {
  return (
    <div className="mb-8">
      <div className="h-5 w-40 bg-spotify-medgray rounded mb-4 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
