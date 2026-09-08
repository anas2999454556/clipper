import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getDb } from "@/server/db";
import { requireAuth, checkUsage, incrementUsage } from "@/server/api-helpers";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const ALLOWED_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
const MAGIC_BYTES: Record<string, string[]> = {
  mp4: ["66747970", "00000018", "00000020", "6D6F6F76"],
  webm: ["1A45DFA3"],
  mov: ["66747970", "6D6F6F76"],
};

function hasValidMagic(ext: string, buffer: Uint8Array): boolean {
  const sigs = MAGIC_BYTES[ext];
  if (!sigs) return false;
  const head = Array.from(buffer.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return sigs.some((sig) => head.startsWith(sig));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const usage = await checkUsage(auth.ctx.user);
    if (!usage.allowed) return usage.response!;

    const formData = await request.formData();
    const file = formData.get("video") as File | null;
    const duration = parseFloat(formData.get("duration") as string) || 0;

    if (!file) return NextResponse.json({ error: "No video file" }, { status: 400 });

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File exceeds the 2 GB limit" }, { status: 413 });
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Only MP4, WebM, and MOV files are allowed" }, { status: 415 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidMagic(ext, bytes)) {
      return NextResponse.json({ error: "File is not a valid video" }, { status: 415 });
    }

    const id = uuid();
    const fileName = `${id}.${ext}`;
    const videoUrl = `/api/video/${fileName}`;

    const db = getDb();
    await db
      .prepare(
        `INSERT INTO videos (id, name, file_name, duration, size, source, video_url, user_id)
         VALUES (?, ?, ?, ?, ?, 'upload', ?, ?)`
      )
      .bind(id, file.name, fileName, duration, file.size, videoUrl, auth.ctx.userId)
      .run();

    await incrementUsage(auth.ctx.userId);

    return NextResponse.json({
      success: true,
      video: { id, name: file.name, fileName, duration, size: file.size, videoUrl },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
