/**
 * Starlight Intelligence System — Platform Adapters
 *
 * Barrel export + factory for cross-platform context injection.
 */

export * from './types.js';
export { ClaudeCodeAdapter } from './claude-code.js';
export { CursorAdapter } from './cursor.js';
export { CodexAdapter } from './codex.js';
export { GeminiCliAdapter } from './gemini-cli.js';
export { OpenCodeAdapter } from './opencode.js';

import type { PlatformAdapter, AdapterConfig } from './types.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';
import { GeminiCliAdapter } from './gemini-cli.js';
import { OpenCodeAdapter } from './opencode.js';

const ADAPTERS: Record<string, new () => PlatformAdapter> = {
  'claude-code': ClaudeCodeAdapter,
  'cursor': CursorAdapter,
  'codex': CodexAdapter,
  'gemini-cli': GeminiCliAdapter,
  'opencode': OpenCodeAdapter,
};

/**
 * Create a platform adapter by name.
 *
 * @param platform - One of: claude-code, cursor, codex, gemini-cli, opencode
 * @param _config - Reserved for future per-adapter overrides
 * @returns A configured PlatformAdapter instance
 * @throws Error if the platform is not recognized
 */
export function createAdapter(
  platform: string,
  _config?: Partial<AdapterConfig>,
): PlatformAdapter {
  const AdapterClass = ADAPTERS[platform];
  if (!AdapterClass) {
    const supported = Object.keys(ADAPTERS).join(', ');
    throw new Error(`Unknown platform "${platform}". Supported: ${supported}`);
  }
  return new AdapterClass();
}

/** List all supported platform identifiers */
export function supportedPlatforms(): string[] {
  return Object.keys(ADAPTERS);
}
