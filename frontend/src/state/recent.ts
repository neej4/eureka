import type { PipelineResult } from "../../../shared/types";

const KEY = "eureka_recent_v1";
const MAX = 15;

export type RecentItem = {
  id: string;
  saved_at: string;
  topic: string;
  result: PipelineResult;
};

function safeParse(raw: string | null): RecentItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RecentItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object" && typeof (x as any).id === "string");
  } catch {
    return [];
  }
}

export function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function saveRecent(items: RecentItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

export function addRecent(result: PipelineResult) {
  const cur = loadRecent();
  const id = result.pipeline_id || `local-${Date.now()}`;
  const next: RecentItem = { id, saved_at: new Date().toISOString(), topic: result.topic, result };
  const merged = [next, ...cur.filter((x) => x.id !== id)].slice(0, MAX);
  saveRecent(merged);
  return merged;
}

