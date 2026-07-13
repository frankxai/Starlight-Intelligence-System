#!/usr/bin/env node
/**
 * install-mesh.mjs — wire any repo into the Starlight interconnection mesh.
 *
 * The adopter/community entry point. Run this inside a target repo (yours, a
 * community member's, another dev's) and it makes that repo a mesh citizen:
 * it can write session atoms and be discovered by the poller. No lock-in — the
 * mesh is a convention (one JSONL + one registry), not a service.
 *
 * Usage (from inside the repo you want to join):
 *   node /path/to/Starlight-Intelligence-System/scripts/install-mesh.mjs
 *   node scripts/install-mesh.mjs --registry https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/main/context/repo-registry.json
 *
 * What it does (idempotent):
 *   1. Writes .mesh.json — the membership marker (registry pointer + contract).
 *   2. Ensures memory/bus/atoms.jsonl exists locally.
 *   3. Prints the one line to paste into the repo's AGENTS.md / CLAUDE.md so
 *      every harness knows to write a session atom on wrap.
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

function arg(name, fb = "") { const i = process.argv.indexOf(`--${name}`); return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fb; }
function sh(c) { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } }

const cwd = process.cwd();
const repo = sh("git rev-parse --show-toplevel").split("/").pop() || cwd.split("/").pop();
const slug = (sh("git remote get-url origin").replace(/.*github\.com[:/]/, "").replace(/\.git$/, "")) || `unknown/${repo}`;
const registry = arg("registry", "https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/main/context/repo-registry.json");

const marker = {
  mesh: "starlight-interconnection-mesh",
  version: 1,
  repo,
  slug,
  registry,
  bus: "memory/bus/atoms.jsonl",
  contract: "On session wrap, append one session.end atom (ts, kind, source=<harness>, repo, branch, summary, commits[], next) to the bus AND update MEMORY.md. See the mesh README in Starlight-Intelligence-System.",
  joined: new Date().toISOString().slice(0, 10),
};

writeFileSync(resolve(cwd, ".mesh.json"), JSON.stringify(marker, null, 2) + "\n");
if (!existsSync(resolve(cwd, "memory/bus"))) mkdirSync(resolve(cwd, "memory/bus"), { recursive: true });
if (!existsSync(resolve(cwd, "memory/bus/atoms.jsonl"))) writeFileSync(resolve(cwd, "memory/bus/atoms.jsonl"), "");

console.log(`
✅ ${slug} joined the Starlight mesh.

Wrote:
  .mesh.json                 membership marker → ${registry}
  memory/bus/atoms.jsonl     local write surface (created if missing)

Paste this into the repo's AGENTS.md (and CLAUDE.md) so every harness reports in:

  ## Mesh
  This repo is a Starlight mesh citizen (.mesh.json). On session wrap, write a
  session atom: \`node scripts/mesh-atom.mjs --harness <name> --summary "<one line>" --next "<handoff>"\`
  (copy mesh-atom.mjs from Starlight-Intelligence-System, or curl it).

Then it shows up in the daily org-poll digest automatically.
`);
