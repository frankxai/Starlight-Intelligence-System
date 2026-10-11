const worker = (await import("../dist/worker.js")).default;
const context = {
  waitUntil() {},
  passThroughOnException() {},
};

const health = await worker.fetch(
  new Request("https://mcp.starlightintelligence.ai/healthz"),
  {},
  context,
);
if (health.status !== 200) throw new Error(`Expected health 200, received ${health.status}`);

const denied = await worker.fetch(
  new Request("https://mcp.starlightintelligence.ai/mcp", { method: "POST" }),
  {},
  context,
);
if (denied.status !== 401) throw new Error(`Expected anonymous MCP 401, received ${denied.status}`);

console.log(`Worker smoke passed: health=${health.status}, anonymous_mcp=${denied.status}`);
