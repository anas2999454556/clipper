import { NextRequest, NextResponse } from "next/server";
import { getDb, type DBVideo } from "@/server/db";
import { requireAuth } from "@/server/api-helpers";

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { videoId } = await request.json();
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const db = getDb();
    const video = await db
      .prepare("SELECT * FROM videos WHERE id = ? AND user_id = ?")
      .bind(videoId, auth.ctx.userId)
      .first<DBVideo>();
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    // Delete clip records from DB
    await db.prepare("DELETE FROM clips WHERE video_id = ?").bind(videoId).run();

    // Delete video record from DB (cascades to clips via FK)
    await db.prepare("DELETE FROM videos WHERE id = ? AND user_id = ?").bind(videoId, auth.ctx.userId).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
