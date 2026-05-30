import type { AgentStatus } from "../../../shared/types";

type AgentKey = AgentStatus["agent"];

const LABEL: Record<AgentKey, string> = {
  scout: "Scout",
  "gap-analyst": "Gap",
  innovator: "Innovator",
  critic: "Critic",
  "coherence-validator": "Coherence",
};

function statusClasses(status: AgentStatus["status"]) {
  switch (status) {
    case "pending":
      return "bg-[var(--card)] text-[var(--muted)] border-[var(--border)]";
    case "running":
      return "bg-[var(--hover)] text-[var(--active)] border-dashed border-[var(--active)] animate-pulse";
    case "completed":
      return "bg-[var(--hover)] text-[var(--active)] border-[var(--border)]";
    case "failed":
      return "bg-[var(--card)] text-[var(--err)] border-[var(--err)]";
  }
}

export function PipelineStatus(props: { agents: AgentStatus[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {props.agents.map((ev) => (
        <div
          key={ev.agent}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
            statusClasses(ev.status),
          ].join(" ")}
        >
          <span>{LABEL[ev.agent]}</span>
          <span className="font-normal opacity-80">{ev.status}</span>
        </div>
      ))}
    </div>
  );
}
