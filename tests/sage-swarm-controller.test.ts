/**
 * SAGE Swarm Controller & Japanese Swarm Test Suite
 */

import { SageSwarmController } from "../src/orchestration/sage-swarm-controller.js";

async function runTestSuite() {
  console.log("=== Starlight Blitzscaling Swarm Test Suite ===");
  const controller = new SageSwarmController();

  // Test 1: Japanese Swarm Bilingual Routing
  console.log("\n[Test 1] Testing Japanese Swarm Routing...");
  const jpTask = controller.spawnSwarmTask(
    "東京AIスタートアップ動向調査",
    "最新の日本語LLMおよびSakana AIの進化動向を調査せよ",
    ["starlight-architect", "starlight-sage", "starlight-navigator"]
  );
  console.log(`Task Created: ${jpTask.id}`);
  console.log(`Assigned House: ${jpTask.house}`);
  console.log(`Is Bilingual: ${jpTask.isBilingualJa}`);
  console.log(`Assigned Agents: ${jpTask.assignedAgents.join(", ")}`);
  if (!jpTask.isBilingualJa || !jpTask.assignedAgents.includes("starlight-japanese-swarm")) {
    throw new Error("Failed Japanese Swarm bilingual assignment");
  }
  console.log("✓ Test 1 Passed.");

  // Test 2: 12-House Partitioning Routing
  console.log("\n[Test 2] Testing 12-House Partitioning Routing...");
  const queries = [
    { q: "Suno prompt engineering and orchestral mixing", expected: "House of Music & Acoustics" },
    { q: "Crypto treasury allocation and wealth DPI", expected: "House of Wealth & Capital" },
    { q: "Longevity protocols and deep sleep biometrics", expected: "House of Health & Life" },
    { q: "Orbital satellite telemetry trajectory", expected: "House of Space & Orbit" },
    { q: "Ocean depth sonobuoy sensor array", expected: "House of Marine & Depths" },
    { q: "Next.js 16 compiler optimization", expected: "House of Code & Systems" }
  ];

  for (const { q, expected } of queries) {
    const house = controller.routeTaskToHouse(q);
    console.log(`Query: "${q}" -> ${house}`);
    if (house !== expected) {
      throw new Error(`House routing mismatch: expected ${expected}, got ${house}`);
    }
  }
  console.log("✓ Test 2 Passed.");

  // Test 3: SAGE Consensus & Sentinel Validation
  console.log("\n[Test 3] Testing Sentinel Consensus & Sizing Rules...");
  const consensus = controller.evaluateConsensus(jpTask.id, [0.95, 0.92, 0.90, 0.96]);
  console.log(`Consensus Score: ${consensus.consensusScore}`);
  console.log(`Sentinel Verdict: ${consensus.verdict}`);
  console.log(`Passed Sentinel: ${consensus.passedSentinel}`);
  if (consensus.verdict !== "PROCEED" || !consensus.passedSentinel) {
    throw new Error("Sentinel evaluation failed unexpectedly");
  }
  console.log("✓ Test 3 Passed.");

  console.log("\n=== ALL SAGE SWARM & JAPANESE TESTS PASSED (3/3) ===");
}

runTestSuite().catch(err => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
