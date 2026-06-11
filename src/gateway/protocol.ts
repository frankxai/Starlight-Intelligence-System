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
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import type { VaultType } from '../types.js';
import type { SessionItem } from '../session-store.js';

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
