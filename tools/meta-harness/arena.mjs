/**
 * arena.mjs — Multi-Agent Tournament & Maker ≠ Checker Engine for Starlight Meta-Harness
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runArena(options = {}) {
  const task = options.task || 'Autonomous Meta-Harness Optimization';
  const repo = options.repo || 'repos/Starlight-Intelligence-System';

  const argv = [process.argv[0], path.resolve(__dirname, '..', 'arena', 'queen-tournament.mjs'), `--topic=${task}`, `--repo=${repo}`];
  if (options.dryRun) {
    argv.push('--dry-run');
  }

  process.argv = argv;
  await import('../arena/queen-tournament.mjs');
}
