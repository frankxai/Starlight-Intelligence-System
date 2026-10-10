import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runTerminalCli } from "../src/terminal-cli.js";
import { terminalDigest } from "../src/terminal-runtime.js";
import { createOpenCodeRuntime, parseOpenCodeUsage } from "../src/runtime-bridge/opencode.js";

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
      : { info: { id: "msg_fixture", cost: 0.002, tokens: { input: 100, output: 20, reasoning: 4, cache: { read: 30, write: 5 } },
        role: "assistant", sessionID: "ses_fixture", providerID: "host-provider", modelID: "host-model",
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
      const usage = await runTerminalCli(["run","usage",request.taskId,"--journal",join(root,"journal")]);
      assert.equal(usage.exitCode,0,usage.stderr);
      const evidence = JSON.parse(usage.stdout);
      assert.equal(evidence.observation.tokens.cacheRead,30);
      assert.equal(evidence.observation.providerReportedCostUSD,0.002);
      assert.equal(evidence.observation.actualBilledCost,"unknown");
      const repeated = await runTerminalCli(["run","start","--file",file,"--host",host,"--authorize","--journal",join(root,"journal")]);
      assert.equal(repeated.exitCode,0); assert.equal(f.calls.length,3);
      const usagePath = join(root,"journal",request.taskId+".opencode-usage.json");
      const damaged = JSON.parse(readFileSync(usagePath,"utf8")); damaged.observation.tokens.input++;
      writeFileSync(usagePath,JSON.stringify(damaged));
      assert.equal((await runTerminalCli(["run","usage",request.taskId,"--journal",join(root,"journal")])).exitCode,1);
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
  it("retains an unknown run and its owner marker when usage cannot be saved", async () => {
    const f=await fixture(),root=mkdtempSync(join(tmpdir(),"sis-opencode-usage-failure-"));
    try {
      const journal=join(root,"journal"); const { mkdirSync }=await import("node:fs"); mkdirSync(journal);
      const packet={version:"starlight.terminal-run.v1",runId:request.taskId,domain:"gencreator",workRef:"issue:144",sourceRefs:["fixture-only"],request};
      const file=join(root,"packet.json"),host=join(root,"host.json");writeFileSync(file,JSON.stringify(packet));
      writeFileSync(host,JSON.stringify({version:"starlight.terminal-host.v1",packetSha256:terminalDigest(packet),timeoutMs:1000,
        admission:{authorityRef:"fixture",reservationRef:"fixture",budgetCeilingCents:0,expiresAt:new Date(Date.now()+60_000).toISOString()},
        runtime:{kind:"opencode",...f.options,onSession:undefined}}));
      const usagePath=join(journal,request.taskId+".opencode-usage.json");writeFileSync(usagePath,"preserve incumbent receipt");
      const args=["run","start","--file",file,"--host",host,"--authorize","--journal",journal];
      const result=await runTerminalCli(args); assert.equal(result.exitCode,1);
      assert.equal(JSON.parse(result.stdout).state,"unknown");
      assert.equal(readFileSync(usagePath,"utf8"),"preserve incumbent receipt");
      assert.equal((await runTerminalCli(["run","usage",request.taskId,"--journal",journal])).exitCode,1);
      await runTerminalCli(args);assert.equal(f.calls.length,3,"Unknown outcome must never redispatch");
    } finally {rmSync(root,{recursive:true,force:true});}
  });
  it("rejects version drift before creating a session", async () => {
    const f = await fixture((p,v) => p === "/global/health" ? { ...v, version: "changed" } : v);
    await assert.rejects(createOpenCodeRuntime(f.options).invoke(request, new AbortController().signal), /version/);
    assert.equal(f.calls.length, 1);
  });
  it("persists provider usage separately without inventing billing or aggregate totals", async () => {
    const f = await fixture(); const observations: any[] = [];
    await createOpenCodeRuntime({ ...f.options, onUsage: async u => { observations.push(u); } })
      .invoke(request,new AbortController().signal);
    assert.equal(observations.length,1); const u=observations[0];
    assert.equal(u.scope,"final-assistant-message"); assert.equal(u.actualBilledCost,"unknown");
    assert.deepEqual(u.tokens,{input:100,output:20,reasoning:4,cacheRead:30,cacheWrite:5});
    for (const invalid of [{...u,providerReportedCostUSD:-1},{...u,tokens:{...u.tokens,total:undefined}},
      {...u,tokens:{...u.tokens,input:0.5}},{...u,tokens:{...u.tokens,input:Infinity}},
      {...u,tokens:{...u.tokens,arbitrary:1}},{...u,extra:true}]) assert.throws(()=>parseOpenCodeUsage(invalid));
  });
  it("rejects invalid provider usage and receipt persistence failure", async () => {
    for (const mutate of [(v:any)=>({...v,cost:-1}),(v:any)=>({...v,tokens:undefined}),
      (v:any)=>({...v,tokens:{...v.tokens,output:-1}}),(v:any)=>({...v,id:"foreign"})]) {
      const f=await fixture((p,v)=>p.endsWith("message")?{...v,info:mutate(v.info)}:v);
      await assert.rejects(createOpenCodeRuntime({...f.options,onUsage:async()=>{assert.fail("Invalid usage persisted");}})
        .invoke(request,new AbortController().signal),/observation/);
    }
    const f=await fixture();
    await assert.rejects(createOpenCodeRuntime({...f.options,onUsage:async()=>{throw new Error("usage disk full");}})
      .invoke(request,new AbortController().signal),/usage disk full/);
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
