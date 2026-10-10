import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runTerminalCli } from "../src/terminal-cli.js";
import { terminalDigest } from "../src/terminal-runtime.js";
import { createOpenCodeRuntime } from "../src/runtime-bridge/opencode.js";

const request = { protocol: "starlight.worker.v1" as const, taskId: "draft-1", agent: "creator", input: "Use supplied sources", context: {} };
const servers: Server[] = [];
afterEach(async () => { for (const server of servers.splice(0)) { server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); } });
async function fixture(change: (path: string, value: any) => any = (_p, v) => v) {
  const calls: { path: string; body: any }[] = [];
  const server = createServer(async (req, res) => {
    let text = ""; for await (const chunk of req) text += chunk;
    calls.push({ path: req.url!, body: text ? JSON.parse(text) : undefined });
    const value = req.url === "/global/health" ? { healthy: true, version: "1.18.35" }
      : req.url === "/session" ? { id: "ses_fixture", permission: [{ permission: "*", pattern: "*", action: "deny" }] }
      : { info: { role: "assistant", sessionID: "ses_fixture", providerID: "host-provider", modelID: "host-model",
        time: { completed: 123 }, structured: { ...request, status: "completed", output: "Source-derived draft" } }, parts: [] };
    if (req.url !== "/global/health" && req.url !== "/session") {
      delete value.info.structured.agent; delete value.info.structured.input; delete value.info.structured.context;
    }
    res.setHeader("content-type", "application/json"); res.end(JSON.stringify(change(req.url!, value)));
  });
  servers.push(server); await new Promise<void>(r => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  const sessions: string[] = [];
  const options = { id: "opencode-host", endpoint: `http://127.0.0.1:${port}`, allowLoopbackHttp: true,
    expectedVersion: "1.18.35", providerID: "host-provider", modelID: "host-model",
    onSession: async ({ sessionId }: { sessionId: string }) => { sessions.push(sessionId); } };
  return { calls, sessions, options };
}
describe("OpenCode version-bound worker", () => {
  it("runs through a private CLI binding and saves the actual session ID", async () => {
    const f=await fixture(), root=mkdtempSync(join(tmpdir(),"sis-opencode-cli-"));
    try {
      const packet={version:"starlight.terminal-run.v1",runId:request.taskId,domain:"gencreator",workRef:"issue:144",sourceRefs:["fixture-only"],request};
      const file=join(root,"packet.json"), host=join(root,"host.json"); writeFileSync(file,JSON.stringify(packet));
      writeFileSync(host,JSON.stringify({version:"starlight.terminal-host.v1",packetSha256:terminalDigest(packet),timeoutMs:1000,
        admission:{authorityRef:"fixture",reservationRef:"fixture",budgetCeilingCents:0,expiresAt:new Date(Date.now()+60_000).toISOString()},
        runtime:{kind:"opencode",...f.options,onSession:undefined}}));
      const result=await runTerminalCli(["run","start","--file",file,"--host",host,"--authorize","--journal",join(root,"journal")]);
      assert.equal(result.exitCode,0,result.stderr);
      assert.equal(JSON.parse(readFileSync(join(root,"journal",request.taskId+".opencode-session.json"),"utf8")).sessionId,"ses_fixture");
      assert.equal(JSON.parse(result.stdout).verification,"pending");
    } finally { rmSync(root,{recursive:true,force:true}); }
  });
  it("pins the server, creates a denied session and records it before structured prompting", async () => {
    const f = await fixture(); const worker = createOpenCodeRuntime(f.options);
    assert.deepEqual(await worker.invoke(request, new AbortController().signal), {
      protocol: request.protocol, taskId: request.taskId, status: "completed", output: "Source-derived draft" });
    assert.deepEqual(f.sessions, ["ses_fixture"]);
    assert.deepEqual(f.calls.map(c => c.path), ["/global/health", "/session", "/session/ses_fixture/message"]);
    assert.deepEqual(f.calls[1].body.permission, [{ permission: "*", pattern: "*", action: "deny" }]);
    assert.equal(f.calls[2].body.format.retryCount, 0);
    assert.equal(f.calls[2].body.format.schema.properties.taskId.const, request.taskId);
    assert.deepEqual(f.calls[2].body.model, { providerID: "host-provider", modelID: "host-model" });
  });
  it("rejects version drift before creating a session", async () => {
    const f = await fixture((p,v) => p === "/global/health" ? { ...v, version: "changed" } : v);
    await assert.rejects(createOpenCodeRuntime(f.options).invoke(request, new AbortController().signal), /version/);
    assert.equal(f.calls.length, 1);
  });
  it("accepts the same denied rule regardless of JSON key order", async () => {
    const f=await fixture((p,v)=>p==="/session"?{...v,permission:[{action:"deny",pattern:"*",permission:"*"}]}:v);
    assert.equal((await createOpenCodeRuntime(f.options).invoke(request,new AbortController().signal) as any).status,"completed");
  });
  it("does not prompt when the session receipt cannot be saved", async () => {
    const f = await fixture();
    await assert.rejects(createOpenCodeRuntime({ ...f.options, onSession: async () => { throw new Error("disk full"); } })
      .invoke(request, new AbortController().signal), /disk full/);
    assert.equal(f.calls.length, 2);
  });
  it("rejects malformed identity, tools, missing structured output and permissions", async () => {
    for (const mutate of [
      (p: string,v: any) => p === "/session" ? { ...v, id: "../foreign" } : v,
      (p: string,v: any) => p === "/session" ? { ...v, permission: [] } : v,
      (p: string,v: any) => p.endsWith("message") ? { ...v, info: { ...v.info, sessionID: "ses_foreign" } } : v,
      (p: string,v: any) => p.endsWith("message") ? { ...v, info: { ...v.info, structured: undefined } } : v,
      (p: string,v: any) => p.endsWith("message") ? { ...v, parts: [{ type: "tool", tool: "bash" }] } : v,
      (p: string,v: any) => p.endsWith("message") ? { ...v, info: { ...v.info, modelID: "fallback" } } : v,
    ]) {
      const f = await fixture(mutate);
      await assert.rejects(createOpenCodeRuntime(f.options).invoke(request, new AbortController().signal));
    }
  });
  it("denies insecure endpoints and aborted calls", async () => {
    const f = await fixture();
    assert.throws(() => createOpenCodeRuntime({ ...f.options, endpoint: "http://remote.test" }));
    assert.throws(() => createOpenCodeRuntime({ ...f.options, endpoint: f.options.endpoint + "?token=bad" }));
    await assert.rejects(createOpenCodeRuntime(f.options).invoke(request, AbortSignal.abort()));
    assert.equal(f.calls.length, 0);
  });
});
