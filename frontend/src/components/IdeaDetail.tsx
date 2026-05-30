import { useEffect, useMemo, useState } from "react";
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

export function IdeaDetail(props: {
  idea: Idea | null;
  onOverride?: (ideaId: string, input: { novelty_override?: number; feasibility_override?: number }) => Promise<Idea>;
}) {
  if (!props.idea) {
    return (
      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <div className="text-sm font-semibold text-[var(--active)]">Idea Detail</div>
        <div className="mt-2 text-sm text-[var(--muted)]">Select an idea to see details.</div>
      </div>
    );
  }

  const idea = props.idea;
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

      <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
        <div className="mb-2 text-xs font-semibold text-[var(--active)]">Human overrides</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Novelty</span>
              <span className="font-mono text-[var(--active)]">{noveltyOverride}</span>
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
              <span className="font-mono text-[var(--active)]">{feasibilityOverride}</span>
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
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={!hasChanges || isApplying}
            onClick={async () => {
              if (!props.onOverride) return;
              setIsApplying(true);
              try {
                await props.onOverride(idea.id, {
                  novelty_override: noveltyOverride,
                  feasibility_override: feasibilityOverride,
                });
              } finally {
                setIsApplying(false);
              }
            }}
            className="rounded-[6px] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[var(--bg)] disabled:opacity-50"
          >
            Apply
          </button>
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
