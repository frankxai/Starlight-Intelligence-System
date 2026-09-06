import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CommunityLedger, fixtureCommunityAdapter as adapter, planCommunityAction, validateCommunityEvent } from '../src/community.ts';
import type { CommunityConsent, CommunityEvent, CommunityEventKind } from '../src/community.ts';

const consent: CommunityConsent[] = [{ communityId: 'builders', memberId: 'member-1', processing: true, memory: true, public: true }];
function event(kind: CommunityEventKind = 'intake', overrides: Partial<CommunityEvent> = {}): CommunityEvent {
  return { version: 1, id: kind, communityId: 'builders', memberId: 'member-1', cellId: 'cell-1', loopId: 'week-1',
    source: 'native-fixture', sourceUri: 'https://example.org/evidence', correlationId: 'weekly-loop',
    causationId: null, idempotencyKey: kind, occurredAt: '2026-09-06T12:00:00.000Z', kind,
    privacy: 'community', consentBasis: 'explicit', objectId: `${kind}-1`, ...overrides };
}
function week(ledger = new CommunityLedger()) {
  let cause: string | null = null;
  for (const kind of ['intake', 'quest', 'commitment', 'artifact', 'reflection'] as const) {
    ledger.ingest(event(kind, { causationId: cause, privacy: kind === 'artifact' ? 'public' : 'community' }), adapter, consent);
    cause = kind;
  }
  return ledger;
}

test('one weekly creation loop yields artifact, reflection, and an honest scorecard', () => {
  const ledger = week();
  const score = ledger.scorecard('builders', 'week-1', consent);
  assert.equal(score.artifacts, 1);
  assert.equal(score.reflections, 1);
  assert.equal(score.completionRate, 1);
  assert.equal(score.retention, null);
  assert.equal(score.stewardCost, null);
  assert.deepEqual(ledger.scorecard('other', 'week-1', consent).members, 0);
});
test('replay is idempotent, while changed content with the same key or ID fails', () => {
  const ledger = week();
  assert.equal(ledger.ingest(event(), adapter, consent).status, 'duplicate');
  assert.throws(() => ledger.ingest(event('intake', { objectId: 'changed' }), adapter, consent), /collision/);
  assert.throws(() => ledger.ingest(event('intake', { idempotencyKey: 'other', objectId: 'changed' }), adapter, consent), /collision/);
  assert.equal(ledger.scorecard('builders', 'week-1', consent).members, 1);
});
test('fixed-field hashing ignores property order and callers cannot mutate retained events', () => {
  const ledger = new CommunityLedger();
  const input = event();
  ledger.ingest(input, adapter, consent);
  const reordered = Object.fromEntries(Object.entries(input).reverse());
  assert.equal(ledger.ingest(reordered, adapter, consent).status, 'duplicate');
  input.communityId = 'other';
  assert.equal(ledger.scorecard('builders', 'week-1', consent).members, 1);
});
test('untrusted raw messages, matching rationale, and extra fields are rejected', () => {
  for (const key of ['rawMessage', 'matchingRationale', 'email', 'payload']) {
    assert.throws(() => validateCommunityEvent({ ...event(), [key]: 'private material' }), /field/);
  }
});
test('source URI cannot carry credentials, query tokens, fragments, or non-HTTPS schemes', () => {
  for (const sourceUri of ['https://user:pass@example.org', 'https://example.org/?token=abc', 'https://example.org/#secret', 'file:///private', 'http://example.org']) {
    assert.throws(() => validateCommunityEvent(event('intake', { sourceUri })));
  }
});
test('schema rejects unsupported versions, malformed dates, missing fields, and unknown kinds', () => {
  for (const mutation of [{ version: 2 }, { occurredAt: '2026-02-30T00:00:00.000Z' }, { kind: 'publish' }, { id: '' }, { privacy: 'secret' }]) {
    assert.throws(() => validateCommunityEvent({ ...event(), ...mutation }));
  }
  const missing = { ...event() } as Record<string, unknown>;
  delete missing.objectId;
  assert.throws(() => validateCommunityEvent(missing));
});
test('processing consent is explicit, current, unique, and scoped to member and community', () => {
  const ledger = new CommunityLedger();
  assert.throws(() => ledger.ingest(event(), adapter, []), /consent/);
  assert.throws(() => ledger.ingest(event(), adapter, [{ ...consent[0], communityId: 'other' }]), /consent/);
  assert.throws(() => ledger.ingest(event(), adapter, [{ ...consent[0], processing: false }]), /consent/);
  assert.throws(() => ledger.ingest(event(), adapter, [...consent, ...consent]), /Ambiguous/);
  ledger.ingest(event(), adapter, consent);
  assert.throws(() => ledger.ingest(event(), adapter, []), /consent/);
});
test('capability and health mismatch create explicit fallbacks without consuming replay keys', () => {
  const ledger = new CommunityLedger();
  assert.equal(ledger.ingest(event(), { ...adapter, capabilities: [] }, consent).status, 'fallback');
  assert.equal(ledger.ingest(event(), { ...adapter, health: 'offline' }, consent).status, 'fallback');
  assert.equal(ledger.ingest(event(), adapter, consent).status, 'accepted');
  assert.throws(() => ledger.ingest(event('intake', { source: 'spoof' }), adapter, consent), /source mismatch/);
});
test('processing-only consent cannot stage a public event for later disclosure', () => {
  const ledger = new CommunityLedger();
  assert.throws(() => ledger.ingest(event('intake', { privacy: 'public' }), adapter,
    [{ ...consent[0], public: false }]), /sharing consent/);
  assert.equal(ledger.project('builders', 'public', consent).length, 0);
});
test('causality prevents cross-member, cross-cell, cross-loop, future, and skipped-stage references', () => {
  const ledger = new CommunityLedger();
  ledger.ingest(event(), adapter, consent);
  for (const patch of [{ cellId: 'cell-2' }, { loopId: 'week-2' }, { correlationId: 'other' }, { occurredAt: '2026-09-05T12:00:00.000Z' }]) {
    assert.throws(() => ledger.ingest(event('quest', { causationId: 'intake', ...patch }), adapter, consent), /cause/);
  }
  assert.throws(() => ledger.ingest(event('artifact', { causationId: 'intake' }), adapter, consent), /commitment/);
});
test('public/memory projections recheck consent and exclude private records and provenance URLs', () => {
  const ledger = week();
  ledger.ingest(event('peer-help', { causationId: 'intake', privacy: 'private' }), adapter, consent);
  assert.equal(ledger.project('builders', 'public', consent).length, 1);
  assert.equal(ledger.project('builders', 'memory', consent).length, 5);
  assert.equal(ledger.project('builders', 'public', [{ ...consent[0], public: false }]).length, 0);
  assert.equal(ledger.project('builders', 'memory', [{ ...consent[0], memory: false }]).length, 0);
  assert.equal(ledger.project('builders', 'memory', []).length, 0);
  assert.equal(ledger.project('other', 'public', consent).length, 0);
  assert.doesNotMatch(JSON.stringify(ledger.project('builders', 'public', consent)), /sourceUri|memberId|example.org|cellId/);
});
test('no action planner output can authorize execution', () => {
  assert.equal(planCommunityAction('draft-quest').mode, 'draft');
  for (const action of ['send', 'sanction', 'refund', 'credential', 'canon'] as const) {
    assert.deepEqual(planCommunityAction(action), { action, mode: 'human-review', executable: false });
  }
  assert.throws(() => planCommunityAction('unknown' as 'send'));
});
