/**
 * Starlight Queen — Generic or emerging agent provider adapter
 *
 * Provides lifecycle discovery, process tracking, and safe termination
 * for Grok, Hermes, Antigravity, and generic terminal CLI harnesses.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import type { AgentProvider } from './base.js';
import type {
  ProviderId,
  ProviderCapabilities,
  TerminalSession,
  CapturedPromptOutput,
  ProcessNode,
} from '../types.js';

export class GenericProvider implements AgentProvider {
  public readonly providerId: ProviderId;
  public readonly capabilities: ProviderCapabilities;

  constructor(providerId: ProviderId = 'generic', capabilities?: Partial<ProviderCapabilities>) {
    this.providerId = providerId;
    this.capabilities = {
      visible: true,
      transcriptReadable: capabilities?.transcriptReadable ?? false,
      gracefulStopSupported: capabilities?.gracefulStopSupported ?? true,
      forceTerminationSupported: capabilities?.forceTerminationSupported ?? true,
      notes: capabilities?.notes ?? `Generic terminal harness adapter for ${providerId}. Process-visible with targeted stop support.`,
    };
  }

  public async discoverSessions(processes: Map<number, ProcessNode>): Promise<TerminalSession[]> {
    const sessions: TerminalSession[] = [];
    const targetName = this.providerId.toLowerCase();

    for (const [pid, proc] of processes.entries()) {
      if (proc.name.toLowerCase().includes(targetName) && !proc.isProtected) {
        sessions.push({
          id: `${this.providerId}-${pid}`,
          provider: this.providerId,
          title: `Active ${this.providerId} process (PID ${pid})`,
          pid,
          status: 'active',
          lastSeen: proc.creationDate || new Date().toISOString(),
          capabilities: this.capabilities,
          metadata: {
            commandLine: proc.commandLine,
          },
        });
      }
    }

    return sessions;
  }

  public async captureSession(sessionId: string): Promise<CapturedPromptOutput> {
    const now = new Date().toISOString();
    return {
      sessionId,
      provider: this.providerId,
      userPrompts: [],
      assistantResponses: [],
      toolSummaries: [],
      changedFiles: [],
      testsBuildsRun: [],
      pendingWork: [],
      blockers: [],
      resumeInstructions: `Native transcript capture not exposed for ${this.providerId}. Resume manually in terminal.`,
      captureStatus: 'partial',
      missingFields: ['Transcript extraction not supported by provider API'],
      provenance: {
        provider: this.providerId,
        sessionId,
        capturedAt: now,
        transcriptionQuality: 'metadata_only',
      },
    };
  }

  public generateResumeInstructions(session: TerminalSession, _capture: CapturedPromptOutput): string {
    return `### Resumption Instructions for ${this.providerId} Session [${session.id}]
- **Status**: Process-level tracking only.
- **Resume**: Re-open terminal session for ${this.providerId}.
`;
  }
}
