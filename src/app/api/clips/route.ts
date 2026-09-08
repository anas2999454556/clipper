import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getDb, type DBVideo } from "@/server/db";
import { requireAuth } from "@/server/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { videoId, clips } = await request.json();
    if (!videoId || !Array.isArray(clips) || clips.length === 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    const video = await db
      .prepare("SELECT * FROM videos WHERE id = ? AND user_id = ?")
      .bind(videoId, auth.ctx.userId)
      .first<DBVideo>();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const saved = clips
      .map((c: { startTime?: number; endTime?: number; title?: string }) => {
        const start = Number(c.startTime);
        const end = Number(c.endTime);
        const title = typeof c.title === "string" ? c.title.slice(0, 200) : "Clip";

        if (
          !Number.isFinite(start) ||
          !Number.isFinite(end) ||
          start < 0 ||
          end <= start ||
          end > video.duration + 1
        ) {
          return null;
        }

        return { start, end, title };
      })
      .filter((c): c is { start: number; end: number; title: string } => c !== null);

    if (saved.length === 0) {
      return NextResponse.json({ error: "No valid clips provided" }, { status: 400 });
    }

    const created = [];
    for (const c of saved) {
      const id = uuid();
      const duration = c.end - c.start;
      await db
        .prepare(
          `INSERT INTO clips (id, title, start_time, end_time, duration, video_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(id, c.title, c.start, c.end, duration, videoId)
        .run();
      created.push({ id, title: c.title, startTime: c.start, endTime: c.end, duration, videoUrl: video.video_url, thumbnail: "" });
    }

    return NextResponse.json({ success: true, clips: created });
  } catch (error) {
    console.error("Clips error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const videoId = new URL(request.url).searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const db = getDb();
    const video = await db
      .prepare("SELECT * FROM videos WHERE id = ? AND user_id = ?")
      .bind(videoId, auth.ctx.userId)
      .first<DBVideo>();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const clipsResult = await db
      .prepare("SELECT * FROM clips WHERE video_id = ? ORDER BY start_time")
      .bind(videoId)
      .all<{ id: string; title: string; start_time: number; end_time: number; duration: number; thumbnail: string }>();

    return NextResponse.json({
      clips: clipsResult.results.map((c) => ({
        id: c.id,
        title: c.title,
        startTime: c.start_time,
        endTime: c.end_time,
        duration: c.duration,
        thumbnail: c.thumbnail,
        videoUrl: video.video_url,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
