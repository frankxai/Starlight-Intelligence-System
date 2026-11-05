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
 *   - a per-record capability runs only with a declared record ceiling, the
 *     reservation is that ceiling times the per-record price, and the ceiling is
 *     sent to the provider as its own record-limit option;
 *   - for a paid call a pending receipt holding the reservation is written to
 *     the ledger before the transport runs, so a crash in between loses nothing;
 *   - reservations are taken synchronously, so concurrent calls cannot both
 *     pass the gate on the same credits;
 *   - a call whose outcome is uncertain (the transport failed after the request
 *     may have reached the provider) keeps its reservation until a retry with
 *     the same request id settles it, so other calls cannot spend those credits;
 *   - a success whose charge the provider did not report keeps its reservation;
 *   - spend is restored per session from the ledger, never across sessions.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { randomUUID } from 'node:crypto';
import { Library } from './catalog.js';
import { buildReceipt, callFingerprint, capabilityTurn, FileLock, ReceiptLedger, SessionLock, TornTailError } from './receipts.js';
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
  | 'unreconciled_capability'
  | 'invalid_sip_layer'
  | 'retry_mismatch'
  | 'invalid_request_id'
  | 'capability_suspended'
  | 'uncertain_outcome'
  | 'receipt_persist_failed'
  | 'capability_busy'
  | 'session_closed'
  | 'replay_completed';

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
  /** The provider charged more than was reserved; the capability is now suspended. */
  overrun?: boolean;
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

/** SIP layer names as they appear in attestation blocks: lower-case slugs, nothing that could break the rendered block. */
const SIP_LAYER_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

export class Alexandria {
  readonly library: Library;
  readonly budget: Budget;
  private readonly transports = new Map<ProviderKind, Transport>();
  private readonly ledger?: ReceiptLedger;
  private readonly lock?: SessionLock;
  private readonly now?: () => string;
  /** Reservations held by pending or uncertain calls, keyed by request id. Part of `budget.spent` until settled. */
  private readonly held = new Map<string, { amount: number; fingerprint: string }>();
  /** Requests executed and settled in this session, keyed by request id. Replays are rejected without reserving or billing. */
  private readonly settled = new Map<string, { fingerprint: string }>();
  /**
   * Calls that have reserved but not yet settled, keyed by request id.
   * A duplicate that arrives while the provider call is still running joins this promise.
   * It is not in `settled` or `held` during that window, so without this map it would reserve and dispatch again.
   */
  private readonly inflight = new Map<string, { fingerprint: string; promise: Promise<ExecuteResponse> }>();
  /** Capabilities whose provider once charged more than was reserved. Refused until the catalogue is reconciled. */
  private readonly suspended = new Set<string>();
  /** Set by close(). A closed instance no longer holds the session lock, so it must not spend. */
  private closed = false;

  constructor(opts: AlexandriaOptions) {
    if (typeof opts.maxCredits !== 'number' || !Number.isFinite(opts.maxCredits) || opts.maxCredits < 0) {
      throw new Error(`maxCredits must be a finite, non-negative number; got ${String(opts.maxCredits)}`);
    }
    this.library = opts.library;
    if (opts.sessionId !== undefined && (typeof opts.sessionId !== 'string' || opts.sessionId.trim() === '')) {
      throw new Error('sessionId must be a non-empty string when given; omit it to start a new session');
    }
    const sessionId = opts.sessionId ?? randomUUID();
    if (opts.ledger && (opts.lock ?? true)) {
      this.lock = new SessionLock(opts.ledger.path, sessionId);
      this.lock.acquire();
    }
    // Everything after the lock is taken runs under a release-on-failure guard: a corrupt ledger
    // or a refused ceiling must not leave the session locked for the rest of this process.
    try {
      // A resumed session keeps the ceiling it was opened with. Raising it would be an unrecorded
      // authorisation of more spend under the same session; open a new session for a new ceiling.
      const recorded = opts.ledger ? opts.ledger.sessionCeiling(sessionId) : undefined;
      if (recorded !== undefined && opts.maxCredits > recorded) {
        throw new Error(`Budget session ${sessionId} was opened with a ceiling of ${recorded} credits; resuming it with ${opts.maxCredits} would raise the ceiling. Resume with at most ${recorded}, or start a new session.`);
      }
      this.budget = { sessionId, maxCredits: opts.maxCredits, spent: opts.ledger ? opts.ledger.spent(sessionId) : 0 };
      if (opts.ledger) {
        for (const [id, hold] of opts.ledger.heldReservations(sessionId)) this.held.set(id, hold);
        for (const [id, s] of opts.ledger.settledReceipts(sessionId)) this.settled.set(id, { fingerprint: s.fingerprint });
        // A torn ledger tail does not stop the session opening; admission re-reads and fails closed.
        try {
          for (const id of opts.ledger.suspendedCapabilities(opts.library.catalog.reconciledAt)) this.suspended.add(id);
        } catch (err) {
          if (!(err instanceof TornTailError)) throw err;
        }
      }
    } catch (err) {
      this.lock?.release();
      throw err;
    }
    for (const t of opts.transports) this.transports.set(t.kind, t);
    this.ledger = opts.ledger;
    this.now = opts.now;
  }

  /** Releases the session lock. Call when the process is done with the session. */
  close(): void {
    this.closed = true;
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

  /**
   * Everything that must hold before a credit is reserved. Throws an AlexandriaError; charges
   * nothing. `alreadyHeld` is the reservation an uncertain earlier call with the same request id
   * still holds; only the difference has to fit in the budget.
   */
  /**
   * Normalizes request options, bounds per-record limits, validates against the catalogue contract,
   * and computes the call fingerprint. Throws an AlexandriaError without checking budget or transport.
   */
  private normalize(req: ExecuteRequest): { hit: FindHit; options: Record<string, unknown>; fingerprint: string; records: number } {
    const hit = this.resolve(req);
    let options = req.options ?? {};
    let records = 1;
    if (hit.capability.perRecord) {
      if (!Number.isInteger(req.expectedRecords) || (req.expectedRecords as number) < 1) {
        throw new AlexandriaError('unbounded_records', `${hit.capability.id} bills per record; declare expectedRecords so the maximum charge can be reserved`, 'Pass expectedRecords (a positive integer); the router sends it to the provider as the record limit.');
      }
      records = req.expectedRecords as number;
      // The ceiling is only a ceiling if the provider is told it. The catalogue names the option
      // that bounds the result; without one, a per-record capability cannot run.
      const limitOption = hit.capability.recordLimitOption;
      if (!limitOption) {
        throw new AlexandriaError('unbounded_records', `${hit.capability.id} bills per record but its contract declares no record-limit option, so the reservation could not be enforced at the provider`, 'Add recordLimitOption to the capability in verticals/alexandria/catalog/providers.json once the provider contract offers a bound.');
      }
      const supplied = options[limitOption];
      if (supplied !== undefined && supplied !== null && supplied !== '' && !(typeof supplied === 'number' && supplied <= records)) {
        throw new AlexandriaError('unbounded_records', `${hit.capability.id}: ${limitOption}=${String(supplied)} exceeds expectedRecords=${records}`, `Lower ${limitOption}, or raise expectedRecords so the reservation covers it.`);
      }
      options = { ...options, [limitOption]: typeof supplied === 'number' ? supplied : records };
    }
    const problems = this.library.validateOptions(hit.capability.id, options);
    if (problems.length > 0) {
      const code = problems[0].startsWith('needs one of') ? 'unmet_requirement' : 'invalid_option';
      throw new AlexandriaError(code, `${hit.capability.id}: ${problems.join('; ')}`, 'Fix the options per the capability contract and call again; nothing was charged.');
    }
    const fingerprint = callFingerprint(hit.capability.id, options);
    return { hit, options, fingerprint, records };
  }

  /**
   * Everything that must hold before a credit is reserved. Throws an AlexandriaError; charges
   * nothing. `alreadyHeld` is the reservation an uncertain earlier call with the same request id
   * still holds; only the difference has to fit in the budget.
   */
  private admit(req: ExecuteRequest, alreadyHeld = 0): { hit: FindHit; options: Record<string, unknown>; price: number; transport: Transport } {
    const { hit, options, records } = this.normalize(req);
    if (hit.provider.kind === 'connector') {
      throw new AlexandriaError('connector_not_executable', `${hit.capability.id} is a connector and cannot be executed as a data capability`, 'Connectors are called by the swarm runtime. See verticals/alexandria/catalog/connectors.json.');
    }
    // Another process on the same ledger may have recorded an overrun since this instance was
    // built, so the ledger-backed suspensions are re-read before every admission.
    if (this.ledger) {
      // An unreadable ledger fails closed: the call is not sent.
      try {
        for (const id of this.ledger.suspendedCapabilities(this.library.catalog.reconciledAt)) this.suspended.add(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new AlexandriaError('receipt_persist_failed', `${hit.capability.id}: the ledger could not be read to check suspensions, so the call was not sent (${message})`, `Fix the ledger path (${this.ledger.path}) and call again; nothing was charged.`);
      }
    }
    if (this.suspended.has(hit.capability.id)) {
      throw new AlexandriaError('capability_suspended', `${hit.capability.id} is suspended: its provider once charged more than was reserved (see the overrun receipt in the ledger)`, 'Reconcile the capability price and record-limit contract in verticals/alexandria/catalog/providers.json and bump the catalogue reconciledAt past the overrun date; the overrun receipt is the evidence and the reconciliation is the audit record that clears it.');
    }
    if (hit.capability.status === 'unreconciled') {
      throw new AlexandriaError('unreconciled_capability', `${hit.capability.id} is catalogued but its path and terms are not yet reconciled against the live contract`, 'Reconcile the capability in verticals/alexandria/catalog/providers.json (see MEMORY.md, open reconciliation) and clear its status before executing it.');
    }
    const badLayer = (req.sipLayers ?? []).find((layer) => typeof layer !== 'string' || !SIP_LAYER_RE.test(layer));
    if (badLayer !== undefined) {
      throw new AlexandriaError('invalid_sip_layer', `sipLayers must be lower-case slugs such as file-contract or attestation; got ${JSON.stringify(badLayer)}`, 'Name the SIP layers the record composes, per SIP.md, or omit sipLayers; nothing was charged.');
    }
    const price = this.library.estimate(hit.capability.id, records);
    if (this.budget.spent + price - alreadyHeld > this.budget.maxCredits) {
      throw new AlexandriaError('over_budget', `Call would cost ${price} credits; ${this.budget.maxCredits - this.budget.spent} remain of ${this.budget.maxCredits}`, 'Raise maxCredits for this session or pick a cheaper capability from alexandria_plan.');
    }
    const transport = this.transports.get(hit.provider.kind);
    if (!transport) throw new AlexandriaError('no_transport', `No transport registered for ${hit.provider.kind}`, 'Register a transport for this provider kind (FirecrawlTransport needs FIRECRAWL_API_KEY).');
    return { hit, options, price, transport };
  }

  async execute(req: ExecuteRequest): Promise<ExecuteResponse> {
    if (this.closed) {
      throw new AlexandriaError('session_closed', `Budget session ${this.budget.sessionId} was closed and its lock released`, 'Construct a new Alexandria to resume the session; it re-acquires the lock and reloads the ledger. Nothing was charged.');
    }
    // A blank id would be dropped from the receipt and its hold could never be restored, so it
    // is refused rather than silently replaced.
    if (req.requestId !== undefined && (typeof req.requestId !== 'string' || req.requestId.trim() === '')) {
      throw new AlexandriaError('invalid_request_id', 'requestId must be a non-empty string when given', 'Omit requestId for a new call, or pass the exact id returned by the uncertain call you are retrying; nothing was charged.');
    }
    let settled = req.requestId ? this.settled.get(req.requestId) : undefined;
    if (req.requestId && !settled && this.ledger) {
      try {
        settled = this.ledger.settledReceipts(this.budget.sessionId).get(req.requestId);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new AlexandriaError('receipt_persist_failed', `the ledger could not be read to check replays (${message})`, `Fix the ledger path (${this.ledger.path}) and call again; nothing was charged.`, req.requestId);
      }
    }
    if (settled) {
      const { fingerprint } = this.normalize(req);
      if (settled.fingerprint !== fingerprint) {
        throw new AlexandriaError('retry_mismatch', `requestId ${req.requestId} belongs to a different call (capability or options differ)`, 'Retry with exactly the capability and options of the original call, or mint a new request for a different call.', req.requestId);
      }
      throw new AlexandriaError('replay_completed', `requestId ${req.requestId} was already executed and settled in session ${this.budget.sessionId}`, 'This request was already settled; nothing was reserved or charged. Mint a new request for a different call.', req.requestId);
    }
    // A settled check does not see a call that has reserved and is still at the provider: that
    // request is neither settled nor held. Joining its promise is what keeps a timeout retry, or
    // a second tools/call read from stdin before the first returns, from paying twice.
    if (req.requestId) {
      const flight = this.inflight.get(req.requestId);
      if (flight) {
        const { fingerprint } = this.normalize(req);
        if (flight.fingerprint !== fingerprint) {
          throw new AlexandriaError('retry_mismatch', `requestId ${req.requestId} belongs to a different call that is still running (capability or options differ)`, 'Wait for that call to finish, then retry with exactly its capability and options, or mint a new request for a different call.', req.requestId);
        }
        return flight.promise;
      }
    }
    // A retry of a held call reuses its reservation instead of taking a second one, and only
    // for the same call: the hold is bound to the capability and options it was taken for.
    const hold = req.requestId ? this.held.get(req.requestId) : undefined;
    const { hit, options: admitted, price, transport } = this.admit(req, hold?.amount ?? 0);
    // Snapshot the validated options before the first await: the caller still holds the object
    // and could change it while this call waits for its turn, after it was validated and priced.
    const options = structuredClone(admitted);
    const fingerprint = callFingerprint(hit.capability.id, options);
    if (hold && hold.fingerprint !== fingerprint) {
      throw new AlexandriaError('retry_mismatch', `requestId ${req.requestId} belongs to a different call (capability or options differ); its ${hold.amount} reserved credits stay held`, 'Retry with exactly the capability and options of the original call, or mint a new request for a different call.', req.requestId);
    }
    const alreadyHeld = hold?.amount ?? 0;
    // The reservation never shrinks on a retry: the original request may already have been
    // billed at the old price, so the hold stays at least that large until a charge is known.
    const reserved = Math.max(price, alreadyHeld);
    // Reserve synchronously: no await sits between the gate and the reservation, so two
    // concurrent calls cannot both be admitted against the same remaining credits.
    this.budget.spent += reserved - alreadyHeld;
    // The idempotency key is minted here, before the transport, so it survives a transport
    // failure: the caller gets it back and retries with the same id instead of paying twice.
    const requestId = req.requestId ?? randomUUID();
    this.held.delete(requestId);
    const observedAt = this.now ? this.now() : new Date().toISOString();
    const blank: CallResult = { provider: hit.provider.id, capability: hit.capability.capability, records: [], creditsCost: 0, observedAt, requestId };
    const receiptFor = (result: CallResult, extra: Partial<Parameters<typeof buildReceipt>[0]> = {}) => {
      const input: Parameters<typeof buildReceipt>[0] = { result, provider: hit.provider, options, sessionId: this.budget.sessionId, reserved, maxCredits: this.budget.maxCredits, sipLayers: [], ...extra };
      if (this.now) input.now = this.now;
      return buildReceipt(input);
    };
    // Publish the in-flight promise before the first await. stdin delivers the next tools/call
    // as soon as this function yields, and that call must see this request id already taken.
    let settleFlight!: (value: ExecuteResponse) => void;
    let failFlight!: (err: unknown) => void;
    const flightPromise = new Promise<ExecuteResponse>((resolve, reject) => {
      settleFlight = resolve;
      failFlight = reject;
    });
    // The owner rethrows. This handler only marks the shared promise handled when nobody else joined.
    flightPromise.catch(() => {});
    this.inflight.set(requestId, { fingerprint, promise: flightPromise });
    // One paid call per capability at a time, across instances and processes: the turn is held
    // from the suspension check through the provider call to the outcome receipt, so a call
    // cannot be dispatched while an earlier one that may overrun is still in flight.
    let releaseTurn: (() => void) | undefined;
    try {
      if (reserved > 0 && this.ledger) {
        try {
          releaseTurn = await capabilityTurn(this.ledger.path, hit.capability.id);
        } catch (err) {
          this.budget.spent -= reserved - alreadyHeld;
          if (hold) this.held.set(requestId, hold);
          const message = err instanceof Error ? err.message : String(err);
          throw new AlexandriaError('capability_busy', `${hit.capability.id}: another call is dispatching this capability, so the call was not sent (${message})`, 'Call again shortly; nothing was charged. A lock left by a process that has exited is reclaimed automatically; if the error names a lock held by a live, unrelated pid, remove that .cap-*.lock directory once no Alexandria process is dispatching.', req.requestId);
        }
        // The wait may have outlived the session: a closed instance, or a session lock that is no
        // longer ours, means another process may have resumed this session without this reservation.
        if (this.closed || (this.lock && FileLock.owner(this.lock.path) !== process.pid)) {
          releaseTurn();
          this.budget.spent -= reserved - alreadyHeld;
          if (hold) this.held.set(requestId, hold);
          throw new AlexandriaError('session_closed', `${hit.capability.id}: budget session ${this.budget.sessionId} was closed or lost its lock while this call waited for its turn, so it was not sent`, 'Construct a new Alexandria to resume the session; nothing was charged.', req.requestId);
        }
      }
      // Durable before paid: the pending line holds the reservation in the ledger, so a crash
      // between the provider call and its receipt is restored as a hold, never as free credits.
      // If it cannot be written the call does not run; nothing has reached the provider yet.
      if (reserved > 0 && this.ledger) {
        try {
          // The suspension check and the pending line share one ledger lock, so an overrun another
          // process records after admit() cannot slip in between the check and the dispatch.
          const { appended, suspended } = this.ledger.appendUnlessSuspended(receiptFor(blank, { pending: true }), hit.capability.id, this.library.catalog.reconciledAt);
          for (const id of suspended) this.suspended.add(id);
          if (!appended) {
            this.budget.spent -= reserved - alreadyHeld;
            if (hold) this.held.set(requestId, hold);
            throw new AlexandriaError('capability_suspended', `${hit.capability.id} is suspended: another session recorded an overrun before this call was sent`, 'Reconcile the capability price and record-limit contract in verticals/alexandria/catalog/providers.json and bump the catalogue reconciledAt past the overrun date; nothing was charged.', req.requestId);
          }
        } catch (err) {
          if (err instanceof AlexandriaError) throw err;
          this.budget.spent -= reserved - alreadyHeld;
          if (hold) this.held.set(requestId, hold);
          const message = err instanceof Error ? err.message : String(err);
          throw new AlexandriaError('receipt_persist_failed', `${hit.capability.id}: the pending receipt could not be written, so the call was not sent (${message})`, `Fix the ledger path (${this.ledger.path}) and call again; nothing was charged.`, requestId);
        }
      }
      const call: AlexandriaCall = { provider: hit.provider.id, capability: hit.capability.capability, options, requestId };
      let result: CallResult;
      try {
        [result] = await transport.execute([call]);
        // Every outcome carries the router's request id, so the outcome receipt settles the
        // pending hold. A transport that reports a different id, provider or capability is treated as
        // an uncertain outcome.
        if (!result) throw new Error('transport returned no result');
        if (result.requestId !== undefined && result.requestId !== requestId) {
          result = { ...blank, error: { code: 'uncertain_outcome', message: `transport reported requestId ${String(result.requestId)} for call ${requestId}` } };
        } else if (result.provider !== hit.provider.id || result.capability !== hit.capability.capability) {
          // An outcome for a different call must not be stamped with this call's id and settle its hold.
          result = { ...blank, error: { code: 'uncertain_outcome', message: `transport reported ${String(result.provider)}/${String(result.capability)} for call ${requestId} to ${hit.provider.id}/${hit.capability.capability}` } };
        } else {
          result = { ...result, requestId };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result = { ...blank, error: { code: 'uncertain_outcome', message: `transport failed after the request may have reached the provider: ${message}` } };
      }
      if (result.error?.code === 'uncertain_outcome') {
        // The provider may have taken the request and billed it, so the reservation stays held:
        // releasing it would let an unrelated call spend credits this one may already have cost.
        // Only a retry with the same request id and the same call settles the hold.
        this.held.set(requestId, { amount: reserved, fingerprint });
        let persisted = '';
        try { this.ledger?.append(receiptFor({ ...result, requestId })); } catch (persistErr) { persisted = ` The receipt could not be written (${persistErr instanceof Error ? persistErr.message : String(persistErr)}); the pending line still holds the reservation.`; }
        throw new AlexandriaError('uncertain_outcome', `${hit.capability.id}: ${result.error.message}`, `The provider may have billed this call; ${reserved} credits stay reserved. Retry with requestId ${requestId} and the same options so the provider treats it as the same request and the reservation is reused.${persisted}`, requestId);
      }
      // Reconcile: a failed call is not billed; a successful one is billed at what the provider
      // charged. A success with no usable charge keeps the reservation (never refunded on a guess).
      if (!result.error && (result.chargeUnknown || typeof result.creditsCost !== 'number' || !Number.isFinite(result.creditsCost) || result.creditsCost < 0)) {
        result = { ...result, creditsCost: 0, chargeUnknown: true };
      }
      const actual = result.error ? 0 : result.chargeUnknown ? reserved : result.creditsCost;
      this.budget.spent += actual - reserved;
      // A provider that charges more than was reserved has broken the contract the reservation
      // rests on. The charge is recorded as it happened; the capability is then suspended, in this
      // process and, through the overrun receipt, in every later one, until the catalogue is fixed.
      const overrun = actual > reserved;
      if (overrun) this.suspended.add(hit.capability.id);
      const receipt = receiptFor(result, { sipLayers: req.sipLayers ?? [], overrun, catalogueReconciledAt: this.library.catalog.reconciledAt });
      try {
        this.ledger?.append(receipt);
      } catch (err) {
        // The charge happened but is not recorded. The ledger's pending line still holds the
        // reservation, so the in-memory state is put back to match it: the hold is restored and
        // the budget returns to the reserved amount. A retry with the same request id and call
        // then reuses the hold, and the provider's idempotency returns the same outcome.
        this.budget.spent += reserved - actual;
        this.held.set(requestId, { amount: reserved, fingerprint });
        const message = err instanceof Error ? err.message : String(err);
        throw new AlexandriaError('receipt_persist_failed', `${hit.capability.id}: the call completed (${actual} credits) but the receipt could not be appended to the ledger (${message})`, `The reservation of ${reserved} credits is held again, in this process and by the pending line in the ledger. Fix the ledger path (${this.ledger?.path ?? 'none'}), then retry with requestId ${requestId} and the same options to settle it.`, requestId);
      }
      this.settled.set(requestId, { fingerprint });
      const response: ExecuteResponse = { hit, result, receipt, budget: { ...this.budget } };
      if (overrun) response.overrun = true;
      settleFlight(response);
      return response;
    } catch (err) {
      failFlight(err);
      throw err;
    } finally {
      releaseTurn?.();
      if (this.inflight.get(requestId)?.promise === flightPromise) this.inflight.delete(requestId);
    }
  }
}
