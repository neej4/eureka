import { useEffect, useMemo, useState } from "react";
import type { Idea } from "../../shared/types";
import { IdeaDetail } from "./components/IdeaDetail";
import { IdeaList } from "./components/IdeaList";
import { InputBar } from "./components/InputBar";
import { KnowledgeMap } from "./components/KnowledgeMap";
import { PipelineStatus } from "./components/PipelineStatus";
import { ROIPanel } from "./components/ROIPanel";
import { usePipeline } from "./hooks/usePipeline";

function App() {
  const pipeline = usePipeline();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!pipeline.result) return;
    if (pipeline.result.ideas.length === 0) return;
    setSelectedIdeaId((prev) => prev ?? pipeline.result!.ideas[0]!.id);
  }, [pipeline.result]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  const selectedIdea: Idea | null = useMemo(() => {
    if (!pipeline.result || !selectedIdeaId) return null;
    return pipeline.result.ideas.find((x) => x.id === selectedIdeaId) ?? null;
  }, [pipeline.result, selectedIdeaId]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_circle_at_30%_-10%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(700px_circle_at_85%_0%,rgba(59,130,246,0.10),transparent_55%)]" />
      <header className="sticky top-0 z-10 border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="text-base font-semibold tracking-tight text-zinc-50">
              Eureka Breakthrough Engine
            </div>
            <div className="text-xs text-zinc-400">Frontend O2 • mode mock</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-900/70"
              onClick={() => setIsDark((v) => !v)}
            >
              {isDark ? "Dark" : "Light"}
            </button>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs font-semibold text-zinc-300">
              feat/frontend
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
          <div className="mb-3 text-sm font-semibold text-zinc-50">Run Pipeline</div>
          <InputBar
            topic={pipeline.topic}
            onTopicChange={pipeline.setTopic}
            disabled={pipeline.isRunning}
            onSubmit={() => pipeline.run(pipeline.topic)}
          />
          <div className="mt-4">
            <PipelineStatus agents={pipeline.agents} />
          </div>
        </div>

        {pipeline.result ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <KnowledgeMap clusters={pipeline.result.clusters} />
              <ROIPanel
                durationSeconds={pipeline.result.duration_seconds}
                baselineHumanDays={pipeline.result.baseline_human_days}
                roiPercentage={pipeline.result.roi_percentage}
              />
            </div>
            <div className="flex flex-col gap-4">
              <IdeaList
                ideas={pipeline.result.ideas}
                selectedId={selectedIdeaId}
                onSelect={setSelectedIdeaId}
              />
              <IdeaDetail idea={selectedIdea} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 text-sm text-zinc-300">
            Jalankan pipeline untuk melihat hasil (mock).
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
