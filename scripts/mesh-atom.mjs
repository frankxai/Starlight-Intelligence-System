#!/usr/bin/env node
/**
 * mesh-atom.mjs — the harness-neutral write contract (Layer 3).
 *
 * Any harness calls this on session wrap to record what it did into the shared
 * memory bus AND the repo's own MEMORY.md. One line in; two durable surfaces out.
 * This is the primitive that keeps the estate "updated" — the counterpart to the
 * poller's "discovered".
 *
 * Usage:
 *   node scripts/mesh-atom.mjs \
 *     --harness claude --repo Starlight-Intelligence-System --branch <br> \
 *     --summary "what happened in one line" \
 *     --commits 06dccac,dd064ca \
 *     --next "what the next session should do"
 *
 * --summary is required. Everything else is inferred or optional.
 * --no-memory skips the MEMORY.md append (bus-only).
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUS = resolve(ROOT, "memory/bus/atoms.jsonl");
const MEMORY = resolve(ROOT, "MEMORY.md");
const NOW = new Date().toISOString();

function arg(name, fallback = "") {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function sh(cmd) { try { return execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } }

const summary = arg("summary");
if (!summary) { console.error("[mesh-atom] --summary is required"); process.exit(1); }

const harness = arg("harness", process.env.CLAUDE_HARNESS || "claude");
const repo = arg("repo", sh("git rev-parse --show-toplevel").split("/").pop() || "unknown");
const branch = arg("branch", sh("git rev-parse --abbrev-ref HEAD"));
const commits = arg("commits", sh("git log --format=%h -3")).split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
const next = arg("next");

const atom = { ts: NOW, kind: "session.end", source: harness, repo, branch, summary, commits, ...(next ? { next } : {}) };

mkdirSync(dirname(BUS), { recursive: true });
appendFileSync(BUS, JSON.stringify(atom) + "\n");
console.log(`[mesh-atom] bus += ${repo}@${branch}: ${summary}`);

if (!process.argv.includes("--no-memory")) {
  const stamp = `- **${NOW.slice(0, 10)}** (${harness}, \`${branch}\`): ${summary}${commits.length ? ` [${commits.join(", ")}]` : ""}${next ? ` → next: ${next}` : ""}`;
  if (existsSync(MEMORY)) {
    const body = readFileSync(MEMORY, "utf8");
    const marker = "<!-- mesh-log -->";
    if (body.includes(marker)) {
      writeFileSync(MEMORY, body.replace(marker, `${marker}\n${stamp}`));
    } else {
      appendFileSync(MEMORY, `\n\n## Mesh session log\n${marker}\n${stamp}\n`);
    }
    console.log(`[mesh-atom] MEMORY.md += session line`);
  }
}
