/**
 * The composition an app calls.
 *
 * One call yields a model, tools and attribution, so no app assembles the three itself. That is
 * the whole point: the estate measured five apps each re-deriving the same layers, which is how
 * model ids drifted, how tool exposure grew ungoverned, and how nothing ever emitted a cost
 * record.
 */

import { isStepCount, ToolLoopAgent, type LanguageModel, type LanguageModelCallEndEvent, type ToolSet } from 'ai';
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
  /**
   * Existing local tools, merged with the MCP tools.
   *
   * Typed as the AI SDK's own `ToolSet`, so an invalid tool definition is a compile error at
   * the call site rather than a failure inside the SDK at run time.
   */
  tools?: ToolSet;
}

export interface AgentRuntime {
  /** The agent to call. */
  agent: ToolLoopAgent<never, ToolSet, any, never>;
  /** The resolved model, for surfaces that need it. */
  model: LanguageModel;
  /** The Gateway model id that was resolved. */
  modelId: string;
  /** Fingerprints of the MCP tools in use, for persisting the next approved baseline. */
  toolFingerprints: Record<string, string>;
  /** True when drift detection was deliberately skipped for this runtime's MCP tools. */
  toolsUnreviewed: boolean;
  /**
   * The attribution record for the run that just completed.
   *
   * It covers every model call in the run, not only the last one, and it reports the run's
   * real terminal state.
   */
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

  const tools: ToolSet = {
    ...(options.tools ?? {}),
    ...(mcpTools?.tools ?? {}),
  };

  // Every model call in the run is accumulated, not overwritten. A multi-step run costs
  // the sum of its steps, and reporting only the last generation's cost understates it.
  const calls: AttributionInput[] = [];
  let outcome: AgentRunAttribution['outcome_status'] = 'completed';

  const agent = new ToolLoopAgent({
    model,
    ...(options.instructions ? { instructions: options.instructions } : {}),
    tools,
    stopWhen: isStepCount(options.maxSteps ?? 8),
    toolApproval: mcpToolApproval(),
    // Fires before client-side tools execute, so a run aborted mid-tool is still attributable.
    onLanguageModelCallEnd({ providerMetadata, usage }: LanguageModelCallEndEvent) {
      calls.push({
        scope: options.scope,
        model: modelId,
        usage,
        generationId: generationIdOf(providerMetadata),
        outcomeStatus: 'completed',
      });
    },
    // The run's terminal state, so a failed or aborted run is not reported as completed.
    onEnd({ finishReason }: { finishReason?: string }) {
      if (finishReason === 'abort' || finishReason === 'aborted') outcome = 'aborted';
      else if (finishReason === 'error') outcome = 'failed';
      else if (finishReason === 'cancelled' || finishReason === 'cancel') outcome = 'cancelled';
      else if (finishReason === 'length' || finishReason === 'content-filter') outcome = 'failed';
    },
    onAbort() {
      outcome = 'aborted';
    },
    onError() {
      outcome = 'failed';
    },
  });

  return {
    agent,
    model,
    modelId,
    toolFingerprints,
    toolsUnreviewed: mcpTools?.unreviewed === true,
    async attribution(): Promise<AgentRunAttribution> {
      if (calls.length === 0) {
        throw new Error(
          'No completed run to attribute. Call the agent before reading attribution().',
        );
      }
      // Aggregate across every model call in the run.
      const totals = calls.reduce(
        (acc, call) => ({
          inputTokens: acc.inputTokens + (call.usage?.inputTokens ?? 0),
          outputTokens: acc.outputTokens + (call.usage?.outputTokens ?? 0),
        }),
        { inputTokens: 0, outputTokens: 0 },
      );
      const last = calls[calls.length - 1]!;
      const record = await buildAttribution({
        scope: options.scope,
        model: last.model,
        usage: {
          inputTokens: totals.inputTokens,
          outputTokens: totals.outputTokens,
          totalTokens: totals.inputTokens + totals.outputTokens,
          inputTokenDetails: { noCacheTokens: undefined, cacheReadTokens: undefined, cacheWriteTokens: undefined },
          outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
        },
        generationId: last.generationId,
        outcomeStatus: outcome,
      });
      return record;
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
