/**
 * Quality contract for the vault MCP server (dist/mcp-server.js): every tool is
 * titled, annotated, bounded and typed; declared bounds are enforced; failures are
 * isError results with a hint; and vault names can never escape the vault directory.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = join(ROOT, "dist", "mcp-server.js");

type Rpc = { id?: number; result?: any; error?: any };

async function session(vaultDir: string, requests: object[]): Promise<Map<number, Rpc>> {
  const child = spawn(process.execPath, [SERVER, "--vault-dir", vaultDir, "--no-seed"], { stdio: ["pipe", "pipe", "pipe"] });
  const expected = requests.filter((r: any) => r.id !== undefined).length;
  const responses = new Map<number, Rpc>();
  let buffer = "";
  return await new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error(`timed out with ${responses.size}/${expected}`)); }, 15000);
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const message = JSON.parse(line) as Rpc;
        responses.set(message.id as number, message);
        if (responses.size === expected) { clearTimeout(timer); child.kill(); resolvePromise(responses); }
      }
    });
    child.on("error", reject);
    for (const request of requests) child.stdin.write(JSON.stringify(request) + "\n");
  });
}

const call = (id: number, name: string, args: object = {}) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });

function withVault<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "sis-quality-"));
  return run(dir).finally(() => rmSync(dir, { recursive: true, force: true }));
}

describe("vault MCP server quality contract", () => {
  it("every tool has a title, full annotations, 80+ char description, bounded described inputs and an outputSchema", async () => {
    await withVault(async (dir) => {
      const tools = (await session(dir, [{ jsonrpc: "2.0", id: 1, method: "tools/list" }])).get(1)!.result.tools;
      assert.equal(tools.length, 13);
      for (const tool of tools) {
        assert.match(tool.name, /^sis_[a-z_]+$/);
        assert.ok(tool.title, `${tool.name} title`);
        assert.ok(tool.description.length >= 80, `${tool.name} description is ${tool.description.length} chars`);
        assert.equal(typeof tool.annotations.readOnlyHint, "boolean");
        assert.equal(typeof tool.annotations.openWorldHint, "boolean");
        if (!tool.annotations.readOnlyHint) {
          assert.equal(typeof tool.annotations.destructiveHint, "boolean", `${tool.name} destructiveHint`);
          assert.equal(typeof tool.annotations.idempotentHint, "boolean", `${tool.name} idempotentHint`);
        }
        assert.equal(tool.outputSchema?.type, "object", `${tool.name} outputSchema`);
        assert.equal(tool.inputSchema.additionalProperties, false, `${tool.name} rejects unknown arguments`);
        for (const [key, prop] of Object.entries<any>(tool.inputSchema.properties)) {
          assert.ok(prop.description, `${tool.name}.${key} description`);
        }
      }
    });
  });

  it("negotiates the protocol version and falls back to the newest it speaks", async () => {
    await withVault(async (dir) => {
      const r = await session(dir, [
        { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } },
        { jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "1999-01-01" } },
      ]);
      assert.equal(r.get(1)!.result.protocolVersion, "2025-03-26");
      assert.equal(r.get(2)!.result.protocolVersion, "2025-06-18");
    });
  });

  it("results carry structuredContent mirrored in the text block", async () => {
    await withVault(async (dir) => {
      const r = await session(dir, [
        call(1, "sis_append_entry", { vault: "technical", content: "quality marker qzx" }),
        call(2, "sis_search", { query: "qzx" }),
      ]);
      for (const id of [1, 2]) {
        const result = r.get(id)!.result;
        assert.ok(!result.isError, JSON.stringify(result));
        assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
      }
      assert.equal(r.get(2)!.result.structuredContent.results[0].content, "quality marker qzx");
    });
  });

  it("a vault name cannot escape the vault directory", async () => {
    await withVault(async (dir) => {
      const vaults = join(dir, "vaults");
      const r = await session(vaults, [
        call(1, "sis_append_entry", { vault: "../escaped", content: "should never be written" }),
        call(2, "sis_append_entry", { vault: "contradictions", content: "reserved" }),
      ]);
      assert.equal(r.get(1)!.result.isError, true);
      assert.match(r.get(1)!.result.content[0].text, /vault/);
      assert.equal(existsSync(join(dir, "escaped.jsonl")), false);
      assert.equal(r.get(2)!.result.isError, true);
      assert.deepEqual(readdirSync(vaults), []);
    });
  });

  it("declared bounds are enforced, and unknown ids fail with a hint instead of success:false", async () => {
    await withVault(async (dir) => {
      const r = await session(dir, [
        call(1, "sis_search", { query: "x", limit: 100000 }),
        call(2, "sis_stats", { surprise: true }),
        call(3, "sis_confirm", { entryId: "nope" }),
        call(4, "sis_contradict", { entryIdA: "a", entryIdB: "b" }),
        call(5, "sis_goal_update", { taskId: "t1", status: "done" }),
        { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "sis_nope", arguments: {} } },
      ]);
      for (const id of [1, 2, 3, 4, 5]) {
        const result = r.get(id)!.result;
        assert.equal(result.isError, true, `call ${id}`);
        const body = JSON.parse(result.content[0].text);
        assert.ok(body.error && body.hint, `call ${id} has error and hint: ${result.content[0].text}`);
      }
      assert.match(r.get(1)!.result.content[0].text, /at most 100/);
      assert.match(r.get(3)!.result.content[0].text, /sis_search/);
      assert.equal(r.get(6)!.error.code, -32602, "unknown tool is invalid params per the MCP spec");
    });
  });

  it("contradictions are not counted as a vault", async () => {
    await withVault(async (dir) => {
      const first = await session(dir, [
        call(1, "sis_append_entry", { vault: "wisdom", content: "the sky is blue" }),
        call(2, "sis_append_entry", { vault: "wisdom", content: "the sky is green" }),
      ]);
      const a = first.get(1)!.result.structuredContent.id, b = first.get(2)!.result.structuredContent.id;
      const r = await session(dir, [call(1, "sis_contradict", { entryIdA: a, entryIdB: b }), call(2, "sis_stats")]);
      assert.ok(!r.get(1)!.result.isError);
      assert.deepEqual(r.get(2)!.result.structuredContent, { total: 2, vaults: { wisdom: 2 } });
    });
  });
});
