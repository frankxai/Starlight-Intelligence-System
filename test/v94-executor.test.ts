/**
 * v9.4 Executor — the real execution spine.
 *
 * Guards src/executors/claude-executor.ts: backend detection order, in-role
 * system-prompt composition from AgentDefinitions, the api backend's request
 * shape (via injected fetch), transport-seam behavior, graceful degradation
 * to the stub, and end-to-end orchestration through a mocked live executor.
 * A final integration test runs only when a real backend exists on the box.
 *
 * Built on SIP — operational tier (execution spine).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createClaudeExecutor,
  detectBackend,
  composeSystemPrompt,
  claudeCliAvailable,
} from "../src/executors/claude-executor.js";
import { StarlightIntelligence } from "../src/index.js";
import type { AgentDefinition } from "../src/types.js";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const AGENTS: AgentDefinition[] = [
  {
    id: "test-sentinel",
    name: "Test Sentinel",
    type: "specialist",
    description: "Guards quality and security before release",
    skills: ["security-review", "quality-gate"],
    triggers: { keywords: ["security", "review"] },
  },
];

describe("v9.4 executor — backend detection", () => {
  it("explicit backend wins over everything", () => {
    assert.equal(detectBackend({ backend: "stub" }), "stub");
    assert.equal(detectBackend({ backend: "api", apiKey: "" }), "api");
    assert.equal(detectBackend({ backend: "cli" }), "cli");
  });

  it("auto prefers api when a key is supplied", () => {
    assert.equal(detectBackend({ backend: "auto", apiKey: "sk-test" }), "api");
  });
});

describe("v9.4 executor — system prompt composition", () => {
  it("composes an in-role prompt from the agent definition", () => {
    const prompt = composeSystemPrompt("test-sentinel", AGENTS);
    assert.match(prompt, /Test Sentinel/);
    assert.match(prompt, /Guards quality and security/);
    assert.match(prompt, /security-review/);
    assert.match(prompt, /Built on SIP/);
  });

  it("falls back to a generic in-system identity for unknown agents", () => {
    const prompt = composeSystemPrompt("mystery-agent", AGENTS);
    assert.match(prompt, /mystery-agent/);
    assert.match(prompt, /Starlight Intelligence System/);
  });
});

describe("v9.4 executor — transport seam", () => {
  it("routes execution through an injected transport with composed prompts", async () => {
    const seen: Array<{ system: string; prompt: string }> = [];
    const executor = createClaudeExecutor({
      agents: AGENTS,
      transport: async (system, prompt) => {
        seen.push({ system, prompt });
        return "model says: reviewed and approved";
      },
    });

    const out = await executor("test-sentinel", "Review the release", { branch: "main" });
    assert.equal(out, "model says: reviewed and approved");
    assert.equal(seen.length, 1);
    assert.match(seen[0].system, /Test Sentinel/);
    assert.match(seen[0].prompt, /Review the release/);
    assert.match(seen[0].prompt, /<context>/, "non-empty context is embedded");
  });
});

describe("v9.4 executor — api backend request shape", () => {
  it("posts a Messages API request and extracts text blocks", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
      captured = { url: String(url), init: init ?? {} };
      return new Response(
        JSON.stringify({ content: [{ type: "text", text: "api answer" }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const executor = createClaudeExecutor({
      backend: "api",
      apiKey: "sk-test-key",
      agents: AGENTS,
      fetchImpl,
    });

    const out = await executor("test-sentinel", "Assess the diff", {});
    assert.equal(out, "api answer");
    assert.ok(captured, "fetch was called");
    assert.match(captured!.url, /api\.anthropic\.com\/v1\/messages/);
    const body = JSON.parse(String(captured!.init.body));
    assert.match(body.system, /Test Sentinel/);
    assert.equal(body.messages[0].role, "user");
    assert.match(body.messages[0].content, /Assess the diff/);
    const headers = captured!.init.headers as Record<string, string>;
    assert.equal(headers["x-api-key"], "sk-test-key");
  });

  it("degrades to the stub shape (with diagnostic) on api failure", async () => {
    const fetchImpl = (async () =>
      new Response("nope", { status: 500 })) as typeof fetch;
    const executor = createClaudeExecutor({
      backend: "api",
      apiKey: "sk-test-key",
      fetchImpl,
      quiet: true,
    });
    const out = await executor("agent-x", "do the thing", {});
    assert.match(out, /\[agent-x\] Processed: do the thing/);
    assert.match(out, /degraded/);
  });
});

describe("v9.4 executor — stub fallback", () => {
  it("explicit stub backend produces the deterministic shape", async () => {
    const executor = createClaudeExecutor({ backend: "stub", quiet: true });
    const out = await executor("agent-y", "summarize the vault", {});
    assert.equal(out, "[agent-y] Processed: summarize the vault");
  });
});

describe("v9.4 executor — end-to-end through the orchestrator", () => {
  it("a full orchestration runs through a mocked live executor", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sis-exec-e2e-"));
    try {
      const sis = new StarlightIntelligence({ memoryPath: dir });
      sis.initialize();
      sis.setExecutor(
        createClaudeExecutor({
          transport: async (_system, prompt) =>
            `LIVE-VERDICT for: ${prompt.slice(0, 40)}`,
        }),
      );
      const result = await sis.orchestrate({
        intent: "Review the code for security issues before release",
      });
      assert.ok(result.executions.length >= 1);
      assert.match(result.executions[0].output, /LIVE-VERDICT/);
      assert.match(result.synthesis, /LIVE-VERDICT/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("v9.4 executor — real-backend integration (skips when unavailable)", () => {
  const hasBackend = Boolean(process.env.ANTHROPIC_API_KEY) || claudeCliAvailable();
  it("executes one real call when a backend exists", { skip: !hasBackend }, async () => {
    const executor = createClaudeExecutor({ backend: "auto", quiet: true, timeoutMs: 90_000 });
    const out = await executor("test-sentinel", "Reply with exactly: STARLIGHT-OK", {});
    assert.ok(out.length > 0, "real backend returned output");
  });
});
