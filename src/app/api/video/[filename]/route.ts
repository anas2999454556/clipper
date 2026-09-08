import { NextRequest, NextResponse } from "next/server";
import { getDb, type DBVideo } from "@/server/db";
import { requireAuth } from "@/server/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { filename } = await params;
    const safeName = filename;

    const db = getDb();
    const video = await db
      .prepare("SELECT * FROM videos WHERE file_name = ? AND user_id = ?")
      .bind(safeName, auth.ctx.userId)
      .first<DBVideo>();
    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // On Cloudflare, file serving needs R2 or external storage.
    // For now, return the video URL metadata.
    return NextResponse.json({
      video: {
        id: video.id,
        name: video.name,
        fileName: video.file_name,
        videoUrl: video.video_url,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
