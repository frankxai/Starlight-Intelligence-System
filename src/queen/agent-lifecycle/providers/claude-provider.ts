/**
 * Starlight Queen — Claude Code Provider Adapter
 *
 * Implements session discovery, process correlation via --session-id,
 * transcript parsing, and safe lifecycle management for Claude Code sessions.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import type { AgentProvider } from './base.js';
import type {
  ProviderId,
  ProviderCapabilities,
  TerminalSession,
  CapturedPromptOutput,
  ProcessNode,
  ToolCallSummary,
} from '../types.js';

export class ClaudeProvider implements AgentProvider {
  public readonly providerId: ProviderId = 'claude';
  public readonly capabilities: ProviderCapabilities = {
    visible: true,
    transcriptReadable: true,
    gracefulStopSupported: true,
    forceTerminationSupported: true,
    notes: 'Exposes exact session ID in process command line (--session-id <uuid>). Transcripts stored in ~/.claude/projects/.',
  };

  private claudeHome: string;

  constructor(customClaudeHome?: string) {
    this.claudeHome = customClaudeHome || join(homedir(), '.claude');
  }

  public async discoverSessions(processes: Map<number, ProcessNode>): Promise<TerminalSession[]> {
    const sessions: TerminalSession[] = [];
    const activePidBySessionId = new Map<string, number>();

    // 1. Scan running processes for claude session IDs
    for (const [pid, proc] of processes.entries()) {
      if (proc.name.toLowerCase().includes('claude') && !proc.isProtected) {
        const match = proc.commandLine.match(/--session-id\s+([a-f0-9-]{36})/i);
        if (match) {
          activePidBySessionId.set(match[1], pid);
        }
      }
    }

    // 2. Read history.jsonl to discover recent sessions, prompts, and project paths
    const historyFile = join(this.claudeHome, 'history.jsonl');
    const seenSessions = new Map<
      string,
      {
        lastPrompt: string;
        project?: string;
        timestamp: number;
        promptCount: number;
      }
    >();

    if (existsSync(historyFile)) {
      try {
        const content = readFileSync(historyFile, 'utf8');
        const lines = content.split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            const sid = entry.sessionId;
            if (!sid) continue;

            const existing = seenSessions.get(sid);
            if (existing) {
              existing.promptCount++;
              if (entry.timestamp && entry.timestamp > existing.timestamp) {
                existing.timestamp = entry.timestamp;
                existing.lastPrompt = entry.display || existing.lastPrompt;
                if (entry.project) existing.project = entry.project;
              }
            } else {
              seenSessions.set(sid, {
                lastPrompt: entry.display || 'Claude Code prompt',
                project: entry.project,
                timestamp: entry.timestamp || Date.now(),
                promptCount: 1,
              });
            }
          } catch {}
        }
      } catch {}
    }

    // 3. Assemble TerminalSession records
    for (const [sid, info] of seenSessions.entries()) {
      const activePid = activePidBySessionId.get(sid);
      const isRunning = activePid !== undefined;
      const transcriptPath = this.findTranscriptPath(sid);

      sessions.push({
        id: sid,
        provider: 'claude',
        title: info.lastPrompt.slice(0, 60),
        pid: activePid,
        repoRoot: info.project,
        worktree: info.project,
        status: isRunning ? 'active' : 'idle',
        lastSeen: new Date(info.timestamp).toISOString(),
        transcriptPath,
        capabilities: this.capabilities,
        promptCount: info.promptCount,
        metadata: {
          hasActiveProcess: isRunning,
        },
      });
    }

    // Also include any active process session not yet in history
    for (const [sid, pid] of activePidBySessionId.entries()) {
      if (!seenSessions.has(sid)) {
        sessions.unshift({
          id: sid,
          provider: 'claude',
          title: 'Active Claude Code Session',
          pid,
          status: 'active',
          lastSeen: new Date().toISOString(),
          transcriptPath: this.findTranscriptPath(sid),
          capabilities: this.capabilities,
          metadata: { hasActiveProcess: true },
        });
      }
    }

    return sessions;
  }

  public async captureSession(sessionId: string): Promise<CapturedPromptOutput> {
    const now = new Date().toISOString();
    const userPrompts: Array<{ timestamp?: string; text: string; source: string }> = [];
    const assistantResponses: Array<{ timestamp?: string; text: string }> = [];
    const toolSummariesMap = new Map<string, { count: number; actions: Set<string> }>();
    const changedFiles = new Set<string>();
    const testsBuildsRun: string[] = [];
    let repoRoot: string | undefined;
    let branch: string | undefined;
    let transcriptPath: string | undefined;
    let sourceSha256: string | undefined;
    let quality: 'native_full' | 'history_fallback' | 'metadata_only' = 'metadata_only';
    const missingFields: string[] = [];

    // 1. Search for transcript file in ~/.claude/projects/*/<sessionId>.jsonl
    transcriptPath = this.findTranscriptPath(sessionId);

    if (transcriptPath && existsSync(transcriptPath)) {
      try {
        const content = readFileSync(transcriptPath, 'utf8');
        sourceSha256 = createHash('sha256').update(content).digest('hex');
        const lines = content.split(/\r?\n/).filter(Boolean);

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);

            if (entry.cwd && !repoRoot) repoRoot = entry.cwd;
            if (entry.gitBranch && !branch) branch = entry.gitBranch;

            if (entry.type === 'user' && entry.message?.content) {
              const text = typeof entry.message.content === 'string'
                ? entry.message.content
                : JSON.stringify(entry.message.content);
              userPrompts.push({
                timestamp: entry.timestamp,
                text,
                source: 'claude_project_jsonl',
              });
            } else if (entry.type === 'assistant' && entry.message?.content) {
              const text = typeof entry.message.content === 'string'
                ? entry.message.content
                : JSON.stringify(entry.message.content);
              assistantResponses.push({
                timestamp: entry.timestamp,
                text,
              });
            } else if (entry.type === 'tool_use' || entry.tool) {
              const toolName = entry.tool || entry.name || 'tool';
              if (!toolSummariesMap.has(toolName)) {
                toolSummariesMap.set(toolName, { count: 0, actions: new Set() });
              }
              toolSummariesMap.get(toolName)!.count++;
            }
          } catch {}
        }

        if (userPrompts.length > 0 || assistantResponses.length > 0) {
          quality = 'native_full';
        }
      } catch (err: any) {
        missingFields.push(`Transcript read error: ${err.message}`);
      }
    }

    // 2. Fallback / supplement with history.jsonl
    if (userPrompts.length === 0) {
      const historyFile = join(this.claudeHome, 'history.jsonl');
      if (existsSync(historyFile)) {
        try {
          const histContent = readFileSync(historyFile, 'utf8');
          const lines = histContent.split(/\r?\n/).filter(Boolean);

          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              if (entry.sessionId === sessionId && entry.display) {
                if (entry.project && !repoRoot) repoRoot = entry.project;
                userPrompts.push({
                  timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : undefined,
                  text: entry.display,
                  source: 'claude_history_jsonl',
                });
              }
            } catch {}
          }

          if (userPrompts.length > 0) {
            quality = 'history_fallback';
            missingFields.push('Assistant responses unavailable in history fallback');
          }
        } catch {}
      }
    }

    const toolSummaries: ToolCallSummary[] = [];
    for (const [tool, val] of toolSummariesMap.entries()) {
      toolSummaries.push({
        tool,
        count: val.count,
        actions: Array.from(val.actions),
      });
    }

    return {
      sessionId,
      provider: 'claude',
      title: userPrompts[0]?.text.slice(0, 60) || 'Claude Code Session',
      repoRoot,
      worktree: repoRoot,
      branch,
      userPrompts,
      assistantResponses,
      toolSummaries,
      changedFiles: Array.from(changedFiles),
      testsBuildsRun,
      pendingWork: [],
      blockers: [],
      resumeInstructions: `To resume this Claude Code session:\n1. CD to: ${repoRoot || 'Estate root'}\n2. Run: claude --resume ${sessionId}`,
      captureStatus: quality === 'native_full' ? 'complete' : 'partial',
      missingFields,
      provenance: {
        provider: 'claude',
        sessionId,
        sourcePath: transcriptPath,
        sourceSha256,
        capturedAt: now,
        transcriptionQuality: quality,
      },
    };
  }

  public generateResumeInstructions(session: TerminalSession, capture: CapturedPromptOutput): string {
    const root = session.repoRoot || capture.repoRoot || 'Estate root';
    const branch = session.branch || capture.branch || 'main';

    return `### Resumption Instructions for Claude Code Session [${session.id}]
- **Target Repository**: \`${root}\`
- **Branch**: \`${branch}\`
- **Continuation Command**:
  \`\`\`powershell
  Set-Location "${root}"
  claude --resume ${session.id}
  \`\`\`
`;
  }

  private findTranscriptPath(sessionId: string): string | undefined {
    const projectsDir = join(this.claudeHome, 'projects');
    if (!existsSync(projectsDir)) return undefined;

    try {
      const dirs = readdirSync(projectsDir);
      for (const d of dirs) {
        const candidate = join(projectsDir, d, `${sessionId}.jsonl`);
        if (existsSync(candidate)) return candidate;
      }
    } catch {}

    return undefined;
  }
}
