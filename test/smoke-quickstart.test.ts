/**
 * Quick-start smoke test — the README's two-minute second-brain path.
 *
 * SETUP.md is a ~30-minute operator runbook. A second-brain adopter needs the
 * much shorter path to be proven on a clean checkout:
 *
 *   1. seed the six vaults (`starlight init --vaults`, here exercised via the
 *      seedVaults primitive it calls),
 *   2. boot the operational MCP server pointed at a fresh, empty vault dir and
 *      confirm it auto-seeds so the system never looks broken,
 *   3. write one memory (`sis_append_entry`),
 *   4. search it back (`sis_vault_search`).
 *
 * This guards the install-for-anyone promise: if seeding or the first-run
 * experience regresses, CI fails here instead of a newcomer's first session.
 *
 * Built on SIP — operational tier (first-run conformance, end-to-end).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { seedVaults, VAULT_NAMES, vaultsAreEmpty } from "../src/seed.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SERVER = join(REPO_ROOT, "src", "mcp-server.ts");

interface RpcResponse {
  id: number | null;
  result?: { content?: Array<{ text?: string }> };
}

/**
 * Spawn the MCP server against `vaultDir`, drive the requests, resolve with a
 * map of responses keyed by id. Mirrors mcp-server-smoke.test.ts.
 */
function driveServer(
  vaultDir: string,
  requests: Array<Record<string, unknown>>,
  expectedIds: number[],
): Promise<Map<number, RpcResponse>> {
  return new Promise((resolve, reject) => {
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

    for (const req of requests) child.stdin.write(JSON.stringify(req) + "\n");
  });
}

describe("quick-start smoke — seed, boot, write, search", () => {
  it("seedVaults creates all six self-explaining vaults from empty", () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-seed-"));
    try {
      assert.ok(vaultsAreEmpty(dir), "fresh temp dir should read as empty");
      const result = seedVaults(dir);
      assert.equal(result.created.length, VAULT_NAMES.length);
      for (const name of VAULT_NAMES) {
        const file = join(dir, `${name}.jsonl`);
        assert.ok(existsSync(file), `${name}.jsonl should exist`);
        const lines = readFileSync(file, "utf-8").split("\n").filter((l) => l.trim());
        assert.ok(lines.length > 0, `${name}.jsonl should not be empty`);
        const entry = JSON.parse(lines[0]!);
        assert.equal(entry.id, `sis_welcome_${name}`, "first line is the welcome entry");
      }
      assert.ok(!vaultsAreEmpty(dir), "seeded dir should not read as empty");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("is idempotent — re-seeding keeps existing vaults", () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-seed-idem-"));
    try {
      seedVaults(dir);
      const second = seedVaults(dir);
      assert.equal(second.created.length, 0, "nothing recreated");
      assert.equal(second.skipped.length, VAULT_NAMES.length, "all kept");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("MCP server auto-seeds an empty vault dir, then writes and searches a memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-quickstart-"));
    try {
      const marker = "zphqx-quickstart-marker";
      const responses = await driveServer(
        dir,
        [
          { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
          {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: "sis_append_entry",
              arguments: { vault: "technical", content: `remember the ${marker}` },
            },
          },
          {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: { name: "sis_vault_search", arguments: { query: marker } },
          },
        ],
        [1, 2, 3],
      );

      // Auto-seed happened: the vault files exist on disk.
      for (const name of VAULT_NAMES) {
        assert.ok(existsSync(join(dir, `${name}.jsonl`)), `${name} auto-seeded`);
      }

      const search = responses.get(3);
      const text = search?.result?.content?.[0]?.text ?? "[]";
      assert.match(text, new RegExp(marker), "search returns the just-written memory");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
