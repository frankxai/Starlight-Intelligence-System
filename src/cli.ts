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
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { StarlightIntelligence } from "./index.js";
import { MemoryManager } from "./memory.js";
import { syncACOSToSIS } from "./sync.js";
import { generateIntelligenceReport } from "./score.js";
import { generateGuidance } from "./guidance.js";
import { registerProject, listProjects, syncAllProjects } from "./multi-sync.js";

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
  generate                        Generate context file from .starlight/ config
  guidance                        Generate behavioral guidance for session injection
  sync                            Sync ACOS trajectories into SIS memory
  score                           Generate unified intelligence report
  project register <name> <path>  Register a project for federated multi-sync
  project list                    List registered projects
  project sync-all                Sync all registered projects at once
  vault list                      List all memory entries
  vault get <key>                 Get a memory entry by ID
  vault set <key> <value>         Store a memory entry
  vault search <query>            Search memories
  orchestrate <intent>            Run an orchestration (prints JSON result)
  stats                           Show system statistics
  version                         Print version

Options:
  --help, -h                      Show this help message
  --target <target>               Context target: claude-code, cursor, windsurf, generic
  --output <path>                 Output file path for generate command
  --project <name>                Project name (for guidance)
  --acos-path <path>              Path to ACOS trajectories directory (for sync/score/guidance)
  --max-lines <n>                 Max lines in guidance output (default: 40)
  --dry-run                       Preview sync without writing (for sync)
  --min-score <n>                 Minimum success score to sync (0.0-1.0)
  --category <cat>                Memory category: pattern, decision, insight, error, preference
  --confidence <n>                Confidence score (0.0-1.0) for vault set
  --tags <t1,t2>                  Comma-separated tags for vault set
  --pattern <pattern>             Orchestration pattern: direct, sequential, parallel, iterative, cascade, broadcast

Examples:
  starlight init
  starlight generate --target cursor --output .cursorrules
  starlight guidance --project frankx --acos-path ~/.claude/trajectories
  starlight sync --acos-path ~/.claude/trajectories
  starlight sync --dry-run
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
      if (pkg.name === "@frankx/starlight-intelligence-system") {
        return pkg.version as string;
      }
    } catch {
      // Continue searching
    }
  }

  return "unknown";
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
      console.error("  Available actions: list, get, set, search");
      process.exitCode = 1;
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
  console.log(`@frankx/starlight-intelligence-system v${version}`);
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
      "min-score": { type: "string" },
      category: { type: "string" },
      confidence: { type: "string" },
      tags: { type: "string" },
      pattern: { type: "string" },
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
      cmdInit();
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

    case "sync":
      cmdSync(asString(values["acos-path"]), {
        dryRun: values["dry-run"] === true,
        minScore: asString(values["min-score"]),
      });
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

    case "stats":
      cmdStats();
      break;

    case "version":
      cmdVersion();
      break;

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
