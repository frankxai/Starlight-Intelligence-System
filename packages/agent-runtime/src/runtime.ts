/**
 * The composition an app calls.
 *
 * One call yields a model, tools and attribution, so no app assembles the three itself. That is
 * the whole point: the estate measured five apps each re-deriving the same layers, which is how
 * model ids drifted, how tool exposure grew ungoverned, and how nothing ever emitted a cost
 * record.
 */

import { isStepCount, ToolLoopAgent, type LanguageModel, type LanguageModelCallEndEvent } from 'ai';
import type { AgentRunAttribution, AgentRunScope } from '@starlight-intelligence/core';
import { resolveModel, resolveModelId, type AgentModelRoute } from './model.js';
import { loadMcpTools, mcpToolApproval, type McpServerSpec, type McpToolPolicy } from './tools.js';
import {
  buildAttribution,
  generationIdOf,
  tokenSplits,
  type AttributionInput,
} from './attribution.js';

export interface AgentRuntimeOptions {
  /** Which model this surface uses. A tier or an explicit Gateway id. */
  route: AgentModelRoute;
  /** Who this run is for. Required; attribution without scope is not attribution. */
  scope: AgentRunScope;
  /** MCP servers this surface may draw tools from. */
  mcp?: readonly McpServerSpec[];
  /** Which tools are exposed, and the approved baseline to detect drift against. */
  toolPolicy?: McpToolPolicy;
  /** System instructions for the agent. */
  instructions?: string;
  /** Maximum tool-calling steps. */
  maxSteps?: number;
  /** Existing local tools, merged with the MCP tools. */
  tools?: Record<string, unknown>;
}

export interface AgentRuntime {
  /** The agent to call. */
  agent: ToolLoopAgent<never, any, any>;
  /** The resolved model, for surfaces that need it. */
  model: LanguageModel;
  /** The Gateway model id that was resolved. */
  modelId: string;
  /** Fingerprints of the MCP tools in use, for persisting the next approved baseline. */
  toolFingerprints: Record<string, string>;
  /** The attribution record for the run that just completed. */
  attribution(): Promise<AgentRunAttribution>;
  /** Release MCP connections. */
  close(): Promise<void>;
}

/**
 * Build an agent runtime.
 *
 * The returned `attribution()` reads the record from the last completed run. It is a function
 * rather than a property because the record is assembled after the run, when the gateway has
 * billed it.
 */
export async function createAgentRuntime(options: AgentRuntimeOptions): Promise<AgentRuntime> {
  const modelId = resolveModelId(options.route);
  const model = resolveModel(options.route);

  let toolFingerprints: Record<string, string> = {};
  const mcpTools = options.mcp
    ? await loadMcpTools(options.mcp, options.toolPolicy ?? { allowlist: [] })
    : undefined;
  if (mcpTools) toolFingerprints = mcpTools.fingerprints;

  const tools = {
    ...(options.tools as Record<string, unknown> | undefined),
    ...(mcpTools?.tools ?? {}),
  } as Record<string, never>;

  let lastInput: AttributionInput | undefined;

  const agent = new ToolLoopAgent({
    model,
    ...(options.instructions ? { instructions: options.instructions } : {}),
    tools,
    stopWhen: isStepCount(options.maxSteps ?? 8),
    toolApproval: mcpToolApproval(),
    // Fires before client-side tools execute, so a run aborted mid-tool is still attributable.
    onLanguageModelCallEnd({ providerMetadata, usage }: LanguageModelCallEndEvent) {
      lastInput = {
        scope: options.scope,
        model: modelId,
        usage,
        generationId: generationIdOf(providerMetadata),
        outcomeStatus: 'completed',
      };
    },
  });

  return {
    agent,
    model,
    modelId,
    toolFingerprints,
    async attribution(): Promise<AgentRunAttribution> {
      if (!lastInput) {
        throw new Error(
          'No completed run to attribute. Call the agent before reading attribution().',
        );
      }
      return buildAttribution(lastInput);
    },
    async close(): Promise<void> {
      await mcpTools?.close();
    },
  };
}

export { tokenSplits };
export * from './model.js';
export * from './tools.js';
export * from './attribution.js';
