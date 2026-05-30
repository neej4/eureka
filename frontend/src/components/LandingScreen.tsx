import { useMemo } from "react";
import { Icon } from "./Icon";

export function LandingScreen(props: {
  topic: string;
  onTopicChange: (t: string) => void;
  onRun: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}) {
  const examples = useMemo(
    () => [
      "foundation models for scientific discovery",
      "graph neural networks for drug discovery",
      "federated learning privacy attacks",
      "RAG evaluation benchmarks",
      "agentic workflows for literature review",
      "knowledge graphs for scientific discovery",
    ],
    [],
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[900px] flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div
          className="select-none text-[52px] font-bold tracking-[0.16em] text-[var(--text)] md:text-[68px]"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          EUREKA
        </div>
        <div className="mt-4 text-[15px] text-[var(--muted)]">
          Turn a research topic into breakthrough ideas in minutes.
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-col items-stretch gap-2 rounded-[var(--radius)] bg-[var(--card)] p-2 md:flex-row md:items-center md:gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="ui-search" className="h-4 w-4" />
            </div>
            <input
              value={props.topic}
              onChange={(e) => props.onTopicChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") props.onRun();
              }}
              placeholder="Enter a research topic..."
              className="h-12 w-full rounded-[var(--radius)] bg-[var(--bg)] pl-10 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--active)]/20"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={props.onRun}
              disabled={props.topic.trim().length < 3}
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-[var(--active)] px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              <Icon name="ui-spark" className="h-4 w-4" />
              Run
            </button>
            <button
              type="button"
              onClick={props.onOpenProfile}
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
            >
              <Icon name="ui-user" className="h-4 w-4" />
              Profile
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {examples.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.onTopicChange(t)}
              className="rounded-[999px] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--active)] hover:text-[var(--active)]"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: "ui-spark",
              title: "Live Reasoning",
              body: "Watch 5 AI agents analyze, gap-find, and synthesize ideas in real time.",
            },
            {
              icon: "ui-bookmark",
              title: "Ranked Ideas",
              body: "Browse scored ideas by novelty and feasibility. Click any card for full detail.",
            },
            {
              icon: "ui-spark",
              title: "Knowledge Map",
              body: "Explore clusters and papers as an interactive graph. Drag, zoom, filter.",
            },
          ].map((x) => (
            <div
              key={x.title}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--active-soft)] text-[var(--active)]">
                <Icon name={x.icon} className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-[var(--text)]">{x.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{x.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
