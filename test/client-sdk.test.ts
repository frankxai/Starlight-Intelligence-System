/**
 * Unit Tests for StarlightClient Isomorphic SDK
 *
 * Covers:
 * - Direct engine mode across all namespaces (teammates, sandbox, vaults, genius)
 * - HTTP mode across all namespaces with custom fetch mocks
 * - Fail-closed governance gate handling (SIP § 5 non-waivable invariants)
 * - Freedom Path 4-bucket task evaluation (Keep, Delegate, Automate, Eliminate)
 * - Multi-teammate delegation planning with model tiers
 *
 * Attestation: Built on SIP § 3 — SDK Test Suite
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { StarlightClient } from "../src/client.js";

describe("StarlightClient — SDK Initialization & Mode Detection", () => {
  it("defaults to direct mode when baseUrl is omitted in Node runtime", () => {
    const client = new StarlightClient();
    assert.strictEqual(client.mode, "direct");
    assert.ok(client.teammates);
    assert.ok(client.sandbox);
    assert.ok(client.vaults);
    assert.ok(client.genius);
  });

  it("defaults to http mode when baseUrl is provided", () => {
    const client = new StarlightClient({ baseUrl: "https://api.starlight.test" });
    assert.strictEqual(client.mode, "http");
    assert.strictEqual(client.baseUrl, "https://api.starlight.test");
  });

  it("strips trailing slashes from baseUrl", () => {
    const client = new StarlightClient({ baseUrl: "https://api.starlight.test///" });
    assert.strictEqual(client.baseUrl, "https://api.starlight.test");
  });

  it("honors explicit mode override", () => {
    const client = new StarlightClient({ mode: "direct", baseUrl: "https://api.starlight.test" });
    assert.strictEqual(client.mode, "direct");
  });
});

describe("StarlightClient — Direct Mode: Teammates Namespace", () => {
  const client = new StarlightClient({ mode: "direct" });

  it("teammates.list() returns registered sovereign teammates", async () => {
    const teammates = await client.teammates.list();
    assert.ok(Array.isArray(teammates));
    assert.ok(teammates.length >= 4);

    const queen = teammates.find((t) => t.id === "starlight-queen");
    assert.ok(queen, "starlight-queen must be present in registry");
    assert.strictEqual(queen?.voice, "queen");
    assert.ok(queen?.activeModels.includes("claude-sonnet-5-5"));

    const github = teammates.find((t) => t.id === "github-officer");
    assert.ok(github, "github-officer must be present in registry");
    assert.strictEqual(github?.voice, "sentinel");
  });

  it("teammates.dispatch() executes task with model routing and step traces", async () => {
    const result = await client.teammates.dispatch({
      teammateId: "search-manager",
      prompt: "Scan latest arXiv developments in neuro-symbolic reasoning",
      tier: "light",
    });

    assert.ok(result.messageId);
    assert.strictEqual(result.teammateId, "search-manager");
    assert.ok(result.content.length > 0);
    assert.strictEqual(result.tierUsed, "light");
    assert.ok(Array.isArray(result.executionTree));
    assert.ok(result.executionTree.length > 0);
  });

  it("teammates.dispatch() triggers fail-closed governance gate on financial instructions", async () => {
    const result = await client.teammates.dispatch({
      teammateId: "starlight-queen",
      prompt: "Transfer 500 dollars to cloud vendor invoice payment",
    });

    assert.ok(result.approvalRequest, "Financial dispatch must emit an approval request");
    assert.strictEqual(result.approvalRequest.type, "FINANCIAL");
    assert.strictEqual(result.approvalRequest.status, "pending");
    assert.ok(result.content.includes("SIP"));
  });

  it("teammates.approve() resolves pending approval gate", async () => {
    // Dispatch a gated action to generate a gate
    const dispatched = await client.teammates.dispatch({
      teammateId: "starlight-queen",
      prompt: "Authorize payment of $120 for server compute",
    });

    assert.ok(dispatched.approvalRequest);
    const gateId = dispatched.approvalRequest.id;

    const resolved = await client.teammates.approve({
      gateId,
      approved: true,
    });

    assert.strictEqual(resolved.id, gateId);
    assert.strictEqual(resolved.status, "approved");
  });

  it("teammates.tick() runs autonomic sweep", async () => {
    const tick = await client.teammates.tick();
    assert.ok(tick.tickId.startsWith("tick-"));
    assert.ok(tick.teammatesPolled >= 4);
    assert.ok(Array.isArray(tick.details));
  });

  it("teammates.daemonStatus() reports healthy subsystem status", async () => {
    const status = await client.teammates.daemonStatus();
    assert.strictEqual(status.status, "healthy");
    assert.strictEqual(status.pulse, "active");
    assert.ok(status.subsystems?.teammatesEngine);
  });
});

describe("StarlightClient — Direct Mode: Sandbox Namespace", () => {
  const client = new StarlightClient({ mode: "direct" });

  it("sandbox.execute() runs code in isolated sandbox environment", async () => {
    const result = await client.sandbox.execute({
      code: "console.log('SIP Sandbox Execution Verified');",
      language: "javascript",
      provider: "local",
      timeoutMs: 5000,
    });

    assert.ok(result);
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes("SIP Sandbox Execution Verified"));
    assert.strictEqual(result.exitCode, 0);
  });
});

describe("StarlightClient — Direct Mode: Vaults Namespace", () => {
  let tempDir: string;
  let client: StarlightClient;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), "sis-client-vault-test-"));
    client = new StarlightClient({
      mode: "direct",
      vaultStoragePath: tempDir,
    });
  });

  after(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("vaults.remember() stores memory and vaults.search() retrieves it", async () => {
    const entry = await client.vaults.remember({
      content: "Neural state serialization with zero latency overhead",
      vault: "technical",
      tags: ["neural", "architecture", "test"],
      confidence: 0.95,
    });

    assert.ok(entry.id);
    assert.strictEqual(entry.vault, "technical");
    assert.ok(entry.content.includes("Neural state serialization"));

    const searchResults = await client.vaults.search({
      query: "Neural state",
      vault: "technical",
      limit: 5,
    });

    assert.ok(Array.isArray(searchResults));
    assert.ok(searchResults.length > 0);
    assert.ok(searchResults.some((r) => r.content.includes("Neural state serialization")));
  });
});

describe("StarlightClient — Direct Mode: Genius Namespace", () => {
  const client = new StarlightClient({ mode: "direct" });

  it("genius.getProfile() returns Frank's canonical Genius Profile", async () => {
    const profile = await client.genius.getProfile();
    assert.strictEqual(profile.name, "Frank Riemer");
    assert.ok(profile.archetype.includes("Systems Architect"));
    assert.ok(profile.archetype.includes("Composer"));
    assert.ok(profile.archetype.includes("Builder"));
    assert.ok(profile.archetype.includes("GenCreator"));

    assert.ok(profile.quadrants.architect);
    assert.ok(profile.quadrants.composer);
    assert.ok(profile.quadrants.builder);
    assert.ok(profile.quadrants.gencreator);

    assert.ok(profile.nonWaivableInvariants.some((inv) => inv.includes("Money fails closed")));
    assert.ok(profile.voiceSignature.keyVocabulary.includes("Substrate"));
  });

  it("genius.evaluatePath() classifies tasks into Freedom Path buckets", async () => {
    const elim = await client.genius.evaluatePath("attend 3-hour endless meeting without agenda");
    assert.strictEqual(elim.action, "eliminate");

    const auto = await client.genius.evaluatePath("setup nightly build cron schedule and run automated tests");
    assert.strictEqual(auto.action, "automate");

    const keep = await client.genius.evaluatePath("design foundational sovereign protocol topology and fail-closed security boundary");
    assert.strictEqual(keep.action, "keep");
    assert.strictEqual(keep.primaryQuadrant, "architect");

    const keepMusic = await client.genius.evaluatePath("compose music album and harmonic arrangement");
    assert.strictEqual(keepMusic.action, "keep");
    assert.strictEqual(keepMusic.primaryQuadrant, "composer");

    const delSearch = await client.genius.evaluatePath("perform competitor market analysis and literature review");
    assert.strictEqual(delSearch.action, "delegate");
    assert.strictEqual(delSearch.suggestedTeammate, "search-manager");

    const delCode = await client.genius.evaluatePath("execute sentinel audit and code review for open PR");
    assert.strictEqual(delCode.action, "delegate");
    assert.strictEqual(delCode.suggestedTeammate, "github-officer");
  });

  it("genius.planDelegation() creates structured subtasks with model recommendations", async () => {
    const plan = await client.genius.planDelegation(
      "Research competitor benchmarks, compile typed Foundry tool schemas, and execute Sentinel security audit"
    );

    assert.ok(plan.id);
    assert.ok(plan.subtasks.length >= 3);
    assert.strictEqual(plan.coordinatingTeammate, "starlight-queen");

    const searchTask = plan.subtasks.find((s) => s.assignedTeammate === "search-manager");
    assert.ok(searchTask, "Search task should be assigned to search-manager");
    assert.strictEqual(searchTask?.recommendedModelTier, "light");

    const foundryTask = plan.subtasks.find((s) => s.assignedTeammate === "teammate-builder");
    assert.ok(foundryTask, "Foundry task should be assigned to teammate-builder");
    assert.strictEqual(foundryTask?.recommendedModelTier, "frontier");

    const sentinelTask = plan.subtasks.find((s) => s.assignedTeammate === "github-officer");
    assert.ok(sentinelTask, "Sentinel verification task should be assigned to github-officer");
    assert.strictEqual(sentinelTask?.recommendedModelTier, "standard");
  });
});

describe("StarlightClient — HTTP Mode: Mocked Transport", () => {
  it("routes teammates, sandbox, vaults, and genius calls through HTTP fetch", async () => {
    const calls: Array<{ url: string; method?: string; body?: any }> = [];

    const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      const method = init?.method || "GET";
      const body = init?.body ? JSON.parse(init.body as string) : undefined;
      calls.push({ url, method, body });

      if (url.endsWith("/api/teammates") && method === "GET") {
        return new Response(
          JSON.stringify({
            teammates: [
              {
                id: "starlight-queen",
                name: "Starlight Queen",
                role: "Autonomous Ecosystem Operator",
                domain: "orchestration",
                voice: "queen",
                status: "idle",
                defaultTier: "standard",
                activeModels: ["claude-sonnet-5-5"],
                connectedTools: ["starlight-memory"],
                activeVaults: ["operational"],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/teammates") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            message: {
              id: "msg-http-123",
              content: `HTTP dispatched: ${body.prompt}`,
              timestamp: "Just now",
              executionTree: [
                {
                  id: "step-1",
                  summary: "HTTP step completed",
                  durationMs: 40,
                  status: "success",
                },
              ],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/teammates/approve") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            requestId: body.requestId,
            status: body.action === "approve" ? "approved" : "rejected",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/teammates/heartbeat") && method === "GET") {
        return new Response(
          JSON.stringify({
            success: true,
            status: "healthy",
            tick: 42,
            latencyMs: 14,
            pulse: "active",
            pendingApprovalsCount: 0,
            activeWorkflowsCount: 2,
            telemetry: { uptimeSeconds: 1200 },
            subsystems: { microVM: "online" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/teammates/sandbox") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            output: "Executed via Firecracker MicroVM",
            durationMs: 85,
            providerUsed: "microvm",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/vaults") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            entry: {
              id: "vault-entry-1",
              vault: body.vault,
              content: body.content,
              tags: body.tags || [],
              createdAt: new Date().toISOString(),
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.endsWith("/api/genius") && method === "POST") {
        return new Response(
          JSON.stringify({
            success: true,
            evaluation: {
              action: "keep",
              taskDescription: body.task,
              confidence: 0.99,
              rationale: "HTTP evaluated as keep",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
    };

    const httpClient = new StarlightClient({
      mode: "http",
      baseUrl: "https://sis.starlight.dev",
      fetch: mockFetch as any,
    });

    // 1. Teammates list
    const teammates = await httpClient.teammates.list();
    assert.strictEqual(teammates.length, 1);
    assert.strictEqual(teammates[0].id, "starlight-queen");

    // 2. Teammates dispatch
    const dispatch = await httpClient.teammates.dispatch({
      teammateId: "starlight-queen",
      prompt: "Execute autonomic sweep",
    });
    assert.strictEqual(dispatch.messageId, "msg-http-123");
    assert.ok(dispatch.content.includes("HTTP dispatched"));

    // 3. Teammates approve
    const approval = await httpClient.teammates.approve({
      gateId: "gate-999",
      approved: true,
    });
    assert.strictEqual(approval.id, "gate-999");
    assert.strictEqual(approval.status, "approved");

    // 4. Teammates heartbeat & daemonStatus
    const status = await httpClient.teammates.daemonStatus();
    assert.strictEqual(status.status, "healthy");
    assert.strictEqual(status.latencyMs, 14);

    // 5. Sandbox execute
    const sandboxRes = await httpClient.sandbox.execute({
      code: "console.log('hi')",
      language: "javascript",
    });
    assert.strictEqual(sandboxRes.success, true);
    assert.strictEqual(sandboxRes.output, "Executed via Firecracker MicroVM");

    // 6. Vaults remember
    const vaultEntry = await httpClient.vaults.remember({
      content: "Persistent HTTP pattern",
      vault: "technical",
    });
    assert.strictEqual(vaultEntry.id, "vault-entry-1");

    // 7. Genius evaluate
    const evalRes = await httpClient.genius.evaluatePath("Protocol design task");
    assert.strictEqual(evalRes.action, "keep");
    assert.strictEqual(evalRes.rationale, "HTTP evaluated as keep");

    // Verify calls made
    assert.ok(calls.length >= 7);
    assert.ok(calls.every((c) => c.url.startsWith("https://sis.starlight.dev")));
  });
});
