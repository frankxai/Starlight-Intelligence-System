import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isInflight } from '../conductor.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ledger = JSON.parse(readFileSync(join(root, 'state', 'ledger.json'), 'utf8'));
const now = Date.parse('2026-10-17T12:00:00.000Z');

test('finished owned sessions stay out of the in-flight cap', () => {
  const landmarks = ledger.sessions['1664111359674067715'];
  const guardian = ledger.sessions['3546132594215418190'];
  const verticals = ledger.sessions['609243126188726697'];
  assert.equal(landmarks.status, 'Completed');
  assert.equal(landmarks.accepted, true);
  assert.equal(landmarks.merged, false);
  assert.equal(isInflight(landmarks, now), false);
  assert.equal(guardian.status, 'Completed');
  assert.equal(guardian.accepted, false);
  assert.equal(guardian.merged, false);
  assert.equal(isInflight(guardian, now), false);
  assert.equal(verticals.status, 'Completed');
  assert.equal(verticals.accepted, true);
  assert.equal(verticals.merged, false);
  assert.equal(isInflight(verticals, now), false);
  const owned = Object.values(ledger.sessions).filter((session) => session.owned === true && isInflight(session, now));
  assert.equal(owned.some((session) => session.id === '1664111359674067715'), false);
  assert.equal(owned.some((session) => session.id === '3546132594215418190'), false);
});

test('a fresh planning session counts and a completed one does not', () => {
  const fresh = { status: 'Planning', lastSeen: '2026-10-17T11:00:00.000Z', owned: true };
  const stale = { status: 'Planning', lastSeen: '2026-10-17T00:00:00.000Z', owned: true };
  assert.equal(isInflight(fresh, now), true);
  assert.equal(isInflight(stale, now), false);
  assert.equal(isInflight({ status: 'Completed', lastSeen: '2026-10-17T11:30:00.000Z', owned: true }, now), false);
});
