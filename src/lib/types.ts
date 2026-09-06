import type { PlanId } from "./plans";

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: PlanId;
  subscriptionStatus: string | null;
  usageCount: number;
  usageLimit: number;
}

export interface Clip {
  id: string;
  title: string;
  duration: number;
  startTime: number;
  endTime: number;
  thumbnail: string;
  videoUrl: string;
  filePath?: string;
}

export interface VideoMetadata {
  id: string;
  name: string;
  fileName: string;
  size: number;
  duration: number;
  source: "upload" | "youtube";
  originalUrl?: string;
  videoUrl: string;
}

export interface SceneChange {
  time: number;
  score: number;
}
