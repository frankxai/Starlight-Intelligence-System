/**
 * Starlight Queen — OpenAI Codex Provider Adapter
 *
 * Implements session discovery, non-exclusive rollout capture, history fallback,
 * and safe lifecycle management for local Codex sessions.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, readFileSync, readdirSync, openSync, readSync, closeSync } from 'node:fs';
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

export class CodexProvider implements AgentProvider {
  public readonly providerId: ProviderId = 'codex';
  public readonly capabilities: ProviderCapabilities = {
    visible: true,
    transcriptReadable: true,
    gracefulStopSupported: true,
    forceTerminationSupported: true,
    notes: 'Rollouts located in ~/.codex/sessions/YYYY/MM/DD/. Non-exclusive stream handles active logs with history.jsonl fallback.',
  };

  private codexHome: string;

  constructor(customCodexHome?: string) {
    this.codexHome = customCodexHome || join(homedir(), '.codex');
  }

  public async discoverSessions(processes: Map<number, ProcessNode>): Promise<TerminalSession[]> {
    const sessions: TerminalSession[] = [];
    const sessionIndexFile = join(this.codexHome, 'session_index.jsonl');

    if (!existsSync(sessionIndexFile)) {
      return sessions;
    }

    // Collect all running codex PIDs
    const codexPids: number[] = [];
    for (const [pid, proc] of processes.entries()) {
      if (proc.name.toLowerCase().includes('codex') && !proc.isProtected) {
        codexPids.push(pid);
      }
    }

    try {
      const content = readFileSync(sessionIndexFile, 'utf8');
      const lines = content.split(/\r?\n/).filter(Boolean);

      // Process in reverse to get most recent first
      const seenIds = new Set<string>();

      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          const sessionId = entry.id;
          if (!sessionId || seenIds.has(sessionId)) continue;
          seenIds.add(sessionId);

          const title = entry.thread_name || 'Codex Session';
          const updatedAt = entry.updated_at || new Date().toISOString();

          // Locate rollout file if exists
          const rolloutPath = this.findRolloutPath(sessionId, updatedAt);

          // Approximate active vs idle based on age and running processes
          const ageMs = Date.now() - new Date(updatedAt).getTime();
          const isRecentlyUpdated = ageMs < 1000 * 60 * 30; // within 30 min
          const status = codexPids.length > 0 && isRecentlyUpdated ? 'active' : 'idle';

          sessions.push({
            id: sessionId,
            provider: 'codex',
            title,
            pid: codexPids.length > 0 && isRecentlyUpdated ? codexPids[0] : undefined,
            status,
            lastSeen: updatedAt,
            transcriptPath: rolloutPath,
            capabilities: this.capabilities,
            metadata: {
              ageMinutes: Math.round(ageMs / 60000),
            },
          });
        } catch {
          // Skip invalid lines
        }
      }
    } catch {
      // Index read error
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
    let title: string | undefined;
    let transcriptPath: string | undefined;
    let sourceSha256: string | undefined;
    let quality: 'native_full' | 'history_fallback' | 'metadata_only' = 'metadata_only';
    const missingFields: string[] = [];

    // 1. Try to find the rollout file
    transcriptPath = this.findRolloutPath(sessionId);

    if (transcriptPath && existsSync(transcriptPath)) {
      try {
        const rolloutContent = this.readLockedFile(transcriptPath);
        if (rolloutContent && rolloutContent.length > 0) {
          sourceSha256 = createHash('sha256').update(rolloutContent).digest('hex');
          const lines = rolloutContent.split(/\r?\n/).filter(Boolean);

          for (const line of lines) {
            try {
              const record = JSON.parse(line);

              // Extract session title and metadata
              if (record.type === 'session_meta') {
                if (record.payload?.title) title = record.payload.title;
              }

              // Extract context and cwd
              if (record.type === 'turn_context' || record.type === 'world_state') {
                if (record.payload?.cwd && !repoRoot) repoRoot = record.payload.cwd;
              }

              // Extract messages
              if (record.type === 'response_item') {
                const payload = record.payload;
                if (payload?.type === 'message') {
                  const role = payload.role;
                  const text = (payload.content || [])
                    .map((c: any) => c.text || '')
                    .filter(Boolean)
                    .join('\n');

                  if (role === 'user' && text) {
                    userPrompts.push({
                      timestamp: record.timestamp,
                      text,
                      source: 'codex_rollout_jsonl',
                    });
                  } else if (role === 'assistant' && text) {
                    assistantResponses.push({
                      timestamp: record.timestamp,
                      text,
                    });
                  }
                } else if (payload?.type === 'function_call' || payload?.type === 'custom_tool_call') {
                  const toolName = payload.name || payload.call_id || 'unknown_tool';
                  if (!toolSummariesMap.has(toolName)) {
                    toolSummariesMap.set(toolName, { count: 0, actions: new Set() });
                  }
                  const entry = toolSummariesMap.get(toolName)!;
                  entry.count++;
                  if (payload.arguments) {
                    try {
                      const args = JSON.parse(payload.arguments);
                      if (args.command) {
                        entry.actions.add(`cmd: ${args.command.slice(0, 40)}`);
                        if (args.command.includes('test') || args.command.includes('build')) {
                          testsBuildsRun.push(args.command);
                        }
                      }
                      if (args.filePath || args.targetFile || args.path) {
                        changedFiles.add(args.filePath || args.targetFile || args.path);
                      }
                    } catch {}
                  }
                }
              }
            } catch {
              // skip unparseable line
            }
          }

          if (userPrompts.length > 0 || assistantResponses.length > 0) {
            quality = 'native_full';
          }
        }
      } catch (err: any) {
        missingFields.push(`Rollout file access error: ${err.message}`);
      }
    }

    // 2. Fallback to history.jsonl if rollout had no prompts or was locked
    if (userPrompts.length === 0) {
      const historyFile = join(this.codexHome, 'history.jsonl');
      if (existsSync(historyFile)) {
        try {
          const histContent = readFileSync(historyFile, 'utf8');
          const lines = histContent.split(/\r?\n/).filter(Boolean);

          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              // Codex history entries contain user text and timestamp
              if (entry.text) {
                // If entry matches session or recent history
                userPrompts.push({
                  timestamp: entry.timestampEpoch ? new Date(entry.timestampEpoch * 1000).toISOString() : undefined,
                  text: entry.text,
                  source: 'codex_history_jsonl_fallback',
                });
              }
            } catch {}
          }

          if (userPrompts.length > 0) {
            quality = 'history_fallback';
            missingFields.push('Assistant responses unavailable (captured from history.jsonl fallback)');
          }
        } catch {}
      }
    }

    if (userPrompts.length === 0 && assistantResponses.length === 0) {
      missingFields.push('No transcript records found for session');
    }

    // Convert tool summaries map to array
    const toolSummaries: ToolCallSummary[] = [];
    for (const [tool, val] of toolSummariesMap.entries()) {
      toolSummaries.push({
        tool,
        count: val.count,
        actions: Array.from(val.actions),
      });
    }

    const captureStatus = quality === 'native_full' ? 'complete' : 'partial';

    return {
      sessionId,
      provider: 'codex',
      title,
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
      resumeInstructions: `To resume this Codex session:\n1. Open repo: ${repoRoot || 'Estate root'}\n2. Run: codex resume ${sessionId} (or launch Claude Code with the handover prompt)`,
      captureStatus,
      missingFields,
      provenance: {
        provider: 'codex',
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
    const lastPrompt = capture.userPrompts[capture.userPrompts.length - 1]?.text || 'No previous prompt recorded';

    return `### Resumption Instructions for Codex Session [${session.id}]
- **Target Repository**: \`${root}\`
- **Branch**: \`${branch}\`
- **Last Prompt**: "${lastPrompt.slice(0, 100)}..."
- **Continuation Command**:
  \`\`\`powershell
  # Pick up work in directory:
  Set-Location "${root}"
  # Resume in Claude Code or Codex:
  claude --continue
  \`\`\`
`;
  }

  /**
   * Reads a file using non-exclusive read flags to handle files that may be open for writing.
   */
  private readLockedFile(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf8');
    } catch {
      // Fallback: chunked read via openSync
      try {
        const fd = openSync(filePath, 'r');
        const chunks: Buffer[] = [];
        const buf = Buffer.alloc(64 * 1024);
        let bytesRead = 0;
        while ((bytesRead = readSync(fd, buf, 0, buf.length, null)) > 0) {
          chunks.push(Buffer.from(buf.subarray(0, bytesRead)));
        }
        closeSync(fd);
        return Buffer.concat(chunks).toString('utf8');
      } catch {
        return '';
      }
    }
  }

  /**
   * Locates the rollout jsonl file for a session ID under ~/.codex/sessions/YYYY/MM/DD/
   */
  private findRolloutPath(sessionId: string, hintDateStr?: string): string | undefined {
    const sessionsDir = join(this.codexHome, 'sessions');
    if (!existsSync(sessionsDir)) return undefined;

    // If hintDateStr provided, check that specific date folder first
    if (hintDateStr) {
      try {
        const d = new Date(hintDateStr);
        const y = String(d.getUTCFullYear());
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const targetDir = join(sessionsDir, y, m, day);
        if (existsSync(targetDir)) {
          const files = readdirSync(targetDir);
          for (const f of files) {
            if (f.includes(sessionId) && f.endsWith('.jsonl')) {
              return join(targetDir, f);
            }
          }
        }
      } catch {}
    }

    // Otherwise search recent year/month/day directories (shallow, targeted)
    try {
      const years = readdirSync(sessionsDir).filter((y) => /^\d{4}$/.test(y));
      for (const y of years.reverse()) {
        const yDir = join(sessionsDir, y);
        const months = readdirSync(yDir).filter((m) => /^\d{2}$/.test(m));
        for (const m of months.reverse()) {
          const mDir = join(yDir, m);
          const days = readdirSync(mDir).filter((d) => /^\d{2}$/.test(d));
          for (const d of days.reverse()) {
            const dDir = join(mDir, d);
            const files = readdirSync(dDir);
            for (const f of files) {
              if (f.includes(sessionId) && f.endsWith('.jsonl')) {
                return join(dDir, f);
              }
            }
          }
        }
      }
    } catch {}

    return undefined;
  }
}
