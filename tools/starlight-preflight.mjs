#!/usr/bin/env node
/**
 * Starlight Preflight — Fast Local Sentinel Gate
 *
 * Runs lint, typecheck, and unit tests locally in seconds before git push.
 * Prevents broken commits from burning cloud GitHub Actions minutes or Vercel builds.
 *
 * Usage:
 *   node tools/starlight-preflight.mjs [--quick]
 */

import { execSync, spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const isQuick = process.argv.includes('--quick');
const start = performance.now();

console.log('\n🌟 Starlight Preflight — Shift-Left Local Sentinel Gate');
console.log('───────────────────────────────────────────────────────');

function runStep(name, command, args = []) {
  const stepStart = performance.now();
  process.stdout.write(`⏳ Running ${name}... `);
  try {
    const output = execSync(`${command} ${args.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000,
    });
    const duration = ((performance.now() - stepStart) / 1000).toFixed(2);
    console.log(`✅ PASS (${duration}s)`);
    return { ok: true, duration, output };
  } catch (err) {
    const duration = ((performance.now() - stepStart) / 1000).toFixed(2);
    console.log(`❌ FAIL (${duration}s)`);
    if (err.stdout) console.log(err.stdout.trim());
    if (err.stderr) console.error(err.stderr.trim());
    return { ok: false, duration, error: err };
  }
}

const results = [];

// Step 1: Typecheck / Lint
results.push(runStep('TypeScript Typecheck', 'npm', ['run', 'lint']));

// Step 2: Unit tests
if (isQuick) {
  results.push(runStep('Fast Continuity Tests', 'node', ['--import', 'tsx', '--test', 'test/context-bridge.test.ts', 'test/context-continuity.test.ts']));
} else {
  results.push(runStep('Continuity Test Suite', 'node', [
    '--import', 'tsx',
    '--test',
    'test/context-bridge.test.ts',
    'test/context-continuity.test.ts',
    'test/review-queue.test.ts',
    'test/gateway-lock-safety.test.ts',
  ]));
}

// Summary
const totalDuration = ((performance.now() - start) / 1000).toFixed(2);
console.log('───────────────────────────────────────────────────────');

const failed = results.filter(r => !r.ok);
if (failed.length === 0) {
  console.log(`🎉 ALL PREFLIGHT CHECKS PASSED in ${totalDuration}s!`);
  console.log('🚀 Ready to push or open PR with confidence. Cloud CI spend: $0.00.\n');
  process.exit(0);
} else {
  console.error(`💥 ${failed.length} check(s) failed in ${totalDuration}s. Fix locally before pushing!\n`);
  process.exit(1);
}
