import { McpServer } from '@modelcontextprotocol/server';
import { readFileSync } from 'node:fs';
import * as z from 'zod/v4';
import { recallContext, SanitizationGateway, type RecallOptions, type MemoryProvider } from '@starlight-intelligence/core';

// package.json is also included in installed tarballs; Changesets owns this version.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };

export interface StarlightMcpOptions extends RecallOptions {
  memory: Pick<MemoryProvider, 'recall'> & Partial<Pick<MemoryProvider, 'remember' | 'forget'>>;
  allowWrite?: boolean;
  allowDelete?: boolean;
}

/** Caller identity and provider authority come from the host, never from tool arguments. */
export function createStarlightMcpServer(options: StarlightMcpOptions): McpServer {
  options = Object.freeze({ ...options });
  if (!options.tenantId.trim()) throw new Error('A tenant scope is required');
  if (options.allowDelete && options.workspaceId !== undefined) {
    throw new Error('The provider deletion contract does not authorize workspace-scoped deletion');
  }
  const server = new McpServer({ name: 'starlight-memory', version });
  const sanitizer = options.sanitizer ?? new SanitizationGateway();
  server.registerTool('starlight_memory_recall', {
    description: 'Recall sanitized memory in the host-authorized tenant and workspace. Private, secret and regulated records are excluded.',
    inputSchema: z.strictObject({ query: z.string().trim().min(1).max(16_000) }),
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ query }, context) => {
    try {
      const memories = await recallContext(query, options, context.mcpReq.signal);
      return { content: [{ type: 'text' as const, text: JSON.stringify(memories) }], structuredContent: { memories } };
    } catch {
      return { isError: true, content: [{ type: 'text' as const, text: 'Memory recall unavailable or denied' }] };
    }
  });
  if (options.allowWrite && options.memory.remember) {
    server.registerTool('starlight_memory_remember', {
      description: 'Store a sanitized fact through the host provider. The caller supplies a stable ID; retries are not automatic.',
      inputSchema: z.strictObject({ id: z.string().min(1).max(256), fact: z.string().trim().min(1).max(16_000) }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    }, async ({ id, fact }) => {
      try {
        const at = new Date().toISOString();
        await options.memory.remember!({
          memory_id: id, tenant_id: options.tenantId, workspace_id: options.workspaceId,
          source: { system: 'starlight-mcp' }, modality: 'text', memory_type: 'semantic',
          normalized_fact: sanitizer.sanitize(fact), entities: [], relations: [], importance: 0.5,
          confidence: 0.5, trust: 0.5, privacy_class: 'private-shareable', retention_policy: 'rolling_90d',
          retention_until: new Date(Date.now() + 90 * 86_400_000).toISOString(),
          provenance: [{ event_id: id, transform: 'redacted', at }], provider_shadow_refs: {},
        });
        return { content: [{ type: 'text' as const, text: 'Memory accepted by provider' }] };
      } catch {
        return { isError: true, content: [{ type: 'text' as const, text: 'Memory write unavailable or denied' }] };
      }
    });
  }
  if (options.allowDelete && options.memory.forget) {
    server.registerTool('starlight_memory_forget', {
      description: 'Delete a memory through the explicitly authorized host provider.',
      inputSchema: z.strictObject({ id: z.string().min(1).max(256) }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    }, async ({ id }) => {
      try {
        const deleted = await options.memory.forget!({ tenant_id: options.tenantId, memory_id: id });
        return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted }) }] };
      } catch {
        return { isError: true, content: [{ type: 'text' as const, text: 'Memory deletion unavailable or denied' }] };
      }
    });
  }
  return server;
}
