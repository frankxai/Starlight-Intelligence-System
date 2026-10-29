// Pure platform rules. No Cloudflare runtime imports, so node --test can exercise them.

export type TenantState = 'pending_payment' | 'active' | 'suspended' | 'deleted';
export type Plan = 'team';

export interface TenantRecord {
  tenantId: string;
  state: TenantState;
  plan: Plan;
  // Hard monthly cap the tenant paid for, in micro-USD so sums stay integer.
  capMicroUsd: number;
  // SHA-256 hex of the tenant's access token; the token itself is shown once at signup.
  tokenHash: string;
}

export const OAUTH_CALLBACK_PATH = '/mcp-oauth-callback';
export const MCP_SERVERS_PATH = '/mcp/servers';
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const MAX_OAUTH_STATE_LENGTH = 512;

export function oauthStateFrom(url: URL): string | null {
  const state = url.searchParams.get('state');
  return state && state.length <= MAX_OAUTH_STATE_LENGTH ? state : null;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function callerAuthorized(record: TenantRecord, authorization: string | null): Promise<boolean> {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (token === '') return false;
  return timingSafeEqual(await sha256Hex(token), record.tokenHash);
}

export interface Usage {
  periodStart: string;
  spentMicroUsd: number;
}

export interface InvocationLimits {
  cpuMs: number;
  subRequests: number;
}

const TENANT_ID = /^[a-z][a-z0-9-]{2,30}[a-z0-9]$/;
const RESERVED = new Set(['www', 'api', 'platform', 'admin', 'mcp', 'status']);

export function isValidTenantId(id: string): boolean {
  return TENANT_ID.test(id) && !id.includes('--') && !RESERVED.has(id);
}

// Identity comes from the hostname the platform owns, never from headers, path or body.
export function tenantIdFromHost(hostname: string, platformDomain: string): string | null {
  const host = hostname.toLowerCase();
  const suffix = '.' + platformDomain.toLowerCase();
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (label.includes('.')) return null;
  return isValidTenantId(label) ? label : null;
}

// One user Worker per tenant in the dispatch namespace; the prefix keeps tenant scripts
// apart from any platform script that ever lands in the same namespace.
export function scriptNameFor(tenantId: string): string {
  if (!isValidTenantId(tenantId)) throw new Error('invalid tenant id');
  return 'tenant--' + tenantId;
}

export function limitsFor(plan: Plan): InvocationLimits {
  switch (plan) {
    case 'team':
      return { cpuMs: 200, subRequests: 50 };
  }
}

// Prices in micro-USD per unit, from developers.cloudflare.com read 2026-10-29.
const PRICE = {
  request: 0.3, // per Workers request; WfP bills the dispatch chain as one request
  cpuMs: 0.02, // per CPU-ms, counted in every Worker of the chain
  doRequest: 0.15, // per Durable Object request or RPC session
  doGbSecond: 12.5, // per GB-s of Durable Object wall time at 128 MB
};
const DISPATCHER_CPU_ALLOWANCE_MS = 10;
const DO_REQUESTS_PER_CALL = 3; // ledger read, ledger reserve, tenant agent
// Wall time charged per call for the tenant agent. Time beyond this (pending I/O can hold
// an object up to 15 minutes) is not yet reconciled; see README "Not done yet".
export const AGENT_WALL_SECONDS_PER_CALL = 30;

// Platform cost of one invocation at the plan's limits, reserved before the call so the
// metered total never crosses the cap.
export function worstCaseMicroUsd(limits: InvocationLimits): number {
  const cpu = (limits.cpuMs + DISPATCHER_CPU_ALLOWANCE_MS) * PRICE.cpuMs;
  const doRequests = DO_REQUESTS_PER_CALL * PRICE.doRequest;
  const doDuration = 0.125 * AGENT_WALL_SECONDS_PER_CALL * PRICE.doGbSecond;
  return Math.ceil(PRICE.request + cpu + doRequests + doDuration);
}

export type Admission =
  | { ok: true; reserveMicroUsd: number; limits: InvocationLimits }
  | { ok: false; status: 402 | 403 | 404 | 410; reason: string };

export function admit(record: TenantRecord | null, usage: Usage): Admission {
  if (!record) return { ok: false, status: 404, reason: 'tenant_not_found' };
  switch (record.state) {
    case 'pending_payment':
      return { ok: false, status: 402, reason: 'payment_required' };
    case 'suspended':
      return { ok: false, status: 403, reason: 'tenant_suspended' };
    case 'deleted':
      return { ok: false, status: 410, reason: 'tenant_deleted' };
    case 'active':
      break;
  }
  const limits = limitsFor(record.plan);
  const reserve = worstCaseMicroUsd(limits);
  if (usage.spentMicroUsd + reserve > record.capMicroUsd) {
    return { ok: false, status: 402, reason: 'spend_cap_reached' };
  }
  return { ok: true, reserveMicroUsd: reserve, limits };
}

const TRANSITIONS: Record<TenantState, TenantState[]> = {
  pending_payment: ['active', 'deleted'],
  active: ['suspended', 'deleted'],
  suspended: ['active', 'deleted'],
  deleted: [],
};

export function canTransition(from: TenantState, to: TenantState): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface CostInputs {
  tenants: number;
  requestsPerTenant: number;
  avgCpuMsPerRequest: number;
  containerHoursPerTenant: number;
}

// Prices from developers.cloudflare.com, read 2026-10-29: Workers Paid $5, WfP $25 with
// 20M requests / 60M CPU-ms / 1,000 scripts, $0.30 per M requests, $0.02 per M CPU-ms,
// $0.02 per extra script; containers $0.000020 per vCPU-s and $0.0000025 per GiB-s.
// Durable Object duration and storage are not modelled.
export function estimateMonthlyUsd(i: CostInputs): { platform: number; perTenant: number; total: number } {
  const requests = i.tenants * i.requestsPerTenant;
  const cpuMs = requests * i.avgCpuMsPerRequest;
  const fixed = 5 + 25;
  const requestOverage = Math.max(0, requests - 20_000_000) / 1_000_000 * 0.3;
  const cpuOverage = Math.max(0, cpuMs - 60_000_000) / 1_000_000 * 0.02;
  const scriptOverage = Math.max(0, i.tenants - 1_000) * 0.02;
  const containerHourUsd = 1 * 3600 * 0.00002 + 4 * 3600 * 0.0000025; // 1 vCPU, 4 GiB
  const containers = i.tenants * i.containerHoursPerTenant * containerHourUsd;
  const total = fixed + requestOverage + cpuOverage + scriptOverage + containers;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { platform: round(fixed), perTenant: round(i.tenants ? (total - fixed) / i.tenants : 0), total: round(total) };
}
