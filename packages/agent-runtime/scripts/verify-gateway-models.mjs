#!/usr/bin/env node
/**
 * Verify the estate's Gateway model ids against the LIVE catalog.
 *
 * The vendor table in `src/model.ts` names four model ids the estate spends money on. A unit
 * test cannot check that those ids still exist: asserting a constant against an identical
 * constant proves only that the file was not edited. This script asks the Gateway's own catalog
 * and fails when an id is absent, which is the real failure mode — a vendor retiring a model,
 * or the id being wrong in the first place.
 *
 * Usage:
 *   node scripts/verify-gateway-models.mjs
 *
 * Exit codes: 0 every id is served, 1 at least one is missing, 2 the catalog could not be read.
 */
import { SUPPORTED_VENDORS } from '../dist/model.js';

const CATALOG_URL = 'https://ai-gateway.vercel.sh/v1/models';

let payload;
try {
  const response = await fetch(CATALOG_URL, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    console.error(`Gateway catalog returned HTTP ${response.status}.`);
    process.exit(2);
  }
  payload = await response.json();
} catch (error) {
  console.error(`Could not read the Gateway catalog: ${error.message}`);
  process.exit(2);
}

const ids = new Set((payload?.data ?? []).map(entry => entry.id));
console.log(`Gateway catalog: ${ids.size} models available.`);

const missing = [];
for (const [vendor, modelId] of Object.entries(SUPPORTED_VENDORS)) {
  if (ids.has(modelId)) {
    console.log(`  ok       ${vendor.padEnd(10)} ${modelId}`);
  } else {
    console.log(`  MISSING  ${vendor.padEnd(10)} ${modelId}`);
    missing.push(`${vendor} (${modelId})`);
  }
}

if (missing.length > 0) {
  console.error(`\n${missing.length} model id(s) are not served by the Gateway:`);
  for (const entry of missing) console.error(`  ${entry}`);
  process.exit(1);
}

console.log('\nEvery estate model id is served by the Gateway.');
