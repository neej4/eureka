import type { Idea } from "../../../shared/types";

function combinedScore(idea: Idea) {
  return Math.round((idea.novelty_score + idea.feasibility_score + idea.coherence_score) / 3);
}

export function IdeaGrid(props: { ideas: Idea[]; onOpen: (ideaId: string) => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
        <div className="text-sm font-semibold text-[var(--text)]">Ranked Ideas</div>
        <div className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
          {props.ideas.length}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {props.ideas.map((idea) => (
            <button
              key={idea.id}
              type="button"
              onClick={() => props.onOpen(idea.id)}
              className="group flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition-all hover:border-[var(--active)]/40 hover:shadow-[var(--shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--active)]">
                    {idea.title}
                  </div>
                </div>
                <div className="shrink-0 rounded-[var(--radius)] bg-[var(--active-soft)] px-2 py-1 text-sm font-bold text-[var(--active)]">
                  {combinedScore(idea)}
                </div>
              </div>
              <div className="line-clamp-3 text-xs leading-relaxed text-[var(--muted)]">{idea.description}</div>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <div className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                  {idea.confidence_level}
                </div>
                <div className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                  coh {idea.coherence_score}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
