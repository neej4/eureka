# Real Papers Search + Gemini LLM Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fetch real papers from multiple sources, show them in the UI immediately, then run the 5-agent pipeline using Gemini LLM with SSE progress updates.

**Architecture:** Add a paper search API (`/api/papers/search`) that aggregates arXiv + OpenAlex. Extend pipeline start to optionally accept prefetched papers to avoid double-fetch. Implement a Gemini JSON-mode client and replace agent steps with LLM-driven JSON outputs (with safe fallbacks).

**Tech Stack:** FastAPI + httpx + Pydantic; Gemini REST API; React/Vite frontend.

---

## Scope & Constraints

- Backend remains FastAPI under `repo_gh/backend/app`.
- Frontend remains React/Vite under `repo_gh/frontend`.
- Existing endpoints stay compatible; new inputs are optional.
- SSE keeps `type: "status" | "result" | "error"` and result remains final-only.

## File Structure (What to Change)

**Backend**
- Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/arxiv.py`
- Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/openalex.py`
- Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/search.py`
- Create: `d:/PROJECT/trae_project/repo_gh/backend/app/llm/gemini.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/scout.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/gap_analyst.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/innovator.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/critic.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/coherence_validator.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/orchestrator.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/main.py`
- Modify: `d:/PROJECT/trae_project/repo_gh/backend/requirements.txt`
- Modify: `d:/PROJECT/trae_project/repo_gh/blackbox_test.py`

**Frontend**
- Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/lib/api.ts`
- Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/hooks/usePipeline.ts`
- Create: `d:/PROJECT/trae_project/repo_gh/frontend/src/components/PapersPreview.tsx`
- Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/App.tsx`

---

## Task 1: Configure Gemini Key (Preflight)

**Goal:** Ensure backend can call Gemini via environment variable.

- [ ] **Step 1: Add required env var naming**

Backend reads `GEMINI_API_KEY` from environment.

- [ ] **Step 2: Add `.env` loading (optional but recommended)**

Add dependency `python-dotenv` so `uvicorn` can load local `.env`.

Modify: `d:/PROJECT/trae_project/repo_gh/backend/requirements.txt`

```txt
fastapi
uvicorn[standard]
httpx
pydantic
python-dotenv
```

- [ ] **Step 3: Load `.env` in FastAPI startup (only if python-dotenv added)**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/main.py` near top-level imports:

```python
from dotenv import load_dotenv
load_dotenv()
```

- [ ] **Step 4: Manual verification**

Run backend and confirm `GEMINI_API_KEY` is visible:

```powershell
cd D:\PROJECT\trae_project\repo_gh\backend
.\.venv\Scripts\Activate.ps1
python -c "import os; print('GEMINI_API_KEY' in os.environ)"
```

Expected output: `True`

---

## Task 2: Paper Search Aggregator API (arXiv + OpenAlex)

**Goal:** Provide `/api/papers/search` for real paper retrieval to display in UI immediately.

### 2.1 Create source fetchers

- [ ] **Step 1: Create arXiv source helper**

Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/arxiv.py`

```python
import asyncio
import hashlib
from typing import List
import httpx
from ..models import Paper

async def search_arxiv(topic: str, limit: int = 50, timeout: int = 20) -> List[Paper]:
    q = topic.replace(" ", "+")
    url = f"http://export.arxiv.org/api/query?search_query=ti:{q}+OR+abs:{q}&start=0&max_results={limit}"
    async with httpx.AsyncClient() as client:
        resp = await asyncio.wait_for(client.get(url), timeout=timeout)
    if resp.status_code != 200:
        return []
    xml = resp.text
    out: List[Paper] = []
    entries = xml.split("<entry>")
    for i, entry in enumerate(entries[1 : limit + 1], 1):
        title = _extract(entry, "<title>", "</title>").replace("\n", " ").strip()
        abstract = _extract(entry, "<summary>", "</summary>").replace("\n", " ").strip()
        authors = []
        for a in entry.split("<author>")[1:]:
            name = _extract(a, "<name>", "</name>").strip()
            if name:
                authors.append(name)
        published = _extract(entry, "<published>", "</published>")
        year = int(published[:4]) if published[:4].isdigit() else 2024
        id_url = _extract(entry, "<id>", "</id>").strip()
        pid = hashlib.md5(id_url.encode()).hexdigest()[:10] if id_url else f"arxiv-{i}"
        if not title:
            continue
        out.append(Paper(id=pid, title=title, abstract=abstract, authors=authors or ["Unknown"], year=year, url=id_url or ""))
    return out

def _extract(xml: str, a: str, b: str) -> str:
    try:
        i = xml.index(a) + len(a)
        j = xml.index(b, i)
        return xml[i:j]
    except Exception:
        return ""
```

- [ ] **Step 2: Create OpenAlex source helper**

Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/openalex.py`

```python
import asyncio
import hashlib
from typing import List
import httpx
from ..models import Paper

async def search_openalex(topic: str, limit: int = 50, timeout: int = 20) -> List[Paper]:
    url = "https://api.openalex.org/works"
    params = {
        "search": topic,
        "per-page": min(limit, 200),
        "sort": "cited_by_count:desc",
    }
    async with httpx.AsyncClient() as client:
        resp = await asyncio.wait_for(client.get(url, params=params, headers={"User-Agent": "EUREKA/1.0"}), timeout=timeout)
    if resp.status_code != 200:
        return []
    data = resp.json()
    results = data.get("results") or []
    out: List[Paper] = []
    for r in results[:limit]:
        title = (r.get("title") or "").strip()
        if not title:
            continue
        abs_inverted = r.get("abstract_inverted_index") or None
        abstract = ""
        if isinstance(abs_inverted, dict):
            inv = abs_inverted
            positions = []
            for word, idxs in inv.items():
                for i in idxs:
                    positions.append((i, word))
            positions.sort(key=lambda x: x[0])
            abstract = " ".join([w for _, w in positions])[:5000]
        authorships = r.get("authorships") or []
        authors = []
        for a in authorships:
            auth = (a.get("author") or {}).get("display_name")
            if auth:
                authors.append(auth)
        year = r.get("publication_year") or 2024
        doi = r.get("doi") or ""
        primary = r.get("primary_location") or {}
        url_out = primary.get("landing_page_url") or doi or (r.get("id") or "")
        pid = hashlib.md5((doi or url_out or title).encode()).hexdigest()[:10]
        out.append(Paper(id=f"oa-{pid}", title=title, abstract=abstract, authors=authors or ["Unknown"], year=int(year), url=url_out))
    return out
```

### 2.2 Create aggregator and endpoint

- [ ] **Step 3: Create aggregator**

Create: `d:/PROJECT/trae_project/repo_gh/backend/app/sources/search.py`

```python
import asyncio
from typing import List
from ..models import Paper
from .arxiv import search_arxiv
from .openalex import search_openalex

def _key(p: Paper) -> str:
    t = (p.title or "").lower().strip()
    return t

async def search_papers(topic: str, limit: int = 50) -> List[Paper]:
    a_limit = max(10, limit)
    tasks = [
        search_arxiv(topic, limit=a_limit),
        search_openalex(topic, limit=a_limit),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    papers: List[Paper] = []
    for r in results:
        if isinstance(r, Exception):
            continue
        papers.extend(r)
    seen = set()
    uniq: List[Paper] = []
    for p in papers:
        k = _key(p)
        if not k or k in seen:
            continue
        seen.add(k)
        uniq.append(p)
        if len(uniq) >= limit:
            break
    return uniq
```

- [ ] **Step 4: Add `/api/papers/search` endpoint**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/main.py`

Add models:

```python
class PaperSearchResponse(BaseModel):
    papers: List[Paper]
```

Add route:

```python
from .sources.search import search_papers

@app.get("/api/papers/search", response_model=PaperSearchResponse)
async def papers_search(topic: str, limit: int = 50):
    papers = await search_papers(topic, limit=limit)
    return PaperSearchResponse(papers=papers)
```

---

## Task 3: Extend Pipeline Start to Accept Prefetched Papers

**Goal:** UI can show real papers immediately and the pipeline uses the same set (no double-fetch).

- [ ] **Step 1: Extend request model**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/main.py`

```python
class StartPipelineInput(TopicInput):
    papers: Optional[List[Paper]] = None
```

Update route signature:

```python
@app.post("/api/pipeline/start")
async def start_pipeline(input_data: StartPipelineInput):
    ...
```

- [ ] **Step 2: Pass prefetched papers into orchestrator**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/orchestrator.py`

```python
class PipelineOrchestrator:
    def __init__(self, pipeline_id: str, topic: str, prefetched_papers: Optional[List[Paper]] = None):
        ...
        if prefetched_papers:
            self.papers = prefetched_papers
```

Modify scout step to skip fetch when prefetched exists:

```python
async def _run_scout(self):
    self.status["scout"].status = "running"
    yield_event("scout", "running", "Fetching papers...")

    if self.papers:
        self.status["scout"].status = "completed"
        self.status["scout"].message = f"Using {len(self.papers)} prefetched papers"
        yield_event("scout", "completed", self.status["scout"].message)
        return
    ...
```

- [ ] **Step 3: Wire it in `start_pipeline`**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/main.py` start handler body:

```python
orchestrator = PipelineOrchestrator(pipeline_id, input_data.topic, prefetched_papers=input_data.papers)
orchestrators[pipeline_id] = orchestrator
```

---

## Task 4: Gemini LLM Client (JSON Output)

**Goal:** Single reusable function for calling Gemini and parsing strict JSON outputs.

- [ ] **Step 1: Create Gemini client**

Create: `d:/PROJECT/trae_project/repo_gh/backend/app/llm/gemini.py`

```python
import json
import os
from typing import Any, Dict, Optional
import httpx

GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

class GeminiError(RuntimeError):
    pass

async def gemini_json(prompt: str, *, schema_hint: str, temperature: float = 0.4, timeout: float = 45) -> Dict[str, Any]:
    key = os.getenv(GEMINI_API_KEY_ENV)
    if not key:
        raise GeminiError("GEMINI_API_KEY is not configured")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt + \"\\n\\nReturn ONLY JSON. Schema: \" + schema_hint}]}],
        "generationConfig": {"temperature": temperature},
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, params={"key": key}, json=body, timeout=timeout)
    if resp.status_code != 200:
        raise GeminiError(f"Gemini HTTP {resp.status_code}: {resp.text[:300]}")

    data = resp.json()
    text = (((data.get("candidates") or [{}])[0].get("content") or {}).get("parts") or [{}])[0].get("text") or ""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1].strip()
    try:
        return json.loads(text)
    except Exception:
        raise GeminiError("Gemini returned non-JSON output")
```

---

## Task 5: Replace Agent Steps with LLM-Driven Outputs (with fallback)

**Goal:** Keep current models (`Paper/Cluster/Idea`) but source them from LLM.

### 5.1 Gap Analyst (LLM clustering)

- [ ] **Step 1: Modify `gap_analyst_agent` to LLM**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/gap_analyst.py` to:

```python
from typing import List
from ..models import Paper, Cluster
from ..llm.gemini import gemini_json, GeminiError

async def gap_analyst_agent(papers: List[Paper], topic: str) -> List[Cluster]:
    schema = '{"clusters":[{"name":"string","papers":["paper_id"],"status":"saturated|white_space","paper_count":1}]}'
    prompt = (
        "You are a research gap analyst. Cluster the papers into 6-12 clusters.\n"
        "Return white_space for underexplored clusters.\n"
        f"Topic: {topic}\n"
        "Papers (id,title,year):\n" + "\n".join([f"- {p.id} | {p.year} | {p.title}" for p in papers[:80]])
    )
    try:
        out = await gemini_json(prompt, schema_hint=schema, temperature=0.2)
        clusters = out.get("clusters") or []
        return [Cluster(**c) for c in clusters]
    except (GeminiError, Exception):
        return heuristic_gap_analyst(papers)
```

Where `heuristic_gap_analyst` is the previous implementation preserved in the same file.

### 5.2 Innovator (LLM idea generation)

- [ ] **Step 2: Modify `innovator_agent` to LLM**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/innovator.py`

```python
from typing import List
from ..models import Paper, Cluster, Idea
from ..llm.gemini import gemini_json, GeminiError

async def innovator_agent(clusters: List[Cluster], papers: List[Paper], topic: str) -> List[Idea]:
    schema = '{"ideas":[{"id":"string","title":"string","description":"string","novelty_score":0,"novelty_score_range":"string","feasibility_score":0,"feasibility_score_range":"string","confidence_level":"low|medium|high","coherence_score":0,"citations":["url"],"validation_plan":["step"],"is_human_adjusted":false,"human_novelty_override":null,"human_feasibility_override":null}]}'
    prompt = (
        "Generate 8-12 ranked research ideas grounded in the provided papers.\n"
        "Citations must be paper URLs.\n"
        f"Topic: {topic}\n"
        "Clusters:\n" + "\n".join([f"- {c.name} ({c.status}) papers={len(c.papers)}" for c in clusters[:20]]) + "\n"
        "Papers:\n" + "\n".join([f"- {p.id} | {p.year} | {p.title} | {p.url}" for p in papers[:80]])
    )
    try:
        out = await gemini_json(prompt, schema_hint=schema, temperature=0.6)
        ideas = out.get("ideas") or []
        return [Idea(**i) for i in ideas][:10]
    except (GeminiError, Exception):
        return heuristic_innovator(clusters, papers, topic)
```

Where `heuristic_innovator` is the previous implementation preserved in the same file.

### 5.3 Critic + Coherence Validator (LLM refine)

- [ ] **Step 3: Modify `critic_agent` to LLM score/refine**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/critic.py` to an async function that returns updated ideas via JSON; fallback to old function.

- [ ] **Step 4: Modify `coherence_validator_agent` to LLM validate**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/agents/coherence_validator.py` similarly.

### 5.4 Orchestrator awaits async agent calls

- [ ] **Step 5: Update orchestrator to await new async functions**

Modify: `d:/PROJECT/trae_project/repo_gh/backend/app/orchestrator.py`

Key changes:

```python
self.clusters = await gap_analyst_agent(self.papers, self.topic)
self.ideas = await innovator_agent(self.clusters, self.papers, self.topic)
self.ideas = await critic_agent(self.ideas, self.topic)
self.ideas = await coherence_validator_agent(self.ideas, self.papers, self.topic)
```

---

## Task 6: Frontend — Show Real Papers Immediately

**Goal:** Before pipeline finishes, user already sees real papers.

- [ ] **Step 1: Add API call**

Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/lib/api.ts`

Add:

```ts
export async function searchPapers(topic: string, limit = 50): Promise<{ papers: Paper[] }> {
  const base = getApiUrl();
  return fetchJson(`${base}/api/papers/search?topic=${encodeURIComponent(topic)}&limit=${limit}`);
}
```

- [ ] **Step 2: Add `PapersPreview` component**

Create: `d:/PROJECT/trae_project/repo_gh/frontend/src/components/PapersPreview.tsx`

Renders a collapsible list:

```tsx
export function PapersPreview(props: { papers: Paper[] }) { ... }
```

- [ ] **Step 3: Wire to `usePipeline`**

Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/hooks/usePipeline.ts`

Add state:
- `papersPreview: Paper[]`
- `setPapersPreview(...)`

Update `run(topic)` flow:
1) `searchPapers(topic, 50)` → set `papersPreview`
2) call `startPipeline` with `{ topic, papers: papersPreview }` (so backend uses same set)
3) open stream as before

- [ ] **Step 4: Display in running state + result state**

Modify: `d:/PROJECT/trae_project/repo_gh/frontend/src/App.tsx`

In running section, render:
- `<PapersPreview papers={pipeline.papersPreview} />` above skeleton

In result section, optionally render papers preview in a collapsible card.

---

## Task 7: Blackbox Validation

**Goal:** Confirm end-to-end works without guessing.

- [ ] **Step 1: Extend blackbox to test paper search**

Modify: `d:/PROJECT/trae_project/repo_gh/blackbox_test.py`

Add step:
- GET `/api/papers/search?topic=...&limit=10` and assert `len(papers) > 0`.

- [ ] **Step 2: Run blackbox**

```powershell
cd D:\PROJECT\trae_project\repo_gh
python blackbox_test.py
```

Expected: PASS all sections, including papers search.

- [ ] **Step 3: Manual UI**

1) Start backend on 8000
2) Start frontend
3) Run topic → papers list appears quickly → pipeline completes → ideas render

---

## Self-Review Checklist

- Ensure new endpoint does not break existing `/api/pipeline/start` request `{topic}`.
- Ensure LLM failures fall back to heuristic agents (demo still works).
- Ensure frontend still works with `VITE_USE_MOCK=false`.
- Ensure no secrets are committed; `.env` stays local.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-30-real-papers-llm-pipeline.md`.

Two execution options:

1) **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks  
2) **Inline Execution** — execute tasks in this session with checkpoints

Which approach?

