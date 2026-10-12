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
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
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
    appendFileSync(this.path, JSON.stringify(receipt) + '\n', 'utf8');
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
