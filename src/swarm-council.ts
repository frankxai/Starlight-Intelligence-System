/**
 * Investment-intelligence council — the Sonnet+Opus swarm.
 *
 * Compiles `verticals/investment-intelligence/engine/agents/catalog.json` into
 * three ordered phases and runs them through the tested `runSwarm` pool, so the
 * per-agent `recommended_model` (Sonnet analysis/risk · Opus portfolio-manager ·
 * Haiku technical) is finally *consumed* at execution time rather than sitting
 * as spec.
 *
 * Layering (from the catalog `handoff_protocol`):
 *   phase 1 — analysis: 5 agents, BLIND-PARALLEL (no peer output in prompts)
 *   phase 2 — risk:     3 agents, each sees the phase-1 analysis (run parallel
 *                        within the phase — an intentional refinement over the
 *                        catalog's `step_2_sequential`, since each risk agent
 *                        only needs the *analysis* output, not the other risk
 *                        agents' output; documented so the divergence is explicit)
 *   phase 3 — synthesis: portfolio-manager (Opus), then chief-of-staff sees the
 *                        full debate + the PM verdict.
 *
 * The `researcher` (cross-cutting, tool-heavy) is excluded from v1 — it is a
 * lookup helper, not a debate seat.
 *
 * This module NEVER executes trades. Every prompt states the no-execution
 * boundary and carries the R5 non-advisory clause; execution stays behind the
 * local trade-gate MCP + a human approval token.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { SwarmOptions, SwarmSummary, SwarmTask } from "./swarm.js";
import { runSwarm } from "./swarm.js";

export const R5_CLAUSE =
  "This is system architecture, not financial / investment / tax advice. " +
  "Outputs frame decisions; jurisdiction-specific counsel signs off on instruments. " +
  "The practitioner accepts capital risk; the substrate accepts no claim.";

const NO_EXECUTION_LINE =
  "You have NO execution tools. Your tools_denied includes execution-platforms and " +
  "credential-stores. You produce analysis only; any resulting action is a pending " +
  "decision a human approves through the trade-gate MCP.";

export type CouncilLayer = "analysis" | "risk" | "synthesis" | "cross-cutting";

export interface CatalogAgent {
  id: string;
  layer: CouncilLayer;
  domain: string;
  persona: string;
  system_prompt_summary: string;
  output_schema: string[];
  tools_denied?: string[];
  recommended_model?: string;
}

export interface IISCatalog {
  team: string;
  agents: CatalogAgent[];
  handoff_protocol?: Record<string, unknown>;
}

export interface CouncilPlan {
  analysis: SwarmTask[];
  risk: SwarmTask[];
  synthesis: SwarmTask[];
}

export interface CouncilResult {
  context: string;
  analysis: SwarmSummary;
  risk: SwarmSummary;
  synthesis: SwarmSummary;
}

export interface BuildCouncilOptions {
  /** The operator's session context (regime, portfolio ref, question). */
  context: string;
  /** Restrict the council to these agent ids (enables cheap single-agent demos). */
  only?: string[];
}

/**
 * Resolve the catalog path from the package root. In `dist/` this file sits at
 * `dist/swarm-council.js`, so the vertical is two levels up; in `src/` it is one
 * level up. We walk both candidates.
 */
export function defaultCatalogPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const rel = "verticals/investment-intelligence/engine/agents/catalog.json";
  for (const up of ["..", "../.."]) {
    const candidate = resolve(here, up, rel);
    try {
      readFileSync(candidate, "utf-8");
      return candidate;
    } catch {
      // try next
    }
  }
  // Fall back to cwd-relative (tests pass an explicit path anyway).
  return join(process.cwd(), rel);
}

export function loadIISCatalog(path: string = defaultCatalogPath()): IISCatalog {
  const raw = JSON.parse(readFileSync(path, "utf-8")) as IISCatalog;
  if (!Array.isArray(raw.agents) || raw.agents.length === 0) {
    throw new Error(`catalog at ${path} has no agents`);
  }
  return raw;
}

/** Compose one agent's prompt. `analysisContext` is present only for later phases. */
function buildPrompt(
  agent: CatalogAgent,
  context: string,
  analysisContext?: string,
): string {
  const outputContract =
    `Respond as strict JSON: { ` +
    agent.output_schema.map((k) => `"${k}": ...`).join(", ") +
    ` }.`;
  const parts = [
    `You are the "${agent.id}" agent (${agent.layer} layer). Domain: ${agent.domain}.`,
    agent.persona,
    `Task: ${agent.system_prompt_summary}`,
    `Operator context: ${context}`,
  ];
  if (analysisContext) {
    parts.push(`Analysis-layer findings so far:\n${analysisContext}`);
  }
  parts.push(outputContract, NO_EXECUTION_LINE, `[R5] ${R5_CLAUSE}`);
  return parts.join("\n\n");
}

function selectAgents(catalog: IISCatalog, only?: string[]): CatalogAgent[] {
  const roster = catalog.agents.filter((a) => a.layer !== "cross-cutting");
  if (!only || only.length === 0) return roster;
  const wanted = new Set(only);
  return roster.filter((a) => wanted.has(a.id));
}

/**
 * Compile the catalog into three ordered phases of SwarmTasks. Phase-2 and
 * phase-3 prompts are filled with a placeholder for analysis context; the real
 * analysis output is injected by `runCouncil` after phase 1 settles. (When the
 * plan is printed dry-run, the placeholder shows the layering intent.)
 */
export function buildCouncilPlan(
  catalog: IISCatalog,
  opts: BuildCouncilOptions,
): CouncilPlan {
  const agents = selectAgents(catalog, opts.only);
  const byLayer = (layer: CouncilLayer) => agents.filter((a) => a.layer === layer);

  const analysis: SwarmTask[] = byLayer("analysis").map((a) => ({
    id: a.id,
    model: a.recommended_model,
    prompt: buildPrompt(a, opts.context),
  }));

  // Risk + synthesis prompts get the analysis context injected at run time.
  const risk: SwarmTask[] = byLayer("risk").map((a) => ({
    id: a.id,
    model: a.recommended_model,
    prompt: buildPrompt(a, opts.context, "{{analysis}}"),
  }));

  const synthesis: SwarmTask[] = byLayer("synthesis").map((a) => ({
    id: a.id,
    model: a.recommended_model,
    prompt: buildPrompt(a, opts.context, "{{debate}}"),
  }));

  return { analysis, risk, synthesis };
}

function summariseResults(summary: SwarmSummary): string {
  return summary.results
    .map((r) => `### ${r.id} (${r.ok ? "ok" : "failed"})\n${r.output || r.error || "(no output)"}`)
    .join("\n\n");
}

function inject(tasks: SwarmTask[], token: string, value: string): SwarmTask[] {
  return tasks.map((t) => ({ ...t, prompt: t.prompt.replace(token, value) }));
}

/**
 * Run the three phases in order through `runSwarm`. Blind-parallel analysis
 * first; then risk agents get the analysis digest; then synthesis gets the full
 * debate (analysis + risk). Inherits `runSwarm`'s concurrency cap, per-task
 * timeout, and fail-safe (a failed agent becomes an `ok:false` result and does
 * not sink the phase).
 */
export async function runCouncil(
  plan: CouncilPlan,
  opts: SwarmOptions & { context?: string } = {},
): Promise<CouncilResult> {
  const analysis = await runSwarm(plan.analysis, opts);
  const analysisDigest = summariseResults(analysis);

  const risk = await runSwarm(inject(plan.risk, "{{analysis}}", analysisDigest), opts);
  const riskDigest = summariseResults(risk);

  const debate = `${analysisDigest}\n\n## Risk layer\n\n${riskDigest}`;
  const synthesis = await runSwarm(inject(plan.synthesis, "{{debate}}", debate), opts);

  return { context: opts.context ?? "", analysis, risk, synthesis };
}
