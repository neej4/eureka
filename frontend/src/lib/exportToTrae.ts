import type { Idea, Paper, PipelineResult } from "./types";

export type TraeIdeaExport = {
  topic: string;
  pipeline_id: string;
  idea: Pick<
    Idea,
    | "id"
    | "title"
    | "description"
    | "novelty_score"
    | "novelty_score_range"
    | "feasibility_score"
    | "feasibility_score_range"
    | "confidence_level"
    | "coherence_score"
    | "citations"
    | "validation_plan"
    | "is_human_adjusted"
    | "human_novelty_override"
    | "human_feasibility_override"
  >;
  context?: { papers?: Array<Pick<Paper, "title" | "url" | "year">> };
};

export function buildTraePrompt(payload: TraeIdeaExport) {
  const papers = payload.context?.papers ?? [];
  const paperLines =
    papers.length === 0
      ? ""
      : `\n\n## Related papers\n${papers
          .map((p) => `- ${p.title} (${p.year}) — ${p.url}`)
          .join("\n")}`;

  return [
    `# EUREKA → TRAE Export`,
    ``,
    `Topic: ${payload.topic}`,
    `Pipeline: ${payload.pipeline_id}`,
    ``,
    `## Idea`,
    `Title: ${payload.idea.title}`,
    ``,
    payload.idea.description,
    ``,
    `Scores: novelty ${payload.idea.novelty_score} (${payload.idea.novelty_score_range}) • feasibility ${payload.idea.feasibility_score} (${payload.idea.feasibility_score_range}) • coherence ${payload.idea.coherence_score} • confidence ${payload.idea.confidence_level}`,
    payload.idea.is_human_adjusted
      ? `Overrides: novelty=${payload.idea.human_novelty_override ?? "-"} feasibility=${payload.idea.human_feasibility_override ?? "-"}`
      : `Overrides: none`,
    ``,
    `## Ask`,
    `- Buat 3 opsi eksperimen (baseline + ablation) untuk menguji ide ini`,
    `- Buat rencana implementasi prototype (MVP)`,
    `- Risiko & failure modes + mitigasi`,
    paperLines,
  ].join("\n");
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildIdeaExport(result: PipelineResult, idea: Idea): TraeIdeaExport {
  const topPapers = (result.papers ?? []).slice(0, 3).map((p) => ({ title: p.title, url: p.url, year: p.year }));
  return {
    topic: result.topic,
    pipeline_id: result.pipeline_id,
    idea: {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      novelty_score: idea.novelty_score,
      novelty_score_range: idea.novelty_score_range,
      feasibility_score: idea.feasibility_score,
      feasibility_score_range: idea.feasibility_score_range,
      confidence_level: idea.confidence_level,
      coherence_score: idea.coherence_score,
      citations: idea.citations,
      validation_plan: idea.validation_plan,
      is_human_adjusted: idea.is_human_adjusted,
      human_novelty_override: idea.human_novelty_override,
      human_feasibility_override: idea.human_feasibility_override,
    },
    context: topPapers.length ? { papers: topPapers } : undefined,
  };
}
