import { useMemo } from "react";
import type { TabName } from "./types";

const TABS: Array<{ name: TabName; label: string }> = [
  { name: "ideas", label: "Ideas" },
  { name: "map", label: "Knowledge Map" },
  { name: "recent", label: "Recent" },
  { name: "settings", label: "Settings" },
];

export function Header(props: {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  status: "Idle" | "Running" | "Error";
  model: string;
  onSetup: () => void;
}) {
  const statusClass = useMemo(() => {
    switch (props.status) {
      case "Idle":
        return "border-[var(--border)] text-[var(--muted)]";
      case "Running":
        return "border-dashed border-[var(--active)] text-[var(--active)] animate-pulse";
      case "Error":
        return "border-[var(--err)] text-[var(--err)]";
    }
  }, [props.status]);

  return (
    <header className="h-[56px] w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/static/logo_purewhite.png"
            width={36}
            height={36}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="truncate text-[20px] font-bold tracking-[1px] text-[var(--active)]">
            EUREKA
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex" role="tablist">
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    props.onTabChange(t.name);
                  }
                }}
                className={[
                  "nav-tab inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-semibold",
                  isActive ? "bg-[var(--hover)] text-[var(--active)]" : "text-[var(--muted)] hover:bg-[var(--hover)]",
                ].join(" ")}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-right flex items-center gap-2">
          <button
            type="button"
            onClick={props.onSetup}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
          >
            Setup
          </button>
          <div
            className={[
              "badge rounded-[999px] border px-3 py-1 text-xs font-semibold",
              statusClass,
            ].join(" ")}
          >
            {props.status}
          </div>
          <div className="rounded-[999px] border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
            {props.model}
          </div>
        </div>
      </div>
    </header>
  );
}

