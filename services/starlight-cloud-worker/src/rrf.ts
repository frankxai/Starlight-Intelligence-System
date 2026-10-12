/**
 * Starlight Reciprocal Rank Fusion (RRF) & Temporal Decay Hybrid Scoring
 * Built on SIP v1.1.1
 */

import type { MemoryAtom, QueryResult } from './types.js';

export class HybridRanker {
  private static readonly RRF_K = 60; // Standard reciprocal rank constant

  /**
   * Computes temporal decay weight based on 90-day default half-life.
   * Atoms older than halfLifeDays degrade logarithmically in ranking score,
   * keeping fresh operational memories prioritized without losing institutional wisdom.
   */
  public static calculateDecayWeight(createdAtIso: string, halfLifeDays: number = 90): number {
    const createdTime = new Date(createdAtIso).getTime();
    const now = Date.now();
    const ageDays = Math.max(0, (now - createdTime) / (1000 * 60 * 60 * 24));
    
    // Half-life formula: 2 ^ (-age / halfLife)
    return Math.pow(0.5, ageDays / halfLifeDays);
  }

  /**
   * Fuses vector ranked results and text ranked results using Reciprocal Rank Fusion (RRF).
   */
  public static fuseRrf(
    vectorMatches: Array<{ atom: MemoryAtom; score: number }>,
    textMatches: Array<{ atom: MemoryAtom; score: number }>,
    options: {
      vectorWeight?: number;
      textWeight?: number;
      minScore?: number;
      includeDecayed?: boolean;
    } = {}
  ): QueryResult[] {
    const {
      vectorWeight = 0.65,
      textWeight = 0.35,
      minScore = 0.01,
      includeDecayed = true,
    } = options;

    const resultMap = new Map<string, {
      atom: MemoryAtom;
      vectorScore: number;
      textScore: number;
      vectorRank: number;
      textRank: number;
    }>();

    // Map vector ranks (1-indexed)
    vectorMatches.forEach((match, idx) => {
      resultMap.set(match.atom.id, {
        atom: match.atom,
        vectorScore: match.score,
        textScore: 0,
        vectorRank: idx + 1,
        textRank: 9999, // default unranked
      });
    });

    // Map text ranks
    textMatches.forEach((match, idx) => {
      const existing = resultMap.get(match.atom.id);
      if (existing) {
        existing.textScore = match.score;
        existing.textRank = idx + 1;
      } else {
        resultMap.set(match.atom.id, {
          atom: match.atom,
          vectorScore: 0,
          textScore: match.score,
          vectorRank: 9999,
          textRank: idx + 1,
        });
      }
    });

    const scored: QueryResult[] = [];

    for (const entry of resultMap.values()) {
      const rrfVector = entry.vectorRank <= vectorMatches.length 
        ? (vectorWeight / (this.RRF_K + entry.vectorRank)) 
        : 0;

      const rrfText = entry.textRank <= textMatches.length 
        ? (textWeight / (this.RRF_K + entry.textRank)) 
        : 0;

      const baseRrf = rrfVector + rrfText;
      const decayWeight = this.calculateDecayWeight(entry.atom.createdAt, entry.atom.halfLifeDays || 90);
      const combinedScore = includeDecayed ? (baseRrf * decayWeight) : baseRrf;

      if (combinedScore >= minScore) {
        scored.push({
          atom: entry.atom,
          vectorScore: entry.vectorScore,
          textScore: entry.textScore,
          decayWeight,
          combinedScore,
          provenance: `starlight-cloud://vaults/${entry.atom.tier}/${entry.atom.namespace}/${entry.atom.id}`,
        });
      }
    }

    return scored.sort((a, b) => b.combinedScore - a.combinedScore);
  }
}
