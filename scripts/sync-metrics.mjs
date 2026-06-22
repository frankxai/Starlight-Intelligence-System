#!/usr/bin/env node
/**
 * SIS living metrics — recompute from source, never from prose.
 *
 * The Metrics Truth Rule (metrics/METRICS_TRUTH.md) forbids hand-typed counts in
 * public surfaces. This script is the enforcement: it derives every headline
 * number straight from the repo and writes it between markers, so the README can
 * never drift from reality again. It is the "evolves + truth-lock" primitive —
 * as the system grows, the numbers update themselves.
 *
 * Derivation (identical logic to scripts/check-agent-harness.mjs):
 *   - agents  -> agent .md files under agents/ (excl. the two registry files),
 *                walking one level into sub-tiers
 *   - skills  -> length of the `rules` array in skills/skill-rules.json
 *   - engine  -> non-test *.ts under src/ (file count + total LOC)
 *   - tests   -> count of it()/test() across src + test *.test.ts
 *   - version -> package.json `version`
 *
 * Writes to:
 *   - README.md      between <!-- METRICS:START --> / <!-- METRICS:END -->
 *   - metrics/current.json  (the living ledger, with last_verified)
 *
 * Usage:
 *   node scripts/sync-metrics.mjs           # regenerate + write
 *   node scripts/sync-metrics.mjs --check    # CI gate: fail if surfaces drift
 *
 * Built on SIP — operational tier (drift-defense, truth-lock).
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const CHECK = process.argv.includes('--check');
const START = '<!-- METRICS:START -->';
const END = '<!-- METRICS:END -->';

function read(file) {
  try { return readFileSync(path.join(root, file), 'utf8').replace(/^﻿/, ''); }
  catch { return ''; }
}

// ── derivation ──────────────────────────────────────────────

function deriveAgentCount() {
  const dir = path.join(root, 'agents');
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) {
      if (entry.name.endsWith('.md') && entry.name !== 'AGENT_REGISTRY.md' && entry.name !== 'CODING_AGENTS_REGISTRY.md') count += 1;
    } else if (entry.isDirectory()) {
      for (const sub of readdirSync(path.join(dir, entry.name), { withFileTypes: true })) {
        if (sub.isFile() && sub.name.endsWith('.md')) count += 1;
      }
    }
  }
  return count;
}

function deriveSkillCount() {
  try {
    const json = JSON.parse(read('skills/skill-rules.json'));
    return Array.isArray(json.rules) ? json.rules.length : 0;
  } catch { return 0; }
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function deriveEngine() {
  const files = walk(path.join(root, 'src')).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
  let loc = 0;
  for (const f of files) loc += readFileSync(f, 'utf8').split('\n').length;
  return { files: files.length, loc };
}

function deriveTests() {
  const files = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'test'))].filter((f) => f.endsWith('.test.ts'));
  let cases = 0;
  for (const f of files) {
    const m = readFileSync(f, 'utf8').match(/\b(it|test)\s*\(\s*['"`]/g);
    if (m) cases += m.length;
  }
  return { files: files.length, cases };
}

function deriveVersion() {
  try { return JSON.parse(read('package.json')).version ?? '0.0.0'; }
  catch { return '0.0.0'; }
}

// ── compute ─────────────────────────────────────────────────

const m = {
  agents: deriveAgentCount(),
  skills: deriveSkillCount(),
  engine: deriveEngine(),
  tests: deriveTests(),
  version: deriveVersion(),
};
const today = new Date().toISOString().slice(0, 10);
const fmt = (n) => n.toLocaleString('en-US');

// ── README block ────────────────────────────────────────────

function renderBlock() {
  return [
    START,
    '',
    '| Surface | Live count | Source of truth |',
    '|---|---|---|',
    `| Named agents | **${fmt(m.agents)}** | \`agents/**/*.md\` |`,
    `| Auto-activating skills | **${fmt(m.skills)}** | \`skills/skill-rules.json\` |`,
    `| Engine code | **${fmt(m.engine.loc)} LOC** across ${m.engine.files} files | \`src/**/*.ts\` (excl. tests) |`,
    `| Test cases | **${fmt(m.tests.cases)}** across ${m.tests.files} files | \`src\` + \`test\` \`*.test.ts\` |`,
    `| Version | **${m.version}** | \`package.json\` |`,
    '',
    `_Derived from source, not hand-typed. Regenerate with \`npm run metrics\`; CI fails on drift via \`npm run metrics -- --check\`. Last verified ${today}._`,
    '',
    END,
  ].join('\n');
}

// signature = the numbers only, so the daily date never trips --check
function signature() {
  return `${m.agents}|${m.skills}|${m.engine.loc}|${m.engine.files}|${m.tests.cases}|${m.tests.files}|${m.version}`;
}
function blockSignature(text) {
  const nums = [];
  const re = /\*\*([\d,]+(?:\sLOC)?|\d+\.\d+\.\d+)\*\*/g;
  let mm;
  while ((mm = re.exec(text))) nums.push(mm[1].replace(/,/g, '').replace(' LOC', ''));
  // order: agents, skills, loc, tests.cases, version ; plus the inline file counts
  const fileCounts = [...text.matchAll(/across (\d+) files/g)].map((x) => x[1]);
  // agents|skills|loc|engineFiles|testCases|testFiles|version
  return [nums[0], nums[1], nums[2], fileCounts[0], nums[3], fileCounts[1], nums[4]].join('|');
}

// ── metrics/current.json ────────────────────────────────────

function renderLedger() {
  const ledgerPath = 'metrics/current.json';
  let json;
  try { json = JSON.parse(read(ledgerPath)); } catch { json = { metrics: {} }; }
  const e = (value, source) => ({ value, last_verified: today, source, ownership: 'built', stale: false });
  json.last_updated = today;
  json.metrics = {
    ...json.metrics,
    named_agents: e(m.agents, 'agents/**/*.md'),
    auto_activating_skills: e(m.skills, 'skills/skill-rules.json'),
    engine_loc: e(m.engine.loc, 'src/**/*.ts (excl. tests)'),
    engine_files: e(m.engine.files, 'src/**/*.ts (excl. tests)'),
    test_cases: e(m.tests.cases, 'src + test *.test.ts'),
    test_files: e(m.tests.files, 'src + test *.test.ts'),
    sis_version: e(m.version, 'package.json'),
  };
  return { ledgerPath, text: JSON.stringify(json, null, 2) + '\n' };
}

// ── apply / check ───────────────────────────────────────────

const readme = read('README.md');
const hasMarkers = readme.includes(START) && readme.includes(END);
const failures = [];

if (CHECK) {
  if (!hasMarkers) {
    failures.push('README.md: missing METRICS markers (run `npm run metrics`)');
  } else {
    const current = readme.slice(readme.indexOf(START), readme.indexOf(END) + END.length);
    if (blockSignature(current) !== signature()) {
      failures.push(`README.md: metrics block is stale.\n   on disk:  ${blockSignature(current)}\n   derived:  ${signature()}\n   fix: npm run metrics`);
    }
  }
  // ledger value check (date-independent)
  try {
    const led = JSON.parse(read('metrics/current.json')).metrics ?? {};
    const want = { named_agents: m.agents, auto_activating_skills: m.skills, engine_loc: m.engine.loc, test_cases: m.tests.cases };
    for (const [k, v] of Object.entries(want)) {
      if (led[k]?.value !== v) failures.push(`metrics/current.json: ${k} = ${led[k]?.value ?? 'missing'}, expected ${v} (run \`npm run metrics\`)`);
    }
  } catch { failures.push('metrics/current.json: unreadable or invalid JSON'); }

  if (failures.length) {
    console.error('Living-metrics check FAILED:');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log(`Living-metrics check passed (agents=${m.agents}, skills=${m.skills}, engine=${fmt(m.engine.loc)} LOC, tests=${m.tests.cases}, v${m.version}).`);
  process.exit(0);
}

// write mode
if (!hasMarkers) {
  console.error('README.md has no <!-- METRICS:START --> / <!-- METRICS:END --> markers. Add them where the metrics table should render, then re-run.');
  process.exit(1);
}
const before = readme.slice(0, readme.indexOf(START));
const after = readme.slice(readme.indexOf(END) + END.length);
writeFileSync(path.join(root, 'README.md'), before + renderBlock() + after);
const ledger = renderLedger();
writeFileSync(path.join(root, ledger.ledgerPath), ledger.text);
console.log(`Living metrics written → README.md + ${ledger.ledgerPath}`);
console.log(`  agents=${m.agents} skills=${m.skills} engine=${fmt(m.engine.loc)} LOC/${m.engine.files} files tests=${m.tests.cases}/${m.tests.files} files v${m.version}`);
