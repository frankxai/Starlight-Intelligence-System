/**
 * scripts/test-langfuse.ts — Verification script for Starlight Langfuse Cloud (EU) connection.
 *
 * Usage:
 *   npx tsx scripts/test-langfuse.ts
 */

import { StarlightTelemetry, telemetry } from '../src/telemetry/index.js';

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Starlight Langfuse Cloud (EU) Diagnostic & Verification');
  console.log('═══════════════════════════════════════════════════════════');

  const diag = telemetry.getDiagnostic();
  console.log(`Base URL:            ${diag.baseUrl}`);
  console.log(`Region:              ${diag.region}`);
  console.log(`Public Key Present:  ${Boolean(diag.publicKeyPreview)} ${diag.publicKeyPreview ? `(${diag.publicKeyPreview})` : ''}`);
  console.log(`Secret Key Present:  ${diag.secretKeyConfigured}`);
  console.log(`Release:             ${diag.release}`);
  console.log(`Environment:         ${diag.environment}`);
  console.log(`Telemetry Active:    ${diag.active ? 'YES' : 'NO (fallback mock mode)'}`);
  console.log('───────────────────────────────────────────────────────────\n');

  if (!diag.active) {
    console.log('[i] Langfuse credentials not detected in environment.');
    console.log('Testing offline mock trace pipeline to verify zero-throw invariant...');

    const mockTrace = telemetry.traceAgent({
      name: 'starlight-telemetry-mock-handshake',
      sessionId: `test-mock-${Date.now()}`,
      metadata: { source: 'Antigravity Verification', status: 'operational' },
      tags: ['mock', 'handshake', 'eu-cloud'],
    });

    const span = mockTrace.span({
      name: 'disk-telemetry-check',
      input: { status: 'gate_open' },
      output: { result: 'passed' },
    });
    span.end();

    mockTrace.score({
      name: 'mock_handshake_score',
      value: 1.0,
      comment: 'Mock trace pipeline completed flawlessly',
    });

    console.log('[✓] Offline mock telemetry executed safely (no exceptions thrown).');
    console.log('\nTo connect to live Langfuse Cloud EU (Frankfurt data region):');
    console.log('1. Go to https://cloud.langfuse.com (EU Frankfurt region by default)');
    console.log('2. Create an API Key in your project settings');
    console.log('3. Set the following environment variables:');
    console.log('   $env:LANGFUSE_PUBLIC_KEY = "pk-lf-..."');
    console.log('   $env:LANGFUSE_SECRET_KEY = "sk-lf-..."');
    console.log('   $env:LANGFUSE_BASEURL = "https://cloud.langfuse.com" # or https://eu.cloud.langfuse.com');
    return;
  }

  console.log('[+] Live telemetry active. Sending test trace to Langfuse Cloud EU...');

  const trace = telemetry.traceAgent({
    name: 'starlight-telemetry-live-handshake',
    sessionId: `test-live-${Date.now()}`,
    metadata: {
      source: 'Antigravity Session',
      status: 'operational',
      region: 'EU-Cloud',
    },
    tags: ['test', 'handshake', 'eu-cloud', 'live'],
  });

  if (trace) {
    const span = trace.span({
      name: 'handshake-span',
      input: { ping: 'starlight-sis' },
      output: { pong: 'langfuse-eu-cloud' },
    });
    span.end();

    trace.score({
      name: 'handshake_score',
      value: 1.0,
      comment: 'Live handshake verified',
    });
  }

  await telemetry.flush();
  console.log('[✓] Test trace flushed to Langfuse Cloud EU successfully!');
  await telemetry.shutdown();
}

main().catch((err) => {
  console.error('Fatal error testing Langfuse:', err);
  process.exit(1);
});
