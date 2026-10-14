/**
 * Starlight Queen — Local Terminal Agent Lifecycle Management Types
 *
 * Types for session discovery, process correlation, prompt/output capture,
 * safe graceful/force termination, and durable repo-aware handovers.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

export type ProviderId =
  | 'codex'
  | 'claude'
  | 'opencode'
  | 'grok'
  | 'hermes'
  | 'antigravity'
  | 'generic';

export interface ProviderCapabilities {
  /** Session process and state can be detected in process list and file indexes */
  visible: boolean;
  /** Full transcript or turn history can be parsed from disk/database */
  transcriptReadable: boolean;
  /** Graceful termination (SIGINT, console ctrl event, polite exit) is supported */
  gracefulStopSupported: boolean;
  /** Force termination via targeted process tree kill is supported */
  forceTerminationSupported: boolean;
  /** Provider-specific operational notes or limitations */
  notes?: string;
}

export interface ProcessNode {
  pid: number;
  ppid: number;
  name: string;
  commandLine: string;
  cwd?: string;
  creationDate?: string;
  isProtected: boolean;
  protectionReason?: string;
  children?: ProcessNode[];
}

export interface TerminalSession {
  id: string;
  provider: ProviderId;
  title?: string;
  pid?: number;
  processTree?: ProcessNode[];
  terminal?: string;
  repoRoot?: string;
  worktree?: string;
  branch?: string;
  currentTask?: string;
  status: 'active' | 'idle' | 'stopped' | 'unknown' | 'orphaned';
  lastSeen: string;
  transcriptPath?: string;
  capabilities: ProviderCapabilities;
  promptCount?: number;
  metadata?: Record<string, unknown>;
}

export interface SessionInventory {
  sampledAt: string;
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
  stoppedSessions: number;
  protectedPids: number[];
  sessions: TerminalSession[];
  providerCapabilities: Record<string, ProviderCapabilities>;
}

export interface ToolCallSummary {
  tool: string;
  count: number;
  actions: string[];
  samplePayload?: string;
}

export interface CapturedPromptOutput {
  sessionId: string;
  provider: ProviderId;
  title?: string;
  repoRoot?: string;
  worktree?: string;
  branch?: string;
  userPrompts: Array<{
    timestamp?: string;
    text: string;
    source: string;
  }>;
  assistantResponses: Array<{
    timestamp?: string;
    text: string;
  }>;
  toolSummaries: ToolCallSummary[];
  changedFiles: string[];
  gitStatusSummary?: string;
  testsBuildsRun: string[];
  pendingWork: string[];
  blockers: string[];
  resumeInstructions: string;
  captureStatus: 'complete' | 'partial';
  missingFields: string[];
  provenance: {
    provider: ProviderId;
    sessionId: string;
    sourcePath?: string;
    sourceSha256?: string;
    capturedAt: string;
    transcriptionQuality: 'native_full' | 'history_fallback' | 'metadata_only';
  };
}

export interface StopOptions {
  /** If true, preview affected process tree without killing */
  dryRun?: boolean;
  /** If true, force-stop if graceful stop times out */
  force?: boolean;
  /** Wait timeout for graceful stop in milliseconds (default: 3000ms) */
  timeoutMs?: number;
  /** Reason for stopping */
  reason?: string;
}

export interface StopPlan {
  targetSessionId: string;
  provider: ProviderId;
  targetPids: number[];
  protectedPidsShielded: number[];
  ancestorPidsPreserved: number[];
  commandLines: string[];
  gracefulMethod: 'sigint' | 'console_ctrl' | 'exit_message' | 'wm_close' | 'process_terminate';
  forceRequired: boolean;
  isDryRun: boolean;
  authorized: boolean;
  rationale: string;
}

export interface StopResult {
  success: boolean;
  targetSessionId: string;
  stoppedPids: number[];
  remainingPids: number[];
  methodUsed: string;
  durationMs: number;
  error?: string;
}

export interface HandoverDocument {
  id: string;
  sessionId: string;
  provider: ProviderId;
  title: string;
  capturedAt: string;
  repoRoot?: string;
  worktree?: string;
  branch?: string;
  markdownPath: string;
  jsonPath: string;
  capture: CapturedPromptOutput;
  claudeContinuationPrompt: string;
}
