import { useMemo } from "react";
import type { TabName } from "./types";

const TABS: Array<{ name: TabName; label: string }> = [
  { name: "research", label: "Research" },
  { name: "map", label: "Knowledge Map" },
  { name: "chat", label: "Chat" },
  { name: "settings", label: "Settings" },
];

export function Header(props: {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  status: "Idle" | "Running" | "Error";
  model: string;
  onSetup: () => void;
}) {
  const statusDot = useMemo(() => {
    switch (props.status) {
      case "Idle":
        return "bg-[var(--border)]";
      case "Running":
        return "bg-[var(--active)] animate-pulse";
      case "Error":
        return "bg-[var(--err)]";
    }
  }, [props.status]);

  return (
    <header className="h-[52px] w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src="/logo.png"
            alt=""
            className="h-[20px] w-auto max-w-[24px] shrink-0 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div
            className="text-[17px] font-semibold tracking-[0.22em] text-[var(--text)]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            EUREKA
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex" role="tablist">
          {TABS.map((t) => {
            const isActive = props.activeTab === t.name;
            return (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => props.onTabChange(t.name)}
                className={[
                  "rounded-[var(--radius)] px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[var(--active-soft)] text-[var(--active)]"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            <span className="text-xs text-[var(--muted)]">{props.status}</span>
          </div>
          <div className="hidden rounded-[var(--radius)] bg-[var(--bg)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] md:block">
            {props.model}
          </div>
          <button
            type="button"
            onClick={props.onSetup}
            className="rounded-[var(--radius)] px-3 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
