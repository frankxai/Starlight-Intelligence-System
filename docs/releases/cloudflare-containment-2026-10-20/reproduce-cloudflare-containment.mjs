#!/usr/bin/env node
// Reproduce the reviewed emergency containment port without cloud access.
// Input must be the exact normalized original bundle recorded in the receipt.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw Error('Usage: node reproduce-cloudflare-containment.mjs original-deployed.mjs candidate.mjs');
const hash = s => createHash('sha256').update(s).digest('hex');
let source = await readFile(input);
assert.equal(hash(source), '3253fd648d945fd7df6df2804b8559ebbf89fd0e8dc0699a1bec982841884047', 'Unexpected original bundle; inspect instead of patching another revision');
// Byte ranges apply only to the pinned digest; reverse order preserves offsets.
const edits = [
  [
    38522,
    39015,
    "  async fetch(_request) {\n    return new Response(JSON.stringify({\n      error: \"Service Unavailable\",\n      code: \"swarm_coordinator_unavailable\",\n      message: \"Swarm coordination unavailable: verified identity and durable lease arbitration are not configured.\"\n    }), {\n      status: 503,\n      headers: { \"Content-Type\": \"application/json\", \"Cache-Control\": \"no-store\" }\n"
  ],
  [
    25532,
    25866,
    "  static resolveTenant() {\n    // Reviewed mainline containment: no identity/membership authority is wired.\n    return null;\n"
  ],
  [
    22168,
    22309,
    "        error: \"Service Unavailable\",\n        code: \"protected_api_unavailable\",\n        message: \"Protected API unavailable: verified identity and tenant membership are not configured.\"\n      }), { status: 503, headers: { ...this.CORS_HEADERS, \"Cache-Control\": \"no-store\" } });\n"
  ],
  [
    21971,
    22106,
    "    const tenant = this.resolveTenant();\n"
  ],
  [
    21690,
    21750,
    "    if (!authHeader || !/^Bearer\\s+\\S+$/i.test(authHeader)) {\n"
  ],
  [
    21193,
    21193,
    "        protectedApi: {\n          status: \"unavailable\",\n          reason: \"identity_membership_verifier_missing\"\n        },\n"
  ]
];
for (const [start, end, replacement] of edits) {
  source = Buffer.concat([source.subarray(0, start), Buffer.from(replacement), source.subarray(end)]);
}
assert.equal(hash(source), '6683f6a82379f1f395ecf789dfaeffd81873a0e961d17e5db4470905ebf67577', 'Candidate digest mismatch');
await writeFile(output, source, { flag: 'wx' });
console.log('Containment candidate reproduced: 6683f6a82379f1f395ecf789dfaeffd81873a0e961d17e5db4470905ebf67577');
