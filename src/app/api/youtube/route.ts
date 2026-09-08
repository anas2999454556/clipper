import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getDb } from "@/server/db";
import { requireAuth, checkUsage, incrementUsage } from "@/server/api-helpers";

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const usage = await checkUsage(auth.ctx.user);
    if (!usage.allowed) return usage.response!;

    const { url } = await request.json();

    if (!url || !isYouTubeUrl(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const id = `yt-${Date.now()}`;
    const videoUrl = `/api/video/${id}.mp4`;

    const db = getDb();
    await db
      .prepare(
        `INSERT INTO videos (id, name, file_name, duration, size, source, original_url, video_url, user_id)
         VALUES (?, ?, ?, 0, 0, 'youtube', ?, ?, ?)`
      )
      .bind(id, "YouTube video", `${id}.mp4`, url, videoUrl, auth.ctx.userId)
      .run();

    await incrementUsage(auth.ctx.userId);

    return NextResponse.json({
      success: true,
      video: { id, name: "YouTube video", fileName: `${id}.mp4`, duration: 0, size: 0, videoUrl, source: "youtube", originalUrl: url },
    });
  } catch (error) {
    console.error("YouTube download error:", error);
    const message = error instanceof Error ? error.message : "Failed to download YouTube video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
