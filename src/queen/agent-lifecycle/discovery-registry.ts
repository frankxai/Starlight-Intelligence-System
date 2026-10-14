/**
 * Starlight Queen — Multi-Provider Agent Discovery Registry
 *
 * Discovers, aggregates, and correlates sessions across all supported
 * terminal agent providers with live OS process trees and protected services.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import type { AgentProvider } from './providers/base.js';
import { CodexProvider } from './providers/codex-provider.js';
import { ClaudeProvider } from './providers/claude-provider.js';
import { OpenCodeProvider } from './providers/opencode-provider.js';
import { GenericProvider } from './providers/generic-provider.js';
import { ProcessTreeManager } from './process-tree.js';
import type {
  ProviderId,
  ProviderCapabilities,
  TerminalSession,
  SessionInventory,
  ProcessNode,
} from './types.js';

export class AgentDiscoveryRegistry {
  private providers = new Map<ProviderId, AgentProvider>();

  constructor() {
    this.registerProvider(new CodexProvider());
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OpenCodeProvider());
    this.registerProvider(new GenericProvider('grok'));
    this.registerProvider(new GenericProvider('hermes'));
    this.registerProvider(new GenericProvider('antigravity'));
  }

  public registerProvider(provider: AgentProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  public getProvider(id: ProviderId): AgentProvider | undefined {
    return this.providers.get(id);
  }

  public getProviderCapabilities(): Record<string, ProviderCapabilities> {
    const caps: Record<string, ProviderCapabilities> = {};
    for (const [id, p] of this.providers.entries()) {
      caps[id] = p.capabilities;
    }
    return caps;
  }

  /**
   * Generates a complete inventory of all discoverable sessions across all providers.
   */
  public async getInventory(options?: {
    toolPlanePorts?: number[];
    filterHarness?: ProviderId;
  }): Promise<{
    inventory: SessionInventory;
    processes: Map<number, ProcessNode>;
    protectedPids: Set<number>;
  }> {
    const { processes, protectedPids } = ProcessTreeManager.queryProcessTree({
      toolPlanePorts: options?.toolPlanePorts,
    });

    const allSessions: TerminalSession[] = [];
    const providersToScan = options?.filterHarness
      ? [this.providers.get(options.filterHarness)!].filter(Boolean)
      : Array.from(this.providers.values());

    for (const provider of providersToScan) {
      try {
        const found = await provider.discoverSessions(processes);
        for (const s of found) {
          // Attach full process tree if session has an associated PID
          if (s.pid && processes.has(s.pid)) {
            const rootNode = processes.get(s.pid)!;
            const descendantsPids = ProcessTreeManager.getDescendants(s.pid, processes);
            const treeNodes = [rootNode];
            for (const dp of descendantsPids) {
              const child = processes.get(dp);
              if (child) treeNodes.push(child);
            }
            s.processTree = treeNodes;
          }
          allSessions.push(s);
        }
      } catch {
        // Continue scanning other providers if one fails
      }
    }

    let activeCount = 0;
    let idleCount = 0;
    let stoppedCount = 0;

    for (const s of allSessions) {
      if (s.status === 'active') activeCount++;
      else if (s.status === 'idle') idleCount++;
      else stoppedCount++;
    }

    const inventory: SessionInventory = {
      sampledAt: new Date().toISOString(),
      totalSessions: allSessions.length,
      activeSessions: activeCount,
      idleSessions: idleCount,
      stoppedSessions: stoppedCount,
      protectedPids: Array.from(protectedPids),
      sessions: allSessions,
      providerCapabilities: this.getProviderCapabilities(),
    };

    return { inventory, processes, protectedPids };
  }

  /**
   * Deterministically finds a session by ID or exact prefix.
   * Never guesses if the identifier is ambiguous.
   */
  public async findSession(
    sessionIdOrPrefix: string,
    options?: { toolPlanePorts?: number[] }
  ): Promise<{
    session: TerminalSession;
    provider: AgentProvider;
    processes: Map<number, ProcessNode>;
    protectedPids: Set<number>;
  }> {
    const cleanId = sessionIdOrPrefix.trim().toLowerCase();
    const { inventory, processes, protectedPids } = await this.getInventory(options);

    const matches = inventory.sessions.filter(
      (s) => s.id.toLowerCase() === cleanId || s.id.toLowerCase().startsWith(cleanId)
    );

    if (matches.length === 0) {
      throw new Error(`No session found matching identifier or prefix "${sessionIdOrPrefix}".`);
    }

    if (matches.length > 1) {
      const matchSummary = matches.map((m) => `  - [${m.provider}] ${m.id} (${m.title || 'untitled'})`).join('\n');
      throw new Error(
        `AMBIGUOUS TARGETING: Multiple sessions match prefix "${sessionIdOrPrefix}":\n${matchSummary}\nSpecify the full session ID.`
      );
    }

    const session = matches[0];
    const provider = this.providers.get(session.provider);
    if (!provider) {
      throw new Error(`Provider "${session.provider}" not registered in Queen control plane.`);
    }

    return { session, provider, processes, protectedPids };
  }
}
