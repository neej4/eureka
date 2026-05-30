import type { Idea } from "../../../shared/types";

function combinedScore(idea: Idea) {
  return Math.round((idea.novelty_score + idea.feasibility_score + idea.coherence_score) / 3);
}

export function IdeaList(props: {
  ideas: Idea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  bookmarkedIds?: Set<string>;
  onToggleBookmark?: (idea: Idea) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--active)]">Ranked Ideas</div>
        <div className="text-xs text-[var(--muted)]">{props.ideas.length}</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {props.ideas.map((idea) => {
          const isSelected = props.selectedId === idea.id;
          const isBookmarked = props.bookmarkedIds?.has(idea.id) ?? false;
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--active)]">{idea.title}</div>
                    </div>
                    {props.onToggleBookmark ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onToggleBookmark?.(idea);
                        }}
                        className={[
                          "shrink-0 rounded-[6px] border px-2 py-1 text-[10px] font-semibold",
                          isBookmarked
                            ? "border-[var(--active)] bg-[var(--hover)] text-[var(--active)]"
                            : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--hover)]",
                        ].join(" ")}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark idea"}
                        title={isBookmarked ? "Saved" : "Save"}
                      >
                        {isBookmarked ? "Saved" : "Save"}
                      </button>
                    ) : null}
                  </div>
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
