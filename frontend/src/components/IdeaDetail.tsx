import { useEffect, useMemo, useState } from "react";
import type { Idea } from "../../../shared/types";

type ConfidenceLevel = Idea["confidence_level"];

function confidenceColor(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "bg-[var(--ok-soft)] text-[var(--ok)]";
    case "medium":
      return "bg-[var(--active-soft)] text-[var(--active)]";
    case "low":
      return "bg-[var(--err-soft)] text-[var(--err)]";
  }
}

export function IdeaDetail(props: {
  idea: Idea | null;
  onOverride?: (ideaId: string, input: { novelty_override?: number; feasibility_override?: number }) => Promise<Idea>;
  variant?: "panel" | "embedded";
}) {
  if (!props.idea) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <div className="text-sm font-semibold text-[var(--muted)]">Select an idea to see details.</div>
      </div>
    );
  }

  const idea = props.idea;
  const variant = props.variant ?? "panel";
  const [noveltyOverride, setNoveltyOverride] = useState<number>(idea.human_novelty_override ?? idea.novelty_score);
  const [feasibilityOverride, setFeasibilityOverride] = useState<number>(
    idea.human_feasibility_override ?? idea.feasibility_score,
  );
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setNoveltyOverride(idea.human_novelty_override ?? idea.novelty_score);
    setFeasibilityOverride(idea.human_feasibility_override ?? idea.feasibility_score);
  }, [idea]);

  const hasChanges = useMemo(() => {
    const baseNovelty = idea.human_novelty_override ?? idea.novelty_score;
    const baseFeas = idea.human_feasibility_override ?? idea.feasibility_score;
    return noveltyOverride !== baseNovelty || feasibilityOverride !== baseFeas;
  }, [feasibilityOverride, idea, noveltyOverride]);

  const wrapperClass =
    variant === "embedded"
      ? "min-h-0 overflow-y-auto"
      : "h-full min-h-0 overflow-y-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]";

  return (
    <div className={wrapperClass}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-[var(--text)]">{idea.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{idea.description}</div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${confidenceColor(idea.confidence_level)}`}>
            {idea.confidence_level}
          </span>
          <span className="inline-block rounded-full bg-[var(--bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">
            coh {idea.coherence_score}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Novelty", score: idea.novelty_score, range: idea.novelty_score_range },
          { label: "Feasibility", score: idea.feasibility_score, range: idea.feasibility_score_range },
          { label: "Adjusted", score: idea.is_human_adjusted ? "Yes" : "—", range: "" },
        ].map((x) => (
          <div key={x.label} className="flex flex-col gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{x.label}</span>
            <span className="text-xl font-bold text-[var(--text)]">
              {x.score}
              {x.range && <span className="ml-1 text-sm font-normal text-[var(--muted)]">{x.range}</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Adjust Scores</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Novelty</span>
              <span className="font-mono font-semibold text-[var(--active)]">{noveltyOverride}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={noveltyOverride}
              onChange={(e) => setNoveltyOverride(Number(e.target.value))}
              className="w-full accent-[var(--active)]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Feasibility</span>
              <span className="font-mono font-semibold text-[var(--active)]">{feasibilityOverride}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={feasibilityOverride}
              onChange={(e) => setFeasibilityOverride(Number(e.target.value))}
              className="w-full accent-[var(--active)]"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!hasChanges || isApplying}
            onClick={async () => {
              if (!props.onOverride) return;
              setIsApplying(true);
              try {
                await props.onOverride(idea.id, { novelty_override: noveltyOverride, feasibility_override: feasibilityOverride });
              } finally {
                setIsApplying(false);
              }
            }}
            className="rounded-[var(--radius)] bg-[var(--active)] px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isApplying ? "Saving..." : "Apply"}
          </button>
        </div>
      </div>

      {idea.validation_plan.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Validation Plan</div>
          <ol className="list-inside list-decimal space-y-1.5 text-sm text-[var(--text)]">
            {idea.validation_plan.map((x) => (
              <li key={x} className="leading-relaxed">{x}</li>
            ))}
          </ol>
        </div>
      )}

      {idea.citations.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Citations</div>
          <div className="flex flex-wrap gap-2">
            {idea.citations.map((c) => (
              <span key={c} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 font-mono text-xs text-[var(--muted)]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
