#!/usr/bin/env node
// Read-only advice over the existing work-graph projection. No admission or execution.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const proofs = ['artifact', 'change', 'checks', 'deployment', 'verification'];
const actions = {
  artifact: { role: 'builder', action: 'produce-artifact', evidence: 'Scoped artifact with acceptance checks and recovery notes.' },
  change: { role: 'builder', action: 'open-change', evidence: 'Draft PR or change reference linked to this work ID.' },
  checks: { role: 'reviewer', action: 'verify-change', evidence: 'Required checks and independent review for the exact current revision.' },
  deployment: { role: 'release-owner', action: 'verify-production-exposure', evidence: 'Authorized production release, served revision and exposure evidence; a READY build alone is insufficient.' },
  verification: { role: 'verifier', action: 'verify-user-outcome', evidence: 'Relevant user journey checked against the delivered revision; record limitations.' },
};

export function nextAction(projection, workId, { reviewWaiting = 0, reviewCapacity = 1 } = {}) {
  if (!projection || !Array.isArray(projection.workItems) || !Array.isArray(projection.issues)) throw Error('Expected work-graph project output');
  if (typeof workId !== 'string' || !workId.trim()) throw Error('A work ID is required');
  if (!Number.isSafeInteger(reviewWaiting) || reviewWaiting < 0 || !Number.isSafeInteger(reviewCapacity) || reviewCapacity < 1) throw Error('Invalid review capacity');
  const result = (role, action, evidence) => ({ workId, advisoryOnly: true, role, action, evidence });
  // A corrupt or conflicted projection is not a source from which to infer completion.
  if (projection.issues.length) return result('operator', 'repair-evidence', 'Resolve projection issues before relying on its proof state.');
  const items = projection.workItems.filter((item) => item.workId === workId);
  if (!items.length) return result('operator', 'locate-work', 'Locate the existing authorized work item; this command cannot create or admit it.');
  if (items.length !== 1) throw Error('Duplicate work ID in projection');
  const item = items[0];
  for (const key of ['admitted', 'blocked', 'completed', 'readyToComplete']) if (typeof item[key] !== 'boolean') throw Error(`Missing boolean ${key}`);
  if (!Array.isArray(item.missingProofs) || new Set(item.missingProofs).size !== item.missingProofs.length || item.missingProofs.some((p) => !proofs.includes(p))) throw Error('Invalid missing proofs');
  if (item.blocked) return result('owner', 'resolve-blocker', 'Record a bounded blocker and the required owner action; do not retry unchanged.');
  if (!item.admitted) return result('operator', 'await-admission', 'Use existing admission controls; imported intent and this recommendation do not authorize execution.');
  if (item.completed && (item.missingProofs.length || !item.readyToComplete)) throw Error('Inconsistent completion state');
  if (item.readyToComplete && item.missingProofs.length) throw Error('Inconsistent proof state');
  if (item.completed) return result('service-owner', 'observe-outcome', 'Review product outcome, incidents and repair effort; do not reopen or spawn work automatically.');
  if (item.missingProofs.includes('artifact') && reviewWaiting >= reviewCapacity) return result('reviewer', 'clear-review-queue', 'Finish or reconcile queued reviews before starting additional implementation; do not interrupt an active mutation.');
  for (const proof of proofs) if (item.missingProofs.includes(proof)) {
    const { role, action, evidence } = actions[proof];
    return result(role, action, evidence);
  }
  if (!item.readyToComplete) return result('operator', 'reconcile-state', 'The projection is not ready despite having no missing proofs.');
  return result('owner', 'record-completion', 'Use the existing authorized completion path. Confirm evidence freshness and scope first; this command writes nothing.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [, , file, workId, waiting = '0', capacity = '1'] = process.argv;
    if (!file || !workId || process.argv.length > 6) throw Error('Usage: agent-next-action.mjs PROJECTION.json WORK_ID [REVIEW_WAITING] [REVIEW_CAPACITY]');
    const output = nextAction(JSON.parse(readFileSync(file, 'utf8')), workId, { reviewWaiting: Number(waiting), reviewCapacity: Number(capacity) });
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Agent delivery advice: ${error.message}\n`);
    process.exitCode = 1;
  }
}
