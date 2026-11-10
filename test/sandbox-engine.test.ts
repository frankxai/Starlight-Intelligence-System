/**
 * Starlight Sandbox & MicroVM Runtime Engine Tests
 *
 * Validates:
 *   - LocalIsolatedSandbox execution across JS, TS, Python, PowerShell
 *   - Strict environment scrubbing & secret leak prevention
 *   - Ephemeral file staging & path traversal defense
 *   - Execution timeout bounds & process tree killing
 *   - E2B MicroVM availability checks & graceful degradation
 *   - Synthetic sandbox deterministic simulation
 *   - SandboxRouter provider resolution, fallback, and teammates integration
 *
 * Attestation: Built on SIP § 3 — Sandbox Test Suite
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LocalIsolatedSandbox,
  E2BMicroVmSandbox,
  SyntheticSandbox,
  SandboxRouter,
  sandboxRouter,
  type SandboxExecutionRequest,
} from "../src/orchestration/sandbox/index.js";
import { StarlightTeammatesEngine } from "../src/orchestration/teammates-engine.js";

describe("LocalIsolatedSandbox", () => {
  it("executes javascript cleanly within ephemeral directory", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: 'console.log("Hello from isolated JS sandbox");',
      language: "javascript",
      policy: { timeoutMs: 5000 },
    });

    assert.equal(result.success, true);
    assert.equal(result.timedOut, false);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Hello from isolated JS sandbox"));
    assert.equal(result.provider, "local");
    assert.ok(result.durationMs >= 0);
  });

  it("executes typescript using tsx loader", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: `
        interface Coordinate { x: number; y: number }
        const p: Coordinate = { x: 20, y: 22 };
        console.log("Computed sum: " + (p.x + p.y));
      `,
      language: "typescript",
      policy: { timeoutMs: 8000 },
    });

    assert.equal(result.success, true);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Computed sum: 42"));
  });

  it("executes python code in isolated runtime", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: 'print(f"Python compute: {6 * 7}")',
      language: "python",
      policy: { timeoutMs: 5000 },
    });

    assert.equal(result.success, true);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Python compute: 42"));
  });

  it("executes powershell script in isolated runtime", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: 'Write-Output "PowerShell MicroVM Execution OK"',
      language: "powershell",
      policy: { timeoutMs: 5000 },
    });

    assert.equal(result.success, true);
    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("PowerShell MicroVM Execution OK"));
  });

  it("stages ephemeral files and allows reading them", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: `
        import fs from "node:fs";
        const content = fs.readFileSync("data/sample.json", "utf8");
        const parsed = JSON.parse(content);
        console.log("Loaded status: " + parsed.status);
      `,
      language: "javascript",
      files: {
        "data/sample.json": JSON.stringify({ status: "STAGED_OK", version: "1.0" }),
      },
      policy: { timeoutMs: 5000 },
    });

    assert.equal(result.success, true);
    assert.ok(result.stdout.includes("Loaded status: STAGED_OK"));
  });

  it("rejects path traversal in staged file paths", async () => {
    const sandbox = new LocalIsolatedSandbox();
    await assert.rejects(
      async () => {
        await sandbox.execute({
          code: 'console.log("test");',
          language: "javascript",
          files: {
            "../../escape.txt": "evil content",
          },
        });
      },
      /Path traversal attempt detected/
    );
  });

  it("scrubs sensitive environment variables and API keys", async () => {
    const originalSecret = process.env.TEST_API_KEY;
    process.env.TEST_API_KEY = "SUPER_SECRET_TOKEN_DO_NOT_LEAK";

    try {
      const sandbox = new LocalIsolatedSandbox();
      const result = await sandbox.execute({
        code: `
          const secret = process.env.TEST_API_KEY || "NOT_FOUND";
          console.log("Secret value: " + secret);
        `,
        language: "javascript",
        policy: { timeoutMs: 5000 },
      });

      assert.equal(result.success, true);
      assert.ok(result.stdout.includes("Secret value: NOT_FOUND"));
      assert.ok(!result.stdout.includes("SUPER_SECRET_TOKEN_DO_NOT_LEAK"));
    } finally {
      if (originalSecret === undefined) {
        delete process.env.TEST_API_KEY;
      } else {
        process.env.TEST_API_KEY = originalSecret;
      }
    }
  });

  it("handles process timeout and halts execution within bounds", async () => {
    const sandbox = new LocalIsolatedSandbox();
    const result = await sandbox.execute({
      code: `
        const start = Date.now();
        // Busy wait to simulate runaway loop
        while (Date.now() - start < 10000) {}
      `,
      language: "javascript",
      policy: { timeoutMs: 600 },
    });

    assert.equal(result.success, false);
    assert.equal(result.timedOut, true);
    assert.equal(result.exitCode, null);
    assert.ok(result.error?.includes("timed out"));
  });
});

describe("E2BMicroVmSandbox", () => {
  it("reports availability based on E2B_API_KEY presence", () => {
    const originalKey = process.env.E2B_API_KEY;
    delete process.env.E2B_API_KEY;

    try {
      const e2b = new E2BMicroVmSandbox();
      assert.equal(e2b.isAvailable(), false);

      process.env.E2B_API_KEY = "test-e2b-key";
      assert.equal(e2b.isAvailable(), true);
    } finally {
      if (originalKey === undefined) {
        delete process.env.E2B_API_KEY;
      } else {
        process.env.E2B_API_KEY = originalKey;
      }
    }
  });

  it("gracefully declines when E2B_API_KEY is not configured", async () => {
    const originalKey = process.env.E2B_API_KEY;
    delete process.env.E2B_API_KEY;

    try {
      const e2b = new E2BMicroVmSandbox();
      const result = await e2b.execute({
        code: 'print("remote microvm")',
        language: "python",
      });

      assert.equal(result.success, false);
      assert.equal(result.provider, "e2b");
      assert.equal(result.error, "E2B_API_KEY_MISSING");
      assert.ok(result.stderr.includes("E2B_API_KEY"));
    } finally {
      if (originalKey !== undefined) {
        process.env.E2B_API_KEY = originalKey;
      }
    }
  });
});

describe("SyntheticSandbox", () => {
  it("deterministically simulates output statements", async () => {
    const synthetic = new SyntheticSandbox();
    const result = await synthetic.execute({
      code: 'console.log("Synthetic Hello World");',
      language: "javascript",
    });

    assert.equal(result.success, true);
    assert.equal(result.provider, "synthetic");
    assert.equal(result.synthetic, true);
    assert.ok(result.stdout.includes("Synthetic Hello World"));
  });

  it("deterministically simulates exceptions and errors", async () => {
    const synthetic = new SyntheticSandbox();
    const result = await synthetic.execute({
      code: 'throw new Error("Synthetic simulated fault");',
      language: "javascript",
    });

    assert.equal(result.success, false);
    assert.equal(result.exitCode, 1);
    assert.ok(result.stderr.includes("Synthetic simulated fault"));
  });

  it("deterministically simulates timeouts on infinite loops", async () => {
    const synthetic = new SyntheticSandbox();
    const result = await synthetic.execute({
      code: "while(true) { doWork(); }",
      language: "javascript",
      policy: { timeoutMs: 1500 },
    });

    assert.equal(result.success, false);
    assert.equal(result.timedOut, true);
    assert.equal(result.exitCode, null);
    assert.ok(result.error?.includes("timed out"));
  });
});

describe("SandboxRouter", () => {
  it("resolves local provider by default", () => {
    const router = new SandboxRouter();
    const resolved = router.resolveProvider({
      code: 'console.log("test");',
      language: "javascript",
    });
    assert.equal(resolved, "local");
  });

  it("resolves synthetic provider when explicitly specified", () => {
    const router = new SandboxRouter();
    const resolved = router.resolveProvider({
      code: 'console.log("test");',
      language: "javascript",
      provider: "synthetic",
    });
    assert.equal(resolved, "synthetic");
  });

  it("falls back to local when e2b is requested but unconfigured", () => {
    const originalKey = process.env.E2B_API_KEY;
    delete process.env.E2B_API_KEY;

    try {
      const router = new SandboxRouter();
      const resolved = router.resolveProvider({
        code: 'console.log("test");',
        language: "javascript",
        provider: "e2b",
      });
      assert.equal(resolved, "local");
    } finally {
      if (originalKey !== undefined) {
        process.env.E2B_API_KEY = originalKey;
      }
    }
  });

  it("routes e2b when configured and network allowed", () => {
    const originalKey = process.env.E2B_API_KEY;
    process.env.E2B_API_KEY = "dummy-e2b-key";

    try {
      const router = new SandboxRouter();
      const resolved = router.resolveProvider({
        code: 'print("scrape url")',
        language: "python",
        policy: { allowNetwork: true },
      });
      assert.equal(resolved, "e2b");
    } finally {
      if (originalKey === undefined) {
        delete process.env.E2B_API_KEY;
      } else {
        process.env.E2B_API_KEY = originalKey;
      }
    }
  });

  it("falls back to synthetic on provider execution fault", async () => {
    const router = new SandboxRouter();
    // Register a broken runner that throws
    router.registerProvider("local", {
      provider: "local",
      isAvailable: () => true,
      execute: async () => {
        throw new Error("Simulated host daemon kernel panic");
      },
    });

    const result = await router.execute({
      code: 'console.log("Recovered by router");',
      language: "javascript",
    });

    assert.equal(result.provider, "synthetic");
    assert.ok(result.error?.includes("Fell back to synthetic simulation"));
    assert.ok(result.stdout.includes("Recovered by router"));
  });
});

describe("Teammates Engine Sandbox Integration", () => {
  it("exposes executeInSandbox on StarlightTeammatesEngine", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.executeInSandbox({
      code: 'console.log("Teammates microVM execution verified");',
      language: "javascript",
    });

    assert.equal(result.success, true);
    assert.ok(result.stdout.includes("Teammates microVM execution verified"));
  });

  it("executes sandbox-microvm trace step during code-related teammate dispatch", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.dispatch(
      "github-officer",
      "Run sandbox validation for typescript math utility function"
    );

    assert.equal(result.teammateId, "github-officer");
    const sandboxStep = result.executionTree.find(
      (s) => s.tool === "sandbox-microvm"
    );
    assert.ok(sandboxStep, "Expected sandbox-microvm step in execution trace");
    assert.equal(sandboxStep?.status, "success");
    assert.ok(sandboxStep?.summary.includes("sandbox"));
  });
});
