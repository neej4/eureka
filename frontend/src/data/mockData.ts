import type { PipelineResult } from "../../../shared/types";

export const mockResult: PipelineResult = {
  pipeline_id: "mock-pipeline",
  topic: "mock topic",
  duration_seconds: 18,
  baseline_human_days: 14,
  roi_percentage: 99,
  cached: false,
  papers: [
    {
      id: "arxiv:2401.00001",
      title: "Adaptive Retrieval for Scientific Discovery",
      abstract:
        "We study retrieval-augmented pipelines for scientific synthesis and propose a simple adaptive retrieval strategy.",
      authors: ["A. Researcher", "B. Scientist"],
      year: 2024,
      url: "https://arxiv.org/abs/2401.00001",
    },
    {
      id: "arxiv:2402.01234",
      title: "Measuring Novelty in Cross-Domain Ideation",
      abstract:
        "We introduce a novelty margin metric that captures uncertainty and cross-domain transfer.",
      authors: ["C. Author", "D. Author"],
      year: 2024,
      url: "https://arxiv.org/abs/2402.01234",
    },
  ],
  clusters: [
    {
      name: "RAG Evaluation",
      paper_count: 27,
      status: "saturated",
      papers: ["arxiv:2401.00001"],
    },
    {
      name: "Cross-domain Novelty Metrics",
      paper_count: 6,
      status: "white_space",
      papers: ["arxiv:2402.01234"],
    },
  ],
  ideas: [
    {
      id: "idea-1",
      title: "White-space guided retrieval curriculum",
      description:
        "Train a retrieval curriculum that prioritizes white-space clusters and dynamically shifts as the knowledge map updates.",
      novelty_score: 78,
      novelty_score_range: "70–86",
      feasibility_score: 65,
      feasibility_score_range: "55–75",
      confidence_level: "medium",
      coherence_score: 74,
      citations: ["arxiv:2401.00001", "arxiv:2402.01234"],
      validation_plan: [
        "Build a synthetic benchmark with controlled novelty gaps.",
        "Run retrieval curriculum vs static retrieval baseline.",
        "Measure novelty margin improvement and error bars.",
      ],
      is_human_adjusted: false,
    },
    {
      id: "idea-2",
      title: "Uncertainty-aware novelty scoring UI loop",
      description:
        "Expose novelty/feasibility margins in the UI and let users adjust weights to see ranking sensitivity in real time.",
      novelty_score: 71,
      novelty_score_range: "65–77",
      feasibility_score: 82,
      feasibility_score_range: "75–89",
      confidence_level: "high",
      coherence_score: 81,
      citations: ["arxiv:2402.01234"],
      validation_plan: [
        "Implement ranking sensitivity analysis on sampled weights.",
        "Collect user adjustments and compare final selections.",
        "Measure time-to-decision vs baseline UI.",
      ],
      is_human_adjusted: true,
      human_novelty_override: 74,
      human_feasibility_override: 88,
    },
  ],
};
