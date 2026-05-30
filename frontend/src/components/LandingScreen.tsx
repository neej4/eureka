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
    <div className="mx-auto flex h-full w-full max-w-[980px] flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="select-none text-[56px] font-bold tracking-[2px] text-[var(--text)] md:text-[72px]">
          EUREKA
        </div>
        <div className="mt-3 text-sm text-[var(--muted)] md:text-base">
          Research breakthrough engine. Enter a topic to generate ideas and a knowledge map.
        </div>
      </div>

      <div className="mt-10 w-full">
        <div className="flex flex-col items-stretch gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)] md:flex-row md:items-center">
          <div className="relative w-full flex-1">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="ui-search" className="h-4 w-4" />
            </div>
            <input
              value={props.topic}
              onChange={(e) => props.onTopicChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") props.onRun();
              }}
              placeholder="Search a research topic..."
              className="h-[52px] w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg)] pl-11 pr-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={props.onRun}
              disabled={props.topic.trim().length < 3}
              className="inline-flex h-[52px] items-center gap-2 rounded-[14px] bg-[var(--active)] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Icon name="ui-spark" className="h-4 w-4" />
              Run
            </button>
            <button
              type="button"
              onClick={props.onOpenProfile}
              className="inline-flex h-[52px] items-center gap-2 rounded-[14px] border border-[var(--border)] bg-transparent px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
            >
              <Icon name="ui-user" className="h-4 w-4 text-[var(--muted)]" />
              Profile
            </button>
            <button
              type="button"
              onClick={props.onOpenSettings}
              className="inline-flex h-[52px] items-center gap-2 rounded-[14px] border border-[var(--border)] bg-transparent px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
            >
              <Icon name="ui-settings" className="h-4 w-4 text-[var(--muted)]" />
              Settings
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {examples.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.onTopicChange(t)}
              className="rounded-[999px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { title: "Live pipeline", body: "Watch agent progress while the system works." },
            { title: "Save & export", body: "Bookmark ideas and export a shortlist." },
            { title: "Obsidian-like map", body: "Explore clusters and papers as an interactive graph." },
          ].map((x) => (
            <div key={x.title} className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{x.title}</div>
              <div className="mt-2 text-sm text-[var(--text)]">{x.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
