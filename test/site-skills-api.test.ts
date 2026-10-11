/**
 * Starlight Intelligence System — Skill Economy API Endpoint Tests
 *
 * Verifies site/src/app/api/skills/route.ts:
 *   1. GET /api/skills (ecosystem stats, search query, domain filtering)
 *   2. POST /api/skills { action: "value" } (empirical valuation)
 *   3. POST /api/skills { action: "harness" } (10-harness exporter)
 *   4. POST /api/skills { action: "syndicate" } (marketplace packaging & SIP attestation)
 *   5. POST /api/skills { action: "matrix" } (agent-skill context matrix)
 *   6. Error handling (unknown action, invalid payload, unsupported harness)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../site/src/app/api/skills/route.js";

describe("Skill Economy API Endpoint (/api/skills)", () => {
  describe("GET /api/skills", () => {
    it("returns ecosystem overview and default skill sample", async () => {
      const req = new Request("http://localhost:3000/api/skills");
      const res = await GET(req);

      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.ok, true);
      assert.equal(data.ecosystem.registeredAgentsCount, 150);
      assert.equal(data.ecosystem.activeSkillRulesCount, 88);
      assert.equal(data.ecosystem.supportedHarnessesCount, 10);
      assert.equal(data.ecosystem.supportedMarketplacesCount, 5);
      assert.ok(Array.isArray(data.skills));
      assert.ok(data.skills.length >= 5);
    });

    it("filters skills by search query", async () => {
      const req = new Request("http://localhost:3000/api/skills?q=secret");
      const res = await GET(req);

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.ok, true);
      assert.ok(data.skills.length >= 1);
      assert.ok(data.skills.some((s: { name: string }) => s.name.includes("secret-detector")));
    });

    it("filters skills by domain", async () => {
      const req = new Request("http://localhost:3000/api/skills?domain=safety");
      const res = await GET(req);

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.ok, true);
      for (const skill of data.skills) {
        assert.equal(skill.domain, "safety");
      }
    });
  });

  describe("POST /api/skills — action: value", () => {
    it("calculates empirical valuation and returns structured pricing tiers", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "value",
          skill: {
            name: "safety/secret-detector",
            version: "1.0.0",
            description: "Zero-trust PII & credential scrubbing gateway",
            domain: "safety",
            weeklyHoursSaved: 6.5,
            complexityMultiplier: 1.5,
          },
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.ok, true);
      assert.equal(data.action, "value");
      assert.ok(data.report);
      assert.equal(data.report.skillName, "safety/secret-detector");
      assert.equal(data.report.metrics.estimatedWeeklyHoursSaved, 6.5);
      assert.equal(data.report.metrics.executionComplexityMultiplier, 1.5);
      assert.equal(data.report.suggestedPricing.freeCommunityMSRP, 0);
      assert.ok(data.report.suggestedPricing.builderTierMSRP >= 19);
      assert.ok(data.report.suggestedPricing.proTierMSRP >= 49);
      assert.ok(data.report.suggestedPricing.teamTierMonthly >= 99);
      assert.ok(data.report.suggestedPricing.enterpriseAnnual >= 1000);
    });

    it("rejects valuation request when name or description is missing", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "value",
          skill: { domain: "safety" },
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.ok(data.error.includes("Missing required skill fields"));
    });
  });

  describe("POST /api/skills — action: harness", () => {
    it("generates valid harness configuration for claude-code", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "harness",
          harness: "claude-code",
          projectName: "test-intelligence-hub",
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.ok, true);
      assert.equal(data.action, "harness");
      assert.equal(data.config.target, "claude-code");
      assert.equal(data.config.validationStatus, "valid");
      assert.ok(data.config.outputFiles.length > 0);
      assert.ok(data.config.outputFiles.some((f: { relativePath: string }) => f.relativePath.includes(".claude/config.json")));
    });

    it("rejects unsupported harness target", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "harness",
          harness: "unsupported-fake-harness",
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.ok(data.error.includes("Unsupported harness"));
    });
  });

  describe("POST /api/skills — action: syndicate", () => {
    it("syndicates skill with SIP v1.1.1 cryptographic attestation", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "syndicate",
          skill: {
            name: "orchestration/multi-agent-coordination",
            version: "1.0.0",
            description: "Hierarchical swarm routing and consensus loops",
            domain: "orchestration",
          },
          targets: ["starlight", "openclaw"],
          author: "FrankX Mastermind",
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.ok, true);
      assert.equal(data.action, "syndicate");
      assert.equal(data.result.success, true);
      assert.match(data.result.attestationSha, /^[0-9a-f]{64}$/);
      assert.equal(data.result.publishedTargets.length, 2);
      assert.ok(data.result.bundle.exportedFiles.length >= 2);
    });
  });

  describe("POST /api/skills — action: matrix", () => {
    it("resolves multi-agent skill allocation and context headroom", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "matrix",
          agents: ["orchestrator", "prime", "sentinel"],
        }),
      });

      const res = await POST(req);
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.ok, true);
      assert.equal(data.action, "matrix");
      assert.ok(data.matrix.totalRegisteredSkills >= 5);
      assert.equal(data.matrix.overallTokenHealth, "healthy");
      assert.ok(data.matrix.bindings["orchestrator"]);
      assert.ok(data.matrix.bindings["prime"]);
      assert.ok(data.matrix.bindings["sentinel"]);
      assert.ok(data.matrix.bindings["sentinel"].contextHeadroomPercent >= 50);
    });
  });

  describe("POST /api/skills — error handling", () => {
    it("rejects unknown action with status 400", async () => {
      const req = new Request("http://localhost:3000/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "non-existent-action" }),
      });

      const res = await POST(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.ok, false);
      assert.ok(data.error.includes("Unknown action"));
    });
  });
});
