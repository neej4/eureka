import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationLinkDatum, type SimulationNodeDatum } from "d3-force";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Cluster, Paper, PipelineResult } from "../../../shared/types";

type NodeKind = "cluster" | "paper";

type GraphNode = SimulationNodeDatum & {
  id: string;
  kind: NodeKind;
  label: string;
  status?: Cluster["status"];
  r: number;
  rawId: string;
};

type GraphLink = SimulationLinkDatum<GraphNode> & { id: string; rawCluster: string; rawPaper: string };

type Viewport = { x: number; y: number; k: number };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function buildGraph(result: PipelineResult) {
  const papersById = new Map<string, Paper>();
  for (const p of result.papers) papersById.set(p.id, p);

  const clusterNodes: GraphNode[] = result.clusters.map((c) => ({
    id: `cluster:${c.name}`,
    rawId: c.name,
    kind: "cluster",
    label: c.name,
    status: c.status,
    r: c.status === "white_space" ? 16 : 12,
  }));

  const paperIds = new Set<string>();
  for (const c of result.clusters) for (const pid of c.papers) paperIds.add(pid);

  const paperNodes: GraphNode[] = [...paperIds].map((pid) => {
    const p = papersById.get(pid);
    return {
      id: `paper:${pid}`,
      rawId: pid,
      kind: "paper",
      label: p?.title ?? pid,
      r: 6,
    };
  });

  const nodes = [...clusterNodes, ...paperNodes];
  const links: GraphLink[] = [];

  for (const c of result.clusters) {
    for (const pid of c.papers) {
      links.push({
        id: `cluster:${c.name}->paper:${pid}`,
        source: `cluster:${c.name}`,
        target: `paper:${pid}`,
        rawCluster: c.name,
        rawPaper: pid,
      });
    }
  }

  return { nodes, links };
}

function screenToWorld(p: { x: number; y: number }, vp: Viewport) {
  return { x: (p.x - vp.x) / vp.k, y: (p.y - vp.y) / vp.k };
}

function hitTest(nodes: GraphNode[], world: { x: number; y: number }) {
  let best: { node: GraphNode; d2: number } | null = null;
  for (const n of nodes) {
    const dx = (n.x ?? 0) - world.x;
    const dy = (n.y ?? 0) - world.y;
    const d2 = dx * dx + dy * dy;
    const r = (n.r + 6) * (n.r + 6);
    if (d2 <= r && (!best || d2 < best.d2)) best = { node: n, d2 };
  }
  return best?.node ?? null;
}

export function KnowledgeMapObsidian(props: { result: PipelineResult }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null);
  const rafRef = useRef<number | null>(null);

  const [size, setSize] = useState<{ w: number; h: number }>({ w: 900, h: 560 });
  const [vp, setVp] = useState<Viewport>({ x: 0, y: 0, k: 1 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const graph = useMemo(() => buildGraph(props.result), [props.result]);
  const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  const neighborIds = useMemo(() => {
    if (!selectedCluster) return null;
    const set = new Set<string>();
    const clusterId = `cluster:${selectedCluster}`;
    set.add(clusterId);
    for (const l of graph.links) {
      if (String(l.source) === clusterId) set.add(String(l.target));
    }
    return set;
  }, [graph.links, selectedCluster]);

  const vpRef = useRef(vp);
  const sizeRef = useRef(size);
  const hoveredIdRef = useRef(hoveredId);
  const neighborIdsRef = useRef(neighborIds);
  const graphRef = useRef(graph);
  const nodeByIdRef = useRef(nodeById);

  useEffect(() => {
    vpRef.current = vp;
  }, [vp]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  useEffect(() => {
    neighborIdsRef.current = neighborIds;
  }, [neighborIds]);

  useEffect(() => {
    graphRef.current = graph;
    nodeByIdRef.current = nodeById;
  }, [graph, nodeById]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vp2 = vpRef.current;
    const size2 = sizeRef.current;
    const hoveredId2 = hoveredIdRef.current;
    const neighborIds2 = neighborIdsRef.current;
    const graph2 = graphRef.current;
    const nodeById2 = nodeByIdRef.current;

    const dpr = window.devicePixelRatio || 1;
    const w = size2.w;
    const h = size2.h;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(vp2.x, vp2.y);
    ctx.scale(vp2.k, vp2.k);

    const gridStep = 80;
    const worldLeft = (-vp2.x / vp2.k) - 100;
    const worldTop = (-vp2.y / vp2.k) - 100;
    const worldRight = worldLeft + w / vp2.k + 200;
    const worldBottom = worldTop + h / vp2.k + 200;

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border") || "#3b3b3b";
    ctx.lineWidth = 1 / vp2.k;
    for (let x = Math.floor(worldLeft / gridStep) * gridStep; x < worldRight; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, worldTop);
      ctx.lineTo(x, worldBottom);
      ctx.stroke();
    }
    for (let y = Math.floor(worldTop / gridStep) * gridStep; y < worldBottom; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(worldLeft, y);
      ctx.lineTo(worldRight, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const border = getComputedStyle(document.documentElement).getPropertyValue("--border") || "#3b3b3b";
    const hover = getComputedStyle(document.documentElement).getPropertyValue("--hover") || "#333333";
    const active = getComputedStyle(document.documentElement).getPropertyValue("--active") || "#ffffff";
    const text = getComputedStyle(document.documentElement).getPropertyValue("--text") || "#d4d4d4";

    for (const l of graph2.links) {
      const s = typeof l.source === "string" ? nodeById2.get(l.source) : (l.source as GraphNode);
      const t = typeof l.target === "string" ? nodeById2.get(l.target) : (l.target as GraphNode);
      if (!s || !t) continue;

      const dim = neighborIds2 ? !neighborIds2.has(s.id) && !neighborIds2.has(t.id) : false;
      ctx.strokeStyle = border;
      ctx.globalAlpha = dim ? 0.15 : 0.55;
      ctx.lineWidth = 1.2 / vp2.k;
      ctx.beginPath();
      ctx.moveTo(s.x ?? 0, s.y ?? 0);
      ctx.lineTo(t.x ?? 0, t.y ?? 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const n of graph2.nodes) {
      const x = n.x ?? 0;
      const y = n.y ?? 0;

      const isHovered = hoveredId2 === n.id;
      const isFocus = neighborIds2 ? neighborIds2.has(n.id) : true;
      const dim = neighborIds2 ? !isFocus : false;

      if (n.kind === "cluster" && n.status === "white_space") {
        ctx.beginPath();
        ctx.fillStyle = active;
        ctx.globalAlpha = dim ? 0.04 : 0.08;
        ctx.arc(x, y, n.r + 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      if (n.kind === "paper") ctx.fillStyle = border;
      else if (n.status === "white_space") ctx.fillStyle = active;
      else ctx.fillStyle = hover;
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.arc(x, y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isHovered) {
        ctx.beginPath();
        ctx.strokeStyle = active;
        ctx.lineWidth = 2 / vp2.k;
        ctx.arc(x, y, n.r + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (n.kind === "cluster" && vp2.k >= 0.8 && !dim) {
        ctx.fillStyle = text;
        ctx.globalAlpha = 0.9;
        ctx.font = `${12 / vp2.k}px Inter, ui-sans-serif, system-ui`;
        const label = n.label.length > 24 ? `${n.label.slice(0, 24)}…` : n.label;
        ctx.fillText(label, x + (n.r + 8), y + 4);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }, []);

  const requestDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setSize({ w: Math.max(320, Math.floor(r.width)), h: Math.max(320, Math.floor(r.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    setVp({ x: cx, y: cy, k: 1 });
  }, [size.h, size.w]);

  useEffect(() => {
    const nodes = graph.nodes.map((n) => ({ ...n }));
    const links = graph.links.map((l) => ({ ...l }));

    const sim = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-560))
      .force("center", forceCenter(0, 0))
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((l) => {
            const s = typeof l.source === "string" ? null : (l.source as GraphNode);
            const t = typeof l.target === "string" ? null : (l.target as GraphNode);
            if (s?.kind === "cluster" || t?.kind === "cluster") return 150;
            return 120;
          })
          .strength(0.35),
      )
      .force("collide", forceCollide<GraphNode>().radius((d) => d.r + 18).strength(0.95))
      .alpha(0.9)
      .alphaDecay(0.06)
      .velocityDecay(0.58);

    sim.on("tick", requestDraw);
    simRef.current = sim;
    requestDraw();

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [graph.links, graph.nodes, requestDraw]);

  useEffect(() => {
    requestDraw();
  }, [neighborIds, hoveredId, requestDraw, vp, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isPanning = false;
    let dragging: GraphNode | null = null;
    let dragMoved = false;
    let lastClient: { x: number; y: number } | null = null;

    const getClient = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = getClient(e);
      lastClient = p;
      dragMoved = false;

      const world = screenToWorld(p, vpRef.current);
      const sim = simRef.current;
      const nodes = sim ? (sim.nodes() as GraphNode[]) : [];
      const hit = hitTest(nodes, world);

      if (hit) {
        dragging = hit;
        dragging.fx = dragging.x;
        dragging.fy = dragging.y;
        sim?.alphaTarget(0.25).restart();
      } else {
        isPanning = true;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = getClient(e);
      const prev = lastClient;
      if (prev) {
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true;
      }
      lastClient = p;

      if (dragging) {
        const world = screenToWorld(p, vpRef.current);
        dragging.fx = world.x;
        dragging.fy = world.y;
        requestDraw();
        return;
      }

      if (isPanning) {
        const prev2 = prev ?? p;
        const dx = p.x - prev2.x;
        const dy = p.y - prev2.y;
        setVp((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
        return;
      }

      const world = screenToWorld(p, vpRef.current);
      const sim = simRef.current;
      const nodes = sim ? (sim.nodes() as GraphNode[]) : [];
      const hit = hitTest(nodes, world);
      setHoveredId(hit?.id ?? null);
      if (hit) setTooltip({ x: p.x, y: p.y, text: hit.label });
      else setTooltip(null);
    };

    const onPointerUp = (e: PointerEvent) => {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
      }
      const p = getClient(e);

      if (dragging) {
        const sim = simRef.current;
        dragging.fx = null;
        dragging.fy = null;
        sim?.alphaTarget(0);
      }

      if (!dragMoved && dragging?.kind === "cluster") {
        setSelectedCluster((prev) => (prev === dragging!.rawId ? null : dragging!.rawId));
      }

      dragging = null;
      isPanning = false;
      lastClient = p;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      const curVp = vpRef.current;
      const nextK = clamp(curVp.k * (e.deltaY < 0 ? 1.07 : 0.93), 0.25, 3.2);
      const worldBefore = screenToWorld(p, curVp);
      const nextVp: Viewport = { ...curVp, k: nextK };
      const screenAfter = { x: worldBefore.x * nextVp.k + nextVp.x, y: worldBefore.y * nextVp.k + nextVp.y };
      const dx = p.x - screenAfter.x;
      const dy = p.y - screenAfter.y;
      setVp({ x: nextVp.x + dx, y: nextVp.y + dy, k: nextVp.k });
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [requestDraw]);

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--active)]">Knowledge Map</div>
        <div className="text-xs text-[var(--muted)]">
          drag nodes • scroll to zoom • drag background to pan
        </div>
      </div>
      <div ref={containerRef} className="relative h-[560px] overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--bg)]">
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 max-w-[360px] rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--text)] shadow-[var(--shadow)]"
            style={{ left: clamp(tooltip.x + 12, 8, size.w - 380), top: clamp(tooltip.y + 12, 8, size.h - 80) }}
          >
            {tooltip.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
