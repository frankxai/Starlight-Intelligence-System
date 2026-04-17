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
/**
 * Create a platform adapter by name.
 *
 * @param platform - One of: claude-code, cursor, codex, gemini-cli, opencode
 * @param _config - Reserved for future per-adapter overrides
 * @returns A configured PlatformAdapter instance
 * @throws Error if the platform is not recognized
 */
export declare function createAdapter(platform: string, _config?: Partial<AdapterConfig>): PlatformAdapter;
/** List all supported platform identifiers */
export declare function supportedPlatforms(): string[];
//# sourceMappingURL=index.d.ts.map