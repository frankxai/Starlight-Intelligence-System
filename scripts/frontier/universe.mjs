#!/usr/bin/env node
// Universe ranking: progressive discovery over GitHub metadata (no cloning).
// Stage 1 (broad index) is produced by scripts/frontier/universe_crawl.py.
// Stage 2 (this file) ranks by relevance to Starlight's capability layers,
// activity and licence, so only high-value candidates reach deep review.
//
//   node scripts/frontier/universe.mjs rank --in repos.jsonl --out context/frontier/universe [--top 500] [--today D]

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

export const CATEGORIES = {
  agent_orchestration: ["multi-agent", "agent framework", "orchestrat", "agentic", "ai-agents", "agents", "crew", "swarm", "autonomous agent", "agent-framework", "langgraph", "autogen"],
  coding_agents: ["coding agent", "coding-agent", "code agent", "claude-code", "codex", "software engineer", "swe-agent", "terminal agent", "ai coding", "pair programmer", "copilot"],
  mcp_tools: ["mcp", "model context protocol", "model-context-protocol", "mcp-server", "tool calling", "function calling", "a2a", "agent2agent"],
  memory_context: ["memory", "knowledge graph", "knowledge-graph", "rag", "retrieval", "vector", "embedding", "context engineering", "graphrag", "long-term"],
  model_routing_inference: ["inference", "serving", "llm gateway", "router", "routing", "quantiz", "vllm", "llama.cpp", "gguf", "local-llm", "openai-compatible", "kv cache", "speculative"],
  evals_observability: ["eval", "benchmark", "observability", "tracing", "llmops", "monitoring", "opentelemetry", "guardrail", "red team", "red-team"],
  durable_execution: ["workflow", "durable", "orchestration engine", "job queue", "temporal", "scheduler", "background jobs", "state machine"],
  sandbox_security: ["sandbox", "isolation", "firecracker", "microvm", "prompt injection", "prompt-injection", "permission", "secrets", "policy engine", "security"],
  browser_computer_use: ["browser automation", "browser-automation", "computer use", "computer-use", "playwright", "web agent", "browser agent", "headless"],
  generative_ui_design: ["generative ui", "generative-ui", "ai sdk", "ai-sdk", "chat ui", "design system", "shadcn", "canvas", "whiteboard", "visualization", "react flow", "diagram"],
  multimodal_creative: ["text-to-video", "video generation", "text-to-image", "diffusion", "stable-diffusion", "speech", "tts", "voice", "music generation", "audio", "image generation", "3d generation"],
  models_open_weights: ["open-weight", "open weights", "foundation model", "pretrain", "fine-tun", "lora", "llm training", "rlhf", "reasoning model"],
  knowledge_research: ["research agent", "deep research", "paper", "arxiv", "scientific", "literature"],
};
const AI_SIGNALS = ["llm", "ai", "gpt", "agent", "model", "openai", "anthropic", "claude", "gemini", "machine-learning", "deep-learning", "generative-ai", "neural", "transformer"];

const daysSince = (iso, today) => (iso ? Math.max(0, (Date.parse(`${today}T00:00:00Z`) - Date.parse(iso)) / 86_400_000) : 9999);

function haystack(repo) {
  return ` ${(repo.full_name ?? "").toLowerCase()} ${(repo.description ?? "").toLowerCase()} ${(repo.topics ?? []).join(" ").toLowerCase()} `;
}

export function categorize(repo) {
  const text = haystack(repo);
  return Object.entries(CATEGORIES)
    .filter(([, terms]) => terms.some((t) => text.includes(t)))
    .map(([name]) => name);
}

const CURATED = /(^|[^a-z])(awesome|best-practices?|cookbook|tutorials?|course|book|roadmap|interview|cheatsheet|resources|curated list|prompts? collection)([^a-z]|$)/;

/** Signals that stars are a poor proxy for engineering value. Flags inform review; they never prove anything. */
export function flagsFor(repo, { today }) {
  const flags = [];
  const text = haystack(repo);
  if (CURATED.test(text)) flags.push("curated_list");
  const ageDays = repo.created_at ? Math.max(1, daysSince(repo.created_at, today)) : null;
  if (ageDays !== null && ageDays <= 365 && (repo.stars ?? 0) / ageDays > 400) flags.push("star_velocity_anomaly");
  if (!repo.license || repo.license === "NOASSERTION") flags.push("no_license");
  return flags;
}

export function scoreRepo(repo, { today }) {
  if (repo.archived) return { score: 0, categories: [], flags: [], reason: "archived" };
  const text = haystack(repo);
  const categories = categorize(repo);
  const aiSignal = AI_SIGNALS.some((t) => new RegExp(`[^a-z]${t}[^a-z]`).test(text));
  if (!categories.length || !aiSignal) return { score: 0, categories, flags: [], reason: "not relevant to capability layers" };
  const flags = flagsFor(repo, { today });
  const age = daysSince(repo.pushed_at, today);
  const recency = age <= 30 ? 1 : age <= 90 ? 0.85 : age <= 180 ? 0.6 : age <= 365 ? 0.35 : 0.1;
  const licence = repo.license && repo.license !== "NOASSERTION" ? 1 : 0.8;
  const breadth = 1 + Math.min(categories.length - 1, 3) * 0.15;
  const trending = (repo.sources ?? []).some((s) => s.startsWith("trending:")) ? 1.25 : 1;
  // Curated lists are knowledge sources, not adoption candidates; anomalous star velocity caps the star prior.
  const kind = flags.includes("curated_list") ? 0.5 : 1;
  const stars = flags.includes("star_velocity_anomaly") ? Math.min(repo.stars ?? 0, 20000) : repo.stars ?? 0;
  const score = Math.log10(stars + 10) * recency * licence * breadth * trending * kind;
  return { score: Number(score.toFixed(4)), categories, flags, reason: `stars=${repo.stars} pushed=${Math.round(age)}d licence=${repo.license ?? "none"}` };
}

export function rankRepos(repos, { today, top = 500 } = {}) {
  return repos
    .map((r) => ({ ...r, ...scoreRepo(r, { today }) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (b.stars ?? 0) - (a.stars ?? 0) || a.full_name.localeCompare(b.full_name))
    .slice(0, top);
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
  if (args[0] !== "rank") { console.error("usage: universe.mjs rank --in repos.jsonl --out <dir> [--top N] [--today D]"); process.exit(2); }
  const today = opt("today", new Date().toISOString().slice(0, 10));
  const top = Number(opt("top", "500"));
  const raw = (await readFile(resolve(opt("in")), "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const ranked = rankRepos(raw, { today, top });
  const relevant = raw.filter((r) => scoreRepo(r, { today }).score > 0);
  const perCategory = {};
  for (const r of relevant) for (const c of categorize(r)) perCategory[c] = (perCategory[c] ?? 0) + 1;
  const sources = {};
  for (const r of raw) for (const s of r.sources ?? []) sources[s.split(":")[0]] = (sources[s.split(":")[0]] ?? 0) + 1;
  const outDir = resolve(opt("out"));
  await mkdir(outDir, { recursive: true });
  const manifest = {
    generated_at: today,
    method: "GitHub search metadata only (no cloning): AI topic sweeps (stars>=300, pushed>=2026-04-01) plus a global stars-descending sweep, then relevance ranking by capability layer, recency, licence and stars. Stars are a weak prior, not a quality signal.",
    indexed_repositories: raw.length,
    relevant_repositories: relevant.length,
    ranked_published: ranked.length,
    discovery_sources: sources,
    relevant_per_category: perCategory,
    limits: "Unauthenticated GitHub search returns at most 1,000 results per query at 10 requests/minute; coverage is bounded by crawl time. Not a full top-100k census.",
  };
  await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const flagCounts = {};
  for (const r of relevant) for (const f of flagsFor(r, { today })) flagCounts[f] = (flagCounts[f] ?? 0) + 1;
  manifest.relevant_flags = flagCounts;
  await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const compact = ranked.map((r, i) => ({ rank: i + 1, full_name: r.full_name, score: r.score, stars: r.stars, license: r.license, created_at: r.created_at?.slice(0, 10) ?? null, pushed_at: r.pushed_at?.slice(0, 10) ?? null, categories: r.categories, flags: r.flags, description: r.description }));
  await writeFile(resolve(outDir, "top-candidates.json"), `${JSON.stringify(compact, null, 1)}\n`);
  console.log(`indexed=${raw.length} relevant=${relevant.length} published=${ranked.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
