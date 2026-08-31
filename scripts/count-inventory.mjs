#!/usr/bin/env node
/**
 * Count what this repo actually contains, and write it to metrics/current.json.
 *
 * Why this exists. metrics/METRICS_TRUTH.md rule 2 says never hardcode a
 * fast-moving number in prose without a `last_verified` date. The rule was never
 * wired to anything, and by 2026-08-30 the front door carried four mutually
 * exclusive inventories of the same product: README said 144 agents / 83 skills,
 * DELIVERY said 47 / 71, ONBOARDING Route D said 7 / 16, and AGENT_REGISTRY's
 * own first two lines disagreed with each other. A reader who checks two numbers
 * and finds them contradictory discounts every other claim — including the true
 * ones. The false counts were costing credit for the real capabilities.
 *
 * So: counts are computed here, and `test/v92-inventory-truth.test.ts` fails when
 * a document's number drifts from the count. Prose keeps the argument; this keeps
 * the arithmetic.
 *
 * Usage:
 *   node scripts/count-inventory.mjs           # write metrics/current.json
 *   node scripts/count-inventory.mjs --check   # exit 1 if the file is stale
 *
 * Built on SIP — operational tier (metrics truth).
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, predicate, acc);
    else if (predicate(entry.name, abs)) acc.push(abs);
  }
  return acc;
}

const isMd = (name) => name.endsWith('.md');
const isTs = (name) => name.endsWith('.ts');

/**
 * Agent definitions.
 *
 * The exclusion list must match `deriveAgentCount()` in scripts/check-agent-harness.mjs,
 * which is the canonical definition the v8.7 symmetry harness asserts against. A second,
 * subtly different definition is worse than none: on 2026-08-31 this counted
 * CODING_AGENTS_REGISTRY.md as an agent, produced 145 against the canonical 144, and that
 * wrong number was propagated into the docs before the existing harness caught it.
 */
const NOT_AGENTS = new Set(['AGENT_REGISTRY.md', 'CODING_AGENTS_REGISTRY.md']);
function countAgents() {
  return walk(join(REPO_ROOT, 'agents'), (n) => isMd(n) && !NOT_AGENTS.has(n)).length;
}

/** Auto-activation rules are the load-bearing number; loose .md files are not. */
function countSkillRules() {
  const p = join(REPO_ROOT, 'skills', 'skill-rules.json');
  if (!existsSync(p)) return 0;
  const parsed = JSON.parse(readFileSync(p, 'utf-8'));
  const rules = parsed.rules ?? parsed;
  return Array.isArray(rules) ? rules.length : Object.keys(rules).length;
}

function countSkillFiles() {
  return walk(join(REPO_ROOT, 'skills'), (n) => n === 'SKILL.md' || (isMd(n) && n !== 'README.md')).length;
}

function countDir(rel, predicate) {
  const dir = join(REPO_ROOT, rel);
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((n) => predicate(n, join(dir, n))).length;
}

const counts = {
  agents: countAgents(),
  skill_rules: countSkillRules(),
  skill_files: countSkillFiles(),
  // Both command surfaces, because they are NOT the same surface: `.claude/commands/`
  // is what a plain clone gets, `commands/` ships only via the plugin. Conflating them
  // is why the README advertised commands a cloner cannot run.
  commands_clone_visible: countDir('.claude/commands', isMd),
  commands_plugin_only: countDir('commands', isMd),
  vaults: countDir('public-vault', (n) => n.endsWith('.jsonl')),
  transmission_channels: countDir('transmissions/channels', isMd),
  platform_adapters: countDir('src/adapters', (n) => isTs(n) && !n.endsWith('.test.ts') && n !== 'types.ts' && n !== 'utils.ts' && n !== 'index.ts'),
  src_modules: walk(join(REPO_ROOT, 'src'), (n) => isTs(n) && !n.endsWith('.test.ts')).length,
  test_files: walk(join(REPO_ROOT, 'test'), (n) => n.endsWith('.test.ts')).length
    + walk(join(REPO_ROOT, 'src'), (n) => n.endsWith('.test.ts')).length,
};

const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8'));
const metricsPath = join(REPO_ROOT, 'metrics', 'current.json');
const existing = existsSync(metricsPath) ? JSON.parse(readFileSync(metricsPath, 'utf-8')) : {};

const today = new Date().toISOString().slice(0, 10);
const next = {
  ...existing,
  version: pkg.version,
  last_updated: today,
  metrics: {
    ...(existing.metrics ?? {}),
    repo_inventory: { ...counts, last_verified: today, source: 'scripts/count-inventory.mjs' },
  },
};

if (process.argv.includes('--check')) {
  const current = existing?.metrics?.repo_inventory;
  const drifted = !current || Object.entries(counts).some(([k, v]) => current[k] !== v);
  if (drifted) {
    console.error('metrics/current.json is stale. Run: node scripts/count-inventory.mjs');
    for (const [k, v] of Object.entries(counts)) {
      if (!current || current[k] !== v) console.error(`  ${k}: recorded ${current?.[k] ?? '(none)'} -> actual ${v}`);
    }
    process.exit(1);
  }
  console.log('metrics/current.json matches the repo.');
  process.exit(0);
}

writeFileSync(metricsPath, JSON.stringify(next, null, 2) + '\n');
for (const [k, v] of Object.entries(counts)) console.log(`${k.padEnd(24)} ${v}`);
console.log(`\nwrote ${metricsPath} (last_verified ${today})`);
