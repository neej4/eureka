# Knowledge Map Physics Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tuning d3-force di Knowledge Map agar node lebih renggang (tidak numpuk), tetap terhubung via link, dan stabil (minim jitter).

**Architecture:** Ubah konfigurasi `forceSimulation` di `KnowledgeMapObsidian.tsx` (charge, collide, link distance/strength, decay). Tidak mengubah struktur graph maupun renderer.

**Tech Stack:** React + TypeScript + d3-force + canvas rendering.

---

## File Structure

**Modify**
- `frontend/src/components/KnowledgeMapObsidian.tsx` — tweak physics parameters.

---

### Task 1: Tune “real physics” parameters

**Files:**
- Modify: `frontend/src/components/KnowledgeMapObsidian.tsx`

- [ ] **Step 1: Update charge / collide / link parameters**

Target edit berada di blok `useEffect(() => { ... forceSimulation(nodes) ... })`.

Ubah parameter menjadi lebih agresif:

- Charge: `forceManyBody().strength(-520)` (lebih kuat dari -240)
- Link:
  - `distance`: cluster-link `~170`, paper-paper `~130` (naik dari 92/70)
  - `strength`: `0.55` (turun dari 0.9 agar tidak menggumpal)
- Collide: `forceCollide().radius((d) => d.r + 18).strength(1.0)` (padding naik)
- Stabilitas:
  - set `velocityDecay(0.35)`
  - set `alpha(1.0)` dan `alphaDecay(0.045)` (lebih lama sedikit sampai settle)

Contoh patch (snippet):

```ts
const sim = forceSimulation(nodes)
  .force("charge", forceManyBody().strength(-520))
  .force("center", forceCenter(0, 0))
  .force(
    "link",
    forceLink<GraphNode, GraphLink>(links)
      .id((d) => d.id)
      .distance((l) => {
        const s = typeof l.source === "string" ? null : (l.source as GraphNode);
        const t = typeof l.target === "string" ? null : (l.target as GraphNode);
        if (s?.kind === "cluster" || t?.kind === "cluster") return 170;
        return 130;
      })
      .strength(0.55),
  )
  .force("collide", forceCollide<GraphNode>().radius((d) => d.r + 18).strength(1.0))
  .velocityDecay(0.35)
  .alpha(1.0)
  .alphaDecay(0.045);
```

- [ ] **Step 2: Verify build**

Run:
```bash
cd d:/PROJECT/trae_project/repo_gh/frontend
npm run build
```

Expected: build sukses.

- [ ] **Step 3: Quick manual smoke**

Checklist:
- Map tidak “gumpal”, node lebih renggang.
- Zoom/pan/drag masih responsif.
- Setelah beberapa detik, node relatif stabil.

---

## Self-Review (Spec coverage)

- “Lebih renggang, tidak numpuk”: charge + collide + link distance ditingkatkan.
- “Link tetap terlihat”: tidak ada perubahan render link (hanya param).
- “Stabil”: velocityDecay + alphaDecay dituning.

