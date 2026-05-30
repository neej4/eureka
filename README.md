# Eureka — AI Research Ideation Platform

**Turn a research topic into breakthrough ideas in minutes — not weeks.**

Eureka is an AI-powered research companion that analyzes hundreds of scientific papers, maps knowledge gaps, synthesizes novel ideas, and evaluates them for novelty and feasibility — all in one flow. Built for researchers, students, and innovators who need to move fast without sacrificing depth.

---

## What Eureka Does

You start with a single topic. Eureka's multi-agent pipeline handles the rest:

1. **Scout** — Fetches and reads the latest papers from arXiv on your topic
2. **Gap Analyst** — Identifies underexplored areas and white spaces in the literature
3. **Innovator** — Synthesizes breakthrough ideas at the intersection of known research
4. **Critic** — Evaluates each idea for novelty, feasibility, and coherence
5. **Coherence Validator** — Ensures the full idea set is consistent and well-structured

The result: a ranked list of ideas with scores, citations, validation plans, and a visual knowledge map — ready to export and continue in your workflow.

---

## Key Features

- **Real-time reasoning trace** — Watch each agent think and work live
- **Ranked idea cards** — Sorted by novelty + feasibility, click to deep-dive
- **Knowledge map** — Interactive graph of clusters and papers, drag/zoom/filter
- **Live ROI estimate** — See how much time Eureka saves vs. manual research
- **Export to TRAE** — One-click copy idea as prompt, or download JSON — continue your work in AI agents
- **Profile settings** — Set your mode (academic/product/develop/review) and context

---

## Quick Start

### Run locally

```powershell
cd D:\PROJECT\trae_project\repo_gh
.\run-dev.ps1
```

Then open **http://localhost:5174**

> Backend runs on port 8000, frontend on 5174.
> For alternative ports: `.\run-dev.ps1 -BackendPort 8000 -FrontendPort 5173`

### Using Eureka

1. Enter a research topic (or pick an example chip on the landing page)
2. Click **Run** — watch the Reasoning Engine work in real time
3. Explore **Ideas** — click any card to see full detail and scores
4. Switch to **Knowledge Map** — pan/zoom the interactive graph
5. Export ideas to **TRAE** to continue building

### Mock vs Real Backend

- **Mock mode (default)**: Works immediately, no setup needed. Uses sample data.
- **Real mode**: Set `VITE_USE_MOCK=false` in `frontend/.env` then restart. Requires backend running on port 8000.

---

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Graph**: D3-force for interactive knowledge maps
- **SSE**: Real-time streaming from backend agents

---

## Project Structure

```
repo_gh/
├── backend/        FastAPI backend (O1)
├── frontend/      React frontend (O2)
├── shared/        Shared TypeScript types
├── docs/          Specs and plans
└── run-dev.ps1    One-command launcher
```

---

## Contributing

This project is developed as a collaboration between O1 (backend) and O2 (frontend). See `docs/` for specs and plans.
