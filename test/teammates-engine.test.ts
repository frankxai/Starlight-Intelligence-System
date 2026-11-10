import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { StarlightTeammatesEngine } from "../src/orchestration/teammates-engine.js";

describe("Starlight Teammates Engine", () => {
  it("initializes with the default fleet and retrieves all teammates", () => {
    const engine = new StarlightTeammatesEngine();
    const fleet = engine.getTeammates();
    assert.equal(fleet.length, 5);

    const names = fleet.map(t => t.name);
    assert.ok(names.includes("Starlight Queen"));
    assert.ok(names.includes("Search Manager"));
    assert.ok(names.includes("GitHub Officer"));
    assert.ok(names.includes("Community Lead"));
    assert.ok(names.includes("Teammate Builder"));
  });

  it("supports fuzzy and prefix-tolerant teammate lookup", () => {
    const engine = new StarlightTeammatesEngine();

    const queen1 = engine.getTeammate("starlight-queen");
    assert.ok(queen1);
    assert.equal(queen1.id, "starlight-queen");

    const queen2 = engine.getTeammate("queen");
    assert.ok(queen2);
    assert.equal(queen2.id, "starlight-queen");

    const search = engine.getTeammate("search-manager");
    assert.ok(search);
    assert.equal(search.id, "search-manager");

    const builder = engine.getTeammate("builder");
    assert.ok(builder);
    assert.equal(builder.id, "teammate-builder");
  });

  it("routes dynamically across frontier model tiers based on intent", () => {
    const engine = new StarlightTeammatesEngine();

    // Frontier tier for architecture and synthesis
    assert.equal(engine.resolveModel("frontier", "build normal app"), "Claude Opus 5.5");
    assert.equal(engine.resolveModel("standard", "deep architecture review"), "Claude Opus 5.5");

    // Light tier for search, scraping, and linting
    assert.equal(engine.resolveModel("light", "check database status"), "Gemini 4 Argon");
    assert.equal(engine.resolveModel("standard", "quick search status"), "Gemini 4 Argon");

    // Standard tier default
    assert.equal(engine.resolveModel("standard", "implement checkout flow component"), "Claude Sonnet 5.5");
  });

  it("fails closed on autonomous financial operations", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.dispatch("starlight-queen", "Authorize payment of $250 to vendor invoice");

    assert.ok(result.approvalRequest);
    assert.equal(result.approvalRequest.type, "FINANCIAL");
    assert.equal(result.approvalRequest.status, "pending");
    assert.ok(result.content.includes("SIP Invariant §5"));

    // Verify approval resolution
    const resolved = engine.resolveApproval(result.approvalRequest.id, true);
    assert.equal(resolved.status, "approved");
  });

  it("fails closed on production git merges and deployments", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.dispatch("github-officer", "Merge pull request #42 directly to main and deploy");

    assert.ok(result.approvalRequest);
    assert.equal(result.approvalRequest.type, "GIT_MERGE");
    assert.equal(result.approvalRequest.status, "pending");
    assert.ok(result.content.includes("gated"));

    // Verify rejection resolution
    const resolved = engine.resolveApproval(result.approvalRequest.id, false);
    assert.equal(resolved.status, "rejected");
  });

  it("executes standard non-gated tasks cleanly with trace receipts", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.dispatch("search-manager", "Analyze recent arXiv submissions on latent memory");

    assert.equal(result.teammateId, "search-manager");
    assert.equal(result.approvalRequest, undefined);
    assert.ok(result.executionTree.length > 0);
    assert.ok(result.content.includes("Completed:"));
  });

  it("runs an autonomic tick and returns structured health sweep", async () => {
    const engine = new StarlightTeammatesEngine();
    const tick = await engine.runAutonomicTick();

    assert.ok(tick.tickId.startsWith("tick-"));
    assert.equal(tick.teammatesPolled, 5);
    assert.equal(tick.details.length, 5);
    assert.ok(tick.details.some(d => d.name === "Starlight Queen"));
    assert.ok(tick.details.some(d => d.name === "GitHub Officer"));
  });

  it("retrieves pending approvals from persistent state", async () => {
    const engine = new StarlightTeammatesEngine();
    const result = await engine.dispatch("starlight-queen", "Spend $50 for domain registration");

    assert.ok(result.approvalRequest);
    const gateId = result.approvalRequest.id;

    // Verify lookup by ID and list retrieval
    const fetched = engine.getApproval(gateId);
    assert.ok(fetched);
    assert.equal(fetched.id, gateId);

    const all = engine.getPendingApprovals();
    assert.ok(all.some(g => g.id === gateId));

    // Clean up
    engine.resolveApproval(gateId, false);
  });
});

