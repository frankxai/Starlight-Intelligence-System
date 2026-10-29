import { DurableObject } from 'cloudflare:workers';
import type { TenantRecord, TenantState, Usage } from './core.ts';
import { handleRequest, type DispatchNamespace } from './handler.ts';
import { handleLifecycle } from './lifecycle.ts';

interface Bindings {
  PLATFORM_DOMAIN: string;
  PLATFORM_ADMIN_TOKEN?: string;
  DEFAULT_CAP_MICRO_USD: string;
  DISPATCHER: DispatchNamespace;
  TENANT_LEDGER: DurableObjectNamespace<TenantLedger>;
}

const monthStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

// One ledger per tenant, owned by the platform Worker. Tenant code has no binding to it.
export class TenantLedger extends DurableObject {
  async read(): Promise<{ record: TenantRecord | null; usage: Usage }> {
    const record = (await this.ctx.storage.get<TenantRecord>('record')) ?? null;
    return { record, usage: await this.currentUsage() };
  }

  async reserve(microUsd: number): Promise<boolean> {
    const record = await this.ctx.storage.get<TenantRecord>('record');
    if (!record || record.state !== 'active') return false;
    const usage = await this.currentUsage();
    if (usage.spentMicroUsd + microUsd > record.capMicroUsd) return false;
    await this.ctx.storage.put('usage', { ...usage, spentMicroUsd: usage.spentMicroUsd + microUsd });
    return true;
  }

  async create(record: TenantRecord): Promise<boolean> {
    if (await this.ctx.storage.get('record')) return false;
    await this.ctx.storage.put('record', record);
    return true;
  }

  async setState(state: TenantState): Promise<void> {
    const record = await this.ctx.storage.get<TenantRecord>('record');
    if (record) await this.ctx.storage.put('record', { ...record, state });
  }

  private async currentUsage(): Promise<Usage> {
    const start = monthStart();
    const usage = await this.ctx.storage.get<Usage>('usage');
    return usage && usage.periodStart === start ? usage : { periodStart: start, spentMicroUsd: 0 };
  }
}

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const ledgerFor = (tenantId: string) => env.TENANT_LEDGER.get(env.TENANT_LEDGER.idFromName(tenantId));
    const host = new URL(request.url).hostname.toLowerCase();
    if (host === 'platform.' + env.PLATFORM_DOMAIN.toLowerCase()) {
      return handleLifecycle(request, { ...env, adminLedgerFor: ledgerFor });
    }
    return handleRequest(request, { ...env, ledgerFor });
  },
} satisfies ExportedHandler<Bindings>;
