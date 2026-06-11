/**
 * src/session-store.ts — Per-session working memory for gateway harnesses.
 *
 * Storage layout:
 *   <storageRoot>/sessions/<harness>/<sessionId>.jsonl
 *
 * Each line is a session event: {type:'add'|'pop'|'clear', item?, ts}
 * Events are folded on read:
 *   - 'add'   → pushes item onto the working stack
 *   - 'pop'   → tombstones the last item (removes it)
 *   - 'clear' → tombstones all items up to this point
 *
 * Compaction: clearSession() also rewrites the file to a single 'clear'
 * event so it doesn't grow unboundedly.
 *
 * Security: harness and sessionId path segments are validated to [a-z0-9_-]i
 * before any filesystem operation.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import {
  existsSync,
  mkdirSync,
  appendFileSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { join } from 'node:path';
import { withLock } from './gateway/lock.js';

// ── Types ──────────────────────────────────────────────────

export interface SessionItem {
  /** Arbitrary string content stored by the harness. */
  content: string;
  /** Optional metadata: tags, source, etc. */
  meta?: Record<string, unknown>;
}

type SessionEventType = 'add' | 'pop' | 'clear';

interface SessionEvent {
  type: SessionEventType;
  item?: SessionItem;
  ts: string;
}

// ── Validation ─────────────────────────────────────────────

const SAFE_SEGMENT_RE = /^[a-z0-9_-]+$/i;

function assertSafeSegment(name: string, label: string): void {
  if (!SAFE_SEGMENT_RE.test(name)) {
    throw new Error(
      `Invalid ${label} "${name}": must match [a-z0-9_-] (case-insensitive)`,
    );
  }
}

// ── Folding ─────────────────────────────────────────────────

/**
 * Fold a stream of session events into the current set of live items.
 * Order is preserved (oldest first in result).
 */
function foldEvents(events: SessionEvent[]): SessionItem[] {
  const stack: SessionItem[] = [];
  for (const ev of events) {
    if (ev.type === 'add' && ev.item != null) {
      stack.push(ev.item);
    } else if (ev.type === 'pop') {
      stack.pop();
    } else if (ev.type === 'clear') {
      stack.length = 0;
    }
  }
  return stack;
}

function parseEvents(raw: string): SessionEvent[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => {
      try { return JSON.parse(l) as SessionEvent; } catch { return null; }
    })
    .filter((e): e is SessionEvent => e !== null && typeof e.type === 'string');
}

// ── SessionStore ─────────────────────────────────────────────

export class SessionStore {
  private readonly root: string;

  constructor(storageRoot: string) {
    this.root = storageRoot;
  }

  // ── Path helpers ──────────────────────────────────────────

  private sessionsDir(harness: string): string {
    return join(this.root, 'sessions', harness);
  }

  private sessionFile(harness: string, sessionId: string): string {
    return join(this.sessionsDir(harness), `${sessionId}.jsonl`);
  }

  private lockPath(harness: string, sessionId: string): string {
    return join(this.sessionsDir(harness), `${sessionId}.lock`);
  }

  // ── Read ──────────────────────────────────────────────────

  /** Return the live items for a session (folded). */
  async getItems(harness: string, sessionId: string, limit?: number): Promise<SessionItem[]> {
    assertSafeSegment(harness, 'harness');
    assertSafeSegment(sessionId, 'sessionId');

    const file = this.sessionFile(harness, sessionId);
    if (!existsSync(file)) return [];

    const raw = readFileSync(file, 'utf-8');
    const events = parseEvents(raw);
    const items = foldEvents(events);
    return limit != null ? items.slice(-limit) : items;
  }

  // ── Write ─────────────────────────────────────────────────

  /** Append one or more items to the session. */
  async addItems(harness: string, sessionId: string, items: SessionItem[]): Promise<void> {
    assertSafeSegment(harness, 'harness');
    assertSafeSegment(sessionId, 'sessionId');
    if (items.length === 0) return;

    const dir = this.sessionsDir(harness);
    const file = this.sessionFile(harness, sessionId);
    const lock = this.lockPath(harness, sessionId);

    // Ensure parent dir exists BEFORE trying to acquire the lock (the lock
    // directory is inside the harness sessions dir and mkdirSync fails if the
    // parent is missing).
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    await withLock(lock, () => {
      const ts = new Date().toISOString();
      const lines = items
        .map(item => JSON.stringify({ type: 'add', item, ts } satisfies SessionEvent))
        .join('\n') + '\n';
      appendFileSync(file, lines, 'utf-8');
    });
  }

  /**
   * Remove the most recently added item.
   * Returns true if there was an item to pop, false if the session was empty.
   */
  async popItem(harness: string, sessionId: string): Promise<boolean> {
    assertSafeSegment(harness, 'harness');
    assertSafeSegment(sessionId, 'sessionId');

    const dir = this.sessionsDir(harness);
    // Ensure parent exists before lock acquisition
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const file = this.sessionFile(harness, sessionId);
    const lock = this.lockPath(harness, sessionId);

    return withLock(lock, () => {
      if (!existsSync(file)) return false;
      const raw = readFileSync(file, 'utf-8');
      const events = parseEvents(raw);
      const before = foldEvents(events);
      if (before.length === 0) return false;
      const ts = new Date().toISOString();
      appendFileSync(file, JSON.stringify({ type: 'pop', ts } satisfies SessionEvent) + '\n', 'utf-8');
      return true;
    });
  }

  /**
   * Clear all items from the session and compact the file to a single event.
   */
  async clearSession(harness: string, sessionId: string): Promise<void> {
    assertSafeSegment(harness, 'harness');
    assertSafeSegment(sessionId, 'sessionId');

    const dir = this.sessionsDir(harness);
    // Ensure parent exists before lock acquisition
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const file = this.sessionFile(harness, sessionId);
    const lock = this.lockPath(harness, sessionId);

    await withLock(lock, () => {
      const ts = new Date().toISOString();
      // Compact: write a single clear event, discarding all prior history
      writeFileSync(file, JSON.stringify({ type: 'clear', ts } satisfies SessionEvent) + '\n', 'utf-8');
    });
  }

  // ── Listing ───────────────────────────────────────────────

  /** List all session IDs for a given harness. */
  listSessions(harness: string): string[] {
    assertSafeSegment(harness, 'harness');
    const dir = this.sessionsDir(harness);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => f.slice(0, -6))
      .filter(id => SAFE_SEGMENT_RE.test(id));
  }
}
