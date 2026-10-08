/**
 * Starlight Alexandria — the router (Synthesis entry point).
 *
 * `Alexandria.execute()` is the one door every agent walks through to get a
 * catalogued record. It: resolves a need to a capability (or takes an explicit
 * id), checks the contract's required options, prices the call against the
 * session budget *before* making it, hands the call to the transport for the
 * provider's kind, and returns records plus a receipt that is also appended to
 * the ledger. Budget is enforced fail-closed: an over-budget call never runs.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { Library } from './catalog.js';
import { buildReceipt, ReceiptLedger } from './receipts.js';
import type { AlexandriaCall, Budget, CallResult, FindHit, ProviderKind, Receipt, Transport } from './types.js';

export class AlexandriaError extends Error {
  constructor(readonly code: 'unknown_capability' | 'no_match' | 'unmet_requirement' | 'over_budget' | 'no_transport' | 'connector_not_executable', message: string, readonly hint: string) {
    super(message);
  }
}

export interface ExecuteRequest {
  /** Natural-language need, resolved through the Library. Ignored when `capabilityId` is set. */
  need?: string;
  capabilityId?: string;
  options?: Record<string, unknown>;
  /** Expected record count, only used to price per-record capabilities up front. */
  expectedRecords?: number;
  /** SIP layers the resulting record composes. Empty = no attestation block. */
  sipLayers?: readonly string[];
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

export class Alexandria {
  readonly library: Library;
  readonly budget: Budget;
  private readonly transports = new Map<ProviderKind, Transport>();
  private readonly ledger?: ReceiptLedger;
  private readonly now?: () => string;

  constructor(opts: { library: Library; transports: readonly Transport[]; maxCredits: number; ledger?: ReceiptLedger; now?: () => string }) {
    this.library = opts.library;
    this.budget = { maxCredits: opts.maxCredits, spent: opts.ledger ? opts.ledger.spent() : 0 };
    for (const t of opts.transports) this.transports.set(t.kind, t);
    this.ledger = opts.ledger;
    this.now = opts.now;
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

  async execute(req: ExecuteRequest): Promise<ExecuteResponse> {
    const hit = this.resolve(req);
    const options = req.options ?? {};
    if (hit.provider.kind === 'connector') {
      throw new AlexandriaError('connector_not_executable', `${hit.capability.id} is a connector and cannot be executed as a data capability`, 'Connectors are called by the swarm runtime. See verticals/alexandria/catalog/connectors.json.');
    }
    const unmet = this.library.unmetRequirement(hit.capability.id, options);
    if (unmet) throw new AlexandriaError('unmet_requirement', `${hit.capability.id} needs one of: ${unmet.join(', ')}`, 'Supply one of the listed options and call again; nothing was charged.');
    const price = this.library.estimate(hit.capability.id, req.expectedRecords ?? 1);
    if (this.budget.spent + price > this.budget.maxCredits) {
      throw new AlexandriaError('over_budget', `Call would cost ${price} credits; ${this.budget.maxCredits - this.budget.spent} remain of ${this.budget.maxCredits}`, 'Raise maxCredits for this session or pick a cheaper capability from alexandria_plan.');
    }
    const transport = this.transports.get(hit.provider.kind);
    if (!transport) throw new AlexandriaError('no_transport', `No transport registered for ${hit.provider.kind}`, 'Register a transport for this provider kind (FirecrawlTransport needs FIRECRAWL_API_KEY).');
    const call: AlexandriaCall = { provider: hit.provider.id, capability: hit.capability.capability, options };
    const [result] = await transport.execute([call]);
    if (!result.error) this.budget.spent += result.creditsCost;
    const receiptInput: Parameters<typeof buildReceipt>[0] = { result, provider: hit.provider, options, sipLayers: req.sipLayers ?? [] };
    if (this.now) receiptInput.now = this.now;
    const receipt = buildReceipt(receiptInput);
    this.ledger?.append(receipt);
    return { hit, result, receipt, budget: { ...this.budget } };
  }
}
