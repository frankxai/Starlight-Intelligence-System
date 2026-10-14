/**
 * Starlight Queen — OpenCode Provider Adapter
 *
 * Implements session discovery and transcript reading from OpenCode's
 * local SQLite database (~/.local/share/opencode/opencode.db).
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import type { AgentProvider } from './base.js';
import type {
  ProviderId,
  ProviderCapabilities,
  TerminalSession,
  CapturedPromptOutput,
  ProcessNode,
} from '../types.js';

export class OpenCodeProvider implements AgentProvider {
  public readonly providerId: ProviderId = 'opencode';
  public readonly capabilities: ProviderCapabilities = {
    visible: true,
    transcriptReadable: true,
    gracefulStopSupported: true,
    forceTerminationSupported: true,
    notes: 'Direct read-only SQLite access to ~/.local/share/opencode/opencode.db.',
  };

  private dbPath: string;

  constructor(customDbPath?: string) {
    this.dbPath = customDbPath || join(homedir(), '.local', 'share', 'opencode', 'opencode.db');
  }

  public async discoverSessions(processes: Map<number, ProcessNode>): Promise<TerminalSession[]> {
    const sessions: TerminalSession[] = [];
    if (!existsSync(this.dbPath)) return sessions;

    const opencodePids: number[] = [];
    for (const [pid, proc] of processes.entries()) {
      if (proc.name.toLowerCase().includes('opencode') && !proc.isProtected) {
        opencodePids.push(pid);
      }
    }

    try {
      const db = new DatabaseSync(this.dbPath, { readOnly: true });
      const rows = db
        .prepare('SELECT id, title, directory, time_created, time_updated FROM session ORDER BY time_updated DESC LIMIT 50')
        .all() as any[];

      for (const row of rows) {
        const isRunning = opencodePids.length > 0;
        sessions.push({
          id: String(row.id),
          provider: 'opencode',
          title: String(row.title || 'OpenCode Session'),
          pid: isRunning ? opencodePids[0] : undefined,
          repoRoot: row.directory ? String(row.directory) : undefined,
          worktree: row.directory ? String(row.directory) : undefined,
          status: isRunning ? 'active' : 'idle',
          lastSeen: row.time_updated ? new Date(Number(row.time_updated)).toISOString() : new Date().toISOString(),
          transcriptPath: this.dbPath,
          capabilities: this.capabilities,
        });
      }
    } catch {}

    return sessions;
  }

  public async captureSession(sessionId: string): Promise<CapturedPromptOutput> {
    const now = new Date().toISOString();
    const userPrompts: Array<{ timestamp?: string; text: string; source: string }> = [];
    const assistantResponses: Array<{ timestamp?: string; text: string }> = [];
    let repoRoot: string | undefined;
    let title: string | undefined;
    const changedFiles: string[] = [];
    const missingFields: string[] = [];

    if (!existsSync(this.dbPath)) {
      return {
        sessionId,
        provider: 'opencode',
        userPrompts: [],
        assistantResponses: [],
        toolSummaries: [],
        changedFiles: [],
        testsBuildsRun: [],
        pendingWork: [],
        blockers: [],
        resumeInstructions: `OpenCode database not found at ${this.dbPath}`,
        captureStatus: 'partial',
        missingFields: ['OpenCode database missing'],
        provenance: {
          provider: 'opencode',
          sessionId,
          capturedAt: now,
          transcriptionQuality: 'metadata_only',
        },
      };
    }

    try {
      const db = new DatabaseSync(this.dbPath, { readOnly: true });
      const sessionRow = db
        .prepare('SELECT title, directory, summary_diffs FROM session WHERE id = ?')
        .get(sessionId) as any;

      if (sessionRow) {
        title = sessionRow.title;
        repoRoot = sessionRow.directory;
      }

      // Query parts for user/assistant messages
      const parts = db
        .prepare('SELECT time_created, data FROM part WHERE session_id = ? ORDER BY time_created ASC')
        .all(sessionId) as any[];

      for (const p of parts) {
        try {
          const data = JSON.parse(p.data);
          const timeStr = p.time_created ? new Date(Number(p.time_created)).toISOString() : undefined;
          if (data.type === 'user_message' || data.role === 'user') {
            userPrompts.push({
              timestamp: timeStr,
              text: data.text || data.content || JSON.stringify(data),
              source: 'opencode_db_part',
            });
          } else if (data.type === 'assistant_message' || data.role === 'assistant') {
            assistantResponses.push({
              timestamp: timeStr,
              text: data.text || data.content || JSON.stringify(data),
            });
          }
        } catch {}
      }
    } catch (err: any) {
      missingFields.push(`Database query error: ${err.message}`);
    }

    const quality = userPrompts.length > 0 ? 'native_full' : 'metadata_only';

    return {
      sessionId,
      provider: 'opencode',
      title,
      repoRoot,
      worktree: repoRoot,
      userPrompts,
      assistantResponses,
      toolSummaries: [],
      changedFiles,
      testsBuildsRun: [],
      pendingWork: [],
      blockers: [],
      resumeInstructions: `To resume this OpenCode session:\n1. CD to: ${repoRoot || 'Estate root'}\n2. Run: opencode --session ${sessionId}`,
      captureStatus: quality === 'native_full' ? 'complete' : 'partial',
      missingFields,
      provenance: {
        provider: 'opencode',
        sessionId,
        sourcePath: this.dbPath,
        capturedAt: now,
        transcriptionQuality: quality,
      },
    };
  }

  public generateResumeInstructions(session: TerminalSession, capture: CapturedPromptOutput): string {
    const root = session.repoRoot || capture.repoRoot || 'Estate root';
    return `### Resumption Instructions for OpenCode Session [${session.id}]
- **Target Repository**: \`${root}\`
- **Continuation Command**:
  \`\`\`powershell
  Set-Location "${root}"
  opencode --session ${session.id}
  \`\`\`
`;
  }
}
