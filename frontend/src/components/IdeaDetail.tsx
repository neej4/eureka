import type { Idea } from "../../../shared/types";

type ConfidenceLevel = Idea["confidence_level"];

function confidenceClasses(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "bg-emerald-100 text-emerald-900";
    case "medium":
      return "bg-amber-100 text-amber-900";
    case "low":
      return "bg-rose-100 text-rose-900";
  }
}

function coherenceClasses(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-900";
  if (score >= 50) return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-900";
}

export function IdeaDetail(props: { idea: Idea | null }) {
  if (!props.idea) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Idea Detail</div>
        <div className="mt-2 text-sm text-slate-500">Pilih ide untuk melihat detail.</div>
      </div>
    );
  }

  const idea = props.idea;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{idea.title}</div>
          <div className="mt-1 text-sm text-slate-600">{idea.description}</div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <div className={["rounded-full px-2 py-1 text-xs font-semibold", confidenceClasses(idea.confidence_level)].join(" ")}>
            confidence: {idea.confidence_level}
          </div>
          <div className={["rounded-full px-2 py-1 text-xs font-semibold", coherenceClasses(idea.coherence_score)].join(" ")}>
            coherence: {idea.coherence_score}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Novelty</div>
          <div className="text-lg font-bold text-slate-900">
            {idea.novelty_score}{" "}
            <span className="text-sm text-slate-500">{idea.novelty_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Feasibility</div>
          <div className="text-lg font-bold text-slate-900">
            {idea.feasibility_score}{" "}
            <span className="text-sm text-slate-500">{idea.feasibility_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Human adjusted</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {idea.is_human_adjusted ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-3 md:col-span-2">
          <div className="text-xs font-semibold text-slate-900">Validation plan</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-slate-700">
            {idea.validation_plan.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-900">Citations</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {idea.citations.map((c) => (
            <span key={c} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
