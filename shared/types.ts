export type AgentName = "scout" | "gap_analyst" | "innovator" | "critic" | "coherence";

export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineEvent {
  agent: AgentName;
  status: AgentStatus;
  from_cache?: boolean;
  error?: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  url: string;
}

export type ClusterLabel = "saturated" | "white_space";

export interface Cluster {
  name: string;
  paper_count: number;
  label: ClusterLabel;
  paper_ids: string[];
}

export type ConfidenceLevel = "low" | "medium" | "high";

export interface Idea {
  id: string;
  title: string;
  description: string;
  novelty_score: number;
  novelty_margin: number;
  feasibility_score: number;
  feasibility_margin: number;
  confidence_level: ConfidenceLevel;
  confidence_reason?: string;
  coherence_score: number;
  coherence_issues: string[];
  citations: string[];
  cross_clusters: string[];
  validation_plan: [string, string, string];
}

export interface PipelineResult {
  papers: Paper[];
  clusters: Cluster[];
  ideas: Idea[];
  duration_seconds: number;
}

