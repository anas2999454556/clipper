import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import db from "@/server/db";
import { requireAuth } from "@/server/api-helpers";
import type { DBVideo } from "@/server/db";

const DATA_DIR = path.join(process.cwd(), "data", "uploads");

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { videoId } = await request.json();
    if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });

    const video = db.prepare("SELECT * FROM videos WHERE id = ? AND user_id = ?").get(videoId, auth.ctx.userId) as DBVideo | undefined;
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    // Delete video file from disk
    const filePath = path.join(DATA_DIR, video.file_name);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => {});
    }

    // Delete clip files from disk
    const clips = db.prepare("SELECT file_path FROM clips WHERE video_id = ?").all(videoId) as { file_path: string | null }[];
    for (const clip of clips) {
      if (clip.file_path) {
        const clipPath = path.join(/* turbopackIgnore: true */ process.cwd(), clip.file_path);
        if (existsSync(clipPath)) {
          await unlink(clipPath).catch(() => {});
        }
      }
    }

    // Delete from DB (cascades to clips)
    db.prepare("DELETE FROM videos WHERE id = ? AND user_id = ?").run(videoId, auth.ctx.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
