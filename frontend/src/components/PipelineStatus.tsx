import type { AgentName, PipelineEvent } from "../../../shared/types";

const LABEL: Record<AgentName, string> = {
  scout: "Scout",
  gap_analyst: "Gap",
  innovator: "Innovator",
  critic: "Critic",
  coherence: "Coherence",
};

function statusClasses(status: PipelineEvent["status"]) {
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

export function PipelineStatus(props: { events: PipelineEvent[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {props.events.map((ev) => (
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

