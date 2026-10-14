/**
 * Starlight Alexandria — receipts.
 *
 * Every executed call leaves a receipt: what was asked, where the records came
 * from, a sha256 over the canonical JSON of the records, what was reserved and
 * what it cost, and which budget session it was charged to. The receipt is the
 * unit of trust for the whole vertical: a synthesis that cannot point at
 * receipts is an opinion, and the Exchange only resells what has one.
 *
 * The "Built on SIP" block is earned per receipt (per ATTESTATIONS.md, 2026-09-19):
 * it is emitted only when the caller declares which SIP layers the record
 * actually composed, and only for a successful call that returned records.
 * A declared block is a label; a receipt someone else can re-check needs
 * `protocol/sign.mjs` (the proposed SIP graph extension).
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, closeSync, existsSync, fstatSync, mkdirSync, openSync, readFileSync, readSync, renameSync, rmSync, truncateSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { CallResult, Provider, Receipt } from './types.js';

export const SIP_VERSION = '1.1.1';
export const SIP_SUBSTRATE = 'starlightintelligence.org/protocol';

/** Stable key ordering so the same records always hash the same. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    // Built from entries, not by assignment: a provider record with an own `__proto__` key
    // must hash as that key, not silently re-parent the accumulator and vanish.
    const source = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(source).sort().map((key) => [key, sortKeys(source[key])]));
  }
  return value;
}

export function hashRecords(records: unknown[]): string {
  return 'sha256:' + createHash('sha256').update(canonicalJson(records)).digest('hex');
}

/** Identifies one call: a held reservation is reused only by a retry of the same capability with the same options. */
export function callFingerprint(capabilityId: string, options: Record<string, unknown>): string {
  return 'sha256:' + createHash('sha256').update(canonicalJson([capabilityId, options])).digest('hex');
}

export function attestationBlock(layers: readonly string[], provider: Provider, capability: string): string {
  return [
    '**Built on SIP** — Starlight Intelligence Protocol',
    '',
    `Substrate: ${SIP_SUBSTRATE} v${SIP_VERSION}`,
    `Layers used: [${layers.join(', ')}]`,
    '',
    'Verticals:',
    `- alexandria@v0.1 · catalogued record from ${provider.id}/${capability} (${provider.source})`,
  ].join('\n');
}

export interface ReceiptInput {
  result: CallResult;
  provider: Provider;
  options: Record<string, unknown>;
  sessionId: string;
  /** Credits reserved before the call ran. */
  reserved: number;
  sipLayers?: readonly string[];
  now?: () => string;
  /** Write the pre-call line: holds `reserved` in the ledger until the outcome receipt settles it. */
  pending?: boolean;
  /** The session ceiling in force. */
  maxCredits: number;
  /** The provider charged more than was reserved. */
  overrun?: boolean;
  /** `reconciledAt` of the catalogue in force, recorded on overruns so a later reconciliation clears them. */
  catalogueReconciledAt?: string;
}

export function buildReceipt({ result, provider, options, sessionId, reserved, sipLayers = [], now, pending = false, maxCredits, overrun = false, catalogueReconciledAt }: ReceiptInput): Receipt {
  const receipt: Receipt = {
    id: `rcpt_${randomUUID()}`,
    issuedAt: now ? now() : new Date().toISOString(),
    observedAt: result.observedAt,
    sessionId,
    provider: result.provider,
    capability: result.capability,
    options,
    callFingerprint: callFingerprint(`${result.provider}/${result.capability}`, options),
    recordCount: result.records.length,
    contentHash: hashRecords(result.records),
    reserved,
    maxCredits,
    // A pending line holds the reservation. A definite failure is not billed. An uncertain
    // outcome holds the reservation until a retry with the same request id settles it; a success
    // with no reported charge holds it too.
    creditsCost: pending ? reserved : result.error ? (result.error.code === 'uncertain_outcome' ? reserved : 0) : result.chargeUnknown ? reserved : result.creditsCost,
    source: provider.source,
    redistribution: provider.redistribution?.policy ?? 'not-cleared',
    sipLayers,
  };
  if (pending) receipt.pending = true;
  if (!pending && overrun) {
    receipt.overrun = true;
    if (catalogueReconciledAt) receipt.catalogueReconciledAt = catalogueReconciledAt;
  }
  if (!pending && !result.error && result.chargeUnknown) receipt.chargeUnknown = true;
  if (result.requestId) receipt.requestId = result.requestId;
  if (provider.attribution) receipt.attribution = provider.attribution;
  // Earned, never decorative: a pending, failed or empty call composed nothing.
  if (!pending && sipLayers.length > 0 && !result.error && result.records.length > 0) {
    receipt.attestation = attestationBlock(sipLayers, provider, result.capability);
  }
  if (result.error) receipt.error = result.error;
  return receipt;
}

export interface LedgerRead {
  receipts: Receipt[];
  /** True when the file ends in a partial line (a write was cut off). The intact prefix is still returned. */
  truncatedTail: boolean;
}

/** Owner-only: receipts carry client inputs (addresses, handles, queries). */
const FILE_MODE = 0o600;
const DIR_MODE = 0o700;

/**
 * Append-only JSONL ledger. One line per receipt; never rewritten except to move a cut-off tail
 * into quarantine. Files are created owner-only. Every read and every append holds the ledger's
 * write lock, so two processes sharing a ledger cannot interleave a quarantine with an append
 * and a reader never sees a half-truncated file.
 */
export class ReceiptLedger {
  constructor(readonly path: string) {}

  /** The ledger-wide lock. Short-lived: held only for the duration of one read or one append. */
  private writeLock(): FileLock {
    return new FileLock(`${this.path}.write.lock`);
  }

  private locked<T>(fn: () => T): T {
    const lock = this.writeLock();
    lock.acquire({ waitMs: 5000 });
    try { return fn(); } finally { lock.release(); }
  }

  append(receipt: Receipt): void {
    mkdirSync(dirname(this.path), { recursive: true, mode: DIR_MODE });
    this.locked(() => {
      this.quarantinePartialTail();
      appendFileSync(this.path, JSON.stringify(receipt) + '\n', { encoding: 'utf8', mode: FILE_MODE });
    });
  }

  /** Where a cut-off final line is moved before the next append. */
  get quarantinePath(): string {
    return `${this.path}.quarantine`;
  }

  /**
   * A write that was cut off leaves bytes after the last newline. Appending to them would
   * glue a valid receipt onto the fragment and, one append later, turn the fragment into
   * mid-file corruption. The fragment is moved to the quarantine file (never deleted) and
   * the ledger is truncated back to its last complete line.
   */
  quarantinePartialTail(): boolean {
    if (!existsSync(this.path)) return false;
    const content = readFileSync(this.path, 'utf8');
    if (content.length === 0 || content.endsWith('\n')) return false;
    const cut = content.lastIndexOf('\n') + 1;
    const fragment = content.slice(cut);
    appendFileSync(this.quarantinePath, `${new Date().toISOString()}\t${fragment}\n`, { encoding: 'utf8', mode: FILE_MODE });
    // Truncate in place rather than rewriting the prefix: the intact lines are never re-written.
    truncateSync(this.path, Buffer.byteLength(content.slice(0, cut), 'utf8'));
    return true;
  }

  /**
   * Reads the ledger. A cut-off final line is reported, not fatal; a malformed line anywhere
   * else means the file was edited or corrupted and is refused, because a ledger that is
   * silently wrong is worse than one that is loudly unreadable.
   */
  readDetailed(): LedgerRead {
    if (!existsSync(this.path)) return { receipts: [], truncatedTail: false };
    const raw = this.locked(() => readFileSync(this.path, 'utf8'));
    const lines = raw.split('\n').filter((line) => line.trim().length > 0);
    // Only a final line with no terminating newline can be a cut-off write. A complete last line
    // that does not parse is corruption like any other and is refused, never dropped from the tally.
    const unterminated = raw.length > 0 && !raw.endsWith('\n');
    const receipts: Receipt[] = [];
    let truncatedTail = false;
    lines.forEach((line, i) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(line);
      } catch (err) {
        if (i === lines.length - 1 && unterminated) { truncatedTail = true; return; }
        throw new Error(`Receipt ledger ${this.path} is corrupt at line ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      }
      // A line that parses but cannot be tallied would poison the budget (NaN compares false
      // against every ceiling), so it is refused rather than summed.
      const problem = receiptProblem(parsed);
      if (problem) throw new Error(`Receipt ledger ${this.path} is corrupt at line ${i + 1}: ${problem}`);
      receipts.push(parsed as Receipt);
    });
    return { receipts, truncatedTail };
  }

  read(): Receipt[] {
    return this.readDetailed().receipts;
  }

  /**
   * Credits spent or still held in one session. A definite failure is not billed. An
   * `uncertain_outcome` receipt holds its reservation until a later receipt in the same session
   * carries the same request id (the retry that settled it). Without a session id: the whole ledger.
   */
  spent(sessionId?: string): number {
    const { settled, held } = this.tally(sessionId);
    let total = settled;
    for (const hold of held.values()) total += hold.amount;
    return total;
  }

  /** Reservations still held (pending lines without an outcome, uncertain outcomes), keyed by request id. */
  heldReservations(sessionId?: string): Map<string, HeldReservation> {
    return this.tally(sessionId).held;
  }

  /** The lowest ceiling ever recorded for a session, or undefined when it has no receipts. A resume may not exceed it. */
  sessionCeiling(sessionId: string): number | undefined {
    let ceiling: number | undefined;
    for (const r of this.read()) {
      if (r.sessionId !== sessionId) continue;
      ceiling = ceiling === undefined ? r.maxCredits : Math.min(ceiling, r.maxCredits);
    }
    return ceiling;
  }

  /**
   * Capabilities whose provider once charged more than was reserved, across every session. An
   * overrun suspends its capability until the catalogue is reconciled after it: an overrun
   * recorded under catalogue `reconciledAt` X clears once the catalogue in force carries a later
   * `reconciledAt` (the reconciliation is the audit record). An overrun with no recorded
   * catalogue date never clears by date.
   */
  suspendedCapabilities(catalogueReconciledAt?: string): Set<string> {
    if (!existsSync(this.path)) { this.overrunScan = { offset: 0, overruns: [] }; return new Set(); }
    return this.locked(() => this.suspendedUnlocked(catalogueReconciledAt));
  }

  /**
   * Appends a pending receipt only if its capability is not suspended, in one locked section:
   * the suspension check and the write that precedes dispatch cannot be split by another
   * process recording an overrun in between. Returns the suspensions seen; when the
   * capability is among them nothing was written and the call must not be sent.
   */
  appendUnlessSuspended(receipt: Receipt, capabilityId: string, catalogueReconciledAt?: string): { appended: boolean; suspended: Set<string> } {
    mkdirSync(dirname(this.path), { recursive: true, mode: DIR_MODE });
    return this.locked(() => {
      this.quarantinePartialTail();
      const suspended = existsSync(this.path) ? this.suspendedUnlocked(catalogueReconciledAt) : new Set<string>();
      if (suspended.has(capabilityId)) return { appended: false, suspended };
      appendFileSync(this.path, JSON.stringify(receipt) + '\n', { encoding: 'utf8', mode: FILE_MODE });
      return { appended: true, suspended };
    });
  }

  /** Overruns seen so far and the byte offset scanned up to; only bytes appended since are read. */
  private overrunScan: { offset: number; overruns: { key: string; at?: string }[] } = { offset: 0, overruns: [] };

  /** Caller holds the write lock. Scans only complete lines appended since the last scan. */
  private suspendedUnlocked(catalogueReconciledAt?: string): Set<string> {
    const fd = openSync(this.path, 'r');
    try {
      const size = fstatSync(fd).size;
      // A ledger that shrank was replaced or rewritten: start over rather than trust the cache.
      if (size < this.overrunScan.offset) this.overrunScan = { offset: 0, overruns: [] };
      const start = this.overrunScan.offset;
      if (size > start) {
        const buf = Buffer.alloc(size - start);
        let read = 0;
        while (read < buf.length) {
          const n = readSync(fd, buf, read, buf.length - read, start + read);
          if (n === 0) break;
          read += n;
        }
        const end = buf.lastIndexOf(0x0a, read - 1);
        if (end >= 0) {
          // Only complete lines are consumed; a cut-off tail is re-read once it is finished.
          const lines = buf.subarray(0, end + 1).toString('utf8').split('\n');
          const found: { key: string; at?: string }[] = [];
          for (const line of lines) {
            if (line.trim().length === 0) continue;
            let parsed: unknown;
            try { parsed = JSON.parse(line); } catch (err) {
              throw new Error(`Receipt ledger ${this.path} is corrupt after byte ${start}: ${err instanceof Error ? err.message : String(err)}`);
            }
            const problem = receiptProblem(parsed);
            if (problem) throw new Error(`Receipt ledger ${this.path} is corrupt after byte ${start}: ${problem}`);
            const r = parsed as Receipt;
            if (r.overrun) found.push({ key: `${r.provider}/${r.capability}`, at: r.catalogueReconciledAt });
          }
          this.overrunScan = { offset: start + end + 1, overruns: [...this.overrunScan.overruns, ...found] };
        }
      }
    } finally { closeSync(fd); }
    const out = new Set<string>();
    for (const o of this.overrunScan.overruns) {
      const cleared = catalogueReconciledAt !== undefined && o.at !== undefined && catalogueReconciledAt > o.at;
      if (!cleared) out.add(o.key);
    }
    return out;
  }

  private tally(sessionId?: string): { settled: number; held: Map<string, HeldReservation> } {
    let settled = 0;
    const held = new Map<string, HeldReservation>();
    for (const r of this.read()) {
      if (sessionId !== undefined && r.sessionId !== sessionId) continue;
      if (r.pending || r.error?.code === 'uncertain_outcome') {
        if (r.requestId) held.set(r.requestId, { amount: r.creditsCost, fingerprint: r.callFingerprint });
        continue;
      }
      if (r.requestId) held.delete(r.requestId);
      if (!r.error) settled += r.creditsCost;
    }
    return { settled, held };
  }
}

export interface HeldReservation {
  amount: number;
  /** The call the hold belongs to; a retry must match it to reuse the hold. */
  fingerprint: string;
}

function isCredits(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

/** Why a parsed line cannot be a receipt, or null. Only the fields the tally depends on are checked. */
export function receiptProblem(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'not an object';
  const r = value as Partial<Receipt>;
  if (typeof r.id !== 'string' || !r.id.startsWith('rcpt_')) return 'id is not a receipt id';
  if (typeof r.sessionId !== 'string' || !r.sessionId) return 'sessionId missing';
  if (!isCredits(r.creditsCost)) return `creditsCost is not a finite non-negative number (${JSON.stringify(r.creditsCost)})`;
  if (!isCredits(r.reserved)) return `reserved is not a finite non-negative number (${JSON.stringify(r.reserved)})`;
  if (!isCredits(r.maxCredits)) return `maxCredits is not a finite non-negative number (${JSON.stringify(r.maxCredits)})`;
  if (r.requestId !== undefined && typeof r.requestId !== 'string') return 'requestId is not a string';
  if (typeof r.callFingerprint !== 'string') return 'callFingerprint missing';
  return null;
}

/** Lock paths this process holds, so a second instance in the same process cannot share a lock. */
const heldInProcess = new Set<string>();

const RETRY_MS = 10;

function pause(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Exclusive pid lock. The lock is a directory holding an `owner` file with the pid. Ownership is
 * published atomically on every filesystem: the owner file is written into a private temp
 * directory first, and that directory is renamed to the lock path. Rename refuses to replace a
 * non-empty directory, so the lock either does not exist or carries its owner; there is no
 * create-then-write window and no timer deciding whether an incomplete lock is stale. A lock
 * whose pid is no longer alive is stale and is claimed by atomic rename, so of two recovering
 * processes exactly one wins. Two instances in one process cannot share a lock either.
 */
export class FileLock {
  private held = false;

  constructor(readonly path: string) {}

  /** `waitMs`: how long to wait on a live owner before giving up (0 = refuse at once). */
  acquire(opts: { waitMs?: number } = {}): void {
    if (this.held) return;
    if (heldInProcess.has(this.path)) {
      throw new Error(`${this.path} is already held by another instance in this process`);
    }
    mkdirSync(dirname(this.path), { recursive: true, mode: DIR_MODE });
    const deadline = Date.now() + (opts.waitMs ?? 0);
    for (let attempt = 0; attempt < 10_000; attempt++) {
      if (this.tryPublish()) { this.held = true; heldInProcess.add(this.path); return; }
      let owner: number;
      try { owner = Number(readFileSync(join(this.path, 'owner'), 'utf8').trim()); } catch {
        // Gone between our rename and this read (released or claimed), or not a lock we wrote:
        // a lock without an owner file was never published by this code, so it is stale.
        if (!existsSync(this.path)) continue;
        owner = Number.NaN;
      }
      // Our own pid but not in heldInProcess: a leftover from an earlier life of this pid, so stale.
      if (owner !== process.pid && isAlive(owner)) {
        if (Date.now() < deadline) { pause(RETRY_MS); continue; }
        throw new Error(`${this.path} is held by process ${owner}`);
      }
      // Stale: claim it by rename (atomic), so a losing claimant can never remove a fresh lock.
      const claim = `${this.path}.stale.${process.pid}.${attempt}`;
      try { renameSync(this.path, claim); rmSync(claim, { recursive: true, force: true }); } catch { /* another process claimed it; the retry sees their fresh lock */ }
    }
    throw new Error(`Could not acquire ${this.path}`);
  }

  /** Publishes the lock with its owner in one rename. False when a lock already exists. */
  private tryPublish(): boolean {
    const staging = `${this.path}.${process.pid}.${randomUUID()}.tmp`;
    mkdirSync(staging, { mode: DIR_MODE });
    writeFileSync(join(staging, 'owner'), String(process.pid), { encoding: 'utf8', mode: FILE_MODE });
    try {
      renameSync(staging, this.path);
      return true;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOTEMPTY' || code === 'EEXIST' || code === 'EPERM' || code === 'EACCES') return false;
      throw err;
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  }

  /** The pid recorded in a lock, or undefined when there is no lock. */
  static owner(path: string): number | undefined {
    try { return Number(readFileSync(join(path, 'owner'), 'utf8').trim()); } catch { return undefined; }
  }

  release(): void {
    if (!this.held) return;
    this.held = false;
    heldInProcess.delete(this.path);
    if (FileLock.owner(this.path) === process.pid) rmSync(this.path, { recursive: true, force: true });
  }
}

/**
 * Exclusive lock on a budget session. Two processes resuming the same session would each reserve
 * against their own in-memory copy of the spend, so a resumed session is held by exactly one live
 * process, and by exactly one instance within it. The lock is a directory beside the ledger.
 */
export class SessionLock extends FileLock {
  constructor(ledgerPath: string, readonly sessionId: string) {
    super(`${ledgerPath}.${sessionId.replace(/[^A-Za-z0-9_.-]/g, '_')}.lock`);
  }

  override acquire(): void {
    try {
      super.acquire({ waitMs: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('another instance in this process')) throw new Error(`Budget session ${this.sessionId} is already held by another Alexandria instance in this process (${this.path}); reuse that instance or choose another session`);
      if (message.includes('is held by process')) throw new Error(`Budget session ${this.sessionId} ${message.slice(message.indexOf('is held by process'))} (${this.path}); resume it from that process or choose another session`);
      throw err;
    }
  }
}

function isAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (err) { return (err as NodeJS.ErrnoException).code === 'EPERM'; }
}
