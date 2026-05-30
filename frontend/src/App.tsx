import { useCallback, useEffect, useMemo, useState } from "react";
import type { Idea } from "../../shared/types";
import { ErrorState } from "./components/ErrorState";
import { ChatPanel } from "./components/ChatPanel";
import { IdeaDetailModal } from "./components/IdeaDetailModal";
import { IdeaGrid } from "./components/IdeaGrid";
import { IdeaSkeletonList, PanelSkeleton } from "./components/IdeaSkeleton";
import { LandingScreen } from "./components/LandingScreen";
import { KnowledgeMapObsidian } from "./components/KnowledgeMapObsidian";
import { ProfileModal, type ProfileData } from "./components/ProfileModal";
import { ROIPanel } from "./components/ROIPanel";
import { Settings } from "./components/Settings";
import { ToastViewport, type ToastItem, type ToastType } from "./components/Toast";
import { usePipeline } from "./hooks/usePipeline";
import { ControlsBar } from "./shell/ControlsBar";
import { Header } from "./shell/Header";
import { LeftPanel } from "./shell/LeftPanel";
import { Tabs } from "./shell/Tabs";
import type { TabName } from "./shell/types";

function App() {
  const pipeline = usePipeline();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("research");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    mode: "academic",
    goal: "any",
    approach: "any",
    context: "",
  });

  useEffect(() => {
    if (!pipeline.result) return;
    if (pipeline.result.ideas.length === 0) return;
    setSelectedIdeaId((prev) => prev ?? pipeline.result!.ideas[0]!.id);
  }, [pipeline.result]);

  const syncProfileToHidden = useCallback((next: ProfileData) => {
    const goalEl = document.getElementById("goalSelect") as HTMLSelectElement | null;
    const approachEl = document.getElementById("approachSelect") as HTMLSelectElement | null;
    const ctxEl = document.getElementById("researchContext") as HTMLTextAreaElement | null;
    if (goalEl) {
      goalEl.value = next.goal;
      goalEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (approachEl) {
      approachEl.value = next.approach;
      approachEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (ctxEl) {
      ctxEl.value = next.context;
      ctxEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, type, message }, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("eureka_profile");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ProfileData>;
      const next: ProfileData = {
        mode: (parsed.mode as any) ?? "academic",
        goal: typeof parsed.goal === "string" ? parsed.goal : "any",
        approach: (parsed.approach as any) ?? "any",
        context: typeof parsed.context === "string" ? parsed.context : "",
      };
      setProfile(next);
      syncProfileToHidden(next);
    } catch {
    }
  }, [syncProfileToHidden]);


  useEffect(() => {
    if (!pipeline.error) return;
    toast(pipeline.error, "error");
  }, [pipeline.error, toast]);

  const selectedIdea: Idea | null = useMemo(() => {
    if (!pipeline.result || !selectedIdeaId) return null;
    return pipeline.result.ideas.find((x) => x.id === selectedIdeaId) ?? null;
  }, [pipeline.result, selectedIdeaId]);

  const openIdea = useCallback((ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setIdeaModalOpen(true);
  }, []);

  const statusBadge: "Idle" | "Running" | "Error" = pipeline.error ? "Error" : pipeline.isRunning ? "Running" : "Idle";
  const papersCount = pipeline.result?.papers.length ?? 0;
  const ideasCount = pipeline.result?.ideas.length ?? 0;
  const categoriesCount = pipeline.result?.clusters.length ?? 0;
  const timeText = pipeline.result ? `${pipeline.result.duration_seconds.toFixed(0)}s` : "—";
  const isLanding = activeTab === "research" && !pipeline.isRunning && !pipeline.result && !pipeline.error;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        status={statusBadge}
        model="Gemini Flash"
        onSetup={() => setActiveTab("settings")}
      />
      <div className={isLanding ? "hidden" : ""}>
        <ControlsBar
          topic={pipeline.topic}
          onTopicChange={pipeline.setTopic}
          onRun={() => pipeline.run(pipeline.topic)}
          onStop={pipeline.stop}
          onClear={() => {
            pipeline.clear();
            setSelectedIdeaId(null);
          }}
          isRunning={pipeline.isRunning}
        />
      </div>

      {isLanding ? (
        <main className="w-full" style={{ height: "calc(100vh - 62px)" }}>
          <LandingScreen
            topic={pipeline.topic}
            onTopicChange={pipeline.setTopic}
            onRun={() => pipeline.run(pipeline.topic)}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSettings={() => setActiveTab("settings")}
          />
        </main>
      ) : (
        <main className="main h-[calc(100vh-130px)] w-full">
          <div className="mx-auto grid h-full max-w-[1400px] grid-cols-[320px_1fr]">
            <LeftPanel logs={pipeline.logs} agents={pipeline.agents} />
            <div className="right h-full overflow-hidden bg-[var(--bg)]">
              <div className="h-full overflow-hidden p-4">
                <Tabs activeTab={activeTab}>
                  {{
                    research: (
                      <div className="flex h-full min-h-0 flex-col gap-4">
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

                        <div className="min-h-0 flex-1">
                          {pipeline.error && !pipeline.result ? (
                            <ErrorState
                              title="Pipeline error"
                              message={pipeline.error}
                              onRetry={() => {
                                toast("Retrying...", "info");
                                pipeline.retry();
                              }}
                            />
                          ) : pipeline.isRunning && !pipeline.result ? (
                            <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-3">
                              <div className="flex min-h-0 flex-col gap-4 xl:col-span-2">
                                <PanelSkeleton title="ROI" lines={6} />
                                <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
                                  <div className="text-sm font-semibold text-[var(--active)]">Live activity</div>
                                  <div className="mt-2 text-sm text-[var(--muted)]">
                                    {pipeline.latestStatusText || "Working..."}
                                  </div>
                                  <div className="mt-3 text-xs text-[var(--muted)]">
                                    Results appear when the pipeline completes.
                                  </div>
                                </div>
                              </div>
                              <div className="flex min-h-0 flex-col gap-4">
                                <div className="min-h-0 flex-1">
                                  <IdeaSkeletonList count={6} />
                                </div>
                                <PanelSkeleton title="Idea Detail" lines={6} />
                              </div>
                            </div>
                          ) : pipeline.result ? (
                            <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,780px)]">
                              <div className="flex min-h-0 flex-col gap-4">
                                <ROIPanel
                                  durationSeconds={pipeline.result.duration_seconds}
                                  baselineHumanDays={pipeline.result.baseline_human_days}
                                  roiPercentage={pipeline.result.roi_percentage}
                                />
                              </div>
                              <div className="min-h-0">
                                <IdeaGrid ideas={pipeline.result.ideas} onOpen={openIdea} />
                              </div>
                            </div>
                          ) : (
                            <div
                              id="welcomeGuide"
                              className="h-full overflow-y-auto rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]"
                            >
                              <div className="text-lg font-semibold text-[var(--active)]">Welcome to EUREKA</div>
                              <div className="mt-2">Enter a topic, run the pipeline, then explore and save ideas.</div>
                              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                                {[
                                  { title: "Enter Topic", body: "Type a clear research question." },
                                  { title: "Run Pipeline", body: "Watch live agent progress." },
                                  { title: "Explore Ideas", body: "Open details and adjust scores." },
                                  { title: "Save & Export", body: "Bookmark and export shortlist." },
                                ].map((x) => (
                                  <div key={x.title} className="rounded-[6px] border border-[var(--border)] bg-[var(--bg)] p-3 text-left">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{x.title}</div>
                                    <div className="mt-2 text-sm text-[var(--text)]">{x.body}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                Example topics
                              </div>
                              <div className="mt-2 flex flex-wrap justify-center gap-2">
                                {[
                                  "foundation models for scientific discovery",
                                  "graph neural networks for drug discovery",
                                  "federated learning privacy attacks",
                                  "RAG evaluation benchmarks",
                                ].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                      pipeline.setTopic(t);
                                      pipeline.run(t);
                                    }}
                                    className="rounded-[999px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)]"
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                    map: pipeline.result ? (
                      <KnowledgeMapObsidian result={pipeline.result} />
                    ) : pipeline.isRunning ? (
                      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                        Map will build after analysis completes.
                      </div>
                    ) : (
                      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
                        Run the pipeline to generate a knowledge map.
                      </div>
                    ),
                    chat: (
                      <ChatPanel />
                    ),
                    settings: (
                      <div className="h-full overflow-y-auto">
                        <Settings toast={toast} />
                      </div>
                    ),
                  }}
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      )}
      <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      {pipeline.result ? (
        <IdeaDetailModal
          open={ideaModalOpen}
          result={pipeline.result}
          idea={selectedIdea}
          toast={toast}
          onClose={() => setIdeaModalOpen(false)}
          onOverride={async (ideaId, input) => {
            const updated = await pipeline.applyOverride(ideaId, input);
            pipeline.pushLog({ level: "ok", text: "Override applied." });
            toast("Override applied.", "ok");
            return updated;
          }}
        />
      ) : null}
      <ProfileModal
        open={profileOpen}
        initial={profile}
        toast={toast}
        onClose={() => setProfileOpen(false)}
        onSave={(next) => {
          setProfile(next);
          setProfileOpen(false);
          syncProfileToHidden(next);
          window.sessionStorage.setItem("eureka_profile", JSON.stringify(next));
          toast("Profile saved.", "ok");
        }}
      />
    </div>
  );
}

export default App;
