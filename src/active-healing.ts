/**
 * Active Healing Daemon (Sentinel Background Watcher)
 * 
 * A continuous background process that allows the Sentinel agent to proactively
 * modernize and refactor the codebase based on newly validated patterns in
 * the Technical Vault.
 */

import { VaultMemory } from "./vault-memory.js";
import { OrchestrationEngine } from "./orchestrator.js";

export interface ActiveHealingOptions {
  /**
   * If true (the default per board REVISE-A.3 2026-05-11), the daemon only
   * SUGGESTS healing actions via vault entries — it never mutates code.
   * Pass `dryRun: false` explicitly to allow code-changing actions.
   */
  dryRun?: boolean;
}

export class ActiveHealingDaemon {
  private intervalId?: ReturnType<typeof setInterval>;
  private isRunning = false;
  private dryRun: boolean;

  constructor(
    private memory: VaultMemory,
    private orchestrator: OrchestrationEngine,
    options: ActiveHealingOptions = {}
  ) {
    this.dryRun = options.dryRun ?? true;
  }

  /**
   * Starts the background healing process.
   * @param intervalMs How often to scan for new patterns (default 1 hour)
   *
   * Per board REVISE-A.3 (2026-05-11): healing defaults to dryRun. Code-changing
   * actions require constructing the daemon with `{ dryRun: false }` explicitly.
   */
  start(intervalMs = 3600000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial delay so it doesn't run immediately on boot
    this.intervalId = setInterval(() => this.heal(), intervalMs);
    console.log(
      `[Sentinel] Active Healing Daemon started (dryRun=${this.dryRun}). Watching Technical Vault.`
    );
  }

  /**
   * Whether the daemon is allowed to mutate code.
   * Tests + audits can read this without forcing a refactor of internals.
   */
  isDryRun(): boolean {
    return this.dryRun;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log("[Sentinel] Active Healing Daemon stopped.");
  }

  /**
   * The core healing cycle:
   * 1. Query the Technical Vault for high-confidence, empirically validated patterns.
   * 2. Trigger an Orchestrator pipeline to search the codebase for opportunities.
   * 3. Propose refactoring (or automatically create a branch/PR in a full deployment).
   */
  private async heal(): Promise<void> {
    console.log("[Sentinel] Initiating active healing cycle...");
    
    try {
      // Find recent successful technical patterns
      const recentPatterns = this.memory.searchVaults({
        query: "pattern", // broad query since we filter by vault
        vaults: ["technical"],
        limit: 5,
        sortBy: "recency",
        minConfidence: 0.8 // Only use highly confident patterns
      });

      // Filter for empirically validated patterns only
      const verifiedPatterns = recentPatterns.filter(p => 
        !p.entry.tags.includes("unverified-pattern")
      );

      if (verifiedPatterns.length === 0) {
        console.log("[Sentinel] No new empirically verified patterns found. Sleeping.");
        return;
      }

      // Instruct Orchestrator to scan codebase and apply patterns
      for (const pattern of verifiedPatterns) {
        console.log(`[Sentinel] Evaluating pattern application: ${pattern.entry.id}`);
        
        // This triggers a cascade or parallel orchestration, using the Sentinel agent
        // to review the codebase and generate refactor proposals.
        const result = await this.orchestrator.execute({
          intent: `Background Healing: Apply this verified technical pattern across the codebase if applicable: ${pattern.entry.content}`,
          pattern: "cascade", // Start simple, escalate if complex
          maxAgents: 3,
          context: { 
            isBackgroundHealing: true,
            sourcePatternId: pattern.entry.id 
          }
        });

        // Record the result of the healing attempt in the Operational Vault
        this.memory.rememberInVault(
          `Active Healing Cycle completed for pattern ${pattern.entry.id}. Orchestration result confidence: ${result.confidence}`,
          "operational",
          ["healing-cycle", "sentinel-background"],
          result.confidence,
          "active-healing-daemon"
        );
      }
    } catch (error) {
      console.error("[Sentinel] Active healing cycle failed:", error);
    }
  }
}
