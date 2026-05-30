# Hackathon-Ready UX & Reasoning Engine (Design)

**Goal:** Make the demo flow clean and convincing for pitching: “type topic → Run → watch reasoning → see results + map”, with fewer controls and higher-quality agent status messages.

**Non-goals:**
- No new backend endpoints required for this change.
- No change to SSE `type` values (`status|result|error`) or result delivery semantics (final-only).

## UX Changes (Frontend)

### 1) Header polish
- Reduce header logo size to 20–24px so wordmark stays primary.
- Keep layout: left brand, center tabs, right status/setup.

### 2) Tabs / Information Architecture
Tabs become:
- **Research** (main flow: stats → reasoning/live activity → results)
- **Knowledge Map**
- **Settings**

Notes:
- Existing features (recent/bookmarks/filters) are removed from primary navigation for the hackathon demo; they can return later behind an “Advanced” toggle if needed.

### 3) ControlsBar simplification (top action bar)
Keep only:
- Topic input
- Run (or Stop when running)
- Clear

Remove from the main bar:
- Date range inputs
- Language selector
- Max ideas input
- Profile button
- Refresh / Quick buttons

### 4) Left panel console → “Reasoning Engine”
- Rename section title from “Console” to **Reasoning Engine**.
- Display SSE status messages as “insights”:
  - `running` messages read like a concise analyst commentary.
  - `completed` messages summarize what changed (counts, outcomes).
  - `failed` messages remain clear and short.

## Backend Changes (SSE Status Messaging)

### 1) Update agent status `message` strings
In `backend/app/orchestrator.py`, update each `_run_*` step to yield more specific messages, without changing the payload schema.

Message style guidelines:
- 1 sentence, action-oriented, grounded (no fake numbers unless computed).
- Mention the topic or key artifacts (papers/clusters/ideas) when available.
- Avoid generic “running…” / “completed” only.

Examples:
- Scout (running): “Analyzing recent papers for topic: {topic} …”
- Scout (completed): “Collected {n} papers (source: cache|live).”
- Gap Analyst (running): “Clustering papers to surface underexplored intersections …”
- Gap Analyst (completed): “Built {k} clusters, found {w} white spaces.”
- Innovator (running): “Synthesizing cross-cluster ideas grounded in the clusters …”
- Critic (running): “Scoring ideas for novelty/feasibility and filtering weak candidates …”
- Validator (running): “Validating coherence and computing ROI summary …”

### 2) No contract breaking
- Keep SSE `data:` JSON format unchanged, only refine `message`.
- Keep endpoints unchanged.

## Acceptance Criteria

### Frontend
- Controls bar contains only Topic + Run/Stop + Clear.
- Tabs show only Research / Knowledge Map / Settings.
- Left panel shows “Reasoning Engine” label and displays incoming status messages clearly.
- Header logo is smaller and does not dominate the wordmark.

### Backend
- During an end-to-end run, SSE status messages are readable and “smart” (insightful) for each phase.
- No new endpoints required for this milestone.

