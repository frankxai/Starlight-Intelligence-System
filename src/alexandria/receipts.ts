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
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
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
}

export function buildReceipt({ result, provider, options, sessionId, reserved, sipLayers = [], now, pending = false }: ReceiptInput): Receipt {
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
    // A pending line holds the reservation. A definite failure is not billed. An uncertain
    // outcome holds the reservation until a retry with the same request id settles it; a success
    // with no reported charge holds it too.
    creditsCost: pending ? reserved : result.error ? (result.error.code === 'uncertain_outcome' ? reserved : 0) : result.chargeUnknown ? reserved : result.creditsCost,
    source: provider.source,
    redistribution: provider.redistribution?.policy ?? 'not-cleared',
    sipLayers,
  };
  if (pending) receipt.pending = true;
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

/** Append-only JSONL ledger. One line per receipt; never rewritten. Files are created owner-only. */
export class ReceiptLedger {
  constructor(readonly path: string) {}

  append(receipt: Receipt): void {
    mkdirSync(dirname(this.path), { recursive: true, mode: DIR_MODE });
    this.quarantinePartialTail();
    appendFileSync(this.path, JSON.stringify(receipt) + '\n', { encoding: 'utf8', mode: FILE_MODE });
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
    writeFileSync(this.path, content.slice(0, cut), { encoding: 'utf8', mode: FILE_MODE });
    return true;
  }

  /**
   * Reads the ledger. A cut-off final line is reported, not fatal; a malformed line anywhere
   * else means the file was edited or corrupted and is refused, because a ledger that is
   * silently wrong is worse than one that is loudly unreadable.
   */
  readDetailed(): LedgerRead {
    if (!existsSync(this.path)) return { receipts: [], truncatedTail: false };
    const lines = readFileSync(this.path, 'utf8').split('\n').filter((line) => line.trim().length > 0);
    const receipts: Receipt[] = [];
    let truncatedTail = false;
    lines.forEach((line, i) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(line);
      } catch (err) {
        if (i === lines.length - 1) { truncatedTail = true; return; }
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
  if (r.requestId !== undefined && typeof r.requestId !== 'string') return 'requestId is not a string';
  if (typeof r.callFingerprint !== 'string') return 'callFingerprint missing';
  return null;
}

/** Lock paths this process holds, so a second instance in the same process cannot share a session. */
const heldInProcess = new Set<string>();

/**
 * Exclusive lock on a budget session. Two processes resuming the same session would each
 * reserve against their own in-memory copy of the spend, so a resumed session is held by
 * exactly one live process. The lock is a file beside the ledger holding the owner's pid;
 * a lock whose pid is no longer alive is stale and is taken over. Two instances in one process
 * would have separate in-memory budgets too, so the second owner is refused as well.
 */
export class SessionLock {
  readonly path: string;
  private held = false;

  constructor(ledgerPath: string, readonly sessionId: string) {
    const safe = sessionId.replace(/[^A-Za-z0-9_.-]/g, '_');
    this.path = `${ledgerPath}.${safe}.lock`;
  }

  acquire(): void {
    if (this.held) return;
    if (heldInProcess.has(this.path)) {
      throw new Error(`Budget session ${this.sessionId} is already held by another Alexandria instance in this process (${this.path}); reuse that instance or choose another session`);
    }
    mkdirSync(dirname(this.path), { recursive: true, mode: DIR_MODE });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const fd = openSync(this.path, 'wx', FILE_MODE);
        writeFileSync(fd, String(process.pid), 'utf8');
        closeSync(fd);
        this.held = true;
        heldInProcess.add(this.path);
        return;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
        let owner: number;
        try { owner = Number(readFileSync(this.path, 'utf8').trim()); } catch { continue; /* removed between our open and read; retry */ }
        // Our own pid but not in heldInProcess: a leftover from an earlier life of this pid, so stale.
        if (owner !== process.pid && isAlive(owner)) throw new Error(`Budget session ${this.sessionId} is held by process ${owner} (${this.path}); resume it from that process or choose another session`);
        // Claim the stale file by renaming it: rename is atomic, so of two processes recovering the
        // same stale lock only one succeeds, and neither can unlink a lock the other just created.
        const claim = `${this.path}.stale.${process.pid}.${attempt}`;
        try { renameSync(this.path, claim); unlinkSync(claim); } catch { /* another process claimed it; the retry sees their fresh lock */ }
      }
    }
    throw new Error(`Could not acquire the lock for budget session ${this.sessionId} (${this.path})`);
  }

  release(): void {
    if (!this.held) return;
    this.held = false;
    heldInProcess.delete(this.path);
    try {
      if (Number(readFileSync(this.path, 'utf8').trim()) === process.pid) unlinkSync(this.path);
    } catch { /* already gone */ }
  }
}

function isAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (err) { return (err as NodeJS.ErrnoException).code === 'EPERM'; }
}
