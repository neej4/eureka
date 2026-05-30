import { useMemo } from "react";

export function InputBar(props: {
  topic: string;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const topicError = useMemo(() => {
    const t = props.topic.trim();
    if (t.length === 0) return "Masukkan topik riset.";
    if (t.length < 3) return "Minimal 3 karakter.";
    return null;
  }, [props.topic]);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (topicError) return;
        props.onSubmit();
      }}
    >
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-400/70"
          value={props.topic}
          onChange={(e) => props.onTopicChange(e.target.value)}
          placeholder="Contoh: agentic RAG evaluation untuk paper scientific discovery"
          disabled={props.disabled}
        />
        <button
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          type="submit"
          disabled={props.disabled || !!topicError}
        >
          Run
        </button>
      </div>
      {topicError ? (
        <div className="text-xs text-zinc-400">{topicError}</div>
      ) : (
        <div className="text-xs text-zinc-400">Tekan Run untuk memulai pipeline (mode mock).</div>
      )}
    </form>
  );
}
