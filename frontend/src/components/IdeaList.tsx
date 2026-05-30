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
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="mb-3 text-sm font-semibold text-zinc-50">Ranked Ideas</div>
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
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/40",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-50">{idea.title}</div>
                  <div className="line-clamp-2 text-xs text-zinc-400">{idea.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-zinc-500">score</div>
                  <div className="text-lg font-bold text-zinc-50">{combinedScore(idea)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
