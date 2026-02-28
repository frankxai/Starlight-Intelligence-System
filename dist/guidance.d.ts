/**
 * Guidance Engine v2 — Actionable Behavioral Intelligence
 *
 * Generates CONCRETE behavioral instructions from trajectory analysis.
 * Not statistics. Not dashboards. Runbooks.
 *
 * The shift: "Edit > Read > Bash works 89%" → useless
 *           "Always verify builds after multi-file edits" → actionable
 *
 * Architecture: trajectories → distillation → behavioral rules → markdown
 *
 * Output: Markdown injected as system-reminder at session start.
 * The LLM reads these as instructions, not FYI.
 */
import { MemoryManager } from "./memory.js";
export interface GuidanceOptions {
    /** Project name for context (e.g., "frankx", "acos", "arcanea") */
    project: string;
    /** Path to ACOS trajectories directory for this project */
    acosPath: string;
    /** Maximum lines in guidance output */
    maxLines?: number;
}
export interface GuidanceResult {
    /** The generated markdown guidance */
    markdown: string;
    /** Stats about what informed the guidance */
    stats: {
        trajectoriesAnalyzed: number;
        patternsAnalyzed: number;
        memoriesConsulted: number;
        projectsKnown: string[];
        rulesGenerated: number;
    };
}
export declare function generateGuidance(memory: MemoryManager, options: GuidanceOptions): GuidanceResult;
//# sourceMappingURL=guidance.d.ts.map