export type ToastType = "info" | "ok" | "error";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

function toastClasses(type: ToastType) {
  switch (type) {
    case "info":
      return "border-[var(--border)] bg-[var(--card)] text-[var(--text)]";
    case "ok":
      return "border-[var(--border)] bg-[var(--hover)] text-[var(--active)]";
    case "error":
      return "border-[var(--err)] bg-[var(--card)] text-[var(--err)]";
  }
}

export function ToastViewport(props: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (props.toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2">
      {props.toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto flex items-start justify-between gap-3 rounded-[6px] border px-3 py-2 text-sm shadow-[var(--shadow)]",
            toastClasses(t.type),
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="break-words">{t.message}</div>
          </div>
          <button
            type="button"
            onClick={() => props.onDismiss(t.id)}
            className="shrink-0 rounded-[6px] border border-[var(--border)] bg-transparent px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--hover)]"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}

