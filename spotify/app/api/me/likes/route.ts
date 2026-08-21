import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ likedSongs: [] });
    }

    // Find or create user in DB
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
      },
      create: {
        email: session.user.email,
        name: session.user.name ?? "User",
        image: session.user.image,
      },
    });

    const likedSongs = await prisma.likedSong.findMany({
      where: { userId: user.id },
      orderBy: { likedAt: "desc" },
    });

    const formatted = likedSongs.map((ls) => ({
      id: ls.trackId,
      title: ls.title,
      artist: ls.artist,
      album: ls.album || "",
      coverUrl: ls.coverUrl || "",
      duration: ls.duration,
      youtubeId: ls.youtubeId,
      addedAt: ls.likedAt.toISOString(),
    }));

    return NextResponse.json({ likedSongs: formatted });
  } catch (error) {
    console.error("Failed to fetch liked songs from DB:", error);
    return NextResponse.json({ likedSongs: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { track } = body;

    if (!track || !track.id) {
      return NextResponse.json({ error: "Invalid track data" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name ?? "User",
        image: session.user.image,
      },
    });

    // Check if already liked
    const existing = await prisma.likedSong.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: track.id,
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.likedSong.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.likedSong.create({
        data: {
          userId: user.id,
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album || "",
          coverUrl: track.coverUrl || "",
          duration: typeof track.duration === "number" ? track.duration : 0,
          youtubeId: track.youtubeId || track.id,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Failed to update liked song in DB:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
