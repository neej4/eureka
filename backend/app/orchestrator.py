import asyncio
import hashlib
import json
from datetime import datetime
from typing import AsyncGenerator, Dict, List, Optional
from .models import AgentStatus, PipelineStatus, Paper, Cluster, Idea, PipelineResult
from .agents.scout import scout_agent
from .agents.gap_analyst import gap_analyst_agent
from .agents.innovator import innovator_agent
from .agents.critic import critic_agent
from .agents.coherence_validator import coherence_validator_agent
from .cache import agent_cache_instance

class PipelineOrchestrator:
    def __init__(self, pipeline_id: str, topic: str):
        self.pipeline_id = pipeline_id
        self.topic = topic
        self.started_at = datetime.now()
        self.status: Dict[str, AgentStatus] = {
            "scout": AgentStatus(agent="scout", status="pending"),
            "gap-analyst": AgentStatus(agent="gap-analyst", status="pending"),
            "innovator": AgentStatus(agent="innovator", status="pending"),
            "critic": AgentStatus(agent="critic", status="pending"),
            "coherence-validator": AgentStatus(agent="coherence-validator", status="pending")
        }
        self.papers: List[Paper] = []
        self.clusters: List[Cluster] = []
        self.ideas: List[Idea] = []
        self.cached = False
        
    async def run(self) -> PipelineResult:
        try:
            await self._run_scout()
            await self._run_gap_analyst()
            await self._run_innovator()
            await self._run_critic()
            await self._run_coherence_validator()
            
            return self._generate_result()
            
        except Exception as e:
            self.status["scout"].status = "failed"
            self.status["scout"].message = str(e)
            raise
    
    async def _run_scout(self):
        self.status["scout"].status = "running"
        self.status["scout"].message = f"Analyzing recent papers for topic: {self.topic} ..."
        yield_event("scout", "running", self.status["scout"].message)
        
        cached_result = agent_cache_instance.get("scout", self.topic)
        
        if cached_result:
            self.papers = [Paper(**p) for p in cached_result]
            self.cached = True
            self.status["scout"].status = "completed"
            self.status["scout"].message = f"Collected {len(self.papers)} papers (source: cache)."
            yield_event("scout", "completed", self.status["scout"].message)
        else:
            await asyncio.sleep(1.5)
            
            self.papers = await scout_agent(self.topic)
            
            agent_cache_instance.set("scout", self.topic, [p.dict() for p in self.papers])
            
            self.status["scout"].status = "completed"
            self.status["scout"].message = f"Collected {len(self.papers)} papers (source: live)."
            yield_event("scout", "completed", self.status["scout"].message)
    
    async def _run_gap_analyst(self):
        self.status["gap-analyst"].status = "running"
        self.status["gap-analyst"].message = "Clustering papers to surface underexplored intersections ..."
        yield_event("gap-analyst", "running", self.status["gap-analyst"].message)
        
        cached_result = agent_cache_instance.get("gap-analyst", [p.dict() for p in self.papers])
        
        if cached_result:
            self.clusters = [Cluster(**c) for c in cached_result]
            self.status["gap-analyst"].status = "completed"
            white_spaces = sum(1 for c in self.clusters if c.status == "white_space")
            self.status["gap-analyst"].message = f"Built {len(self.clusters)} clusters, found {white_spaces} white spaces (source: cache)."
            yield_event("gap-analyst", "completed", self.status["gap-analyst"].message)
        else:
            await asyncio.sleep(1.5)
            
            self.clusters = gap_analyst_agent(self.papers)
            
            agent_cache_instance.set("gap-analyst", [p.dict() for p in self.papers], 
                                    [c.dict() for c in self.clusters])
            
            white_spaces = sum(1 for c in self.clusters if c.status == "white_space")
            self.status["gap-analyst"].status = "completed"
            self.status["gap-analyst"].message = f"Built {len(self.clusters)} clusters, found {white_spaces} white spaces."
            yield_event("gap-analyst", "completed", self.status["gap-analyst"].message)
    
    async def _run_innovator(self):
        self.status["innovator"].status = "running"
        self.status["innovator"].message = "Synthesizing breakthrough ideas grounded in the cluster structure ..."
        yield_event("innovator", "running", self.status["innovator"].message)
        
        cached_result = agent_cache_instance.get("innovator", {
            "clusters": [c.dict() for c in self.clusters],
            "topic": self.topic
        })
        
        if cached_result:
            self.ideas = [Idea(**i) for i in cached_result]
            self.status["innovator"].status = "completed"
            self.status["innovator"].message = f"Generated {len(self.ideas)} ideas (source: cache)."
            yield_event("innovator", "completed", self.status["innovator"].message)
        else:
            await asyncio.sleep(2)
            
            self.ideas = innovator_agent(self.clusters, self.papers, self.topic)
            
            agent_cache_instance.set("innovator", {
                "clusters": [c.dict() for c in self.clusters],
                "topic": self.topic
            }, [i.dict() for i in self.ideas])
            
            self.status["innovator"].status = "completed"
            self.status["innovator"].message = f"Generated {len(self.ideas)} ideas."
            yield_event("innovator", "completed", self.status["innovator"].message)
    
    async def _run_critic(self):
        self.status["critic"].status = "running"
        self.status["critic"].message = "Scoring ideas for novelty/feasibility and filtering weak candidates ..."
        yield_event("critic", "running", self.status["critic"].message)
        
        cached_result = agent_cache_instance.get("critic", [i.dict() for i in self.ideas])
        
        if cached_result:
            self.ideas = [Idea(**i) for i in cached_result]
            self.status["critic"].status = "completed"
            self.status["critic"].message = f"Scored {len(self.ideas)} ideas (source: cache)."
            yield_event("critic", "completed", self.status["critic"].message)
        else:
            await asyncio.sleep(1.5)
            
            self.ideas = critic_agent(self.ideas)
            
            agent_cache_instance.set("critic", [i.dict() for i in self.ideas], 
                                    [i.dict() for i in self.ideas])
            
            self.status["critic"].status = "completed"
            self.status["critic"].message = f"Scored {len(self.ideas)} ideas and ranked the strongest candidates."
            yield_event("critic", "completed", self.status["critic"].message)
    
    async def _run_coherence_validator(self):
        self.status["coherence-validator"].status = "running"
        self.status["coherence-validator"].message = "Validating coherence and summarizing ROI assumptions ..."
        yield_event("coherence-validator", "running", self.status["coherence-validator"].message)
        
        cached_result = agent_cache_instance.get("coherence-validator", {
            "ideas": [i.dict() for i in self.ideas],
            "papers": [p.dict() for p in self.papers]
        })
        
        if cached_result:
            self.ideas = [Idea(**i) for i in cached_result]
            self.status["coherence-validator"].status = "completed"
            self.status["coherence-validator"].message = f"Validated {len(self.ideas)} ideas (source: cache)."
            yield_event("coherence-validator", "completed", self.status["coherence-validator"].message)
        else:
            await asyncio.sleep(1.5)
            
            self.ideas = coherence_validator_agent(self.ideas, self.papers)
            
            agent_cache_instance.set("coherence-validator", {
                "ideas": [i.dict() for i in self.ideas],
                "papers": [p.dict() for p in self.papers]
            }, [i.dict() for i in self.ideas])
            
            self.status["coherence-validator"].status = "completed"
            self.status["coherence-validator"].message = f"Validated {len(self.ideas)} ideas and computed pipeline ROI summary."
            yield_event("coherence-validator", "completed", self.status["coherence-validator"].message)
    
    def _generate_result(self) -> PipelineResult:
        duration = (datetime.now() - self.started_at).total_seconds()
        
        baseline_days = 14
        duration_days = duration / 86400
        roi_percentage = ((baseline_days - duration_days) / baseline_days) * 100 if baseline_days > duration_days else 0
        
        return PipelineResult(
            pipeline_id=self.pipeline_id,
            topic=self.topic,
            papers=self.papers,
            clusters=self.clusters,
            ideas=self.ideas,
            duration_seconds=round(duration, 2),
            baseline_human_days=baseline_days,
            roi_percentage=round(roi_percentage, 1),
            cached=self.cached
        )
    
    def get_status(self) -> PipelineStatus:
        agent_statuses = [a.status for a in self.status.values()]

        if any(s == "failed" for s in agent_statuses):
            overall_status: str = "failed"
        elif all(s == "completed" for s in agent_statuses):
            overall_status = "completed"
        else:
            overall_status = "running"

        return PipelineStatus(
            pipeline_id=self.pipeline_id,
            status=overall_status,
            agents=list(self.status.values()),
            started_at=self.started_at,
            completed_at=datetime.now() if overall_status in ("completed", "failed") else None,
            topic=self.topic,
            total_duration_seconds=(datetime.now() - self.started_at).total_seconds()
        )

def yield_event(agent: str, status: str, message: str):
    print(f"[{datetime.now().isoformat()}] {agent}: {status} - {message}")

orchestrators: Dict[str, PipelineOrchestrator] = {}
