import { createHash, createPublicKey, verify } from 'node:crypto';
import {
  BRAND_STAGES, brandDigest, compileBrandWorkflow, createBrandJournal, inspectBrandWorkflow,
  type BrandJournal, type BrandReceipt, type BrandStage, type BrandWorkflowContract, type BrandWorkflowHost,
} from './brand-workflow.js';

/** Compatible with better-sqlite3 and Node's DatabaseSync. Use a local durable database. */
export interface BrandDatabase {
  exec(sql: string): unknown;
  prepare(sql: string): {
    get(...values: (string | number | null)[]): unknown;
    run(...values: (string | number | null)[]): unknown;
  };
}
export interface BrandLease { resource: string; holder: string; fence: number }
export interface BrandPrincipal { actorId: string; provider: string; publicKey: string }
export interface BrandBudget { totalMicroUsd: number; stageMicroUsd: number }
export interface SignedBrandOutcome {
  receipt: BrandReceipt;
  costMicroUsd: number | null;
  usageRef: string;
  signature: string;
}
interface AttemptRow { contract: string; journal: string; digest: string }
interface WorkRow { resource: string; max_attempts: number; total_ceiling: number; stage_ceiling: number }
interface OperationRow { ceiling: number; state: string; outcome: string | null; provider_ref: string | null }

const validText = (v: unknown): v is string => typeof v === 'string' && !!v.trim() && v.length <= 1024;
const money = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= 1_000_000_000_000;
const json = (v: unknown): string => JSON.stringify(v);

/** Sign these bytes in the authenticated worker. Private signing keys stay outside this store. */
export function brandOutcomePayload(outcome: Omit<SignedBrandOutcome, 'signature'>): Buffer {
  return Buffer.from(brandDigest({ receipt: outcome.receipt, costMicroUsd: outcome.costMicroUsd, usageRef: outcome.usageRef }));
}

/** Durable admission and evidence for cooperating adapters sharing the same local SQLite file. */
export class BrandWorkflowStore {
  private readonly now: () => number;
  constructor(private readonly db: BrandDatabase, options: { totalMicroUsd: number; now?: () => number }) {
    if (!money(options.totalMicroUsd)) throw new Error('Explicit global budget required');
    this.now = options.now ?? Date.now;
    db.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;');
    db.exec(`
      create table if not exists brand_store_meta (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL);
      insert or ignore into brand_store_meta VALUES (1,1);
    `);
    if ((db.prepare('SELECT version FROM brand_store_meta WHERE id=1').get() as { version: number }).version !== 1) throw new Error('Unsupported brand store version');
    db.exec(`
      create table if not exists brand_leases (resource TEXT PRIMARY KEY, holder TEXT NOT NULL, fence INTEGER NOT NULL, expires INTEGER NOT NULL);
      create table if not exists brand_limits (id INTEGER PRIMARY KEY CHECK(id=1), total_ceiling INTEGER NOT NULL);
      create table if not exists brand_principals (actor TEXT PRIMARY KEY, provider TEXT NOT NULL, public_key TEXT NOT NULL, fingerprint TEXT NOT NULL UNIQUE, active INTEGER NOT NULL DEFAULT 1);
      create table if not exists brand_work (work TEXT PRIMARY KEY, resource TEXT NOT NULL, max_attempts INTEGER NOT NULL, total_ceiling INTEGER NOT NULL, stage_ceiling INTEGER NOT NULL);
      create table if not exists brand_attempts (work TEXT NOT NULL REFERENCES brand_work(work), attempt TEXT NOT NULL, ordinal INTEGER NOT NULL, contract TEXT NOT NULL, journal TEXT NOT NULL, digest TEXT NOT NULL, PRIMARY KEY(work,attempt), UNIQUE(work,ordinal));
      create table if not exists brand_operations (operation TEXT PRIMARY KEY, work TEXT NOT NULL REFERENCES brand_work(work), attempt TEXT NOT NULL, ceiling INTEGER NOT NULL, charged INTEGER NOT NULL, state TEXT NOT NULL, outcome TEXT, provider_ref TEXT, resolution TEXT, FOREIGN KEY(work,attempt) REFERENCES brand_attempts(work,attempt));
      create index if not exists brand_operations_work ON brand_operations(work,state);
      create table if not exists brand_outcomes (operation TEXT NOT NULL REFERENCES brand_operations(operation), sequence INTEGER NOT NULL, envelope TEXT NOT NULL, received INTEGER NOT NULL, PRIMARY KEY(operation,sequence));
    `);
    db.prepare('insert or ignore into brand_limits VALUES (1,?)').run(options.totalMicroUsd);
    if ((db.prepare('SELECT total_ceiling FROM brand_limits WHERE id=1').get() as { total_ceiling: number }).total_ceiling !== options.totalMicroUsd) throw new Error('Global budget changed');
  }

  private transaction<T>(run: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = run(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  private time(): number {
    const value = this.now();
    if (!Number.isSafeInteger(value) || value < 0 || value > 253402300799999) throw new Error('Invalid host clock');
    return value;
  }
  private work(workId: string): WorkRow {
    const row = this.db.prepare('SELECT * FROM brand_work WHERE work=?').get(workId) as WorkRow | undefined;
    if (!row) throw new Error('Work is not admitted');
    return row;
  }
  private attempt(workId: string, attemptId: string): AttemptRow {
    const row = this.db.prepare('SELECT * FROM brand_attempts WHERE work=? AND attempt=?').get(workId, attemptId) as AttemptRow | undefined;
    if (!row) throw new Error('Attempt is not admitted');
    return row;
  }
  private assertLease(lease: BrandLease, resource = lease.resource): void {
    if (resource !== lease.resource || !this.db.prepare('SELECT 1 FROM brand_leases WHERE resource=? AND holder=? AND fence=? AND expires>?')
      .get(resource, lease.holder, lease.fence, this.time())) throw new Error('Lease lost or expired');
  }
  private assertPrincipals(contract: BrandWorkflowContract): void {
    for (const principal of [contract.maker, contract.checker]) {
      if (!this.db.prepare('SELECT 1 FROM brand_principals WHERE actor=? AND provider=? AND active=1').get(principal.actorId, principal.provider)) throw new Error('Principal not registered or revoked');
    }
  }

  acquire(resource: string, holder: string, ttlMs: number): BrandLease {
    if (!validText(resource) || !validText(holder) || !Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > 3_600_000) throw new Error('Invalid lease');
    return this.transaction(() => {
      const now = this.time();
      const row = this.db.prepare('SELECT * FROM brand_leases WHERE resource=?').get(resource) as { holder: string; fence: number; expires: number } | undefined;
      if (row && row.expires > now) throw new Error('Resource already leased');
      const fence = (row?.fence ?? 0) + 1;
      if (!Number.isSafeInteger(fence)) throw new Error('Fence exhausted');
      this.db.prepare('INSERT INTO brand_leases VALUES (?,?,?,?) ON CONFLICT(resource) DO UPDATE SET holder=excluded.holder,fence=excluded.fence,expires=excluded.expires')
        .run(resource, holder, fence, now + ttlMs);
      return { resource, holder, fence };
    });
  }
  release(lease: BrandLease): void {
    this.transaction(() => { this.assertLease(lease); this.db.prepare('UPDATE brand_leases SET expires=0 WHERE resource=?').run(lease.resource); });
  }
  registerPrincipal(principal: BrandPrincipal): void {
    if (!validText(principal.actorId) || !/^[a-z][a-z0-9-]{0,79}$/.test(principal.provider)) throw new Error('Invalid principal');
    const key = createPublicKey(principal.publicKey);
    if (key.asymmetricKeyType !== 'ed25519') throw new Error('Ed25519 public key required');
    const pem = key.export({ type: 'spki', format: 'pem' }).toString();
    const fingerprint = createHash('sha256').update(key.export({ type: 'spki', format: 'der' })).digest('hex');
    this.transaction(() => {
      const old = this.db.prepare('SELECT * FROM brand_principals WHERE actor=?').get(principal.actorId) as { provider: string; fingerprint: string; active: number } | undefined;
      if (old) {
        if (old.provider !== principal.provider || old.fingerprint !== fingerprint || old.active !== 1) throw new Error('Principal binding changed or revoked');
        return;
      }
      this.db.prepare('INSERT INTO brand_principals (actor,provider,public_key,fingerprint) VALUES (?,?,?,?)').run(principal.actorId, principal.provider, pem, fingerprint);
    });
  }
  revokePrincipal(actorId: string): void { this.db.prepare('UPDATE brand_principals SET active=0 WHERE actor=?').run(actorId); }

  admit(contractInput: BrandWorkflowContract, attemptId: string, lease: BrandLease, budget: BrandBudget): BrandJournal {
    const { contract } = compileBrandWorkflow(contractInput);
    if (!money(budget.totalMicroUsd) || !money(budget.stageMicroUsd) || budget.stageMicroUsd > budget.totalMicroUsd) throw new Error('Invalid budget');
    return this.transaction(() => {
      this.assertLease(lease);
      this.assertPrincipals(contract);
      this.db.prepare('insert or ignore into brand_work VALUES (?,?,?,?,?)').run(contract.workId, lease.resource, contract.maxAttempts, budget.totalMicroUsd, budget.stageMicroUsd);
      const work = this.work(contract.workId);
      if (work.resource !== lease.resource || work.max_attempts !== contract.maxAttempts || work.total_ceiling !== budget.totalMicroUsd || work.stage_ceiling !== budget.stageMicroUsd) throw new Error('Admitted limits or resource changed');
      if (this.db.prepare("SELECT 1 FROM brand_operations WHERE work=? AND state NOT IN ('settled','abandoned')").get(contract.workId)) throw new Error('Reconciliation required before another attempt');
      const ordinal = (this.db.prepare('SELECT COALESCE(MAX(ordinal),0) AS n FROM brand_attempts WHERE work=?').get(contract.workId) as { n: number }).n + 1;
      const journal = createBrandJournal(contract, attemptId, ordinal, new Date(this.time()).toISOString());
      this.db.prepare('INSERT INTO brand_attempts VALUES (?,?,?,?,?,?)').run(contract.workId, attemptId, ordinal, json(contract), json(journal), brandDigest(journal));
      return journal;
    });
  }
  load(workId: string, attemptId: string): BrandJournal { return JSON.parse(this.attempt(workId, attemptId).journal); }
  usage(workId: string): { chargedMicroUsd: number; unresolved: number; ceilingMicroUsd: number } {
    const work = this.work(workId);
    const row = this.db.prepare("SELECT COALESCE(SUM(charged),0) AS charged, COALESCE(SUM(state NOT IN ('settled','abandoned')),0) AS unresolved FROM brand_operations WHERE work=?").get(workId) as { charged: number; unresolved: number };
    return { chargedMicroUsd: row.charged, unresolved: row.unresolved, ceilingMicroUsd: work.total_ceiling };
  }
  canDispatch(workId: string, lease: BrandLease): boolean {
    try {
      const work = this.work(workId); this.assertLease(lease, work.resource);
      this.assertReconciledCosts();
      const usage = this.usage(workId);
      const global = this.db.prepare('SELECT COALESCE(SUM(charged),0) AS charged, (SELECT total_ceiling FROM brand_limits WHERE id=1) AS ceiling FROM brand_operations').get() as { charged: number; ceiling: number };
      const unresolved = this.db.prepare("SELECT 1 FROM brand_operations o JOIN brand_work w ON w.work=o.work WHERE w.resource=? AND o.state NOT IN ('settled','abandoned')").get(work.resource);
      return !unresolved && usage.chargedMicroUsd + work.stage_ceiling <= work.total_ceiling &&
        money(global.charged) && global.charged + work.stage_ceiling <= global.ceiling;
    } catch { return false; }
  }

  private assertReconciledCosts(): void {
    if (this.db.prepare("SELECT 1 FROM brand_operations WHERE state IN ('unknown-cost','over-budget') LIMIT 1").get()) {
      throw new Error('Cost reconciliation required before dispatch');
    }
  }

  /** Release only a reservation proven never dispatched. The old attempt stays closed for recovery. */
  abandonUndispatched(workId: string, attemptId: string, expectedDigest: string, lease: BrandLease, reason: string): void {
    if (!validText(reason)) throw new Error('Abandonment reason required');
    this.transaction(() => {
      this.assertLease(lease, this.work(workId).resource);
      const row = this.attempt(workId, attemptId);
      if (row.digest !== expectedDigest) throw new Error('Journal conflict');
      const journal = JSON.parse(row.journal) as BrandJournal;
      const operationId = brandDigest([workId, attemptId, journal.contractDigest, journal.inFlight ?? null]);
      const op = this.db.prepare('SELECT * FROM brand_operations WHERE operation=?').get(operationId) as OperationRow | undefined;
      if (!journal.inFlight || !op || op.state !== 'reserved' || op.provider_ref) throw new Error('Cannot abandon a dispatched or absent reservation');
      this.db.prepare("UPDATE brand_operations SET state='abandoned',charged=0,resolution=? WHERE operation=?").run(reason, operationId);
      // Keep the original in-flight journal as history. A new attempt consumes the next ordinal.
    });
  }

  reserve(workId: string, next: BrandJournal, expectedDigest: string, lease: BrandLease): void {
    this.transaction(() => {
      const row = this.attempt(workId, next.attemptId); const previous = JSON.parse(row.journal) as BrandJournal;
      if (row.digest !== expectedDigest) throw new Error('Journal conflict');
      if (!this.canDispatch(workId, lease)) throw new Error('Capacity or budget held');
      const contract = JSON.parse(row.contract) as BrandWorkflowContract; this.assertPrincipals(contract);
      if (inspectBrandWorkflow(contract, previous, previous.receipts.at(-1)?.artifactDigest ?? brandDigest('empty')).status !== 'ready' ||
        previous.receipts.some(receipt => !this.authenticate(receipt))) throw new Error('Previous evidence is incomplete or unauthenticated');
      if (previous.inFlight || next.inFlight !== BRAND_STAGES[previous.receipts.length] || next.inFlight === undefined ||
        brandDigest({ ...next, inFlight: null }) !== brandDigest({ ...previous, inFlight: null })) throw new Error('Invalid journal transition');
      const op = brandDigest([workId, next.attemptId, previous.contractDigest, next.inFlight]);
      const ceiling = this.work(workId).stage_ceiling;
      this.db.prepare("INSERT INTO brand_operations (operation,work,attempt,ceiling,charged,state) VALUES (?,?,?,?,?,'reserved')").run(op, workId, next.attemptId, ceiling, ceiling);
      this.db.prepare('UPDATE brand_attempts SET journal=?,digest=? WHERE work=? AND attempt=?').run(json(next), brandDigest(next), workId, next.attemptId);
    });
  }
  dispatch(workId: string, attemptId: string, stage: BrandStage, contract: BrandWorkflowContract, operationId: string, lease: BrandLease): void {
    this.transaction(() => {
      this.assertLease(lease, this.work(workId).resource);
      this.assertPrincipals(contract);
      this.assertReconciledCosts();
      const journal = this.load(workId, attemptId);
      const op = this.db.prepare('SELECT * FROM brand_operations WHERE operation=? AND work=? AND attempt=?').get(operationId, workId, attemptId) as OperationRow | undefined;
      if (!op || op.state !== 'reserved' || journal.inFlight !== stage || brandDigest(contract) !== journal.contractDigest ||
        operationId !== brandDigest([workId, attemptId, journal.contractDigest, stage])) throw new Error('Operation already dispatched or not reserved');
      this.db.prepare("UPDATE brand_operations SET state='dispatched' WHERE operation=?").run(operationId);
    });
  }
  recordProviderReference(workId: string, operationId: string, reference: string, lease: BrandLease): void {
    if (!validText(reference)) throw new Error('Invalid provider reference');
    this.transaction(() => {
      this.assertLease(lease, this.work(workId).resource);
      const op = this.db.prepare('SELECT * FROM brand_operations WHERE operation=? AND work=?').get(operationId, workId) as OperationRow | undefined;
      if (!op || op.state !== 'dispatched' || (op.provider_ref && op.provider_ref !== reference)) throw new Error('Provider reference conflict');
      this.db.prepare('UPDATE brand_operations SET provider_ref=? WHERE operation=?').run(reference, operationId);
    });
  }
  verifyOutcome(outcome: SignedBrandOutcome): boolean {
    try {
      if (!validText(outcome.usageRef) || (outcome.costMicroUsd !== null && !money(outcome.costMicroUsd))) return false;
      const row = this.db.prepare('SELECT public_key FROM brand_principals WHERE actor=? AND provider=? AND active=1')
        .get(outcome.receipt.actorId, outcome.receipt.provider) as { public_key: string } | undefined;
      const signature = Buffer.from(outcome.signature, 'base64');
      return !!row && signature.length === 64 && signature.toString('base64') === outcome.signature && verify(null, brandOutcomePayload(outcome), row.public_key, signature);
    } catch { return false; }
  }

  /** Also used for explicit reconciliation from an authenticated, recovered provider outcome. */
  settle(workId: string, next: BrandJournal, expectedDigest: string, lease: BrandLease, outcomeInput: SignedBrandOutcome): void {
    const outcome = structuredClone(outcomeInput);
    if (!this.verifyOutcome(outcome)) throw new Error('Unauthenticated outcome');
    const failure = this.transaction(() => {
      if (!this.verifyOutcome(outcome)) throw new Error('Unauthenticated outcome');
      const work = this.work(workId); this.assertLease(lease, work.resource);
      const row = this.attempt(workId, next.attemptId); const previous = JSON.parse(row.journal) as BrandJournal;
      if (row.digest !== expectedDigest) throw new Error('Journal conflict');
      const expectedNext = { ...previous, receipts: [...previous.receipts, outcome.receipt] }; delete expectedNext.inFlight;
      const c = JSON.parse(row.contract) as BrandWorkflowContract;
      const actor = previous.inFlight === 'verify' ? c.checker : c.maker;
      const receipt = outcome.receipt;
      const operationId = brandDigest([workId, next.attemptId, previous.contractDigest, previous.inFlight ?? null]);
      if (!previous.inFlight || receipt.stage !== previous.inFlight || receipt.operationId !== operationId ||
        receipt.contractDigest !== previous.contractDigest || receipt.actorId !== actor.actorId || receipt.provider !== actor.provider ||
        brandDigest(next) !== brandDigest(expectedNext)) throw new Error('Outcome does not match reservation');
      const op = this.db.prepare('SELECT * FROM brand_operations WHERE operation=?').get(operationId) as OperationRow | undefined;
      if (!op || !['dispatched', 'unknown-cost', 'over-budget'].includes(op.state) || (op.outcome && brandDigest((JSON.parse(op.outcome) as SignedBrandOutcome).receipt) !== brandDigest(receipt))) throw new Error('Operation conflict');
      const state = outcome.costMicroUsd === null ? 'unknown-cost' : outcome.costMicroUsd > op.ceiling ? 'over-budget' : 'settled';
      this.db.prepare('INSERT INTO brand_outcomes SELECT ?, COALESCE(MAX(sequence),0)+1, ?, ? FROM brand_outcomes WHERE operation=?')
        .run(operationId, json(outcome), this.time(), operationId);
      this.db.prepare('UPDATE brand_operations SET state=?,outcome=?,charged=? WHERE operation=?')
        .run(state, json(outcome), outcome.costMicroUsd ?? op.ceiling, operationId);
      if (state !== 'settled') return state;
      this.db.prepare('UPDATE brand_attempts SET journal=?,digest=? WHERE work=? AND attempt=?').run(json(next), brandDigest(next), workId, next.attemptId);
      return undefined;
    });
    if (failure) throw new Error(failure);
  }
  authenticate(receipt: BrandReceipt): boolean {
    const op = this.db.prepare("SELECT outcome FROM brand_operations WHERE operation=? AND state='settled'").get(receipt.operationId) as { outcome: string } | undefined;
    if (!op) return false;
    const outcome = JSON.parse(op.outcome) as SignedBrandOutcome;
    return brandDigest(outcome.receipt) === brandDigest(receipt) && this.verifyOutcome(outcome);
  }

  host(options: {
    workId: string; attemptId: string; lease: BrandLease; timeoutMs: number;
    readContract(): Promise<unknown>;
    artifactDigest(): Promise<string>;
    capacity(stage: BrandStage): Promise<boolean>;
    execute(stage: BrandStage, contract: BrandWorkflowContract, context: {
      operationId: string; maxCostMicroUsd: number; signal: AbortSignal;
      recordProviderReference(reference: string): void;
    }): Promise<SignedBrandOutcome>;
  }): BrandWorkflowHost {
    if (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs < 1 || options.timeoutMs > 3_600_000) throw new Error('Invalid execution timeout');
    const { workId, attemptId, timeoutMs } = options; const lease = structuredClone(options.lease);
    const pending = new Map<string, SignedBrandOutcome>();
    return {
      readContract: () => options.readContract(), artifactDigest: () => options.artifactDigest(),
      load: async () => this.load(workId, attemptId),
      admit: async (stage) => this.canDispatch(workId, lease) && await options.capacity(stage),
      authenticate: async (receipt) => this.authenticate(receipt),
      save: async (next, expected) => {
        if (next.attemptId !== attemptId) throw new Error('Attempt changed');
        if (next.inFlight) this.reserve(workId, next, expected, lease);
        else {
          const id = next.receipts.at(-1)?.operationId; const outcome = id ? pending.get(id) : undefined;
          if (!outcome) throw new Error('Authenticated outcome missing');
          this.settle(workId, next, expected, lease, outcome); pending.delete(id!);
        }
      },
      execute: async (stage, contract, operationId, signal) => {
        this.dispatch(workId, attemptId, stage, contract, operationId, lease);
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let abort: () => void = () => {};
        const stopped = new Promise<never>((_, reject) => {
          abort = () => { controller.abort(); reject(new Error('Execution interrupted; remote outcome requires reconciliation')); };
          timer = setTimeout(abort, timeoutMs);
          if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, { once: true });
        });
        try {
          if (controller.signal.aborted) return await stopped;
          const outcome = structuredClone(await Promise.race([stopped, options.execute(stage, contract, {
            operationId, maxCostMicroUsd: this.work(workId).stage_ceiling, signal: controller.signal,
            recordProviderReference: (ref) => this.recordProviderReference(workId, operationId, ref, lease),
          })]));
          if (!this.verifyOutcome(outcome)) throw new Error('Unauthenticated outcome');
          pending.set(operationId, outcome); return outcome.receipt;
        } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
      },
    };
  }
}
