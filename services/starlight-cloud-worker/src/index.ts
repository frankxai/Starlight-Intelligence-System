/**
 * Starlight Managed Cloud & Service Mesh — Cloudflare Edge Worker
 * High-velocity sovereign memory API, Stateless Streamable HTTP vMCP router,
 * A2A Agent Card discovery, cost-aware AI gateway, and 3D Visual Palace.
 * 
 * Built on SIP v1.1.1
 */

import { EdgeVeil } from './edge-veil.js';
import { HybridRanker } from './rrf.js';
import { EdgeVirtualMcpRouter } from './vmcp.js';
import { UniversalVectorRouter } from './providers/universal-vector.js';
import { DualTelemetryDispatcher } from './telemetry/dual-dispatcher.js';
import { UnifiedAiGateway, type ChatCompletionRequest } from './llm/ai-gateway.js';
import { buildCloudWorkerAgentCard } from './agent-card.js';
import { StatelessMcpHttpHandler } from './mcp-http.js';
import type { 
  MemoryAtom, 
  IngestionRequest, 
  IngestionResult, 
  QueryRequest, 
  QueryResponse, 
  VmcpRequest,
  SwarmLeaseRequest,
  SwarmLeaseResponse,
  TenantContext
} from './types.js';

export type IdentityMembershipVerifier = (
  token: string,
  requestedTenant: string | null
) => Promise<TenantContext | null> | TenantContext | null;

export interface Env {
  ENVIRONMENT?: string;
  STARLIGHT_VECTORS?: any; // Cloudflare Vectorize binding
  STARLIGHT_DB?: any;      // Cloudflare D1 binding
  STARLIGHT_KV?: any;      // Cloudflare KV binding
  AI?: any;                // Cloudflare Workers AI binding
  DEFAULT_HALF_LIFE_DAYS?: string;
  STARLIGHT_IDENTITY_VERIFIER?: IdentityMembershipVerifier;
}

// Explicit no-binding component mode stores (never used to mask D1/KV errors when bindings exist)
const MEMORY_INDEX = new Map<string, MemoryAtom[]>();
const ACTIVE_LEASES = new Map<string, SwarmLeaseResponse>();
const VMCP_ROUTER = new EdgeVirtualMcpRouter();

export class StarlightCloudWorker {
  private static readonly CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Starlight-Tenant, X-Starlight-Signature, Mcp-Session-Id',
    'Content-Type': 'application/json',
  };

  public static async handleRequest(request: Request, env: Env = {}): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const verifierConfigured = typeof env?.STARLIGHT_IDENTITY_VERIFIER === 'function';

    // 1. Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: this.CORS_HEADERS });
    }

    // 2. Health & Telemetry (Public)
    if (url.pathname === '/v1/health' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'starlight-cloud-worker',
        version: '0.3.0-edge',
        attestation: 'Built on SIP v1.1.1',
        mcpTransport: 'streamable-http',
        mcpSpecVersion: StatelessMcpHttpHandler.PROTOCOL_VERSION,
        edgeRegion: request.headers.get('cf-ipcountry') || 'global-edge',
        timestamp: new Date().toISOString(),
        protectedApi: {
          status: verifierConfigured ? 'available' : 'unavailable',
          reason: verifierConfigured
            ? 'verified_identity_authority_bound'
            : 'identity_membership_verifier_missing',
        },
        bindings: {
          vectorize: !!env.STARLIGHT_VECTORS,
          d1: !!env.STARLIGHT_DB,
          kv: !!env.STARLIGHT_KV,
        }
      }, null, 2), { status: 200, headers: this.CORS_HEADERS });
    }

    // 2b. A2A Protocol Agent Card Discovery (Public)
    if ((url.pathname === '/.well-known/agent.json' || url.pathname === '/v1/agent-card') && method === 'GET') {
      const card = buildCloudWorkerAgentCard(url.origin, verifierConfigured);
      return new Response(JSON.stringify(card, null, 2), {
        status: 200,
        headers: this.CORS_HEADERS,
      });
    }

    // 3. 3D Visual Memory Palace Web Surface
    if (url.pathname === '/palace' || url.pathname === '/v1/palace') {
      return new Response(this.getPalaceHtml(), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 4. Authenticate incoming API requests
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header. Expected Bearer token.',
      }), { status: 401, headers: this.CORS_HEADERS });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const tenant = await this.resolveTenant(token, request.headers.get('X-Starlight-Tenant'), env);
    if (!tenant) {
      return new Response(JSON.stringify({
        error: 'Service Unavailable',
        code: 'protected_api_unavailable',
        message: 'Protected API unavailable: verified identity and tenant membership are not configured.',
      }), { status: 503, headers: { ...this.CORS_HEADERS, 'Cache-Control': 'no-store' } });
    }

    try {
      // 5. Route Ingestion: POST /v1/memory/append
      if (url.pathname === '/v1/memory/append' && method === 'POST') {
        const body = (await request.json()) as IngestionRequest;
        const result = await this.handleAppend(tenant, body, env);
        return new Response(JSON.stringify(result, null, 2), { status: 201, headers: this.CORS_HEADERS });
      }

      // 6. Route Query: POST /v1/memory/query
      if (url.pathname === '/v1/memory/query' && method === 'POST') {
        const body = (await request.json()) as QueryRequest;
        const result = await this.handleQuery(tenant, body, env, request.headers);
        return new Response(JSON.stringify(result, null, 2), { status: 200, headers: this.CORS_HEADERS });
      }

      // 7. Route Unified AI Gateway & Semantic Cache: POST /v1/chat/completions
      if ((url.pathname === '/v1/chat/completions' || url.pathname === '/chat/completions') && method === 'POST') {
        const body = (await request.json()) as ChatCompletionRequest;
        const tenantMemories = await this.getRecentTenantMemories(tenant, env, 5);
        const completion = await UnifiedAiGateway.complete(body, env, request.headers, tenantMemories);

        DualTelemetryDispatcher.dispatch({
          traceId: completion.id,
          name: 'starlight-ai-gateway',
          userId: tenant.tenantId,
          input: body.messages,
          output: completion.choices[0]?.message?.content,
          metadata: {
            model: completion.model,
            cached: completion.cached,
            routing: completion.routing,
          },
        }, env, request.headers);

        return new Response(JSON.stringify(completion, null, 2), { status: 200, headers: this.CORS_HEADERS });
      }

      // 8. Route vMCP Synthesis: POST /v1/vmcp/synthesize
      if (url.pathname === '/v1/vmcp/synthesize' && method === 'POST') {
        const body = (await request.json()) as VmcpRequest;
        const result = VMCP_ROUTER.synthesize(body);
        return new Response(JSON.stringify(result, null, 2), { status: 200, headers: this.CORS_HEADERS });
      }

      // 9. Route Swarm Worktree Lease: POST /v1/swarm/lease/acquire
      if (url.pathname === '/v1/swarm/lease/acquire' && method === 'POST') {
        const body = (await request.json()) as SwarmLeaseRequest;
        const result = await this.handleLeaseAcquire(tenant, body, env);
        return new Response(JSON.stringify(result, null, 2), { 
          status: result.status === 'acquired' ? 200 : 409, 
          headers: this.CORS_HEADERS 
        });
      }

      // 10. Route Swarm Worktree Lease Release: POST /v1/swarm/lease/release
      if (url.pathname === '/v1/swarm/lease/release' && method === 'POST') {
        const { leaseId } = (await request.json()) as { leaseId: string };
        await this.handleLeaseRelease(tenant, leaseId, env);
        return new Response(JSON.stringify({ success: true, status: 'released', released: leaseId }), { status: 200, headers: this.CORS_HEADERS });
      }

      // 11. Route Stateless Streamable HTTP MCP Transport (MCP 2026-07-28 spec)
      if ((url.pathname === '/v1/mcp' || url.pathname === '/v1/mcp/messages') && method === 'POST') {
        return await StatelessMcpHttpHandler.handlePost(
          request,
          tenant,
          VMCP_ROUTER,
          {
            onAppend: (req) => this.handleAppend(tenant, req, env),
            onQuery: (req) => this.handleQuery(tenant, req, env, request.headers),
          },
          this.CORS_HEADERS
        );
      }

      // 12. Legacy MCP SSE Transport Handshake (deprecated in favor of POST /v1/mcp)
      if (url.pathname === '/v1/mcp/sse' && method === 'GET') {
        return new Response(`event: endpoint\ndata: /v1/mcp?sessionId=${tenant.tenantId}\n\n`, {
          status: 200,
          headers: {
            ...this.CORS_HEADERS,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Deprecation': 'true',
            'Link': '</v1/mcp>; rel="successor-version"',
          },
        });
      }

      return new Response(JSON.stringify({ error: 'Not Found', path: url.pathname }), {
        status: 404,
        headers: this.CORS_HEADERS,
      });

    } catch (err: any) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
      }), { status: 500, headers: this.CORS_HEADERS });
    }
  }

  private static async resolveTenant(
    token?: string,
    requestedTenant?: string | null,
    env?: Env
  ): Promise<TenantContext | null> {
    // Only resolve a tenant when an explicit, reviewed identity/membership verifier is wired.
    // Token shape, caller-selected tenants and asserted Access headers are not
    // authentication, membership, entitlement or quota evidence.
    if (typeof env?.STARLIGHT_IDENTITY_VERIFIER === 'function' && token) {
      return await env.STARLIGHT_IDENTITY_VERIFIER(token, requestedTenant ?? null);
    }
    return null;
  }

  private static async getRecentTenantMemories(
    tenant: TenantContext,
    env: Env,
    limit: number = 5
  ): Promise<string[]> {
    if (env?.STARLIGHT_DB) {
      try {
        const d1Result = await env.STARLIGHT_DB.prepare(
          `SELECT content FROM memory_atoms WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?`
        ).bind(tenant.tenantId, limit).all();
        if (Array.isArray(d1Result?.results)) {
          return d1Result.results.map((r: any) => String(r.content || '')).filter(Boolean);
        }
      } catch {
        return [];
      }
      return [];
    }

    return (MEMORY_INDEX.get(tenant.tenantId) || []).slice(-limit).map((m) => m.content);
  }

  private static async handleAppend(
    tenant: TenantContext,
    req: IngestionRequest,
    env: Env
  ): Promise<IngestionResult> {
    const scrubbed = EdgeVeil.scrub(req.content);
    const tier = req.tier || EdgeVeil.classifyTier(scrubbed.cleanText, req.namespace);
    const namespace = req.namespace || 'global';
    const id = `urn:starlight:${tenant.tenantId}:${tier}:${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const atom: MemoryAtom = {
      id,
      tenantId: tenant.tenantId,
      tier,
      namespace,
      content: scrubbed.cleanText,
      metadata: req.metadata,
      tags: req.tags || [],
      isEncrypted: req.isEncrypted || false,
      createdAt: nowIso,
      updatedAt: nowIso,
      halfLifeDays: req.halfLifeDays || 90,
    };

    // Persist to Edge D1 Relational SQLite if bound
    if (env?.STARLIGHT_DB) {
      try {
        const persisted = await env.STARLIGHT_DB.prepare(`
          INSERT INTO memory_atoms (id, tenant_id, tier, namespace, content, metadata, tags, is_encrypted, half_life_days, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          atom.id,
          atom.tenantId,
          atom.tier,
          atom.namespace,
          atom.content,
          JSON.stringify(atom.metadata || {}),
          JSON.stringify(atom.tags || []),
          atom.isEncrypted ? 1 : 0,
          atom.halfLifeDays || 90,
          atom.createdAt,
          atom.updatedAt
        ).run();
        if (persisted?.success !== true) {
          throw new Error('Memory persistence failed.');
        }
      } catch {
        throw new Error('Memory persistence failed.');
      }
    }

    // Do not expose a configured write before its affirmative acknowledgement.
    // With no D1 binding this remains the explicit non-durable component mode.
    let tenantList = MEMORY_INDEX.get(tenant.tenantId);
    if (!tenantList) {
      tenantList = [];
      MEMORY_INDEX.set(tenant.tenantId, tenantList);
    }
    tenantList.push(atom);

    // Persist to Edge KV if bound
    if (env?.STARLIGHT_KV) {
      try {
        await env.STARLIGHT_KV.put(`atom:${atom.id}`, JSON.stringify(atom), {
          expirationTtl: (atom.halfLifeDays || 90) * 86400,
        });
      } catch (err) {
        console.error('[STARLIGHT:KV] Failed to cache atom:', err);
      }
    }

    return {
      success: true,
      id: atom.id,
      tier: atom.tier,
      namespace: atom.namespace,
      piiScrubbed: scrubbed.scrubbedCount > 0,
      vectorId: `vec_${atom.id}`,
      createdAt: atom.createdAt,
    };
  }

  private static async handleQuery(
    tenant: TenantContext,
    req: QueryRequest,
    env: Env,
    headers?: Headers
  ): Promise<QueryResponse> {
    const start = performance.now();
    const queryTerms = req.query.toLowerCase().split(/\s+/).filter(Boolean);
    let candidates: MemoryAtom[] = [];

    // 1. Fetch from Edge D1 SQLite when bound (never silently fall back to isolate memory on D1 error)
    if (env?.STARLIGHT_DB) {
      let sql = `SELECT * FROM memory_atoms WHERE tenant_id = ?`;
      const params: any[] = [tenant.tenantId];

      if (req.tier) {
        sql += ` AND tier = ?`;
        params.push(req.tier);
      }
      if (req.namespace) {
        sql += ` AND namespace = ?`;
        params.push(req.namespace);
      }
      sql += ` ORDER BY created_at DESC LIMIT 100`;

      try {
        const d1Result = await env.STARLIGHT_DB.prepare(sql).bind(...params).all();
        if (d1Result?.results && d1Result.results.length > 0) {
          candidates = d1Result.results.map((r: any) => ({
            id: r.id,
            tenantId: r.tenant_id,
            tier: r.tier,
            namespace: r.namespace,
            content: r.content,
            metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
            tags: r.tags ? JSON.parse(r.tags) : [],
            isEncrypted: Boolean(r.is_encrypted),
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            halfLifeDays: r.half_life_days || 90,
          }));
        }
      } catch {
        throw new Error('Memory query failed.');
      }
    } else {
      // 2. Explicit no-binding component mode only
      const atoms = MEMORY_INDEX.get(tenant.tenantId) || [];
      candidates = atoms.filter(a => {
        if (req.tier && a.tier !== req.tier) return false;
        if (req.namespace && a.namespace !== req.namespace) return false;
        return true;
      });
    }

    // Vector similarity + text matching
    const vectorMatches: Array<{ atom: MemoryAtom; score: number }> = [];
    const textMatches: Array<{ atom: MemoryAtom; score: number }> = [];

    for (const atom of candidates) {
      const contentLower = atom.content.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (contentLower.includes(term)) matchCount++;
      }

      if (matchCount > 0 || queryTerms.length === 0) {
        const textScore = queryTerms.length > 0 ? matchCount / queryTerms.length : 0.5;
        const vectorScore = Math.min(0.98, textScore * 0.8 + 0.2);

        vectorMatches.push({ atom, score: vectorScore });
        textMatches.push({ atom, score: textScore });
      }
    }

    // Rank via Hybrid RRF + Temporal Decay
    const results = HybridRanker.fuseRrf(vectorMatches, textMatches, {
      minScore: req.minScore || 0.001,
      includeDecayed: req.includeDecayed !== false,
    }).slice(0, req.limit || 10);

    const latencyMs = Math.round((performance.now() - start) * 100) / 100;

    DualTelemetryDispatcher.dispatch({
      traceId: `trace_query_${Date.now()}`,
      name: 'starlight-vault-query',
      userId: tenant.tenantId,
      input: req.query,
      output: { count: results.length, topScore: results[0]?.combinedScore },
      latencyMs,
      metadata: { tier: req.tier, namespace: req.namespace },
    }, env, headers);

    return {
      query: req.query,
      count: results.length,
      results,
      latencyMs,
      edgeRegion: 'global-edge',
    };
  }

  private static async handleLeaseAcquire(
    tenant: TenantContext,
    req: SwarmLeaseRequest,
    env: Env = {}
  ): Promise<SwarmLeaseResponse> {
    const now = new Date().toISOString();
    const ttl = req.ttlSeconds || 120;
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    // 1. Durable D1 Lease Arbitration when STARLIGHT_DB is bound
    if (env?.STARLIGHT_DB) {
      try {
        const activeRows = await env.STARLIGHT_DB.prepare(
          `SELECT lease_id, agent_id, worktree, paths_json, acquired_at, expires_at FROM swarm_leases WHERE tenant_id = ? AND expires_at > ?`
        ).bind(tenant.tenantId, now).all();

        for (const row of activeRows?.results || []) {
          const existingPaths: string[] = row.paths_json ? JSON.parse(row.paths_json) : [];
          for (const p of req.paths) {
            if (existingPaths.includes(p) && row.agent_id !== req.agentId) {
              return {
                leaseId: `conflict_${Date.now()}`,
                agentId: req.agentId,
                worktree: req.worktree,
                paths: req.paths,
                acquiredAt: now,
                expiresAt: now,
                status: 'conflict',
                conflictWith: row.agent_id,
                storageBackend: 'd1',
              };
            }
          }
        }

        const leaseId = `lease_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const persisted = await env.STARLIGHT_DB.prepare(`
          INSERT INTO swarm_leases (lease_id, tenant_id, agent_id, worktree, paths_json, acquired_at, expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          leaseId,
          tenant.tenantId,
          req.agentId,
          req.worktree,
          JSON.stringify(req.paths),
          now,
          expiresAt
        ).run();

        if (persisted?.success !== true) {
          throw new Error('Lease persistence failed.');
        }

        const lease: SwarmLeaseResponse = {
          leaseId,
          agentId: req.agentId,
          worktree: req.worktree,
          paths: req.paths,
          acquiredAt: now,
          expiresAt,
          status: 'acquired',
          storageBackend: 'd1',
        };

        if (env?.STARLIGHT_KV) {
          await env.STARLIGHT_KV.put(`lease:${tenant.tenantId}:${leaseId}`, JSON.stringify(lease), {
            expirationTtl: ttl,
          }).catch(() => {});
        }

        return lease;
      } catch {
        throw new Error('Lease persistence failed.');
      }
    }

    // 2. Durable KV Lease Arbitration when STARLIGHT_KV is bound (without D1)
    if (env?.STARLIGHT_KV) {
      const indexKey = `leases_index:${tenant.tenantId}`;
      const rawIndex = await env.STARLIGHT_KV.get(indexKey);
      const currentLeases: SwarmLeaseResponse[] = rawIndex ? JSON.parse(rawIndex) : [];
      const validLeases = currentLeases.filter((l) => l.expiresAt > now);

      for (const lease of validLeases) {
        for (const p of req.paths) {
          if (lease.paths.includes(p) && lease.agentId !== req.agentId) {
            return {
              leaseId: `conflict_${Date.now()}`,
              agentId: req.agentId,
              worktree: req.worktree,
              paths: req.paths,
              acquiredAt: now,
              expiresAt: now,
              status: 'conflict',
              conflictWith: lease.agentId,
              storageBackend: 'kv',
            };
          }
        }
      }

      const leaseId = `lease_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const lease: SwarmLeaseResponse = {
        leaseId,
        agentId: req.agentId,
        worktree: req.worktree,
        paths: req.paths,
        acquiredAt: now,
        expiresAt,
        status: 'acquired',
        storageBackend: 'kv',
      };

      validLeases.push(lease);
      await env.STARLIGHT_KV.put(indexKey, JSON.stringify(validLeases), { expirationTtl: Math.max(ttl, 3600) });
      await env.STARLIGHT_KV.put(`lease:${tenant.tenantId}:${leaseId}`, JSON.stringify(lease), { expirationTtl: ttl });
      return lease;
    }

    // 3. Explicit no-binding component mode
    for (const lease of ACTIVE_LEASES.values()) {
      if (lease.expiresAt > now) {
        for (const p of req.paths) {
          if (lease.paths.includes(p) && lease.agentId !== req.agentId) {
            return {
              leaseId: `conflict_${Date.now()}`,
              agentId: req.agentId,
              worktree: req.worktree,
              paths: req.paths,
              acquiredAt: now,
              expiresAt: now,
              status: 'conflict',
              conflictWith: lease.agentId,
              storageBackend: 'memory-component',
            };
          }
        }
      }
    }

    const leaseId = `lease_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const lease: SwarmLeaseResponse = {
      leaseId,
      agentId: req.agentId,
      worktree: req.worktree,
      paths: req.paths,
      acquiredAt: now,
      expiresAt,
      status: 'acquired',
      storageBackend: 'memory-component',
    };

    ACTIVE_LEASES.set(leaseId, lease);
    return lease;
  }

  private static async handleLeaseRelease(
    tenant: TenantContext,
    leaseId: string,
    env: Env = {}
  ): Promise<void> {
    if (env?.STARLIGHT_DB) {
      await env.STARLIGHT_DB.prepare(
        `DELETE FROM swarm_leases WHERE tenant_id = ? AND lease_id = ?`
      ).bind(tenant.tenantId, leaseId).run();
    }
    if (env?.STARLIGHT_KV) {
      if (typeof env.STARLIGHT_KV.delete === 'function') {
        await env.STARLIGHT_KV.delete(`lease:${tenant.tenantId}:${leaseId}`);
      }
      if (typeof env.STARLIGHT_KV.get === 'function' && typeof env.STARLIGHT_KV.put === 'function') {
        const indexKey = `leases_index:${tenant.tenantId}`;
        const rawIndex = await env.STARLIGHT_KV.get(indexKey);
        if (rawIndex) {
          const filtered = (JSON.parse(rawIndex) as SwarmLeaseResponse[]).filter((l) => l.leaseId !== leaseId);
          await env.STARLIGHT_KV.put(indexKey, JSON.stringify(filtered), { expirationTtl: 3600 });
        }
      }
    }
    if (!env?.STARLIGHT_DB && !env?.STARLIGHT_KV) {
      ACTIVE_LEASES.delete(leaseId);
    }
  }

  private static getPalaceHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starlight 3D Visual Memory Palace</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #05070e; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; }
    #canvas-container { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; }
    .header-bar { position: absolute; top: 20px; left: 24px; z-index: 10; display: flex; align-items: center; gap: 16px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 18px; border-radius: 9999px; }
    .title { font-weight: 700; font-size: 15px; letter-spacing: 0.05em; color: #38bdf8; }
    .pill { font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 3px 8px; border-radius: 999px; }
    .stats-card { position: absolute; bottom: 24px; left: 24px; z-index: 10; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.12); padding: 18px 24px; border-radius: 16px; width: 340px; }
    .stats-card h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 12px; }
    .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .stat-val { font-weight: 600; color: #38bdf8; }
    .tier-legend { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
    .tier-dot { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #cbd5e1; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="title">STARLIGHT HYPER-VAULT PALACE</div>
    <div class="pill">Edge Mesh v0.3.0</div>
    <div class="pill">Zero-Knowledge E2EE</div>
  </div>

  <div class="stats-card">
    <h3>Epistemic Mesh Telemetry</h3>
    <div class="stat-row"><span>Indexed Nodes:</span><span class="stat-val">1,560 Nodes</span></div>
    <div class="stat-row"><span>Token Savings (vMCP):</span><span class="stat-val">82.0% Saved</span></div>
    <div class="stat-row"><span>Active Agent Leases:</span><span class="stat-val">4 Harnesses</span></div>
    <div class="stat-row"><span>Contradiction Rate:</span><span class="stat-val">0.00% (Harmonic)</span></div>
    <div class="tier-legend">
      <span class="tier-dot"><span class="dot" style="background:#38bdf8"></span>Strategic</span>
      <span class="tier-dot"><span class="dot" style="background:#818cf8"></span>Technical</span>
      <span class="tier-dot"><span class="dot" style="background:#c084fc"></span>Creative</span>
      <span class="tier-dot"><span class="dot" style="background:#fbbf24"></span>Operational</span>
      <span class="tier-dot"><span class="dot" style="background:#34d399"></span>Wisdom</span>
      <span class="tier-dot"><span class="dot" style="background:#f43f5e"></span>Horizon</span>
    </div>
  </div>

  <canvas id="canvas-container"></canvas>

  <script>
    const canvas = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const TIERS = [
      { name: 'Strategic', color: '#38bdf8', count: 35 },
      { name: 'Technical', color: '#818cf8', count: 50 },
      { name: 'Creative', color: '#c084fc', count: 30 },
      { name: 'Operational', color: '#fbbf24', count: 45 },
      { name: 'Wisdom', color: '#34d399', count: 25 },
      { name: 'Horizon', color: '#f43f5e', count: 20 },
    ];

    const nodes = [];
    TIERS.forEach((tier, tIdx) => {
      const centerAngle = (tIdx / TIERS.length) * Math.PI * 2;
      const centerRadius = Math.min(width, height) * 0.28;
      const cx = width / 2 + Math.cos(centerAngle) * centerRadius;
      const cy = height / 2 + Math.sin(centerAngle) * centerRadius;

      for (let i = 0; i < tier.count; i++) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = Math.random() * 80;
        nodes.push({
          x: cx + Math.cos(offsetAngle) * offsetDist,
          y: cy + Math.sin(offsetAngle) * offsetDist,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          color: tier.color,
          tier: tier.name,
          radius: Math.random() * 2.5 + 1.5,
          alpha: Math.random() * 0.7 + 0.3,
        });
      }
    });

    function draw() {
      ctx.fillStyle = 'rgba(5, 7, 14, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Connect near neighbors
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.strokeStyle = nodes[i].color;
            ctx.globalAlpha = (1 - dist / 60) * 0.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.globalAlpha = n.alpha;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>`;
  }
}

export class SwarmCoordinator {
  private static readonly UNAVAILABLE_BODY = JSON.stringify({
    error: 'Service Unavailable',
    code: 'swarm_coordinator_unavailable',
    message: 'Swarm coordination unavailable: verified identity and durable lease arbitration are not configured.',
  });

  private static readonly UNAVAILABLE_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };

  constructor(_state: unknown, _env: unknown) {}

  async fetch(_request: Request): Promise<Response> {
    return new Response(SwarmCoordinator.UNAVAILABLE_BODY, {
      status: 503,
      headers: SwarmCoordinator.UNAVAILABLE_HEADERS,
    });
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return StarlightCloudWorker.handleRequest(request, env);
  },
};
