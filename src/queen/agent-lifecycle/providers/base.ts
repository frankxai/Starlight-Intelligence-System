/**
 * Starlight Queen — Agent Provider Base Interface
 *
 * Defines the contract for all terminal agent providers (Codex, Claude, OpenCode, etc.)
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import type {
  ProviderId,
  ProviderCapabilities,
  TerminalSession,
  CapturedPromptOutput,
  ProcessNode,
} from '../types.js';

export interface AgentProvider {
  readonly providerId: ProviderId;
  readonly capabilities: ProviderCapabilities;

  /**
   * Discovers sessions belonging to this provider from local disks, config files,
   * databases, and correlates with active OS processes.
   */
  discoverSessions(processes: Map<number, ProcessNode>): Promise<TerminalSession[]>;

  /**
   * Captures the full user prompts, assistant outputs, tool calls, and workspace context
   * for a given session ID. Handles locked transcripts gracefully.
   */
  captureSession(sessionId: string): Promise<CapturedPromptOutput>;

  /**
   * Generates reliable, self-contained resumption instructions for continuation by
   * Claude Code, Codex, or another terminal harness.
   */
  generateResumeInstructions(session: TerminalSession, capture: CapturedPromptOutput): string;
}
