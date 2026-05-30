import type { AgentStatus, Idea, PipelineResult } from "../lib/types";

export type StreamEvent =
  | {
      type: "status";
      data: {
        pipeline_id: string;
        status: "running" | "completed" | "failed";
        agents: AgentStatus[];
        topic: string;
      };
    }
  | { type: "result"; data: PipelineResult }
  | { type: "error"; message: string };

export const mockResult: PipelineResult = {
  pipeline_id: "mock0000",
  topic: "foundation models for scientific discovery",
  papers: [
    {
      id: "p1",
      title: "Large Language Models for Scientific Discovery",
      abstract: "A survey of how LLMs accelerate hypothesis generation, literature review, and experimental design.",
      authors: ["John Smith", "Jane Doe"],
      year: 2024,
      url: "https://arxiv.org/abs/2401.00001",
    },
    {
      id: "p2",
      title: "Multi-Agent Systems for Scientific Research",
      abstract: "A multi-agent framework where specialized roles collaborate across data collection, analysis, and ideation.",
      authors: ["Alice Johnson", "Bob Williams"],
      year: 2024,
      url: "https://arxiv.org/abs/2401.00002",
    },
    {
      id: "p3",
      title: "Knowledge Graph Construction from Research Papers",
      abstract: "Methods for extracting entities and relations to build knowledge graphs from scientific corpora.",
      authors: ["Grace Kim", "Henry Wang"],
      year: 2024,
      url: "https://arxiv.org/abs/2401.00006",
    },
    {
      id: "p4",
      title: "Semantic Search in Scientific Literature",
      abstract: "Embedding-based retrieval for academic search with improved relevance and diversity.",
      authors: ["Laura Wilson"],
      year: 2023,
      url: "https://arxiv.org/abs/2312.00009",
    },
    {
      id: "p5",
      title: "Research Idea Scoring and Validation",
      abstract: "Scoring novelty, feasibility, and validation plans for research proposals using mixed signals.",
      authors: ["Jack Brown", "Kate Davis"],
      year: 2024,
      url: "https://arxiv.org/abs/2401.00008",
    },
  ],
  clusters: [
    { name: "Agentic Workflows", papers: ["p2"], status: "saturated", paper_count: 1 },
    { name: "Knowledge Graphs", papers: ["p3"], status: "white_space", paper_count: 1 },
    { name: "Semantic Retrieval", papers: ["p4"], status: "saturated", paper_count: 1 },
    { name: "Idea Evaluation", papers: ["p5"], status: "white_space", paper_count: 1 },
    { name: "Foundation Models", papers: ["p1"], status: "saturated", paper_count: 1 },
  ],
  ideas: [
    {
      id: "i1",
      title: "White-space discovery via paper-to-graph compression",
      description: "Compress papers into a lightweight knowledge graph, then detect sparse subgraphs as actionable research gaps.",
      novelty_score: 88,
      novelty_score_range: "88 ± 6",
      feasibility_score: 76,
      feasibility_score_range: "76 ± 8",
      confidence_level: "high",
      coherence_score: 86,
      citations: ["https://arxiv.org/abs/2401.00006"],
      validation_plan: ["Build graph extraction baseline", "Measure gap precision on held-out topics", "User study with researchers"],
      is_human_adjusted: false,
    },
    {
      id: "i2",
      title: "Diverse retrieval for novelty-first idea generation",
      description: "Use diversity-aware semantic retrieval to surface under-cited yet conceptually relevant papers, improving novelty.",
      novelty_score: 84,
      novelty_score_range: "84 ± 7",
      feasibility_score: 79,
      feasibility_score_range: "79 ± 6",
      confidence_level: "high",
      coherence_score: 83,
      citations: ["https://arxiv.org/abs/2312.00009"],
      validation_plan: ["Implement diversity ranking", "Compare novelty uplift vs baseline", "Run ablation across disciplines"],
      is_human_adjusted: false,
    },
    {
      id: "i3",
      title: "Agent critic with calibration from human overrides",
      description: "Blend human overrides into critic scoring to improve calibration and reduce overconfident ratings over time.",
      novelty_score: 79,
      novelty_score_range: "79 ± 9",
      feasibility_score: 82,
      feasibility_score_range: "82 ± 6",
      confidence_level: "medium",
      coherence_score: 81,
      citations: ["https://arxiv.org/abs/2401.00008"],
      validation_plan: ["Collect override traces", "Fit calibration curve", "Evaluate score stability across sessions"],
      is_human_adjusted: false,
    },
    {
      id: "i4",
      title: "Cross-disciplinary pairing by graph motif matching",
      description: "Match motifs across cluster graphs to propose cross-domain combinations with high transfer potential.",
      novelty_score: 91,
      novelty_score_range: "91 ± 5",
      feasibility_score: 70,
      feasibility_score_range: "70 ± 10",
      confidence_level: "high",
      coherence_score: 78,
      citations: ["https://arxiv.org/abs/2401.00006", "https://arxiv.org/abs/2401.00002"],
      validation_plan: ["Define motifs and similarity metric", "Generate candidate pairings", "Expert review for plausibility"],
      is_human_adjusted: false,
    },
    {
      id: "i5",
      title: "Paper-to-experiment templates for faster feasibility checks",
      description: "Extract experimental templates from related work to rapidly estimate feasibility and required resources.",
      novelty_score: 72,
      novelty_score_range: "72 ± 10",
      feasibility_score: 88,
      feasibility_score_range: "88 ± 5",
      confidence_level: "medium",
      coherence_score: 84,
      citations: ["https://arxiv.org/abs/2401.00001"],
      validation_plan: ["Mine methods sections", "Auto-generate checklists", "Validate on benchmark papers"],
      is_human_adjusted: false,
    },
    {
      id: "i6",
      title: "Failure-mode taxonomy for idea scoring",
      description: "Score ideas by explicit failure modes (data, compute, evaluation, ethics) and surface mitigations per mode.",
      novelty_score: 77,
      novelty_score_range: "77 ± 8",
      feasibility_score: 73,
      feasibility_score_range: "73 ± 9",
      confidence_level: "medium",
      coherence_score: 80,
      citations: ["https://arxiv.org/abs/2401.00008"],
      validation_plan: ["Define taxonomy", "Annotate ideas", "Measure inter-rater agreement"],
      is_human_adjusted: false,
    },
    {
      id: "i7",
      title: "Cache-aware pipeline scheduling for repeat topics",
      description: "Detect partial cache hits and re-run only the missing agents, reducing end-to-end time on iterative research.",
      novelty_score: 69,
      novelty_score_range: "69 ± 10",
      feasibility_score: 90,
      feasibility_score_range: "90 ± 4",
      confidence_level: "high",
      coherence_score: 82,
      citations: ["https://arxiv.org/abs/2401.00002"],
      validation_plan: ["Implement cache keys", "Measure time saved", "Stress test across topics"],
      is_human_adjusted: false,
    },
    {
      id: "i8",
      title: "Grounded idea statements with citation-linked claims",
      description: "Generate ideas as a set of claims, each linked to supporting citations, to improve trust and coherence.",
      novelty_score: 83,
      novelty_score_range: "83 ± 7",
      feasibility_score: 74,
      feasibility_score_range: "74 ± 8",
      confidence_level: "high",
      coherence_score: 89,
      citations: ["https://arxiv.org/abs/2401.00001", "https://arxiv.org/abs/2312.00009"],
      validation_plan: ["Define claim schema", "Auto-link citations", "Human evaluation for trust"],
      is_human_adjusted: false,
    },
  ],
  duration_seconds: 90,
  baseline_human_days: 14,
  roi_percentage: 99.9,
  cached: false,
};

const AGENTS: AgentStatus["agent"][] = ["scout", "gap-analyst", "innovator", "critic", "coherence-validator"];

function buildInitialAgents(): AgentStatus[] {
  return AGENTS.map((agent) => ({ agent, status: "pending" }));
}

function cloneIdea(idea: Idea): Idea {
  return JSON.parse(JSON.stringify(idea)) as Idea;
}

export function createMockStream(args: {
  pipelineId: string;
  topic: string;
  onEvent: (ev: StreamEvent) => void;
  intervalMs?: number;
}) {
  const intervalMs = args.intervalMs ?? 500;
  let closed = false;
  let timer: number | null = null;
  let step = 0;
  let agents = buildInitialAgents();

  const tick = () => {
    if (closed) return;

    if (step === 0) {
      agents = buildInitialAgents();
    }

    const agentIndex = Math.min(AGENTS.length - 1, Math.floor(step / 2));
    const isRunningStep = step % 2 === 0;
    const current = AGENTS[agentIndex];

    agents = agents.map((a) => {
      if (a.agent !== current) return a;
      return { ...a, status: isRunningStep ? "running" : "completed" };
    });

    args.onEvent({
      type: "status",
      data: {
        pipeline_id: args.pipelineId,
        status: agentIndex === AGENTS.length - 1 && !isRunningStep ? "completed" : "running",
        agents,
        topic: args.topic,
      },
    });

    if (agentIndex === AGENTS.length - 1 && !isRunningStep) {
      const result: PipelineResult = {
        ...mockResult,
        pipeline_id: args.pipelineId,
        topic: args.topic,
        ideas: mockResult.ideas.map(cloneIdea),
        cached: false,
        duration_seconds: 90,
        roi_percentage: 99.9,
      };
      args.onEvent({ type: "result", data: result });
      close();
      return;
    }

    step += 1;
    timer = window.setTimeout(tick, intervalMs);
  };

  const close = () => {
    closed = true;
    if (timer !== null) window.clearTimeout(timer);
  };

  timer = window.setTimeout(tick, intervalMs);

  return { close };
}

