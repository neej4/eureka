export function IdeaSkeletonList(props: { count?: number }) {
  const count = props.count ?? 6;
  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 text-sm font-semibold text-[var(--active)]">Ranked Ideas</div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-[70%] rounded bg-[var(--hover)]" />
                <div className="mt-2 h-3 w-[95%] rounded bg-[var(--hover)] opacity-80" />
                <div className="mt-1 h-3 w-[75%] rounded bg-[var(--hover)] opacity-70" />
              </div>
              <div className="shrink-0 text-right">
                <div className="h-3 w-10 rounded bg-[var(--hover)] opacity-70" />
                <div className="mt-2 h-6 w-10 rounded bg-[var(--hover)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PanelSkeleton(props: { title: string; lines?: number }) {
  const lines = props.lines ?? 5;
  return (
    <div className="animate-pulse rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="text-sm font-semibold text-[var(--active)]">{props.title}</div>
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 w-full rounded bg-[var(--hover)] opacity-80" />
        ))}
      </div>
    </div>
  );
}

