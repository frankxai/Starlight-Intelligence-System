/**
 * Quality contract for the vault MCP server (dist/mcp-server.js): every tool is
 * titled, annotated, bounded and typed; declared bounds are enforced; failures are
 * isError results with a hint; and vault names can never escape the vault directory.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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

  it("results carry structuredContent; list tools keep their bare-array text for existing callers", async () => {
    await withVault(async (dir) => {
      const r = await session(dir, [
        call(1, "sis_append_entry", { vault: "technical", content: "quality marker qzx" }),
        call(2, "sis_search", { query: "qzx" }),
        call(3, "sis_vault_search", { query: "qzx" }),
        call(4, "sis_recent_entries", {}),
      ]);
      const append = r.get(1)!.result;
      assert.deepEqual(JSON.parse(append.content[0].text), append.structuredContent);
      for (const [id, key] of [[2, "results"], [3, "results"], [4, "entries"]] as const) {
        const result = r.get(id)!.result;
        assert.ok(!result.isError, JSON.stringify(result));
        const text = JSON.parse(result.content[0].text);
        assert.ok(Array.isArray(text), `call ${id} text stays an array`);
        assert.deepEqual(text, result.structuredContent[key]);
        assert.equal(text[0].content, "quality marker qzx");
      }
    });
  });

  it("a malformed request line gets an error and the server keeps serving", async () => {
    await withVault(async (dir) => {
      const child = spawn(process.execPath, [SERVER, "--vault-dir", dir, "--no-seed"], { stdio: ["pipe", "pipe", "pipe"] });
      const lines: any[] = [];
      let buffer = "";
      const done = new Promise<void>((resolvePromise, reject) => {
        const timer = setTimeout(() => { child.kill(); reject(new Error(`got ${lines.length}/4 responses`)); }, 15000);
        child.stdout.on("data", (chunk) => {
          buffer += chunk;
          const parts = buffer.split("\n");
          buffer = parts.pop()!;
          for (const part of parts) if (part.trim()) lines.push(JSON.parse(part));
          if (lines.length === 4) { clearTimeout(timer); child.kill(); resolvePromise(); }
        });
      });
      for (const line of ["null", "[]", '{"jsonrpc":"2.0","id":7}', JSON.stringify(call(9, "sis_stats"))]) child.stdin.write(line + "\n");
      await done;
      assert.deepEqual(lines.slice(0, 3).map((l) => l.error?.code), [-32600, -32600, -32600]);
      assert.equal(lines[2].id, 7, "the id is echoed when it can be read");
      assert.equal(lines[3].id, 9);
      assert.ok(lines[3].result.structuredContent, "the next request is still served");
    });
  });

  it("argument shapes other than a plain object, and prototype keys, are rejected", async () => {
    await withVault(async (dir) => {
      const raw = (id: number, args: unknown) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name: "sis_entry_types", arguments: args } });
      const r = await session(dir, [
        raw(1, []),
        raw(2, 0),
        { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "sis_entry_types", arguments: JSON.parse('{"__proto__":{"polluted":true}}') } },
        raw(4, { constructor: 5 }),
      ]);
      for (const id of [1, 2, 3, 4]) assert.equal(r.get(id)!.result.isError, true, `call ${id}`);
    });
  });

  it("Windows device names are not vault names", async () => {
    await withVault(async (dir) => {
      const r = await session(dir, [
        call(1, "sis_append_entry", { vault: "nul", content: "must not vanish into a device" }),
        call(2, "sis_append_entry", { vault: "com1", content: "x" }),
        call(3, "sis_append_entry", { vault: "console", content: "a normal word that starts like con" }),
      ]);
      assert.equal(r.get(1)!.result.isError, true);
      assert.equal(r.get(2)!.result.isError, true);
      assert.ok(!r.get(3)!.result.isError, "only exact device names are reserved");
    });
  });

  it("a vault file that is a symlink is neither written through nor read", async (t) => {
    await withVault(async (dir) => {
      const outside = join(dir, "..", `sis-outside-${process.pid}.jsonl`);
      writeFileSync(outside, "");
      try {
        try {
          symlinkSync(outside, join(dir, "technical.jsonl"));
        } catch {
          t.skip("creating symlinks needs privileges on this machine");
          return;
        }
        const r = await session(dir, [call(1, "sis_append_entry", { vault: "technical", content: "escape attempt" })]);
        assert.equal(r.get(1)!.result.isError, true);
        assert.equal(readFileSync(outside, "utf-8"), "");
      } finally {
        rmSync(outside, { force: true });
      }
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
