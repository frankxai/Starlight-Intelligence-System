import type { AgentRunner, SwarmTask } from "../swarm.js";
import { boundedText, positiveInteger, withAbort } from "./boundary.js";

/** Bridge an initialized official MCP client through this small call adapter. */
export type McpToolCaller = (
  request: { name: string; arguments: Record<string, unknown> },
  signal: AbortSignal,
) => Promise<{ content?: unknown; structuredContent?: unknown; isError?: boolean }>;

export interface McpToolRunnerOptions {
  toolName: string;
  callTool: McpToolCaller;
  /** Operator-authored mapping for the actual tool schema. Default: { prompt }. */
  argumentsForTask?: (task: SwarmTask) => Record<string, unknown>;
  maxOutputBytes?: number;
}

export function createMcpToolRunner(options: McpToolRunnerOptions): AgentRunner {
  if (!options.toolName.trim()) throw new Error("MCP tool name required");
  const toolName = options.toolName;
  const callTool = options.callTool;
  const argumentsForTask = options.argumentsForTask ?? (task => ({ prompt: task.prompt }));
  const maxBytes = positiveInteger(options.maxOutputBytes ?? 262_144, "maxOutputBytes", 4_194_304);
  return async (task, signal) => {
    const result = await withAbort(async () => {
      try { return await callTool({ name: toolName, arguments: argumentsForTask(task) }, signal); }
      catch { throw new Error("MCP call failed; remote execution state may be unknown"); }
    }, signal);
    if (!result || typeof result !== "object" || Array.isArray(result) || Object.hasOwn(result, "task") ||
        (result.isError !== undefined && typeof result.isError !== "boolean")) {
      throw new Error("Invalid or asynchronous MCP result; completion must be established by the host");
    }
    if (result.isError === true) return { output: "MCP tool reported an error", exitCode: 1 };
    if (result.structuredContent !== undefined) {
      return { output: boundedText(JSON.stringify(result.structuredContent), "MCP structured content", maxBytes), exitCode: 0 };
    }
    if (!Array.isArray(result.content) || !result.content.length) throw new Error("MCP tool returned no supported content");
    const output = result.content.map(item => {
      if (!item || typeof item !== "object" || item.type !== "text" || typeof item.text !== "string") {
        throw new Error("Unsupported MCP content; expected text or structuredContent");
      }
      return item.text;
    }).join("\n");
    return { output: boundedText(output, "MCP output", maxBytes), exitCode: 0 };
  };
}
