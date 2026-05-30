import type { Idea, PipelineResult, PipelineStatus, StartPipelineResponse, TopicInput } from "./types";
import { createMockStream, mockResult, type StreamEvent } from "../mocks/sample";

const envUseMock = (import.meta as any).env?.VITE_USE_MOCK as string | undefined;
export const USE_MOCK = envUseMock ? envUseMock !== "false" : true;

export const API_URL_STORAGE_KEY = "eureka_api_url";
export const API_URL_FALLBACK = "http://localhost:8000";

export function getApiUrl() {
  if (typeof window === "undefined") return API_URL_FALLBACK;
  const stored = window.localStorage.getItem(API_URL_STORAGE_KEY);
  const env = (import.meta as any).env?.VITE_API_URL as string | undefined;
  return (stored && stored.trim().length > 0 ? stored : env && env.trim().length > 0 ? env : API_URL_FALLBACK).replace(/\/$/, "");
}

export function setApiUrl(nextUrl: string) {
  if (typeof window === "undefined") return;
  const clean = nextUrl.trim().replace(/\/$/, "");
  window.localStorage.setItem(API_URL_STORAGE_KEY, clean);
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiUrl()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export type ChatAgent = "scout" | "gap-analyst" | "innovator" | "critic" | "coherence-validator";
export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chat(
  agent: ChatAgent,
  message: string,
  history: ChatMessage[],
): Promise<{ reply: string }> {
  if (USE_MOCK) {
    const prefix =
      agent === "scout"
        ? "Scout"
        : agent === "gap-analyst"
          ? "Gap Analyst"
          : agent === "innovator"
            ? "Innovator"
            : agent === "critic"
              ? "Critic"
              : "Coherence Validator";
    return {
      reply: `${prefix}: Aku bisa bantu breakdown topik ini jadi langkah riset dan eksperimen cepat.\n\nPertanyaan kamu: "${message}"`,
    };
  }

  return fetchJson<{ reply: string }>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, message, history }),
  });
}

export async function startPipeline(topic: string): Promise<StartPipelineResponse> {
  if (USE_MOCK) {
    const pipeline_id = Math.random().toString(16).slice(2, 10);
    return {
      pipeline_id,
      status: "started",
      message: `Pipeline started. Connect to /api/pipeline/${pipeline_id}/stream for live updates.`,
    };
  }

  const body: TopicInput = { topic };
  return fetchJson<StartPipelineResponse>("/api/pipeline/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function streamPipeline(
  pipelineId: string,
  handlers: {
    onEvent?: (ev: StreamEvent) => void;
    onError?: (err: unknown) => void;
  },
  args?: { topic?: string },
) {
  if (USE_MOCK) {
    return createMockStream({
      pipelineId,
      topic: args?.topic ?? mockResult.topic,
      onEvent: (ev) => handlers.onEvent?.(ev),
    });
  }

  const es = new EventSource(`${getApiUrl()}/api/pipeline/${pipelineId}/stream`);

  es.onmessage = (e) => {
    try {
      const parsed = JSON.parse(e.data) as StreamEvent;
      handlers.onEvent?.(parsed);
    } catch (err) {
      handlers.onError?.(err);
    }
  };

  es.onerror = (err) => {
    handlers.onError?.(err);
  };

  return { close: () => es.close() };
}

export async function getStatus(pipelineId: string): Promise<PipelineStatus> {
  if (USE_MOCK) {
    return {
      pipeline_id: pipelineId,
      status: "running",
      agents: [],
      started_at: new Date().toISOString(),
      topic: mockResult.topic,
    };
  }

  return fetchJson<PipelineStatus>(`/api/pipeline/${pipelineId}/status`);
}

export async function getResult(pipelineId: string): Promise<PipelineResult> {
  if (USE_MOCK) {
    return { ...mockResult, pipeline_id: pipelineId };
  }
  return fetchJson<PipelineResult>(`/api/pipeline/${pipelineId}/result`);
}

export async function overrideIdea(
  ideaId: string,
  input: { novelty_override?: number; feasibility_override?: number },
): Promise<{ status: string; idea: Idea }> {
  const body = { idea_id: ideaId, ...input };

  if (USE_MOCK) {
    const base = mockResult.ideas.find((x) => x.id === ideaId);
    if (!base) throw new Error("Idea not found");
    const idea: Idea = {
      ...base,
      novelty_score: input.novelty_override ?? base.novelty_score,
      feasibility_score: input.feasibility_override ?? base.feasibility_score,
      human_novelty_override: input.novelty_override,
      human_feasibility_override: input.feasibility_override,
      is_human_adjusted: input.novelty_override !== undefined || input.feasibility_override !== undefined,
    };
    return { status: "success", idea };
  }

  return fetchJson<{ status: string; idea: Idea }>(`/api/ideas/${ideaId}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function cacheStats(): Promise<{ total_entries: number; active_entries: number; expired_entries: number }> {
  if (USE_MOCK) return { total_entries: 12, active_entries: 9, expired_entries: 3 };
  return fetchJson<{ total_entries: number; active_entries: number; expired_entries: number }>("/api/cache/stats");
}

export async function cacheReset(): Promise<{ status: string; message: string }> {
  if (USE_MOCK) return { status: "success", message: "Cache reset successfully" };
  return fetchJson<{ status: string; message: string }>("/api/cache/reset", { method: "POST" });
}
