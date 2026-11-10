import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  StarlightGeniusEngine,
  geniusEngine,
  type GeniusProfile,
  type FreedomPathEvaluation,
  type DelegationPlan,
} from "../src/genius/index.js";

describe("StarlightGeniusEngine", () => {
  it("provides Frank's canonical sovereign Genius Profile", () => {
    const profile = geniusEngine.getFrankGeniusProfile();

    assert.equal(profile.name, "Frank Riemer");
    assert.match(profile.archetype, /Systems Architect/);
    assert.match(profile.formula, /Systems Architect x Composer x Gamer x Builder x GenCreator/);

    // Verify all four quadrants exist
    assert.ok(profile.quadrants.architect);
    assert.ok(profile.quadrants.composer);
    assert.ok(profile.quadrants.builder);
    assert.ok(profile.quadrants.gencreator);

    assert.equal(profile.quadrants.architect.title, "Systems Architect");
    assert.equal(profile.quadrants.composer.title, "Composer & Sonic Alchemist");
    assert.equal(profile.quadrants.builder.title, "Pragmatic Builder & Operator");
    assert.equal(profile.quadrants.gencreator.title, "Generative Creator & Systems Multiplier");

    // Verify cognitive superpowers
    assert.ok(profile.cognitiveSuperpowers.length >= 5);
    assert.ok(profile.cognitiveSuperpowers.some((p) => p.includes("Cross-Domain Synthesis")));
    assert.ok(profile.cognitiveSuperpowers.some((p) => p.includes("Pattern Recognition as Poetry")));
    assert.ok(profile.cognitiveSuperpowers.some((p) => p.includes("Sovereign Architecture")));

    // Verify non-waivable invariants
    assert.ok(profile.nonWaivableInvariants.some((inv) => inv.includes("Money fails closed")));
    assert.ok(profile.nonWaivableInvariants.some((inv) => inv.includes("Model, never diagnose")));
    assert.ok(profile.nonWaivableInvariants.some((inv) => inv.includes("Verify before claiming")));

    // Verify evaluation criteria & voice signature
    assert.equal(profile.evaluationCriteria, "Does this help someone build, not just consume?");
    assert.equal(profile.voiceSignature.vibe, "Cool, premium, high intellect, purpose-driven, fun.");
  });

  describe("evaluateFreedomPath", () => {
    it("classifies high-order architecture tasks as KEEP (architect)", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Design foundational architecture and sovereign protocol for multi-agent memory"
      );
      assert.equal(result.action, "keep");
      assert.equal(result.primaryQuadrant, "architect");
      assert.ok(result.confidence > 0.85);
      assert.match(result.rationale, /Systems Architect/);
    });

    it("classifies music and sonic tasks as KEEP (composer)", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Compose music harmonic arrangement and sound design for upcoming album"
      );
      assert.equal(result.action, "keep");
      assert.equal(result.primaryQuadrant, "composer");
      assert.ok(result.confidence > 0.85);
      assert.match(result.rationale, /Composer/);
    });

    it("classifies founder vision and philosophy as KEEP (gencreator)", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Define founder vision, brand philosophy and genius excavation methodology"
      );
      assert.equal(result.action, "keep");
      assert.equal(result.primaryQuadrant, "gencreator");
      assert.ok(result.confidence > 0.85);
    });

    it("classifies market research and intelligence tasks as DELEGATE (search-manager)", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Conduct market analysis and research top 10 AI lab updates on arXiv"
      );
      assert.equal(result.action, "delegate");
      assert.equal(result.suggestedTeammate, "search-manager");
      assert.ok(result.confidence > 0.85);
      assert.match(result.rationale, /Search Manager/);
    });

    it("classifies CI/CD, testing, and Sentinel security audits as DELEGATE (github-officer)", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Run PR review, Sentinel audit and verify build with unit tests"
      );
      assert.equal(result.action, "delegate");
      assert.equal(result.suggestedTeammate, "github-officer");
      assert.ok(result.confidence > 0.85);
      assert.match(result.rationale, /GitHub Officer/);
    });

    it("classifies recurring index rebuilds and cron sweeps as AUTOMATE", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Rebuild shadow index and run nightly batch database sync"
      );
      assert.equal(result.action, "automate");
      assert.ok(result.suggestedAutomation);
      assert.ok(result.confidence > 0.85);
    });

    it("classifies vanity distractions and unproductive meetings as ELIMINATE", () => {
      const result = geniusEngine.evaluateFreedomPath(
        "Bikeshed color palettes in endless meeting without agenda tracking vanity metrics"
      );
      assert.equal(result.action, "eliminate");
      assert.ok(result.eliminationReason);
      assert.ok(result.confidence >= 0.9);
      assert.match(result.rationale, /zero compounding leverage/);
    });
  });

  describe("planDelegation", () => {
    it("decomposes complex multi-faceted tasks into coordinated sovereign subtasks", () => {
      const plan = geniusEngine.planDelegation(
        "Build a new vision module with verified CI tests, market research on state-of-the-art architectures, and foundry skill packaging"
      );

      assert.ok(plan.id.startsWith("plan-"));
      assert.equal(plan.coordinatingTeammate, "starlight-queen");
      assert.equal(plan.coordinatingModel, "Claude Sonnet 5.5");
      assert.ok(plan.subtasks.length >= 4);

      // Verify Starlight Queen coordination task
      const queenCoord = plan.subtasks.find((s) => s.assignedTeammate === "starlight-queen" && s.id === "task-1");
      assert.ok(queenCoord);
      assert.equal(queenCoord.recommendedModelTier, "standard");

      // Verify Search Manager intelligence task
      const searchSubtask = plan.subtasks.find((s) => s.assignedTeammate === "search-manager");
      assert.ok(searchSubtask);
      assert.equal(searchSubtask.recommendedModelTier, "light");
      assert.match(searchSubtask.recommendedModel, /Gemini 4 Argon/);

      // Verify Teammate Builder studio task
      const builderSubtask = plan.subtasks.find((s) => s.assignedTeammate === "teammate-builder");
      assert.ok(builderSubtask);
      assert.equal(builderSubtask.recommendedModelTier, "frontier");
      assert.match(builderSubtask.recommendedModel, /Claude Opus 5.5/);

      // Verify GitHub Officer verification task
      const officerSubtask = plan.subtasks.find((s) => s.assignedTeammate === "github-officer");
      assert.ok(officerSubtask);
      assert.equal(officerSubtask.recommendedModelTier, "standard");
      assert.match(officerSubtask.recommendedModel, /Claude Sonnet 5.5/);
    });

    it("identifies governance gates when financial, deployment, or git merge actions are requested", () => {
      const plan = geniusEngine.planDelegation(
        "Deploy billing service update with Stripe payments and merge to main branch"
      );

      assert.ok(plan.estimatedGovernanceGates);
      assert.ok(plan.estimatedGovernanceGates.some((g) => g.includes("FINANCIAL")));
      assert.ok(plan.estimatedGovernanceGates.some((g) => g.includes("GIT_MERGE")));
    });
  });
});
