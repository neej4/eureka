import type { Idea } from "../../../shared/types";

function combinedScore(idea: Idea) {
  return Math.round((idea.novelty_score + idea.feasibility_score + idea.coherence_score) / 3);
}

export function IdeaList(props: {
  ideas: Idea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 text-sm font-semibold text-[var(--active)]">Ranked Ideas</div>
      <div className="flex flex-col gap-2">
        {props.ideas.map((idea) => {
          const isSelected = props.selectedId === idea.id;
          return (
            <button
              key={idea.id}
              type="button"
              onClick={() => props.onSelect(idea.id)}
              className={[
                "w-full rounded-md border px-3 py-3 text-left",
                isSelected
                  ? "border-[var(--active)] bg-[var(--hover)]"
                  : "border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--hover)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--active)]">{idea.title}</div>
                  <div className="line-clamp-2 text-xs text-[var(--muted)]">{idea.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-[var(--muted)]">score</div>
                  <div className="text-lg font-bold text-[var(--active)]">{combinedScore(idea)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
