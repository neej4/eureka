export function ROIPanel(props: { durationSeconds: number }) {
  const baselineSeconds = 14 * 24 * 60 * 60;
  const savedRatio = Math.max(0, Math.min(1, 1 - props.durationSeconds / baselineSeconds));
  const savedPct = Math.round(savedRatio * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">ROI (mock)</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Baseline</div>
          <div className="text-sm font-semibold text-slate-900">~2 weeks</div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Actual</div>
          <div className="text-sm font-semibold text-slate-900">{props.durationSeconds}s</div>
        </div>
        <div className="rounded-md border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Savings</div>
          <div className="text-sm font-semibold text-slate-900">{savedPct}%</div>
        </div>
      </div>
    </div>
  );
}

