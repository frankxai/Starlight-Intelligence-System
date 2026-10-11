#!/usr/bin/env node
/**
 * Queen Adaptive Micro-Lane Dispatcher Runner
 *
 * Usage:
 *   node tools/queen/adaptive-scheduler.mjs status
 *   node tools/queen/adaptive-scheduler.mjs inspect
 *   node tools/queen/adaptive-scheduler.mjs drain [--dry-run] [--max=<n>]
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { freemem, totalmem, homedir } from 'node:os';
import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const estateRoot = process.env.STARLIGHT_ESTATE_ROOT || join(homedir(), 'starlight');
const inboxRoot = join(estateRoot, 'queen', 'inbox');

function getLane() {
  const freeGiB = Math.round((freemem() / (1024 ** 3)) * 10) / 10;
  const totalGiB = Math.round((totalmem() / (1024 ** 3)) * 10) / 10;
  let lane = 'micro';
  if (freeGiB >= 4.0) lane = 'high';
  else if (freeGiB >= 1.8) lane = 'medium';
  return { freeGiB, totalGiB, lane };
}

function inspectHeld() {
  if (!existsSync(inboxRoot)) return { total: 0, categories: [], cards: [] };
  const entries = readdirSync(inboxRoot, { withFileTypes: true });
  const holdDirs = entries.filter(e => e.isDirectory() && e.name.startsWith('_hold'));
  const cards = [];
  const categories = [];

  for (const d of holdDirs) {
    const dir = join(inboxRoot, d.name);
    const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.endsWith('.reason.txt'));
    categories.push({ name: d.name, count: files.length });
    for (const f of files) {
      try {
        const full = join(dir, f);
        const data = JSON.parse(readFileSync(full, 'utf8'));
        const repairable = (!data.prompt && (data.what || data.do)) || !data.agent || !data.repo;
        cards.push({ id: data.id || f.replace('.json', ''), category: d.name, path: full, repairable, data });
      } catch {}
    }
  }
  return { total: cards.length, categories, cards };
}

const action = process.argv[2] || 'status';
const dryRun = process.argv.includes('--dry-run');

console.log('══════════════════════════════════════════════════════════════════');
console.log('  STARLIGHT QUEEN ADAPTIVE MICRO-LANE DISPATCHER');
console.log('══════════════════════════════════════════════════════════════════');

const { freeGiB, totalGiB, lane } = getLane();
console.log(`Memory State: ${freeGiB} GiB free / ${totalGiB} GiB total`);
console.log(`Adaptive Lane: ${lane.toUpperCase()}-LANE ACTIVE`);

if (action === 'status') {
  const { total, categories } = inspectHeld();
  console.log(`\nHeld Queue Summary: ${total} held tasks across ${categories.length} buckets`);
  for (const c of categories) console.log(`  • ${c.name}: ${c.count} cards`);
} else if (action === 'inspect') {
  const { total, categories, cards } = inspectHeld();
  console.log(`\nDetailed Held Cards (${total}):`);
  for (const c of cards) {
    const mark = c.repairable ? '⚙ (auto-repairable)' : '🔒 (policy-gated)';
    console.log(`  - [${c.category}] ${c.id} ${mark}`);
  }
} else if (action === 'drain') {
  const { cards } = inspectHeld();
  const repairable = cards.filter(c => c.category === '_hold-admission' && c.repairable);
  console.log(`\nFound ${repairable.length} auto-repairable admission cards.`);
  let repaired = 0;
  for (const c of repairable) {
    const raw = c.data;
    if (!raw.prompt && (raw.what || raw.do)) {
      raw.prompt = `Task: ${raw.what || ''}\n\nContext:\n${raw.why || ''}\n\nExecution:\n${raw.do || ''}`;
    }
    if (!raw.agent) raw.agent = 'codex';
    if (!raw.repo) raw.repo = 'Starlight-Intelligence-System';

    if (!dryRun) {
      writeFileSync(c.path, JSON.stringify(raw, null, 2) + '\n', 'utf8');
      const target = join(inboxRoot, `${c.id}.json`);
      renameSync(c.path, target);
      const r = c.path + '.reason.txt';
      if (existsSync(r)) { try { unlinkSync(r); } catch {} }
      console.log(`  ✓ Repaired and promoted: ${c.id}`);
    } else {
      console.log(`  [DRY-RUN] Would repair and promote: ${c.id}`);
    }
    repaired++;
  }
  console.log(`\nCompleted: ${repaired} cards ${dryRun ? 'evaluated' : 'drained into active inbox'}.`);
}
console.log('══════════════════════════════════════════════════════════════════\n');
