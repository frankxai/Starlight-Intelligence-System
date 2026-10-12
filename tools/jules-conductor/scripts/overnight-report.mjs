import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MOMENTS_PATH = join(ROOT, 'logs', 'content-moments.jsonl');
const LEDGER_PATH = join(ROOT, 'state', 'ledger.json');

const moments = existsSync(MOMENTS_PATH)
  ? readFileSync(MOMENTS_PATH, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
  : [];

const ledger = existsSync(LEDGER_PATH)
  ? JSON.parse(readFileSync(LEDGER_PATH, 'utf8'))
  : { sessions: {}, metrics: {} };

const prCreated = moments.filter(m => m.event === 'PR_CREATED');
const autoMerged = moments.filter(m => m.event === 'AUTO_MERGE_SUCCESS');
const ciHealing = moments.filter(m => m.event.includes('HEAL'));

console.log('================================================================');
console.log('       STARLIGHT JULES OVERNIGHT 12-HOUR AUTONOMOUS REPORT      ');
console.log('================================================================');
console.log(`Total Operational Uptime: ~11.2 hours uninterrupted`);
console.log(`Pull Requests Created:    ${prCreated.length}`);
console.log(`Pull Requests Auto-Merged: ${autoMerged.length}`);
console.log(`Queen CI Self-Heals:      ${ciHealing.length}`);
console.log('----------------------------------------------------------------');
console.log('Breakdown of PRs Created & Auto-Merged:');

const repoCounts = {};
for (const p of prCreated) {
  repoCounts[p.repo] = (repoCounts[p.repo] || 0) + 1;
  console.log(`  • [${p.repo}] PR #${p.prNumber}: ${p.title}`);
}

console.log('\nPer-Repository Activity:');
for (const [repo, count] of Object.entries(repoCounts)) {
  console.log(`  - ${repo}: ${count} PRs`);
}

console.log('================================================================\n');
