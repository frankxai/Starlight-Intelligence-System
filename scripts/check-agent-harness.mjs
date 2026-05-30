#!/usr/bin/env node
/**
 * SIS agent-harness check — derive-and-assert guard.
 *
 * The README advertises this command (`npm run agents:harness-check`) as the
 * way "prompt surfaces stay aligned with reality." For that promise to hold,
 * the guard itself must read the SAME source-of-truth the docs claim, then
 * assert the docs match — never hardcode literals that silently rot one
 * release later.
 *
 * Source-of-truth derivation (mirrors test/v80-platform-prompts.test.ts):
 *   - agent count   -> number of agent .md files under agents/ (excl.
 *                     AGENT_REGISTRY.md), walking one level into sub-tiers
 *                     (e.g. agents/council/*.md)
 *   - skill count   -> length of the `rules` array in skills/skill-rules.json
 *   - SIS version   -> package.json `version` field
 *
 * The guard then asserts:
 *   - AGENTS.md publishes the derived agent count AND skill count
 *   - CLAUDE.md publishes the derived SIS version + the layer-routing distinction
 *   - README.md keeps its load-bearing capability claims (vaults, MCP, adapters)
 *   - .agent-harness.json manifest invariants hold
 *
 * Exit non-zero on any drift so CI and a contributor's first run fail loudly
 * BEFORE the marketing surface lies to anyone.
 *
 * Built on SIP — operational tier (drift-defense harness).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(file) {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return '';
  }
}

function requireFile(file) {
  if (!existsSync(path.join(root, file))) failures.push(`${file}: missing`);
}

function requireText(file, pattern, description) {
  const text = read(file);
  if (!pattern.test(text)) failures.push(`${file}: missing ${description}`);
}

// -- Source-of-truth derivation ----------------------------------------------

/**
 * Count agent .md files under agents/ (excl. AGENT_REGISTRY.md).
 *
 * Walks exactly one level into sub-directories (e.g. agents/council/*.md) to
 * match the current tier layout — agent files live either at agents/ root or in
 * a single sub-tier folder. This mirrors listAgentFiles() in test/_lib/repo.ts;
 * if the directory grows deeper nesting, update both in lockstep.
 */
function deriveAgentCount() {
  const agentsDir = path.join(root, 'agents');
  if (!existsSync(agentsDir)) return null;
  let count = 0;
  for (const entry of readdirSync(agentsDir, { withFileTypes: true })) {
    if (entry.isFile()) {
      if (entry.name.endsWith('.md') && entry.name !== 'AGENT_REGISTRY.md') count += 1;
    } else if (entry.isDirectory()) {
      const subDir = path.join(agentsDir, entry.name);
      for (const sub of readdirSync(subDir, { withFileTypes: true })) {
        if (sub.isFile() && sub.name.endsWith('.md')) count += 1;
      }
    }
  }
  return count;
}

/** Length of the `rules` array in skills/skill-rules.json. */
function deriveSkillCount() {
  try {
    const json = JSON.parse(read('skills/skill-rules.json'));
    return Array.isArray(json.rules) ? json.rules.length : null;
  } catch {
    return null;
  }
}

/** SIS version from package.json `version`. */
function derivePackageVersion() {
  try {
    const pkg = JSON.parse(read('package.json'));
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch {
    return null;
  }
}

/** Escape every regex metacharacter so a derived literal matches literally. */
function escapeRegex(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// -- Manifest invariants ------------------------------------------------------

function validateManifest() {
  const file = '.agent-harness.json';
  requireFile(file);
  if (failures.some((failure) => failure.startsWith(file))) return;
  let manifest;
  try {
    manifest = JSON.parse(read(file));
  } catch {
    failures.push(`${file}: invalid JSON`);
    return;
  }
  if (manifest.risk !== 'private') failures.push(`${file}: risk must be private`);
  if (manifest.health !== 'npm test') failures.push(`${file}: health must be 'npm test'`);
  if (manifest.deployPolicy !== 'manual') failures.push(`${file}: deployPolicy must be manual`);
  if (manifest.globalHooksAllowed !== false) failures.push(`${file}: globalHooksAllowed must be false`);
  for (const expected of ['AGENTS.md', 'CLAUDE.md']) {
    if (!manifest.agentFiles?.includes(expected)) failures.push(`${file}: agentFiles missing ${expected}`);
  }
}

validateManifest();
for (const file of ['AGENTS.md', 'CLAUDE.md', 'README.md']) requireFile(file);

// -- README: load-bearing capability claims (not version-coupled) ------------
requireText('README.md', /six vaults|6 semantic vaults/i, 'six-vault memory claim');
requireText('README.md', /MCP server|sis_\*/i, 'MCP server claim');
requireText('README.md', /Claude Code.*Cursor.*Codex.*Gemini.*OpenCode/is, 'multi-platform adapter claim');

// -- AGENTS.md + CLAUDE.md: derived count + version symmetry ------------------
const agentCount = deriveAgentCount();
const skillCount = deriveSkillCount();
const pkgVersion = derivePackageVersion();

if (agentCount === null) {
  failures.push('agents/: could not derive agent count (missing directory?)');
} else {
  requireText(
    'AGENTS.md',
    new RegExp(`\\b${agentCount}\\s+(?:named\\s+)?agents?\\b`, 'i'),
    `current agent count claim (expected ${agentCount}, derived from agents/*.md)`,
  );
}

if (skillCount === null) {
  failures.push('skills/skill-rules.json: could not derive skill count (missing/invalid rules array)');
} else {
  requireText(
    'AGENTS.md',
    new RegExp(`\\b${skillCount}\\s+auto-activating\\s+skill`, 'i'),
    `current skill count claim (expected ${skillCount}, derived from skill-rules.json)`,
  );
}

if (pkgVersion === null) {
  failures.push('package.json: could not derive version');
} else {
  const versionRe = escapeRegex(pkgVersion);
  requireText(
    'CLAUDE.md',
    new RegExp(`Starlight Intelligence System v${versionRe}`, 'i'),
    `current SIS version claim (expected v${pkgVersion}, derived from package.json)`,
  );
}

requireText('CLAUDE.md', /Substrate-level|Operational-level|Substrate|Operational/i, 'layer routing distinction');

if (failures.length > 0) {
  console.error('SIS agent harness check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `SIS agent harness check passed (agents=${agentCount}, skills=${skillCount}, version=v${pkgVersion}).`,
);
