import type { PipelineResult } from "../../../shared/types";

export const mockResult: PipelineResult = {
  duration_seconds: 18,
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
      label: "saturated",
      paper_ids: ["arxiv:2401.00001"],
    },
    {
      name: "Cross-domain Novelty Metrics",
      paper_count: 6,
      label: "white_space",
      paper_ids: ["arxiv:2402.01234"],
    },
  ],
  ideas: [
    {
      id: "idea-1",
      title: "White-space guided retrieval curriculum",
      description:
        "Train a retrieval curriculum that prioritizes white-space clusters and dynamically shifts as the knowledge map updates.",
      novelty_score: 78,
      novelty_margin: 8,
      feasibility_score: 65,
      feasibility_margin: 10,
      confidence_level: "medium",
      confidence_reason: "Requires careful evaluation design but uses standard tooling.",
      coherence_score: 74,
      coherence_issues: ["Ablation plan needs clearer baselines."],
      citations: ["arxiv:2401.00001", "arxiv:2402.01234"],
      cross_clusters: ["RAG Evaluation", "Cross-domain Novelty Metrics"],
      validation_plan: [
        "Build a synthetic benchmark with controlled novelty gaps.",
        "Run retrieval curriculum vs static retrieval baseline.",
        "Measure novelty margin improvement and error bars.",
      ],
    },
    {
      id: "idea-2",
      title: "Uncertainty-aware novelty scoring UI loop",
      description:
        "Expose novelty/feasibility margins in the UI and let users adjust weights to see ranking sensitivity in real time.",
      novelty_score: 71,
      novelty_margin: 6,
      feasibility_score: 82,
      feasibility_margin: 7,
      confidence_level: "high",
      coherence_score: 81,
      coherence_issues: [],
      citations: ["arxiv:2402.01234"],
      cross_clusters: ["Cross-domain Novelty Metrics"],
      validation_plan: [
        "Implement ranking sensitivity analysis on sampled weights.",
        "Collect user adjustments and compare final selections.",
        "Measure time-to-decision vs baseline UI.",
      ],
    },
  ],
};

