/**
 * Starlight Intelligence System — Adapter Utilities
 *
 * Shared helpers for filtering, sorting, and token estimation.
 * Zero external dependencies.
 */
import type { VaultEntry, VaultType } from './types.js';
/**
 * Filter entries by vault type, then sort by confidence desc + recency desc.
 */
export declare function filterAndSort(entries: VaultEntry[], vaults?: VaultType[]): VaultEntry[];
/**
 * Estimate token count from a string (~4 chars per token).
 */
export declare function estimateTokens(text: string): number;
/**
 * Truncate content to fit within a token budget.
 * Cuts at the last complete line that fits.
 */
export declare function truncateToFit(content: string, maxTokens: number): string;
//# sourceMappingURL=utils.d.ts.map