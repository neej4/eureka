import { useCallback, useEffect, useMemo, useState } from "react";
import { cacheReset, cacheStats, getApiUrl, setApiUrl, USE_MOCK } from "../lib/api";
import type { ToastType } from "./Toast";

type CacheStats = {
  total_entries: number;
  active_entries: number;
  expired_entries: number;
};

export function Settings(props: { toast: (message: string, type?: ToastType) => void }) {
  const [apiUrl, setApiUrlInput] = useState("");
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setApiUrlInput(getApiUrl());
  }, []);

  const modeText = useMemo(() => (USE_MOCK ? "Mock mode is ON" : "Mock mode is OFF"), []);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await cacheStats();
      setStats(next);
      props.toast("Cache stats updated.", "ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load cache stats";
      props.toast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [props]);

  const doReset = useCallback(async () => {
    const ok = confirm("Clear backend cache?");
    if (!ok) return;
    setIsLoading(true);
    try {
      const res = await cacheReset();
      props.toast(res.message || "Cache cleared.", "ok");
      const next = await cacheStats();
      setStats(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reset cache";
      props.toast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [props]);

  return (
    <div className="max-w-[720px]">
      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
        <div className="text-sm font-semibold text-[var(--active)]">Settings</div>

        <div className="mt-4 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Backend</div>
          <div className="mt-3 flex flex-col gap-2">
            <label className="text-xs text-[var(--muted)]">API base URL</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={apiUrl}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-[420px] max-w-[80vw] rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
              />
              <button
                type="button"
                onClick={() => {
                  setApiUrl(apiUrl);
                  props.toast("API URL saved.", "ok");
                }}
                className="rounded-[6px] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[var(--bg)]"
              >
                Save
              </button>
            </div>
            <div className="text-xs text-[var(--muted)]">
              Override using localStorage key <span className="font-mono text-[var(--text)]">eureka_api_url</span> or{" "}
              <span className="font-mono text-[var(--text)]">VITE_API_URL</span>.
            </div>
            <div className="mt-2 text-xs text-[var(--muted)]">
              {modeText}. Set <span className="font-mono text-[var(--text)]">VITE_USE_MOCK=false</span> to use the real backend.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[6px] border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Cache</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshStats}
              disabled={isLoading}
              className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
            >
              Refresh stats
            </button>
            <button
              type="button"
              onClick={doReset}
              disabled={isLoading}
              className="rounded-[6px] border border-[var(--err)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--err)] hover:bg-[var(--hover)] disabled:opacity-50"
            >
              Clear cache
            </button>
          </div>

          {stats ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-[var(--muted)]">Total</div>
                <div className="font-mono text-lg font-semibold text-[var(--active)]">{stats.total_entries}</div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-[var(--muted)]">Active</div>
                <div className="font-mono text-lg font-semibold text-[var(--active)]">{stats.active_entries}</div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="text-xs text-[var(--muted)]">Expired</div>
                <div className="font-mono text-lg font-semibold text-[var(--active)]">{stats.expired_entries}</div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-[var(--muted)]">No cache stats yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

