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

  useEffect(() => {
    if (!pipeline.result) return;
    if (pipeline.result.ideas.length === 0) return;
    setSelectedIdeaId((prev) => prev ?? pipeline.result!.ideas[0]!.id);
  }, [pipeline.result]);

  const selectedIdea: Idea | null = useMemo(() => {
    if (!pipeline.result || !selectedIdeaId) return null;
    return pipeline.result.ideas.find((x) => x.id === selectedIdeaId) ?? null;
  }, [pipeline.result, selectedIdeaId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <div className="text-base font-bold text-slate-900">Eureka Breakthrough Engine</div>
            <div className="text-xs text-slate-500">Frontend O2 • mode mock</div>
          </div>
          <div className="text-xs font-semibold text-slate-500">branch: feat/frontend</div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Run Pipeline</div>
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
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Jalankan pipeline untuk melihat hasil (mock).
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
