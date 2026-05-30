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

  const payload = useMemo(
    () => (props.idea ? buildIdeaExport(props.result, props.idea) : null),
    [props.idea, props.result],
  );

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
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={props.onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[900px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[var(--text)]">Idea Detail</div>
            <div className="truncate text-xs text-[var(--muted)]">{props.idea.title}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!payload || isExporting}
              onClick={async () => {
                if (!payload) return;
                setIsExporting(true);
                try {
                  await copyToClipboard(buildTraePrompt(payload));
                  props.toast("Prompt copied.", "ok");
                } catch {
                  props.toast("Copy failed.", "error");
                } finally {
                  setIsExporting(false);
                }
              }}
              className="rounded-[var(--radius)] bg-[var(--active)] px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Export to TRAE
            </button>
            <button
              type="button"
              disabled={!payload || isExporting}
              onClick={() => {
                if (!payload) return;
                downloadJson("eureka-idea-export.json", payload);
                props.toast("JSON downloaded.", "ok");
              }}
              className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-40"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-[var(--radius)] px-4 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-160px)] overflow-y-auto p-6">
          <IdeaDetail
            idea={props.idea}
            variant="embedded"
            onOverride={async (ideaId, input) => props.onOverride(ideaId, input)}
          />
        </div>
      </div>
    </div>
  );
}
