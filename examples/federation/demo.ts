import { fileURLToPath } from "node:url";
import { FederatedRuntime, createFederationTool, createMcpToolRunner, createProcessRunner } from "../../src/federation.js";

const python = process.env.STARLIGHT_PYTHON;
if (!python) throw new Error("Set STARLIGHT_PYTHON to an absolute Python executable path");
const federation = new FederatedRuntime([
  {
    id: "python-analysis", transport: "process", capabilities: ["text-analysis"],
    runner: createProcessRunner({
      command: python,
      args: ["-I", fileURLToPath(new URL("./python_worker.py", import.meta.url))],
      cwd: fileURLToPath(new URL("./", import.meta.url)),
    }),
  },
  {
    id: "local-mcp-fixture", transport: "mcp", capabilities: ["format-summary"],
    runner: createMcpToolRunner({
      toolName: "format_summary",
      // Deterministic fixture. In an app, bridge an initialized official MCP client here.
      callTool: async request => ({ content: [{ type: "text", text: `Summary: ${request.arguments.prompt}` }] }),
    }),
  },
], { concurrency: 1, timeoutMs: 5_000, maxRuns: 2 });

const tasks = [
  { id: "analyze", capability: "text-analysis", prompt: "Build autonomous agents across platforms" },
  { id: "summarize", capability: "format-summary", prompt: "A TypeScript coordinator calls a Python worker." },
];
const tool = createFederationTool(federation);
console.log(JSON.stringify({ mode: "local-demo", modelCalls: 0, plan: federation.plan(tasks) }, null, 2));
const result = await tool.handle({ operation: "run", tasks });
console.log(result.content[0].text);
const replay = await tool.handle({ operation: "run", tasks });
console.log(JSON.stringify({ replayDeduplicated: federation.snapshot().submitted === 2, snapshot: federation.snapshot() }));
if (result.isError || replay.isError || federation.snapshot().submitted !== 2) process.exitCode = 1;
