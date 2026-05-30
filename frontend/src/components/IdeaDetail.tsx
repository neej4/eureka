import type { Idea } from "../../../shared/types";

type ConfidenceLevel = Idea["confidence_level"];

function confidenceClasses(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "bg-emerald-500/15 text-emerald-200";
    case "medium":
      return "bg-amber-500/15 text-amber-200";
    case "low":
      return "bg-rose-500/15 text-rose-200";
  }
}

function coherenceClasses(score: number) {
  if (score >= 70) return "bg-emerald-500/15 text-emerald-200";
  if (score >= 50) return "bg-amber-500/15 text-amber-200";
  return "bg-rose-500/15 text-rose-200";
}

export function IdeaDetail(props: { idea: Idea | null }) {
  if (!props.idea) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <div className="text-sm font-semibold text-zinc-50">Idea Detail</div>
        <div className="mt-2 text-sm text-zinc-400">Pilih ide untuk melihat detail.</div>
      </div>
    );
  }

  const idea = props.idea;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-50">{idea.title}</div>
          <div className="mt-1 text-sm text-zinc-300">{idea.description}</div>
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
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Novelty</div>
          <div className="text-lg font-bold text-zinc-50">
            {idea.novelty_score}{" "}
            <span className="text-sm font-medium text-zinc-500">{idea.novelty_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Feasibility</div>
          <div className="text-lg font-bold text-zinc-50">
            {idea.feasibility_score}{" "}
            <span className="text-sm font-medium text-zinc-500">{idea.feasibility_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Human adjusted</div>
          <div className="mt-1 text-sm font-semibold text-zinc-50">
            {idea.is_human_adjusted ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3 md:col-span-2">
          <div className="text-xs font-semibold text-zinc-50">Validation plan</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-zinc-300">
            {idea.validation_plan.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
        <div className="text-xs font-semibold text-zinc-50">Citations</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {idea.citations.map((c) => (
            <span key={c} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1 font-mono text-xs font-semibold text-zinc-300">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
