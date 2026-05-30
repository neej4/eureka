import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToastType } from "./Toast";

export type ProfileMode = "academic" | "product" | "develop" | "review";
export type ProfileApproach = "any" | "computational" | "experimental" | "clinical" | "theoretical";

export type ProfileData = {
  mode: ProfileMode;
  goal: string;
  approach: ProfileApproach;
  context: string;
};

const MODES: Array<{ key: ProfileMode; label: string }> = [
  { key: "academic", label: "Academic" },
  { key: "product", label: "Product" },
  { key: "develop", label: "Develop" },
  { key: "review", label: "Review" },
];

const APPROACHES: Array<{ key: ProfileApproach; label: string }> = [
  { key: "any", label: "Any" },
  { key: "computational", label: "Computational" },
  { key: "experimental", label: "Experimental" },
  { key: "clinical", label: "Clinical" },
  { key: "theoretical", label: "Theoretical" },
];

const GOALS_BY_MODE: Record<ProfileMode, Array<{ key: string; label: string }>> = {
  academic: [
    { key: "any", label: "Any" },
    { key: "thesis", label: "Thesis" },
    { key: "publication", label: "Publication" },
    { key: "grant", label: "Grant Proposal" },
  ],
  product: [
    { key: "any", label: "Any" },
    { key: "hackathon", label: "Hackathon" },
    { key: "side_project", label: "Side Project" },
    { key: "ai_tool", label: "AI Tool" },
    { key: "industry", label: "Industry R&D" },
  ],
  develop: [
    { key: "any", label: "Any" },
    { key: "feature", label: "Feature" },
    { key: "integration", label: "Integration" },
    { key: "optimization", label: "Optimization" },
    { key: "extension", label: "Extension" },
    { key: "pivot", label: "Pivot" },
  ],
  review: [
    { key: "any", label: "Any" },
    { key: "literature_synthesis", label: "Literature Synthesis" },
  ],
};

function cardClasses(active: boolean) {
  return [
    "rounded-[6px] border px-3 py-2 text-xs font-semibold transition-colors",
    active
      ? "border-[var(--active)] bg-[var(--hover)] text-[var(--active)]"
      : "border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[var(--hover)]",
  ].join(" ");
}

type Uploaded = { name: string; size: number; type: string };

export function ProfileModal(props: {
  open: boolean;
  initial: ProfileData;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  toast: (message: string, type?: ToastType) => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<ProfileMode>(props.initial.mode);
  const [goal, setGoal] = useState<string>(props.initial.goal);
  const [approach, setApproach] = useState<ProfileApproach>(props.initial.approach);
  const [context, setContext] = useState<string>(props.initial.context);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<Uploaded[]>([]);

  useEffect(() => {
    if (!props.open) return;
    setMode(props.initial.mode);
    setGoal(props.initial.goal);
    setApproach(props.initial.approach);
    setContext(props.initial.context);
    setDragActive(false);
    setFiles([]);
  }, [props.initial, props.open]);

  const goals = useMemo(() => GOALS_BY_MODE[mode], [mode]);

  useEffect(() => {
    if (!goals.some((g) => g.key === goal)) {
      setGoal(goals[0]?.key ?? "any");
    }
  }, [goal, goals]);

  useEffect(() => {
    if (!props.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props]);

  const readTextFile = useCallback(
    async (f: File) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (ext === "pdf") {
        props.toast("PDF parsing is not supported yet. Please upload .txt, .md, or .json.", "error");
        return;
      }

      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("File read failed"));
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsText(f);
      });

      const maxChars = 12000;
      const trimmed = text.trim().slice(0, maxChars);
      const prefix = `\n\n[Attached: ${f.name}]\n`;
      setContext((prev) => {
        const next = (prev + prefix + trimmed).trim();
        return next.length > 20000 ? next.slice(next.length - 20000) : next;
      });
      props.toast("Attachment added to context.", "ok");
    },
    [props],
  );

  const handleFiles = useCallback(
    async (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const arr = Array.from(list).slice(0, 3);
      setFiles(arr.map((f) => ({ name: f.name, size: f.size, type: f.type })));
      for (const f of arr) {
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        if (!["txt", "md", "json", "pdf"].includes(ext)) {
          props.toast("Unsupported file type. Use .txt, .md, .json, or .pdf.", "error");
          continue;
        }
        await readTextFile(f);
      }
    },
    [props, readTextFile],
  );

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={props.onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[720px] rounded-[6px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="text-sm font-semibold text-[var(--active)]">Research Profile</div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-[6px] border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--hover)]"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Mode</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODES.map((m) => (
                <button key={m.key} type="button" onClick={() => setMode(m.key)} className={cardClasses(mode === m.key)}>
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Goal</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {goals.map((g) => (
                <button key={g.key} type="button" onClick={() => setGoal(g.key)} className={cardClasses(goal === g.key)}>
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Approach</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {APPROACHES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setApproach(a.key)}
                  className={cardClasses(approach === a.key)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Context</div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={5}
              placeholder="Optional background, constraints, preferences..."
              className="w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
            />
            {mode === "review" ? (
              <div className="mt-2 text-xs font-semibold text-[var(--err)]">Review mode: context is required.</div>
            ) : null}
          </section>

          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Attachment</div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                await handleFiles(e.dataTransfer.files);
              }}
              className={[
                "flex cursor-pointer flex-col gap-2 rounded-[6px] border border-dashed px-4 py-4 text-xs",
                dragActive ? "border-[var(--active)] bg-[var(--hover)]" : "border-[var(--border)] bg-[var(--bg)]",
              ].join(" ")}
            >
              <div className="font-semibold text-[var(--text)]">Drag & drop a file, or click to select</div>
              <div className="text-[var(--muted)]">Accepted: .txt, .md, .json, .pdf</div>
              {files.length > 0 ? (
                <div className="mt-1 flex flex-col gap-1">
                  {files.map((f) => (
                    <div key={f.name} className="text-[var(--muted)]">
                      {f.name} • {(f.size / 1024).toFixed(0)} KB
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.json,.pdf"
              onChange={async (e) => {
                await handleFiles(e.target.files);
              }}
            />
          </section>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-[6px] border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === "review" && context.trim().length < 5) {
                  props.toast("Review mode requires context (min 5 characters).", "error");
                  return;
                }
                props.onSave({ mode, goal, approach, context: context.trim() });
              }}
              className="rounded-[6px] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[var(--bg)]"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
