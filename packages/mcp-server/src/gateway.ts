import type { MemoryProvider, RecallResult, VaultType } from '@starlight-intelligence/core';

export interface GatewayOptions {
  url: string;
  token: string;
  tenantId: string;
  workspaceId?: string;
}

/** Bridge to an operator-owned, single-tenant SIS gateway; no second memory database. */
export function createGatewayReader(options: GatewayOptions): Pick<MemoryProvider, 'recall'> {
  options = Object.freeze({ ...options });
  const base = new URL(options.url);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/'
      || (base.protocol !== 'https:' && !(local && base.protocol === 'http:'))
      || !options.token.trim() || !options.tenantId.trim()
      || (options.workspaceId !== undefined && !options.workspaceId.trim())) throw new Error('Invalid gateway configuration');
  return {
    async recall(request): Promise<RecallResult[]> {
      if (request.tenant_id !== options.tenantId) throw new Error('Tenant denied');
      if (request.workspace_id !== options.workspaceId) throw new Error('Workspace denied');
      if (typeof request.query !== 'string' || !request.query.trim() || request.query.length > 16_000
          || (request.limit !== undefined && (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 100))) {
        throw new Error('Invalid gateway query or result budget');
      }
      const response = await fetch(new URL('/v1/memory/search', base), {
        method: 'POST', redirect: 'error', signal: request.signal,
        headers: { authorization: `Bearer ${options.token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ query: request.query, limit: request.limit }),
      });
      if (!response.ok) throw new Error('Gateway recall denied');
      // Bound an untrusted upstream response before parsing it.
      if (!response.body) throw new Error('Invalid gateway response');
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > 1_000_000) throw new Error('Gateway response too large');
          chunks.push(value);
        }
      } catch (error) {
        await reader.cancel();
        throw error;
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const data = JSON.parse(new TextDecoder().decode(bytes)) as { ok?: boolean; results?: unknown[] };
      if (data.ok !== true || !Array.isArray(data.results)) throw new Error('Invalid gateway response');
      return data.results.slice(0, 100).flatMap(item => {
        if (!item || typeof item !== 'object') return [];
        const row = item as { entry?: Record<string, unknown>; score?: number };
        const entry = row.entry;
        if (!entry || typeof entry.id !== 'string' || typeof entry.content !== 'string' || typeof row.score !== 'number') return [];
        // Invalid metadata must not erase retention or turn malformed private tags into shareable facts.
        if (entry.tags !== undefined && (!Array.isArray(entry.tags) || entry.tags.some(tag => typeof tag !== 'string'))) return [];
        if (entry.expiresAt !== undefined && (typeof entry.expiresAt !== 'string' || !Number.isFinite(Date.parse(entry.expiresAt)))) return [];
        const tags = Array.isArray(entry.tags) ? entry.tags.filter((t): t is string => typeof t === 'string') : [];
        const privateTagged = tags.some(t => /^(?:privacy:)?(?:private|secret|regulated)$/i.test(t));
        // Unclassified operational gateway memories are shareable only with explicit host opt-in.
        const privacy = privateTagged ? 'private' : tags.some(t => /^(?:privacy:)?public$/i.test(t)) ? 'public' : 'private-shareable';
        return [{ score: row.score, matched_terms: [], record: {
          memory_id: entry.id, tenant_id: options.tenantId, workspace_id: options.workspaceId,
          source: { system: 'sis-gateway' }, modality: 'text', memory_type: 'semantic',
          normalized_fact: entry.content, vault: entry.vault as VaultType | undefined,
          entities: [], relations: [], importance: 0.5, confidence: 0.5, trust: 0.5,
          privacy_class: privacy, retention_policy: 'ephemeral', provenance: [], provider_shadow_refs: {},
          ...(typeof entry.expiresAt === 'string' ? { retention_until: entry.expiresAt } : {}),
        } }];
      });
    },
  };
}
