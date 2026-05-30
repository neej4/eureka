export function ErrorState(props: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[6px] border border-[var(--err)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <div className="text-sm font-semibold text-[var(--err)]">{props.title ?? "Something went wrong"}</div>
      <div className="mt-2 text-sm text-[var(--text)]">{props.message}</div>
      {props.onRetry ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={props.onRetry}
            className="rounded-[6px] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[var(--bg)]"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

