import { WorkerEntrypoint } from 'cloudflare:workers';
import { Agent, getAgentByName } from 'agents';
import { agentNameFor, isPurge, OAUTH_CALLBACK_PATH } from './identity.ts';

interface Env {
  TenantAgent: DurableObjectNamespace<TenantAgent>;
}

// One agent instance per tenant. MCP OAuth tokens live in this Durable Object's SQLite,
// inside the tenant's own Worker script, so no other tenant's code can bind to them.
export class TenantAgent extends Agent<Env> {
  // Keep the instance name (the tenant id) out of client handshakes and OAuth URLs.
  static options = { sendIdentityOnConnect: false };

  async onRequest(request: Request): Promise<Response> {
    if (await this.ctx.storage.get('purged')) return Response.json({ error: 'tenant_deleted' }, { status: 410 });
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/mcp/servers') {
      const { name, serverUrl } = (await request.json()) as { name?: string; serverUrl?: string };
      if (!name || !serverUrl || !serverUrl.startsWith('https://')) {
        return Response.json({ error: 'name and https serverUrl required' }, { status: 400 });
      }
      const result = await this.addMcpServer(name, serverUrl, { callbackPath: OAUTH_CALLBACK_PATH });
      if (result.state === 'authenticating') return Response.json({ state: result.state, authUrl: result.authUrl });
      return Response.json({ state: 'ready', id: result.id });
    }
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  // Deletes everything this agent stored, MCP OAuth tokens included.
  async purge(): Promise<void> {
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.put('purged', true);
  }
}

export default class TenantWorker extends WorkerEntrypoint<Env> {
  async fetch(request: Request): Promise<Response> {
    let name: string;
    try {
      name = agentNameFor(this.ctx.props);
    } catch {
      return Response.json({ error: 'not_dispatched' }, { status: 403 });
    }
    // The OAuth callback and every other route land on the same single instance.
    const agent = await getAgentByName(this.env.TenantAgent, name);
    if (isPurge(this.ctx.props)) {
      await agent.purge();
      return Response.json({ purged: true });
    }
    return agent.fetch(request);
  }
}
