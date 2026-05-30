import type { Idea } from "../../../shared/types";

const KEY = "eureka_bookmarks_v1";

type StoredBookmark = {
  idea: Idea;
  saved_at: string;
};

function safeParse(raw: string | null): Record<string, StoredBookmark> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, StoredBookmark>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function loadBookmarks(): Record<string, StoredBookmark> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(KEY));
}

export function saveBookmarks(next: Record<string, StoredBookmark>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function toggleBookmark(idea: Idea): { next: Record<string, StoredBookmark>; isBookmarked: boolean } {
  const cur = loadBookmarks();
  if (cur[idea.id]) {
    const { [idea.id]: _, ...rest } = cur;
    saveBookmarks(rest);
    return { next: rest, isBookmarked: false };
  }
  const next: Record<string, StoredBookmark> = {
    ...cur,
    [idea.id]: { idea, saved_at: new Date().toISOString() },
  };
  saveBookmarks(next);
  return { next, isBookmarked: true };
}

export function bookmarkedIdeas(cur: Record<string, StoredBookmark>): Idea[] {
  return Object.values(cur)
    .sort((a, b) => (a.saved_at < b.saved_at ? 1 : -1))
    .map((x) => x.idea);
}

export function exportBookmarksAsJson(cur: Record<string, StoredBookmark>) {
  const ideas = bookmarkedIdeas(cur);
  const content = JSON.stringify({ exported_at: new Date().toISOString(), ideas }, null, 2);
  downloadText(`eureka-shortlist-${Date.now()}.json`, content, "application/json");
}

export function exportBookmarksAsMarkdown(cur: Record<string, StoredBookmark>) {
  const ideas = bookmarkedIdeas(cur);
  const lines: string[] = [];
  lines.push(`# EUREKA Shortlist`);
  lines.push(``);
  lines.push(`Exported: ${new Date().toISOString()}`);
  lines.push(``);
  for (const idea of ideas) {
    lines.push(`## ${idea.title}`);
    lines.push(``);
    lines.push(`- id: ${idea.id}`);
    lines.push(`- novelty: ${idea.novelty_score} (${idea.novelty_score_range})`);
    lines.push(`- feasibility: ${idea.feasibility_score} (${idea.feasibility_score_range})`);
    lines.push(`- coherence: ${idea.coherence_score}`);
    lines.push(`- confidence: ${idea.confidence_level}`);
    lines.push(``);
    lines.push(idea.description);
    lines.push(``);
    if (idea.validation_plan?.length) {
      lines.push(`**Validation plan**`);
      for (const step of idea.validation_plan) lines.push(`- ${step}`);
      lines.push(``);
    }
    if (idea.citations?.length) {
      lines.push(`**Citations**`);
      for (const c of idea.citations) lines.push(`- ${c}`);
      lines.push(``);
    }
  }
  downloadText(`eureka-shortlist-${Date.now()}.md`, lines.join("\n"), "text/markdown");
}

function downloadText(filename: string, content: string, mime: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

