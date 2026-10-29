import { canTransition, isValidTenantId, sha256Hex, timingSafeEqual, type TenantRecord, type TenantState, type Usage } from './core.ts';

export interface LedgerAdmin {
  read(): Promise<{ record: TenantRecord | null; usage: Usage }>;
  create(record: TenantRecord): Promise<boolean>;
  setState(state: TenantState): Promise<void>;
}

export interface LifecycleEnv {
  PLATFORM_ADMIN_TOKEN?: string;
  DEFAULT_CAP_MICRO_USD: string;
  adminLedgerFor(tenantId: string): LedgerAdmin;
  // Wipes the tenant agent's storage, including MCP OAuth tokens. True when nothing remains.
  purgeTenant(tenantId: string): Promise<boolean>;
}

export async function purgeTenantStorage(getWorker: () => { fetch(request: Request): Promise<Response> }): Promise<boolean> {
  try {
    const response = await getWorker().fetch(new Request('https://purge.internal/', { method: 'POST' }));
    return response.status === 200;
  } catch (error) {
    // A tenant whose Worker was never uploaded has no agent storage to wipe.
    return error instanceof Error && error.message.startsWith('Worker not found');
  }
}

const json = (status: number, body: unknown) => Response.json(body, { status });

function authorized(request: Request, token: string | undefined): boolean {
  if (!token || token.trim() === '') return false;
  return timingSafeEqual(request.headers.get('authorization') ?? '', 'Bearer ' + token);
}

function newAccessToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Routes on the platform host: POST /tenants/:id (signup), GET /tenants/:id/export,
// DELETE /tenants/:id. Activation is deliberately absent: a tenant becomes active only
// from a verified payment webhook, which is not wired yet (money paths are Frank's).
export async function handleLifecycle(request: Request, env: LifecycleEnv): Promise<Response> {
  if (!authorized(request, env.PLATFORM_ADMIN_TOKEN)) return json(401, { error: 'unauthorized' });

  const match = new URL(request.url).pathname.match(/^\/tenants\/([^/]+)(\/export)?$/);
  if (!match || !isValidTenantId(match[1])) return json(404, { error: 'not_found' });
  const tenantId = match[1];
  const ledger = env.adminLedgerFor(tenantId);

  if (request.method === 'POST' && !match[2]) {
    const cap = Number(env.DEFAULT_CAP_MICRO_USD);
    if (!Number.isSafeInteger(cap) || cap <= 0) return json(500, { error: 'cap_not_configured' });
    const accessToken = newAccessToken();
    const record = { tenantId, state: 'pending_payment' as const, plan: 'team' as const, capMicroUsd: cap, tokenHash: await sha256Hex(accessToken) };
    if (!(await ledger.create(record))) return json(409, { error: 'tenant_exists' });
    // Shown once; only the hash is stored.
    return json(201, { tenantId, state: 'pending_payment', accessToken });
  }

  const { record, usage } = await ledger.read();
  if (!record) return json(404, { error: 'tenant_not_found' });

  if (request.method === 'GET' && match[2]) {
    // Platform-side data only; the tenant's own agent state is exported by its Worker.
    const { tokenHash: _omitted, ...exported } = record;
    return json(200, { record: exported, usage });
  }

  if (request.method === 'DELETE' && !match[2]) {
    if (!canTransition(record.state, 'deleted')) return json(409, { error: 'already_deleted' });
    // Stop new admissions, then wipe credentials, then mark deleted. A call admitted before
    // the suspension can still write after the wipe; the agent's tombstone refuses its own
    // later requests, and removing the tenant--<id> script removes whatever is left.
    if (record.state === 'active') await ledger.setState('suspended');
    if (!(await env.purgeTenant(tenantId))) return json(502, { error: 'purge_failed' });
    await ledger.setState('deleted');
    // Removing the tenant--<id> script needs the Cloudflare API and stays a manual step.
    return json(200, { tenantId, state: 'deleted', scriptRemoval: 'pending' });
  }

  return json(405, { error: 'method_not_allowed' });
}
