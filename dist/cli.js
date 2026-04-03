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
 *   starlight vault list                  List all memory entries
 *   starlight vault get <key>             Get a memory entry by ID
 *   starlight vault set <key> <value>     Store a memory entry
 *   starlight vault search <query>        Search memories
 *   starlight canonical stats             Show canonical ~/.starlight stats
 *   starlight canonical validate          Validate canonical vault rows
 *   starlight canonical read <vault>      Read canonical vault entries
 *   starlight canonical append <vault> <content>
 *                                         Append a typed canonical entry
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
import { SIS_VAULT_NAMES, appendCanonicalSisEntry, getCanonicalSisStats, parseJsonl, readCanonicalSisVault, resolveCanonicalSisHome, validateCanonicalSisVaultRows, validateSisWriteInput, } from "./canonical-sis.js";
// ── Constants ───────────────────────────────────────────────
const STARLIGHT_DIR = ".starlight";
const DEFAULT_CONFIG = {
    target: "claude-code",
    layers: ["identity", "knowledge", "strategy", "agents", "memory"],
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
function printUsage() {
    console.log(`
Starlight Intelligence System — CLI

Usage:
  starlight <command> [options]

Commands:
  init                            Initialize .starlight/ in current project
  generate                        Generate context file from .starlight/ config
  sync                            Sync ACOS trajectories into SIS memory
  score                           Generate unified intelligence report
  vault list                      List all memory entries
  vault get <key>                 Get a memory entry by ID
  vault set <key> <value>         Store a memory entry
  vault search <query>            Search memories
  canonical stats                 Show canonical ~/.starlight stats
  canonical validate              Validate canonical SIS vault integrity
  canonical read <vault>          Read canonical vault entries
  canonical append <vault> <content>
                                  Append a typed canonical entry
  orchestrate <intent>            Run an orchestration (prints JSON result)
  stats                           Show system statistics
  version                         Print version

Options:
  --help, -h                      Show this help message
  --target <target>               Context target: claude-code, cursor, windsurf, generic
  --output <path>                 Output file path for generate command
  --acos-path <path>              Path to ACOS trajectories directory (for sync/score)
  --dry-run                       Preview sync without writing (for sync)
  --min-score <n>                 Minimum success score to sync (0.0-1.0)
  --category <cat>                Memory category: pattern, decision, insight, error, preference
  --confidence <n>                Confidence score (0.0-1.0) for vault set
  --confidence-level <level>      Canonical confidence: low, medium, high
  --tags <t1,t2>                  Comma-separated tags for vault set
  --sis-home <path>               Override canonical ~/.starlight root
  --vault <name>                  Canonical vault override for validate
  --limit <n>                     Limit canonical read output
  --entry-type <type>             Canonical entry type
  --project <name>                Typed metadata for project_learning
  --routine <name>                Typed metadata for routine_learning
  --state <name>                  Typed metadata for state_learning
  --pack-name <name>              Typed metadata for prompt_pack
  --asset-name <name>             Typed metadata for creative_asset
  --author <name>                 Canonical entry author
  --source <source>               Canonical entry source
  --context <text>                Canonical entry context
  --json                          Emit machine-readable JSON
  --pattern <pattern>             Orchestration pattern: direct, sequential, parallel, iterative, cascade, broadcast

Examples:
  starlight init
  starlight generate --target cursor --output .cursorrules
  starlight sync --acos-path ~/.claude/trajectories
  starlight sync --dry-run
  starlight score
  starlight vault set my-pattern "Always use server components" --category pattern --tags react,next
  starlight vault search "server components"
  starlight canonical stats --json
  starlight canonical append technical "Prefer durable local memory" --entry-type project_learning --project Arcanea --tags memory,sis
  starlight orchestrate "Design a new authentication system"
  starlight stats
`);
}
function getVersion() {
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
                return pkg.version;
            }
        }
        catch {
            // Continue searching
        }
    }
    return "unknown";
}
function createSIS() {
    const memoryPath = join(process.cwd(), STARLIGHT_DIR, "memory.json");
    const sis = new StarlightIntelligence({ memoryPath });
    sis.initialize();
    return sis;
}
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}
function parsePositiveInt(value, fallback) {
    if (!value)
        return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return parsed;
}
function printJsonOrValue(data, asJson) {
    if (asJson) {
        console.log(formatJSON(data));
        return;
    }
    if (typeof data === "string") {
        console.log(data);
        return;
    }
    console.log(formatJSON(data));
}
// ── Commands ────────────────────────────────────────────────
function cmdInit() {
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
function cmdGenerate(target, outputPath) {
    const sis = createSIS();
    const resolvedTarget = (target ?? DEFAULT_CONFIG.target);
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
    }
    else {
        // Print to stdout for piping
        console.log(context.content);
    }
}
function cmdVault(action, args, options) {
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
            }
            else if (results.length > 0) {
                console.log(`[starlight] No exact match for ID "${key}". Closest matches:\n`);
                for (const r of results.slice(0, 5)) {
                    const preview = r.content.length > 80 ? r.content.slice(0, 80) + "..." : r.content;
                    console.log(`  ${r.id} [${r.category}] ${preview}`);
                }
            }
            else {
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
            const category = (options.category ?? "insight");
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
function cmdCanonical(action, args, options) {
    const sisHome = resolveCanonicalSisHome(options.sisHome);
    const asJson = options.json === true;
    switch (action) {
        case "stats": {
            const stats = getCanonicalSisStats(sisHome);
            printJsonOrValue(stats, asJson);
            return;
        }
        case "validate": {
            const vaultOption = options.vault ? String(options.vault).trim().toLowerCase() : undefined;
            const vaults = vaultOption && SIS_VAULT_NAMES.includes(vaultOption)
                ? [vaultOption]
                : [...SIS_VAULT_NAMES];
            const results = vaults.map((vault) => {
                const typedVault = vault;
                const path = join(sisHome, "vaults", `${vault}.jsonl`);
                const rows = parseJsonl(path);
                const validation = validateCanonicalSisVaultRows(typedVault, rows);
                return {
                    vault,
                    path,
                    rowCount: rows.length,
                    valid: validation.valid,
                    errors: validation.errors,
                    warnings: validation.warnings,
                };
            });
            const summary = {
                sisHome,
                valid: results.every((result) => result.valid),
                vaults: results,
            };
            printJsonOrValue(summary, asJson);
            if (!summary.valid) {
                process.exitCode = 1;
            }
            return;
        }
        case "read": {
            const vault = args[0];
            if (!vault || !SIS_VAULT_NAMES.includes(vault)) {
                console.error("[starlight] Error: canonical read requires a valid vault name.");
                console.error(`  Valid vaults: ${SIS_VAULT_NAMES.join(", ")}`);
                process.exitCode = 1;
                return;
            }
            const limit = parsePositiveInt(options.limit, 20);
            const entries = readCanonicalSisVault(vault, sisHome).slice(-limit).reverse();
            printJsonOrValue({
                sisHome,
                vault,
                count: entries.length,
                entries,
            }, true);
            return;
        }
        case "append": {
            const vault = args[0];
            const content = args.slice(1).join(" ").trim();
            const validation = validateSisWriteInput({
                vault,
                content,
                tags: options.tags,
                source: options.source,
                author: options.author,
                context: options.context,
                confidence: options.confidenceLevel,
                entryType: options.entryType,
                project: options.project,
                routine: options.routine,
                state: options.state,
                packName: options.packName,
                assetName: options.assetName,
            });
            if (!validation.valid) {
                console.error("[starlight] Error: invalid canonical SIS entry.");
                console.error(formatJSON({ errors: validation.errors, warnings: validation.warnings }));
                process.exitCode = 1;
                return;
            }
            const result = appendCanonicalSisEntry(validation.normalized, sisHome);
            printJsonOrValue({
                sisHome,
                entry: result,
                warnings: validation.warnings,
            }, true);
            return;
        }
        default:
            console.error(`[starlight] Unknown canonical action: "${action}".`);
            console.error("  Available actions: stats, validate, read, append");
            process.exitCode = 1;
    }
}
async function cmdOrchestrate(intent, pattern) {
    if (!intent) {
        console.error("[starlight] Error: orchestrate requires an intent string.");
        console.error('  Example: starlight orchestrate "Design a new auth system"');
        process.exitCode = 1;
        return;
    }
    const sis = createSIS();
    const task = {
        intent,
        pattern: pattern,
    };
    console.log(`[starlight] Orchestrating: "${intent}"`);
    if (pattern)
        console.log(`  Pattern: ${pattern}`);
    console.log("");
    const result = await sis.orchestrate(task);
    console.log(formatJSON(result));
}
function cmdSync(acosPath, options) {
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
function cmdScore(acosPath) {
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
function cmdStats() {
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
function cmdVersion() {
    const version = getVersion();
    console.log(`@frankx/starlight-intelligence-system v${version}`);
}
// ── Main ────────────────────────────────────────────────────
async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            help: { type: "boolean", short: "h" },
            target: { type: "string" },
            output: { type: "string" },
            "acos-path": { type: "string" },
            "dry-run": { type: "boolean" },
            "min-score": { type: "string" },
            category: { type: "string" },
            confidence: { type: "string" },
            "confidence-level": { type: "string" },
            tags: { type: "string" },
            pattern: { type: "string" },
            "sis-home": { type: "string" },
            vault: { type: "string" },
            limit: { type: "string" },
            "entry-type": { type: "string" },
            project: { type: "string" },
            routine: { type: "string" },
            state: { type: "string" },
            "pack-name": { type: "string" },
            "asset-name": { type: "string" },
            author: { type: "string" },
            source: { type: "string" },
            context: { type: "string" },
            json: { type: "boolean" },
        },
        strict: false,
    });
    // Extract typed values (parseArgs with strict:false returns string | boolean | undefined)
    const asString = (v) => typeof v === "string" ? v : undefined;
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
        case "canonical": {
            const action = positionals[1];
            if (!action) {
                console.error("[starlight] Error: canonical requires an action (stats, validate, read, append).");
                process.exitCode = 1;
                return;
            }
            cmdCanonical(action, positionals.slice(2), {
                sisHome: asString(values["sis-home"]),
                vault: asString(values.vault),
                limit: asString(values.limit),
                entryType: asString(values["entry-type"]),
                confidenceLevel: asString(values["confidence-level"]),
                tags: asString(values.tags),
                project: asString(values.project),
                routine: asString(values.routine),
                state: asString(values.state),
                packName: asString(values["pack-name"]),
                assetName: asString(values["asset-name"]),
                author: asString(values.author),
                source: asString(values.source),
                context: asString(values.context),
                json: values.json === true,
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
main().catch((err) => {
    console.error("[starlight] Fatal error:", err);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map