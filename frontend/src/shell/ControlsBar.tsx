export function ControlsBar(props: {
  topic: string;
  onTopicChange: (topic: string) => void;
  onProfile: () => void;
  onRun: () => void;
  onRefresh: () => void;
  onQuick: () => void;
  onStop: () => void;
  onClear: () => void;
  isRunning: boolean;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  language: "en" | "id";
  onLanguageChange: (v: "en" | "id") => void;
  maxIdeas: number;
  onMaxIdeasChange: (v: number) => void;
}) {
  return (
    <div className="controls h-[74px] w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="ctrl-group flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={props.onProfile}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
          >
            Profile
          </button>

          <input
            className="w-[340px] max-w-[38vw] rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
            value={props.topic}
            onChange={(e) => props.onTopicChange(e.target.value)}
            placeholder="Topic"
            disabled={props.isRunning}
          />

          <button
            type="button"
            onClick={props.onRun}
            disabled={props.isRunning || props.topic.trim().length < 3}
            className="btn-run rounded-[6px] bg-[#ffffff] px-3 py-2 text-xs font-semibold text-[var(--bg)] disabled:opacity-50"
          >
            Run
          </button>
          <button
            type="button"
            onClick={props.onRefresh}
            disabled={props.isRunning}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={props.onQuick}
            disabled={props.isRunning}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-50"
          >
            Quick
          </button>
          {props.isRunning ? (
            <button
              type="button"
              onClick={props.onStop}
              className="btn-stop rounded-[6px] border border-[var(--err)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--err)] hover:bg-[var(--hover)]"
            >
              Stop
            </button>
          ) : null}
          <button
            type="button"
            onClick={props.onClear}
            className="rounded-[6px] border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
          >
            Clear
          </button>
        </div>

        <div className="ctrl-group hidden items-center gap-2 md:flex">
          <input
            type="date"
            value={props.dateFrom}
            onChange={(e) => props.onDateFromChange(e.target.value)}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text)] [color-scheme:dark]"
          />
          <div className="text-xs text-[var(--muted)]">to</div>
          <input
            type="date"
            value={props.dateTo}
            onChange={(e) => props.onDateToChange(e.target.value)}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text)] [color-scheme:dark]"
          />
          <select
            value={props.language}
            onChange={(e) => props.onLanguageChange(e.target.value as "en" | "id")}
            className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text)]"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
          <div className="flex items-center gap-2">
            <div className="text-xs text-[var(--muted)]">max ideas</div>
            <input
              type="number"
              min={1}
              max={200}
              value={props.maxIdeas}
              onChange={(e) => props.onMaxIdeasChange(Number(e.target.value))}
              className="w-[56px] rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text)]"
            />
          </div>
        </div>
      </div>

      <select id="approachSelect" className="hidden" defaultValue="any">
        <option value="any">any</option>
      </select>
      <select id="goalSelect" className="hidden" defaultValue="any">
        <option value="any">any</option>
        <option value="thesis">thesis</option>
        <option value="publication">publication</option>
        <option value="grant">grant</option>
        <option value="hackathon">hackathon</option>
        <option value="side_project">side_project</option>
        <option value="ai_tool">ai_tool</option>
        <option value="industry">industry</option>
        <option value="feature">feature</option>
        <option value="integration">integration</option>
        <option value="optimization">optimization</option>
        <option value="extension">extension</option>
        <option value="pivot">pivot</option>
        <option value="literature_synthesis">literature_synthesis</option>
      </select>
      <textarea id="researchContext" className="hidden" />
    </div>
  );
}

