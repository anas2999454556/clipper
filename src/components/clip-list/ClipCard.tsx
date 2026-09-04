"use client";

import { Trash, Play } from "lucide-react";
import { Clip } from "@/lib/types";
import { formatDuration } from "@/lib/video-utils";

interface ClipCardProps {
  clip: Clip;
  onSelect: (clip: Clip) => void;
  onDelete: (id: string) => void;
}

export function ClipCard({ clip, onSelect, onDelete }: ClipCardProps) {
  return (
    <div
      className="group relative rounded-2xl border border-border overflow-hidden bg-card cursor-pointer transition-all duration-200 hover:border-white/15"
      onClick={() => onSelect(clip)}
    >
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {clip.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnail}
            alt={clip.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
            <Play className="w-4 h-4 text-black ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
          {formatDuration(clip.duration)}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{clip.title}</h3>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(clip.id);
        }}
        className="absolute top-2 left-2 p-1.5 rounded-md bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90 cursor-pointer"
        aria-label={`Delete ${clip.title}`}
      >
        <Trash className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
