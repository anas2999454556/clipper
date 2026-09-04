"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clip } from "@/lib/types";
import {
  detectSceneChanges,
  mergeScenesToClips,
  generateThumbnail,
} from "@/lib/video-utils";
import { ClipList } from "@/components/clip-list/ClipList";
import { useAuth } from "@/hooks/useAuth";

interface UploadData {
  video: { id: string; videoUrl: string; name: string };
  duration: number;
  fileName: string;
}

function getStoredUpload(): UploadData | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("clipper-upload");
  return stored ? JSON.parse(stored) : null;
}

export default function CreateClipsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clips, setClips] = useState<Clip[]>([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading video...");
  const [error, setError] = useState<string | null>(null);
  const analyzedRef = useRef(false);

  const analyzeVideo = useCallback(async (data: UploadData) => {
    try {
      setStatus("Detecting scenes...");
      setProgress(10);

      const scenes = await detectSceneChanges(
        data.video.videoUrl,
        data.duration,
        (p) => setProgress(10 + p * 0.5)
      );

      setStatus(`Found ${scenes.length} transitions. Creating clips...`);
      setProgress(60);

      const rawClips = mergeScenesToClips(scenes, data.duration);

      setStatus("Generating thumbnails...");
      setProgress(75);

      const generated: Clip[] = [];
      for (let i = 0; i < rawClips.length; i++) {
        const raw = rawClips[i];
        const thumbTime = raw.startTime + (raw.endTime - raw.startTime) / 2;
        const thumbnail = await generateThumbnail(data.video.videoUrl, thumbTime);

        generated.push({
          id: `${data.video.id}-${i}`,
          title: `Clip ${i + 1}`,
          duration: raw.endTime - raw.startTime,
          startTime: raw.startTime,
          endTime: raw.endTime,
          thumbnail,
          videoUrl: data.video.videoUrl,
        });

        setProgress(75 + ((i + 1) / rawClips.length) * 25);
      }

      try {
        await fetch("/api/clips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: data.video.id,
            clips: rawClips.map((c, i) => ({ ...c, title: `Clip ${i + 1}` })),
          }),
        });
      } catch {
        // client-side clips still work
      }

      setClips(generated);
      setProgress(100);
      setAnalyzing(false);
      sessionStorage.removeItem("clipper-upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze video");
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    const data = getStoredUpload();
    if (!data) { router.push("/upload"); return; }
    if (!analyzedRef.current) {
      analyzedRef.current = true;
      analyzeVideo(data);
    }
  }, [router, analyzeVideo, authLoading, user]);

  const handleSelect = useCallback(
    (clip: Clip) => {
      sessionStorage.setItem("clipper-active", JSON.stringify(clip));
      router.push(`/clip/${clip.id}`);
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <main className="flex-1 px-6 md:px-10 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-headline">Generated clips</h1>
            {analyzing && (
              <p className="text-sm text-muted-foreground mt-2">
                Analyzing your video
              </p>
            )}
            {!analyzing && clips.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {clips.length} clip{clips.length !== 1 ? "s" : ""} ready
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/upload")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload another
          </button>
        </div>

        {analyzing && (
          <div className="border border-border rounded-2xl p-12 text-center animate-fade-in">
            <div
              className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full mx-auto mb-5"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <p className="font-semibold text-sm mb-4">{status}</p>
            <div className="h-1 w-56 bg-muted rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {error && (
          <div className="border border-border rounded-2xl p-8 text-center animate-fade-in">
            <p className="font-semibold text-sm mb-1">Analysis failed</p>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <button
              onClick={() => router.push("/upload")}
              className="text-sm font-medium underline underline-offset-4 hover:no-underline"
            >
              Try another video
            </button>
          </div>
        )}

        {!analyzing && !error && clips.length === 0 && (
          <div className="border border-border rounded-2xl p-8 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground mb-5">
              No clips could be generated from this video
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="text-sm font-medium underline underline-offset-4 hover:no-underline"
            >
              Try another video
            </button>
          </div>
        )}

        {clips.length > 0 && (
          <div className="animate-fade-in">
            <ClipList
              clips={clips}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </main>
  );
}
