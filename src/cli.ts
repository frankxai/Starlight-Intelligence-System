#!/usr/bin/env node

/**
 * Starlight Intelligence System — CLI
 *
 * Zero-dependency CLI built on Node.js built-in `parseArgs`.
 * Provides direct access to the SIS engine from the terminal.
 *
 * Usage:
 *   starlight init                        Initialize .starlight/ in current project
 *   starlight generate                    Generate context file from .starlight/ config
 *   starlight guidance                    Generate behavioral guidance for session injection
 *   starlight project register <n> <path> Register a project for multi-sync
 *   starlight project list                List registered projects
 *   starlight project sync-all            Sync all registered projects
 *   starlight vault list                  List all memory entries
 *   starlight vault get <key>             Get a memory entry by ID
 *   starlight vault set <key> <value>     Store a memory entry
 *   starlight vault search <query>        Search memories
 *   starlight orchestrate <intent>        Run an orchestration (prints JSON)
 *   starlight stats                       Show system statistics
 *   starlight version                     Print version
 */

import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { StarlightIntelligence } from "./index.js";
import { GoalOrchestrator } from "./goal.js";
import { MemoryManager } from "./memory.js";
import { syncACOSToSIS } from "./sync.js";
import { generateIntelligenceReport } from "./score.js";
import { generateGuidance } from "./guidance.js";
import { registerProject, listProjects, syncAllProjects } from "./multi-sync.js";
import { inspectMemoryHealth, updateVaultConsolidationStamps } from "./memory-health.js";
import { runMemoryEval } from "./memory-eval.js";
import { seedVaults } from "./seed.js";
import { AgentOpsLedger, ApprovalGateRequiredError, readRecentAgentEvents } from "./ledgers.js";
import { listModules, setModuleEnabled } from "./modules.js";
import {
  appendSwarmAudit,
  createSwarmPlan,
  inspectSwarmProviders,
  inspectSwarmRepos,
} from "./swarm.js";
import type { RiskLevel, WorkPacketStatus } from "./types.js";

// ── Constants ───────────────────────────────────────────────

const STARLIGHT_DIR = ".starlight";

const DEFAULT_CONFIG = {
  target: "claude-code" as const,
  layers: ["identity", "knowledge", "strategy", "agents", "memory"] as const,
  maxTokens: 4000,
};

const DEFAULT_PROFILE_FILE = `# Starlight Intelligence — Profile
# Edit this file to customize your identity layer.

name: "Builder"
title: "Software Engineer"
domains:
  - "Web Development"
  - "AI Systems"
values:
  - "Excellence"
  - "Craftsmanship"
  - "Depth"
voice:
  tone: "Technical depth with creative flair."
  do:
    - "Lead with results and specifics"
    - "Precise technical language"
  dont:
    - "Over-explain basic concepts"
    - "Use filler phrases"
`;

const DEFAULT_STACK_FILE = `# Starlight Intelligence — Tech Stack
# Edit this file to match your project's stack.

framework: "Next.js 15 (App Router)"
language: "TypeScript 5.7+ (Strict)"
styling: "Tailwind CSS v4"
deployment: "Vercel"
`;

const DEFAULT_CONFIG_FILE = `# Starlight Intelligence — Config
# Controls context generation behavior.

target: "claude-code"
layers:
  - identity
  - knowledge
  - strategy
  - agents
  - memory
maxTokens: 4000
`;

// ── Helpers ─────────────────────────────────────────────────

function printUsage(): void {
  console.log(`
Starlight Intelligence System — CLI

Usage:
  starlight <command> [options]

Commands:
  init                            Initialize .starlight/ in current project
  init --vaults                   Seed the six JSONL memory vaults the MCP server reads
  generate                        Generate context file from .starlight/ config
  guidance                        Generate behavioral guidance for session injection
  sync                            Sync ACOS trajectories into SIS memory
  doctor                          Check CLI, dispatcher, and cockpit readiness
  dispatch <prompt>               Route a prompt through Arcanea orchestrator
  starlight-swarm <goal>           Create approval-gated multi-CLI swarm packets
  starlight-swarm status           Show swarm repo/provider readiness
  starlight-swarm providers        Show dry-run provider adapters
  starlight-swarm repos            Show configured v1 repo ring
  cockpit [project]               Launch or attach to the Zellij cockpit
  score                           Generate unified intelligence report
  project register <name> <path>  Register a project for federated multi-sync
  project list                    List registered projects
  project sync-all                Sync all registered projects at once
  forge                           Synthesize regression tests from vault patterns
  workpacket create               Create a WorkPacket (--title --mission --risk)
  workpacket list                 List recent WorkPackets
  workpacket show <id>            Show a single WorkPacket
  workpacket next                 Show oldest pending WorkPacket
  workpacket complete <id>        Mark a WorkPacket completed and emit AgentEvent
  workpacket start <id>           Mark a WorkPacket in_progress and emit AgentEvent
  workpacket block <id>           Mark a WorkPacket blocked and emit AgentEvent
  events tail                     Show recent AgentEvents (--limit --date)
  memory rebuild                  Rebuild SQLite shadow indices from JSONL ledgers
  memory eval                     Run live sovereign memory eval scoreboard
  modules list                    List Intelligence System modules
  modules enable <id>             Enable an Intelligence System module locally
  modules disable <id>            Disable an Intelligence System module locally
  vault list                      List all memory entries
  vault health                    Show repo-local memory health
  vault refresh                   Run dreaming consolidation and stamp vault freshness
  vault consolidate               Alias for vault refresh
  vault get <key>                 Get a memory entry by ID
  vault set <key> <value>         Store a memory entry
  vault search <query>            Search memories
  orchestrate <intent>            Run an orchestration (prints JSON result)
  stats                           Show system statistics
  version                         Print version
  goal init <intent>              Initiate a SAGE goal checklist (--checklist)
  goal status                     Show current goal checklist & logs
  goal update <id> <status>       Update goal task status
  goal log <message>              Log status update to active goal
  goal compress                   Consolidate context and findings to vaults (--findings --summary)
  goal checkpoint                 Backup local changes to git branch
  goal audit                      Verify workspace builds and tests (--no-tests)
  goal rollback                   Rollback local edits to recover clean workspace

Options:
  --help, -h                      Show this help message
  --target <target>               Context target: claude-code, cursor, windsurf, generic
  --output <path>                 Output file path for generate command
  --project <name>                Project name (for guidance)
  --acos-path <path>              Path to ACOS trajectories directory (for sync/score/guidance)
  --max-lines <n>                 Max lines in guidance output (default: 40)
  --dry-run                       Preview sync without writing (for sync)
  --attach                        Attach to an existing Zellij session when possible
  --task <task>                   Arcanea task class for dispatch (default: code.debug)
  --surface <surface>             Arcanea routing surface (default: claude-arcanea)
  --model <model>                 Override Arcanea model selection
  --min-score <n>                 Minimum success score to sync (0.0-1.0)
  --category <cat>                Memory category: pattern, decision, insight, error, preference
  --confidence <n>                Confidence score (0.0-1.0) for vault set
  --tags <t1,t2>                  Comma-separated tags for vault set
  --pattern <pattern>             Orchestration pattern: direct, sequential, parallel, iterative, cascade, broadcast
  --mission <text>                WorkPacket mission statement
  --risk <level>                  WorkPacket risk: low, medium, high, critical
  --agent <id>                    WorkPacket assigned agent (default: unassigned)
  --status <status>               Filter workpacket list by status
  --date <YYYY-MM-DD>             Event date for events tail
  --summary <text>                Transition summary for workpacket lifecycle commands
  --limit <n>                     Maximum number of items to list
  --vaults                        (with init) seed the six MCP memory vaults
  --vault-dir <path>              (with init --vaults) target dir (default: ~/.starlight/vaults)
  --force                         (with init --vaults) overwrite existing vault files
  --checklist <tasks>             Comma-separated checklist tasks for goal init
  --findings <text>               Findings to consolidate during goal compress
  --no-tests                      Skip test execution during goal audit

Examples:
  starlight init
  starlight init --vaults
  starlight init --vaults --vault-dir ~/.starlight/vaults
  starlight generate --target cursor --output .cursorrules
  starlight guidance --project frankx --acos-path ~/.claude/trajectories
  starlight sync --acos-path ~/.claude/trajectories
  starlight sync --dry-run
  starlight doctor
  starlight dispatch --task code.debug --dry-run "find the failing test"
  starlight starlight-swarm --dry-run "build the cosmos MCP plan"
  starlight starlight-swarm providers
  starlight cockpit sis
  starlight score
  starlight project register frankx ~/.claude/trajectories
  starlight project list
  starlight project sync-all
  starlight vault set my-pattern "Always use server components" --category pattern --tags react,next
  starlight vault search "server components"
  starlight orchestrate "Design a new authentication system"
  starlight stats
`);
}

function getVersion(): string {
  // Walk up from dist/cli.js or src/cli.ts to find package.json
  const searchDirs = [
    join(import.meta.dirname ?? ".", ".."),
    import.meta.dirname ?? ".",
    process.cwd(),
  ];

  for (const dir of searchDirs) {
    try {
      const candidate = join(dir, "package.json");
      const pkg = JSON.parse(readFileSync(candidate, "utf-8"));
      if (pkg.name === "@arcanea/starlight-intelligence-system") {
        return pkg.version as string;
      }
    } catch {
      // Continue searching
    }
  }

  return "unknown";
}

function getPackageRoot(): string {
  const searchDirs = [
    join(import.meta.dirname ?? ".", ".."),
    import.meta.dirname ?? ".",
    process.cwd(),
  ];

  for (const dir of searchDirs) {
    try {
      const candidate = join(dir, "package.json");
      const pkg = JSON.parse(readFileSync(candidate, "utf-8"));
      if (pkg.name === "@arcanea/starlight-intelligence-system") {
        return dir;
      }
    } catch {
      // Continue searching
    }
  }

  return process.cwd();
}

function createSIS(): StarlightIntelligence {
  const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
  const sis = new StarlightIntelligence({ memoryPath });
  sis.initialize();
  return sis;
}

function formatJSON(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function runShell(
  command: string,
  args: string[],
  inherit = false,
  extraEnv?: Record<string, string>,
): ReturnType<typeof spawnSync> {
  return spawnSync(command, args, {
    shell: true,
    encoding: "utf-8",
    stdio: inherit ? "inherit" : "pipe",
    timeout: 60_000,
    env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
  });
}

function commandSummary(command: string, args: string[] = ["--version"]): {
  ok: boolean;
  label: string;
} {
  const result = runShell(command, args);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().split(/\r?\n/)[0] ?? "";
  return {
    ok: result.status === 0,
    label: output || (result.error ? result.error.message : "available"),
  };
}

// ── Commands ────────────────────────────────────────────────

function cmdInit(): void {
  const dir = join(process.cwd(), STARLIGHT_DIR);

  if (existsSync(dir)) {
    console.log(`[starlight] .starlight/ already exists at ${dir}`);
    console.log("[starlight] Skipping initialization. Delete and re-run to reset.");
    return;
  }

  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "profile.yml"), DEFAULT_PROFILE_FILE, "utf-8");
  writeFileSync(join(dir, "stack.yml"), DEFAULT_STACK_FILE, "utf-8");
  writeFileSync(join(dir, "config.yml"), DEFAULT_CONFIG_FILE, "utf-8");
  writeFileSync(join(dir, "memory.json"), "[]", "utf-8");

  console.log("[starlight] Initialized .starlight/ directory:");
  console.log("  .starlight/profile.yml   — Your identity layer");
  console.log("  .starlight/stack.yml     — Your tech stack");
  console.log("  .starlight/config.yml    — Generation config");
  console.log("  .starlight/memory.json   — Memory vault (empty)");
  console.log("");
  console.log("Edit these files, then run: starlight generate");
}

/**
 * Seed the six canonical JSONL vaults that the MCP server reads. A fresh
 * install has no `~/.starlight/vaults` directory, so this is the "make the
 * empty state self-explaining" first-run step referenced by the README MCP
 * quick-start. Idempotent: existing vault files are kept unless --force.
 */
function cmdInitVaults(vaultDirArg?: string, force = false): void {
  const vaultDir = vaultDirArg
    ? resolve(vaultDirArg)
    : join(homedir(), ".starlight", "vaults");

  const result = seedVaults(vaultDir, { force });

  console.log(`[starlight] Vaults at ${result.vaultDir}`);
  if (result.created.length > 0) {
    console.log(
      `  created: ${result.created.join(", ")}` +
      `${result.usedExamples ? " (seeded with public examples)" : ""}`,
    );
  }
  if (result.skipped.length > 0) {
    console.log(`  kept (already present): ${result.skipped.join(", ")}`);
    console.log("  re-run with --force to overwrite existing vaults.");
  }
  console.log("");
  console.log("Point your MCP client at this directory:");
  console.log(`  node node_modules/@arcanea/starlight-intelligence-system/dist/mcp-server.js --vault-dir ${result.vaultDir}`);
}

function cmdGenerate(target?: string, outputPath?: string): void {
  const sis = createSIS();

  const resolvedTarget = (target ?? DEFAULT_CONFIG.target) as
    "claude-code" | "cursor" | "windsurf" | "generic";

  const context = sis.generateContext({
    target: resolvedTarget,
    layers: [...DEFAULT_CONFIG.layers],
    maxTokens: DEFAULT_CONFIG.maxTokens,
  });

  if (outputPath) {
    const resolved = resolve(outputPath);
    writeFileSync(resolved, context.content, "utf-8");
    console.log(`[starlight] Context written to ${resolved}`);
    console.log(`  Target: ${context.target}`);
    console.log(`  Layers: ${context.layers.join(", ")}`);
    console.log(`  Tokens: ~${context.tokenEstimate}`);
  } else {
    // Print to stdout for piping
    console.log(context.content);
  }
}

function cmdVault(action: string, args: string[], options: {
  category?: string;
  confidence?: string;
  tags?: string;
}): void {
  const sis = createSIS();
  const root = getPackageRoot();

  switch (action) {
    case "list": {
      const stats = sis.getMemoryStats();
      if (stats.totalEntries === 0) {
        console.log("[starlight] Memory vault is empty.");
        return;
      }

      console.log(`[starlight] Memory Vault — ${stats.totalEntries} entries\n`);
      console.log("Categories:");
      for (const [cat, count] of Object.entries(stats.byCategory)) {
        console.log(`  ${cat}: ${count}`);
      }
      if (stats.oldestEntry) {
        console.log(`\nOldest: ${stats.oldestEntry}`);
      }
      if (stats.newestEntry) {
        console.log(`Newest: ${stats.newestEntry}`);
      }
      console.log("\nUse 'starlight vault search <query>' to find specific entries.");
      break;
    }

    case "health": {
      printMemoryHealth(inspectMemoryHealth(root));
      break;
    }

    case "refresh":
    case "consolidate": {
      const result = runShell("node", ["--import", "tsx", "scripts/dreaming-run.ts"], false, {
        STARLIGHT_VAULT_DIR: join(root, "memory", "vaults"),
        STARLIGHT_SESSIONS_DIR: join(root, "memory", "voice-sessions"),
      });

      if (result.status !== 0) {
        console.error("[starlight] Memory refresh failed.");
        const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
        if (output) console.error(output);
        process.exitCode = result.status ?? 1;
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const updated = updateVaultConsolidationStamps(root, today);
      console.log("[starlight] Memory refresh complete.");
      console.log(`  Dreaming receipt: ${`${result.stdout ?? ""}${result.stderr ?? ""}`.trim() || "written"}`);
      console.log(`  Vault stamps updated: ${updated.length}`);
      printMemoryHealth(inspectMemoryHealth(root));
      break;
    }

    case "get": {
      const key = args[0];
      if (!key) {
        console.error("[starlight] Error: vault get requires a key (memory ID).");
        process.exitCode = 1;
        return;
      }
      // Search for the specific ID by looking through search results
      const results = sis.searchMemories({ query: key, limit: 50 });
      const exact = results.find((m) => m.id === key);
      if (exact) {
        console.log(formatJSON(exact));
      } else if (results.length > 0) {
        console.log(`[starlight] No exact match for ID "${key}". Closest matches:\n`);
        for (const r of results.slice(0, 5)) {
          const preview = r.content.length > 80 ? r.content.slice(0, 80) + "..." : r.content;
          console.log(`  ${r.id} [${r.category}] ${preview}`);
        }
      } else {
        console.log(`[starlight] No memory found matching "${key}".`);
      }
      break;
    }

    case "set": {
      const key = args[0];
      const value = args.slice(1).join(" ");
      if (!key || !value) {
        console.error("[starlight] Error: vault set requires <key> <value>.");
        console.error('  Example: starlight vault set my-pattern "Always use server components"');
        process.exitCode = 1;
        return;
      }

      const category = (options.category ?? "insight") as
        "pattern" | "decision" | "insight" | "error" | "preference";
      const confidence = options.confidence ? parseFloat(options.confidence) : 0.8;
      const tags = options.tags ? options.tags.split(",").map((t) => t.trim()) : [key];

      const entry = sis.remember({
        content: value,
        category,
        tags,
        confidence: Math.max(0, Math.min(1, confidence)),
      });

      console.log("[starlight] Memory stored:");
      console.log(formatJSON(entry));
      break;
    }

    case "search": {
      const query = args.join(" ");
      if (!query) {
        console.error("[starlight] Error: vault search requires a query.");
        process.exitCode = 1;
        return;
      }

      const results = sis.searchMemories({ query, limit: 10 });
      if (results.length === 0) {
        console.log(`[starlight] No memories matching "${query}".`);
        return;
      }

      console.log(`[starlight] Found ${results.length} memories:\n`);
      for (const mem of results) {
        console.log(`  ${mem.id}`);
        console.log(`    [${mem.category}] ${mem.content}`);
        console.log(`    confidence: ${mem.confidence} | tags: ${mem.tags.join(", ")} | ${mem.createdAt}`);
        console.log("");
      }
      break;
    }

    default:
      console.error(`[starlight] Unknown vault action: "${action}".`);
      console.error("  Available actions: list, health, refresh, consolidate, get, set, search");
      process.exitCode = 1;
  }
}

function printMemoryHealth(memory: ReturnType<typeof inspectMemoryHealth>): void {
  console.log("\nMemory Surfaces:");
  console.log(`  ${memory.status === "healthy" ? "OK  " : memory.status === "attention-needed" ? "WARN" : "MISS"} overall               ${memory.status}`);
  console.log(`  primary: ${memory.architecture.primaryRuntime}`);
  console.log(`  canon:   ${memory.architecture.canonical}`);
  console.log(`  ${memory.vaults.filter((v) => v.present).length}/${memory.vaults.length} vaults present`);
  for (const vault of memory.vaults) {
    const age = vault.ageDays == null ? "n/a" : `${vault.ageDays}d`;
    const stamp = vault.lastConsolidated ?? "missing";
    console.log(
      `  ${vault.stale ? "WARN" : "OK  "} ${vault.name.padEnd(12)} ${stamp} (${age})`
    );
  }
  console.log(`  ${memory.voiceSessions.count} voice sessions${memory.voiceSessions.latest ? ` | latest: ${memory.voiceSessions.latest}` : ""}`);
  console.log(`  KG index rows: ${memory.knowledgeGraph.indexRows} | brain cache: ${memory.knowledgeGraph.brainCachePresent ? "present" : "missing"}`);
  console.log(`  sovereign corpus: ${memory.corpora.sovereign.rows} rows | ${memory.corpora.sovereign.present ? "present" : "missing"}`);
  console.log(`  frozen mempalace: ${memory.corpora.frozenMempalace.rows} rows | ${memory.corpora.frozenMempalace.present ? "present" : "missing"}`);
  console.log(`  corpus drift: ${memory.drift.status}${memory.drift.coverageRatio == null ? "" : ` | coverage ${memory.drift.coverageRatio}`}`);
  console.log(`  memory-bus: ${memory.memoryBus.status} | launcher ${memory.memoryBus.launcherPresent ? "present" : "missing"} | private ${memory.memoryBus.privatePathPresent ? "present" : "missing"}`);
  console.log(`  evals: eval-50 ${memory.evals.eval50Present ? `${memory.evals.eval50Rows} rows` : "missing"} | concurrency ${memory.evals.concurrencyGatePresent ? "present" : "missing"} | retrieval ${memory.evals.retrievalEvalPresent ? "present" : "missing"}`);
  console.log(`  privacy: MCP search private-by-default = ${memory.privacy.defaultMcpSearchIncludesPrivate}`);
  console.log(`  mempalace legacy vectors: atoms ${memory.mempalace.atomRows ?? 0} | atoms.jsonl ${memory.mempalace.atomsPresent ? "present" : "missing"} | vectors.npy ${memory.mempalace.vectorsPresent ? "present" : "missing"}`);
  console.log(`  consolidation log: ${memory.consolidationLog.entries} receipts${memory.consolidationLog.latestTimestamp ? ` | latest: ${memory.consolidationLog.latestTimestamp}` : ""}`);
  if (memory.notes.length > 0) {
    console.log("  Notes:");
    for (const note of memory.notes) {
      console.log(`    - ${note}`);
    }
  }
}

async function cmdOrchestrate(intent: string, pattern?: string): Promise<void> {
  if (!intent) {
    console.error("[starlight] Error: orchestrate requires an intent string.");
    console.error('  Example: starlight orchestrate "Design a new auth system"');
    process.exitCode = 1;
    return;
  }

  const sis = createSIS();

  const task = {
    intent,
    pattern: pattern as
      | "direct" | "sequential" | "parallel" | "iterative" | "cascade" | "broadcast"
      | undefined,
  };

  console.log(`[starlight] Orchestrating: "${intent}"`);
  if (pattern) console.log(`  Pattern: ${pattern}`);
  console.log("");

  const result = await sis.orchestrate(task);

  console.log(formatJSON(result));
}

function cmdSync(acosPath?: string, options?: { dryRun?: boolean; minScore?: string }): void {
  const resolvedPath = acosPath ?? join(process.cwd(), ".claude", "trajectories");

  if (!existsSync(resolvedPath)) {
    console.error(`[starlight] Error: ACOS trajectories not found at ${resolvedPath}`);
    console.error("  Use --acos-path to specify the trajectories directory.");
    process.exitCode = 1;
    return;
  }

  const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
  const mem = new MemoryManager(memoryPath);
  mem.load();

  const minScore = options?.minScore ? parseFloat(options.minScore) : 0;

  const result = syncACOSToSIS(mem, {
    acosPath: resolvedPath,
    dryRun: options?.dryRun ?? false,
    minScore: Math.max(0, Math.min(1, minScore)),
  });

  console.log(`[starlight] Sync ${result.dryRun ? "(DRY RUN) " : ""}Complete`);
  console.log(`  Trajectories synced: ${result.trajectoriesSynced}`);
  console.log(`  Patterns synced:     ${result.patternsSynced}`);
  console.log(`  Skipped (duplicate): ${result.skippedDuplicate}`);
  console.log(`  Skipped (low value): ${result.skippedLowValue}`);

  if (Object.keys(result.byCategory).length > 0) {
    console.log("\n  By category:");
    for (const [cat, count] of Object.entries(result.byCategory)) {
      console.log(`    ${cat}: ${count}`);
    }
  }
}

function cmdScore(acosPath?: string): void {
  const resolvedPath = acosPath ?? join(process.cwd(), ".claude", "trajectories");

  const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
  const mem = new MemoryManager(memoryPath);
  mem.load();

  const report = generateIntelligenceReport(mem, resolvedPath);

  console.log("Starlight Intelligence Report");
  console.log("═════════════════════════════════════\n");
  console.log(`  Score: ${report.totalScore}/${report.maxScore}  Grade: ${report.grade}\n`);

  for (const c of report.components) {
    const bar = "█".repeat(Math.round(c.score)) + "░".repeat(Math.round(c.maxScore - c.score));
    console.log(`  ${c.name.padEnd(22)} ${bar} ${c.score.toFixed(1)}/${c.maxScore}`);
    console.log(`    ${c.details}`);
    console.log("");
  }

  if (report.acosStats.topPatterns.length > 0) {
    console.log("  Top Patterns:");
    for (const p of report.acosStats.topPatterns) {
      console.log(`    ★ ${p}`);
    }
  }

  console.log(`\n  Generated: ${report.generatedAt}`);
}

function cmdGuidance(
  project?: string,
  acosPath?: string,
  maxLinesStr?: string
): void {
  const resolvedProject = project ?? "default";
  const resolvedPath = acosPath ?? join(process.cwd(), ".claude", "trajectories");

  const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
  const mem = new MemoryManager(memoryPath);
  mem.load();

  const maxLines = maxLinesStr ? parseInt(maxLinesStr, 10) : 40;

  const result = generateGuidance(mem, {
    project: resolvedProject,
    acosPath: resolvedPath,
    maxLines: Math.max(10, maxLines),
  });

  // Print markdown to stdout (for piping into session context)
  console.log(result.markdown);

  // Print stats to stderr so they don't pollute the piped output
  console.error(
    `[starlight] Guidance generated: ${result.stats.trajectoriesAnalyzed} trajectories, ` +
    `${result.stats.patternsAnalyzed} patterns, ${result.stats.memoriesConsulted} memories. ` +
    `Projects: ${result.stats.projectsKnown.join(", ")}`
  );
}

function cmdProject(
  action: string,
  args: string[],
  options: { dryRun?: boolean; minScore?: string }
): void {
  switch (action) {
    case "register": {
      const name = args[0];
      const path = args[1];
      if (!name || !path) {
        console.error("[starlight] Error: project register requires <name> <path>.");
        console.error("  Example: starlight project register frankx ~/.claude/trajectories");
        process.exitCode = 1;
        return;
      }
      const resolvedPath = resolve(path);
      const reg = registerProject(name, resolvedPath);
      console.log(`[starlight] Registered project "${reg.name}" → ${reg.acosPath}`);
      break;
    }

    case "list": {
      const projects = listProjects();
      if (projects.length === 0) {
        console.log("[starlight] No projects registered. Use: starlight project register <name> <path>");
        return;
      }
      console.log(`[starlight] ${projects.length} registered project(s):\n`);
      for (const p of projects) {
        const synced = p.lastSyncAt ? `last sync: ${p.lastSyncAt}` : "never synced";
        const trajs = p.trajectoriesTotal ?? 0;
        const pats = p.patternCount ?? 0;
        console.log(`  ${p.name.padEnd(15)} ${p.acosPath}`);
        console.log(`${"".padEnd(17)}${synced} | ${trajs} trajectories, ${pats} patterns`);
      }
      break;
    }

    case "sync-all": {
      const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
      const mem = new MemoryManager(memoryPath);
      mem.load();

      const minScore = options.minScore ? parseFloat(options.minScore) : 0;

      const result = syncAllProjects(mem, {
        dryRun: options.dryRun,
        minScore,
      });

      if (result.projectResults.length === 0) {
        console.log("[starlight] No projects to sync. Use: starlight project register <name> <path>");
        return;
      }

      console.log(`[starlight] Multi-Project Sync ${options.dryRun ? "(DRY RUN) " : ""}Complete\n`);
      for (const pr of result.projectResults) {
        console.log(`  ${pr.project}: ${pr.result.trajectoriesSynced} trajectories, ${pr.result.patternsSynced} patterns`);
      }
      console.log(`\n  Total synced: ${result.totalSynced}`);
      break;
    }

    default:
      console.error(`[starlight] Unknown project action: "${action}".`);
      console.error("  Available actions: register, list, sync-all");
      process.exitCode = 1;
  }
}

function isRiskLevel(value: string | undefined): value is RiskLevel {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

function isWorkPacketStatus(value: string | undefined): value is WorkPacketStatus {
  return value === "pending" || value === "in_progress" || value === "blocked" ||
    value === "completed" || value === "cancelled";
}

function cmdWorkpacket(
  action: string,
  args: string[],
  options: {
    title?: string;
    mission?: string;
    risk?: string;
    agent?: string;
    status?: string;
    summary?: string;
    limit?: string;
  },
): void {
  const root = getPackageRoot();
  const ledger = new AgentOpsLedger(root);

  try {
    switch (action) {
      case "create": {
        const title = options.title;
        const mission = options.mission;
        const risk = options.risk;

        if (!title || !mission || !risk) {
          console.error("[starlight] Error: workpacket create requires --title, --mission, --risk.");
          console.error('  Example: starlight workpacket create --title "audit" --mission "scan repo" --risk low');
          process.exitCode = 1;
          return;
        }
        if (!isRiskLevel(risk)) {
          console.error(`[starlight] Error: invalid --risk value "${risk}". Use low|medium|high|critical.`);
          process.exitCode = 1;
          return;
        }

        try {
          const packet = ledger.createWorkPacket({
            title,
            mission,
            riskLevel: risk,
            assignedAgent: options.agent ?? "unassigned",
          });

          console.log(`[starlight] WorkPacket created: ${packet.id}`);
          console.log(formatJSON(packet));
        } catch (err) {
          if (err instanceof ApprovalGateRequiredError) {
            // Substrate invariant — gate row was persisted, packet was NOT.
            console.error(`[starlight] ${err.message}`);
            console.error(`[starlight] Gate row: ${err.gate.id} (status: ${err.gate.status})`);
            console.error(`[starlight] The WorkPacket itself was NOT persisted. Approve the gate to proceed.`);
            process.exitCode = 2; // distinct exit code: gated, not error
            return;
          }
          throw err;
        }
        break;
      }

      case "list": {
        const limit = options.limit ? parseInt(options.limit, 10) : 20;
        const status = options.status;
        const packets = ledger.listWorkPackets({
          limit: Math.max(1, limit),
          status: isWorkPacketStatus(status) ? status : undefined,
        });

        if (packets.length === 0) {
          console.log("[starlight] No WorkPackets found.");
          return;
        }

        console.log(`[starlight] ${packets.length} WorkPacket(s):\n`);
        for (const p of packets) {
          console.log(`  ${p.id}`);
          console.log(`    [${p.status}] (${p.riskLevel}) ${p.title}`);
          console.log(`    agent: ${p.assignedAgent} | created: ${p.createdAt}`);
          console.log(`    mission: ${p.mission.length > 80 ? p.mission.slice(0, 80) + "..." : p.mission}`);
          console.log("");
        }
        break;
      }

      case "next": {
        const packet = ledger.nextPendingWorkPacket();
        if (!packet) {
          console.log("[starlight] No pending WorkPackets.");
          return;
        }
        console.log(formatJSON(packet));
        break;
      }

      case "show": {
        const id = args[0];
        if (!id) {
          console.error("[starlight] Error: workpacket show requires an id.");
          process.exitCode = 1;
          return;
        }
        const packet = ledger.getWorkPacket(id);
        if (!packet) {
          console.error(`[starlight] WorkPacket not found: ${id}`);
          process.exitCode = 1;
          return;
        }
        console.log(formatJSON(packet));
        break;
      }

      case "start":
      case "block":
      case "complete": {
        const id = args[0];
        if (!id) {
          console.error(`[starlight] Error: workpacket ${action} requires an id.`);
          process.exitCode = 1;
          return;
        }
        const status: WorkPacketStatus =
          action === "start" ? "in_progress" : action === "block" ? "blocked" : "completed";
        const { packet, event } = ledger.transitionWorkPacket({
          id,
          status,
          agentId: options.agent,
          summary: options.summary,
          toolsUsed: [`starlight.workpacket.${action}`],
        });
        console.log(`[starlight] WorkPacket ${id} -> ${packet.status}`);
        console.log(`[starlight] AgentEvent logged: ${event.id}`);
        console.log(formatJSON(packet));
        break;
      }

      default:
        console.error(`[starlight] Unknown workpacket action: "${action}".`);
        console.error("  Available actions: create, list, show, next, start, block, complete");
        process.exitCode = 1;
    }
  } finally {
    ledger.close();
  }
}

function cmdEvents(action: string, options: { date?: string; limit?: string }): void {
  const root = getPackageRoot();
  switch (action) {
    case "tail": {
      const limit = options.limit ? parseInt(options.limit, 10) : 20;
      const events = readRecentAgentEvents(root, {
        date: options.date,
        limit: Math.max(1, limit),
      });
      if (events.length === 0) {
        console.log("[starlight] No AgentEvents found.");
        return;
      }
      for (const event of events) {
        console.log(`${event.timestamp}  ${event.id}  ${event.agentId}  ${event.eventType}`);
        if (event.summary) console.log(`  ${event.summary}`);
      }
      break;
    }
    default:
      console.error(`[starlight] Unknown events action: "${action}".`);
      console.error("  Available actions: tail");
      process.exitCode = 1;
  }
}

function printMemoryEval(result: ReturnType<typeof runMemoryEval>): void {
  console.log("\nMemory Eval:");
  console.log(`  available: ${result.available}`);
  console.log(`  mode:      ${result.retrieval.mode}`);
  console.log(`  corpus:    ${result.corpus.atoms} atoms | ${result.corpus.queries} queries`);
  if (!result.available) {
    console.log(`  reason:    ${result.reason ?? "unknown"}`);
    return;
  }
  const metrics = result.metrics;
  if (metrics) {
    console.log(`  hit@10:    ${metrics.hit10}`);
    console.log(`  recall@5:  ${metrics.recall5}`);
    console.log(`  precision@10: ${metrics.precision10}`);
    console.log(`  mrr@10:    ${metrics.mrr10}`);
    console.log(`  latency:   p50 ${metrics.latencyMs.p50}ms | p95 ${metrics.latencyMs.p95}ms | max ${metrics.latencyMs.max}ms`);
  }
  if (result.byClass) {
    console.log("  by class:");
    for (const [klass, bucket] of Object.entries(result.byClass)) {
      console.log(`    ${klass}: n=${bucket.queries} hit@10=${bucket.hit10} recall@5=${bucket.recall5} precision@10=${bucket.precision10}`);
    }
  }
  console.log(`  judge:     ${result.retrieval.judge}`);
  console.log(`  weakness:  ${result.retrieval.weakness}`);
}

function cmdMemory(action: string, options: { limit?: string; output?: string }): void {
  const root = getPackageRoot();
  switch (action) {
    case "rebuild": {
      const ledger = new AgentOpsLedger(root);
      try {
        const stats = ledger.rebuildFromLedgers();
        console.log("[starlight] SQLite shadow indices rebuilt from JSONL ledgers.");
        console.log(formatJSON({ sqlite: ledger.getSqlitePath(), ...stats }));
      } finally {
        ledger.close();
      }
      break;
    }
    case "eval": {
      const limit = options.limit ? parseInt(options.limit, 10) : 50;
      const result = runMemoryEval(root, { limit: Number.isFinite(limit) ? limit : 50 });
      if (options.output) {
        const out = resolve(options.output);
        writeFileSync(out, JSON.stringify(result, null, 2), "utf-8");
        console.log(`[starlight] Memory eval scorecard written to ${out}`);
      }
      printMemoryEval(result);
      if (!result.available) process.exitCode = 1;
      break;
    }
    default:
      console.error(`[starlight] Unknown memory action: "${action}".`);
      console.error("  Available actions: rebuild, eval");
      process.exitCode = 1;
  }
}

function cmdModules(action: string, args: string[]): void {
  const root = getPackageRoot();
  try {
    switch (action) {
      case "list": {
        const modules = listModules(root);
        console.log(`[starlight] ${modules.length} Intelligence System module(s):\n`);
        for (const mod of modules) {
          console.log(`  ${mod.enabled ? "ON " : "OFF"} ${mod.id.padEnd(20)} ${mod.name}`);
          console.log(`      ${mod.kind} | views: ${mod.dashboardViews.join(", ")}`);
        }
        break;
      }
      case "enable":
      case "disable": {
        const id = args[0];
        if (!id) {
          console.error(`[starlight] Error: modules ${action} requires an id.`);
          process.exitCode = 1;
          return;
        }
        // --acked acknowledges privacy-scoped permissions for private-module /
        // future-module / vault:private-scoped modules. Required to enable,
        // ignored on disable. Mirrors sis.pack.install permissions_acked.
        const acked = args.includes("--acked");
        const mod = setModuleEnabled(root, id, action === "enable", { permissionsAcked: acked });
        console.log(`[starlight] Module ${mod.id} ${mod.enabled ? "enabled" : "disabled"}.`);
        console.log(formatJSON(mod));
        break;
      }
      default:
        console.error(`[starlight] Unknown modules action: "${action}".`);
        console.error("  Available actions: list, enable, disable");
        process.exitCode = 1;
    }
  } catch (err) {
    console.error(`[starlight] ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

function cmdStats(): void {
  const sis = createSIS();
  const stats = sis.getStats();
  const memStats = sis.getMemoryStats();

  console.log("Starlight Intelligence System");
  console.log("=============================\n");
  console.log(`  Version:        ${stats.version}`);
  console.log(`  Agents:         ${stats.agents}`);
  console.log(`  Skills:         ${stats.skills}`);
  console.log(`  Memories:       ${stats.memories}`);
  console.log(`  Strategies:     ${stats.strategies}`);
  console.log(`  Context Layers: ${stats.contextLayers}`);

  if (memStats.totalEntries > 0) {
    console.log("\nMemory Breakdown:");
    for (const [cat, count] of Object.entries(memStats.byCategory)) {
      console.log(`  ${cat}: ${count}`);
    }
  }
}

function cmdVersion(): void {
  const version = getVersion();
  console.log(`@arcanea/starlight-intelligence-system v${version}`);
}

function cmdDoctor(): void {
  console.log("Starlight Operator Doctor");
  console.log("=========================\n");

  const checks: Array<[string, string, string[]]> = [
    ["Claude Code", "claude", ["--version"]],
    ["Codex CLI", "codex", ["--version"]],
    ["Gemini CLI", "gemini", ["--version"]],
    ["OpenCode", "opencode", ["--version"]],
    ["Zellij", "zellij", ["--version"]],
    ["Arcanea dispatcher", "arco", ["--version"]],
    ["ACOS", "acos", ["--version"]],
    ["Starlight", "starlight", ["version"]],
  ];

  let failures = 0;
  for (const [label, command, args] of checks) {
    const result = commandSummary(command, args);
    if (!result.ok) failures++;
    console.log(`  ${result.ok ? "OK  " : "MISS"} ${label.padEnd(20)} ${result.label}`);
  }

  const geminiMcp = runShell("gemini", ["mcp", "list"]);
  const geminiMcpOutput = `${geminiMcp.stdout ?? ""}${geminiMcp.stderr ?? ""}`.trim();
  const geminiMcpLine = geminiMcpOutput
    .split(/\r?\n/)
    .find((line) => /starlight-substrate/i.test(line))
    ?? geminiMcpOutput.split(/\r?\n/)[0]
    ?? "unavailable";
  const geminiMcpOk = geminiMcp.status === 0 && /starlight-substrate/i.test(geminiMcpOutput);
  if (!geminiMcpOk) failures++;
  console.log(`  ${geminiMcpOk ? "OK  " : "MISS"} Gemini MCP           ${geminiMcpLine}`);

  const root = getPackageRoot();
  const mcpPath = join(root, "dist", "mcp-server.js");
  const cockpitSmoke = join(root, "cockpit-zellij", "test", "smoke.ps1");
  console.log(`  ${existsSync(mcpPath) ? "OK  " : "MISS"} SIS MCP build         ${mcpPath}`);
  console.log(`  ${existsSync(cockpitSmoke) ? "OK  " : "MISS"} Zellij smoke test    ${cockpitSmoke}`);

  printMemoryHealth(inspectMemoryHealth(root));

  console.log("\nArcanea Dispatcher:");
  const arcoDoctor = runShell("arco", ["doctor"]);
  if (arcoDoctor.status === 0) {
    const lines = `${arcoDoctor.stdout ?? ""}${arcoDoctor.stderr ?? ""}`
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .slice(0, 12);
    for (const line of lines) console.log(`  ${line}`);
  } else {
    failures++;
    console.log("  MISS arco doctor failed.");
  }

  console.log("");
  if (failures > 0 || !existsSync(mcpPath) || !existsSync(cockpitSmoke)) {
    console.log("[starlight] Operator readiness has gaps.");
    process.exitCode = 1;
  } else {
    console.log("[starlight] Operator path ready: SIS + Arcanea dispatcher + Zellij cockpit.");
  }
}

function cmdDispatch(
  prompt: string,
  options: {
    task?: string;
    surface?: string;
    model?: string;
    dryRun?: boolean;
  }
): void {
  if (!prompt.trim()) {
    console.error("[starlight] Error: dispatch requires a prompt.");
    process.exitCode = 1;
    return;
  }

  const task = options.task ?? "code.debug";
  const surface = options.surface ?? "claude-arcanea";
  const args = ["run", "--task", task, "--surface", surface];
  if (options.model) args.push("--model", options.model);
  if (options.dryRun) args.push("--dry-run");
  args.push(prompt);

  // B1 / Wave 2 (2026-05-11) — review-revised 2026-05-11: load per-harness
  // system prompt from core/orchestrator/harnesses/<harness>/system-prompt.md
  // and pass via env STARLIGHT_HARNESS_PROMPT. Arcanea's `arco run` reads this
  // env (once their side ships) and prepends to the target CLI's system prompt.
  //
  // Code-reviewer C1 fix: explicit surface→harness map replaces the regex
  // chain `surface.replace(/-arcanea$/, "").replace(/^.*-/, "")` which broke
  // on multi-segment surfaces (e.g., "gemini-cli-arcanea" → "cli", wrong).
  const SURFACE_TO_HARNESS: Record<string, string> = {
    "claude-arcanea": "claude",
    "codex-arcanea": "codex",
    "gemini-arcanea": "gemini",
    "opencode-arcanea": "opencode",
    "claude": "claude",
    "codex": "codex",
    "gemini": "gemini",
    "opencode": "opencode",
  };
  const harness = SURFACE_TO_HARNESS[surface];
  let harnessEnv: Record<string, string> | undefined;
  if (!harness) {
    console.log(`[starlight] Unknown surface '${surface}' — no harness prompt injection (known: ${Object.keys(SURFACE_TO_HARNESS).join(", ")})`);
  } else {
    const harnessPromptPath = join(
      getPackageRoot(),
      "core",
      "orchestrator",
      "harnesses",
      harness,
      "system-prompt.md",
    );
    try {
      const promptText = readFileSync(harnessPromptPath, "utf-8");
      harnessEnv = {
        STARLIGHT_HARNESS_PROMPT: promptText,
        STARLIGHT_HARNESS_PROMPT_PATH: harnessPromptPath,
        STARLIGHT_HARNESS_NAME: harness,
      };
      console.log(`[starlight] Harness prompt loaded: ${harness} (${promptText.length} chars)`);
    } catch (e: unknown) {
      // ENOENT = expected fallback path (fresh checkout, harness not scaffolded).
      // Other errors (EACCES, EISDIR, encoding) should surface.
      const code = (e as { code?: string } | null)?.code;
      if (code === "ENOENT") {
        console.log(`[starlight] No harness prompt at ${harnessPromptPath} — falling back to bare arco`);
      } else {
        console.warn(`[starlight] Harness prompt read failed (code=${code}): ${(e as Error).message}`);
      }
    }
  }

  console.log("[starlight] Dispatching via Arcanea orchestrator");
  console.log(`  task=${task}`);
  console.log(`  surface=${surface}`);
  console.log("");

  const result = runShell("arco", args, true, harnessEnv);
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
}

function cmdStarlightSwarm(actionOrGoal: string | undefined, rest: string[], options: { dryRun?: boolean }): void {
  const action = actionOrGoal?.trim();

  if (!action) {
    console.error("[starlight] Error: starlight-swarm requires a goal or action (status, providers, repos).");
    process.exitCode = 1;
    return;
  }

  if (action === "providers") {
    const providers = inspectSwarmProviders();
    console.log("[starlight-swarm] Provider adapters (v1 dry-run stubs):\n");
    for (const provider of providers) {
      console.log(`  ${provider.status === "available" ? "OK  " : "MISS"} ${provider.id.padEnd(12)} ${provider.name}`);
      console.log(`      mode=${provider.mode} live=${provider.liveCallsEnabled} ${provider.detail}`);
    }
    return;
  }

  if (action === "repos") {
    const repos = inspectSwarmRepos();
    console.log("[starlight-swarm] Repo ring (v1):\n");
    for (const repo of repos) {
      console.log(`  ${repo.status === "available" ? "OK  " : "MISS"} ${repo.id.padEnd(16)} ${repo.path}`);
      console.log(`      ${repo.role}; ${repo.detail}`);
    }
    return;
  }

  if (action === "status") {
    const repos = inspectSwarmRepos();
    const providers = inspectSwarmProviders();
    console.log("[starlight-swarm] Status");
    console.log("========================\n");
    console.log(`  autonomy:      plan_approve`);
    console.log(`  provider mode: adapter_stubs`);
    console.log(`  repos:         ${repos.filter((repo) => repo.status === "available").length}/${repos.length} available`);
    console.log(`  providers:     ${providers.filter((provider) => provider.status === "available").length}/${providers.length} available`);
    console.log(`  approval:      required for every mutation or external call`);
    return;
  }

  const goal = [action, ...rest].join(" ").trim();
  if (!goal) {
    console.error("[starlight] Error: starlight-swarm requires a non-empty goal.");
    process.exitCode = 1;
    return;
  }

  const plan = createSwarmPlan(goal);
  appendSwarmAudit(plan);

  if (!options.dryRun) {
    console.log("[starlight-swarm] v1 is plan-and-approve only; emitting dry-run packets.");
    console.log("");
  }
  console.log(formatJSON(plan));
}

function quotePowerShellArg(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function cmdCockpit(project?: string, attach?: boolean, dryRun?: boolean): void {
  const root = getPackageRoot();
  const script = join(root, "cockpit-zellij", "scripts", "zellij-aliases.ps1");
  const command = attach ? "arc-attach" : "arc";
  const key = project?.trim();

  if (dryRun) {
    console.log(`[starlight] Would launch cockpit: ${command}${key ? ` ${key}` : ""}`);
    return;
  }

  if (!existsSync(script)) {
    console.error(`[starlight] Error: cockpit alias script not found at ${script}`);
    process.exitCode = 1;
    return;
  }

  const psCommand = `. ${quotePowerShellArg(script)}; ${command}${key ? ` ${quotePowerShellArg(key)}` : ""}`;
  const result = runShell("pwsh", ["-NoProfile", "-Command", psCommand], true);
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
}

async function cmdForge(): Promise<void> {
  const sis = new StarlightIntelligence();
  console.log("[starlight] Initiating Test Forge...");
  const files = await sis.forgeTests();
  
  if (files.length === 0) {
    console.log("[starlight] No verified technical patterns found to forge.");
  } else {
    console.log(`[starlight] Successfully forged ${files.length} regression tests:`);
    for (const file of files) {
      console.log(`  - ${file}`);
    }
    console.log("\n[starlight] Run 'npm test' to execute the new tests.");
  }
}

async function cmdGoal(
  action: string,
  args: string[],
  options: {
    checklist?: string;
    findings?: string;
    summary?: string;
    "no-tests"?: boolean;
  }
): Promise<void> {
  const orchestrator = new GoalOrchestrator();

  switch (action) {
    case "init": {
      const intent = args.join(" ");
      if (!intent) {
        console.error("[starlight] Error: goal init requires an intent description.");
        process.exitCode = 1;
        return;
      }
      const tasks = options.checklist
        ? options.checklist.split(",").map((t) => t.trim())
        : [
            "Decompose and plan execution",
            "Implement initial implementation",
            "Verify code with local test suite",
            "Run adversarial Sentinel audit",
            "Commit and push final code to main",
          ];
      const state = orchestrator.createChecklist(intent, tasks);
      console.log(`[starlight] Goal initialized and checkpoint saved to .starlight/goal-state.json:`);
      console.log(JSON.stringify(state, null, 2));
      break;
    }

    case "status": {
      const state = orchestrator.loadState();
      if (!state) {
        console.log("[starlight] No active goal tracking file found.");
        return;
      }
      console.log(`[starlight] SAGE Goal Status:\n`);
      console.log(`Objective: ${state.objective}`);
      console.log(`Current Step: ${state.currentStepIndex}`);
      if (state.gitCheckpointBranch) {
        console.log(`Checkpoint Branch: ${state.gitCheckpointBranch}`);
      }
      console.log("\nChecklist:");
      for (const task of state.checklist) {
        const statusChar = task.status === "completed" ? "✓" : task.status === "in-progress" ? "→" : " ";
        console.log(`  [${statusChar}] ${task.id}: ${task.task} (${task.status})`);
      }
      console.log("\nRecent Logs:");
      const recentLogs = state.logs.slice(-5);
      for (const log of recentLogs) {
        console.log(`  [${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`);
      }
      break;
    }

    case "update": {
      const taskId = args[0];
      const status = args[1] as any;
      if (!taskId || !status) {
        console.error("[starlight] Error: goal update requires <taskId> <status>.");
        console.error("  Example: starlight goal update task-1 completed");
        process.exitCode = 1;
        return;
      }
      if (!["pending", "in-progress", "completed"].includes(status)) {
        console.error(`[starlight] Error: invalid status "${status}". Must be pending, in-progress, or completed.`);
        process.exitCode = 1;
        return;
      }
      orchestrator.updateTaskStatus(taskId, status);
      console.log(`[starlight] Updated task ${taskId} to ${status}.`);
      break;
    }

    case "log": {
      const message = args.join(" ");
      if (!message) {
        console.error("[starlight] Error: goal log requires a message.");
        process.exitCode = 1;
        return;
      }
      orchestrator.addLog("info", message);
      console.log("[starlight] Log entry added.");
      break;
    }

    case "compress": {
      const findings = options.findings;
      const summary = options.summary;
      if (!findings || !summary) {
        console.error("[starlight] Error: goal compress requires --findings and --summary.");
        process.exitCode = 1;
        return;
      }
      orchestrator.compressContext(findings, summary);
      console.log("[starlight] Context compressed. Findings saved to Technical, Operational, and Strategic vaults.");
      break;
    }

    case "checkpoint": {
      try {
        const branchName = orchestrator.createGitCheckpoint();
        console.log(`[starlight] Git checkpoint branch created: ${branchName}`);
      } catch (err: any) {
        console.error(`[starlight] Checkpoint failed: ${err.message}`);
        process.exitCode = 1;
      }
      break;
    }

    case "audit": {
      const runTests = options["no-tests"] !== true;
      const result = await orchestrator.runAudit({ runTests });
      console.log(`[starlight] Audit result: ${result.success ? "PASSED" : "FAILED"}`);
      console.log(`\nAudit Logs:\n${result.output}`);
      if (result.success && result.approvalTag) {
        console.log(`\nStructured Approval: ${result.approvalTag}`);
      } else {
        process.exitCode = 1;
      }
      break;
    }

    case "rollback": {
      try {
        orchestrator.rollbackGit();
        console.log("[starlight] Git rollback completed. Workspace restored.");
      } catch (err: any) {
        console.error(`[starlight] Rollback failed: ${err.message}`);
        process.exitCode = 1;
      }
      break;
    }

    default:
      console.error(`[starlight] Unknown goal action: "${action}"`);
      console.error("Available actions: init, status, update, log, compress, checkpoint, audit, rollback");
      process.exitCode = 1;
  }
}

// ── Main ────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      target: { type: "string" },
      output: { type: "string" },
      project: { type: "string" },
      "acos-path": { type: "string" },
      "max-lines": { type: "string" },
      "dry-run": { type: "boolean" },
      attach: { type: "boolean" },
      task: { type: "string" },
      surface: { type: "string" },
      model: { type: "string" },
      "min-score": { type: "string" },
      category: { type: "string" },
      confidence: { type: "string" },
      tags: { type: "string" },
      pattern: { type: "string" },
      title: { type: "string" },
      mission: { type: "string" },
      risk: { type: "string" },
      agent: { type: "string" },
      status: { type: "string" },
      date: { type: "string" },
      summary: { type: "string" },
      limit: { type: "string" },
      vaults: { type: "boolean" },
      "vault-dir": { type: "string" },
      force: { type: "boolean" },
      checklist: { type: "string" },
      findings: { type: "string" },
      "no-tests": { type: "boolean" },
    },
    strict: false,
  });

  // Extract typed values (parseArgs with strict:false returns string | boolean | undefined)
  const asString = (v: string | boolean | undefined): string | undefined =>
    typeof v === "string" ? v : undefined;

  const command = positionals[0];

  if (values.help || !command) {
    printUsage();
    return;
  }

  switch (command) {
    case "init":
      if (values.vaults) {
        cmdInitVaults(asString(values["vault-dir"]), Boolean(values.force));
      } else {
        cmdInit();
      }
      break;

    case "generate":
      cmdGenerate(asString(values.target), asString(values.output));
      break;

    case "guidance":
      cmdGuidance(
        asString(values.project),
        asString(values["acos-path"]),
        asString(values["max-lines"])
      );
      break;

    case "project": {
      const projectAction = positionals[1];
      if (!projectAction) {
        console.error("[starlight] Error: project requires an action (register, list, sync-all).");
        process.exitCode = 1;
        return;
      }
      cmdProject(projectAction, positionals.slice(2), {
        dryRun: values["dry-run"] === true,
        minScore: asString(values["min-score"]),
      });
      break;
    }

    case "forge":
      await cmdForge();
      break;

    case "sync":
      cmdSync(asString(values["acos-path"]), {
        dryRun: values["dry-run"] === true,
        minScore: asString(values["min-score"]),
      });
      break;

    case "doctor":
      cmdDoctor();
      break;

    case "dispatch": {
      const prompt = positionals.slice(1).join(" ");
      cmdDispatch(prompt, {
        task: asString(values.task),
        surface: asString(values.surface),
        model: asString(values.model),
        dryRun: values["dry-run"] === true,
      });
      break;
    }

    case "starlight-swarm": {
      cmdStarlightSwarm(positionals[1], positionals.slice(2), {
        dryRun: values["dry-run"] === true,
      });
      break;
    }

    case "cockpit":
      cmdCockpit(positionals[1], values.attach === true, values["dry-run"] === true);
      break;

    case "score":
      cmdScore(asString(values["acos-path"]));
      break;

    case "vault": {
      const action = positionals[1];
      if (!action) {
        console.error("[starlight] Error: vault requires an action (list, get, set, search).");
        process.exitCode = 1;
        return;
      }
      cmdVault(action, positionals.slice(2), {
        category: asString(values.category),
        confidence: asString(values.confidence),
        tags: asString(values.tags),
      });
      break;
    }

    case "orchestrate": {
      const intent = positionals.slice(1).join(" ");
      await cmdOrchestrate(intent, asString(values.pattern));
      break;
    }

    case "workpacket": {
      const wpAction = positionals[1];
      if (!wpAction) {
        console.error("[starlight] Error: workpacket requires an action (create, list, show, next, start, block, complete).");
        process.exitCode = 1;
        return;
      }
      cmdWorkpacket(wpAction, positionals.slice(2), {
        title: asString(values.title),
        mission: asString(values.mission),
        risk: asString(values.risk),
        agent: asString(values.agent),
        status: asString(values.status),
        summary: asString(values.summary),
        limit: asString(values.limit),
      });
      break;
    }

    case "events": {
      const eventsAction = positionals[1];
      if (!eventsAction) {
        console.error("[starlight] Error: events requires an action (tail).");
        process.exitCode = 1;
        return;
      }
      cmdEvents(eventsAction, {
        date: asString(values.date),
        limit: asString(values.limit),
      });
      break;
    }

    case "memory": {
      const memoryAction = positionals[1];
      if (!memoryAction) {
        console.error("[starlight] Error: memory requires an action (rebuild, eval).");
        process.exitCode = 1;
        return;
      }
      cmdMemory(memoryAction, {
        limit: asString(values.limit),
        output: asString(values.output),
      });
      break;
    }

    case "modules": {
      const modulesAction = positionals[1];
      if (!modulesAction) {
        console.error("[starlight] Error: modules requires an action (list, enable, disable).");
        process.exitCode = 1;
        return;
      }
      cmdModules(modulesAction, positionals.slice(2));
      break;
    }

    case "stats":
      cmdStats();
      break;

    case "version":
      cmdVersion();
      break;

    case "goal": {
      const goalAction = positionals[1];
      if (!goalAction) {
        console.error("[starlight] Error: goal requires an action (init, status, update, log, compress, checkpoint, audit, rollback).");
        process.exitCode = 1;
        return;
      }
      await cmdGoal(goalAction, positionals.slice(2), {
        checklist: asString(values.checklist),
        findings: asString(values.findings),
        summary: asString(values.summary),
        "no-tests": values["no-tests"] === true,
      });
      break;
    }

    default:
      console.error(`[starlight] Unknown command: "${command}"`);
      console.error("Run 'starlight --help' for usage.");
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error("[starlight] Fatal error:", err);
  process.exitCode = 1;
});
