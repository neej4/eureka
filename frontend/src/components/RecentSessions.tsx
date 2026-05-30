import type { RecentItem } from "../state/recent";

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function RecentSessions(props: { items: RecentItem[]; onOpen: (id: string) => void; onClear: () => void }) {
  return (
    <div className="max-w-[960px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--active)]">Recent Pipeline Sessions</div>
        <button
          type="button"
          onClick={props.onClear}
          className="rounded-[6px] border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
        >
          Clear
        </button>
      </div>

      {props.items.length === 0 ? (
        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
          No runs yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {props.items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => props.onOpen(it.id)}
              className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[var(--shadow)] hover:bg-[var(--hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--active)]">{it.topic}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{formatTime(it.saved_at)} • saved locally</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-[var(--muted)]">ideas</div>
                  <div className="font-mono text-lg font-semibold text-[var(--active)]">{it.result.ideas.length}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">papers</div>
                  <div className="font-mono text-sm font-semibold text-[var(--active)]">{it.result.papers.length}</div>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">clusters</div>
                  <div className="font-mono text-sm font-semibold text-[var(--active)]">{it.result.clusters.length}</div>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">time</div>
                  <div className="font-mono text-sm font-semibold text-[var(--active)]">
                    {it.result.duration_seconds.toFixed(0)}s
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

