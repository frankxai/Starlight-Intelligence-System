/**
 * Starlight Intelligence System — Platform Adapter Types
 *
 * Shared interfaces for cross-platform context injection.
 */

import type { VaultType } from '../types.js';

export type { VaultType };

export interface VaultEntry {
  id: string;
  vault: VaultType;
  content: string;
  confidence?: string;
  tags?: string[];
  createdAt: string;
}

export interface AdapterConfig {
  maxContextTokens: number;
  vaultDir: string;
  platform: string;
}

export interface ContextInjection {
  format: 'markdown' | 'xml' | 'json';
  content: string;
  tokenEstimate: number;
}

export interface PlatformAdapter {
  readonly platform: string;
  readonly maxContextTokens: number;

  /** Format vault entries for this platform's context window */
  formatContext(entries: VaultEntry[], options?: {
    maxTokens?: number;
    vaults?: VaultType[];
    includeMetadata?: boolean;
  }): ContextInjection;

  /** Generate the platform-specific config snippet for MCP registration */
  getMcpConfig(serverCommand: string): Record<string, unknown>;

  /** Generate platform-specific memory file content */
  generateMemoryFile(entries: VaultEntry[]): { filename: string; content: string };

  /**
   * Optional. Adapters with a native multi-file harness surface (grok, antigravity)
   * emit the full set — memory file + system prompt + mcp config + allowlist + readme.
   * Adapters without that surface (claude, cursor, codex, gemini, opencode) omit it,
   * so the asymmetry is explicit in the type rather than hidden behind off-interface methods.
   */
  generateAllAdapterFiles?(
    entries: VaultEntry[],
    serverCommand?: string,
  ): Array<{ filename: string; content: string; description?: string }>;
}
