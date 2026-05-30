export interface TopicInput {
  topic: string;
}

export interface AgentStatus {
  agent: 'scout' | 'gap-analyst' | 'innovator' | 'critic' | 'coherence-validator';
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
}

export interface PipelineStatus {
  pipeline_id: string;
  status: 'running' | 'completed' | 'failed';
  agents: AgentStatus[];
  started_at: string;
  completed_at?: string;
  topic: string;
  total_duration_seconds?: number;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  url: string;
}

export interface Cluster {
  name: string;
  papers: string[];
  status: 'saturated' | 'white_space';
  paper_count: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  novelty_score: number;
  novelty_score_range: string;
  feasibility_score: number;
  feasibility_score_range: string;
  confidence_level: 'low' | 'medium' | 'high';
  coherence_score: number;
  citations: string[];
  validation_plan: string[];
  is_human_adjusted: boolean;
  human_novelty_override?: number;
  human_feasibility_override?: number;
}

export interface PipelineResult {
  pipeline_id: string;
  topic: string;
  papers: Paper[];
  clusters: Cluster[];
  ideas: Idea[];
  duration_seconds: number;
  baseline_human_days: number;
  roi_percentage: number;
  cached: boolean;
}

export interface StartPipelineResponse {
  pipeline_id: string;
  status: string;
  message: string;
}
