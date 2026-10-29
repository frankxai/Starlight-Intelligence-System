import {
  admit,
  callerAuthorized,
  MCP_SERVERS_PATH,
  OAUTH_CALLBACK_PATH,
  OAUTH_STATE_TTL_MS,
  oauthStateFrom,
  scriptNameFor,
  sha256Hex,
  tenantIdFromHost,
  type InvocationLimits,
  type TenantRecord,
  type Usage,
} from './core.ts';

// Structural types for the bindings, so tests can pass plain objects.
export interface DispatchNamespace {
  get(name: string, args?: { props?: Record<string, unknown> }, options?: { limits?: InvocationLimits }): { fetch(request: Request): Promise<Response> };
}

export interface Ledger {
  read(): Promise<{ record: TenantRecord | null; usage: Usage }>;
  // Atomic inside the tenant's ledger Durable Object; returns false if the cap would be crossed.
  reserve(microUsd: number): Promise<boolean>;
  release(microUsd: number): Promise<void>;
  addOAuthState(stateHash: string, expiresAt: number): Promise<boolean>;
  // One use: returns true and forgets the state if it was pending and unexpired.
  consumeOAuthState(stateHash: string): Promise<boolean>;
}

export interface Env {
  PLATFORM_DOMAIN: string;
  DISPATCHER: DispatchNamespace;
  ledgerFor(tenantId: string): Ledger;
}

const json = (status: number, body: unknown) => Response.json(body, { status });

// The OAuth redirect arrives from the tenant's browser without our bearer token. It is let
// through only if its state was registered when this tenant started the connection, so
// strangers cannot spend the tenant's budget by hitting the callback URL.
async function authorize(record: TenantRecord, url: URL, request: Request, ledger: Ledger): Promise<boolean> {
  if (url.pathname !== OAUTH_CALLBACK_PATH) return callerAuthorized(record, request.headers.get('authorization'));
  const state = oauthStateFrom(url);
  return state !== null && ledger.consumeOAuthState(await sha256Hex(state));
}

async function rememberOAuthState(response: Response, ledger: Ledger): Promise<void> {
  try {
    const body = (await response.clone().json()) as { authUrl?: unknown };
    if (typeof body.authUrl !== 'string') return;
    const state = oauthStateFrom(new URL(body.authUrl));
    if (state) await ledger.addOAuthState(await sha256Hex(state), Date.now() + OAUTH_STATE_TTL_MS);
  } catch {
    // Not an auth hand-off; the connection simply cannot complete its callback.
  }
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const tenantId = tenantIdFromHost(url.hostname, env.PLATFORM_DOMAIN);
  if (!tenantId) return json(404, { error: 'tenant_not_found' });

  let ledger: Ledger;
  let admission;
  try {
    ledger = env.ledgerFor(tenantId);
    const { record, usage } = await ledger.read();
    if (record && !(await authorize(record, url, request, ledger))) return json(401, { error: 'unauthorized' });
    admission = admit(record, usage);
    if (admission.ok && !(await ledger.reserve(admission.reserveMicroUsd))) {
      return json(402, { error: 'spend_cap_reached' });
    }
  } catch {
    // No ledger answer means no proof the tenant has budget left.
    return json(503, { error: 'ledger_unavailable' });
  }
  if (!admission.ok) return json(admission.status, { error: admission.reason });

  // The platform token stops here; tenant code never sees it.
  const forwarded = new Request(request);
  forwarded.headers.delete('authorization');
  let response: Response;
  try {
    const worker = env.DISPATCHER.get(scriptNameFor(tenantId), { props: { tenantId } }, { limits: admission.limits });
    response = await worker.fetch(forwarded);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Worker not found')) {
      // Nothing ran, so nothing to charge.
      await ledger.release(admission.reserveMicroUsd).catch(() => {});
      return json(404, { error: 'tenant_not_deployed' });
    }
    return json(502, { error: 'tenant_worker_failed' });
  }

  if (request.method === 'POST' && url.pathname === MCP_SERVERS_PATH && response.ok) {
    await rememberOAuthState(response, ledger);
  }
  return response;
}
