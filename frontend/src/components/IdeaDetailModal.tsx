import { useEffect, useMemo, useState } from "react";
import type { Idea, PipelineResult } from "../../../shared/types";
import type { ToastType } from "./Toast";
import { IdeaDetail } from "./IdeaDetail";
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
              disabled={!payload || isExporting}
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
              disabled={!payload || isExporting}
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
              return props.onOverride(ideaId, input);
            }}
          />
        </div>
      </div>
    </div>
  );
}

