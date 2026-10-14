/**
 * Starlight Queen — Terminal Agent Lifecycle Manager
 *
 * Provides top-level operations: inspect, save, stop, and resume.
 * Enforces explicit targeting, safe dry-run previews, dynamic service shielding,
 * and durable, repo-aware handovers.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { AgentDiscoveryRegistry } from './discovery-registry.js';
import { HandoverWriter } from './handover-writer.js';
import { ProcessTreeManager } from './process-tree.js';
import type {
  SessionInventory,
  HandoverDocument,
  StopOptions,
  StopPlan,
  StopResult,
  TerminalSession,
  ProviderId,
} from './types.js';

export interface InspectOptions {
  harness?: ProviderId;
  json?: boolean;
}

export interface SaveOptions {
  out?: string;
  syncIssue?: number | string;
}

export class AgentLifecycleManager {
  private registry: AgentDiscoveryRegistry;
  private writer: HandoverWriter;

  constructor(customRegistry?: AgentDiscoveryRegistry, customWriter?: HandoverWriter) {
    this.registry = customRegistry || new AgentDiscoveryRegistry();
    this.writer = customWriter || new HandoverWriter();
  }

  /**
   * Inspects and returns the inventory of all discoverable agent sessions.
   */
  public async inspect(options: InspectOptions = {}): Promise<SessionInventory> {
    const { inventory } = await this.registry.getInventory({
      filterHarness: options.harness,
    });
    return inventory;
  }

  /**
   * Captures prompt/output history and writes a durable, secret-redacted handover.
   */
  public async save(sessionIdOrPrefix: string, options: SaveOptions = {}): Promise<HandoverDocument> {
    if (!sessionIdOrPrefix || sessionIdOrPrefix.trim().length === 0) {
      throw new Error('Save requires an explicit session ID or unique prefix. Never save without an explicit target.');
    }

    const { session, provider } = await this.registry.findSession(sessionIdOrPrefix);
    const capture = await provider.captureSession(session.id);
    const doc = this.writer.writeHandover(session, capture, {
      customOutPath: options.out,
      syncIssue: options.syncIssue,
    });
    return doc;
  }

  /**
   * Safely stops a targeted session. Dry-run by default unless explicitly executed.
   */
  public async stop(
    sessionIdOrPrefix: string,
    options: StopOptions = { dryRun: true }
  ): Promise<{ plan: StopPlan; result?: StopResult }> {
    if (!sessionIdOrPrefix || sessionIdOrPrefix.trim().length === 0) {
      throw new Error('Stop requires an explicit session ID or unique prefix. Never guess which session to stop.');
    }

    const { session, processes, protectedPids } = await this.registry.findSession(sessionIdOrPrefix);

    if (!session.pid || !processes.has(session.pid)) {
      // Session has no active process
      const plan: StopPlan = {
        targetSessionId: session.id,
        provider: session.provider,
        targetPids: [],
        protectedPidsShielded: [],
        ancestorPidsPreserved: [],
        commandLines: [],
        gracefulMethod: 'wm_close',
        forceRequired: false,
        isDryRun: options.dryRun === true,
        authorized: true,
        rationale: `Session ${session.id} has status "${session.status}" and no active PID in process table. No action taken.`,
      };
      const result: StopResult = {
        success: true,
        targetSessionId: session.id,
        stoppedPids: [],
        remainingPids: [],
        methodUsed: 'none_already_stopped',
        durationMs: 0,
      };
      return { plan, result };
    }

    // Build audited stop plan
    const plan = ProcessTreeManager.createStopPlan(
      session.id,
      session.provider,
      session.pid,
      processes,
      protectedPids,
      options
    );

    if (options.dryRun) {
      return { plan };
    }

    // Execute stop plan
    const result = ProcessTreeManager.executeStop(plan, options.timeoutMs ?? 3000);
    return { plan, result };
  }

  /**
   * Generates resumption instructions and Claude continuation prompt for a session.
   */
  public async resume(sessionIdOrPrefix: string): Promise<{
    session: TerminalSession;
    instructions: string;
    claudeContinuationPrompt: string;
  }> {
    if (!sessionIdOrPrefix || sessionIdOrPrefix.trim().length === 0) {
      throw new Error('Resume requires an explicit session ID or unique prefix.');
    }

    const { session, provider } = await this.registry.findSession(sessionIdOrPrefix);
    const capture = await provider.captureSession(session.id);
    const instructions = provider.generateResumeInstructions(session, capture);
    const claudeContinuationPrompt = this.writer.generateClaudeContinuationPrompt(session, capture);

    return { session, instructions, claudeContinuationPrompt };
  }
}
