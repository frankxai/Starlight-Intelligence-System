/**
 * Starlight Intelligence System — Adapter Utilities
 *
 * Shared helpers for filtering, sorting, and token estimation.
 * Zero external dependencies.
 */
/** Confidence ranking (higher = more trusted) */
const CONFIDENCE_RANK = {
    verified: 4,
    high: 3,
    medium: 2,
    low: 1,
};
/**
 * Filter entries by vault type, then sort by confidence desc + recency desc.
 */
export function filterAndSort(entries, vaults) {
    const filtered = vaults?.length
        ? entries.filter(e => vaults.includes(e.vault))
        : entries;
    return [...filtered].sort((a, b) => {
        const confDiff = (CONFIDENCE_RANK[b.confidence ?? ''] ?? 0) -
            (CONFIDENCE_RANK[a.confidence ?? ''] ?? 0);
        if (confDiff !== 0)
            return confDiff;
        return b.createdAt.localeCompare(a.createdAt);
    });
}
/**
 * Estimate token count from a string (~4 chars per token).
 */
export function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
/**
 * Truncate content to fit within a token budget.
 * Cuts at the last complete line that fits.
 */
export function truncateToFit(content, maxTokens) {
    const maxChars = maxTokens * 4;
    if (content.length <= maxChars)
        return content;
    const truncated = content.slice(0, maxChars);
    const lastNewline = truncated.lastIndexOf('\n');
    return lastNewline > 0
        ? truncated.slice(0, lastNewline) + '\n\n*[truncated — token limit reached]*'
        : truncated + '\n\n*[truncated — token limit reached]*';
}
//# sourceMappingURL=utils.js.map