# Ideas Grid + Detail Modal + Export to TRAE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah tampilan Ideas menjadi grid card; klik card membuka modal detail (scroll di dalam); tambah aksi Export to TRAE (copy prompt + download JSON).

**Architecture:** UI-only. `IdeaGrid` mengelola tampilan kartu; `IdeaDetailModal` menampilkan overlay + header actions dan me-render `IdeaDetail` sebagai body. Ekspor dilakukan lewat util kecil yang membuat prompt + payload JSON tanpa mengubah backend.

**Tech Stack:** React + TypeScript + TailwindCSS, existing Toast, existing IdeaDetail.

---

## File Structure

**Create**
- `frontend/src/components/IdeaGrid.tsx` — render grid cards; click membuka modal.
- `frontend/src/components/IdeaDetailModal.tsx` — modal detail + export actions.
- `frontend/src/lib/exportToTrae.ts` — builder prompt + download JSON + clipboard helper.

**Modify**
- `frontend/src/App.tsx` — ganti `IdeaList + IdeaDetail` menjadi `IdeaGrid + IdeaDetailModal`.
- `frontend/src/components/IdeaDetail.tsx` — tambah opsi wrapper style agar bisa dipakai di modal tanpa nested border/shadow.

---

### Task 1: Add export utilities (TRAE prompt + JSON)

**Files:**
- Create: `frontend/src/lib/exportToTrae.ts`

- [ ] **Step 1: Create export utility file**

```ts
import type { Idea, PipelineResult, Paper } from "./types";

export type TraeIdeaExport = {
  topic: string;
  pipeline_id: string;
  idea: Pick<
    Idea,
    | "id"
    | "title"
    | "description"
    | "novelty_score"
    | "novelty_score_range"
    | "feasibility_score"
    | "feasibility_score_range"
    | "confidence_level"
    | "coherence_score"
    | "citations"
    | "validation_plan"
    | "is_human_adjusted"
    | "human_novelty_override"
    | "human_feasibility_override"
  >;
  context?: { papers?: Array<Pick<Paper, "title" | "url" | "year">> };
};

export function buildTraePrompt(payload: TraeIdeaExport) {
  const papers = payload.context?.papers ?? [];
  const paperLines =
    papers.length === 0
      ? ""
      : `\n\n## Related papers\n${papers
          .map((p) => `- ${p.title} (${p.year}) — ${p.url}`)
          .join("\n")}`;

  return [
    `# EUREKA → TRAE Export`,
    ``,
    `Topic: ${payload.topic}`,
    `Pipeline: ${payload.pipeline_id}`,
    ``,
    `## Idea`,
    `Title: ${payload.idea.title}`,
    ``,
    payload.idea.description,
    ``,
    `Scores: novelty ${payload.idea.novelty_score} (${payload.idea.novelty_score_range}) • feasibility ${payload.idea.feasibility_score} (${payload.idea.feasibility_score_range}) • coherence ${payload.idea.coherence_score} • confidence ${payload.idea.confidence_level}`,
    payload.idea.is_human_adjusted
      ? `Overrides: novelty=${payload.idea.human_novelty_override ?? "-"} feasibility=${payload.idea.human_feasibility_override ?? "-"}`
      : `Overrides: none`,
    ``,
    `## Ask`,
    `- Buat 3 opsi eksperimen (baseline + ablation) untuk menguji ide ini`,
    `- Buat rencana implementasi prototype (MVP)`,
    `- Risiko & failure modes + mitigasi`,
    paperLines,
  ].join("\n");
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildIdeaExport(result: PipelineResult, idea: Idea): TraeIdeaExport {
  const topPapers = (result.papers ?? []).slice(0, 3).map((p) => ({ title: p.title, url: p.url, year: p.year }));
  return {
    topic: result.topic,
    pipeline_id: result.pipeline_id,
    idea: {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      novelty_score: idea.novelty_score,
      novelty_score_range: idea.novelty_score_range,
      feasibility_score: idea.feasibility_score,
      feasibility_score_range: idea.feasibility_score_range,
      confidence_level: idea.confidence_level,
      coherence_score: idea.coherence_score,
      citations: idea.citations,
      validation_plan: idea.validation_plan,
      is_human_adjusted: idea.is_human_adjusted,
      human_novelty_override: idea.human_novelty_override,
      human_feasibility_override: idea.human_feasibility_override,
    },
    context: topPapers.length ? { papers: topPapers } : undefined,
  };
}
```

- [ ] **Step 2: Verify TypeScript build**

Run:
```bash
npm run build
```

Expected: build sukses.

---

### Task 2: Implement Ideas grid (cards jejer)

**Files:**
- Create: `frontend/src/components/IdeaGrid.tsx`

- [ ] **Step 1: Add IdeaGrid component**

```tsx
import type { Idea } from "../../../shared/types";

function combinedScore(idea: Idea) {
  return Math.round((idea.novelty_score + idea.feasibility_score + idea.coherence_score) / 3);
}

export function IdeaGrid(props: { ideas: Idea[]; onOpen: (ideaId: string) => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--active)]">Ranked Ideas</div>
        <div className="text-xs text-[var(--muted)]">{props.ideas.length}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {props.ideas.map((idea) => (
            <button
              key={idea.id}
              type="button"
              onClick={() => props.onOpen(idea.id)}
              className="group flex h-full min-h-[132px] flex-col rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-4 text-left shadow-[var(--shadow)] transition-colors hover:bg-[var(--hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-sm font-semibold text-[var(--text)] group-hover:text-[var(--active)]">
                    {idea.title}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">score</div>
                  <div className="font-mono text-2xl font-bold text-[var(--active)]">{combinedScore(idea)}</div>
                </div>
              </div>
              <div className="mt-2 line-clamp-3 text-xs text-[var(--muted)]">{idea.description}</div>
              <div className="mt-auto pt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                click to view details
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: build sukses.

---

### Task 3: Refactor IdeaDetail wrapper for modal embedding

**Files:**
- Modify: `frontend/src/components/IdeaDetail.tsx`

- [ ] **Step 1: Add `variant` prop**

```tsx
export function IdeaDetail(props: {
  idea: Idea | null;
  onOverride?: (ideaId: string, input: { novelty_override?: number; feasibility_override?: number }) => Promise<Idea>;
  variant?: "panel" | "embedded";
}) {
  const variant = props.variant ?? "panel";
  // ...
  const wrapperClass =
    variant === "embedded"
      ? "min-h-0 overflow-y-auto"
      : "h-full min-h-0 overflow-y-auto rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]";
  // gunakan wrapperClass di container utama
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: build sukses.

---

### Task 4: Implement modal “Idea Detail” + export actions

**Files:**
- Create: `frontend/src/components/IdeaDetailModal.tsx`

- [ ] **Step 1: Create modal component**

```tsx
import { useEffect, useMemo, useState } from "react";
import type { Idea, PipelineResult } from "../../../shared/types";
import { IdeaDetail } from "./IdeaDetail";
import type { ToastType } from "./Toast";
import { buildIdeaExport, buildTraePrompt, copyToClipboard, downloadJson } from "../lib/exportToTrae";

export function IdeaDetailModal(props: {
  open: boolean;
  result: PipelineResult;
  idea: Idea | null;
  onClose: () => void;
  onOverride: (ideaId: string, input: { novelty_override?: number; feasibility_override?: number }) => Promise<Idea>;
  toast: (message: string, type?: ToastType) => void;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const payload = useMemo(() => (props.idea ? buildIdeaExport(props.result, props.idea) : null), [props.idea, props.result]);

  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);

  if (!props.open || !props.idea) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={props.onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[920px] overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--active)]">Idea Detail</div>
            <div className="truncate text-xs text-[var(--muted)]">{props.idea.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={async () => {
                if (!payload) return;
                setIsExporting(true);
                try {
                  const prompt = buildTraePrompt(payload);
                  await copyToClipboard(prompt);
                  props.toast("Export prompt copied.", "ok");
                } catch {
                  props.toast("Copy failed. Try again.", "error");
                } finally {
                  setIsExporting(false);
                }
              }}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
            >
              Export to TRAE
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => {
                if (!payload) return;
                downloadJson("eureka-idea-export.json", payload);
                props.toast("Export JSON downloaded.", "ok");
              }}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-[10px] border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--hover)]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-160px)] overflow-y-auto p-5">
          <IdeaDetail
            idea={props.idea}
            variant="embedded"
            onOverride={async (ideaId, input) => {
              const updated = await props.onOverride(ideaId, input);
              props.toast("Override applied.", "ok");
              return updated;
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: build sukses.

---

### Task 5: Wire grid + modal into Research tab

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Replace IdeaList/IdeaDetail layout with IdeaGrid**

Target perubahan untuk branch `pipeline.result ? (...)` di tab `research`:
- Kiri: `ROIPanel` (tetap)
- Kanan: `IdeaGrid`
- Modal: `IdeaDetailModal` di bawah `<ToastViewport />` agar overlay di atas.

Contoh wiring (potongan utama):

```tsx
import { IdeaDetailModal } from "./components/IdeaDetailModal";
import { IdeaGrid } from "./components/IdeaGrid";
// ...
const [ideaModalOpen, setIdeaModalOpen] = useState(false);

const openIdea = (id: string) => {
  setSelectedIdeaId(id);
  setIdeaModalOpen(true);
};
// ...
{pipeline.result ? (
  <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,780px)]">
    <div className="flex min-h-0 flex-col gap-4">
      <ROIPanel ... />
    </div>
    <div className="min-h-0">
      <IdeaGrid ideas={pipeline.result.ideas} onOpen={openIdea} />
    </div>
  </div>
) : ...}

<IdeaDetailModal
  open={ideaModalOpen}
  result={pipeline.result}
  idea={selectedIdea}
  toast={toast}
  onClose={() => setIdeaModalOpen(false)}
  onOverride={async (ideaId, input) => {
    const updated = await pipeline.applyOverride(ideaId, input);
    pipeline.pushLog({ level: "ok", text: "Override applied." });
    return updated;
  }}
/>
```

- [ ] **Step 2: Ensure close resets only modal (selectedIdeaId tetap boleh stay)**

Modal close hanya `setIdeaModalOpen(false)` agar next open cepat.

- [ ] **Step 3: Verify build + quick manual test**

Run:
```bash
npm run build
```

Manual checklist:
- Ideas tampil grid.
- Klik card membuka modal.
- Scroll terjadi di modal, bukan page.
- Export to TRAE menyalin prompt (cek paste).
- Download JSON menghasilkan file.
- ESC / click overlay menutup modal.

---

## Self-Review (Spec coverage)

- Ideas grid + modal: covered Task 2, 4, 5.
- Scroll detail di modal: covered Task 4 (max-height + overflow).
- Export to TRAE (copy + JSON): covered Task 1 + Task 4.

