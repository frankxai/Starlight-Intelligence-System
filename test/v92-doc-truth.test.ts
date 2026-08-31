/**
 * v9.2 — the front door must not lie, and must not point at one machine.
 *
 * An adoption audit on 2026-08-30 found four front-door documents claiming four mutually
 * exclusive inventories of the same product (README 144/83, DELIVERY 47/71/14, ONBOARDING
 * Route D 7/16, and AGENT_REGISTRY contradicting itself within its own first two lines),
 * a starter pack telling a non-technical reader to upload 9 knowledge files when there are
 * 21, and `file:///c:/Users/frank/...` links in AGENTS.md — the Codex front door — which
 * resolve for exactly one person on earth.
 *
 * `metrics/METRICS_TRUTH.md` already forbade hardcoded fast-moving numbers. It was wired to
 * nothing, so it could not stop any of this.
 *
 * These assertions are deliberately limited to claims that are mechanically checkable with
 * no judgement: a count against the directory it counts, and absolute paths that are wrong
 * for every reader by construction. Prose keeps the argument; this keeps the arithmetic.
 *
 * Built on SIP — operational tier (front-door conformance).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

/** Docs a stranger meets before they run anything. */
const FRONT_DOOR = [
  "README.md",
  "ONBOARDING.md",
  "DELIVERY.md",
  "AGENTS.md",
  "SIP.md",
  "agents/AGENT_REGISTRY.md",
  "integrations/starter-packs/friend-starter/README.md",
];

function read(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf-8");
}

test("no front-door doc links to one machine's filesystem", () => {
  const offenders: string[] = [];
  for (const rel of FRONT_DOOR) {
    const text = read(rel);
    for (const pattern of [/file:\/\/\/[a-zA-Z]:/g, /[a-zA-Z]:\\Users\\[a-z]+\\/gi]) {
      const hits = text.match(pattern);
      if (hits) offenders.push(`${rel}: ${hits.length}× ${hits[0]}`);
    }
  }
  assert.deepEqual(offenders, [], `absolute local paths in front-door docs:\n${offenders.join("\n")}`);
});

test("every relative link in a front-door doc resolves from its own directory", () => {
  // Resolving from the repo root instead of the file's directory is the trap here: it
  // reports `agents/AGENT_REGISTRY.md -> docs/X` as fine when GitHub would render it as
  // `agents/docs/X` and 404. Resolve relative to the file, the way a reader's client does.
  const broken: string[] = [];
  for (const rel of FRONT_DOOR) {
    const dir = dirname(join(REPO_ROOT, rel));
    for (const match of read(rel).matchAll(/\]\(([^)#][^)]*)\)/g)) {
      const target = match[1].split("#")[0].trim();
      if (!target || /^(https?|mailto):/.test(target)) continue;
      if (!existsSync(resolve(dir, target))) broken.push(`${rel} -> ${target}`);
    }
  }
  assert.deepEqual(broken, [], `broken relative links:\n${broken.join("\n")}`);
});

test("the starter pack states its real knowledge-file count", () => {
  const packDir = join(REPO_ROOT, "integrations", "starter-packs", "friend-starter");
  const actual = readdirSync(join(packDir, "knowledge")).filter((f) => f.endsWith(".md")).length;
  const readme = readFileSync(join(packDir, "README.md"), "utf-8");

  // Its audience is explicitly non-technical and cannot debug a wrong number: the old
  // README said 9 (twice, including in troubleshooting) against 21 on disk, so a reader
  // following it exactly uploaded 43% of the knowledge base and was then told they were done.
  const claimed = [...readme.matchAll(/(?:all )?(\d+) knowledge files|folder with (\d+) small markdown files/gi)]
    .map((m) => Number(m[1] ?? m[2]));

  assert.ok(claimed.length > 0, "README no longer states a knowledge-file count — restore one");
  for (const n of claimed) {
    assert.equal(n, actual, `README claims ${n} knowledge files, ${actual} exist`);
  }
});

test("the starter pack's MCP config points at the server, not the library", () => {
  const cfg = JSON.parse(
    readFileSync(join(REPO_ROOT, "integrations/starter-packs/friend-starter/mcp.json"), "utf-8"),
  ) as { sip_version?: string; advanced_install?: { claude_desktop_config_example?: Record<string, unknown> } };

  const serialized = JSON.stringify(cfg.advanced_install?.claude_desktop_config_example ?? {});
  // dist/index.js is the library entry and does not speak JSON-RPC — Claude Desktop pointed
  // at it fails silently, which is the worst outcome for this pack's audience.
  assert.ok(!serialized.includes("dist/index.js"), "MCP example points at the library entry, not the server");
  assert.ok(serialized.includes("dist/mcp-server.js"), "MCP example should invoke dist/mcp-server.js");
  assert.ok(serialized.includes("--vault-dir"), "vault directory is passed by flag, not by environment");
  assert.ok(!serialized.includes("STARLIGHT_VAULT_PATH"), "that environment variable is never read by the server");

  const sipVersion = readFileSync(join(REPO_ROOT, "SIP.md"), "utf-8").match(/^Version:\s*`?(v[\d.]+)`?/m)?.[1];
  assert.ok(sipVersion, "could not read the current SIP version from SIP.md");
  assert.equal(`v${cfg.sip_version}`, sipVersion, "starter pack pins a stale SIP version");
});

test("metrics/current.json is not stale", () => {
  // Deliberately no independent agent-count derivation here. `deriveAgentCount()` in
  // scripts/check-agent-harness.mjs is canonical and v87 already asserts the doc surfaces
  // against it; scripts/count-inventory.mjs matches its exclusion set. A third definition
  // is how this went wrong on 2026-08-31 — a rival counter included
  // CODING_AGENTS_REGISTRY.md, produced 145 against the canonical 144, and the wrong number
  // reached the docs before the existing harness caught it. Freshness is what this owns.
  const inventory = (JSON.parse(readFileSync(join(REPO_ROOT, "metrics", "current.json"), "utf-8")) as {
    metrics?: { repo_inventory?: Record<string, unknown> };
  }).metrics?.repo_inventory;

  assert.ok(inventory, "metrics/current.json has no repo_inventory — run scripts/count-inventory.mjs");
  assert.ok(inventory.last_verified, "repo_inventory carries no last_verified date");

  const check = spawnSync(process.execPath, [join(REPO_ROOT, "scripts", "count-inventory.mjs"), "--check"], {
    encoding: "utf-8",
  });
  assert.equal(check.status, 0, `metrics/current.json is stale:\n${check.stderr}`);
});
