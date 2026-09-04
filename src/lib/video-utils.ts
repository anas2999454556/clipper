import { SceneChange } from "./types";

const SAMPLE_INTERVAL = 1;
const SCENE_THRESHOLD = 25;
const MIN_CLIP_SECONDS = 5;
const MAX_CLIP_SECONDS = 60;

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (video.src.startsWith("blob:")) URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Failed to load video metadata"));
    video.src = URL.createObjectURL(file);
  });
}

export async function generateThumbnail(
  videoUrl: string,
  time: number
): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(time, video.duration - 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 568;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve("");
      }
      if (video.src.startsWith("blob:")) URL.revokeObjectURL(video.src);
    };

    video.onerror = () => resolve("");
    video.src = videoUrl;
  });
}

function getFrameData(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  time: number
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    video.currentTime = time;
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    video.onerror = reject;
  });
}

function compareFrames(a: ImageData, b: ImageData): number {
  const data1 = a.data;
  const data2 = b.data;
  const pixels = data1.length / 4;
  let totalDiff = 0;
  for (let i = 0; i < data1.length; i += 16) {
    totalDiff += Math.abs(data1[i] - data2[i]);
    totalDiff += Math.abs(data1[i + 1] - data2[i + 1]);
    totalDiff += Math.abs(data1[i + 2] - data2[i + 2]);
  }
  return totalDiff / (pixels * 3 * 0.25);
}

export async function detectSceneChanges(
  videoUrl: string,
  duration: number,
  onProgress?: (p: number) => void
): Promise<SceneChange[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = true;

    video.onloadeddata = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Cannot create canvas context")); return; }

      const scenes: SceneChange[] = [];
      const sampleCount = Math.ceil(duration / SAMPLE_INTERVAL);
      let prevFrame: ImageData | null = null;

      for (let i = 0; i <= sampleCount; i++) {
        const time = Math.min(i * SAMPLE_INTERVAL, duration - 0.1);
        try {
          const frame = await getFrameData(video, canvas, ctx, time);
          if (prevFrame) {
            const diff = compareFrames(prevFrame, frame);
            if (diff > SCENE_THRESHOLD) scenes.push({ time, score: diff });
          }
          prevFrame = frame;
          onProgress?.(((i + 1) / (sampleCount + 1)) * 50);
        } catch {
          break;
        }
      }

      if (video.src.startsWith("blob:")) URL.revokeObjectURL(video.src);
      resolve(scenes);
    };

    video.onerror = () => reject(new Error("Failed to load video for analysis"));
    video.src = videoUrl;
  });
}

export function mergeScenesToClips(
  scenes: SceneChange[],
  duration: number
): Array<{ startTime: number; endTime: number }> {
  const sorted = [...scenes].sort((a, b) => a.time - b.time);
  const clips: Array<{ startTime: number; endTime: number }> = [];
  const boundaries = [0, ...sorted.map((s) => s.time), duration];

  for (let i = 0; i < boundaries.length - 1; i++) {
    let start = boundaries[i];
    let end = boundaries[i + 1];

    while (end - start < MIN_CLIP_SECONDS && i < boundaries.length - 2) {
      i++;
      end = boundaries[i + 1];
    }

    if (end - start > 1) {
      if (end - start > MAX_CLIP_SECONDS) {
        const mid = start + (end - start) / 2;
        start = Math.max(0, mid - MAX_CLIP_SECONDS / 2);
        end = Math.min(duration, start + MAX_CLIP_SECONDS);
      }
      clips.push({ startTime: start, endTime: end });
    }
  }

  if (clips.length === 0) {
    clips.push({ startTime: 0, endTime: Math.min(duration, 30) });
  }

  return clips.slice(0, 10);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
