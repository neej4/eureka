export function ROIPanel(props: {
  durationSeconds: number;
  baselineHumanDays: number;
  roiPercentage: number;
}) {
  const baselineSeconds = props.baselineHumanDays * 24 * 60 * 60;
  const savedRatio = Math.max(0, Math.min(1, 1 - props.durationSeconds / baselineSeconds));
  const savedPct = Math.round(savedRatio * 100);

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 text-sm font-semibold text-[var(--active)]">ROI</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Baseline</div>
          <div className="text-sm font-semibold text-[var(--active)]">{props.baselineHumanDays} days</div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Actual</div>
          <div className="text-sm font-semibold text-[var(--active)]">{props.durationSeconds}s</div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="text-xs text-[var(--muted)]">Savings</div>
          <div className="text-sm font-semibold text-[var(--active)]">
            {savedPct}% <span className="text-[var(--muted)]">• ROI {props.roiPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
