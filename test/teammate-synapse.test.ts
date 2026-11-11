/**
 * Starlight Teammate Synapse & Sovereign Memory Bridge Tests
 *
 * Tests:
 *   - Teammate task dispatches recorded into operational.jsonl
 *   - Code artifacts detected and recorded into technical.jsonl
 *   - Model attribution, duration, token cost, and SIP provenance
 *   - Governance approval gate recording
 *   - Vault coherence validation (coherent, degraded, empty)
 *   - TeammateDaemon sweeps, heartbeat telemetry, and lifecycle
 *   - Integration with StarlightTeammatesEngine
 *
 * Attestation: Built on SIP § 3 — Teammates Synapse Test Suite
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  TeammateSynapse,
  TeammateDaemon,
  resolveModelAttribution,
} from "../src/orchestration/teammate-synapse.js";
import { StarlightTeammatesEngine } from "../src/orchestration/teammates-engine.js";

describe("Starlight Teammate Synapse & Sovereign Memory Bridge", () => {
  let tempDir: string;
  let opVaultPath: string;
  let techVaultPath: string;
  let homeDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "synapse-test-"));
    opVaultPath = join(tempDir, "operational.jsonl");
    techVaultPath = join(tempDir, "technical.jsonl");
    homeDir = join(tempDir, ".starlight");
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup failure in test
    }
  });

  describe("Model Attribution Resolver", () => {
    it("correctly maps provider models to human-readable frontier labels", () => {
      assert.equal(resolveModelAttribution("claude-sonnet-5-5"), "Claude Sonnet 5.5");
      assert.equal(resolveModelAttribution("claude-opus-5-5"), "Claude Opus 5.5");
      assert.equal(resolveModelAttribution("gemini-4-argon"), "Gemini 4 Argon");
      assert.equal(resolveModelAttribution("gemini-4-flash"), "Gemini 4 Flash");
      assert.equal(resolveModelAttribution("gpt-6-1-sol"), "GPT-6.1 Sol");
      assert.equal(resolveModelAttribution("gpt-6-astra"), "GPT-6 Astra");
      assert.equal(resolveModelAttribution("glm-5-3"), "GLM 5.3");
    });
  });

  describe("TeammateSynapse Vault Bridge", () => {
    it("records a non-code task dispatch into operational.jsonl with SIP provenance", async () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      const dispatchResult = {
        messageId: "msg-1",
        teammateId: "search-manager",
        modelUsed: "gemini-4-argon",
        tierUsed: "light" as const,
        content: "Completed: Market analysis finished cleanly with 0 anomalies.",
        timestamp: "Just now",
        executionTree: [
          {
            id: "step-1",
            summary: "Executed intelligence search",
            durationMs: 140,
            status: "success" as const,
          },
        ],
        usage: {
          promptTokens: 50,
          completionTokens: 25,
          totalTokens: 75,
          estimatedCostUsd: 0.0001,
        },
      };

      const { operationalReceipt, technicalReceipt } = await synapse.recordDispatch(
        dispatchResult,
        "Analyze competitor pricing"
      );

      assert.ok(operationalReceipt);
      assert.equal(technicalReceipt, undefined);
      assert.equal(operationalReceipt.vault, "operational");
      assert.equal(operationalReceipt.type, "teammate_dispatch_receipt");
      assert.equal(operationalReceipt.attestation, "Built on SIP");
      assert.equal(operationalReceipt.teammateId, "search-manager");
      assert.equal(operationalReceipt.modelAttribution, "Gemini 4 Argon");
      assert.equal(operationalReceipt.durationMs, 140);
      assert.equal(operationalReceipt.tokenCostUsd, 0.0001);
      assert.equal(operationalReceipt.status, "success");

      // Verify physical file on disk
      assert.ok(existsSync(opVaultPath));
      const lines = readFileSync(opVaultPath, "utf8").trim().split("\n");
      assert.equal(lines.length, 1);
      const parsed = JSON.parse(lines[0]);
      assert.equal(parsed.id, operationalReceipt.id);
      assert.equal(parsed.modelAttribution, "Gemini 4 Argon");
    });

    it("automatically detects code blocks and records to both operational and technical vaults", async () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      const codeContent = `Here is the requested implementation:\n\`\`\`typescript\nexport function calculateDpi(assets: number): number {\n  return assets * 1.5;\n}\n\`\`\``;

      const dispatchResult = {
        messageId: "msg-2",
        teammateId: "teammate-builder",
        modelUsed: "claude-sonnet-5-5",
        tierUsed: "standard" as const,
        content: codeContent,
        timestamp: "Just now",
        executionTree: [
          {
            id: "step-1",
            summary: "Generated TypeScript function",
            durationMs: 320,
            status: "success" as const,
          },
        ],
        usage: {
          promptTokens: 80,
          completionTokens: 60,
          totalTokens: 140,
          estimatedCostUsd: 0.00114,
        },
      };

      const { operationalReceipt, technicalReceipt } = await synapse.recordDispatch(
        dispatchResult,
        "Write calculateDpi function"
      );

      assert.ok(operationalReceipt);
      assert.ok(technicalReceipt);

      // Verify operational entry
      assert.equal(operationalReceipt.vault, "operational");
      assert.equal(operationalReceipt.modelAttribution, "Claude Sonnet 5.5");

      // Verify technical entry
      assert.equal(technicalReceipt.vault, "technical");
      assert.equal(technicalReceipt.type, "teammate_code_artifact");
      assert.equal(technicalReceipt.language, "typescript");
      assert.ok(technicalReceipt.codeSnippet.includes("export function calculateDpi"));
      assert.equal(technicalReceipt.modelAttribution, "Claude Sonnet 5.5");
      assert.equal(technicalReceipt.tokenCostUsd, 0.00114);

      // Check physical files on disk
      assert.ok(existsSync(opVaultPath));
      assert.ok(existsSync(techVaultPath));

      const techLines = readFileSync(techVaultPath, "utf8").trim().split("\n");
      assert.equal(techLines.length, 1);
      const parsedTech = JSON.parse(techLines[0]);
      assert.equal(parsedTech.id, technicalReceipt.id);
      assert.equal(parsedTech.language, "typescript");
    });

    it("records governance gate approvals into operational.jsonl", () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      const gate = {
        id: "gate-1234",
        type: "FINANCIAL" as const,
        title: "Approve $500 transfer to Cloudflare",
        description: "Payment authorization for edge worker bandwidth",
        consequences: "Deducts from operational treasury",
        status: "approved" as const,
      };

      const receipt = synapse.recordGovernanceApproval(gate, "approved", "frank");
      assert.equal(receipt.vault, "operational");
      assert.equal(receipt.type, "teammate_governance_receipt");
      assert.equal(receipt.governanceGate?.id, "gate-1234");
      assert.equal(receipt.governanceGate?.status, "approved");

      const lines = readFileSync(opVaultPath, "utf8").trim().split("\n");
      assert.equal(lines.length, 1);
      const parsed = JSON.parse(lines[0]);
      assert.equal(parsed.governanceGate.id, "gate-1234");
    });

    it("correctly evaluates vault coherence across valid and corrupted entries", () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      // Initially empty
      const emptyReport = synapse.checkVaultCoherence();
      assert.equal(emptyReport.status, "empty");

      // Write valid entries
      writeFileSync(
        opVaultPath,
        JSON.stringify({
          id: "entry-1",
          timestamp: new Date().toISOString(),
          vault: "operational",
          content: "valid entry",
        }) + "\n"
      );

      const coherentReport = synapse.checkVaultCoherence();
      assert.equal(coherentReport.status, "coherent");
      assert.equal(coherentReport.operationalEntriesCount, 1);
      assert.equal(coherentReport.errors.length, 0);

      // Append corrupted line
      writeFileSync(opVaultPath, "CORRUPTED_NON_JSON_LINE\n", { flag: "a" });
      const degradedReport = synapse.checkVaultCoherence();
      assert.equal(degradedReport.status, "degraded");
      assert.ok(degradedReport.errors.length > 0);
    });
  });

  describe("TeammateDaemon Controller", () => {
    it("sweeps pending governance gates and writes heartbeat status", async () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      const daemon = new TeammateDaemon(synapse, {
        starlightHome: homeDir,
        intervalSec: 5,
      });

      // Seed a pending approval
      const approvalsPath = daemon.getApprovalsPath();
      const mockApprovals = [
        {
          id: "gate-abc",
          type: "GIT_MERGE",
          title: "Merge PR #42 to main",
          description: "Staged deployment",
          consequences: "Triggers production deploy",
          status: "pending",
        },
      ];
      const { mkdirSync } = await import("node:fs");
      const { dirname } = await import("node:path");
      mkdirSync(dirname(approvalsPath), { recursive: true });
      writeFileSync(approvalsPath, JSON.stringify(mockApprovals, null, 2), "utf8");

      // Run single sweep
      const status = await daemon.runDaemon({ once: true });

      assert.ok(status.daemonId.startsWith("daemon-"));
      assert.equal(status.status, "healthy");
      assert.equal(status.pendingApprovalsCount, 1);
      assert.equal(status.pendingApprovals[0].id, "gate-abc");
      assert.ok(status.lastSweep.actionsTaken.length >= 2);

      // Verify daemon-status.json written to disk
      assert.ok(existsSync(daemon.getStatusPath()));
      const fileData = JSON.parse(readFileSync(daemon.getStatusPath(), "utf8"));
      assert.equal(fileData.daemonId, status.daemonId);
      assert.equal(fileData.pendingApprovalsCount, 1);
    });

    it("runs periodic daemon loop and stops cleanly", async () => {
      const synapse = new TeammateSynapse({
        operationalVaultPath: opVaultPath,
        technicalVaultPath: techVaultPath,
      });

      let sweepsLogged = 0;
      const daemon = new TeammateDaemon(synapse, {
        starlightHome: homeDir,
        intervalSec: 1,
      });

      const initialStatus = await daemon.runDaemon({
        intervalSec: 1,
        once: false,
        onSweep: () => {
          sweepsLogged++;
        },
      });

      assert.ok(initialStatus);
      assert.equal(sweepsLogged, 1);

      daemon.stopDaemon();
      const stoppedStatus = daemon.getLastStatus();
      assert.equal(stoppedStatus?.status, "stopped");
    });
  });

  describe("TeammatesEngine Integration", () => {
    it("automatically bridges dispatch outcomes into the memory vaults", async () => {
      const engine = new StarlightTeammatesEngine();

      // Dispatch a non-financial task
      const result = await engine.dispatch(
        "search-manager",
        "Summarize recent updates in agent swarm architectures"
      );

      assert.equal(result.teammateId, "search-manager");
      assert.ok(result.executionTree.length > 0);

      // Verify the global synapse recorded the entry
      const { teammateSynapse } = await import("../src/orchestration/teammate-synapse.js");
      const coherence = teammateSynapse.checkVaultCoherence();
      assert.equal(coherence.status, "coherent");
      assert.ok(coherence.operationalEntriesCount > 0);
    });

    it("bridges governance halts and subsequent approvals", async () => {
      const engine = new StarlightTeammatesEngine();

      // Trigger a financial gate
      const result = await engine.dispatch(
        "starlight-queen",
        "Authorize transfer of $1000 for cloud computing"
      );

      assert.ok(result.approvalRequest);
      assert.equal(result.approvalRequest.type, "FINANCIAL");

      // Resolve the approval
      const resolved = engine.resolveApproval(result.approvalRequest.id, true);
      assert.equal(resolved.status, "approved");
    });
  });
});
