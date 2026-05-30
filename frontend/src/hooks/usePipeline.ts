import { useCallback, useMemo, useState } from "react";
import type { AgentStatus, PipelineResult } from "../../../shared/types";
import { mockResult } from "../data/mockData";

type AgentKey = AgentStatus["agent"];

const AGENTS: AgentKey[] = ["scout", "gap-analyst", "innovator", "critic", "coherence-validator"];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const buildInitialAgents = (): AgentStatus[] =>
  AGENTS.map((agent) => ({ agent, status: "pending" as const }));

export function usePipeline() {
  const [topic, setTopic] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState<AgentStatus[]>(() => buildInitialAgents());
  const [result, setResult] = useState<PipelineResult | null>(null);

  const agentByName = useMemo(() => {
    const map = new Map<AgentKey, AgentStatus>();
    for (const ev of agents) map.set(ev.agent, ev);
    return map;
  }, [agents]);

  const run = useCallback(async (nextTopic: string) => {
    if (isRunning) return;
    const clean = nextTopic.trim();
    if (clean.length < 3) return;

    setTopic(clean);
    setIsRunning(true);
    setResult(null);
    setAgents(buildInitialAgents());

    for (const agent of AGENTS) {
      setAgents((prev) =>
        prev.map((ev) => (ev.agent === agent ? { ...ev, status: "running" } : ev)),
      );

      await sleep(450);

      setAgents((prev) =>
        prev.map((ev) => (ev.agent === agent ? { ...ev, status: "completed" } : ev)),
      );
    }

    await sleep(250);
    setResult({ ...mockResult, topic: clean });
    setIsRunning(false);
  }, [isRunning]);

  return {
    topic,
    setTopic,
    isRunning,
    agents,
    agentByName,
    result,
    run,
  };
}
