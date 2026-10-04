/**
 * Drives the real stdio MCP server: continuity tools need an installed trust policy,
 * import idempotently and expose status without any reconciliation tool.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { capture, policy, writeBundle } from "./_lib/continuity-fixture.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const SERVER = join(REPO_ROOT, "src", "mcp-server.ts");
type Rpc = { id?: number; result?: any };

function drive(home: string, requests: object[]): Promise<Map<number, Rpc>> {
  const vaultDir = mkdtempSync(join(tmpdir(), "sis-continuity-vault-"));
  const child = spawn(process.execPath, ["--import", "tsx", SERVER, "--vault-dir", vaultDir, "--no-seed"], {
    cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, SIS_CONTINUITY_HOME: home },
  });
  const expected = requests.length;
  const responses = new Map<number, Rpc>();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error(`timed out with ${responses.size}/${expected}`)); }, 15_000);
    createInterface({ input: child.stdout }).on("line", (line) => {
      let message: Rpc;
      try { message = JSON.parse(line); } catch { return; }
      if (typeof message.id !== "number") return;
      responses.set(message.id, message);
      if (responses.size === expected) {
        clearTimeout(timer);
        child.kill();
        rmSync(vaultDir, { recursive: true, force: true });
        resolve(responses);
      }
    });
    child.on("error", reject);
    // Sequential ids keep import, replay and status ordered on one stdio session.
    for (const request of requests) child.stdin.write(JSON.stringify(request) + "\n");
  });
}

const call = (id: number, name: string, args: object = {}) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } });

describe("continuity MCP tools", () => {
  it("refuse with an actionable hint when no trust policy is installed", async () => {
    const home = mkdtempSync(join(tmpdir(), "sis-continuity-home-"));
    const result = (await drive(home, [call(1, "sis_continuity_status")])).get(1)!.result;
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result.content), /trust policy/i);
  });

  it("import once, replay as a no-op and report recovered work without exposing reconciliation", async () => {
    const home = mkdtempSync(join(tmpdir(), "sis-continuity-home-"));
    mkdirSync(home, { recursive: true });
    writeFileSync(join(home, "trust-policy.json"), JSON.stringify(policy));
    const bundle = writeBundle([capture()]);
    const responses = await drive(home, [
      call(1, "sis_continuity_import", { bundleDir: bundle }),
      call(2, "sis_continuity_import", { bundleDir: bundle }),
      call(3, "sis_continuity_status"),
      { jsonrpc: "2.0", id: 4, method: "tools/list" },
    ]);
    assert.equal(responses.get(1)!.result.structuredContent.status, "imported");
    assert.equal(responses.get(1)!.result.structuredContent.executionStarted, false);
    assert.equal(responses.get(2)!.result.structuredContent.status, "already-imported");
    const [work] = responses.get(3)!.result.structuredContent.works;
    assert.deepEqual([work.state, work.admission.admitted, work.mayAutomaticallyResume], ["input-required", false, false]);
    const names = responses.get(4)!.result.tools.map((t: { name: string }) => t.name);
    assert.ok(!names.some((n: string) => /reconcile|admit/.test(n)), "admission must stay outside MCP");
  });
});
