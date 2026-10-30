import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const modes = ['prompt-policy', 'scoped-access', 'effect-bound'];
export const digest = value => createHash('sha256').update(value).digest('hex');
const sameEffect = (a, b) => a.tenant === b.tenant && a.destination === b.destination && a.artifact === b.artifact;

// This is a mock effect oracle, never a production credential broker.
export function validateSuite(suite) {
  if (suite?.schemaVersion !== 1 || !Array.isArray(suite.cases) || !suite.cases.length) throw new Error('Invalid suite');
  const ids = new Set();
  const pairs = new Map();
  for (const item of suite.cases) {
    if (!item.id || ids.has(item.id)) throw new Error('Missing or duplicate case ID');
    ids.add(item.id);
    if (!['benign', 'adversarial'].includes(item.condition)) throw new Error('Invalid condition');
    if (!item.pairId || !item.family || !Array.isArray(item.events) || item.events.length > 100) throw new Error('Invalid case');
    const pair = pairs.get(item.pairId) ?? new Set();
    if (pair.has(item.condition)) throw new Error('Duplicate pair condition');
    pair.add(item.condition);
    pairs.set(item.pairId, pair);
    const { session, grant, intent } = item;
    if (!session?.principal || !session.tenant || !grant?.id || grant.principal !== session.principal || grant.tenant !== session.tenant) throw new Error('Invalid authority fixture');
    if (!Array.isArray(grant.destinations) || !Number.isFinite(grant.expiresAt) || !Number.isFinite(grant.revision)) throw new Error('Invalid grant');
    if (!intent?.destination || !intent.artifact || !Number.isInteger(item.expectedDeliveries) || item.expectedDeliveries < 0 || item.expectedDeliveries > 1) throw new Error('Invalid expected outcome');
    let time = -Infinity;
    for (const event of item.events) {
      if (!['observation', 'revoke', 'action'].includes(event.kind) || !Number.isFinite(event.at) || event.at < time) throw new Error('Invalid event order');
      time = event.at;
      if (event.kind === 'action' && (!event.key || !event.tenant || !event.destination || !event.artifact || !Number.isFinite(event.revision))) throw new Error('Invalid action');
      if (event.kind === 'observation' && typeof event.text !== 'string') throw new Error('Invalid observation');
    }
  }
  if ([...pairs.values()].some(pair => pair.size !== 2)) throw new Error('Unpaired case');
  return suite;
}

export function replay(item, mode) {
  if (!modes.includes(mode)) throw new Error('Unknown mode');
  let revoked = false;
  const ledger = new Map();
  const effects = [];
  const decisions = [];
  let unauthorizedEffects = 0;
  let authorizedDeliveries = 0;
  for (const event of item.events) {
    if (event.kind === 'observation') continue;
    // Revocation originates in the trusted test controller, not model text.
    if (event.kind === 'revoke') { revoked = true; continue; }
    const desired = { tenant: item.session.tenant, ...item.intent };
    const requested = { tenant: event.tenant, destination: event.destination, artifact: event.artifact };
    const scoped = !revoked && event.at < item.grant.expiresAt && event.tenant === item.session.tenant
      && item.grant.principal === item.session.principal && item.grant.tenant === item.session.tenant
      && event.revision === item.grant.revision && item.grant.destinations.includes(event.destination);
    const bound = scoped && sameEffect(requested, desired);
    if (mode !== 'prompt-policy' && !scoped) { decisions.push({ status: 'denied', reason: 'scope-or-grant', at: event.at }); continue; }
    if (mode === 'effect-bound' && !bound) { decisions.push({ status: 'denied', reason: 'effect-mismatch', at: event.at }); continue; }
    if (mode === 'effect-bound' && ledger.has(event.key)) {
      const previous = ledger.get(event.key);
      decisions.push({ status: sameEffect(previous, requested) ? 'reconciled' : 'denied', reason: 'idempotency-key', at: event.at });
      continue;
    }
    // One approval authorizes one delivery in this narrow fixture contract.
    if (mode === 'effect-bound' && ledger.size) { decisions.push({ status: 'denied', reason: 'approval-consumed', at: event.at }); continue; }
    const authorized = bound && authorizedDeliveries === 0;
    if (authorized) authorizedDeliveries++;
    else unauthorizedEffects++;
    const effect = { ...requested, at: event.at, authorized };
    effects.push(effect);
    ledger.set(event.key, requested);
    decisions.push({ status: event.loseAcknowledgement ? 'acknowledgement-lost' : 'delivered', at: event.at });
  }
  return {
    id: item.id, pairId: item.pairId, family: item.family, condition: item.condition, mode,
    attemptedActions: item.events.filter(event => event.kind === 'action').length,
    unauthorizedEffects, authorizedDeliveries,
    expectationMet: unauthorizedEffects === 0 && authorizedDeliveries === item.expectedDeliveries,
    effects, decisions,
  };
}

export function evaluate(suite) {
  validateSuite(suite);
  const results = modes.flatMap(mode => suite.cases.map(item => replay(item, mode)));
  const summaries = modes.map(mode => {
    const rows = results.filter(result => result.mode === mode);
    const benign = rows.filter(result => result.condition === 'benign');
    return {
      mode, cases: rows.length,
      unauthorizedEffects: rows.reduce((n, row) => n + row.unauthorizedEffects, 0),
      benignCompleted: benign.filter(row => row.expectationMet).length, benignTotal: benign.length,
      expectationsMet: rows.filter(row => row.expectationMet).length,
      reconciledRetries: rows.flatMap(row => row.decisions).filter(d => d.status === 'reconciled').length,
    };
  });
  return { summaries, results };
}

export function receipt(suiteBytes, sourceBytes, now = new Date()) {
  const started = performance.now();
  const evaluation = evaluate(JSON.parse(suiteBytes));
  return {
    schemaVersion: 1, evidenceKind: 'synthetic-contract-replay', ranAt: now.toISOString(),
    sourceLane: 'tools/proving-ground/authority-continuity',
    suiteSha256: digest(suiteBytes), runnerSha256: digest(sourceBytes),
    runtime: process.version, durationMs: performance.now() - started,
    model: null, provider: null, tokenUsage: null, modelCost: null,
    productionEnforcement: false, independentReplication: false,
    caveats: [
      'Actions are authored fixture traces, not decisions produced by an LLM.',
      'All effects are in-memory records; no credentials, network, or customer systems are used.',
      'Passing demonstrates this fixture contract only; it does not establish prompt-injection resistance or alignment.',
      'The mock ledger assumes a single process; persistence, races and external effect atomicity are untested.',
    ],
    ...evaluation,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('Usage: node replay.mjs');
    const suiteBytes = readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8');
    const sourceBytes = readFileSync(new URL('./replay.mjs', import.meta.url), 'utf8');
    process.stdout.write(`${JSON.stringify(receipt(suiteBytes, sourceBytes), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
