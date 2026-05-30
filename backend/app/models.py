from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class AgentStatus(BaseModel):
    agent: str
    status: Literal["pending", "running", "completed", "failed"]
    message: Optional[str] = None

class PipelineStatus(BaseModel):
    pipeline_id: str
    status: Literal["running", "completed", "failed"]
    agents: List[AgentStatus]
    started_at: datetime
    completed_at: Optional[datetime] = None
    topic: str
    total_duration_seconds: Optional[float] = None

class Paper(BaseModel):
    id: str
    title: str
    abstract: str
    authors: List[str]
    year: int
    url: str

class Cluster(BaseModel):
    name: str
    papers: List[str]
    status: Literal["saturated", "white_space"]
    paper_count: int

class Idea(BaseModel):
    id: str
    title: str
    description: str
    novelty_score: float = Field(..., ge=0, le=100)
    novelty_score_range: str
    feasibility_score: float = Field(..., ge=0, le=100)
    feasibility_score_range: str
    confidence_level: Literal["low", "medium", "high"]
    coherence_score: float = Field(..., ge=0, le=100)
    citations: List[str]
    validation_plan: List[str]
    is_human_adjusted: bool = False
    human_novelty_override: Optional[float] = None
    human_feasibility_override: Optional[float] = None

class PipelineResult(BaseModel):
    pipeline_id: str
    topic: str
    papers: List[Paper]
    clusters: List[Cluster]
    ideas: List[Idea]
    duration_seconds: float
    baseline_human_days: int = 14
    roi_percentage: float
    cached: bool = False
