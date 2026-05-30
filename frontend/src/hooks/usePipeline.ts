import { useCallback, useMemo, useState } from "react";
import type { AgentName, PipelineEvent, PipelineResult } from "../../../shared/types";
import { mockResult } from "../data/mockData";

const AGENTS: AgentName[] = ["scout", "gap_analyst", "innovator", "critic", "coherence"];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildInitialEvents = (): PipelineEvent[] =>
  AGENTS.map((agent) => ({ agent, status: "pending" as const }));

export function usePipeline() {
  const [topic, setTopic] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<PipelineEvent[]>(() => buildInitialEvents());
  const [result, setResult] = useState<PipelineResult | null>(null);

  const eventByAgent = useMemo(() => {
    const map = new Map<AgentName, PipelineEvent>();
    for (const ev of events) map.set(ev.agent, ev);
    return map;
  }, [events]);

  const run = useCallback(async (nextTopic: string) => {
    if (isRunning) return;
    const clean = nextTopic.trim();
    if (clean.length < 3) return;

    setTopic(clean);
    setIsRunning(true);
    setResult(null);
    setEvents(buildInitialEvents());

    for (const agent of AGENTS) {
      setEvents((prev) =>
        prev.map((ev) => (ev.agent === agent ? { ...ev, status: "running" } : ev)),
      );

      await sleep(450);

      setEvents((prev) =>
        prev.map((ev) => (ev.agent === agent ? { ...ev, status: "completed" } : ev)),
      );
    }

    await sleep(250);
    setResult(mockResult);
    setIsRunning(false);
  }, [isRunning]);

  return {
    topic,
    setTopic,
    isRunning,
    events,
    eventByAgent,
    result,
    run,
  };
}

