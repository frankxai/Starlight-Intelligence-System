/**
 * Starlight Intelligence System — "show it works" demo.
 *
 * A 30-second, dependency-light proof that the operational core is real, not
 * prose. It writes a handful of memory atoms in the canonical per-vault JSONL
 * format (the same shape `starlight init --vaults` and the MCP server read),
 * then runs the actual shipped engines against them:
 *
 *   1. Retrieval   — src/retrieval.ts   (SQLite FTS5 / bm25 over JSONL)
 *   2. Temporal    — src/temporal.ts    (90-day confidence half-life, staleness)
 *   3. Contradiction — src/contradiction.ts (cross-vault trigram conflict)
 *   4. Orchestration — src/orchestrator.ts (routing + pattern + synthesis)
 *
 * No network, no API key, no LLM call — deterministic so the output you see in
 * the README is the output you get. Runs against a temp dir and cleans up.
 *
 *   npm run demo
 *
 * Built on SIP — operational tier.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  StarlightIntelligence,
  RetrievalIndex,
  TemporalEngine,
  ContradictionDetector,
} from "../src/index.js";
import type { VaultType } from "../src/index.js";

// ── tiny formatting helpers ──────────────────────────────────
const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};
function banner(n: number, title: string): void {
  console.log("\n" + c.cyan(`━━ ${n}. ${title} ` + "━".repeat(Math.max(0, 52 - title.length))));
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

// ── canonical vault atom (the on-disk source-of-truth shape) ──
// The vault field is `insight`; confidence is a level ("high" | "medium" | "low").
// Matches public-vault/*.jsonl exactly — the same shape every engine reads.
interface Atom {
  id: string;
  vault: VaultType;
  insight: string;
  category: string;
  confidence: "high" | "medium" | "low";
  tags: string[];
  source: string;
  createdAt: string;
  lastConfirmed: string;
}
function atom(a: Partial<Atom> & Pick<Atom, "id" | "vault" | "insight">): Atom {
  const now = new Date().toISOString();
  return {
    category: "pattern", confidence: "high", tags: [], source: "demo",
    createdAt: now, lastConfirmed: now, ...a,
  } as Atom;
}

// A small, realistic memory: things a coding fleet would actually learn.
const ATOMS: Atom[] = [
  atom({ id: "t1", vault: "technical", insight: "SQLite FTS5 with bm25 beats embeddings for vault search ranking under 10k entries", category: "pattern", tags: ["retrieval", "sqlite"] }),
  atom({ id: "t2", vault: "technical", insight: "Always Read a file before editing it — catches stale state and avoids clobbering", category: "pattern", tags: ["workflow", "edit-safety"] }),
  atom({ id: "t3", vault: "technical", insight: "Run the test that reproduces a bug before writing the fix", category: "pattern", tags: ["testing"] }),
  atom({ id: "t4", vault: "technical", insight: "Always cache the rebuilt FTS5 index between sessions for faster cold-start retrieval", category: "pattern", tags: ["retrieval", "cache"] }),
  atom({ id: "s1", vault: "strategic", insight: "Open core plus a founding circle beats premium tiers at the substrate stage", category: "decision", confidence: "high", tags: ["business"] }),
  // Deliberately stale: confirmed 210 days ago → decays past the staleness threshold.
  atom({ id: "s2", vault: "strategic", insight: "Ship the closed beta on the private registry first, then open the protocol", category: "decision", confidence: "high", tags: ["roadmap"], createdAt: daysAgo(210), lastConfirmed: daysAgo(210) }),
  // Cross-vault contradiction with t4 (technical "always cache" vs strategic "never cache").
  atom({ id: "s3", vault: "strategic", insight: "Never cache the rebuilt FTS5 index between sessions for faster cold-start retrieval", category: "decision", confidence: "medium", tags: ["retrieval", "cache"] }),
  atom({ id: "c1", vault: "creative", insight: "Voice is direct, technical, warm. Show don't tell. No spiritual guru language", category: "preference", tags: ["voice"] }),
];

async function main(): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), "sis-demo-"));
  try {
  const dbPath = join(dir, "index.sqlite");

  console.log(c.bold("\n✦ Starlight Intelligence System — live engine demo"));
  console.log(c.dim(`  temp vault: ${dir}`));

  // Persist atoms as canonical per-vault JSONL (one file per vault).
  const byVault = new Map<string, Atom[]>();
  for (const a of ATOMS) {
    const list = byVault.get(a.vault) ?? [];
    list.push(a);
    byVault.set(a.vault, list);
  }
  for (const [vault, items] of byVault) {
    writeFileSync(join(dir, `${vault}.jsonl`), items.map((i) => JSON.stringify(i)).join("\n") + "\n");
  }
  console.log(c.dim(`  wrote ${ATOMS.length} atoms across ${byVault.size} vaults\n`));

  // ── 1. Retrieval ───────────────────────────────────────────
  banner(1, "Retrieval — FTS5 / bm25 over the JSONL vaults");
  const index = new RetrievalIndex(dbPath);
  const n = index.rebuildFromVaults(dir);
  console.log(c.dim(`  indexed ${n} entries`));
  const query = "FTS5 index retrieval ranking";
  console.log(`  query: ${c.yellow(`"${query}"`)}`);
  for (const r of index.search(query, { limit: 3 })) {
    console.log(`    ${c.green(r.score.toFixed(2))}  ${c.dim(`[${r.entry.vault}]`)} ${r.entry.content}`);
  }
  index.close();

  // ── 2. Temporal ────────────────────────────────────────────
  banner(2, "Temporal — staleness + 90-day confidence half-life");
  const temporal = new TemporalEngine();
  const reports = temporal.scanVaults(dir);
  const stats = temporal.getStalenessStats(reports);
  console.log(c.dim(`  ${stats.total} entries · ${stats.healthy} healthy · ${c.yellow(String(stats.stale))} stale · avg confidence ${stats.avgConfidence}`));
  for (const r of reports.filter((x) => x.isStale)) {
    console.log(`    ${c.yellow("STALE")} ${c.dim(`(${Math.round(r.daysSinceConfirmed)}d, ${r.originalConfidence}→${r.currentConfidence})`)} ${r.content}`);
  }
  console.log(c.dim("    (old knowledge decays unless reconfirmed — surfaced, not silently trusted)"));

  // ── 3. Contradiction ───────────────────────────────────────
  banner(3, "Contradiction — cross-vault conflict detection");
  const detector = new ContradictionDetector();
  const conflicts = detector.scanVaults(dir, { minSimilarity: 0.6 });
  if (conflicts.length === 0) console.log(c.dim("  none found"));
  for (const x of conflicts) {
    console.log(`  ${c.yellow("CONFLICT")} similarity ${c.green(x.similarity.toFixed(2))}`);
    console.log(`    ${c.dim(`[${x.entryA.vault}]`)} ${x.entryA.content}`);
    console.log(`    ${c.dim(`[${x.entryB.vault}]`)} ${x.entryB.content}`);
  }

  // ── 4. Orchestration ───────────────────────────────────────
  banner(4, "Orchestration — routing + pattern + synthesis");
  const sis = new StarlightIntelligence({ memoryPath: dir });
  sis.initialize();
  const intent = "Review the code for security issues and quality before release";
  console.log(`  task: ${c.yellow(`"${intent}"`)}`);
  const routed = sis.routeTask(intent);
  console.log(c.dim(`  routed → ${routed.slice(0, 3).map((r) => `${r.agent.name} (${r.score})`).join(", ")}`));
  const result = await sis.orchestrate({ intent });
  console.log(`  pattern: ${c.green(result.pattern)}  complexity: ${c.green(String(result.complexity))}/10  agents: ${c.green(String(result.executions.length))}  confidence: ${c.green(result.confidence.toFixed(2))}  recalled: ${c.green(String(result.memoryRecalled))}`);
  console.log(c.dim(`  (default executor is a no-LLM stub — wire setExecutor() to a model for real synthesis)`));

  console.log(c.green("\n✓ Four engines, real output, zero mocks. This is the operational core.\n"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
