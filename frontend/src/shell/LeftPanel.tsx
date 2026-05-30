import type { AgentStatus } from "../../../shared/types";
import { PipelineStatus } from "../components/PipelineStatus";

export type LogLine = {
  level: "info" | "ok" | "warn" | "err";
  text: string;
};

export function LeftPanel(props: { logs: LogLine[]; agents: AgentStatus[] }) {
  const total = props.agents.length || 1;
  const completed = props.agents.filter((a) => a.status === "completed").length;
  const failed = props.agents.some((a) => a.status === "failed");
  const progressPct = Math.round((completed / total) * 100);

  return (
    <aside className="left h-full overflow-hidden border-r border-[var(--border)] bg-[var(--bg)]">
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Sources to Scan
          </div>
          <div id="catsContainer" className="flex flex-col gap-2">
            <details className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3" open>
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">
                Computer Science
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--text)]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>LLM Agents</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>RAG Evaluation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Graph Reasoning</span>
                </label>
              </div>
            </details>
            <details className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">
                Bio / Health
              </summary>
              <div className="mt-3 flex flex-col gap-2 text-xs text-[var(--text)]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Clinical NLP</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Drug Discovery</span>
                </label>
              </div>
            </details>
          </div>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Pipeline</div>
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="mb-3 h-2 w-full overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg)]">
              <div
                className={[
                  "h-full transition-[width] duration-300",
                  failed ? "bg-[var(--err)]" : "bg-[var(--active)]",
                ].join(" ")}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <PipelineStatus agents={props.agents} />
          </div>
        </section>

        <section className="flex min-h-[260px] flex-1 flex-col">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Console
          </div>
          <div
            id="logBox"
            className="log-box flex-1 overflow-y-auto rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 font-mono text-xs text-[var(--text)]"
          >
            {props.logs.length === 0 ? (
              <div className="info text-[var(--muted)]">No logs yet. Run the pipeline.</div>
            ) : (
              props.logs.map((l, idx) => (
                <div
                  key={idx}
                  className={[
                    l.level,
                    l.level === "info" ? "text-[var(--muted)]" : "",
                    l.level === "ok" ? "text-[var(--active)]" : "",
                    l.level === "warn" ? "italic text-[var(--text)]" : "",
                    l.level === "err" ? "font-bold text-[var(--err)]" : "",
                  ].join(" ")}
                >
                  {l.text}
                </div>
              ))
            )}
          </div>
        </section>

        <section id="transparencyPanel" className="hidden">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Data Transparency
          </div>
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 text-xs text-[var(--text)]">
            <div className="text-[var(--muted)]">Shown after a run.</div>
          </div>
        </section>
      </div>
    </aside>
  );
}

