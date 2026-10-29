import { admit, callerAuthorized, scriptNameFor, tenantIdFromHost, type TenantRecord, type Usage, type InvocationLimits } from './core.ts';

// Structural types for the bindings, so tests can pass plain objects.
export interface DispatchNamespace {
  get(name: string, args?: { props?: Record<string, unknown> }, options?: { limits?: InvocationLimits }): { fetch(request: Request): Promise<Response> };
}

export interface Ledger {
  read(): Promise<{ record: TenantRecord | null; usage: Usage }>;
  // Atomic inside the tenant's ledger Durable Object; returns false if the cap would be crossed.
  reserve(microUsd: number): Promise<boolean>;
}

export interface Env {
  PLATFORM_DOMAIN: string;
  DISPATCHER: DispatchNamespace;
  ledgerFor(tenantId: string): Ledger;
}

const json = (status: number, body: unknown) => Response.json(body, { status });

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const tenantId = tenantIdFromHost(url.hostname, env.PLATFORM_DOMAIN);
  if (!tenantId) return json(404, { error: 'tenant_not_found' });

  let admission;
  try {
    const ledger = env.ledgerFor(tenantId);
    const { record, usage } = await ledger.read();
    if (record && !(await callerAuthorized(record, url.pathname, request.headers.get('authorization')))) {
      return json(401, { error: 'unauthorized' });
    }
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
  const worker = env.DISPATCHER.get(scriptNameFor(tenantId), { props: { tenantId } }, { limits: admission.limits });
  try {
    return await worker.fetch(forwarded);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Worker not found')) {
      return json(404, { error: 'tenant_not_deployed' });
    }
    return json(502, { error: 'tenant_worker_failed' });
  }
}
