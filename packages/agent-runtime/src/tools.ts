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
   * Fingerprints captured when the tools were last approved.
   *
   * A baseline is REQUIRED when MCP servers are configured. Without one there is nothing to
   * compare against, so a server that mutates a tool after approval is undetectable, and a
   * caller who simply forgot the baseline would silently lose the guard. Pass
   * `allowUnreviewed: true` to opt out explicitly, which is a decision rather than an omission.
   */
  baseline?: Record<string, string>;
  /**
   * Opt out of drift detection deliberately, for a surface whose servers are trusted and whose
   * definitions are versioned elsewhere. The runtime reports this state so it can be seen.
   */
  allowUnreviewed?: boolean;
}

export interface McpToolSet {
  tools: ToolSet;
  /** Fingerprints of the tools now offered, for the caller to persist as the next baseline. */
  fingerprints: Record<string, string>;
  /** True when drift detection was deliberately skipped for this load. */
  unreviewed: boolean;
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
 * MCP annotations are untrusted, server-provided hints, and the spec defines their DEFAULTS to
 * be the cautious ones: `readOnlyHint` defaults to false, and `openWorldHint` defaults to TRUE
 * ("If true, this tool may interact with an 'open world' of external entities... Default: true").
 * An omitted hint is therefore not an omission of information, it is an assertion that the tool
 * is open-world.
 *
 * So only a tool that explicitly says `readOnlyHint: true` AND explicitly says
 * `openWorldHint: false` may run unattended. Every other combination, including a missing
 * annotation object, needs a human.
 */
export function requiresApproval(toolName: string, metadata: unknown): boolean {
  const annotations = (metadata as McpProviderMetadata | undefined)?.annotations;
  if (!annotations) return true;
  if (annotations.readOnlyHint !== true) return true;
  // The spec default for openWorldHint is true, so an omitted hint means open-world.
  if (annotations.openWorldHint !== false) return true;
  // A destructive tool is never "read only" in practice, whatever the hint says.
  if (annotations.destructiveHint === true) return true;
  void toolName;
  return false;
}

/**
 * Build the AI SDK `toolApproval` policy for a set of MCP tools.
 *
 * Read-only tools execute immediately. Everything else requires user approval with a reason that
 * names the ACTUAL reason, so the approver sees why rather than a bare tool name. A tool that
 * claims to be read-only but is open-world is described as open-world, not as "not read-only".
 */
export function mcpToolApproval() {
  return ({ toolCall }: { toolCall: { toolName: string; toolMetadata?: unknown } }) => {
    const metadata = toolCall.toolMetadata as McpProviderMetadata | undefined;
    if (!requiresApproval(toolCall.toolName, metadata)) {
      return 'not-applicable' as const;
    }
    return { type: 'user-approval' as const, reason: approvalReason(metadata) };
  };
}

/**
 * The reason a tool needs approval, naming the condition that actually triggered it.
 *
 * The order matters: the most specific condition wins, so an approver is told about a
 * destructive tool before being told it is open-world.
 */
export function approvalReason(metadata: McpProviderMetadata | undefined): string {
  const annotations = metadata?.annotations;
  if (!annotations) {
    return 'The MCP server provided no annotations, so this tool cannot be treated as read-only.';
  }
  if (annotations.destructiveHint === true) {
    return 'The MCP server marks this tool as destructive.';
  }
  if (annotations.readOnlyHint !== true) {
    return 'The MCP server does not mark this tool as read-only.';
  }
  // Read-only, but not closed-domain. The MCP default for openWorldHint is true, so a tool that
  // does not say otherwise is open-world.
  return 'The MCP server does not mark this tool as closed-domain, so it may reach external systems.';
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
 * Apply the review policy to a loaded tool set.
 *
 * A baseline is REQUIRED when MCP servers are configured. Without one there is nothing to compare
 * against, so a server that mutates a tool after approval is undetectable, and a caller who
 * simply forgot the baseline would silently lose the guard. Opting out is a decision
 * (`allowUnreviewed`), never an omission.
 *
 * This is separate from `loadMcpTools` so the decision can be tested without a live MCP server.
 */
export function applyToolReviewPolicy(
  fingerprints: Record<string, string>,
  policy: McpToolPolicy,
): { unreviewed: boolean } {
  if (policy.baseline) {
    assertNoToolDrift(fingerprints, policy.baseline);
    return { unreviewed: false };
  }
  if (!policy.allowUnreviewed) {
    throw new McpToolError(
      'MCP tools were configured without an approved baseline, so a server that ' +
        'changed a tool after approval could not be detected. Supply the approved ' +
        'fingerprints as toolPolicy.baseline, or set allowUnreviewed to accept that risk.',
    );
  }
  return { unreviewed: true };
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
    const { unreviewed } = applyToolReviewPolicy(fingerprints, policy);

    return {
      tools: collected,
      fingerprints,
      /** True when drift detection was deliberately skipped, so callers can surface it. */
      unreviewed,
      async close() {
        await Promise.allSettled(clients.map(client => client.close()));
      },
    };
  } catch (error) {
    await Promise.allSettled(clients.map(client => client.close()));
    throw error;
  }
}
