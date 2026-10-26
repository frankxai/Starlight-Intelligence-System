/**
 * Stateless Streamable HTTP MCP Transport Handler (MCP 2026-07-28 Spec)
 * Replaces legacy stateful SSE (/v1/mcp/sse) with single-endpoint stateless JSON-RPC 2.0 over HTTP POST.
 *
 * Built on SIP v1.1.1
 */

import { EdgeVeil } from './edge-veil.js';
import { EdgeVirtualMcpRouter } from './vmcp.js';
import type { IngestionRequest, ingestionResult, QueryRequest, QueryResponse, TenantContext } from './types.js';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, any>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpExecutionCallbacks {
  onAppend: (req: IngestionRequest) => Promise<any>;
  onQuery: (req: QueryRequest) => Promise<QueryResponse>;
}

export class StatelessMcpHttpHandler {
  public static readonly PROTOCOL_VERSION = '2026-07-28';

  public static async handlePost(
    request: Request,
    tenant: TenantContext,
    router: EdgeVirtualMcpRouter,
    callbacks: McpExecutionCallbacks,
    corsHeaders: Record<string, string>
  ): Promise<Response> {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      const errResp: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: Invalid JSON payload' },
      };
      return new Response(JSON.stringify(errResp), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Mcp-Protocol-Version': this.PROTOCOL_VERSION,
        },
      });
    }

    const sessionId =
      request.headers.get('Mcp-Session-Id') ||
      `mcp_stateless_${tenant.tenantId}_${Date.now().toString(36)}`;

    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Mcp-Session-Id': sessionId,
      'Mcp-Protocol-Version': this.PROTOCOL_VERSION,
    };

    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32600, message: 'Invalid Request: empty batch' },
          }),
          { status: 400, headers: responseHeaders }
        );
      }

      const responses: JsonRpcResponse[] = [];
      for (const item of payload) {
        const res = await this.dispatchRpc(item as JsonRpcRequest, tenant, router, callbacks);
        if (res !== null) responses.push(res);
      }

      if (responses.length === 0) {
        return new Response(null, { status: 202, headers: responseHeaders });
      }
      return new Response(JSON.stringify(responses), { status: 200, headers: responseHeaders });
    }

    const singleRes = await this.dispatchRpc(payload as JsonRpcRequest, tenant, router, callbacks);
    if (singleRes === null) {
      return new Response(null, { status: 202, headers: responseHeaders });
    }

    return new Response(JSON.stringify(singleRes), { status: 200, headers: responseHeaders });
  }

  private static async dispatchRpc(
    rpc: JsonRpcRequest,
    tenant: TenantContext,
    router: EdgeVirtualMcpRouter,
    callbacks: McpExecutionCallbacks
  ): Promise<JsonRpcResponse | null> {
    if (!rpc || typeof rpc !== 'object' || rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string') {
      return {
        jsonrpc: '2.0',
        id: (rpc as any)?.id ?? null,
        error: { code: -32600, message: 'Invalid JSON-RPC 2.0 request' },
      };
    }

    const isNotification = rpc.id === undefined;
    const id = rpc.id ?? null;

    try {
      switch (rpc.method) {
        case 'notifications/initialized':
        case 'notifications/cancelled':
          return null;

        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: this.PROTOCOL_VERSION,
              capabilities: {
                tools: { listChanged: false },
              },
              serverInfo: {
                name: 'starlight-cloud-worker-mcp',
                version: '0.3.0-edge',
                attestation: 'Built on SIP v1.1.1',
                transport: 'streamable-http',
              },
            },
          };

        case 'ping':
          return {
            jsonrpc: '2.0',
            id,
            result: { pong: true, timestamp: new Date().toISOString() },
          };

        case 'tools/list': {
          const activeIntent = rpc.params?.activeIntent || rpc.params?.intent || '';
          const activeFilePath = rpc.params?.activeFilePath || rpc.params?.file || '';
          const synthesized = activeIntent
            ? router.synthesize({
                agentId: rpc.params?.agentId || tenant.tenantId,
                activeIntent,
                activeFilePath,
              }).activeTools
            : router.synthesize({
                agentId: tenant.tenantId,
                activeIntent: 'refactor code memory vault search audio deploy audit security',
              }).activeTools;

          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: synthesized.map((t) => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema,
              })),
            },
          };
        }

        case 'tools/call': {
          const toolName = rpc.params?.name;
          const args = rpc.params?.arguments || {};

          if (!toolName || typeof toolName !== 'string') {
            return {
              jsonrpc: '2.0',
              id,
              error: { code: -32602, message: 'Invalid params: missing tool name' },
            };
          }

          if (toolName === 'vault_query') {
            const queryResult = await callbacks.onQuery({
              query: String(args.query || ''),
              tier: args.tier,
              namespace: args.namespace,
              limit: typeof args.limit === 'number' ? args.limit : 10,
            });
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(queryResult) }],
                isError: false,
              },
            };
          }

          if (toolName === 'vault_append') {
            const appendResult = await callbacks.onAppend({
              content: String(args.content || ''),
              tier: args.tier,
              namespace: args.namespace,
              tags: Array.isArray(args.tags) ? args.tags : undefined,
              metadata: args.metadata,
            });
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: JSON.stringify(appendResult) }],
                isError: false,
              },
            };
          }

          if (toolName === 'sentinel_security_scan') {
            const targetText = String(args.content || args.targetPath || '');
            const scrubbed = EdgeVeil.scrub(targetText);
            return {
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      clean: scrubbed.scrubbedCount === 0,
                      scrubbedCount: scrubbed.scrubbedCount,
                      detectedCategories: scrubbed.detectedCategories,
                    }),
                  },
                ],
                isError: false,
              },
            };
          }

          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Tool not found or unsupported in edge stateless mode: ${toolName}` },
          };
        }

        default:
          if (isNotification) return null;
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${rpc.method}` },
          };
      }
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err?.message || 'Internal MCP execution error',
        },
      };
    }
  }
}
