/**
 * Intelligence Score — Unified SIS + ACOS Intelligence Report
 *
 * Combines SIS memory depth metrics with ACOS operational metrics
 * into a single intelligence score (0-100) with component breakdown.
 *
 * Components (25 points each):
 * 1. Memory Depth — richness and diversity of stored knowledge
 * 2. Pattern Quality — success rates of learned tool sequences
 * 3. Operational History — volume and variety of completed work
 * 4. Learning Velocity — rate of new insights over time
 */
import type { MemoryStats } from "./types.js";
import type { MemoryManager } from "./memory.js";
export interface ScoreComponent {
    name: string;
    score: number;
    maxScore: number;
    details: string;
}
export interface IntelligenceReport {
    totalScore: number;
    maxScore: number;
    grade: string;
    components: ScoreComponent[];
    generatedAt: string;
    memoryStats: MemoryStats;
    acosStats: {
        trajectoryCount: number;
        patternCount: number;
        avgSuccessScore: number;
        topPatterns: string[];
    };
}
export declare function generateIntelligenceReport(memory: MemoryManager, acosPath: string): IntelligenceReport;
//# sourceMappingURL=score.d.ts.map