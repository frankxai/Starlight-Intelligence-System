/**
 * src/gateway/protocol.ts — GatewayRequest / GatewayResponse types and
 * the API v1 route table for the SIS Memory Gateway.
 *
 * Route table (API v1):
 *   POST /v1/memory/add       — add an entry to a vault
 *   POST /v1/memory/search    — search vaults with hybrid retrieval
 *   GET  /v1/memory/health    — liveness check
 *   GET  /v1/sessions/:id/items?limit=  — get session working memory
 *   POST /v1/sessions/:id/items          — add items to session
 *   POST /v1/sessions/:id/pop            — pop last session item
 *   DELETE /v1/sessions/:id             — clear + compact session
 *   POST /v1/graph/nodes      — upsert a bitemporal KG node
 *   POST /v1/graph/edges      — assert a bitemporal KG edge
 *   POST /v1/graph/subgraph   — multi-hop point-in-time KG subgraph query
 *   POST /v1/otel/spans       — record an OpenTelemetry gen_ai.* span
 *   GET  /v1/otel/summary     — summarize OpenTelemetry gen_ai.* spans
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import type { VaultType } from '../types.js';
import type { SessionItem } from '../session-store.js';
import type {
  UpsertNodeInput,
  AssertEdgeInput,
  QuerySubgraphOptions,
} from '../graph/bitemporal-kg.js';
import type { OtelGenAiSpanInput } from '../telemetry/otel-sqlite.js';

// ── HTTP-like request shape ─────────────────────────────────

export interface GatewayRequest {
  /** HTTP method: GET, POST, DELETE */
  method: 'GET' | 'POST' | 'DELETE';
  /**
   * Path without query string. Path params are parsed from this.
   * Examples: "/v1/memory/add", "/v1/sessions/mysession/items"
   */
  path: string;
  /** Parsed query string params. */
  query?: Record<string, string>;
  /** Parsed JSON body (for POST). */
  body?: unknown;
  /** Auth context — set by daemon, never trusted from caller. */
  auth?: AuthContext;
}

export interface AuthContext {
  harness: string;
  /**
   * External harnesses may NEVER set includePrivate.
   * This field exists only for internal/trusted callers.
   * Gateway enforces includePrivate = false for all external requests.
   */
  includePrivate: false;
}

// ── Response shape ──────────────────────────────────────────

export type GatewayResponse =
  | GatewaySuccessResponse
  | GatewayErrorResponse;

export interface GatewaySuccessResponse {
  ok: true;
  status: number;
  body: unknown;
}

export interface GatewayErrorResponse {
  ok: false;
  status: number;
  error: string;
}

// ── Typed request bodies ────────────────────────────────────

export interface MemoryAddBody {
  content: string;
  vault?: VaultType;
  tags?: string[];
  confidence?: number;
  source?: string;
}

export interface MemorySearchBody {
  query: string;
  vaults?: VaultType[];
  limit?: number;
  retrieval_mode?: 'hybrid' | 'lexical';
}

export interface SessionAddBody {
  items: SessionItem[];
}

export type GraphUpsertNodeBody = UpsertNodeInput;
export type GraphAssertEdgeBody = AssertEdgeInput;
export type GraphSubgraphBody = QuerySubgraphOptions;
export type OtelRecordSpanBody = OtelGenAiSpanInput;

// ── Route table ─────────────────────────────────────────────

export interface ParsedRoute {
  /** Route kind for dispatch. */
  kind:
    | 'memory.add'
    | 'memory.search'
    | 'memory.health'
    | 'session.getItems'
    | 'session.addItems'
    | 'session.pop'
    | 'session.clear'
    | 'graph.upsertNode'
    | 'graph.assertEdge'
    | 'graph.querySubgraph'
    | 'otel.recordSpan'
    | 'otel.summary'
    | 'not.found';
  /** Extracted path params. */
  params: Record<string, string>;
}

/**
 * Parse a method + path into a route descriptor.
 * Returns 'not.found' for unrecognised routes.
 */
export function parseRoute(method: string, path: string): ParsedRoute {
  const m = method.toUpperCase();

  if (m === 'POST' && path === '/v1/memory/add') {
    return { kind: 'memory.add', params: {} };
  }
  if (m === 'POST' && path === '/v1/memory/search') {
    return { kind: 'memory.search', params: {} };
  }
  if (m === 'GET' && path === '/v1/memory/health') {
    return { kind: 'memory.health', params: {} };
  }

  // Bitemporal knowledge graph routes
  if (m === 'POST' && path === '/v1/graph/nodes') {
    return { kind: 'graph.upsertNode', params: {} };
  }
  if (m === 'POST' && path === '/v1/graph/edges') {
    return { kind: 'graph.assertEdge', params: {} };
  }
  if (m === 'POST' && path === '/v1/graph/subgraph') {
    return { kind: 'graph.querySubgraph', params: {} };
  }

  // OpenTelemetry gen_ai.* span store routes
  if (m === 'POST' && path === '/v1/otel/spans') {
    return { kind: 'otel.recordSpan', params: {} };
  }
  if (m === 'GET' && path === '/v1/otel/summary') {
    return { kind: 'otel.summary', params: {} };
  }

  // Session routes: /v1/sessions/:id/items  or  /v1/sessions/:id/pop  or  DELETE /v1/sessions/:id
  const sessionItemsMatch = path.match(/^\/v1\/sessions\/([^/]+)\/items$/);
  if (sessionItemsMatch) {
    const id = sessionItemsMatch[1]!;
    if (m === 'GET') return { kind: 'session.getItems', params: { id } };
    if (m === 'POST') return { kind: 'session.addItems', params: { id } };
  }

  const sessionPopMatch = path.match(/^\/v1\/sessions\/([^/]+)\/pop$/);
  if (sessionPopMatch && m === 'POST') {
    return { kind: 'session.pop', params: { id: sessionPopMatch[1]! } };
  }

  const sessionDeleteMatch = path.match(/^\/v1\/sessions\/([^/]+)$/);
  if (sessionDeleteMatch && m === 'DELETE') {
    return { kind: 'session.clear', params: { id: sessionDeleteMatch[1]! } };
  }

  return { kind: 'not.found', params: {} };
}

// ── Helpers ─────────────────────────────────────────────────

export function ok(status: number, body: unknown): GatewaySuccessResponse {
  return { ok: true, status, body };
}

export function err(status: number, error: string): GatewayErrorResponse {
  return { ok: false, status, error };
}
