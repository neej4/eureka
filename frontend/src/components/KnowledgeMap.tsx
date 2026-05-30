import type { Cluster } from "../../../shared/types";

export function KnowledgeMap(props: { clusters: Cluster[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Knowledge Map (placeholder)</div>
        <div className="text-xs text-slate-500">D3 graph nanti</div>
      </div>
      <div className="flex flex-col gap-2">
        {props.clusters.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-900">{c.name}</div>
              <div className="text-xs text-slate-500">{c.paper_count} papers</div>
            </div>
            <div
              className={[
                "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                c.status === "white_space"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-slate-100 text-slate-700",
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
