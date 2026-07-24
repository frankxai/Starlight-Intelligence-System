/**
 * Operational MCP server — end-to-end JSON-RPC smoke test.
 *
 * The README's #1 install path is `node dist/mcp-server.js` exposing thirteen
 * `sis_*` tools over JSON-RPC 2.0 stdio. That path previously had NO automated
 * end-to-end proof (the v0.1 server in mcp-server-v01.ts is a different
 * `sis.*`-tool surface). This test spawns the operational server, drives the
 * real stdin/stdout protocol, and asserts:
 *   - `initialize` returns serverInfo
 *   - `tools/list` returns exactly the thirteen documented `sis_*` tools
 *
 * The server is spawned from src/ via the tsx loader so the test does not
 * depend on build order within `npm test`; src/mcp-server.ts is the exact code
 * compiled to dist/mcp-server.js.
 *
 * Built on SIP — operational tier (MCP conformance, end-to-end).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SERVER = join(REPO_ROOT, "src", "mcp-server.ts");

const EXPECTED_TOOLS = [
  "sis_append_entry",
  "sis_confirm",
  "sis_contradict",
  "sis_entry_types",
  "sis_goal_log",
  "sis_goal_status",
  "sis_goal_update",
  "sis_invalidate",
  "sis_recent_entries",
  "sis_search",
  "sis_stale",
  "sis_stats",
  "sis_vault_search",
].sort();

interface RpcResponse {
  id: number | null;
  result?: { tools?: Array<{ name: string }>; serverInfo?: { name?: string } };
}

/**
 * Spawn the MCP server, send the given JSON-RPC requests, resolve with the
 * responses keyed by id. Times out defensively so a hung server fails the test
 * rather than the runner.
 */
function driveServer(
  requests: Array<Record<string, unknown>>,
  expectedIds: number[],
): Promise<Map<number, RpcResponse>> {
  return new Promise((resolve, reject) => {
    const vaultDir = mkdtempSync(join(tmpdir(), "sis-mcp-smoke-"));
    const child = spawn(
      process.execPath,
      ["--import", "tsx", SERVER, "--vault-dir", vaultDir],
      { cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"] },
    );

    const responses = new Map<number, RpcResponse>();
    const remaining = new Set(expectedIds);

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`MCP server timed out; got ids ${[...responses.keys()].join(",")}`));
    }, 10_000);

    function cleanup(): void {
      clearTimeout(timer);
      child.kill();
      rmSync(vaultDir, { recursive: true, force: true });
    }

    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      if (!line.trim()) return;
      let parsed: RpcResponse;
      try {
        parsed = JSON.parse(line) as RpcResponse;
      } catch {
        return; // ignore non-JSON diagnostic noise
      }
      if (typeof parsed.id === "number" && remaining.has(parsed.id)) {
        responses.set(parsed.id, parsed);
        remaining.delete(parsed.id);
        if (remaining.size === 0) {
          cleanup();
          resolve(responses);
        }
      }
    });

    child.on("error", (err) => {
      cleanup();
      reject(err);
    });

    for (const req of requests) {
      child.stdin.write(JSON.stringify(req) + "\n");
    }
  });
}

describe("operational MCP server (dist/mcp-server.js) — end-to-end", () => {
  it("responds to initialize and lists exactly the thirteen sis_* tools", async () => {
    const responses = await driveServer(
      [
        { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
        { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
      ],
      [1, 2],
    );

    const init = responses.get(1);
    assert.ok(init?.result?.serverInfo?.name, "initialize did not return serverInfo.name");

    const list = responses.get(2);
    const names = (list?.result?.tools ?? []).map((t) => t.name).sort();
    assert.deepEqual(
      names,
      EXPECTED_TOOLS,
      `tools/list did not return the thirteen documented sis_* tools (got ${names.length})`,
    );
  });
});
