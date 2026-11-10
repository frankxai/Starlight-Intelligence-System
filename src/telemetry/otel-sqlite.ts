/**
 * src/telemetry/otel-sqlite.ts — Local SQLite OpenTelemetry `gen_ai.*` Span Store.
 *
 * Backed by Node built-in `node:sqlite` (`DatabaseSync`) in WAL mode at
 * `<storageRoot>/.starlight/otel-genai.sqlite`.
 *
 * Captures OpenTelemetry `gen_ai.*` semantic conventions alongside Starlight
 * estate attribution dimensions (`brand_id`, `product_id`, `agent_id`,
 * `workflow_id`, `estimated_cost`, `latency_ms`, `outcome_status`).
 *
 * Built on SIP — sovereign observability tier
 */

import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

// ── Public Types ────────────────────────────────────────────

export type OtelGroupByDimension = 'provider' | 'brand_id' | 'workflow_id' | 'agent_id';

export interface OtelGenAiSpanInput {
  span_id?: string;
  spanId?: string;
  trace_id?: string;
  traceId?: string;
  ts?: string;
  timestamp?: string;

  /** OpenTelemetry `gen_ai.system` (also accepted via `provider`). */
  gen_ai_system?: string;
  provider?: string;

  /** OpenTelemetry `gen_ai.request.model` (also accepted via `model`). */
  gen_ai_request_model?: string;
  model?: string;

  /** OpenTelemetry `gen_ai.operation.name` (default: `'chat'`). */
  gen_ai_operation_name?: string;
  operationName?: string;

  /** OpenTelemetry `gen_ai.usage.input_tokens`. */
  gen_ai_usage_input_tokens?: number;
  inputTokens?: number;

  /** OpenTelemetry `gen_ai.usage.output_tokens`. */
  gen_ai_usage_output_tokens?: number;
  outputTokens?: number;

  /** Required Starlight estate attribution dimensions. */
  brand_id?: string | null;
  brandId?: string | null;
  product_id?: string | null;
  productId?: string | null;
  agent_id?: string | null;
  agentId?: string | null;
  workflow_id?: string | null;
  workflowId?: string | null;

  estimated_cost?: number;
  estimatedCost?: number;
  latency_ms?: number;
  latencyMs?: number;
  outcome_status?: string;
  outcomeStatus?: string;

  /** Arbitrary OpenTelemetry span attributes map. */
  attributes?: Record<string, unknown>;
  attributes_json?: string;
}

export interface OtelGenAiSpanRecord {
  span_id: string;
  trace_id: string;
  ts: string;
  gen_ai_system: string;
  gen_ai_request_model: string;
  gen_ai_operation_name: string;
  gen_ai_usage_input_tokens: number;
  gen_ai_usage_output_tokens: number;
  brand_id: string | null;
  product_id: string | null;
  agent_id: string | null;
  workflow_id: string | null;
  estimated_cost: number;
  latency_ms: number;
  outcome_status: string;
  attributes: Record<string, unknown>;
}

export interface OtelSummarizeOptions {
  sinceIso?: string;
  groupBy?: OtelGroupByDimension;
  limit?: number;
}

export interface OtelSummaryTotals {
  spanCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCost: number;
  avgLatencyMs: number;
  errorCount: number;
}

export interface OtelSummaryGroup extends OtelSummaryTotals {
  key: string;
}

export interface OtelSummaryResult {
  sinceIso: string | null;
  groupBy: OtelGroupByDimension;
  totals: OtelSummaryTotals;
  groups: OtelSummaryGroup[];
}

export interface OtelGenAiStoreOptions {
  /** Storage root; defaults DB path to `<storageRoot>/.starlight/otel-genai.sqlite`. */
  storageRoot?: string;
  /** Explicit SQLite file path or `':memory:'` (overrides `storageRoot`). */
  dbPath?: string;
}

// ── Schema DDL ──────────────────────────────────────────────

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS otel_genai_spans (
  span_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  gen_ai_system TEXT NOT NULL,
  gen_ai_request_model TEXT NOT NULL,
  gen_ai_operation_name TEXT NOT NULL DEFAULT 'chat',
  gen_ai_usage_input_tokens INTEGER NOT NULL DEFAULT 0,
  gen_ai_usage_output_tokens INTEGER NOT NULL DEFAULT 0,
  brand_id TEXT,
  product_id TEXT,
  agent_id TEXT,
  workflow_id TEXT,
  estimated_cost REAL NOT NULL DEFAULT 0.0,
  latency_ms REAL NOT NULL DEFAULT 0.0,
  outcome_status TEXT NOT NULL DEFAULT 'ok',
  attributes_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_otel_genai_ts
  ON otel_genai_spans(ts);

CREATE INDEX IF NOT EXISTS idx_otel_genai_provider_ts
  ON otel_genai_spans(gen_ai_system, ts);

CREATE INDEX IF NOT EXISTS idx_otel_genai_brand_ts
  ON otel_genai_spans(brand_id, ts);

CREATE INDEX IF NOT EXISTS idx_otel_genai_workflow_ts
  ON otel_genai_spans(workflow_id, ts);

CREATE INDEX IF NOT EXISTS idx_otel_genai_agent_ts
  ON otel_genai_spans(agent_id, ts);

CREATE INDEX IF NOT EXISTS idx_otel_genai_trace
  ON otel_genai_spans(trace_id);
`;

const GROUP_BY_COLUMN_MAP: Record<OtelGroupByDimension, string> = {
  provider: 'gen_ai_system',
  brand_id: 'brand_id',
  workflow_id: 'workflow_id',
  agent_id: 'agent_id',
};

export function isValidOtelGroupBy(value: unknown): value is OtelGroupByDimension {
  return (
    value === 'provider' ||
    value === 'brand_id' ||
    value === 'workflow_id' ||
    value === 'agent_id'
  );
}

// ── OtelGenAiStore ──────────────────────────────────────────

export class OtelGenAiStore {
  private readonly db: DatabaseSync;
  private closed = false;

  constructor(options: OtelGenAiStoreOptions = {}) {
    const dbPath =
      options.dbPath ??
      join(options.storageRoot ?? process.cwd(), '.starlight', 'otel-genai.sqlite');

    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }

    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');
    this.db.exec(SCHEMA_DDL);
  }

  /**
   * Persist an OpenTelemetry `gen_ai.*` span with full attribution dimensions.
   */
  recordSpan(input: OtelGenAiSpanInput): OtelGenAiSpanRecord {
    if (!input || typeof input !== 'object') {
      throw new Error('span payload must be an object');
    }

    const attrs = parseAttributes(input.attributes, input.attributes_json);

    const providerRaw =
      firstNonEmptyString(
        input.gen_ai_system,
        input.provider,
        attrString(attrs, 'gen_ai.system'),
        attrString(attrs, 'gen_ai.provider.name'),
      );
    if (!providerRaw) {
      throw new Error('gen_ai_system (or provider) is required and must be a non-empty string');
    }

    const modelRaw =
      firstNonEmptyString(
        input.gen_ai_request_model,
        input.model,
        attrString(attrs, 'gen_ai.request.model'),
        attrString(attrs, 'gen_ai.response.model'),
      ) ?? 'unknown';

    const spanId =
      firstNonEmptyString(input.span_id, input.spanId) ?? `span_${randomUUID()}`;
    const traceId =
      firstNonEmptyString(input.trace_id, input.traceId) ?? `trace_${randomUUID()}`;
    const ts =
      firstNonEmptyString(input.ts, input.timestamp) ?? new Date().toISOString();
    const operationName =
      firstNonEmptyString(
        input.gen_ai_operation_name,
        input.operationName,
        attrString(attrs, 'gen_ai.operation.name'),
      ) ?? 'chat';

    const inputTokens = nonNegativeInt(
      input.gen_ai_usage_input_tokens ??
        input.inputTokens ??
        attrNumber(attrs, 'gen_ai.usage.input_tokens'),
    );
    const outputTokens = nonNegativeInt(
      input.gen_ai_usage_output_tokens ??
        input.outputTokens ??
        attrNumber(attrs, 'gen_ai.usage.output_tokens'),
    );

    const brandId =
      firstNonEmptyString(
        input.brand_id,
        input.brandId,
        attrString(attrs, 'brand_id'),
        attrString(attrs, 'starlight.brand_id'),
      ) ?? null;
    const productId =
      firstNonEmptyString(
        input.product_id,
        input.productId,
        attrString(attrs, 'product_id'),
        attrString(attrs, 'starlight.product_id'),
      ) ?? null;
    const agentId =
      firstNonEmptyString(
        input.agent_id,
        input.agentId,
        attrString(attrs, 'agent_id'),
        attrString(attrs, 'gen_ai.agent.id'),
      ) ?? null;
    const workflowId =
      firstNonEmptyString(
        input.workflow_id,
        input.workflowId,
        attrString(attrs, 'workflow_id'),
        attrString(attrs, 'starlight.workflow_id'),
      ) ?? null;

    const estimatedCost = nonNegativeFloat(
      input.estimated_cost ??
        input.estimatedCost ??
        attrNumber(attrs, 'estimated_cost') ??
        attrNumber(attrs, 'gen_ai.usage.cost'),
    );
    const latencyMs = nonNegativeFloat(
      input.latency_ms ??
        input.latencyMs ??
        attrNumber(attrs, 'latency_ms'),
    );
    const outcomeStatus =
      firstNonEmptyString(
        input.outcome_status,
        input.outcomeStatus,
        attrString(attrs, 'outcome_status'),
      ) ?? 'ok';

    const attributesJson = JSON.stringify(attrs);

    this.db
      .prepare(
        `INSERT INTO otel_genai_spans (
          span_id, trace_id, ts, gen_ai_system, gen_ai_request_model,
          gen_ai_operation_name, gen_ai_usage_input_tokens, gen_ai_usage_output_tokens,
          brand_id, product_id, agent_id, workflow_id,
          estimated_cost, latency_ms, outcome_status, attributes_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(span_id) DO UPDATE SET
          trace_id = excluded.trace_id,
          ts = excluded.ts,
          gen_ai_system = excluded.gen_ai_system,
          gen_ai_request_model = excluded.gen_ai_request_model,
          gen_ai_operation_name = excluded.gen_ai_operation_name,
          gen_ai_usage_input_tokens = excluded.gen_ai_usage_input_tokens,
          gen_ai_usage_output_tokens = excluded.gen_ai_usage_output_tokens,
          brand_id = excluded.brand_id,
          product_id = excluded.product_id,
          agent_id = excluded.agent_id,
          workflow_id = excluded.workflow_id,
          estimated_cost = excluded.estimated_cost,
          latency_ms = excluded.latency_ms,
          outcome_status = excluded.outcome_status,
          attributes_json = excluded.attributes_json`,
      )
      .run(
        spanId,
        traceId,
        ts,
        providerRaw,
        modelRaw,
        operationName,
        inputTokens,
        outputTokens,
        brandId,
        productId,
        agentId,
        workflowId,
        estimatedCost,
        latencyMs,
        outcomeStatus,
        attributesJson,
      );

    return {
      span_id: spanId,
      trace_id: traceId,
      ts,
      gen_ai_system: providerRaw,
      gen_ai_request_model: modelRaw,
      gen_ai_operation_name: operationName,
      gen_ai_usage_input_tokens: inputTokens,
      gen_ai_usage_output_tokens: outputTokens,
      brand_id: brandId,
      product_id: productId,
      agent_id: agentId,
      workflow_id: workflowId,
      estimated_cost: estimatedCost,
      latency_ms: latencyMs,
      outcome_status: outcomeStatus,
      attributes: attrs,
    };
  }

  /**
   * Retrieve a single recorded span by `span_id`.
   */
  getSpan(spanId: string): OtelGenAiSpanRecord | null {
    const row = this.db
      .prepare('SELECT * FROM otel_genai_spans WHERE span_id = ?')
      .get(spanId);
    return row ? rowToSpan(row) : null;
  }

  /**
   * Aggregate token usage, cost, latency, and error counts across recorded spans,
   * optionally filtered by `sinceIso` and grouped by an attribution dimension.
   */
  summarize(options: OtelSummarizeOptions = {}): OtelSummaryResult {
    const groupBy: OtelGroupByDimension = options.groupBy ?? 'provider';
    if (!isValidOtelGroupBy(groupBy)) {
      throw new Error(
        `Invalid groupBy "${String(options.groupBy)}"; expected one of: provider, brand_id, workflow_id, agent_id`,
      );
    }

    const col = GROUP_BY_COLUMN_MAP[groupBy];
    const sinceIso =
      typeof options.sinceIso === 'string' && options.sinceIso.trim()
        ? options.sinceIso.trim()
        : null;
    const rawLimit = options.limit ?? 50;
    const safeLimit = Math.max(1, Math.min(500, Math.trunc(rawLimit)));

    const whereSql = sinceIso ? 'WHERE ts >= ?' : '';
    const whereParams: SQLInputValue[] = sinceIso ? [sinceIso] : [];

    const totalsRow = this.db
      .prepare(
        `SELECT
           COUNT(*) AS span_count,
           COALESCE(SUM(gen_ai_usage_input_tokens), 0) AS input_tokens,
           COALESCE(SUM(gen_ai_usage_output_tokens), 0) AS output_tokens,
           COALESCE(SUM(estimated_cost), 0.0) AS total_cost,
           COALESCE(AVG(latency_ms), 0.0) AS avg_latency_ms,
           COALESCE(SUM(CASE WHEN outcome_status != 'ok' THEN 1 ELSE 0 END), 0) AS error_count
         FROM otel_genai_spans
         ${whereSql}`,
      )
      .get(...whereParams);

    const groupRows = this.db
      .prepare(
        `SELECT
           COALESCE(${col}, 'unattributed') AS group_key,
           COUNT(*) AS span_count,
           COALESCE(SUM(gen_ai_usage_input_tokens), 0) AS input_tokens,
           COALESCE(SUM(gen_ai_usage_output_tokens), 0) AS output_tokens,
           COALESCE(SUM(estimated_cost), 0.0) AS total_cost,
           COALESCE(AVG(latency_ms), 0.0) AS avg_latency_ms,
           COALESCE(SUM(CASE WHEN outcome_status != 'ok' THEN 1 ELSE 0 END), 0) AS error_count
         FROM otel_genai_spans
         ${whereSql}
         GROUP BY group_key
         ORDER BY total_cost DESC, span_count DESC, group_key ASC
         LIMIT ?`,
      )
      .all(...whereParams, safeLimit);

    const totals = rowToTotals(totalsRow ?? {});
    const groups: OtelSummaryGroup[] = groupRows.map((row) => ({
      key: String(row.group_key ?? 'unattributed'),
      ...rowToTotals(row),
    }));

    return {
      sinceIso,
      groupBy,
      totals,
      groups,
    };
  }

  /**
   * Close the underlying SQLite connection. Idempotent.
   */
  close(): void {
    if (!this.closed && this.db.isOpen) {
      this.db.close();
      this.closed = true;
    }
  }
}

// ── Internal Helpers ────────────────────────────────────────

function firstNonEmptyString(...candidates: Array<unknown>): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string') {
      const trimmed = c.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return undefined;
}

function attrString(attrs: Record<string, unknown>, key: string): string | undefined {
  const val = attrs[key];
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined;
}

function attrNumber(attrs: Record<string, unknown>, key: string): number | undefined {
  const val = attrs[key];
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    const parsed = Number(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function nonNegativeInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }
  return 0;
}

function nonNegativeFloat(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }
  return 0;
}

function parseAttributes(
  attrs?: Record<string, unknown>,
  attrsJson?: string,
): Record<string, unknown> {
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return { ...attrs };
  }
  if (typeof attrsJson === 'string' && attrsJson.trim()) {
    try {
      const parsed: unknown = JSON.parse(attrsJson);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      /* ignore malformed JSON */
    }
  }
  return {};
}

function rowToTotals(row: Record<string, SQLOutputValue>): OtelSummaryTotals {
  const spanCount = Number(row.span_count ?? 0);
  const inputTokens = Number(row.input_tokens ?? 0);
  const outputTokens = Number(row.output_tokens ?? 0);
  const totalCost = Number(row.total_cost ?? 0);
  const avgLatencyMs = Number(row.avg_latency_ms ?? 0);
  const errorCount = Number(row.error_count ?? 0);

  return {
    spanCount,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    totalCost: Math.round(totalCost * 1e9) / 1e9,
    avgLatencyMs: Math.round(avgLatencyMs * 1e4) / 1e4,
    errorCount,
  };
}

function rowToSpan(row: Record<string, SQLOutputValue>): OtelGenAiSpanRecord {
  return {
    span_id: String(row.span_id ?? ''),
    trace_id: String(row.trace_id ?? ''),
    ts: String(row.ts ?? ''),
    gen_ai_system: String(row.gen_ai_system ?? ''),
    gen_ai_request_model: String(row.gen_ai_request_model ?? ''),
    gen_ai_operation_name: String(row.gen_ai_operation_name ?? 'chat'),
    gen_ai_usage_input_tokens: Number(row.gen_ai_usage_input_tokens ?? 0),
    gen_ai_usage_output_tokens: Number(row.gen_ai_usage_output_tokens ?? 0),
    brand_id: row.brand_id != null ? String(row.brand_id) : null,
    product_id: row.product_id != null ? String(row.product_id) : null,
    agent_id: row.agent_id != null ? String(row.agent_id) : null,
    workflow_id: row.workflow_id != null ? String(row.workflow_id) : null,
    estimated_cost: Number(row.estimated_cost ?? 0),
    latency_ms: Number(row.latency_ms ?? 0),
    outcome_status: String(row.outcome_status ?? 'ok'),
    attributes: parseAttributes(
      undefined,
      typeof row.attributes_json === 'string' ? row.attributes_json : undefined,
    ),
  };
}
