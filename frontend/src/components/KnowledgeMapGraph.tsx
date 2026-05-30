import { useEffect, useMemo, useState } from "react";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationLinkDatum } from "d3-force";
import type { Cluster, Paper, PipelineResult } from "../../../shared/types";

type NodeKind = "cluster" | "paper";

type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  status?: Cluster["status"];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  r: number;
};

type GraphLink = SimulationLinkDatum<GraphNode> & { id: string };

function buildGraph(result: PipelineResult) {
  const clusters = result.clusters;
  const papersById = new Map<string, Paper>();
  for (const p of result.papers) papersById.set(p.id, p);

  const clusterNodes: GraphNode[] = clusters.map((c) => ({
    id: `cluster:${c.name}`,
    kind: "cluster",
    label: c.name,
    status: c.status,
    r: c.status === "white_space" ? 18 : 14,
  }));

  const paperIds = new Set<string>();
  for (const c of clusters) for (const pid of c.papers) paperIds.add(pid);

  const paperNodes: GraphNode[] = [...paperIds].map((pid) => {
    const p = papersById.get(pid);
    return {
      id: `paper:${pid}`,
      kind: "paper",
      label: p?.title ?? pid,
      r: 7,
    };
  });

  const nodes = [...clusterNodes, ...paperNodes];
  const links: GraphLink[] = [];

  for (const c of clusters) {
    const source = `cluster:${c.name}`;
    for (const pid of c.papers) {
      links.push({ id: `${source}->paper:${pid}`, source, target: `paper:${pid}` });
    }
  }

  return { nodes, links };
}

export function KnowledgeMapGraph(props: { result: PipelineResult }) {
  const [layout, setLayout] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);

  const size = useMemo(() => ({ w: 920, h: 560 }), []);

  useEffect(() => {
    const { nodes, links } = buildGraph(props.result);

    const sim = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-160))
      .force("center", forceCenter(size.w / 2, size.h / 2))
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((d: GraphNode) => d.id)
          .distance((l: GraphLink) => {
            const src = l.source as GraphNode;
            const dst = l.target as GraphNode;
            if (src.kind === "cluster" || dst.kind === "cluster") return 90;
            return 60;
          })
          .strength(0.8),
      )
      .force("collide", forceCollide<GraphNode>().radius((d: GraphNode) => d.r + 6).strength(0.8));

    sim.stop();
    for (let i = 0; i < 220; i += 1) sim.tick();

    setLayout({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    });

    return () => {
      sim.stop();
    };
  }, [props.result, size.h, size.w]);

  if (!layout) {
    return (
      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)] shadow-[var(--shadow)]">
        Building knowledge map...
      </div>
    );
  }

  const clusterNodes = layout.nodes.filter((n) => n.kind === "cluster");

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--active)]">Knowledge Map</div>
        <div className="text-xs text-[var(--muted)]">{clusterNodes.length} clusters</div>
      </div>
      <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--bg)]">
        <svg width="100%" viewBox={`0 0 ${size.w} ${size.h}`} className="block">
          <g opacity={0.6}>
            {layout.links.map((l) => {
              const s = l.source as GraphNode;
              const t = l.target as GraphNode;
              return (
                <line
                  key={l.id}
                  x1={s.x ?? 0}
                  y1={s.y ?? 0}
                  x2={t.x ?? 0}
                  y2={t.y ?? 0}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {layout.nodes.map((n) => {
            const fill =
              n.kind === "paper"
                ? "var(--border)"
                : n.status === "white_space"
                  ? "var(--active)"
                  : "var(--hover)";
            const stroke = n.kind === "paper" ? "var(--border)" : "var(--border)";

            return (
              <g key={n.id} transform={`translate(${n.x ?? 0},${n.y ?? 0})`}>
                {n.kind === "cluster" && n.status === "white_space" ? (
                  <circle r={n.r + 10} fill="var(--active)" opacity={0.08} />
                ) : null}
                <circle r={n.r} fill={fill} stroke={stroke} strokeWidth={1} />
                <title>{n.label}</title>
              </g>
            );
          })}

          {layout.nodes
            .filter((n) => n.kind === "cluster")
            .map((n) => (
              <text
                key={`label:${n.id}`}
                x={(n.x ?? 0) + (n.r + 6)}
                y={(n.y ?? 0) + 4}
                fontSize={11}
                fill="var(--text)"
                opacity={0.9}
              >
                {n.label.length > 22 ? `${n.label.slice(0, 22)}…` : n.label}
              </text>
            ))}
        </svg>
      </div>
    </div>
  );
}
