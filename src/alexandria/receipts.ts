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
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
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
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function hashRecords(records: unknown[]): string {
  return 'sha256:' + createHash('sha256').update(canonicalJson(records)).digest('hex');
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
}

export function buildReceipt({ result, provider, options, sessionId, reserved, sipLayers = [], now }: ReceiptInput): Receipt {
  const receipt: Receipt = {
    id: `rcpt_${randomUUID()}`,
    issuedAt: now ? now() : new Date().toISOString(),
    observedAt: result.observedAt,
    sessionId,
    provider: result.provider,
    capability: result.capability,
    options,
    recordCount: result.records.length,
    contentHash: hashRecords(result.records),
    reserved,
    creditsCost: result.error ? 0 : result.creditsCost,
    source: provider.source,
    sipLayers,
  };
  if (result.requestId) receipt.requestId = result.requestId;
  if (provider.attribution) receipt.attribution = provider.attribution;
  // Earned, never decorative: a failed or empty call composed nothing.
  if (sipLayers.length > 0 && !result.error && result.records.length > 0) {
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

/** Append-only JSONL ledger. One line per receipt; never rewritten. */
export class ReceiptLedger {
  constructor(readonly path: string) {}

  append(receipt: Receipt): void {
    mkdirSync(dirname(this.path), { recursive: true });
    this.quarantinePartialTail();
    appendFileSync(this.path, JSON.stringify(receipt) + '\n', 'utf8');
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
    appendFileSync(this.quarantinePath, `${new Date().toISOString()}\t${fragment}\n`, 'utf8');
    writeFileSync(this.path, content.slice(0, cut), 'utf8');
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
      try {
        receipts.push(JSON.parse(line) as Receipt);
      } catch (err) {
        if (i === lines.length - 1) truncatedTail = true;
        else throw new Error(`Receipt ledger ${this.path} is corrupt at line ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
    return { receipts, truncatedTail };
  }

  read(): Receipt[] {
    return this.readDetailed().receipts;
  }

  /** Credits spent in one session (errors excluded; a failed call is not billed). Without a session id: the whole ledger. */
  spent(sessionId?: string): number {
    return this.read()
      .filter((r) => !r.error && (sessionId === undefined || r.sessionId === sessionId))
      .reduce((sum, r) => sum + r.creditsCost, 0);
  }
}

/**
 * Exclusive lock on a budget session. Two processes resuming the same session would each
 * reserve against their own in-memory copy of the spend, so a resumed session is held by
 * exactly one live process. The lock is a file beside the ledger holding the owner's pid;
 * a lock whose pid is no longer alive is stale and is taken over. Re-entrant within one process.
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
    mkdirSync(dirname(this.path), { recursive: true });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const fd = openSync(this.path, 'wx');
        writeFileSync(fd, String(process.pid), 'utf8');
        closeSync(fd);
        this.held = true;
        return;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
        const owner = Number(readFileSync(this.path, 'utf8').trim());
        if (owner === process.pid) { this.held = true; return; }
        if (isAlive(owner)) throw new Error(`Budget session ${this.sessionId} is held by process ${owner} (${this.path}); resume it from that process or choose another session`);
        try { unlinkSync(this.path); } catch { /* lost the race; retry once */ }
      }
    }
    throw new Error(`Could not acquire the lock for budget session ${this.sessionId} (${this.path})`);
  }

  release(): void {
    if (!this.held) return;
    this.held = false;
    try {
      if (Number(readFileSync(this.path, 'utf8').trim()) === process.pid) unlinkSync(this.path);
    } catch { /* already gone */ }
  }
}

function isAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (err) { return (err as NodeJS.ErrnoException).code === 'EPERM'; }
}
