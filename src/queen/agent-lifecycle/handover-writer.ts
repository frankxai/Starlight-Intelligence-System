/**
 * Starlight Queen — Repo-Aware Handover Writer & Redaction Engine
 *
 * Persists durable, searchable, secret-redacted handover documents and indexes
 * across .starlight/handoffs/ and agentic-ops-hub session formats.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { SecretRedactor } from './secret-redactor.js';
import type {
  CapturedPromptOutput,
  HandoverDocument,
  TerminalSession,
} from './types.js';

export interface HandoverWriterOptions {
  handoffsDir?: string;
  estateRoot?: string;
}

export interface WriteHandoverOptions {
  customOutPath?: string;
  syncIssue?: number | string;
}

export class HandoverWriter {
  private handoffsDir: string;

  constructor(options?: HandoverWriterOptions) {
    this.handoffsDir = options?.handoffsDir || join(homedir(), '.starlight', 'handoffs');
    if (!existsSync(this.handoffsDir)) {
      mkdirSync(this.handoffsDir, { recursive: true });
    }
  }

  /**
   * Persists a complete handover record in JSON and Markdown with secret redaction.
   */
  public writeHandover(
    session: TerminalSession,
    capture: CapturedPromptOutput,
    customOutPathOrOptions?: string | WriteHandoverOptions
  ): HandoverDocument {
    const options: WriteHandoverOptions =
      typeof customOutPathOrOptions === 'string'
        ? { customOutPath: customOutPathOrOptions }
        : customOutPathOrOptions || {};
    const customOutPath = options.customOutPath;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const docId = `${dateStr}-${session.provider}-${session.id.slice(0, 8)}`;

    const jsonPath = customOutPath
      ? customOutPath.endsWith('.json')
        ? customOutPath
        : `${customOutPath}.json`
      : join(this.handoffsDir, `${docId}.json`);

    const mdPath = customOutPath
      ? customOutPath.endsWith('.md')
        ? customOutPath
        : `${customOutPath}.md`
      : join(this.handoffsDir, `${docId}.md`);

    // 1. Redact secrets from capture before serialization
    const sanitizedCapture = SecretRedactor.redactDeep<CapturedPromptOutput>(capture);

    // 2. Generate Claude continuation prompt
    const continuationPrompt = this.generateClaudeContinuationPrompt(session, sanitizedCapture);

    // 3. Build handover document
    const doc: HandoverDocument = {
      id: docId,
      sessionId: session.id,
      provider: session.provider,
      title: session.title || sanitizedCapture.title || 'Agent Session Handover',
      capturedAt: now.toISOString(),
      repoRoot: session.repoRoot || sanitizedCapture.repoRoot,
      worktree: session.worktree || sanitizedCapture.worktree,
      branch: session.branch || sanitizedCapture.branch,
      markdownPath: mdPath,
      jsonPath,
      capture: sanitizedCapture,
      claudeContinuationPrompt: continuationPrompt,
    };

    // 4. Write JSON file
    writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf8');

    // 5. Write Markdown file
    const mdContent = this.formatMarkdownHandover(doc);
    writeFileSync(mdPath, mdContent, 'utf8');

    // 6. Update master index
    this.updateMasterIndex(doc);

    // 7. Sync to GitHub Issue if requested
    if (options.syncIssue) {
      this.syncToGitHubIssue(doc, options.syncIssue);
    }

    return doc;
  }

  /**
   * Posts the handover summary as a comment to a GitHub issue using `gh issue comment`.
   */
  public syncToGitHubIssue(doc: HandoverDocument, issueNumber: number | string): boolean {
    try {
      const commentBody = [
        `### 👑 Starlight Queen Handover Record: \`${doc.id}\``,
        '',
        `- **Session ID:** \`${doc.sessionId}\` (${doc.provider})`,
        `- **Captured At:** ${doc.capturedAt}`,
        `- **Repo Root:** \`${doc.repoRoot || 'N/A'}\``,
        `- **Worktree:** \`${doc.worktree || 'N/A'}\``,
        `- **Branch:** \`${doc.branch || 'N/A'}\``,
        `- **Transcription Quality:** \`${doc.capture.provenance.transcriptionQuality}\``,
        '',
        '---',
        '',
        doc.capture.pendingWork ? `#### Pending Work\n${doc.capture.pendingWork}\n` : '',
        doc.claudeContinuationPrompt
          ? `#### Continuation Prompt\n\`\`\`markdown\n${doc.claudeContinuationPrompt}\n\`\`\`\n`
          : '',
      ].filter(Boolean).join('\n');

      execFileSync('gh', ['issue', 'comment', String(issueNumber), '--body', commentBody], {
        cwd: doc.repoRoot || process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates ~/.starlight/handoffs/HANDOVER-INDEX.json with the new handover metadata.
   */
  private updateMasterIndex(doc: HandoverDocument): void {
    const indexPath = join(this.handoffsDir, 'HANDOVER-INDEX.json');
    let index: Array<{
      id: string;
      sessionId: string;
      provider: string;
      title: string;
      date: string;
      repoRoot?: string;
      branch?: string;
      status: string;
      jsonPath: string;
      markdownPath: string;
    }> = [];

    if (existsSync(indexPath)) {
      try {
        index = JSON.parse(readFileSync(indexPath, 'utf8'));
      } catch {}
    }

    // Replace existing entry if repeated save
    index = index.filter((e) => e.sessionId !== doc.sessionId);

    index.unshift({
      id: doc.id,
      sessionId: doc.sessionId,
      provider: doc.provider,
      title: doc.title,
      date: doc.capturedAt,
      repoRoot: doc.repoRoot,
      branch: doc.branch,
      status: doc.capture.captureStatus,
      jsonPath: doc.jsonPath,
      markdownPath: doc.markdownPath,
    });

    try {
      writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
    } catch {}
  }

  /**
   * Generates a self-contained continuation prompt for Claude Code.
   */
  public generateClaudeContinuationPrompt(session: TerminalSession, capture: CapturedPromptOutput): string {
    const repo = session.repoRoot || capture.repoRoot || 'C:/Users/frank/starlight/repos/...';
    const branch = session.branch || capture.branch || 'current-branch';
    const userPromptsList = capture.userPrompts
      .slice(-3)
      .map((p, idx) => `  ${idx + 1}. "${p.text.slice(0, 140)}..."`)
      .join('\n');

    return `Continue work from ${session.provider.toUpperCase()} session [${session.id}]

## Working Context
- **Target Repository**: \`${repo}\`
- **Branch**: \`${branch}\`
- **Session Goal**: ${session.title || 'Complete planned technical work'}

## Recent User Prompts
${userPromptsList || '  (No user prompts recorded)'}

## Pending Tasks & Verification
- Check git status and current branch in \`${repo}\`.
- Review changed files: ${capture.changedFiles.length > 0 ? capture.changedFiles.slice(0, 5).join(', ') : 'Inspect worktree diff'}.
- Resume execution following repository AGENTS.md instructions.
`;
  }

  /**
   * Formats the human-readable Markdown handover file.
   */
  private formatMarkdownHandover(doc: HandoverDocument): string {
    const c = doc.capture;
    const promptsSection = c.userPrompts
      .map((p, i) => `### Prompt ${i + 1} (${p.source})\n\`\`\`\n${p.text}\n\`\`\``)
      .join('\n\n');

    const toolsSection = c.toolSummaries.length > 0
      ? c.toolSummaries.map((t) => `- **${t.tool}** (called ${t.count}x): ${t.actions.slice(0, 3).join(', ')}`).join('\n')
      : '_No tool calls captured._';

    const changedFilesSection = c.changedFiles.length > 0
      ? c.changedFiles.map((f) => `- \`${f}\``).join('\n')
      : '_No file changes recorded in transcript._';

    const missingSection = c.missingFields.length > 0
      ? `\n> [!WARNING] **Data Gaps**:\n${c.missingFields.map((m) => `> - ${m}`).join('\n')}\n`
      : '';

    return `# Starlight Agent Handover — ${doc.title}

> **Session ID**: \`${doc.sessionId}\` | **Provider**: \`${doc.provider.toUpperCase()}\` | **Status**: \`${c.captureStatus.toUpperCase()}\`
> **Captured At**: \`${doc.capturedAt}\`
> **Repository Root**: \`${doc.repoRoot || 'Unknown'}\` | **Branch**: \`${doc.branch || 'Unknown'}\`
${missingSection}
---

## 1. Executive Summary
- **Session Title**: ${doc.title}
- **Provider Quality**: \`${c.provenance.transcriptionQuality}\` (Source: \`${c.provenance.sourcePath || 'local'}\`)
- **Total User Prompts Captured**: ${c.userPrompts.length}
- **Total Assistant Turns Captured**: ${c.assistantResponses.length}

---

## 2. User Prompts (Chronological)
${promptsSection || '_No user prompts available._'}

---

## 3. Tool Invocations & Actions
${toolsSection}

---

## 4. Changed Files Inventory
${changedFilesSection}

---

## 5. Claude Continuation Prompt
\`\`\`markdown
${doc.claudeContinuationPrompt}
\`\`\`

---

## 6. Provenance & Integrity
- **Source File**: \`${c.provenance.sourcePath || 'N/A'}\`
- **Source SHA-256**: \`${c.provenance.sourceSha256 || 'N/A'}\`
- **Sanitization**: SecretRedactor veil applied. Secrets, credentials, and keys redacted.

_Built on SIP (Starlight Intelligence Protocol) v1.1.1_
`;
  }
}
