import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync, statSync, readdirSync } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import db from "@/server/db";
import { requireAuth, checkUsage, incrementUsage } from "@/server/api-helpers";

const execFileAsync = promisify(execFile);
const DATA_DIR = path.join(process.cwd(), "data", "uploads");

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

async function runYtDlp(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("python", ["-m", "yt_dlp", "--js-runtimes", "node", ...args], {
    timeout: 300000,
    maxBuffer: 50 * 1024 * 1024,
  });
  return stdout;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const usage = checkUsage(auth.ctx.user);
    if (!usage.allowed) return usage.response!;

    const { url } = await request.json();

    if (!url || !isYouTubeUrl(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    const id = `yt-${Date.now()}`;
    const baseName = id;

    const infoJson = await runYtDlp(["--dump-json", "--no-download", url]);
    const info = JSON.parse(infoJson);
    const title = info.title || "video";
    const duration = info.duration || 0;

    const outTemplate = path.join(DATA_DIR, `${baseName}.%(ext)s`);
    await runYtDlp([
      "-f", "bestvideo[ext=mp4][height<=720]/bestvideo[height<=720]/best",
      "-o", outTemplate,
      "--no-playlist",
      url,
    ]);

    const files = readdirSync(DATA_DIR).filter(f => f.startsWith(baseName));
    const videoFile = files.find(f => !f.endsWith(".json"));
    const fileName = videoFile || `${baseName}.mp4`;
    const filePath = path.join(DATA_DIR, fileName);
    const videoUrl = `/api/video/${fileName}`;
    const name = `${title.replace(/[^\w\s-]/g, "").trim().slice(0, 50)}.mp4`;
    const size = existsSync(filePath) ? statSync(/* turbopackIgnore: true */ filePath).size : 0;

    db.prepare(
      `INSERT INTO videos (id, name, file_name, duration, size, source, original_url, video_url, user_id)
       VALUES (?, ?, ?, ?, ?, 'youtube', ?, ?, ?)`
    ).run(id, name, fileName, duration, size, url, videoUrl, auth.ctx.userId);

    incrementUsage(auth.ctx.userId);

    return NextResponse.json({
      success: true,
      video: { id, name, fileName, duration, size, videoUrl, source: "youtube", originalUrl: url },
    });
  } catch (error) {
    console.error("YouTube download error:", error);
    const message = error instanceof Error ? error.message : "Failed to download YouTube video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
