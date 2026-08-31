/**
 * v9.2 — the artifact a stranger installs must work, not just the repo.
 *
 * `test/smoke-quickstart.test.ts` proves the first-run path against `src/` via tsx.
 * That is the right inner loop, and it was green throughout August while the thing
 * people actually install was broken:
 *
 *   - the registry's newest published version was 6.0.1 (2026-04-17) against a repo
 *     at 8.3.0, so every npm instruction in the README targeted software that did
 *     not exist;
 *   - `starlight init --vaults` exits 0 on that published build while silently
 *     ignoring `--vaults`, because the flag postdates it — a green exit that leaves
 *     the user in the state the next documented step assumes away;
 *   - `dist/` carried 31 modules with no corresponding source, and `files` ships
 *     `dist/` only, so the tarball was not a build of this repository.
 *
 * A test that never touches the tarball cannot catch any of that. This one packs
 * the real thing, unpacks it, and drives the shipped server the way an adopter's
 * MCP client would. The shipped server graph is node-builtins-only (verified), so
 * this needs no network install.
 *
 * Built on SIP — operational tier (published-artifact conformance).
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

let workDir: string;
let packageRoot: string;

interface RpcResponse {
  id: number | null;
  result?: { content?: Array<{ text?: string }>; tools?: Array<{ name: string }> };
}

/** Drive the SHIPPED server (plain node, no tsx) exactly as an MCP client would. */
function driveShippedServer(
  vaultDir: string,
  requests: Array<Record<string, unknown>>,
  expectedIds: number[],
): Promise<Map<number, RpcResponse>> {
  return new Promise((resolve, reject) => {
    const server = join(packageRoot, "dist", "mcp-server.js");
    const child = spawn(process.execPath, [server, "--vault-dir", vaultDir], {
      cwd: packageRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const responses = new Map<number, RpcResponse>();
    const remaining = new Set(expectedIds);
    let stderr = "";

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`shipped server timed out; got ids ${[...responses.keys()].join(",")}; stderr: ${stderr}`));
    }, 20_000);

    function cleanup(): void {
      clearTimeout(timer);
      child.kill();
    }

    child.stderr.on("data", (d) => { stderr += String(d); });
    child.on("error", (err) => { cleanup(); reject(err); });

    createInterface({ input: child.stdout }).on("line", (line) => {
      if (!line.trim()) return;
      let parsed: RpcResponse;
      try { parsed = JSON.parse(line) as RpcResponse; } catch { return; }
      if (parsed.id === null || parsed.id === undefined) return;
      responses.set(parsed.id, parsed);
      remaining.delete(parsed.id);
      if (remaining.size === 0) { cleanup(); resolve(responses); }
    });

    for (const req of requests) child.stdin.write(JSON.stringify(req) + "\n");
  });
}

describe("published artifact", () => {
  before(() => {
    workDir = mkdtempSync(join(tmpdir(), "sis-pack-"));
    const packed = spawnSync("npm", ["pack", "--pack-destination", workDir], {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      shell: process.platform === "win32",
    });
    assert.equal(packed.status, 0, `npm pack failed: ${packed.stderr}`);

    const tarball = readdirSync(workDir).find((f) => f.endsWith(".tgz"));
    assert.ok(tarball, "npm pack produced no tarball");

    const extractDir = join(workDir, "extracted");
    mkdirSync(extractDir, { recursive: true });
    // Relative paths on purpose: GNU tar (which Git for Windows puts on PATH) reads a
    // leading drive letter as a remote host spec and dies with "Cannot connect to C:".
    // Running from workDir with bare names keeps both GNU tar and Windows' bsdtar happy.
    const untar = spawnSync("tar", ["-xzf", tarball, "-C", "extracted"], {
      cwd: workDir,
      encoding: "utf-8",
      shell: process.platform === "win32",
    });
    assert.equal(untar.status, 0, `tar extract failed: ${untar.stderr}`);

    // npm tarballs always root at `package/`.
    packageRoot = join(extractDir, "package");
  });

  after(() => {
    if (workDir) rmSync(workDir, { recursive: true, force: true });
  });

  it("ships every entry point package.json advertises", async () => {
    const pkg = JSON.parse(
      await import("node:fs/promises").then((fs) => fs.readFile(join(packageRoot, "package.json"), "utf-8")),
    ) as { bin?: Record<string, string>; main?: string; exports?: Record<string, unknown> };

    for (const [name, target] of Object.entries(pkg.bin ?? {})) {
      assert.ok(existsSync(join(packageRoot, target)), `bin "${name}" -> ${target} missing from tarball`);
    }
    assert.ok(pkg.main && existsSync(join(packageRoot, pkg.main)), `main ${pkg.main} missing from tarball`);

    for (const [subpath, def] of Object.entries(pkg.exports ?? {})) {
      const target = typeof def === "string" ? def : (def as Record<string, string>).import;
      if (!target) continue;
      assert.ok(existsSync(join(packageRoot, target)), `exports "${subpath}" -> ${target} missing from tarball`);
    }
  });

  it("ships no compiled module without a corresponding source", async () => {
    // dist/ carried 31 orphans before 2026-08-30 — logic in the published package
    // that no source file, worktree, or commit could account for. `files` is
    // dist-only, so an orphan is code an adopter runs and nobody has reviewed.
    const { readdir } = await import("node:fs/promises");
    const walk = async (dir: string, base: string): Promise<string[]> => {
      const out: string[] = [];
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const abs = join(dir, e.name);
        if (e.isDirectory()) out.push(...(await walk(abs, `${base}${e.name}/`)));
        else if (e.name.endsWith(".js")) out.push(`${base}${e.name.replace(/\.js$/, "")}`);
      }
      return out;
    };

    const shipped = await walk(join(packageRoot, "dist"), "");
    const orphans = shipped.filter(
      (m) => !existsSync(join(REPO_ROOT, "src", `${m}.ts`)) && !existsSync(join(REPO_ROOT, "src", `${m}.tsx`)),
    );
    assert.deepEqual(orphans, [], `tarball ships modules with no source: ${orphans.join(", ")}`);
  });

  it("the shipped MCP server serves its tools, seeds an empty vault dir, and round-trips a memory", async () => {
    const vaultDir = join(workDir, "vaults");
    mkdirSync(vaultDir, { recursive: true });

    const responses = await driveShippedServer(
      vaultDir,
      [
        { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "adopter", version: "1" } } },
        { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
        { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "sis_append_entry", arguments: { vault: "technical", content: "a stranger's first memory" } } },
        { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "sis_vault_search", arguments: { query: "stranger" } } },
      ],
      [1, 2, 3, 4],
    );

    assert.ok(responses.get(1)?.result, "initialize returned no result");

    const tools = responses.get(2)?.result?.tools ?? [];
    assert.ok(tools.length > 0, "shipped server advertised no tools");
    for (const required of ["sis_append_entry", "sis_vault_search"]) {
      assert.ok(tools.some((t) => t.name === required), `shipped server is missing ${required}`);
    }

    const wrote = responses.get(3)?.result?.content?.[0]?.text ?? "";
    assert.match(wrote, /technical/, `append did not report the vault: ${wrote}`);

    const found = responses.get(4)?.result?.content?.[0]?.text ?? "";
    assert.match(found, /stranger/, `search did not return the memory just written: ${found}`);
  });
});
