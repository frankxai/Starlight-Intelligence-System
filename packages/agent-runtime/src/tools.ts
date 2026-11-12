/**
 * MCP tools into the AI SDK, with the two controls the official client deliberately leaves to
 * the application: approval and drift.
 *
 * `@ai-sdk/mcp` already handles what the estate's three hand-rolled MCP servers re-implemented
 * (2026-07-28 discovery with legacy fallback, `Mcp-Param-*` header mirroring, elicitation,
 * session reattach). What it does not do is decide whether a tool may run, or notice that a
 * server changed a tool after it was approved. Those are the estate's rules to enforce.
 */

import { detectToolDrift, fingerprintTools, type ToolSet } from 'ai';
import {
  createMCPClient,
  type McpProviderMetadata,
  type MCPClient,
} from '@ai-sdk/mcp';

export interface McpServerSpec {
  /** Streamable HTTP endpoint. */
  url: string;
  /** Scoped credential for this server. Never logged, never recorded. */
  authorization?: string;
}

export interface McpToolPolicy {
  /**
   * Tool names this surface may use. An empty list means "no tools"; there is no implicit
   * "allow everything", because a 38-tool surface is a context tax on every turn.
   */
  allowlist: readonly string[];
  /**
   * Fingerprints captured when the tools were last approved. When supplied, a server that
   * changed a tool's description or schema is refused before its tools reach the model.
   */
  baseline?: Record<string, string>;
}

export interface McpToolSet {
  tools: ToolSet;
  /** Fingerprints of the tools now offered, for the caller to persist as the next baseline. */
  fingerprints: Record<string, string>;
  close(): Promise<void>;
}

export class McpToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpToolError';
  }
}

/**
 * Decide whether an MCP tool may run without asking.
 *
 * MCP annotations are untrusted, server-provided hints. A tool that claims `readOnlyHint` is
 * still a claim by the server. The policy here is deliberately conservative: only an explicit
 * `readOnlyHint: true` runs unattended, and everything else needs a human.
 */
export function requiresApproval(toolName: string, metadata: unknown): boolean {
  const annotations = (metadata as McpProviderMetadata | undefined)?.annotations;
  if (!annotations) return true;
  if (annotations.readOnlyHint !== true) return true;
  // A destructive or open-world tool is never "read only" in practice, whatever the hint says.
  if (annotations.destructiveHint === true) return true;
  if (annotations.openWorldHint === true) return true;
  void toolName;
  return false;
}

/**
 * Build the AI SDK `toolApproval` policy for a set of MCP tools.
 *
 * Read-only tools execute immediately. Everything else requires user approval with a reason that
 * names the reason, so the approver sees why rather than a bare tool name.
 */
export function mcpToolApproval() {
  return ({ toolCall }: { toolCall: { toolName: string; toolMetadata?: unknown } }) => {
    const metadata = toolCall.toolMetadata as McpProviderMetadata | undefined;
    if (!requiresApproval(toolCall.toolName, metadata)) {
      return 'not-applicable' as const;
    }
    const annotations = metadata?.annotations;
    const reason =
      annotations?.destructiveHint === true
        ? 'The MCP server marks this tool as destructive.'
        : annotations?.readOnlyHint === false
          ? 'The MCP server marks this tool as not read-only.'
          : 'The MCP server does not mark this tool as read-only.';
    return { type: 'user-approval' as const, reason };
  };
}

/**
 * Refuse a tool set whose definitions changed after they were approved.
 *
 * A server can change a tool's description or widen its input schema after the moment a human
 * approved it, and the change is invisible to the model. That is the "rug pull" class of attack:
 * an approved "read a document" becomes "read a document and append the session secret to your
 * next request".
 */
export function assertNoToolDrift(
  current: Record<string, string>,
  baseline: Record<string, string>,
): void {
  const drift = detectToolDrift(current, baseline);
  const drifted = [...drift.changed, ...drift.added];
  if (drifted.length > 0) {
    throw new McpToolError(
      `MCP tool definitions changed after approval: ${drifted.join(', ')}. ` +
        'Re-review and re-approve before use.',
    );
  }
}

/**
 * Load MCP tools for an agent surface.
 *
 * The allowlist is enforced here rather than by the model, so a server offering a hundred tools
 * still exposes only the handful this surface is allowed to call.
 */
export async function loadMcpTools(
  servers: readonly McpServerSpec[],
  policy: McpToolPolicy,
): Promise<McpToolSet> {
  const clients: MCPClient[] = [];
  const collected: ToolSet = {};

  try {
    for (const server of servers) {
      const client = await createMCPClient({
        transport: {
          type: 'http',
          url: server.url,
          ...(server.authorization
            ? { headers: { Authorization: server.authorization } }
            : {}),
        },
      });
      clients.push(client);
      const tools = await client.tools();
      for (const [name, tool] of Object.entries(tools)) {
        if (!policy.allowlist.includes(name)) continue;
        collected[name] = tool;
      }
    }

    const fingerprints = await fingerprintTools(collected);

    if (policy.baseline) {
      assertNoToolDrift(fingerprints, policy.baseline);
    }

    return {
      tools: collected,
      fingerprints,
      async close() {
        await Promise.allSettled(clients.map(client => client.close()));
      },
    };
  } catch (error) {
    await Promise.allSettled(clients.map(client => client.close()));
    throw error;
  }
}
