#!/usr/bin/env node
/**
 * org-poller.mjs — Layer 1 of the interconnection mesh.
 *
 * The one job: make parallel harness work discoverable. Every harness (Claude,
 * Codex, Cursor, Gemini) converges on GitHub, so GitHub is the shared spine.
 * This polls the frankxai account, diffs against the canonical registry, and
 * emits a memory-bus atom for every new or freshly-pushed repo — the exact
 * thing that would have caught `ana-ai-business-kit` the moment it appeared.
 *
 * Cloud-runnable. No Windows/PowerShell deps. Node 18+ (global fetch).
 *
 * Env:
 *   GITHUB_TOKEN   required — a token that can list the account's repos.
 *   GH_ACCOUNT     optional — defaults to "frankxai".
 *
 * Usage:
 *   node scripts/org-poller.mjs            # poll, diff, emit atoms, rewrite snapshot
 *   node scripts/org-poller.mjs --dry-run  # report only, write nothing
 *
 * Exit: 0 always (a poller that crashes the routine is worse than one that logs).
 * Prints a one-block digest on stdout for the scheduled routine to relay.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = resolve(ROOT, "context/repo-registry.json");
const BUS = resolve(ROOT, "memory/bus/atoms.jsonl");
const ACCOUNT = process.env.GH_ACCOUNT || "frankxai";
const DRY = process.argv.includes("--dry-run");
const NOW = new Date().toISOString();

function die(msg) { console.error(`[org-poller] ${msg}`); process.exit(0); }

const token = process.env.GITHUB_TOKEN;
if (!token) die("GITHUB_TOKEN not set — cannot poll. (No crash: routine keeps running.)");

async function ghRepos() {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner,organization_member&sort=pushed`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "starlight-org-poller" },
    });
    if (!res.ok) die(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    out.push(...batch.filter((r) => r.owner?.login?.toLowerCase() === ACCOUNT.toLowerCase()));
    if (batch.length < 100) break;
  }
  return out.map((r) => ({
    repo: r.name,
    slug: r.full_name,
    branch: r.default_branch,
    last_commit: (r.pushed_at || "").slice(0, 10),
    pushed_at: r.pushed_at,
    visibility: r.private ? "private" : "public",
    fork: !!r.fork,
    archived: !!r.archived,
  }));
}

function loadRegistry() {
  if (!existsSync(REGISTRY)) return { schema_version: 1, repos: [] };
  return JSON.parse(readFileSync(REGISTRY, "utf8"));
}

function atom(kind, r, extra = {}) {
  return JSON.stringify({ ts: NOW, kind, source: "org-poller", repo: r.repo, slug: r.slug, ...extra });
}

const live = await ghRepos();
const reg = loadRegistry();
const known = new Map((reg.repos || []).map((r) => [r.slug || `${ACCOUNT}/${r.repo}`, r]));

const created = [];
const updated = [];
for (const r of live) {
  const prev = known.get(r.slug);
  if (!prev) { created.push(r); continue; }
  if (prev.pushed_at && r.pushed_at && r.pushed_at > prev.pushed_at) updated.push(r);
  else if (!prev.pushed_at && r.last_commit && prev.last_commit && r.last_commit > prev.last_commit) updated.push(r);
}

const atoms = [
  ...created.map((r) => atom("repo.discovered", r, { visibility: r.visibility, pushed_at: r.pushed_at })),
  ...updated.map((r) => atom("repo.updated", r, { pushed_at: r.pushed_at })),
];

if (!DRY && atoms.length) {
  mkdirSync(dirname(BUS), { recursive: true });
  appendFileSync(BUS, atoms.join("\n") + "\n");
}

if (!DRY) {
  const snapshot = {
    ...reg,
    schema_version: reg.schema_version ?? 1,
    generated: NOW.slice(0, 10),
    generator: "scripts/org-poller.mjs (live GitHub poll)",
    org_totals: { account: ACCOUNT, seen: live.length, polled_at: NOW },
    repos: live.map(({ pushed_at, ...keep }) => ({ ...keep, pushed_at })),
  };
  writeFileSync(REGISTRY, JSON.stringify(snapshot, null, 2) + "\n");
}

// Digest — the durable output the scheduled routine relays to Frank.
const line = (r) => `  • ${r.slug} (${r.visibility}, pushed ${r.last_commit})`;
console.log(
  [
    `Starlight org-poll ${NOW.slice(0, 10)} — ${ACCOUNT}`,
    `seen ${live.length} repos · ${created.length} newly discovered · ${updated.length} updated${DRY ? " (dry-run)" : ""}`,
    created.length ? `\nNEWLY DISCOVERED (were invisible to Starlight):\n${created.map(line).join("\n")}` : "",
    updated.length ? `\nUPDATED since last poll:\n${updated.slice(0, 20).map(line).join("\n")}${updated.length > 20 ? `\n  … +${updated.length - 20} more` : ""}` : "",
    !created.length && !updated.length ? "\nNo changes since last poll." : "",
  ].filter(Boolean).join("\n")
);
