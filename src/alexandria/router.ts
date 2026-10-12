/**
 * Starlight Alexandria — the router (Synthesis entry point).
 *
 * `Alexandria.execute()` is the one door every agent walks through to get a
 * catalogued record. It: resolves a need to a capability (or takes an explicit
 * id), validates options against the contract, prices the call, reserves the
 * price against the session budget *before* the transport is touched, hands
 * the call to the transport for the provider's kind, reconciles the
 * reservation with what the provider charged, and returns records plus a
 * receipt that is also appended to the ledger.
 *
 * Fail-closed rules:
 *   - an over-budget call never runs;
 *   - a per-record capability runs only with a declared record ceiling, and the
 *     reservation is that ceiling times the per-record price;
 *   - reservations are taken synchronously, so concurrent calls cannot both
 *     pass the gate on the same credits;
 *   - spend is restored per session from the ledger, never across sessions.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { randomUUID } from 'node:crypto';
import { Library } from './catalog.js';
import { buildReceipt, ReceiptLedger, SessionLock } from './receipts.js';
import type { AlexandriaCall, Budget, CallResult, FindHit, ProviderKind, Receipt, Transport } from './types.js';

export type AlexandriaErrorCode =
  | 'unknown_capability'
  | 'no_match'
  | 'unmet_requirement'
  | 'invalid_option'
  | 'unbounded_records'
  | 'over_budget'
  | 'no_transport'
  | 'connector_not_executable'
  | 'uncertain_outcome';

export class AlexandriaError extends Error {
  constructor(readonly code: AlexandriaErrorCode, message: string, readonly hint: string, readonly requestId?: string) {
    super(message);
  }
}

export interface ExecuteRequest {
  /** Natural-language need, resolved through the Library. Ignored when `capabilityId` is set. */
  need?: string;
  capabilityId?: string;
  options?: Record<string, unknown>;
  /** Record ceiling for per-record capabilities. Required for them; the reservation is this times the per-record price. */
  expectedRecords?: number;
  /** SIP layers the resulting record composes. Empty = no attestation block. */
  sipLayers?: readonly string[];
  /** Reuse the id of an uncertain earlier call so the provider treats the retry as the same request. */
  requestId?: string;
}

export interface ExecuteResponse {
  hit: FindHit;
  result: CallResult;
  receipt: Receipt;
  budget: Budget;
}

export interface Plan {
  need: string;
  candidates: { capabilityId: string; provider: string; score: number; creditsCost: number; perRecord: boolean; requiresOneOf?: readonly (readonly string[])[] }[];
  /** Cheapest capability among the top-scored tier. */
  recommended?: string;
}

export interface AlexandriaOptions {
  library: Library;
  transports: readonly Transport[];
  /** Hard ceiling in credits for this session. Must be a finite, non-negative number. */
  maxCredits: number;
  /** Budget session. Defaults to a fresh id, so a new process starts with a fresh allowance; pass the old id to resume one. */
  sessionId?: string;
  ledger?: ReceiptLedger;
  /** Hold an exclusive lock on the session beside the ledger (default true when a ledger is given), so two processes cannot reserve against the same credits. */
  lock?: boolean;
  now?: () => string;
}

export class Alexandria {
  readonly library: Library;
  readonly budget: Budget;
  private readonly transports = new Map<ProviderKind, Transport>();
  private readonly ledger?: ReceiptLedger;
  private readonly lock?: SessionLock;
  private readonly now?: () => string;

  constructor(opts: AlexandriaOptions) {
    if (typeof opts.maxCredits !== 'number' || !Number.isFinite(opts.maxCredits) || opts.maxCredits < 0) {
      throw new Error(`maxCredits must be a finite, non-negative number; got ${String(opts.maxCredits)}`);
    }
    this.library = opts.library;
    const sessionId = opts.sessionId ?? randomUUID();
    if (opts.ledger && (opts.lock ?? true)) {
      this.lock = new SessionLock(opts.ledger.path, sessionId);
      this.lock.acquire();
    }
    this.budget = { sessionId, maxCredits: opts.maxCredits, spent: opts.ledger ? opts.ledger.spent(sessionId) : 0 };
    for (const t of opts.transports) this.transports.set(t.kind, t);
    this.ledger = opts.ledger;
    this.now = opts.now;
  }

  /** Releases the session lock. Call when the process is done with the session. */
  close(): void {
    this.lock?.release();
  }

  plan(need: string, limit = 5): Plan {
    const hits = this.library.find(need, { limit });
    const candidates = hits.map((h) => {
      const c: Plan['candidates'][number] = { capabilityId: h.capability.id, provider: h.provider.id, score: h.score, creditsCost: h.capability.creditsCost, perRecord: h.capability.perRecord };
      if (h.capability.requiresOneOf) c.requiresOneOf = h.capability.requiresOneOf;
      return c;
    });
    const plan: Plan = { need, candidates };
    if (hits.length > 0) {
      const top = hits[0].score;
      const tier = hits.filter((h) => h.score === top);
      tier.sort((a, b) => a.capability.creditsCost - b.capability.creditsCost || a.capability.id.localeCompare(b.capability.id));
      plan.recommended = tier[0].capability.id;
    }
    return plan;
  }

  resolve(req: ExecuteRequest): FindHit {
    if (req.capabilityId) {
      const hit = this.library.get(req.capabilityId);
      if (!hit) throw new AlexandriaError('unknown_capability', `Unknown capability: ${req.capabilityId}`, 'Call alexandria_find with a need, or check verticals/alexandria/catalog/providers.json.');
      return hit;
    }
    const need = (req.need ?? '').trim();
    const plan = this.plan(need, 1);
    if (!plan.recommended) throw new AlexandriaError('no_match', `No catalogued capability matches: ${need}`, 'Rephrase with the entity type (wallet, company, paper, series) or add a provider to the catalogue.');
    const hit = this.library.get(plan.recommended);
    if (!hit) throw new AlexandriaError('no_match', 'Planner returned an unknown capability', 'This is a bug; report it.');
    return hit;
  }

  /** Everything that must hold before a credit is reserved. Throws an AlexandriaError; charges nothing. */
  private admit(req: ExecuteRequest): { hit: FindHit; options: Record<string, unknown>; price: number; transport: Transport } {
    const hit = this.resolve(req);
    const options = req.options ?? {};
    if (hit.provider.kind === 'connector') {
      throw new AlexandriaError('connector_not_executable', `${hit.capability.id} is a connector and cannot be executed as a data capability`, 'Connectors are called by the swarm runtime. See verticals/alexandria/catalog/connectors.json.');
    }
    const problems = this.library.validateOptions(hit.capability.id, options);
    if (problems.length > 0) {
      const code = problems[0].startsWith('needs one of') ? 'unmet_requirement' : 'invalid_option';
      throw new AlexandriaError(code, `${hit.capability.id}: ${problems.join('; ')}`, 'Fix the options per the capability contract and call again; nothing was charged.');
    }
    let records = 1;
    if (hit.capability.perRecord) {
      if (!Number.isInteger(req.expectedRecords) || (req.expectedRecords as number) < 1) {
        throw new AlexandriaError('unbounded_records', `${hit.capability.id} bills per record; declare expectedRecords so the maximum charge can be reserved`, 'Pass expectedRecords (a positive integer) and, where the provider offers one, a matching page-size option.');
      }
      records = req.expectedRecords as number;
    }
    const price = this.library.estimate(hit.capability.id, records);
    if (this.budget.spent + price > this.budget.maxCredits) {
      throw new AlexandriaError('over_budget', `Call would cost ${price} credits; ${this.budget.maxCredits - this.budget.spent} remain of ${this.budget.maxCredits}`, 'Raise maxCredits for this session or pick a cheaper capability from alexandria_plan.');
    }
    const transport = this.transports.get(hit.provider.kind);
    if (!transport) throw new AlexandriaError('no_transport', `No transport registered for ${hit.provider.kind}`, 'Register a transport for this provider kind (FirecrawlTransport needs FIRECRAWL_API_KEY).');
    return { hit, options, price, transport };
  }

  async execute(req: ExecuteRequest): Promise<ExecuteResponse> {
    const { hit, options, price, transport } = this.admit(req);
    // Reserve synchronously: no await sits between the gate and the reservation, so two
    // concurrent calls cannot both be admitted against the same remaining credits.
    this.budget.spent += price;
    // The idempotency key is minted here, before the transport, so it survives a transport
    // failure: the caller gets it back and retries with the same id instead of paying twice.
    const requestId = req.requestId ?? randomUUID();
    const call: AlexandriaCall = { provider: hit.provider.id, capability: hit.capability.capability, options, requestId };
    let result: CallResult;
    try {
      [result] = await transport.execute([call]);
    } catch (err) {
      this.budget.spent -= price;
      const message = err instanceof Error ? err.message : String(err);
      const failed: CallResult = { provider: hit.provider.id, capability: hit.capability.capability, records: [], creditsCost: 0, observedAt: this.now ? this.now() : new Date().toISOString(), requestId, error: { code: 'transport_failure', message } };
      const receiptInput: Parameters<typeof buildReceipt>[0] = { result: failed, provider: hit.provider, options, sessionId: this.budget.sessionId, reserved: price, sipLayers: [] };
      if (this.now) receiptInput.now = this.now;
      this.ledger?.append(buildReceipt(receiptInput));
      throw new AlexandriaError('uncertain_outcome', `${hit.capability.id}: transport failed after the request may have reached the provider (${message})`, `The provider may have billed this call. Retry with requestId ${requestId} so the provider treats it as the same request; the id is on the receipt in the ledger.`, requestId);
    }
    // Reconcile: a failed call is not billed; a successful one is billed at what the provider charged.
    const actual = result.error ? 0 : result.creditsCost;
    this.budget.spent += actual - price;
    const receiptInput: Parameters<typeof buildReceipt>[0] = { result, provider: hit.provider, options, sessionId: this.budget.sessionId, reserved: price, sipLayers: req.sipLayers ?? [] };
    if (this.now) receiptInput.now = this.now;
    const receipt = buildReceipt(receiptInput);
    this.ledger?.append(receipt);
    return { hit, result, receipt, budget: { ...this.budget } };
  }
}
