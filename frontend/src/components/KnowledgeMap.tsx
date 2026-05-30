import type { Cluster } from "../../../shared/types";

export function KnowledgeMap(props: { clusters: Cluster[] }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-50">Knowledge Map</div>
        <div className="text-xs text-zinc-500">placeholder</div>
      </div>
      <div className="flex flex-col gap-2">
        {props.clusters.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-50">{c.name}</div>
              <div className="text-xs text-zinc-500">{c.paper_count} papers</div>
            </div>
            <div
              className={[
                "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                c.status === "white_space"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-zinc-900/40 text-zinc-300",
              ].join(" ")}
            >
              {c.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
