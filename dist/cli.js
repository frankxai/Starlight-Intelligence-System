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
 *   starlight orchestrate <intent>        Run an orchestration (prints JSON)
 *   starlight stats                       Show system statistics
 *   starlight version                     Print version
 */
import { parseArgs } from "node:util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { StarlightIntelligence } from "./index.js";
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
  --category <cat>                Memory category: pattern, decision, insight, error, preference
  --confidence <n>                Confidence score (0.0-1.0) for vault set
  --tags <t1,t2>                  Comma-separated tags for vault set
  --pattern <pattern>             Orchestration pattern: direct, sequential, parallel, iterative, cascade, broadcast

Examples:
  starlight init
  starlight generate --target cursor --output .cursorrules
  starlight vault set my-pattern "Always use server components" --category pattern --tags react,next
  starlight vault search "server components"
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
            category: { type: "string" },
            confidence: { type: "string" },
            tags: { type: "string" },
            pattern: { type: "string" },
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
main().catch((err) => {
    console.error("[starlight] Fatal error:", err);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map