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
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "running":
      return "bg-amber-100 text-amber-900 border-amber-200 animate-pulse";
    case "completed":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "failed":
      return "bg-rose-100 text-rose-900 border-rose-200";
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
