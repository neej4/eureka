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

