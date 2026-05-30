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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">Ranked Ideas</div>
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
                isSelected ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{idea.title}</div>
                  <div className="line-clamp-2 text-xs text-slate-600">{idea.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-500">score</div>
                  <div className="text-lg font-bold text-slate-900">{combinedScore(idea)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

