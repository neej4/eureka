import { useEffect, useMemo, useRef, useState } from "react";
import { chat, type ChatAgent, type ChatMessage } from "../lib/api";

type ChatItem = { id: string; role: ChatMessage["role"]; content: string; agent?: ChatAgent };

const AGENTS: Array<{ id: ChatAgent; label: string; avatar: string }> = [
  { id: "scout", label: "Scout", avatar: "/agents/scout.png" },
  { id: "gap-analyst", label: "Gap Analyst", avatar: "/agents/gap-analyst.png" },
  { id: "innovator", label: "Innovator", avatar: "/agents/innovator.png" },
  { id: "critic", label: "Critic", avatar: "/agents/critic.png" },
  { id: "coherence-validator", label: "Coherence Validator", avatar: "/agents/coherence-validator.png" },
];

function toApiHistory(items: ChatItem[]): ChatMessage[] {
  return items.map((m) => ({ role: m.role, content: m.content }));
}

export function ChatPanel() {
  const [agent, setAgent] = useState<ChatAgent>("scout");
  const [items, setItems] = useState<ChatItem[]>([
    {
      id: "seed",
      role: "assistant",
      content: "Pilih agent, lalu tanya apa pun tentang topik riset atau ide eksperimen.",
      agent: "scout",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const activeAgent = useMemo(() => AGENTS.find((a) => a.id === agent) ?? AGENTS[0]!, [agent]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [items.length, isSending]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const userMsg: ChatItem = { id: `${Date.now()}-u`, role: "user", content: text };
    const nextItems = [...items, userMsg];
    setItems(nextItems);

    try {
      const res = await chat(agent, text, toApiHistory(nextItems));
      setItems((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", content: res.reply, agent },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Chat failed";
      setError(message);
      setItems((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          content: "Gagal mengirim chat. Coba lagi, atau jalankan backend.",
          agent,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[var(--active)]">LLM Chat</div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-[var(--muted)]">Agent</div>
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value as ChatAgent)}
            className="rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-semibold text-[var(--text)]"
          >
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-[6px] border border-[var(--err)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--err)]">
          {error}
        </div>
      ) : null}

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-[6px] border border-[var(--border)] bg-[var(--bg)] p-3"
      >
        <div className="flex flex-col gap-3">
          {items.map((m) => {
            const isUser = m.role === "user";
            const avatar = isUser ? null : (AGENTS.find((a) => a.id === (m.agent ?? agent)) ?? activeAgent).avatar;
            const label = isUser ? "You" : (AGENTS.find((a) => a.id === (m.agent ?? agent)) ?? activeAgent).label;
            return (
              <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div className={["flex max-w-[760px] items-start gap-3", isUser ? "flex-row-reverse" : ""].join(" ")}>
                  {isUser ? (
                    <div className="h-8 w-8 shrink-0 rounded-[10px] border border-[var(--border)] bg-[var(--card)]" />
                  ) : (
                    <img
                      src={avatar!}
                      alt={label}
                      className="h-8 w-8 shrink-0 rounded-[10px] border border-[var(--border)] bg-[var(--card)] object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div
                    className={[
                      "rounded-[10px] border px-3 py-2 text-sm shadow-[var(--shadow)]",
                      isUser
                        ? "border-[var(--border)] bg-[var(--hover)] text-[var(--text)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--text)]",
                    ].join(" ")}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</div>
                    <div className="mt-1 whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {isSending ? (
            <div className="flex justify-start">
              <div className="flex max-w-[760px] items-start gap-3">
                <img
                  src={activeAgent.avatar}
                  alt={activeAgent.label}
                  className="h-8 w-8 shrink-0 rounded-[10px] border border-[var(--border)] bg-[var(--card)] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
                  typing…
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Tanya ${activeAgent.label}…`}
          rows={2}
          className="min-h-[46px] flex-1 resize-none rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--active)]"
        />
        <button
          type="button"
          onClick={send}
          disabled={isSending || input.trim().length === 0}
          className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

