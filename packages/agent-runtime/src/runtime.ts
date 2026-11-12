/**
 * The composition an app calls.
 *
 * One call yields a model, tools and attribution, so no app assembles the three itself. That is
 * the whole point: the estate measured five apps each re-deriving the same layers, which is how
 * model ids drifted, how tool exposure grew ungoverned, and how nothing ever emitted a cost
 * record.
 */

import {
  isStepCount,
  ToolLoopAgent,
  type LanguageModel,
  type LanguageModelCallEndEvent,
  type ToolSet,
} from 'ai';
import type { AgentRunAttribution, AgentRunScope } from '@starlight-intelligence/core';
import { resolveModel, resolveModelId, type AgentModelRoute } from './model.js';
import { loadMcpTools, mcpToolApproval, type McpServerSpec, type McpToolPolicy } from './tools.js';
import { buildAttribution, generationIdOf, tokenSplits } from './attribution.js';

export interface AgentRuntimeOptions {
  /** Which model this surface uses. A tier or an explicit Gateway id. */
  route: AgentModelRoute;
  /**
   * A model instance to use instead of resolving one from the route.
   *
   * The route still names the model for attribution. This override exists so a caller that
   * already holds a model instance (a wrapper, a local model, a test double) can supply it
   * without the runtime resolving a second one against the Gateway.
   */
  model?: LanguageModel;
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

/**
 * State for the run in progress.
 *
 * A runtime can be reused, so this state belongs to a RUN, not to the runtime. It is created
 * fresh when a run starts and replaced by the next run, so a second run can never inherit the
 * first run's tokens or its failure state.
 */
interface RunState {
  /** Whether a run has begun. A run that fails before its first model call still began. */
  started: boolean;
  /** Whether the run has reached a terminal state. */
  finished: boolean;
  /** Model calls made in this run. A multi-step run has more than one. */
  steps: number;
  /** Generation id of every model call, in order. The run's cost is their sum. */
  generationIds: string[];
  inputTokens: number;
  outputTokens: number;
  /** Whether the SDK reported token usage at all, so zeros are not mistaken for real counts. */
  hasUsage: boolean;
  outcome: AgentRunAttribution['outcome_status'];
}

function newRunState(): RunState {
  return {
    started: false,
    finished: false,
    steps: 0,
    generationIds: [],
    inputTokens: 0,
    outputTokens: 0,
    hasUsage: false,
    outcome: 'completed',
  };
}

/**
 * Map the SDK's finish reason onto the record's terminal state.
 *
 * A run that stopped because it hit the output limit, or because a content filter fired, did
 * not complete successfully. Reporting those as `completed` would tell a ledger the run
 * finished when it did not.
 */
function outcomeForFinishReason(
  finishReason: string | undefined,
): AgentRunAttribution['outcome_status'] {
  switch (finishReason) {
    case 'abort':
    case 'aborted':
      return 'aborted';
    case 'error':
    case 'fail':
      return 'failed';
    case 'cancelled':
    case 'cancel':
      return 'cancelled';
    case 'length':
    case 'content-filter':
      return 'failed';
    default:
      return 'completed';
  }
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
   * The attribution record for the run that just finished.
   *
   * It covers every model call in the run, not only the last one, and it reports the run's
   * real terminal state.
   *
   * One runtime serves one run at a time. A runtime used for two overlapping runs cannot
   * attribute either of them correctly, and says so rather than reporting a blended number.
   */
  attribution(): Promise<AgentRunAttribution>;
  /** Release MCP connections. */
  close(): Promise<void>;
}

/**
 * Build an agent runtime.
 *
 * The returned `attribution()` reads the record from the run that just finished. It is a
 * function rather than a property because the record is assembled after the run, when the
 * gateway has billed it.
 */
export async function createAgentRuntime(options: AgentRuntimeOptions): Promise<AgentRuntime> {
  const modelId = resolveModelId(options.route);
  const model = options.model ?? resolveModel(options.route);

  let toolFingerprints: Record<string, string> = {};
  const mcpTools = options.mcp
    ? await loadMcpTools(options.mcp, options.toolPolicy ?? { allowlist: [] })
    : undefined;
  if (mcpTools) toolFingerprints = mcpTools.fingerprints;

  const tools: ToolSet = {
    ...(options.tools ?? {}),
    ...(mcpTools?.tools ?? {}),
  };

  // Run state belongs to a RUN. `onStart` fires exactly once per run — including a run that
  // fails before its first model call — so it is the boundary that starts a fresh accumulator
  // and leaves the previous run's state behind.
  let current: RunState = newRunState();
  // A second run starting before the first finished means two runs are in flight on one
  // runtime. Their model calls interleave, so neither can be attributed correctly.
  let concurrentRun = false;

  const agent = new ToolLoopAgent({
    model,
    ...(options.instructions ? { instructions: options.instructions } : {}),
    tools,
    stopWhen: isStepCount(options.maxSteps ?? 8),
    toolApproval: mcpToolApproval(),
    // A run is starting. Anything the previous run left behind is not this run's.
    onStart() {
      if (current.started && !current.finished) {
        concurrentRun = true;
      }
      current = newRunState();
      current.started = true;
    },
    // Fires once per model call, so a multi-step run contributes one generation id per step.
    onLanguageModelCallEnd({ providerMetadata, usage }: LanguageModelCallEndEvent) {
      const generationId = generationIdOf(providerMetadata);
      // A model call without a gateway generation id cannot be priced later, so it is not added
      // to the list the cost is summed from.
      if (generationId !== undefined) current.generationIds.push(generationId);
      current.steps += 1;
      current.inputTokens += usage?.inputTokens ?? 0;
      current.outputTokens += usage?.outputTokens ?? 0;
      current.hasUsage = current.hasUsage || usage?.inputTokens !== undefined;
    },
    // The run finished. Its finish reason is the terminal state.
    onEnd({ finishReason }: { finishReason?: string }) {
      current.outcome = outcomeForFinishReason(finishReason);
      current.finished = true;
    },
    // A terminal failure. The SDK retries transient errors itself, so this fires once, for the
    // error that ended the run.
    onError() {
      current.outcome = 'failed';
      current.finished = true;
    },
    onAbort() {
      current.outcome = 'aborted';
      current.finished = true;
    },
  });

  return {
    agent,
    model,
    modelId,
    toolFingerprints,
    toolsUnreviewed: mcpTools?.unreviewed === true,
    async attribution(): Promise<AgentRunAttribution> {
      if (concurrentRun) {
        throw new Error(
          'Two runs were in flight on this runtime at once, so neither can be attributed ' +
            'correctly. Use one runtime per concurrent run.',
        );
      }
      // A run that failed before its first model call still happened, and the contract asks for
      // every production run. It gets a record with no cost rather than no record at all.
      if (!current.started) {
        throw new Error(
          'No completed run to attribute. Call the agent before reading attribution().',
        );
      }
      if (!current.finished) {
        throw new Error(
          'The run is still in flight. Await the agent before reading attribution().',
        );
      }
      const record = await buildAttribution({
        scope: options.scope,
        model: modelId,
        // Only pass summed usage when the SDK actually reported it. Zeros here would suppress the
        // gateway's own token counts, which are the fallback when the SDK is silent.
        ...(current.hasUsage
          ? {
              usage: {
                inputTokens: current.inputTokens,
                outputTokens: current.outputTokens,
                totalTokens: current.inputTokens + current.outputTokens,
                inputTokenDetails: {
                  noCacheTokens: undefined,
                  cacheReadTokens: undefined,
                  cacheWriteTokens: undefined,
                },
                outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
              },
            }
          : {}),
        // Every generation in the run, so the cost is the sum of the run's steps.
        generationIds: current.generationIds,
        outcomeStatus: current.outcome,
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
