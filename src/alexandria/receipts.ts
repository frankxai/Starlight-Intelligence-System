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
import { appendFileSync, closeSync, existsSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, readlinkSync, readSync, realpathSync, renameSync, rmSync, statSync, truncateSync, writeFileSync } from 'node:fs';
import type { BigIntStats } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
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
      this.finishTail();
      this.appendOwn(JSON.stringify(receipt) + '\n');
    });
  }

  /**
   * Caller holds the write lock. Appends a line and drops the scan stamp: a stamp taken after an
   * append is never trusted, because a lock-bypassing rewrite just before the append would be
   * hidden by it. The next scan rehashes the prefix; a stamp is trusted again once it has settled.
   */
  private appendOwn(text: string): void {
    appendFileSync(this.path, text, { encoding: 'utf8', mode: FILE_MODE });
    this.overrunScan.stamp = undefined;
  }

  /**
   * Caller holds the write lock. A torn final segment that is a complete receipt is finished with
   * a newline. Any other torn segment is left exactly where it is and the write is refused: it may
   * be another process's overrun receipt, so only an operator moves it out (quarantinePartialTail).
   * Writes never quarantine on their own.
   */
  private finishTail(): void {
    if (!existsSync(this.path)) return;
    const fragment = trailingFragment(this.path);
    if (fragment === null) return;
    if (completeReceipt(fragment)) {
      this.appendOwn('\n');
      return;
    }
    throw new TornTailError(`Receipt ledger ${this.path} ends in a cut-off line that does not parse as a complete receipt and may hold suspension evidence. Nothing was written; an operator must inspect it and move it out with ReceiptLedger.quarantinePartialTail()`);
  }

  /** Where an operator moves a cut-off final line (quarantinePartialTail). */
  get quarantinePath(): string {
    return `${this.path}.quarantine`;
  }

  /**
   * Operator recovery only; writes never call it. A write that was cut off leaves bytes after the last newline. Appending to them would
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
    // A final segment that is a complete receipt lost only its newline: it is finished in place,
    // never moved out, so an overrun recorded in it keeps suspending its capability.
    if (completeReceipt(fragment)) {
      appendFileSync(this.path, '\n', { encoding: 'utf8', mode: FILE_MODE });
      return false;
    }
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
        // A torn last line that does not parse is reported, not counted. One that parses as a
        // complete receipt lost only its newline and is a record like any other.
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

  /**
   * Settled request IDs (completed calls with a success or definite failure outcome).
   * Without a session id: the whole ledger.
   */
  settledIds(sessionId?: string): Set<string> {
    return new Set(this.tally(sessionId).settledRequests.keys());
  }

  /** Alias for settledIds(). */
  settledRequestIds(sessionId?: string): Set<string> {
    return this.settledIds(sessionId);
  }

  /**
   * Settled requests keyed by request id, carrying the call fingerprint, receipt id and cost.
   * Without a session id: the whole ledger.
   */
  settledReceipts(sessionId?: string): Map<string, SettledReservation> {
    return this.tally(sessionId).settledRequests;
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
    if (!existsSync(this.path)) { this.overrunScan = emptyScan(); return new Set(); }
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
      // Scanned before any repair: a torn tail that is not a complete receipt may be the overrun
      // that suspends this capability, so the scan fails closed instead of quarantining it.
      const suspended = existsSync(this.path) ? this.suspendedUnlocked(catalogueReconciledAt) : new Set<string>();
      if (suspended.has(capabilityId)) return { appended: false, suspended };
      this.finishTail();
      this.appendOwn(JSON.stringify(receipt) + '\n');
      return { appended: true, suspended };
    });
  }

  /** Overruns seen so far and the byte offset scanned up to; only bytes appended since are read. */
  private overrunScan: OverrunScan = emptyScan();

  /**
   * Caller holds the write lock. Scans only complete lines appended since the last scan. The cache
   * is trusted only for the same file: a different device/inode, a shorter file, or any changed
   * byte before the cached offset means the ledger was replaced, and it is rescanned in full.
   * A torn final segment is never skipped: a complete receipt is counted, anything else fails closed.
   */
  private suspendedUnlocked(catalogueReconciledAt?: string): Set<string> {
    const fd = openSync(this.path, 'r');
    let tailOverruns: { key: string; at?: string }[] = [];
    try {
      const stat = fstatSync(fd);
      const big = fstatSync(fd, { bigint: true });
      const size = stat.size;
      const cached = this.overrunScan;
      // The cache is trusted only if every byte it was built from is unchanged. Cheap path: the
      // file's stamp (device, inode, size, mtime and ctime in ns) equals the one recorded when the
      // cache was last verified (never one taken right after an append), and a full verify is not due.
      // Otherwise the sha256 over bytes 0..offset is recomputed and must match. The running hash is
      // kept, so new lines extend it without rereading the prefix.
      let hash = createHash('sha256');
      let sameFile = cached.offset === 0;
      const due = cached.scansSinceVerify >= FULL_VERIFY_EVERY || Date.now() - cached.verifiedAt >= FULL_VERIFY_MS;
      if (!sameFile && !due && cached.stamp !== undefined && cached.hash && stampOf(big) === cached.stamp) {
        sameFile = true;
        hash = cached.hash.copy();
        cached.scansSinceVerify += 1;
      } else if (!sameFile && cached.dev === stat.dev && cached.ino === stat.ino && size >= cached.offset) {
        hashRange(fd, hash, 0, cached.offset);
        sameFile = hash.copy().digest('hex') === cached.prefixHash;
        if (sameFile) { cached.scansSinceVerify = 0; cached.verifiedAt = Date.now(); }
      }
      if (!sameFile) { this.overrunScan = emptyScan(); hash = createHash('sha256'); }
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
        const parseLine = (line: string, where: string) => {
          let parsed: unknown;
          try { parsed = JSON.parse(line); } catch (err) {
            throw new Error(`Receipt ledger ${this.path} is corrupt ${where}: ${err instanceof Error ? err.message : String(err)}`);
          }
          const problem = receiptProblem(parsed);
          if (problem) throw new Error(`Receipt ledger ${this.path} is corrupt ${where}: ${problem}`);
          return parsed as Receipt;
        };
        if (end >= 0) {
          const found: { key: string; at?: string }[] = [];
          for (const line of buf.subarray(0, end + 1).toString('utf8').split('\n')) {
            if (line.trim().length === 0) continue;
            const r = parseLine(line, `after byte ${start}`);
            if (r.overrun) found.push({ key: `${r.provider}/${r.capability}`, at: r.catalogueReconciledAt });
          }
          const offset = start + end + 1;
          hash.update(buf.subarray(0, end + 1));
          this.overrunScan = { ...this.overrunScan, offset, overruns: [...this.overrunScan.overruns, ...found], dev: stat.dev, ino: stat.ino, prefixHash: hash.copy().digest('hex'), hash };
        }
        const tail = buf.subarray(end + 1, read).toString('utf8');
        if (tail.trim().length > 0) {
          const complete = completeReceipt(tail);
          if (!complete) {
            throw new TornTailError(`Receipt ledger ${this.path} ends in a cut-off line that does not parse as a complete receipt and may hold suspension evidence. No paid call is admitted until an operator inspects it and moves it out with ReceiptLedger.quarantinePartialTail()`);
          }
          // Counted for this answer but not cached: the line is finished with a newline later.
          if (complete.overrun) tailOverruns = [{ key: `${complete.provider}/${complete.capability}`, at: complete.catalogueReconciledAt }];
        }
      }
      // A stamp is recorded only once it is settled: younger than the 2 s racy window a same-tick
      // rewrite could keep it, whatever the filesystem's timestamp granularity.
      this.overrunScan.stamp = settled(big) ? stampOf(big) : undefined;
    } finally { closeSync(fd); }
    const out = new Set<string>();
    for (const o of [...this.overrunScan.overruns, ...tailOverruns]) {
      const cleared = catalogueReconciledAt !== undefined && o.at !== undefined && catalogueReconciledAt > o.at;
      if (!cleared) out.add(o.key);
    }
    return out;
  }

  private tally(sessionId?: string): { settled: number; held: Map<string, HeldReservation>; settledRequests: Map<string, SettledReservation> } {
    let settled = 0;
    const held = new Map<string, HeldReservation>();
    const settledRequests = new Map<string, SettledReservation>();
    for (const r of this.read()) {
      if (sessionId !== undefined && r.sessionId !== sessionId) continue;
      if (r.pending || r.error?.code === 'uncertain_outcome') {
        if (r.requestId) {
          held.set(r.requestId, { amount: r.creditsCost, fingerprint: r.callFingerprint });
          settledRequests.delete(r.requestId);
        }
        continue;
      }
      if (r.requestId) {
        held.delete(r.requestId);
        settledRequests.set(r.requestId, { fingerprint: r.callFingerprint, creditsCost: r.creditsCost, receiptId: r.id });
      }
      if (!r.error) settled += r.creditsCost;
    }
    return { settled, held, settledRequests };
  }
}

export interface SettledReservation {
  /** The call that settled; a replay must match it to be identified as the same call. */
  fingerprint: string;
  creditsCost: number;
  receiptId: string;
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

/** Thrown when the ledger ends in a torn line that is not a complete receipt. */
export class TornTailError extends Error {
  override readonly name = 'TornTailError';
}

/** A torn final segment that still parses as a complete, tallyable receipt, or null. */
function completeReceipt(fragment: string): Receipt | null {
  let parsed: unknown;
  try { parsed = JSON.parse(fragment); } catch { return null; }
  return receiptProblem(parsed) === null ? parsed as Receipt : null;
}

interface OverrunScan {
  offset: number;
  overruns: { key: string; at?: string }[];
  dev?: number;
  ino?: number;
  /** sha256 of bytes 0..offset. */
  prefixHash: string;
  /** The running hash over bytes 0..offset, extended as new lines are consumed. */
  hash?: ReturnType<typeof createHash>;
  /** File stamp when the cache was last known current; undefined forces a hash check. */
  stamp?: string;
  scansSinceVerify: number;
  verifiedAt: number;
}

function emptyScan(): OverrunScan {
  return { offset: 0, overruns: [], prefixHash: '', scansSinceVerify: 0, verifiedAt: Date.now() };
}

/** Even with a matching stamp, the whole prefix is rehashed this often. */
const FULL_VERIFY_EVERY = 32;
const FULL_VERIFY_MS = 5_000;
/**
 * A stamp younger than this may hide a same-tick rewrite. 2 s covers every timestamp granularity
 * up to whole-second-and-a-bit (FAT's 2 s), without guessing the filesystem's tick.
 */
const RACY_NS = 2_000_000_000n;

function stampOf(st: BigIntStats): string {
  return `${st.dev}:${st.ino}:${st.size}:${st.mtimeNs}:${st.ctimeNs}`;
}

function settled(st: BigIntStats): boolean {
  const newest = st.mtimeNs > st.ctimeNs ? st.mtimeNs : st.ctimeNs;
  return BigInt(Date.now()) * 1_000_000n - newest >= RACY_NS;
}

/** The bytes after the last newline of a file, or null if it is empty or ends in a newline. Reads only the tail. */
function trailingFragment(path: string): string | null {
  const fd = openSync(path, 'r');
  try {
    const size = fstatSync(fd).size;
    if (size === 0) return null;
    const chunks: Buffer[] = [];
    let pos = size;
    while (pos > 0) {
      const len = Math.min(64 * 1024, pos);
      const buf = Buffer.alloc(len);
      let read = 0;
      while (read < len) {
        const n = readSync(fd, buf, read, len - read, pos - len + read);
        if (n === 0) break;
        read += n;
      }
      pos -= len;
      if (pos + len === size && buf[len - 1] === 0x0a) return null;
      const nl = buf.lastIndexOf(0x0a);
      if (nl >= 0) { chunks.unshift(buf.subarray(nl + 1)); break; }
      chunks.unshift(buf);
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally { closeSync(fd); }
}

/** Feeds bytes [from, to) of an open file into a hash, in chunks. */
function hashRange(fd: number, hash: ReturnType<typeof createHash>, from: number, to: number): void {
  const chunk = Buffer.alloc(64 * 1024);
  let pos = from;
  while (pos < to) {
    const n = readSync(fd, chunk, 0, Math.min(chunk.length, to - pos), pos);
    if (n === 0) break;
    hash.update(chunk.subarray(0, n));
    pos += n;
  }
}

/** Per-capability turns in this process, chained so one paid call at a time holds the capability lock. */
const capabilityTurns = new Map<string, Promise<void>>();

/**
 * One identity for a ledger file however it is named: the real path of its directory (symlinks and
 * relative segments resolved) plus that directory's device and inode, and the file's own real
 * path when it already exists.
 */
export function ledgerIdentity(ledgerPath: string): { key: string; lockBase: string } {
  const target = followLinks(ledgerPath);
  mkdirSync(dirname(target), { recursive: true, mode: DIR_MODE });
  const real = existsSync(target) ? realpathSync(target) : join(realpathSync(dirname(target)), basename(target));
  const dir = statSync(dirname(real));
  return { key: `${dir.dev}:${dir.ino}/${basename(real)}`, lockBase: real };
}

/**
 * Follows symlinks at the final path component, including a dangling one whose target does not
 * exist yet, so a ledger named through a link and through its target gets one identity before
 * the file is created. Parent directories are resolved by realpath in ledgerIdentity.
 */
function followLinks(path: string): string {
  let current = resolve(path);
  for (let hops = 0; hops < 40; hops += 1) {
    let isLink = false;
    try { isLink = lstatSync(current).isSymbolicLink(); } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return current;
      throw err;
    }
    if (!isLink) return current;
    // A link's parent may itself be a link: resolve it first, so a relative target is read from the right place.
    const parent = existsSync(dirname(current)) ? realpathSync(dirname(current)) : dirname(current);
    current = resolve(parent, readlinkSync(current));
  }
  throw new Error(`Receipt ledger path ${path} has too many symbolic links`);
}

/**
 * Takes the dispatch turn for one capability on one ledger: first in this process (calls queue in
 * order), then across processes through a pid lock beside the ledger. Both are keyed on the
 * ledger's canonical identity (ledgerIdentity), so aliases of one file share one turn. The turn is
 * held from the suspension check through the provider call to the outcome receipt. Waiting is
 * bounded by `waitMs` in-process and across processes; a timeout throws and nothing is held.
 *
 * Stale locks: the cross-process lock records its owner pid. A lock whose pid is no longer alive
 * is reclaimed automatically by atomic rename (FileLock). If the pid was reused by an unrelated
 * live process, calls fail closed with capability_busy; after confirming no Alexandria process is
 * dispatching, the operator removes the `.cap-*.lock` directory named in the error.
 */
export async function capabilityTurn(ledgerPath: string, capabilityId: string, waitMs = 5000): Promise<() => void> {
  const { key: ledgerKey, lockBase } = ledgerIdentity(ledgerPath);
  const key = `${ledgerKey}\u0000${capabilityId}`;
  const previous = capabilityTurns.get(key) ?? Promise.resolve();
  let finish!: () => void;
  const mine = new Promise<void>((resolve) => { finish = resolve; });
  const chained = previous.then(() => mine);
  capabilityTurns.set(key, chained);
  // Releasing our place lets later calls through once `previous` settles; they still queue behind it.
  const done = () => { finish(); if (capabilityTurns.get(key) === chained) capabilityTurns.delete(key); };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = await Promise.race([
    previous.then(() => false),
    new Promise<boolean>((resolve) => { timer = setTimeout(() => resolve(true), waitMs); }),
  ]);
  clearTimeout(timer);
  if (timedOut) {
    done();
    throw new Error(`another call in this process has held the ${capabilityId} turn for over ${waitMs} ms`);
  }
  const lock = new FileLock(`${lockBase}.cap-${createHash('sha256').update(capabilityId).digest('hex').slice(0, 16)}.lock`);
  try { lock.acquire({ waitMs }); } catch (err) { done(); throw err; }
  let released = false;
  return () => { if (released) return; released = true; lock.release(); done(); };
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
