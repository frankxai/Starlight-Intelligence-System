/**
 * Track A v0.1 — Append-only ledger writers + SQLite shadow indices
 *
 * Persistence for the 13 Track A schemas (see src/types.ts). JSONL files
 * under <root>/memory/_audit/ are the source of truth; SQLite is a
 * rebuildable index for fast lookups by MCP tools and the dashboard.
 *
 * Layout under <root>/memory/_audit/:
 *   work-packets.jsonl              — WorkPacket lifecycle snapshots
 *   decisions.jsonl                 — Decision stream
 *   approvals.jsonl                 — ApprovalGate stream
 *   artifacts.jsonl                 — Artifact stream
 *   council-reviews.jsonl           — CouncilReview stream
 *   graph-edges.jsonl               — GraphEdge stream (evidence-validated)
 *   agent-events/<YYYY-MM-DD>.jsonl — Daily-rotated AgentEvent stream
 *   vault-loop.jsonl                — Vault-loop entry stream (T4 consumer)
 *   agent-ops.sqlite                — Shadow index (WAL + foreign keys)
 *
 * Invariants:
 *   • JSONL is append-only — never truncated, never rewritten.
 *   • GraphEdge.evidenceRef must be present (substrate invariant).
 *   • SQLite runs in WAL journal mode with foreign keys enabled.
 *   • Function-style writers never throw — they return WriteResult.
 *   • Class-style AgentOpsLedger throws LedgerInvariantError on substrate
 *     invariant violations (so callers can fail fast).
 *
 * Built on SIP — operational tier
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import type {
  AgentEvent,
  ApprovalGate,
  Artifact,
  CouncilReview,
  Decision,
  GraphEdge,
  RiskLevel,
  WorkPacket,
  WorkPacketStatus,
} from './types.js';

// ── Function-style writers (Track B compatibility) ────────────

export interface WriteResult {
  ok: boolean;
  error?: string;
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function safeAppend(path: string, line: string): WriteResult {
  try {
    ensureDir(dirname(path));
    appendFileSync(path, line.endsWith('\n') ? line : line + '\n', 'utf-8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface LedgerPaths {
  auditDir: string;
}

export function ledgerPaths(repoRoot: string): LedgerPaths {
  return { auditDir: join(repoRoot, 'memory', '_audit') };
}

function eventLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'agent-events', `${todayStamp()}.jsonl`);
}

function decisionLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'decisions.jsonl');
}

function approvalLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'approvals.jsonl');
}

function workPacketLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'work-packets.jsonl');
}

function artifactLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'artifacts.jsonl');
}

function councilLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'council-reviews.jsonl');
}

function graphEdgeLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'graph-edges.jsonl');
}

export function vaultLoopLedgerPath(repoRoot: string): string {
  return join(repoRoot, 'memory', '_audit', 'vault-loop.jsonl');
}

export function appendAgentEvent(repoRoot: string, event: AgentEvent): WriteResult {
  return safeAppend(eventLedgerPath(repoRoot), JSON.stringify(event));
}

export function appendDecision(repoRoot: string, decision: Decision): WriteResult {
  return safeAppend(decisionLedgerPath(repoRoot), JSON.stringify(decision));
}

export function appendApprovalGate(repoRoot: string, gate: ApprovalGate): WriteResult {
  return safeAppend(approvalLedgerPath(repoRoot), JSON.stringify(gate));
}

export function appendWorkPacket(repoRoot: string, packet: WorkPacket): WriteResult {
  return safeAppend(workPacketLedgerPath(repoRoot), JSON.stringify(packet));
}

export function appendArtifact(repoRoot: string, artifact: Artifact): WriteResult {
  return safeAppend(artifactLedgerPath(repoRoot), JSON.stringify(artifact));
}

export function appendCouncilReview(repoRoot: string, review: CouncilReview): WriteResult {
  return safeAppend(councilLedgerPath(repoRoot), JSON.stringify(review));
}

/**
 * Append a GraphEdge. Substrate invariant: edges missing evidenceRef are
 * refused at the writer (returns { ok: false, error }).
 */
export function appendGraphEdge(repoRoot: string, edge: GraphEdge): WriteResult {
  if (!edge.evidenceRef || typeof edge.evidenceRef !== 'string' || !edge.evidenceRef.trim()) {
    return { ok: false, error: 'GraphEdge.evidenceRef is required (substrate invariant)' };
  }
  return safeAppend(graphEdgeLedgerPath(repoRoot), JSON.stringify(edge));
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const out: T[] = [];
  for (const raw of readFileSync(path, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch {
      // skip malformed line
    }
  }
  return out;
}

export function readGraphEdges(repoRoot: string): GraphEdge[] {
  return readJsonl<GraphEdge>(graphEdgeLedgerPath(repoRoot));
}

export function readWorkPackets(repoRoot: string): WorkPacket[] {
  return readJsonl<WorkPacket>(workPacketLedgerPath(repoRoot));
}

export function readDecisions(repoRoot: string): Decision[] {
  return readJsonl<Decision>(decisionLedgerPath(repoRoot));
}

export function readAgentEventsForDay(repoRoot: string, isoDate: string): AgentEvent[] {
  return readJsonl<AgentEvent>(
    join(repoRoot, 'memory', '_audit', 'agent-events', `${isoDate}.jsonl`),
  );
}

export function readRecentAgentEvents(
  repoRoot: string,
  options: { date?: string; limit?: number } = {},
): AgentEvent[] {
  const limit = Math.max(1, options.limit ?? 50);
  if (options.date) {
    return readAgentEventsForDay(repoRoot, options.date)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  const eventsDir = join(repoRoot, 'memory', '_audit', 'agent-events');
  if (!existsSync(eventsDir)) return [];

  const events: AgentEvent[] = [];
  const days = readdirSync(eventsDir)
    .filter((file) => file.endsWith('.jsonl'))
    .map((file) => file.slice(0, -'.jsonl'.length))
    .sort()
    .reverse();

  for (const day of days) {
    events.push(...readAgentEventsForDay(repoRoot, day));
    if (events.length >= limit) break;
  }

  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export function readApprovalGate(repoRoot: string, gateId: string): ApprovalGate | null {
  const all = readJsonl<ApprovalGate>(approvalLedgerPath(repoRoot));
  return all.find((g) => g.id === gateId) ?? null;
}

// ── Class-style ledger with SQLite shadow index ─────────────

/** Thrown when a write violates a substrate invariant. */
export class LedgerInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerInvariantError';
  }
}

/**
 * Thrown when a high/critical-risk WorkPacket creation is gated for approval.
 * The gate row is persisted BEFORE the throw so the audit trail captures
 * what was attempted, even though no WorkPacket row exists yet. Callers
 * (CLI / MCP) should catch this and surface the gate id + reason instead
 * of treating it as a generic error.
 */
export class ApprovalGateRequiredError extends Error {
  readonly gate: ApprovalGate;
  constructor(gate: ApprovalGate, message: string) {
    super(message);
    this.name = 'ApprovalGateRequiredError';
    this.gate = gate;
  }
}

/**
 * WorkPacket lifecycle state machine — substrate invariant. Terminal states
 * (completed, cancelled) accept no outgoing transitions. Pending packets
 * cannot skip to completed without going through in_progress.
 *
 * Catches CRITICAL finding from code-review on 6f9703c: prior version of
 * transitionWorkPacket accepted any source→target, allowing completed
 * packets to revert to in_progress and pending packets to "complete" without
 * doing the work.
 */
const ALLOWED_TRANSITIONS: Readonly<Record<WorkPacketStatus, ReadonlySet<WorkPacketStatus>>> = {
  pending: new Set<WorkPacketStatus>(['in_progress', 'cancelled']),
  in_progress: new Set<WorkPacketStatus>(['blocked', 'completed', 'cancelled']),
  blocked: new Set<WorkPacketStatus>(['in_progress', 'cancelled']),
  completed: new Set<WorkPacketStatus>(),
  cancelled: new Set<WorkPacketStatus>(),
};

export interface CreateWorkPacketInput {
  title: string;
  mission: string;
  riskLevel: RiskLevel;
  contextRefs?: string[];
  requiredOutputs?: string[];
  allowedTools?: string[];
  allowedPaths?: string[];
  forbiddenActions?: string[];
  approvalRequired?: boolean;
  assignedAgent?: string;
  costEstimate?: number;
}

const SCHEMA_DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS work_packets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mission TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  approval_required INTEGER NOT NULL,
  assigned_agent TEXT NOT NULL,
  status TEXT NOT NULL,
  cost_estimate REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS work_packets_status_idx ON work_packets(status);
CREATE INDEX IF NOT EXISTS work_packets_created_at_idx ON work_packets(created_at);

CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  cost_estimate REAL NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL,
  work_packet_id TEXT,
  payload TEXT NOT NULL,
  FOREIGN KEY (work_packet_id) REFERENCES work_packets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS agent_events_run_idx ON agent_events(run_id);
CREATE INDEX IF NOT EXISTS agent_events_packet_idx ON agent_events(work_packet_id);
CREATE INDEX IF NOT EXISTS agent_events_timestamp_idx ON agent_events(timestamp);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  chosen TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  work_packet_id TEXT,
  council_review_id TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  payload TEXT NOT NULL,
  FOREIGN KEY (work_packet_id) REFERENCES work_packets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS decisions_packet_idx ON decisions(work_packet_id);

CREATE TABLE IF NOT EXISTS graph_edges (
  id TEXT PRIMARY KEY,
  edge_type TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  evidence_ref TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS graph_edges_source_idx ON graph_edges(source);
CREATE INDEX IF NOT EXISTS graph_edges_target_idx ON graph_edges(target);
CREATE INDEX IF NOT EXISTS graph_edges_edge_type_idx ON graph_edges(edge_type);
`;

/**
 * Append-only ledger for the Track A schemas with SQLite shadow index.
 * JSONL writers above remain source of truth; this class adds SQLite
 * mirroring + lifecycle helpers for MCP / dashboard consumers.
 */
export class AgentOpsLedger {
  private readonly root: string;
  private readonly sqlitePath: string;
  private readonly db: Database.Database;

  constructor(root: string) {
    this.root = root;
    const auditDir = join(root, 'memory', '_audit');
    ensureDir(auditDir);
    ensureDir(join(auditDir, 'agent-events'));
    this.sqlitePath = join(auditDir, 'agent-ops.sqlite');
    this.db = new Database(this.sqlitePath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.exec(SCHEMA_DDL);
  }

  getSqlitePath(): string {
    return this.sqlitePath;
  }

  // ── WorkPacket ────────────────────────────────────────

  /**
   * Create a WorkPacket — append to JSONL, upsert into SQLite.
   *
   * SUBSTRATE INVARIANT (chokepoint): high/critical-risk packets are gated.
   * An ApprovalGate row is persisted with the full request payload, then
   * ApprovalGateRequiredError is thrown. The WorkPacket itself is NOT
   * persisted (no JSONL row, no SQLite row) until the gate is approved
   * through a separate path. There is no DEMO_MODE override.
   *
   * This is the SINGLE chokepoint — both CLI and MCP surfaces flow through
   * here. Don't add a parallel high/critical creation path that bypasses
   * this check.
   */
  createWorkPacket(input: CreateWorkPacketInput): WorkPacket {
    if (input.riskLevel === 'high' || input.riskLevel === 'critical') {
      const titleHint = input.title
        ? input.title.slice(0, 60).replace(/[^a-zA-Z0-9 _-]/g, '')
        : null;
      const gate: ApprovalGate = {
        id: newId('gate'),
        workPacketId: titleHint ? `<pending:${titleHint}>` : '',
        requestedAt: nowIso(),
        status: 'pending',
        riskLevel: input.riskLevel,
        reason: 'WorkPacket gated at high/critical risk',
        pendingContext: {
          kind: 'workpacket',
          payload: {
            title: input.title,
            mission: input.mission,
            riskLevel: input.riskLevel,
            allowedTools: input.allowedTools ?? [],
            allowedPaths: input.allowedPaths ?? [],
          },
        },
      };
      const gateResult = appendApprovalGate(this.root, gate);
      if (!gateResult.ok) {
        throw new LedgerInvariantError(
          `ApprovalGate append failed: ${gateResult.error}`,
        );
      }
      throw new ApprovalGateRequiredError(
        gate,
        `WorkPacket creation refused at ${input.riskLevel} risk; approval gate ${gate.id} opened`,
      );
    }

    const now = nowIso();
    const packet: WorkPacket = {
      id: newId('wp'),
      title: input.title,
      mission: input.mission,
      contextRefs: input.contextRefs ?? [],
      requiredOutputs: input.requiredOutputs ?? [],
      allowedTools: input.allowedTools ?? [],
      allowedPaths: input.allowedPaths ?? [],
      forbiddenActions: input.forbiddenActions ?? [],
      riskLevel: input.riskLevel,
      approvalRequired: input.approvalRequired ?? false,
      assignedAgent: input.assignedAgent ?? 'unassigned',
      status: 'pending',
      events: [],
      artifacts: [],
      costEstimate: input.costEstimate ?? 0,
      createdAt: now,
    };
    const result = appendWorkPacket(this.root, packet);
    if (!result.ok) {
      throw new LedgerInvariantError(`WorkPacket append failed: ${result.error}`);
    }
    this.upsertWorkPacketRow(packet);
    return packet;
  }

  /** Append a WorkPacket snapshot (status transition, event addition, etc.). */
  appendWorkPacketSnapshot(packet: WorkPacket): void {
    const result = appendWorkPacket(this.root, packet);
    if (!result.ok) {
      throw new LedgerInvariantError(`WorkPacket append failed: ${result.error}`);
    }
    this.upsertWorkPacketRow(packet);
  }

  /** Transition a WorkPacket's status; appends a new ledger entry. */
  updateWorkPacketStatus(
    id: string,
    status: WorkPacketStatus,
    completedAt?: string,
  ): WorkPacket {
    const current = this.getWorkPacket(id);
    if (!current) {
      throw new LedgerInvariantError(`WorkPacket not found: ${id}`);
    }
    const next: WorkPacket = { ...current, status };
    if (completedAt !== undefined) next.completedAt = completedAt;
    this.appendWorkPacketSnapshot(next);
    return next;
  }

  /** Latest WorkPacket snapshot by id (from SQLite shadow). */
  getWorkPacket(id: string): WorkPacket | null {
    const row = this.db
      .prepare('SELECT payload FROM work_packets WHERE id = ?')
      .get(id) as { payload: string } | undefined;
    return row ? (JSON.parse(row.payload) as WorkPacket) : null;
  }

  /** List recent WorkPackets, newest first. */
  listWorkPackets(options?: {
    limit?: number;
    status?: WorkPacketStatus;
  }): WorkPacket[] {
    const limit = options?.limit ?? 50;
    if (options?.status) {
      const rows = this.db
        .prepare(
          'SELECT payload FROM work_packets WHERE status = ? ORDER BY created_at DESC LIMIT ?',
        )
        .all(options.status, limit) as Array<{ payload: string }>;
      return rows.map((r) => JSON.parse(r.payload) as WorkPacket);
    }
    const rows = this.db
      .prepare('SELECT payload FROM work_packets ORDER BY created_at DESC LIMIT ?')
      .all(limit) as Array<{ payload: string }>;
    return rows.map((r) => JSON.parse(r.payload) as WorkPacket);
  }

  /** Oldest pending WorkPacket, suitable for a single worker to pick next. */
  nextPendingWorkPacket(): WorkPacket | null {
    const row = this.db
      .prepare(
        'SELECT payload FROM work_packets WHERE status = ? ORDER BY created_at ASC LIMIT 1',
      )
      .get('pending') as { payload: string } | undefined;
    return row ? (JSON.parse(row.payload) as WorkPacket) : null;
  }

  /**
   * Transition a WorkPacket and emit the corresponding AgentEvent. This is the
   * canonical local lifecycle helper for CLI/MCP consumers.
   *
   * SUBSTRATE INVARIANT: enforces the ALLOWED_TRANSITIONS state machine.
   * Terminal states (completed, cancelled) accept no outgoing transitions.
   * Pending packets cannot skip to completed without going through in_progress.
   * Same-state self-transitions are also refused (no-op writes pollute the
   * snapshot ledger).
   */
  transitionWorkPacket(input: {
    id: string;
    status: WorkPacketStatus;
    agentId?: string;
    summary?: string;
    eventType?: string;
    toolsUsed?: string[];
    outputRefs?: string[];
  }): { packet: WorkPacket; event: AgentEvent } {
    const current = this.getWorkPacket(input.id);
    if (!current) {
      throw new LedgerInvariantError(`WorkPacket not found: ${input.id}`);
    }

    const allowed = ALLOWED_TRANSITIONS[current.status];
    if (!allowed.has(input.status)) {
      throw new LedgerInvariantError(
        `Invalid WorkPacket transition: ${current.status} → ${input.status} (id=${input.id}). ` +
          `Allowed from ${current.status}: ${[...allowed].join(', ') || '(terminal — no transitions allowed)'}`,
      );
    }

    const completedAt =
      input.status === 'completed' || input.status === 'cancelled'
        ? nowIso()
        : current.completedAt;
    const event = buildAgentEvent({
      runId: `run_${input.id}`,
      agentId: input.agentId ?? current.assignedAgent ?? 'unassigned',
      eventType: input.eventType ?? `workpacket.${input.status}`,
      summary: input.summary ?? `WorkPacket ${input.id} transitioned to ${input.status}`,
      toolsUsed: input.toolsUsed ?? ['starlight.workpacket.transition'],
      inputRefs: [input.id],
      outputRefs: input.outputRefs ?? [],
      riskLevel: current.riskLevel,
      costEstimate: current.costEstimate,
    });
    const packet: WorkPacket = {
      ...current,
      status: input.status,
      events: [...current.events, event],
      completedAt,
    };

    this.appendWorkPacketSnapshot(packet);
    this.recordAgentEvent(event, packet.id);
    return { packet, event };
  }

  private upsertWorkPacketRow(packet: WorkPacket): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO work_packets
          (id, title, mission, risk_level, approval_required, assigned_agent,
           status, cost_estimate, created_at, completed_at, payload)
         VALUES (@id, @title, @mission, @risk_level, @approval_required,
                 @assigned_agent, @status, @cost_estimate, @created_at,
                 @completed_at, @payload)`,
      )
      .run({
        id: packet.id,
        title: packet.title,
        mission: packet.mission,
        risk_level: packet.riskLevel,
        approval_required: packet.approvalRequired ? 1 : 0,
        assigned_agent: packet.assignedAgent,
        status: packet.status,
        cost_estimate: packet.costEstimate,
        created_at: packet.createdAt,
        completed_at: packet.completedAt ?? null,
        payload: JSON.stringify(packet),
      });
  }

  // ── AgentEvent ────────────────────────────────────────

  /** Append an AgentEvent to today's ledger + SQLite index. */
  recordAgentEvent(event: AgentEvent, workPacketId?: string): AgentEvent {
    const result = appendAgentEvent(this.root, event);
    if (!result.ok) {
      throw new LedgerInvariantError(`AgentEvent append failed: ${result.error}`);
    }
    this.db
      .prepare(
        `INSERT OR REPLACE INTO agent_events
          (id, run_id, agent_id, event_type, risk_level, cost_estimate,
           timestamp, work_packet_id, payload)
         VALUES (@id, @run_id, @agent_id, @event_type, @risk_level,
                 @cost_estimate, @timestamp, @work_packet_id, @payload)`,
      )
      .run({
        id: event.id,
        run_id: event.runId,
        agent_id: event.agentId,
        event_type: event.eventType,
        risk_level: event.riskLevel,
        cost_estimate: event.costEstimate,
        timestamp: event.timestamp,
        work_packet_id: workPacketId ?? null,
        payload: JSON.stringify(workPacketId ? { ...event, workPacketId } : event),
      });
    return event;
  }

  // ── Decision ──────────────────────────────────────────

  /** Append a Decision; SQLite mirror. */
  recordDecision(decision: Decision): Decision {
    const result = appendDecision(this.root, decision);
    if (!result.ok) {
      throw new LedgerInvariantError(`Decision append failed: ${result.error}`);
    }
    this.db
      .prepare(
        `INSERT OR REPLACE INTO decisions
          (id, title, chosen, risk_level, work_packet_id, council_review_id,
           created_at, created_by, payload)
         VALUES (@id, @title, @chosen, @risk_level, @work_packet_id,
                 @council_review_id, @created_at, @created_by, @payload)`,
      )
      .run({
        id: decision.id,
        title: decision.title,
        chosen: decision.chosen,
        risk_level: decision.riskLevel,
        work_packet_id: decision.workPacketId ?? null,
        council_review_id: decision.councilReviewId ?? null,
        created_at: decision.createdAt,
        created_by: decision.createdBy,
        payload: JSON.stringify(decision),
      });
    return decision;
  }

  // ── GraphEdge ─────────────────────────────────────────

  /**
   * Append a GraphEdge. REFUSES writes missing evidenceRef — substrate
   * invariant: every edge must cite its evidence. Throws LedgerInvariantError.
   */
  recordGraphEdge(edge: GraphEdge): GraphEdge {
    const result = appendGraphEdge(this.root, edge);
    if (!result.ok) {
      throw new LedgerInvariantError(result.error ?? 'GraphEdge append failed');
    }
    this.db
      .prepare(
        `INSERT OR REPLACE INTO graph_edges
          (id, edge_type, source, target, evidence_ref, confidence,
           created_by, created_at, payload)
         VALUES (@id, @edge_type, @source, @target, @evidence_ref,
                 @confidence, @created_by, @created_at, @payload)`,
      )
      .run({
        id: edge.id,
        edge_type: edge.edgeType,
        source: edge.source,
        target: edge.target,
        evidence_ref: edge.evidenceRef,
        confidence: edge.confidence,
        created_by: edge.createdBy,
        created_at: edge.createdAt,
        payload: JSON.stringify(edge),
      });
    return edge;
  }

  /** Count graph edges (for stats / sanity). */
  countGraphEdges(): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM graph_edges')
      .get() as { n: number };
    return row.n;
  }

  /**
   * Rebuild SQLite shadow indices from JSONL ledgers. JSONL is source of
   * truth; this is safe and idempotent.
   */
  rebuildFromLedgers(): {
    workPackets: number;
    events: number;
    decisions: number;
    edges: number;
  } {
    const stats = { workPackets: 0, events: 0, decisions: 0, edges: 0 };
    this.db.transaction(() => {
      this.db.exec(
        'DELETE FROM graph_edges; DELETE FROM decisions; DELETE FROM agent_events; DELETE FROM work_packets;',
      );
      for (const packet of readWorkPackets(this.root)) {
        this.upsertWorkPacketRow(packet);
        stats.workPackets++;
      }
      const eventsDir = join(this.root, 'memory', '_audit', 'agent-events');
      if (existsSync(eventsDir)) {
        const files = readdirSync(eventsDir).filter((f) => f.endsWith('.jsonl'));
        for (const file of files) {
          const day = file.slice(0, -'.jsonl'.length);
          for (const event of readAgentEventsForDay(this.root, day)) {
            this.db
              .prepare(
                `INSERT OR REPLACE INTO agent_events
                  (id, run_id, agent_id, event_type, risk_level, cost_estimate,
                   timestamp, work_packet_id, payload)
                 VALUES (@id, @run_id, @agent_id, @event_type, @risk_level,
                         @cost_estimate, @timestamp, @work_packet_id, @payload)`,
              )
              .run({
                id: event.id,
                run_id: event.runId,
                agent_id: event.agentId,
                event_type: event.eventType,
                risk_level: event.riskLevel,
                cost_estimate: event.costEstimate,
                timestamp: event.timestamp,
                work_packet_id: null,
                payload: JSON.stringify(event),
              });
            stats.events++;
          }
        }
      }
      for (const decision of readDecisions(this.root)) {
        const legacy = decision as Decision & {
          risk_level?: RiskLevel;
          work_packet_id?: string;
          council_review_id?: string;
          created_at?: string;
          created_by?: string;
          options_considered?: string[];
        };
        const normalized: Decision = {
          ...decision,
          options: decision.options ?? legacy.options_considered ?? [],
          riskLevel: decision.riskLevel ?? legacy.risk_level ?? 'low',
          workPacketId: decision.workPacketId ?? legacy.work_packet_id,
          councilReviewId: decision.councilReviewId ?? legacy.council_review_id,
          createdAt: decision.createdAt ?? legacy.created_at ?? nowIso(),
          createdBy: decision.createdBy ?? legacy.created_by ?? 'unknown',
        };
        this.db
          .prepare(
            `INSERT OR REPLACE INTO decisions
              (id, title, chosen, risk_level, work_packet_id, council_review_id,
               created_at, created_by, payload)
             VALUES (@id, @title, @chosen, @risk_level, @work_packet_id,
                     @council_review_id, @created_at, @created_by, @payload)`,
          )
          .run({
            id: normalized.id,
            title: normalized.title,
            chosen: normalized.chosen,
            risk_level: normalized.riskLevel,
            work_packet_id: normalized.workPacketId ?? null,
            council_review_id: normalized.councilReviewId ?? null,
            created_at: normalized.createdAt,
            created_by: normalized.createdBy,
            payload: JSON.stringify(normalized),
          });
        stats.decisions++;
      }
      for (const edge of readGraphEdges(this.root)) {
        if (!edge.evidenceRef || edge.evidenceRef.trim().length === 0) continue;
        this.db
          .prepare(
            `INSERT OR REPLACE INTO graph_edges
              (id, edge_type, source, target, evidence_ref, confidence,
               created_by, created_at, payload)
             VALUES (@id, @edge_type, @source, @target, @evidence_ref,
                     @confidence, @created_by, @created_at, @payload)`,
          )
          .run({
            id: edge.id,
            edge_type: edge.edgeType,
            source: edge.source,
            target: edge.target,
            evidence_ref: edge.evidenceRef,
            confidence: edge.confidence,
            created_by: edge.createdBy,
            created_at: edge.createdAt,
            payload: JSON.stringify(edge),
          });
        stats.edges++;
      }
    })();
    return stats;
  }

  /** Close the underlying database handle. */
  close(): void {
    this.db.close();
  }
}

// ── Convenience builders ───────────────────────────────────

/** Build a fresh AgentEvent with sensible defaults; caller supplies what matters. */
export function buildAgentEvent(input: {
  runId: string;
  agentId: string;
  eventType: string;
  summary?: string;
  toolsUsed?: string[];
  inputRefs?: string[];
  outputRefs?: string[];
  decisionsCreated?: string[];
  artifactsCreated?: string[];
  riskLevel?: RiskLevel;
  costEstimate?: number;
  timestamp?: string;
}): AgentEvent {
  const ts = input.timestamp ?? nowIso();
  return {
    id: newId('evt'),
    runId: input.runId,
    agentId: input.agentId,
    eventType: input.eventType,
    summary: input.summary ?? '',
    toolsUsed: input.toolsUsed ?? [],
    inputRefs: input.inputRefs ?? [],
    outputRefs: input.outputRefs ?? [],
    decisionsCreated: input.decisionsCreated ?? [],
    artifactsCreated: input.artifactsCreated ?? [],
    riskLevel: input.riskLevel ?? 'low',
    costEstimate: input.costEstimate ?? 0,
    timestamp: ts,
  };
}

/** Build a fresh Decision with id + timestamp populated. */
export function buildDecision(input: {
  title: string;
  context: string;
  options: string[];
  chosen: string;
  rationale: string;
  riskLevel: RiskLevel;
  createdBy: string;
  workPacketId?: string;
  councilReviewId?: string;
}): Decision {
  return {
    id: newId('dec'),
    title: input.title,
    context: input.context,
    options: input.options,
    chosen: input.chosen,
    rationale: input.rationale,
    riskLevel: input.riskLevel,
    workPacketId: input.workPacketId,
    councilReviewId: input.councilReviewId,
    createdAt: nowIso(),
    createdBy: input.createdBy,
  };
}

/** Build a GraphEdge — caller MUST supply evidenceRef (ledger refuses without). */
export function buildGraphEdge(input: {
  edgeType: string;
  source: string;
  target: string;
  evidenceRef: string;
  confidence: number;
  createdBy: string;
}): GraphEdge {
  return {
    id: newId('ge'),
    edgeType: input.edgeType,
    source: input.source,
    target: input.target,
    evidenceRef: input.evidenceRef,
    confidence: input.confidence,
    createdBy: input.createdBy,
    createdAt: nowIso(),
  };
}
