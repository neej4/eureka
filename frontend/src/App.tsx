import { useEffect, useMemo, useState } from "react";
import type { Idea } from "../../shared/types";
import { IdeaDetail } from "./components/IdeaDetail";
import { IdeaList } from "./components/IdeaList";
import { KnowledgeMap } from "./components/KnowledgeMap";
import { PipelineStatus } from "./components/PipelineStatus";
import { ROIPanel } from "./components/ROIPanel";
import { usePipeline } from "./hooks/usePipeline";
import { ControlsBar } from "./shell/ControlsBar";
import { Header } from "./shell/Header";
import { LeftPanel, type LogLine } from "./shell/LeftPanel";
import { Tabs } from "./shell/Tabs";
import type { TabName } from "./shell/types";

function App() {
  const pipeline = usePipeline();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>("ideas");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [maxIdeas, setMaxIdeas] = useState(10);
  const [ideaSearch, setIdeaSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (!pipeline.result) return;
    if (pipeline.result.ideas.length === 0) return;
    setSelectedIdeaId((prev) => prev ?? pipeline.result!.ideas[0]!.id);
  }, [pipeline.result]);

  useEffect(() => {
    if (pipeline.isRunning) {
      setLogs((prev) => [...prev, { level: "info", text: "Pipeline started." }]);
    } else {
      if (pipeline.result) setLogs((prev) => [...prev, { level: "ok", text: "Pipeline completed." }]);
    }
  }, [pipeline.isRunning, pipeline.result]);

  useEffect(() => {
    const last = pipeline.agents[pipeline.agents.length - 1];
    if (!last) return;
    setLogs((prev) => {
      const key = `${last.agent}:${last.status}`;
      if (prev.length > 0 && prev[prev.length - 1]!.text.endsWith(key)) return prev;
      return [...prev, { level: "info", text: `status ${key}` }];
    });
  }, [pipeline.agents]);

  const selectedIdea: Idea | null = useMemo(() => {
    if (!pipeline.result || !selectedIdeaId) return null;
    return pipeline.result.ideas.find((x) => x.id === selectedIdeaId) ?? null;
  }, [pipeline.result, selectedIdeaId]);

  const statusBadge: "Idle" | "Running" | "Error" = pipeline.isRunning ? "Running" : "Idle";
  const papersCount = pipeline.result?.papers.length ?? 0;
  const ideasCount = pipeline.result?.ideas.length ?? 0;
  const categoriesCount = pipeline.result?.clusters.length ?? 0;
  const timeText = pipeline.result ? `${pipeline.result.duration_seconds.toFixed(0)}s` : "—";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shortlistCount={0}
        status={statusBadge}
        model="Gemini Flash"
        onSetup={() => setLogs((prev) => [...prev, { level: "info", text: "Setup clicked." }])}
      />
      <ControlsBar
        topic={pipeline.topic}
        onTopicChange={pipeline.setTopic}
        onProfile={() => setLogs((prev) => [...prev, { level: "info", text: "Profile clicked." }])}
        onRun={() => pipeline.run(pipeline.topic)}
        onRefresh={() => setLogs((prev) => [...prev, { level: "info", text: "Refresh requested." }])}
        onQuick={() => setLogs((prev) => [...prev, { level: "info", text: "Quick requested." }])}
        onStop={() => setLogs((prev) => [...prev, { level: "warn", text: "Stop not available in mock mode." }])}
        onClear={() => {
          pipeline.clear();
          setSelectedIdeaId(null);
          setLogs([]);
        }}
        isRunning={pipeline.isRunning}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        language={language}
        onLanguageChange={setLanguage}
        maxIdeas={maxIdeas}
        onMaxIdeasChange={setMaxIdeas}
      />

      <main className="main h-[calc(100vh-130px)] w-full">
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-[320px_1fr]">
          <LeftPanel logs={logs} />
          <div className="right h-full overflow-hidden bg-[var(--bg)]">
            <div className="h-full overflow-y-auto p-4">
              <Tabs activeTab={activeTab}>
                {{
                  ideas: (
                    <div className="flex flex-col gap-4">
                      <div className="stats grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
                          <div className="font-mono text-2xl text-[var(--active)]">{papersCount}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Papers Analyzed
                          </div>
                        </div>
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
                          <div className="font-mono text-2xl text-[var(--active)]">{ideasCount}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Ideas Generated
                          </div>
                        </div>
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
                          <div className="font-mono text-2xl text-[var(--active)]">{categoriesCount}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Categories
                          </div>
                        </div>
                        <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow)]">
                          <div className="font-mono text-2xl text-[var(--active)]">{timeText}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            Time
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            id="ideaSearch"
                            value={ideaSearch}
                            onChange={(e) => setIdeaSearch(e.target.value)}
                            placeholder="Search ideas"
                            className="w-[280px] max-w-[60vw] rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--active)]"
                          />
                          <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-2 py-2 text-xs text-[var(--text)]"
                          >
                            <option value="all">All Levels</option>
                            <option value="undergrad">Undergraduate</option>
                            <option value="masters">Master's</option>
                            <option value="phd">PhD</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="side">Side Project</option>
                            <option value="industry">Industry</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setCompareMode((v) => !v)}
                            className={[
                              "rounded-[6px] border px-3 py-2 text-xs font-semibold",
                              compareMode
                                ? "border-[var(--active)] bg-[var(--hover)] text-[var(--active)]"
                                : "border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--hover)]",
                            ].join(" ")}
                          >
                            Compare
                          </button>
                        </div>
                        <PipelineStatus agents={pipeline.agents} />
                      </div>

                      {pipeline.result ? (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                          <div className="flex flex-col gap-4 xl:col-span-2">
                            <KnowledgeMap clusters={pipeline.result.clusters} />
                            <ROIPanel
                              durationSeconds={pipeline.result.duration_seconds}
                              baselineHumanDays={pipeline.result.baseline_human_days}
                              roiPercentage={pipeline.result.roi_percentage}
                            />
                          </div>
                          <div className="flex flex-col gap-4">
                            <IdeaList
                              ideas={pipeline.result.ideas.filter((x) =>
                                ideaSearch.trim().length === 0
                                  ? true
                                  : x.title.toLowerCase().includes(ideaSearch.toLowerCase()) ||
                                    x.description.toLowerCase().includes(ideaSearch.toLowerCase()),
                              )}
                              selectedId={selectedIdeaId}
                              onSelect={setSelectedIdeaId}
                            />
                            <IdeaDetail idea={selectedIdea} />
                          </div>
                        </div>
                      ) : (
                        <div
                          id="welcomeGuide"
                          className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]"
                        >
                          <div className="text-lg font-semibold text-[var(--active)]">Welcome to EUREKA</div>
                          <div className="mt-2">Select categories, set context, run pipeline, then explore and bookmark.</div>
                        </div>
                      )}
                    </div>
                  ),
                  recent: (
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                      No previous sessions. Run the pipeline first.
                    </div>
                  ),
                  roadmap: (
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                      Open an idea and click Build Roadmap to generate a knowledge graph.
                    </div>
                  ),
                  shortlist: (
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                      Bookmark ideas to build your shortlist.
                    </div>
                  ),
                  settings: (
                    <div className="max-w-[560px] rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                      Settings will appear here.
                    </div>
                  ),
                  docs: (
                    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                      Docs link placeholder.
                    </div>
                  ),
                }}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
