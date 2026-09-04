import { ClipCard } from "./ClipCard";
import { Clip } from "@/lib/types";

interface ClipListProps {
  clips: Clip[];
  onSelect: (clip: Clip) => void;
  onDelete: (id: string) => void;
}

export function ClipList({ clips, onSelect, onDelete }: ClipListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
