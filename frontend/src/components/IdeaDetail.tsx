import type { Idea } from "../../../shared/types";

type ConfidenceLevel = Idea["confidence_level"];

function confidenceClasses(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "bg-[var(--hover)] text-[var(--active)]";
    case "medium":
      return "bg-[var(--hover)] text-[var(--active)]";
    case "low":
      return "bg-[var(--card)] text-[var(--err)]";
  }
}

function coherenceClasses(score: number) {
  if (score >= 70) return "bg-[var(--hover)] text-[var(--active)]";
  if (score >= 50) return "bg-[var(--hover)] text-[var(--active)]";
  return "bg-[var(--card)] text-[var(--err)]";
}

export function IdeaDetail(props: { idea: Idea | null }) {
  if (!props.idea) {
    return (
      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <div className="text-sm font-semibold text-[var(--active)]">Idea Detail</div>
        <div className="mt-2 text-sm text-[var(--muted)]">Select an idea to see details.</div>
      </div>
    );
  }

  const idea = props.idea;

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--active)]">{idea.title}</div>
          <div className="mt-1 text-sm text-[var(--text)]">{idea.description}</div>
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
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Novelty</div>
          <div className="text-lg font-bold text-[var(--active)]">
            {idea.novelty_score}{" "}
            <span className="text-sm font-medium text-[var(--muted)]">{idea.novelty_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Feasibility</div>
          <div className="text-lg font-bold text-[var(--active)]">
            {idea.feasibility_score}{" "}
            <span className="text-sm font-medium text-[var(--muted)]">{idea.feasibility_score_range}</span>
          </div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Human adjusted</div>
          <div className="mt-1 text-sm font-semibold text-[var(--active)]">
            {idea.is_human_adjusted ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 md:col-span-2">
          <div className="text-xs font-semibold text-[var(--active)]">Validation plan</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-[var(--text)]">
            {idea.validation_plan.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
        <div className="text-xs font-semibold text-[var(--active)]">Citations</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {idea.citations.map((c) => (
            <span key={c} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 font-mono text-xs font-semibold text-[var(--text)]">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
