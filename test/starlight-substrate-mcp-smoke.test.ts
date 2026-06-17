/**
 * Substrate MCP server — registry parser smoke test.
 *
 * Ensures `starlight_registry_query` reports only actual MCP server entries
 * from REGISTRY.md's "Active servers" section. This catches parser drift where
 * later H3 headings (Claw Registry / Registration sections) are misread as
 * server rows.
 *
 * Built on SIP — substrate tier (MCP registry conformance).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SERVER = join(REPO_ROOT, "src", "starlight-mcp.ts");

interface RpcResponse {
  id: number | null;
  result?: {
    content?: Array<{ type: string; text: string }>;
    serverInfo?: { name?: string };
  };
}

function driveServer(requests: Array<Record<string, unknown>>, expectedIds: number[]): Promise<Map<number, RpcResponse>> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", SERVER, "--substrate-dir", REPO_ROOT],
      { cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"] },
    );

    const responses = new Map<number, RpcResponse>();
    const remaining = new Set(expectedIds);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Substrate MCP server timed out; got ids ${[...responses.keys()].join(",")}`));
    }, 10_000);

    function cleanup(): void {
      clearTimeout(timer);
      child.kill();
    }

    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      if (!line.trim()) return;
      let parsed: RpcResponse;
      try {
        parsed = JSON.parse(line) as RpcResponse;
      } catch {
        return;
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

describe("substrate MCP registry query", () => {
  it("returns only registered MCP servers, not later markdown headings", async () => {
    const responses = await driveServer(
      [
        { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
        {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: "starlight_registry_query", arguments: {} },
        },
      ],
      [1, 2],
    );

    assert.equal(
      responses.get(1)?.result?.serverInfo?.name,
      "starlight-substrate-mcp",
      "initialize did not return substrate MCP serverInfo",
    );

    const text = responses.get(2)?.result?.content?.[0]?.text;
    assert.ok(text, "registry query did not return JSON content");
    const payload = JSON.parse(text) as { count: number; servers: Array<{ name: string }> };
    const names = payload.servers.map((s) => s.name).sort();

    assert.deepEqual(
      names,
      ["arcanea-mcp", "sentinel-mcp", "sis-memory-mcp", "starlight-mcp"].sort(),
    );
    assert.equal(payload.count, names.length);
    assert.ok(!names.includes("Schema"));
    assert.ok(!names.includes("Active"));
    assert.ok(!names.includes("Planned"));
  });
});
