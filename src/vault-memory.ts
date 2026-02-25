/**
 * Vault-Aware Memory Manager — Extends Starlight Memory with Semantic Vaults
 *
 * Adds the six Starlight Vaults on top of the existing MemoryManager:
 * Strategic, Technical, Creative, Operational, Wisdom, Horizon
 *
 * Works entirely through the public API of MemoryManager so that private
 * internals remain encapsulated.
 */

import { MemoryManager } from './memory.js';
import type {
  VaultType,
  VaultEntry,
  VaultSearchOptions,
  VaultSearchResult,
  VaultStats,
  HorizonEntry,
  VaultMemoryConfig,
  MemoryEntry,
} from './types.js';
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// ── Vault classification keywords ──────────────────────────

const VAULT_KEYWORDS: Record<VaultType, string[]> = {
  strategic: [
    'architecture', 'decision', 'roadmap', 'strategy', 'plan',
    'phase', 'milestone', 'business', 'revenue',
  ],
  technical: [
    'pattern', 'algorithm', 'api', 'database', 'component',
    'schema', 'optimization', 'refactor', 'debug', 'build', 'deploy', 'test',
  ],
  creative: [
    'voice', 'tone', 'style', 'narrative', 'brand',
    'design', 'aesthetic', 'color', 'typography', 'lore', 'canon',
  ],
  operational: [
    'session', 'current', 'today', 'working', 'progress',
    'status', 'todo', 'next', 'blocking',
  ],
  wisdom: [
    'meta', 'insight', 'lesson', 'principle', 'philosophy',
    'recurring', 'universal', 'fundamental',
  ],
  horizon: [
    'wish', 'future', 'hope', 'dream', 'envision',
    'imagine', 'beautiful', 'benevolent', 'golden age',
  ],
};

const ALL_VAULT_TYPES: VaultType[] = [
  'strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon',
];

// ── VaultMemory ─────────────────────────────────────────────

export class VaultMemory extends MemoryManager {
  private vaultIndex = new Map<string, VaultType>();
  private horizonPath: string;
  private vaultConfig: Readonly<Required<VaultMemoryConfig>>;

  constructor(config?: VaultMemoryConfig) {
    const storagePath = config?.storagePath ?? join(process.cwd(), '.starlight');
    super(join(storagePath, 'memory.json'));

    this.vaultConfig = Object.freeze({
      storagePath,
      enableVaults: config?.enableVaults ?? true,
      enableHorizon: config?.enableHorizon ?? true,
      horizonAuthor: config?.horizonAuthor ?? 'starlight',
      defaultVault: config?.defaultVault ?? 'operational',
    });

    this.horizonPath = join(storagePath, 'horizon.jsonl');
  }

  // ── Classification ──────────────────────────────────────

  /**
   * Classify content into the most appropriate vault based on keyword analysis.
   * Returns the vault with the highest keyword match count, falling back to the
   * configured default vault when no keywords match.
   */
  classifyVault(content: string): VaultType {
    const lower = content.toLowerCase();
    const scores: Record<VaultType, number> = {
      strategic: 0,
      technical: 0,
      creative: 0,
      operational: 0,
      wisdom: 0,
      horizon: 0,
    };

    for (const [vault, keywords] of Object.entries(VAULT_KEYWORDS) as [VaultType, string[]][]) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          scores[vault]++;
        }
      }
    }

    let bestVault: VaultType = this.vaultConfig.defaultVault;
    let bestScore = 0;
    for (const [vault, score] of Object.entries(scores) as [VaultType, number][]) {
      if (score > bestScore) {
        bestVault = vault;
        bestScore = score;
      }
    }

    return bestVault;
  }

  // ── Remember ────────────────────────────────────────────

  /**
   * Store a memory entry with vault classification.
   * If no vault is provided the content is auto-classified.
   */
  rememberInVault(
    content: string,
    vault?: VaultType,
    tags: string[] = [],
    confidence = 0.5,
    source?: string,
  ): VaultEntry {
    const classifiedVault = vault ?? this.classifyVault(content);

    const baseEntry = this.add({
      content,
      category: vaultToCategory(classifiedVault),
      tags: [...tags, `vault:${classifiedVault}`],
      confidence,
      source,
    });

    this.vaultIndex.set(baseEntry.id, classifiedVault);

    return {
      ...baseEntry,
      vault: classifiedVault,
      updatedAt: baseEntry.createdAt,
    };
  }

  // ── Search ──────────────────────────────────────────────

  /**
   * Search memories with optional vault-type filtering and custom sort.
   */
  searchVaults(options: VaultSearchOptions): VaultSearchResult[] {
    // Over-fetch to allow post-filtering by vault
    const baseResults = this.search({
      query: options.query,
      category: options.category,
      limit: (options.limit ?? 10) * 3,
      minConfidence: options.minConfidence,
    });

    const queryTerms = options.query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);

    let results: VaultSearchResult[] = baseResults.map(entry => {
      const vault = this.vaultIndex.get(entry.id) ?? this.classifyVault(entry.content);
      return {
        entry: { ...entry, vault, updatedAt: entry.createdAt } as VaultEntry,
        score: entry.confidence,
        matchedTerms: queryTerms.filter(w => entry.content.toLowerCase().includes(w)),
      };
    });

    // Filter to requested vaults
    if (options.vaults && options.vaults.length > 0) {
      const allowed = new Set(options.vaults);
      results = results.filter(r => allowed.has(r.entry.vault));
    }

    // Sort
    if (options.sortBy === 'recency') {
      results.sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt));
    } else if (options.sortBy === 'confidence') {
      results.sort((a, b) => b.entry.confidence - a.entry.confidence);
    }
    // default 'relevance' keeps the order from the base search

    return results.slice(0, options.limit ?? 10);
  }

  // ── Horizon Ledger ──────────────────────────────────────

  /**
   * Append a benevolent wish to the Horizon Vault (append-only ledger).
   */
  appendHorizon(
    wish: string,
    context: string,
    author?: string,
    coAuthored = true,
  ): HorizonEntry {
    const entry: HorizonEntry = {
      id: `horizon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      wish,
      context,
      author: author ?? this.vaultConfig.horizonAuthor,
      coAuthored,
      tags: ['horizon'],
      createdAt: new Date().toISOString(),
    };

    // Also store in main memory so it appears in searches
    this.rememberInVault(wish, 'horizon', ['horizon'], 1.0, 'horizon-ledger');

    // Append to JSONL ledger
    const dir = dirname(this.horizonPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(this.horizonPath, JSON.stringify(entry) + '\n', 'utf-8');

    return entry;
  }

  /**
   * Read all Horizon entries from the append-only ledger.
   */
  getHorizonEntries(): HorizonEntry[] {
    if (!existsSync(this.horizonPath)) return [];
    const content = readFileSync(this.horizonPath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line) as HorizonEntry);
  }

  // ── Statistics ──────────────────────────────────────────

  /**
   * Compute per-vault statistics across all stored memories.
   */
  getVaultStats(): VaultStats[] {
    const all = this.getAll();
    const buckets = new Map<VaultType, { entries: MemoryEntry[]; tags: Map<string, number> }>();

    for (const v of ALL_VAULT_TYPES) {
      buckets.set(v, { entries: [], tags: new Map() });
    }

    for (const entry of all) {
      const vault = this.vaultIndex.get(entry.id) ?? this.classifyVault(entry.content);
      const bucket = buckets.get(vault)!;
      bucket.entries.push(entry);
      for (const tag of entry.tags) {
        bucket.tags.set(tag, (bucket.tags.get(tag) ?? 0) + 1);
      }
    }

    return ALL_VAULT_TYPES.map(vault => {
      const bucket = buckets.get(vault)!;
      const sorted = bucket.entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const topTags = Array.from(bucket.tags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      return {
        vault,
        entryCount: bucket.entries.length,
        oldestEntry: sorted[0]?.createdAt,
        newestEntry: sorted[sorted.length - 1]?.createdAt,
        topTags,
      };
    });
  }
}

// ── Helpers ───────────────────────────────────────────────

function vaultToCategory(vault: VaultType): MemoryEntry['category'] {
  const map: Record<VaultType, MemoryEntry['category']> = {
    strategic: 'decision',
    technical: 'pattern',
    creative: 'insight',
    operational: 'preference',
    wisdom: 'insight',
    horizon: 'insight',
  };
  return map[vault];
}
