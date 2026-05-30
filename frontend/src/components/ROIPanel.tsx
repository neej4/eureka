export function ROIPanel(props: {
  durationSeconds: number;
  baselineHumanDays: number;
  roiPercentage: number;
}) {
  const baselineSeconds = props.baselineHumanDays * 24 * 60 * 60;
  const savedRatio = Math.max(0, Math.min(1, 1 - props.durationSeconds / baselineSeconds));
  const savedPct = Math.round(savedRatio * 100);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="mb-3 text-sm font-semibold text-zinc-50">ROI</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Baseline</div>
          <div className="text-sm font-semibold text-zinc-50">{props.baselineHumanDays} days</div>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Actual</div>
          <div className="text-sm font-semibold text-zinc-50">{props.durationSeconds}s</div>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-950/20 p-3">
          <div className="text-xs text-zinc-500">Savings</div>
          <div className="text-sm font-semibold text-zinc-50">
            {savedPct}% <span className="text-zinc-500">• ROI {props.roiPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
