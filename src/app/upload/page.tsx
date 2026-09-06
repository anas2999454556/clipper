"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, X, Clock, FileVideo, Link as LinkIcon, ArrowRight } from "lucide-react";
import { getVideoDuration, formatDuration, formatFileSize } from "@/lib/video-utils";
import { useAuth } from "@/hooks/useAuth";

type Tab = "file" | "url";

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const [tab, setTab] = useState<Tab>("file");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.startsWith("video/")) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    try {
      const dur = await getVideoDuration(f);
      setDuration(dur);
    } catch {
      setDuration(0);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file || !duration) return;
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("duration", duration.toString());

      const response = await new Promise<{ success: boolean; video: { id: string } }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress((e.loaded / e.total) * 80);
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      setProgress(100);
      sessionStorage.setItem(
        "clipper-upload",
        JSON.stringify({ video: response.video, duration, fileName: file.name })
      );
      router.push("/create-clips");
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      setProgress(0);
    }
  };

  const isYouTube = (url: string) =>
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setUrlError(null);
    setUrlLoading(true);

    const url = urlInput.trim();

    try {
      new URL(url);
    } catch {
      setUrlError("Please enter a valid URL");
      setUrlLoading(false);
      return;
    }

    // YouTube: download server-side
    if (isYouTube(url)) {
      try {
        const res = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setUrlError(data.error || "Failed to download YouTube video");
          setUrlLoading(false);
          return;
        }
        sessionStorage.setItem(
          "clipper-upload",
          JSON.stringify({
            video: data.video,
            duration: data.video.duration,
            fileName: data.video.name,
          })
        );
        router.push("/create-clips");
      } catch {
        setUrlError("Network error downloading YouTube video");
        setUrlLoading(false);
      }
      return;
    }

    // Direct URL: load in browser via proxy
    try {
      const testVideo = document.createElement("video");
      testVideo.preload = "metadata";
      testVideo.src = `/api/proxy?url=${encodeURIComponent(url)}`;

      const dur = await new Promise<number>((resolve, reject) => {
        testVideo.onloadedmetadata = () => resolve(testVideo.duration);
        testVideo.onerror = () => reject(new Error("Could not load video from this URL"));
        setTimeout(() => reject(new Error("Timeout loading video")), 15000);
      });

      sessionStorage.setItem(
        "clipper-upload",
        JSON.stringify({
          video: {
            id: `url-${Date.now()}`,
            videoUrl: `/api/proxy?url=${encodeURIComponent(url)}`,
            name: url.split("/").pop()?.split("?")[0] || "video",
          },
          duration: dur,
          fileName: url.split("/").pop()?.split("?")[0] || "video",
        })
      );
      router.push("/create-clips");
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Failed to load video from this URL");
      setUrlLoading(false);
    }
  };

  const clearFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl("");
    setDuration(0);
  };

  if (authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg animate-fade-in">
        <h1 className="text-headline mb-3 text-center">Upload video</h1>
        <p className="text-muted-foreground text-sm mb-3 text-center">
          We&apos;ll find the most engaging moments for short-form clips.
        </p>
        {user && (
          <p className="text-xs text-center mb-8">
            <span className="text-muted-foreground">
              {user.usageCount}/{user.usageLimit === -1 ? "∞" : user.usageLimit} analyses used
              {user.plan === "premium" ? " this month" : ""}
            </span>
            {user.plan !== "super_premium" && user.usageCount >= user.usageLimit && (
              <Link href="/pricing" className="ml-2" style={{ color: "#dc2626" }}>
                Limit reached. Upgrade
              </Link>
            )}
          </p>
        )}

        {/* Tab toggle */}
        <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-full border border-border w-fit mx-auto">
          <button
            onClick={() => setTab("file")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={tab === "file" ? { background: "#ffffff", color: "#000000" } : { color: "#888" }}
          >
            <Upload className="w-3.5 h-3.5" />
            File
          </button>
          <button
            onClick={() => setTab("url")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={tab === "url" ? { background: "#ffffff", color: "#000000" } : { color: "#888" }}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            URL
          </button>
        </div>

        {/* File tab */}
        {tab === "file" && (
          <>
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  rounded-2xl p-14 text-center cursor-pointer
                  transition-all duration-200
                  ${dragOver
                    ? "border-2 border-accent bg-accent/5"
                    : "border-2 border-dashed border-border hover:border-white/20"
                  }
                `}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <Upload className={`w-5 h-5 transition-colors ${dragOver ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <p className="font-semibold text-sm mb-1.5">
                  Drop a video here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  MP4, WebM, MOV &middot; up to 2 GB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden bg-card">
                {videoUrl && (
                  <div className="relative bg-black aspect-video">
                    <video
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate mb-1.5">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileVideo className="w-3.5 h-3.5" />
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        onClick={clearFile}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div className="mb-5">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {progress < 80
                          ? `Uploading ${Math.round(progress / 0.8)}%`
                          : "Processing video..."}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={uploading || !duration}
                    className="w-full rounded-full py-3 font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: "#ffffff", color: "#000000" }}
                  >
                    {uploading ? "Analyzing..." : "Find best moments"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* URL tab */}
        {tab === "url" && (
          <div className="rounded-2xl border border-border p-6 bg-card">
            <label className="block text-sm font-medium mb-3">
              Paste a video URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
                placeholder="https://youtube.com/watch?v=... or direct video link"
                className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-colors"
                disabled={urlLoading}
              />
              <button
                onClick={handleUrlSubmit}
                disabled={urlLoading || !urlInput.trim()}
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                {urlLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {urlError && (
              <p className="text-xs mt-3" style={{ color: "#dc2626" }}>
                {urlError}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Paste a YouTube link or direct video URL (MP4, WebM, MOV).
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
