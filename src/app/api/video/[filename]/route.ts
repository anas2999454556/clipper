import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import db from "@/server/db";
import { requireAuth } from "@/server/api-helpers";
import type { DBVideo } from "@/server/db";

const DATA_DIR = path.join(process.cwd(), "data", "uploads");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const { filename } = await params;

    // Prevent path traversal outside the uploads directory
    const safeName = path.basename(filename);
    const filePath = path.join(DATA_DIR, safeName);
    if (!filePath.startsWith(DATA_DIR + path.sep) || !existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Authorization: only the owning user may access this video
    const video = db
      .prepare("SELECT * FROM videos WHERE file_name = ? AND user_id = ?")
      .get(safeName, auth.ctx.userId) as DBVideo | undefined;
    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypes[ext] || "video/mp4",
        "Content-Length": fileStat.size.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
