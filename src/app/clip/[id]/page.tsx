"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clip } from "@/lib/types";
import { formatTime } from "@/lib/video-utils";
import { ArrowLeft, Download, Copy, Play, Pause, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function getStoredClip(): Clip | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("clipper-active");
  return stored ? JSON.parse(stored) : null;
}

export default function ClipPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trimBarRef = useRef<HTMLDivElement>(null);

  const [clip] = useState<Clip | null>(getStoredClip);
  const [playing, setPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(clip?.startTime ?? 0);
  const [trimEnd, setTrimEnd] = useState(clip?.endTime ?? 60);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!clip) router.push("/create-clips");
  }, [clip, router, authLoading, user]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.currentTime >= trimEnd) {
      v.pause();
      v.currentTime = trimStart;
      setPlaying(false);
    }
  }, [trimEnd, trimStart]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
    } else {
      if (v.currentTime < trimStart || v.currentTime >= trimEnd) {
        v.currentTime = trimStart;
      }
      v.play();
    }
    setPlaying(!playing);
  };

  const handleTrimDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging || !videoRef.current || !trimBarRef.current) return;
      const rect = trimBarRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = ratio * videoDuration;

      if (dragging === "start") {
        setTrimStart(Math.max(0, Math.min(time, trimEnd - 1)));
      } else {
        setTrimEnd(Math.min(videoDuration, Math.max(time, trimStart + 1)));
      }
    },
    [dragging, trimStart, trimEnd, videoDuration]
  );

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(null);
    const handleMove = (e: MouseEvent | TouchEvent) => handleTrimDrag(e);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, handleTrimDrag]);

  const handleCopyTimestamp = () => {
    navigator.clipboard.writeText(`${formatTime(trimStart)} - ${formatTime(trimEnd)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!clip) return;
    try {
      const res = await fetch(clip.videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clip-${clip.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(clip.videoUrl, "_blank");
    }
  };

  if (!clip) return null;

  const trimDuration = trimEnd - trimStart;
  const startPct = videoDuration > 0 ? (trimStart / videoDuration) * 100 : 0;
  const endPct = videoDuration > 0 ? (trimEnd / videoDuration) * 100 : 100;
  const progressPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <main className="flex-1 px-6 md:px-10 py-10">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button
          onClick={() => router.push("/create-clips")}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to clips
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          {/* Video player */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[65vh] md:aspect-auto md:max-h-none md:h-full">
            <video
              ref={videoRef}
              src={clip.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                const v = videoRef.current;
                if (v) { setVideoDuration(v.duration); v.currentTime = trimStart; }
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />

            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center group/player cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity duration-150">
                {playing ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" />
                )}
              </div>
            </button>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
              <div className="flex items-center justify-between text-white text-xs font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(videoDuration)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="font-semibold text-base mb-1">{clip.title}</h2>
              <p className="text-sm text-muted-foreground">
                {formatTime(trimStart)} &ndash; {formatTime(trimEnd)}
                <span className="ml-1.5 text-xs">({Math.round(trimDuration)}s)</span>
              </p>
            </div>

            {/* Trim bar */}
            <div className="mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Trim range
              </p>
              <div
                ref={trimBarRef}
                className="relative h-9 bg-muted rounded-lg cursor-pointer select-none group/trim"
                onClick={(e) => {
                  if (!videoRef.current || !trimBarRef.current) return;
                  const rect = trimBarRef.current.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  const time = ratio * videoDuration;
                  if (time < trimStart) setTrimStart(Math.max(0, time));
                  else setTrimEnd(Math.min(videoDuration, time));
                  videoRef.current.currentTime = time;
                }}
              >
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white/5 rounded-l-lg"
                  style={{ width: `${startPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 right-0 bg-white/5 rounded-r-lg"
                  style={{ width: `${100 - endPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 border-y-2 border-accent"
                  style={{
                    left: `${startPct}%`,
                    width: `${endPct - startPct}%`,
                    backgroundColor: "rgba(200, 164, 94, 0.15)",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2.5 bg-accent rounded-l cursor-ew-resize -ml-1 group-hover/trim:w-3 transition-all"
                    onMouseDown={(e) => { e.stopPropagation(); setDragging("start"); }}
                    onTouchStart={(e) => { e.stopPropagation(); setDragging("start"); }}
                  />
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2.5 bg-accent rounded-r cursor-ew-resize -mr-1 group-hover/trim:w-3 transition-all"
                    onMouseDown={(e) => { e.stopPropagation(); setDragging("end"); }}
                    onTouchStart={(e) => { e.stopPropagation(); setDragging("end"); }}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground font-medium">
                <span>{formatTime(trimStart)}</span>
                <span>{formatTime(trimEnd)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-2.5">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 px-4 font-semibold text-sm transition-colors"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                <Download className="w-4 h-4" />
                Export clip
              </button>
              <button
                onClick={handleCopyTimestamp}
                className="w-full flex items-center justify-center gap-2 border border-border rounded-full py-2.5 px-4 font-medium text-sm hover:bg-muted transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-accent" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy timestamp</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
