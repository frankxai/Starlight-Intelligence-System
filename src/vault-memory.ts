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
import { EmpiricalSandbox } from './sandbox.js';
import { HashingTFProvider, rrfMerge, type RRFOptions } from './embedding.js';
import { withJsonlLock } from './jsonl-lock.js';

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
    let finalConfidence = confidence;
    let finalContent = content;

    // Empirical Grounding for Technical Vault
    if (classifiedVault === 'technical') {
      const codeBlocks = EmpiricalSandbox.extractCodeBlocks(content);
      if (codeBlocks.length > 0) {
        let allSuccess = true;
        let validationLogs = [];
        
        for (const block of codeBlocks) {
          const result = EmpiricalSandbox.validatePattern(block.code, block.language);
          if (!result.success) {
            allSuccess = false;
            validationLogs.push(`[Validation Failed for ${block.language}]:\n${result.output}`);
          } else {
            validationLogs.push(`[Validation Passed for ${block.language} in ${result.durationMs}ms]`);
          }
        }
        
        if (allSuccess) {
          finalConfidence = Math.min(1.0, finalConfidence + 0.3);
        } else {
          finalConfidence = Math.max(0.1, finalConfidence - 0.4);
          finalContent += `\n\n--- Empirical Validation ---\n${validationLogs.join('\n\n')}`;
          tags = [...tags, 'unverified-pattern'];
        }
      }
    }

    const baseEntry = this.add({
      content: finalContent,
      category: vaultToCategory(classifiedVault),
      tags: [...tags, `vault:${classifiedVault}`],
      confidence: finalConfidence,
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
   *
   * Rank fusion: two channels are combined via rrfMerge() from embedding.ts
   * (the single canonical RRF implementation in this repo):
   *   - Lexical channel: word-index matches from MemoryManager.search()
   *   - Semantic channel: HashingTF cosine similarity
   * Default RRF weights: [0.7 semantic, 0.3 lexical], k=60 — same as
   * RetrievalIndex.hybridSearch() so behaviour is consistent across pathways.
   *
   * Result semantics are unchanged: vault filtering, sort, and limit apply
   * after fusion. Existing retrieval tests pass without modification.
   */
  searchVaults(options: VaultSearchOptions, rrfOpts?: RRFOptions): VaultSearchResult[] {
    const limit = options.limit ?? 10;
    const overfetch = limit * 4;
    const lexicalResults = this.search({
      query: options.query,
      category: options.category,
      limit: overfetch,
      minConfidence: options.minConfidence,
    }).filter(entry => options.includePrivate || !isPrivateEntry(entry));
    const lexicalIds = lexicalResults.map(entry => entry.id);
    const lexicalRanks = new Map<string, number>();
    lexicalIds.forEach((id, idx) => lexicalRanks.set(id, idx + 1));

    const provider = new HashingTFProvider();
    const allEntries = this.getAll()
      .filter(entry => !options.category || entry.category === options.category)
      .filter(entry => options.minConfidence == null || entry.confidence >= options.minConfidence)
      .filter(entry => options.includePrivate || !isPrivateEntry(entry));

    const corpus = allEntries.map(e => e.content);
    provider.fit(corpus);

    let semanticIds: string[] = [];
    const semanticRanks = new Map<string, number>();
    if ((options.retrievalMode ?? 'hybrid') === 'hybrid') {
      const queryVec = hashingEmbedSync(provider, options.query);
      const semanticScores: Array<[string, number]> = [];
      for (const entry of allEntries) {
        const entryVec = hashingEmbedSync(provider, entry.content);
        const sim = provider.similarity(queryVec, entryVec);
        if (sim > 0) {
          semanticScores.push([entry.id, sim]);
        }
      }
      semanticScores.sort((a, b) => b[1] - a[1]);
      semanticIds = semanticScores.slice(0, overfetch).map(([id]) => id);
      semanticIds.forEach((id, idx) => semanticRanks.set(id, idx + 1));
    }

    const mergedIds = semanticIds.length > 0
      ? rrfMerge(semanticIds, lexicalIds, overfetch, rrfOpts)
      : lexicalIds.slice(0, overfetch);

    const entryMap = new Map<string, MemoryEntry>();
    for (const entry of allEntries) entryMap.set(entry.id, entry);

    const queryTerms = options.query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);

    let results: VaultSearchResult[] = [];
    for (const id of mergedIds) {
      const entry = entryMap.get(id);
      if (!entry) continue;

      const vault = this.resolveVault(entry);
      if (options.vaults && options.vaults.length > 0) {
        if (!options.vaults.includes(vault)) continue;
      }

      results.push({
        entry: { ...entry, vault, updatedAt: entry.createdAt } as VaultEntry,
        score: weightedRrfScore(
          semanticRanks.get(entry.id),
          lexicalRanks.get(entry.id),
          rrfOpts,
        ),
        matchedTerms: queryTerms.filter(w => entry.content.toLowerCase().includes(w)),
        channels: {
          lexicalRank: lexicalRanks.get(entry.id),
          semanticRank: semanticRanks.get(entry.id),
        },
      });

      if (results.length >= overfetch) break;
    }

    // Sort
    if (options.sortBy === 'recency') {
      results.sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt));
    } else if (options.sortBy === 'confidence') {
      results.sort((a, b) => b.entry.confidence - a.entry.confidence);
    } else {
      results.sort((a, b) => b.score - a.score || b.entry.createdAt.localeCompare(a.entry.createdAt));
    }

    return results.slice(0, limit);
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
    withJsonlLock(this.horizonPath, () => {
      appendFileSync(this.horizonPath, JSON.stringify(entry) + '\n', 'utf-8');
    });

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
      const vault = this.resolveVault(entry);
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

  /** Resolve persisted vault identity before falling back to classification. */
  private resolveVault(entry: MemoryEntry): VaultType {
    const indexed = this.vaultIndex.get(entry.id);
    if (indexed) return indexed;

    const tagged = entry.tags
      .find(tag => tag.startsWith('vault:'))
      ?.slice('vault:'.length) as VaultType | undefined;
    if (tagged && ALL_VAULT_TYPES.includes(tagged)) {
      this.vaultIndex.set(entry.id, tagged);
      return tagged;
    }

    return this.classifyVault(entry.content);
  }
}

// ── Helpers ───────────────────────────────────────────────

/**
 * Synchronously extract an embedding from HashingTFProvider via embedSync().
 * This avoids making searchVaults() async (which would break all callers).
 */
function hashingEmbedSync(provider: HashingTFProvider, text: string): number[] {
  return provider.embedSync(text);
}

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

function isPrivateEntry(entry: MemoryEntry): boolean {
  const tags = entry.tags.map(tag => tag.toLowerCase());
  const source = (entry.source ?? '').toLowerCase();
  const content = entry.content.toLowerCase();
  return (
    tags.includes('privacy:private') ||
    tags.includes('private') ||
    source.includes('/private') ||
    content.includes('privacy: private') ||
    content.includes('privacy_status: private')
  );
}

function weightedRrfScore(
  semanticRank: number | undefined,
  lexicalRank: number | undefined,
  opts: RRFOptions = {},
): number {
  const k = opts.k ?? 60;
  const [semanticWeight, lexicalWeight] = opts.weights ?? [0.7, 0.3];
  return (
    (semanticRank ? semanticWeight / (k + semanticRank) : 0) +
    (lexicalRank ? lexicalWeight / (k + lexicalRank) : 0)
  );
}
