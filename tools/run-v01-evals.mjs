#!/usr/bin/env node
/**
 * Track D v0.1 — eval aggregator
 *
 * Runs all 7 risk-dimension evals sequentially and prints a summary table.
 * Exits non-zero if any eval fails.
 *
 * Built on SIP — operational tier, Track D
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVALS_DIR = resolve(__dirname, '..', 'test', 'v01-evals');

const evals = readdirSync(EVALS_DIR)
  .filter((f) => f.endsWith('.test.ts'))
  .sort();

console.log(`\n── Track D v0.1 — 7 risk-dimension evals (${evals.length} files) ──\n`);

const summary = [];
let totalPass = 0;
let totalFail = 0;
let totalTodo = 0;
let anyFail = false;

for (const file of evals) {
  const path = join(EVALS_DIR, file);
  const start = Date.now();
  const r = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--test', '--test-reporter=tap', path],
    { encoding: 'utf-8' },
  );
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  const out = r.stdout + r.stderr;
  const pass = (out.match(/^# pass (\d+)/m) ?? [])[1] ?? '0';
  const fail = (out.match(/^# fail (\d+)/m) ?? [])[1] ?? '0';
  const todo = (out.match(/^# todo (\d+)/m) ?? [])[1] ?? '0';
  const status = r.status === 0 ? 'PASS' : 'FAIL';
  if (r.status !== 0) anyFail = true;
  totalPass += Number(pass);
  totalFail += Number(fail);
  totalTodo += Number(todo);
  summary.push({ file, status, pass, fail, todo, elapsed });
  console.log(
    `  ${status === 'PASS' ? 'OK  ' : 'FAIL'}  ${file.padEnd(40)}  ${pass}/${Number(pass) + Number(fail)} pass, ${todo} todo (${elapsed}s)`,
  );
  if (r.status !== 0) {
    console.log('\n──── failure output ────');
    process.stdout.write(out);
    console.log('────────────────────────\n');
  }
}

console.log(`\nTotal: ${totalPass} pass · ${totalFail} fail · ${totalTodo} todo across ${evals.length} evals\n`);

process.exit(anyFail ? 1 : 0);
