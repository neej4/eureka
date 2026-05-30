import type { Cluster } from "../../../shared/types";

export function KnowledgeMap(props: { clusters: Cluster[] }) {
  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--active)]">Knowledge Map</div>
        <div className="text-xs text-[var(--muted)]">placeholder</div>
      </div>
      <div className="flex flex-col gap-2">
        {props.clusters.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--active)]">{c.name}</div>
              <div className="text-xs text-[var(--muted)]">{c.paper_count} papers</div>
            </div>
            <div
              className={[
                "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                c.status === "white_space"
                  ? "bg-[var(--hover)] text-[var(--active)]"
                  : "bg-[var(--bg)] text-[var(--muted)]",
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
