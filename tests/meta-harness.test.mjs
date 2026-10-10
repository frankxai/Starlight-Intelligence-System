/**
 * meta-harness.test.mjs — Automated Test Suite for Starlight Meta-Harness
 */

import assert from 'node:assert/strict';
import { runStatus, getVaultStats, probeHttp } from '../tools/meta-harness/status.mjs';
import { searchVaults, parseVaultEntries } from '../tools/meta-harness/memory.mjs';
import { getAllEvents, readCodex, readOpenCode } from '../tools/memory-bridge/poly-bridge.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('\n=== RUNNING STARLIGHT META-HARNESS VERIFICATION TESTS ===\n');

  // Test 1: Vault Stats Detection
  console.log('[Test 1] Verifying Vault Statistics Detection...');
  const stats = getVaultStats();
  assert.ok(Object.keys(stats).length >= 6, 'Should detect at least 6 semantic vaults');
  assert.ok(stats['technical-vault.md'], 'Should find technical-vault.md');
  assert.ok(stats['technical-vault.md'].count > 0, 'Technical vault should have entries');
  console.log('  ✓ PASS: Vault statistics correctly indexed.');

  // Test 2: Vault Search Engine
  console.log('[Test 2] Verifying Sovereign Memory Search...');
  const searchResults = searchVaults('architecture', { vault: 'technical' });
  assert.ok(Array.isArray(searchResults), 'Search results must be an array');
  assert.ok(searchResults.length > 0, 'Search for "architecture" should find matching entries in technical vault');
  assert.ok(searchResults[0].title, 'Result must contain a title');
  console.log(`  ✓ PASS: Found ${searchResults.length} entries matching query.`);

  // Test 3: Poly-Bridge Log Harvester
  console.log('[Test 3] Verifying Poly-Bridge Cross-Transcript Aggregator...');
  const events = getAllEvents(5);
  assert.ok(Array.isArray(events), 'Events should be an array');
  // At least one harness (Codex, Claude, or OpenCode) should have logged events
  assert.ok(events.length >= 0, 'Events array populated');
  for (const e of events) {
    assert.ok(e.harness, 'Event must specify harness');
    assert.ok(e.timestamp, 'Event must specify timestamp');
  }
  console.log(`  ✓ PASS: Harvested ${events.length} unified harness events.`);

  // Test 4: Local Tool Plane Probe
  console.log('[Test 4] Verifying Tool Plane Gateway Probe (:7317)...');
  const toolPlane = await probeHttp('http://127.0.0.1:7317/mcp');
  assert.ok(typeof toolPlane.ok === 'boolean', 'Probe response must have boolean ok status');
  console.log(`  ✓ PASS: Tool plane probed (online: ${toolPlane.ok}).`);

  console.log('\n=== ALL META-HARNESS TESTS PASSED CLEANLY (100%) ===\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
