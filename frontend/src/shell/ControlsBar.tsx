export function ControlsBar(props: {
  topic: string;
  onTopicChange: (topic: string) => void;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  isRunning: boolean;
}) {
  return (
    <div className="controls h-[74px] w-full border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="ctrl-group flex min-w-0 items-center gap-2">
          <input
            className="w-[520px] max-w-[60vw] rounded-[12px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
            value={props.topic}
            onChange={(e) => props.onTopicChange(e.target.value)}
            placeholder="Enter a research topic..."
            disabled={props.isRunning}
          />

          <button
            type="button"
            onClick={props.onRun}
            disabled={props.isRunning || props.topic.trim().length < 3}
            className="btn-run inline-flex items-center gap-2 rounded-[12px] bg-[var(--active)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            <svg className="h-4 w-4" aria-hidden="true">
              <use href="/icons.svg#ui-spark" />
            </svg>
            Run
          </button>
          {props.isRunning ? (
            <button
              type="button"
              onClick={props.onStop}
              className="btn-stop inline-flex items-center gap-2 rounded-[12px] border border-[var(--err)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--err)] hover:bg-[var(--hover)]"
            >
              <svg className="h-4 w-4" aria-hidden="true">
                <use href="/icons.svg#ui-stop" />
              </svg>
              Stop
            </button>
          ) : null}
          <button
            type="button"
            onClick={props.onClear}
            className="rounded-[12px] border border-[var(--border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
          >
            Clear
          </button>
        </div>
      </div>

      <select id="approachSelect" className="hidden" defaultValue="any">
        <option value="any">any</option>
        <option value="computational">computational</option>
        <option value="experimental">experimental</option>
        <option value="clinical">clinical</option>
        <option value="theoretical">theoretical</option>
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

