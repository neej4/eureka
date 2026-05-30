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
      return "bg-zinc-900/40 text-zinc-300 border-zinc-800";
    case "running":
      return "bg-amber-500/15 text-amber-200 border-amber-500/30 animate-pulse";
    case "completed":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
    case "failed":
      return "bg-rose-500/15 text-rose-200 border-rose-500/30";
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
