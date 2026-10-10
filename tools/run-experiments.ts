#!/usr/bin/env node
/**
 * tools/run-experiments.ts — Starlight CLI Experiment & Evaluation Runner
 *
 * Runs experiments and logs all traces, spans, and scores to Langfuse Cloud EU.
 *
 * Usage:
 *   npx tsx tools/run-experiments.ts [all|risk-evals|retrieval|arena]
 *
 * Built on SIP — sovereign experiment tier.
 */

import { runExperiments, telemetry } from '../src/index.js';

async function main() {
  const target = process.argv[2] || 'all';
  const diag = telemetry.getDiagnostic();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  STARLIGHT INTELLIGENCE SYSTEM — EXPERIMENT RUNNER');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Target:           ${target}`);
  console.log(`Langfuse Cloud:   ${diag.baseUrl} (${diag.region})`);
  console.log(`Telemetry Active: ${diag.active ? 'YES (connected)' : 'NO (offline mock mode)'}`);
  console.log(`Substrate:        SIP-v8.3.0 (${diag.release})`);
  console.log('───────────────────────────────────────────────────────────\n');

  const start = Date.now();
  const report = await runExperiments(target);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`[✓] Experiment execution completed in ${elapsed}s`);
  console.log(JSON.stringify(report, null, 2));

  if (telemetry.active) {
    console.log('\nFlushing traces to Langfuse Cloud EU...');
    await telemetry.flush();
    await telemetry.shutdown();
    console.log('[✓] Flushed successfully.');
  }
}

main().catch((err) => {
  console.error('[!] Experiment runner failed:', err);
  process.exit(1);
});
