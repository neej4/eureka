import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentStatus, PipelineResult } from "../../../shared/types";
import { overrideIdea, startPipeline, streamPipeline } from "../lib/api";
import type { StreamEvent } from "../mocks/sample";
import type { LogLine } from "../shell/LeftPanel";

type AgentKey = AgentStatus["agent"];

const AGENTS: AgentKey[] = ["scout", "gap-analyst", "innovator", "critic", "coherence-validator"];

const buildInitialAgents = (): AgentStatus[] =>
  AGENTS.map((agent) => ({ agent, status: "pending" as const }));

export function usePipeline() {
  const [topic, setTopic] = useState("");
  const [lastTopic, setLastTopic] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState<AgentStatus[]>(() => buildInitialAgents());
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestStatusText, setLatestStatusText] = useState<string>("");
  const [logs, setLogs] = useState<LogLine[]>([]);

  const streamRef = useRef<{ close: () => void } | null>(null);
  const lastStatusKeyRef = useRef<string>("");

  const agentByName = useMemo(() => {
    const map = new Map<AgentKey, AgentStatus>();
    for (const ev of agents) map.set(ev.agent, ev);
    return map;
  }, [agents]);

  const pushLog = useCallback((line: LogLine) => {
    setLogs((prev) => {
      const next = [...prev, line];
      return next.length > 400 ? next.slice(next.length - 400) : next;
    });
  }, []);

  const closeStream = useCallback(() => {
    streamRef.current?.close();
    streamRef.current = null;
  }, []);

  useEffect(() => () => closeStream(), [closeStream]);

  const applyOverride = useCallback(async (ideaId: string, input: { novelty_override?: number; feasibility_override?: number }) => {
    const res = await overrideIdea(ideaId, input);
    setResult((prev) => {
      if (!prev) return prev;
      return { ...prev, ideas: prev.ideas.map((x) => (x.id === ideaId ? res.idea : x)) };
    });
    return res.idea;
  }, []);

  const run = useCallback(async (nextTopic: string) => {
    if (isRunning) return;
    const clean = nextTopic.trim();
    if (clean.length < 3) return;

    closeStream();
    setTopic(clean);
    setLastTopic(clean);
    try {
      window.sessionStorage.setItem("eureka_last_topic", clean);
    } catch {
    }
    setIsRunning(true);
    setError(null);
    setLatestStatusText("");
    setResult(null);
    setAgents(buildInitialAgents());
    setPipelineId(null);
    setLogs([]);
    lastStatusKeyRef.current = "";
    pushLog({ level: "info", text: "Starting pipeline..." });

    try {
      const started = await startPipeline(clean);
      setPipelineId(started.pipeline_id);
      if (started.message) pushLog({ level: "info", text: started.message });

      const stream = streamPipeline(
        started.pipeline_id,
        {
          onEvent: (ev: StreamEvent) => {
            if (ev.type === "status") {
              setAgents(ev.data.agents);
              const running = ev.data.agents.find((a) => a.status === "running");
              if (running?.message) setLatestStatusText(running.message);
              else setLatestStatusText(`status ${ev.data.status}${running ? ` ${running.agent}` : ""}`);
              const key = [
                ev.data.status,
                running?.agent ?? "",
                running?.status ?? "",
                running?.message ?? "",
              ].join("|");
              if (key && key !== lastStatusKeyRef.current) {
                lastStatusKeyRef.current = key;
                pushLog({
                  level: "insight",
                  text: running?.message ? running.message : `status ${ev.data.status}${running ? ` ${running.agent}` : ""}`,
                });
              }
            }

            if (ev.type === "result") {
              setResult(ev.data);
              setIsRunning(false);
              setLatestStatusText("");
              pushLog({ level: "ok", text: "Pipeline completed." });
              closeStream();
            }

            if (ev.type === "error") {
              setError(ev.message);
              setIsRunning(false);
              setLatestStatusText("");
              pushLog({ level: "err", text: ev.message });
              closeStream();
            }
          },
          onError: (err) => {
            const msg = err instanceof Error ? err.message : "Stream error";
            setError(msg);
            setIsRunning(false);
            setLatestStatusText("");
            pushLog({ level: "err", text: msg });
            closeStream();
          },
        },
        { topic: clean },
      );

      streamRef.current = stream;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start pipeline";
      setError(msg);
      setIsRunning(false);
      setLatestStatusText("");
      pushLog({ level: "err", text: msg });
      closeStream();
    }
  }, [closeStream, isRunning, pushLog]);

  const retry = useCallback(() => {
    const fallback = (() => {
      try {
        return window.sessionStorage.getItem("eureka_last_topic") || "";
      } catch {
        return "";
      }
    })();
    const t = lastTopic || topic || fallback;
    if (t.trim().length < 3) return;
    run(t);
  }, [lastTopic, run, topic]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    closeStream();
    setIsRunning(false);
    pushLog({ level: "warn", text: "Pipeline stopped." });
  }, [closeStream, isRunning, pushLog]);

  const loadSnapshot = useCallback((snap: PipelineResult) => {
    closeStream();
    setIsRunning(false);
    setError(null);
    setLatestStatusText("");
    setPipelineId(snap.pipeline_id);
    setTopic(snap.topic);
    setLastTopic(snap.topic);
    setAgents(AGENTS.map((agent) => ({ agent, status: "completed" as const })));
    setResult(snap);
    pushLog({ level: "info", text: "Loaded saved session." });
  }, [closeStream, pushLog]);

  const clear = useCallback(() => {
    if (isRunning) return;
    setResult(null);
    setAgents(buildInitialAgents());
    setPipelineId(null);
    setError(null);
    setLatestStatusText("");
    setLogs([]);
  }, [isRunning]);

  return {
    topic,
    setTopic,
    lastTopic,
    isRunning,
    agents,
    agentByName,
    result,
    pipelineId,
    error,
    latestStatusText,
    logs,
    pushLog,
    run,
    retry,
    stop,
    loadSnapshot,
    clear,
    applyOverride,
  };
}
