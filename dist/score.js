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
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
// ── Scoring Functions ──────────────────────────────────────
function scoreMemoryDepth(memory) {
    const stats = memory.getStats();
    const all = memory.getAll();
    let score = 0;
    const details = [];
    // Entries count (0-8 points)
    const entryScore = Math.min(8, stats.totalEntries / 10);
    score += entryScore;
    details.push(`${stats.totalEntries} entries (${entryScore.toFixed(1)}/8)`);
    // Category diversity (0-7 points): all 5 categories = 7 points
    const categories = Object.keys(stats.byCategory).length;
    const diversityScore = (categories / 5) * 7;
    score += diversityScore;
    details.push(`${categories}/5 categories (${diversityScore.toFixed(1)}/7)`);
    // High-confidence entries (0-5 points)
    const highConf = all.filter((m) => m.confidence >= 0.8).length;
    const confScore = Math.min(5, (highConf / Math.max(1, stats.totalEntries)) * 10);
    score += confScore;
    details.push(`${highConf} high-confidence (${confScore.toFixed(1)}/5)`);
    // Tag richness (0-5 points)
    const uniqueTags = new Set(all.flatMap((m) => m.tags));
    const tagScore = Math.min(5, uniqueTags.size / 10);
    score += tagScore;
    details.push(`${uniqueTags.size} unique tags (${tagScore.toFixed(1)}/5)`);
    return {
        name: "Memory Depth",
        score: Math.min(25, score),
        maxScore: 25,
        details: details.join("; "),
    };
}
function scorePatternQuality(acosPath) {
    let score = 0;
    const details = [];
    const patternsFile = join(acosPath, "patterns.json");
    if (!existsSync(patternsFile)) {
        return {
            name: "Pattern Quality",
            score: 0,
            maxScore: 25,
            details: "No patterns file found",
        };
    }
    try {
        const patterns = JSON.parse(readFileSync(patternsFile, "utf-8"));
        // Pattern count (0-8 points)
        const countScore = Math.min(8, patterns.length / 6);
        score += countScore;
        details.push(`${patterns.length} patterns (${countScore.toFixed(1)}/8)`);
        // Average success rate (0-10 points)
        if (patterns.length > 0) {
            const avgSuccess = patterns.reduce((sum, p) => sum + p.avgSuccess, 0) / patterns.length;
            const successScore = avgSuccess * 10;
            score += successScore;
            details.push(`${(avgSuccess * 100).toFixed(0)}% avg success (${successScore.toFixed(1)}/10)`);
        }
        // High-success patterns (0-7 points)
        const elite = patterns.filter((p) => p.avgSuccess >= 0.85 && p.count >= 3);
        const eliteScore = Math.min(7, elite.length * 1.5);
        score += eliteScore;
        details.push(`${elite.length} elite patterns (${eliteScore.toFixed(1)}/7)`);
    }
    catch {
        details.push("Failed to parse patterns");
    }
    return {
        name: "Pattern Quality",
        score: Math.min(25, score),
        maxScore: 25,
        details: details.join("; "),
    };
}
function scoreOperationalHistory(acosPath) {
    let score = 0;
    const details = [];
    if (!existsSync(acosPath)) {
        return {
            name: "Operational History",
            score: 0,
            maxScore: 25,
            details: "No ACOS trajectory directory found",
        };
    }
    const files = readdirSync(acosPath).filter((f) => f.endsWith(".json") && f.includes("_traj_"));
    // Trajectory count (0-10 points)
    const countScore = Math.min(10, files.length / 5);
    score += countScore;
    details.push(`${files.length} trajectories (${countScore.toFixed(1)}/10)`);
    // Type diversity (0-8 points)
    const types = new Set();
    let totalSuccess = 0;
    let validCount = 0;
    for (const file of files) {
        try {
            const traj = JSON.parse(readFileSync(join(acosPath, file), "utf-8"));
            types.add(traj.type);
            totalSuccess += traj.successScore;
            validCount++;
        }
        catch {
            // skip
        }
    }
    const typeScore = Math.min(8, types.size * 2);
    score += typeScore;
    details.push(`${types.size} task types (${typeScore.toFixed(1)}/8)`);
    // Average success (0-7 points)
    if (validCount > 0) {
        const avg = totalSuccess / validCount;
        const avgScore = avg * 7;
        score += avgScore;
        details.push(`${(avg * 100).toFixed(0)}% avg success (${avgScore.toFixed(1)}/7)`);
    }
    return {
        name: "Operational History",
        score: Math.min(25, score),
        maxScore: 25,
        details: details.join("; "),
    };
}
function scoreLearningVelocity(memory, acosPath) {
    let score = 0;
    const details = [];
    const all = memory.getAll();
    // Recent memories (last 7 days) — shows active learning (0-10 points)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentMemories = all.filter((m) => m.createdAt > weekAgo);
    const recentScore = Math.min(10, recentMemories.length / 5);
    score += recentScore;
    details.push(`${recentMemories.length} memories this week (${recentScore.toFixed(1)}/10)`);
    // ACOS trajectory recency (0-8 points)
    if (existsSync(acosPath)) {
        const files = readdirSync(acosPath).filter((f) => f.endsWith(".json") && f.includes("_traj_"));
        let recentTrajs = 0;
        for (const file of files) {
            try {
                const traj = JSON.parse(readFileSync(join(acosPath, file), "utf-8"));
                if (traj.startedAt > weekAgo)
                    recentTrajs++;
            }
            catch {
                // skip
            }
        }
        const trajRecencyScore = Math.min(8, recentTrajs / 3);
        score += trajRecencyScore;
        details.push(`${recentTrajs} trajectories this week (${trajRecencyScore.toFixed(1)}/8)`);
    }
    // Source diversity (0-7 points): memories from different sources
    const sources = new Set(all.filter((m) => m.source).map((m) => m.source));
    const srcScore = Math.min(7, sources.size * 1.5);
    score += srcScore;
    details.push(`${sources.size} sources (${srcScore.toFixed(1)}/7)`);
    return {
        name: "Learning Velocity",
        score: Math.min(25, score),
        maxScore: 25,
        details: details.join("; "),
    };
}
// ── Grade Assignment ───────────────────────────────────────
function assignGrade(score) {
    if (score >= 90)
        return "S";
    if (score >= 80)
        return "A";
    if (score >= 70)
        return "B";
    if (score >= 60)
        return "C";
    if (score >= 40)
        return "D";
    return "F";
}
// ── Public API ─────────────────────────────────────────────
export function generateIntelligenceReport(memory, acosPath) {
    const components = [
        scoreMemoryDepth(memory),
        scorePatternQuality(acosPath),
        scoreOperationalHistory(acosPath),
        scoreLearningVelocity(memory, acosPath),
    ];
    const totalScore = Math.round(components.reduce((sum, c) => sum + c.score, 0));
    // Gather ACOS stats for the report
    const patternsFile = join(acosPath, "patterns.json");
    let acosPatterns = [];
    try {
        if (existsSync(patternsFile)) {
            acosPatterns = JSON.parse(readFileSync(patternsFile, "utf-8"));
        }
    }
    catch { /* skip */ }
    const trajFiles = existsSync(acosPath)
        ? readdirSync(acosPath).filter((f) => f.endsWith(".json") && f.includes("_traj_"))
        : [];
    let avgSuccess = 0;
    if (trajFiles.length > 0) {
        let total = 0;
        let count = 0;
        for (const file of trajFiles) {
            try {
                const traj = JSON.parse(readFileSync(join(acosPath, file), "utf-8"));
                total += traj.successScore;
                count++;
            }
            catch { /* skip */ }
        }
        avgSuccess = count > 0 ? total / count : 0;
    }
    const topPatterns = acosPatterns
        .sort((a, b) => b.avgSuccess - a.avgSuccess)
        .slice(0, 5)
        .map((p) => `${p.sequence} (${(p.avgSuccess * 100).toFixed(0)}%)`);
    return {
        totalScore,
        maxScore: 100,
        grade: assignGrade(totalScore),
        components,
        generatedAt: new Date().toISOString(),
        memoryStats: memory.getStats(),
        acosStats: {
            trajectoryCount: trajFiles.length,
            patternCount: acosPatterns.length,
            avgSuccessScore: Math.round(avgSuccess * 100) / 100,
            topPatterns,
        },
    };
}
//# sourceMappingURL=score.js.map