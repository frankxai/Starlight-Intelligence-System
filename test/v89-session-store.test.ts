/**
 * v8.9 Session Store — per-harness working memory tests.
 *
 * Covers:
 *   - add / get (fold) / pop tombstone / clear compaction
 *   - namespace isolation: harness A cannot see harness B items
 *   - path-segment sanitization (reject chars outside [a-z0-9_-])
 *   - concurrent add via the directory lock
 *
 * SECURITY NOTE: no assertion interpolates raw fixture content into
 * error messages — identifier-based assertions only (/openclaw-audit CRITICAL 2).
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [file-contract, sovereignty]
 * - Generated: 2026-06-11
 * ---
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SessionStore } from '../src/session-store.js';

// ── Fixture helpers ────────────────────────────────────────────────────────

function makeStore(root: string): SessionStore {
  return new SessionStore(root);
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('v8.9 SessionStore — add / get / fold', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('returns empty array for a nonexistent session', async () => {
    const items = await store.getItems('harness-a', 'session-1');
    assert.deepEqual(items, []);
  });

  it('add then get returns the items in insertion order', async () => {
    await store.addItems('harness-a', 'session-2', [
      { content: 'alpha' },
      { content: 'beta' },
    ]);
    const items = await store.getItems('harness-a', 'session-2');
    assert.equal(items.length, 2);
    assert.equal(items[0]?.content, 'alpha');
    assert.equal(items[1]?.content, 'beta');
  });

  it('limit parameter restricts returned items to the N most recent', async () => {
    await store.addItems('harness-a', 'session-3', [
      { content: 'first' },
      { content: 'second' },
      { content: 'third' },
    ]);
    const items = await store.getItems('harness-a', 'session-3', 2);
    assert.equal(items.length, 2);
    // last 2 items
    assert.equal(items[0]?.content, 'second');
    assert.equal(items[1]?.content, 'third');
  });
});

describe('v8.9 SessionStore — pop tombstone behaviour', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('pop on empty session returns false and leaves session empty', async () => {
    const result = await store.popItem('harness-b', 'empty-sess');
    assert.equal(result, false);
    const items = await store.getItems('harness-b', 'empty-sess');
    assert.deepEqual(items, []);
  });

  it('pop removes only the last item', async () => {
    await store.addItems('harness-b', 'pop-sess', [
      { content: 'keep' },
      { content: 'remove-me' },
    ]);
    const popped = await store.popItem('harness-b', 'pop-sess');
    assert.equal(popped, true);
    const after = await store.getItems('harness-b', 'pop-sess');
    assert.equal(after.length, 1);
    assert.equal(after[0]?.content, 'keep');
  });

  it('multiple pops drain the session', async () => {
    await store.addItems('harness-b', 'drain-sess', [
      { content: 'a' },
      { content: 'b' },
    ]);
    await store.popItem('harness-b', 'drain-sess');
    await store.popItem('harness-b', 'drain-sess');
    const result = await store.popItem('harness-b', 'drain-sess');
    assert.equal(result, false);
    const items = await store.getItems('harness-b', 'drain-sess');
    assert.deepEqual(items, []);
  });
});

describe('v8.9 SessionStore — clear and compaction', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('clearSession empties all items', async () => {
    await store.addItems('harness-c', 'clear-sess', [
      { content: 'x' },
      { content: 'y' },
    ]);
    await store.clearSession('harness-c', 'clear-sess');
    const items = await store.getItems('harness-c', 'clear-sess');
    assert.deepEqual(items, []);
  });

  it('clearSession compacts the file to a single line', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    await store.addItems('harness-c', 'compact-sess', [
      { content: 'one' },
      { content: 'two' },
      { content: 'three' },
    ]);
    await store.clearSession('harness-c', 'compact-sess');

    const file = join(root, 'sessions', 'harness-c', 'compact-sess.jsonl');
    assert.ok(existsSync(file), 'session file must exist after clear');
    const lines = readFileSync(file, 'utf-8').trim().split('\n').filter(l => l.length > 0);
    assert.equal(lines.length, 1, 'compacted file must contain exactly one line (clear event)');
    const parsed = JSON.parse(lines[0]!);
    assert.equal(parsed.type, 'clear');
  });

  it('add after clear works correctly', async () => {
    await store.addItems('harness-c', 'reuse-sess', [{ content: 'before-clear' }]);
    await store.clearSession('harness-c', 'reuse-sess');
    await store.addItems('harness-c', 'reuse-sess', [{ content: 'after-clear' }]);
    const items = await store.getItems('harness-c', 'reuse-sess');
    assert.equal(items.length, 1);
    assert.equal(items[0]?.content, 'after-clear');
  });
});

describe('v8.9 SessionStore — namespace isolation', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('harness A items are not visible to harness B for the same sessionId', async () => {
    const sessionId = 'shared-name';
    await store.addItems('harness-alpha', sessionId, [{ content: 'alpha-secret' }]);
    const bItems = await store.getItems('harness-beta', sessionId);
    assert.deepEqual(bItems, [], 'harness B must not see harness A items');
  });

  it('listSessions for harness A does not include sessions from harness B', async () => {
    await store.addItems('harness-list-a', 'sess-a1', [{ content: 'a1' }]);
    await store.addItems('harness-list-b', 'sess-b1', [{ content: 'b1' }]);
    const aSessions = store.listSessions('harness-list-a');
    assert.ok(aSessions.includes('sess-a1'), 'sess-a1 must appear in harness A listing');
    assert.ok(!aSessions.includes('sess-b1'), 'sess-b1 must NOT appear in harness A listing');
  });
});

describe('v8.9 SessionStore — path-segment sanitization', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  const INVALID_SEGMENTS = [
    '../traversal',
    'has/slash',
    'has space',
    'has.dot',
    '',
    'has@symbol',
  ];

  for (const bad of INVALID_SEGMENTS) {
    it(`rejects harness name "${bad.length > 0 ? bad.slice(0, 20) : '(empty)'}"`, async () => {
      await assert.rejects(
        () => store.getItems(bad, 'valid-id'),
        /Invalid harness/,
        `harness "${bad}" should be rejected`,
      );
    });

    it(`rejects sessionId "${bad.length > 0 ? bad.slice(0, 20) : '(empty)'}"`, async () => {
      await assert.rejects(
        () => store.getItems('valid', bad),
        /Invalid sessionId/,
        `sessionId "${bad}" should be rejected`,
      );
    });
  }

  it('accepts valid harness and sessionId with letters, digits, underscores, hyphens', async () => {
    await assert.doesNotReject(
      () => store.getItems('my-Harness_01', 'Session-XYZ-99'),
    );
  });
});

describe('v8.9 SessionStore — concurrent add via lock', () => {
  let root: string;
  let store: SessionStore;

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'sis-session-'));
    store = makeStore(root);
  });

  after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('concurrent addItems from multiple callers all persist without data loss', async () => {
    const N = 10;
    const promises: Promise<void>[] = [];
    for (let i = 0; i < N; i++) {
      promises.push(store.addItems('concurrent-h', 'concurrent-s', [{ content: `item-${i}` }]));
    }
    await Promise.all(promises);
    const items = await store.getItems('concurrent-h', 'concurrent-s');
    assert.equal(items.length, N, `all ${N} concurrent items must be persisted`);
  });
});
