#!/usr/bin/env node
// Explicit operator-only snapshot. The public atlas never imports this output.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectPortfolio } from '../tools/graph-adoption/core.mjs';

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--estate-root' || !args[1]) {
  console.error('Usage: node scripts/snapshot-graph-atlas.mjs --estate-root <explicit-repositories-root>');
  process.exitCode = 2;
} else {
  const report = inspectPortfolio(args[1]);
  const target = resolve(fileURLToPath(new URL('../estate.graph-adoption.local.json', import.meta.url)));
  writeFileSync(target, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify({ ok: true, output: 'estate.graph-adoption.local.json', ...report.totals }));
}
