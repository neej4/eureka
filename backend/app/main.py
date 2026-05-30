from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import asyncio
import hashlib
import json
from datetime import datetime

from .orchestrator import PipelineOrchestrator, orchestrators

app = FastAPI(title="Eureka API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicInput(BaseModel):
    topic: str = Field(..., min_length=3, description="Research topic input")

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

class HumanOverrideInput(BaseModel):
    idea_id: str
    novelty_override: Optional[float] = None
    feasibility_override: Optional[float] = None

@app.get("/")
async def root():
    return {"message": "Eureka API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/pipeline/start")
async def start_pipeline(input: TopicInput):
    try:
        pipeline_id = hashlib.md5(f"{input.topic}{datetime.now().isoformat()}".encode()).hexdigest()[:8]
        
        orchestrator = PipelineOrchestrator(pipeline_id, input.topic)
        orchestrators[pipeline_id] = orchestrator
        
        asyncio.create_task(run_pipeline_async(pipeline_id))
        
        return {
            "pipeline_id": pipeline_id,
            "status": "started",
            "message": f"Pipeline started. Connect to /api/pipeline/{pipeline_id}/stream for live updates."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_pipeline_async(pipeline_id: str):
    try:
        orchestrator = orchestrators[pipeline_id]
        await orchestrator.run()
    except Exception as e:
        print(f"Pipeline error: {e}")

@app.get("/api/pipeline/{pipeline_id}/stream")
async def stream_pipeline(pipeline_id: str):
    if pipeline_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    return StreamingResponse(
        generate_stream(pipeline_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

async def generate_stream(pipeline_id: str):
    orchestrator = orchestrators[pipeline_id]

    while True:
        status = orchestrator.get_status()
        
        event = {
            "type": "status",
            "data": {
                "pipeline_id": status.pipeline_id,
                "status": status.status,
                "agents": [a.dict() for a in status.agents],
                "topic": status.topic
            }
        }
        
        yield f"data: {json.dumps(event)}\n\n"
        
        if status.status == "failed":
            failed_message = None
            for a in status.agents:
                if a.status == "failed":
                    failed_message = a.message
                    break
            yield f"data: {json.dumps({'type': 'error', 'message': failed_message or 'Pipeline failed'})}\n\n"
            break

        if status.status == "completed":
            result = orchestrator._generate_result()
            result_event = {
                "type": "result",
                "data": result.dict()
            }
            yield f"data: {json.dumps(result_event)}\n\n"
            break
        
        await asyncio.sleep(0.5)

@app.get("/api/pipeline/{pipeline_id}/status")
async def get_pipeline_status(pipeline_id: str):
    if pipeline_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    orchestrator = orchestrators[pipeline_id]
    return orchestrator.get_status()

@app.get("/api/pipeline/{pipeline_id}/result")
async def get_pipeline_result(pipeline_id: str):
    if pipeline_id not in orchestrators:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    orchestrator = orchestrators[pipeline_id]
    
    completed_count = sum(1 for a in orchestrator.status.values() if a.status == "completed")
    total_count = len(orchestrator.status)
    
    if completed_count < total_count:
        raise HTTPException(status_code=202, detail="Pipeline still running")
    
    return orchestrator._generate_result()

@app.post("/api/ideas/{idea_id}/override")
async def human_override(idea_id: str, override: HumanOverrideInput):
    for pipeline_id, orchestrator in orchestrators.items():
        for idea in orchestrator.ideas:
            if idea.id == idea_id:
                if override.novelty_override is not None:
                    idea.human_novelty_override = override.novelty_override
                    idea.novelty_score = int(0.7 * idea.novelty_score + 0.3 * override.novelty_override)
                    idea.is_human_adjusted = True
                
                if override.feasibility_override is not None:
                    idea.human_feasibility_override = override.feasibility_override
                    idea.feasibility_score = int(0.7 * idea.feasibility_score + 0.3 * override.feasibility_override)
                    idea.is_human_adjusted = True
                
                return {"status": "success", "idea": idea.dict()}
    
    raise HTTPException(status_code=404, detail="Idea not found")

@app.post("/api/cache/reset")
async def reset_cache():
    from .cache import agent_cache_instance
    agent_cache_instance.reset()
    return {"status": "success", "message": "Cache reset successfully"}

@app.get("/api/cache/stats")
async def get_cache_stats():
    from .cache import agent_cache_instance
    return agent_cache_instance.get_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
