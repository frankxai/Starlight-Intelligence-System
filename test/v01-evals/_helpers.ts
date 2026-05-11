/**
 * Track D v0.1 — shared eval helpers
 *
 * Single source of truth for the v0.1 MCP envelope contract, so the 7
 * evals stay aligned when Track B re-shapes its return contract.
 *
 * Envelope contract (as of 2026-05-11 rebuild of dist/mcp-server-v01.js):
 *   • success:  { ok: true, <entityKey>: ... }   e.g. {ok:true, decision:{...}}
 *   • error:    { ok: false, error: string }
 *   • gate:     { status: 'approval_required', approvalGateId, riskLevel, reason }
 *
 * Built on SIP — operational tier, Track D
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SisMcpServerV01 } from '../../dist/mcp-server-v01.js';

export type Server = InstanceType<typeof SisMcpServerV01>;

export interface EnvelopeOk {
  ok: true;
  [key: string]: unknown;
}
export interface EnvelopeErr {
  ok: false;
  error: string;
}
export interface EnvelopeGate {
  status: 'approval_required';
  approvalGateId: string;
  riskLevel: string;
  reason: string;
}
export type Envelope = EnvelopeOk | EnvelopeErr | EnvelopeGate;

/** True for success envelopes. */
export function isOk(r: unknown): r is EnvelopeOk {
  return typeof r === 'object' && r !== null && (r as { ok?: boolean }).ok === true;
}

/** True for error envelopes (NOT including approval gates). */
export function isErr(r: unknown): r is EnvelopeErr {
  return typeof r === 'object' && r !== null && (r as { ok?: boolean }).ok === false;
}

/** True for approval-gate envelopes (status:'approval_required'). */
export function isGate(r: unknown): r is EnvelopeGate {
  return (
    typeof r === 'object' &&
    r !== null &&
    (r as { status?: string }).status === 'approval_required'
  );
}

/** Extract a named entity from a success envelope. Throws if not present. */
export function pick<T = unknown>(r: unknown, key: string): T {
  if (!isOk(r)) {
    throw new Error(`expected ok envelope, got: ${JSON.stringify(r).slice(0, 200)}`);
  }
  const v = (r as Record<string, unknown>)[key];
  if (v === undefined) {
    throw new Error(`envelope missing key "${key}": ${JSON.stringify(r).slice(0, 200)}`);
  }
  return v as T;
}

/** Read the error string from an error envelope. */
export function errOf(r: unknown): string {
  if (!isErr(r)) return JSON.stringify(r);
  return r.error;
}

/** Spin up an isolated server with a temp root, run fn, clean up. */
export function withServer<T>(fn: (s: Server, root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), 'v01-eval-'));
  const vaultDir = join(root, 'vaults');
  const server = new SisMcpServerV01({ vaultDir, substrateDir: root, repoRoot: root });
  try {
    return fn(server, root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
