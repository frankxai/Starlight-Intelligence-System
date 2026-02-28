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

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import type { MemoryEntry } from "./types.js";
import { MemoryManager } from "./memory.js";
import type { ACOSPattern, ACOSTrajectory } from "./sync.js";

// ── Types ────────────────────────────────────────────────────

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

interface BehavioralRule {
  instruction: string;
  evidence: string;
  priority: number; // 1=critical, 2=important, 3=helpful
  domain: string;
}

interface FailureLesson {
  lesson: string;
  domain: string;
  occurrences: number;
  avgScore: number;
}

interface DomainChecklist {
  domain: string;
  label: string;
  items: string[];
  avgSuccess: number;
  sessionCount: number;
}

// ── Guidance Generator ───────────────────────────────────────

export function generateGuidance(
  memory: MemoryManager,
  options: GuidanceOptions
): GuidanceResult {
  const { project, acosPath, maxLines = 40 } = options;

  const patterns = loadPatterns(acosPath);
  const trajectories = loadTrajectories(acosPath);
  const allMemories = memory.getAll();

  // Distill intelligence
  const rules = distillBehavioralRules(trajectories, patterns);
  const lessons = distillFailureLessons(trajectories);
  const checklists = generateDomainChecklists(trajectories, patterns);
  const crossProject = extractCrossProjectInsights(allMemories, project);

  // Build markdown — every line must be an INSTRUCTION the LLM can follow
  const sections: string[] = [];

  sections.push(`## SIS Behavioral Guidance — ${project}`);
  sections.push(`_${trajectories.length} sessions analyzed. Follow these rules._\n`);

  // Section 1: Behavioral rules — the most actionable content
  const criticalRules = rules.filter((r) => r.priority <= 2);
  if (criticalRules.length > 0) {
    sections.push("### Rules (follow these)");
    for (const rule of criticalRules.slice(0, 6)) {
      sections.push(`- ${rule.instruction} _(${rule.evidence})_`);
    }
    sections.push("");
  }

  // Section 2: Failure lessons — what to NOT do
  if (lessons.length > 0) {
    sections.push("### Learned from failures");
    for (const lesson of lessons.slice(0, 4)) {
      sections.push(`- ${lesson.lesson} _(${lesson.domain}, ${lesson.occurrences} incidents, ${(lesson.avgScore * 100).toFixed(0)}% avg)_`);
    }
    sections.push("");
  }

  // Section 3: Domain checklists — concrete completion criteria
  const weakDomains = checklists.filter((c) => c.avgSuccess < 0.70 && c.sessionCount >= 2);
  if (weakDomains.length > 0) {
    sections.push("### Checklists for weak domains");
    for (const cl of weakDomains.slice(0, 3)) {
      sections.push(`**${cl.label}** (${(cl.avgSuccess * 100).toFixed(0)}% avg, ${cl.sessionCount} sessions):`);
      for (const item of cl.items) {
        sections.push(`  - ${item}`);
      }
    }
    sections.push("");
  }

  // Section 4: Cross-project insights (only if truly cross-project)
  if (crossProject.length > 0) {
    sections.push("### Cross-project intelligence");
    for (const insight of crossProject.slice(0, 3)) {
      sections.push(`- ${insight}`);
    }
    sections.push("");
  }

  // Section 5: Strength acknowledgment — reinforce what works
  const strongDomains = checklists.filter((c) => c.avgSuccess >= 0.80 && c.sessionCount >= 3);
  if (strongDomains.length > 0) {
    sections.push("### Strengths (maintain these)");
    for (const sd of strongDomains.slice(0, 3)) {
      sections.push(`- **${sd.label}**: ${(sd.avgSuccess * 100).toFixed(0)}% success across ${sd.sessionCount} sessions — keep current approach`);
    }
    sections.push("");
  }

  // Trim to maxLines
  let markdown = sections.join("\n");
  const lines = markdown.split("\n");
  if (lines.length > maxLines) {
    markdown = lines.slice(0, maxLines).join("\n") + "\n...";
  }

  // Discover known projects from memory sources
  const projectsKnown = new Set<string>();
  projectsKnown.add(project);
  for (const mem of allMemories) {
    if (mem.source) {
      const match = mem.source.match(/project:(\w+)/);
      if (match) projectsKnown.add(match[1]);
    }
  }

  return {
    markdown,
    stats: {
      trajectoriesAnalyzed: trajectories.length,
      patternsAnalyzed: patterns.length,
      memoriesConsulted: allMemories.length,
      projectsKnown: Array.from(projectsKnown),
      rulesGenerated: rules.length,
    },
  };
}

// ── Data Loaders ─────────────────────────────────────────────

function loadPatterns(acosPath: string): ACOSPattern[] {
  const patternsFile = join(acosPath, "patterns.json");
  if (!existsSync(patternsFile)) return [];
  try {
    return JSON.parse(readFileSync(patternsFile, "utf-8")) as ACOSPattern[];
  } catch {
    return [];
  }
}

function loadTrajectories(acosPath: string): ACOSTrajectory[] {
  if (!existsSync(acosPath)) return [];
  const trajectories: ACOSTrajectory[] = [];
  try {
    const files = readdirSync(acosPath).filter(
      (f) => f.endsWith(".json") && f.includes("_traj_")
    );
    for (const file of files) {
      try {
        const traj = JSON.parse(
          readFileSync(join(acosPath, file), "utf-8")
        ) as ACOSTrajectory;
        trajectories.push(traj);
      } catch { /* skip malformed */ }
    }
  } catch { /* skip */ }
  return trajectories;
}

// ── Distillation Engine ──────────────────────────────────────
// This is where raw data becomes actionable intelligence.

const DOMAIN_LABELS: Record<string, string> = {
  code_development: "Code development",
  deployment: "Deployment",
  skill_execution: "Skill execution",
  content_creation: "Content creation",
  music_production: "Music production",
  general: "General tasks",
  research: "Research",
  design: "Design",
  testing: "Testing",
  prototyping: "Prototyping",
};

/**
 * Distill behavioral rules from trajectory patterns.
 * Each rule is a concrete instruction the LLM can follow.
 */
function distillBehavioralRules(
  trajectories: ACOSTrajectory[],
  patterns: ACOSPattern[]
): BehavioralRule[] {
  const rules: BehavioralRule[] = [];

  // Rule source 1: High-success trajectories that end with verification
  const successfulWithVerify = trajectories.filter(
    (t) => t.successScore >= 0.90 && t.toolBreakdown["Bash"] && t.toolBreakdown["Bash"] >= 2
  );
  const successfulWithoutVerify = trajectories.filter(
    (t) => t.successScore >= 0.90 && (!t.toolBreakdown["Bash"] || t.toolBreakdown["Bash"] < 2)
  );
  if (successfulWithVerify.length > successfulWithoutVerify.length * 0.5) {
    const avgWithVerify = avg(successfulWithVerify.map((t) => t.successScore));
    rules.push({
      instruction: "After multi-file changes, run a verification command (build, test, or lint) before marking complete",
      evidence: `${successfulWithVerify.length} verified sessions avg ${pct(avgWithVerify)}`,
      priority: 1,
      domain: "all",
    });
  }

  // Rule source 2: Read-before-edit pattern
  const readBeforeEdit = patterns.filter(
    (p) => p.sequence.startsWith("Read > Edit") && p.avgSuccess >= 0.80 && p.count >= 2
  );
  const editWithoutRead = patterns.filter(
    (p) => p.sequence.startsWith("Edit") && !p.sequence.startsWith("Edit > Read > Edit") && p.avgSuccess < 0.70
  );
  if (readBeforeEdit.length > 0) {
    rules.push({
      instruction: "Always Read a file before editing it — never edit blind",
      evidence: `Read-first patterns avg ${pct(avg(readBeforeEdit.map((p) => p.avgSuccess)))} vs blind edits lower`,
      priority: 1,
      domain: "all",
    });
  }

  // Rule source 3: Task delegation for complex work
  const withDelegation = trajectories.filter(
    (t) => t.toolBreakdown["Task"] && t.toolBreakdown["Task"] >= 1 && t.operationCount >= 20
  );
  const withoutDelegation = trajectories.filter(
    (t) => !t.toolBreakdown["Task"] && t.operationCount >= 20
  );
  if (withDelegation.length >= 3 && withoutDelegation.length >= 3) {
    const avgWith = avg(withDelegation.map((t) => t.successScore));
    const avgWithout = avg(withoutDelegation.map((t) => t.successScore));
    if (avgWith > avgWithout + 0.05) {
      rules.push({
        instruction: `For complex tasks (20+ operations), use Task agents to parallelize work`,
        evidence: `Delegated: ${pct(avgWith)} vs solo: ${pct(avgWithout)} (${withDelegation.length} sessions)`,
        priority: 2,
        domain: "all",
      });
    }
  }

  // Rule source 4: Domain-specific tool preferences
  const domainToolSuccess = new Map<string, Map<string, { success: number; count: number }>>();
  for (const traj of trajectories) {
    const domain = traj.type || "general";
    if (!domainToolSuccess.has(domain)) {
      domainToolSuccess.set(domain, new Map());
    }
    const toolMap = domainToolSuccess.get(domain)!;
    for (const [tool, count] of Object.entries(traj.toolBreakdown || {})) {
      if (!toolMap.has(tool)) {
        toolMap.set(tool, { success: 0, count: 0 });
      }
      const entry = toolMap.get(tool)!;
      entry.success += traj.successScore * count;
      entry.count += count;
    }
  }

  for (const [domain, toolMap] of domainToolSuccess) {
    const label = DOMAIN_LABELS[domain] || domain;
    const bestTool = Array.from(toolMap.entries())
      .map(([tool, stats]) => ({ tool, avgSuccess: stats.success / stats.count, count: stats.count }))
      .filter((t) => t.count >= 5)
      .sort((a, b) => b.avgSuccess - a.avgSuccess)[0];

    if (bestTool && bestTool.avgSuccess >= 0.80) {
      rules.push({
        instruction: `For ${label.toLowerCase()} tasks, lean on ${bestTool.tool} tool (highest success rate in this domain)`,
        evidence: `${pct(bestTool.avgSuccess)} avg across ${bestTool.count} uses`,
        priority: 3,
        domain,
      });
    }
  }

  // Rule source 5: Session length correlation with success
  const shortSessions = trajectories.filter((t) => t.operationCount <= 15);
  const longSessions = trajectories.filter((t) => t.operationCount > 50);
  if (shortSessions.length >= 5 && longSessions.length >= 5) {
    const shortAvg = avg(shortSessions.map((t) => t.successScore));
    const longAvg = avg(longSessions.map((t) => t.successScore));
    if (shortAvg > longAvg + 0.10) {
      rules.push({
        instruction: "Break large tasks into smaller focused sessions rather than one marathon session",
        evidence: `Short sessions (<=15 ops): ${pct(shortAvg)} vs long (50+): ${pct(longAvg)}`,
        priority: 2,
        domain: "all",
      });
    }
  }

  // Rule source 6: File modification patterns
  const fileHeavy = trajectories.filter((t) => t.filesModified.length > 10);
  const fileFocused = trajectories.filter((t) => t.filesModified.length > 0 && t.filesModified.length <= 5);
  if (fileHeavy.length >= 3 && fileFocused.length >= 3) {
    const heavyAvg = avg(fileHeavy.map((t) => t.successScore));
    const focusedAvg = avg(fileFocused.map((t) => t.successScore));
    if (focusedAvg > heavyAvg + 0.08) {
      rules.push({
        instruction: "Prefer focused changes (<=5 files) over scattered edits — higher success when changes are concentrated",
        evidence: `Focused: ${pct(focusedAvg)} vs scattered (10+ files): ${pct(heavyAvg)}`,
        priority: 2,
        domain: "all",
      });
    }
  }

  return rules.sort((a, b) => a.priority - b.priority);
}

/**
 * Extract lessons from failure trajectories.
 * Not "testing is at 54%" but "testing fails when X happens — do Y instead."
 */
function distillFailureLessons(trajectories: ACOSTrajectory[]): FailureLesson[] {
  const failures = trajectories.filter((t) => t.successScore <= 0.50);
  if (failures.length === 0) return [];

  // Group failures by domain
  const domainFailures = new Map<string, ACOSTrajectory[]>();
  for (const f of failures) {
    const domain = f.type || "general";
    if (!domainFailures.has(domain)) {
      domainFailures.set(domain, []);
    }
    domainFailures.get(domain)!.push(f);
  }

  const lessons: FailureLesson[] = [];

  for (const [domain, fails] of domainFailures) {
    const label = DOMAIN_LABELS[domain] || domain;
    const avgScore = avg(fails.map((f) => f.successScore));

    // Analyze common failure patterns
    const avgOps = avg(fails.map((f) => f.operationCount));
    const avgFiles = avg(fails.map((f) => f.filesModified.length));

    // Determine dominant tools in failures
    const toolCounts = new Map<string, number>();
    for (const f of fails) {
      for (const [tool, count] of Object.entries(f.toolBreakdown || {})) {
        toolCounts.set(tool, (toolCounts.get(tool) || 0) + count);
      }
    }
    const dominantTool = Array.from(toolCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Generate specific lesson based on failure characteristics
    if (avgOps > 40) {
      lessons.push({
        lesson: `${label} sessions fail when they become too long (avg ${Math.round(avgOps)} ops). Break into smaller, verifiable steps.`,
        domain,
        occurrences: fails.length,
        avgScore,
      });
    } else if (avgFiles > 8) {
      lessons.push({
        lesson: `${label} fails when touching too many files (avg ${Math.round(avgFiles)}). Focus changes and verify incrementally.`,
        domain,
        occurrences: fails.length,
        avgScore,
      });
    } else if (dominantTool && dominantTool[0] === "Bash" && dominantTool[1] > fails.length * 5) {
      lessons.push({
        lesson: `${label} failures correlate with excessive shell commands. Use dedicated tools (Read, Edit, Grep) instead of bash when possible.`,
        domain,
        occurrences: fails.length,
        avgScore,
      });
    } else {
      // Successful sessions in same domain — what did they do differently?
      const successes = trajectories.filter(
        (t) => t.type === domain && t.successScore >= 0.80
      );
      if (successes.length > 0) {
        const successAvgOps = avg(successes.map((t) => t.operationCount));
        if (successAvgOps < avgOps * 0.6) {
          lessons.push({
            lesson: `Successful ${label.toLowerCase()} sessions use ~${Math.round(successAvgOps)} ops vs failed ones at ~${Math.round(avgOps)}. Aim for efficiency.`,
            domain,
            occurrences: fails.length,
            avgScore,
          });
        } else {
          lessons.push({
            lesson: `${label} has a ${pct(avgScore)} success rate across ${fails.length} sessions. Consider using specialized skills or breaking tasks down.`,
            domain,
            occurrences: fails.length,
            avgScore,
          });
        }
      } else {
        lessons.push({
          lesson: `${label} has no successful reference sessions. Build up expertise with smaller tasks first.`,
          domain,
          occurrences: fails.length,
          avgScore,
        });
      }
    }
  }

  return lessons.sort((a, b) => a.avgScore - b.avgScore);
}

/**
 * Generate domain-specific checklists.
 * "For deployment tasks, always: 1) verify build 2) check routes 3) confirm env vars"
 */
function generateDomainChecklists(
  trajectories: ACOSTrajectory[],
  patterns: ACOSPattern[]
): DomainChecklist[] {
  const domainGroups = new Map<string, ACOSTrajectory[]>();
  for (const traj of trajectories) {
    const domain = traj.type || "general";
    if (!domainGroups.has(domain)) {
      domainGroups.set(domain, []);
    }
    domainGroups.get(domain)!.push(traj);
  }

  const checklists: DomainChecklist[] = [];

  for (const [domain, trajs] of domainGroups) {
    if (trajs.length < 2) continue;

    const label = DOMAIN_LABELS[domain] || domain;
    const avgSuccess = avg(trajs.map((t) => t.successScore));
    const items: string[] = [];

    // Analyze what successful sessions in this domain do
    const successful = trajs.filter((t) => t.successScore >= 0.80);
    const failed = trajs.filter((t) => t.successScore < 0.60);

    // Check 1: Do successful sessions use Read before Edit?
    const successReadFirst = successful.filter(
      (t) => t.toolBreakdown["Read"] && t.toolBreakdown["Edit"] &&
        t.toolBreakdown["Read"] >= t.toolBreakdown["Edit"]
    ).length;
    if (successful.length > 0 && successReadFirst / successful.length >= 0.7) {
      items.push("Read files before editing (proven pattern in this domain)");
    }

    // Check 2: Do successful sessions verify with Bash?
    const successVerify = successful.filter(
      (t) => t.toolBreakdown["Bash"] && t.toolBreakdown["Bash"] >= 1
    ).length;
    if (successful.length > 0 && successVerify / successful.length >= 0.8) {
      items.push("Run verification command (build/test/lint) before completing");
    }

    // Check 3: File scope
    if (successful.length >= 3) {
      const avgSuccessFiles = avg(successful.map((t) => t.filesModified.length));
      if (avgSuccessFiles <= 8) {
        items.push(`Keep changes focused — successful sessions avg ${Math.round(avgSuccessFiles)} files`);
      }
    }

    // Check 4: Domain-specific file patterns
    if (domain === "deployment") {
      const touchesConfig = successful.filter(
        (t) => t.filesModified.some((f) =>
          f.includes("config") || f.includes(".env") || f.includes("package.json")
        )
      );
      if (touchesConfig.length > 0) {
        items.push("Verify config/env changes don't break other environments");
      }
    }

    if (domain === "code_development") {
      const touchesComponents = successful.filter(
        (t) => t.filesModified.some((f) => f.includes("component") || f.endsWith(".tsx"))
      );
      if (touchesComponents.length / Math.max(1, successful.length) >= 0.5) {
        items.push("After component changes, verify imports and check for type errors");
      }
    }

    // Check 5: Task delegation in this domain
    if (successful.length >= 3) {
      const usesTasks = successful.filter(
        (t) => t.toolBreakdown["Task"] && t.toolBreakdown["Task"] >= 1
      ).length;
      if (usesTasks / successful.length >= 0.4) {
        items.push("Use Task agents for research and parallel work in this domain");
      }
    }

    // Generic fallback if no specific items
    if (items.length === 0 && avgSuccess < 0.70) {
      items.push("Break work into smaller verifiable steps");
      items.push("Verify each change before moving to the next");
    }

    checklists.push({
      domain,
      label,
      items,
      avgSuccess,
      sessionCount: trajs.length,
    });
  }

  return checklists.sort((a, b) => a.avgSuccess - b.avgSuccess);
}

/**
 * Extract insights that genuinely cross project boundaries.
 * Only works when memories have project: source prefix (from multi-sync).
 */
function extractCrossProjectInsights(
  memories: MemoryEntry[],
  currentProject: string
): string[] {
  const insights: string[] = [];

  // Find patterns that appear across multiple projects
  const patternsByContent = new Map<string, Set<string>>();
  for (const mem of memories) {
    if (mem.category === "pattern" && mem.source) {
      const projectMatch = mem.source.match(/project:(\w+)/);
      if (!projectMatch) continue; // Skip memories without project tagging
      const project = projectMatch[1];
      if (!patternsByContent.has(mem.content)) {
        patternsByContent.set(mem.content, new Set());
      }
      patternsByContent.get(mem.content)!.add(project);
    }
  }

  for (const [content, projects] of patternsByContent) {
    if (projects.size > 1) {
      // Extract the actionable part of the pattern content
      const seqMatch = content.match(/Tool sequence "([^"]+)"/);
      const seq = seqMatch ? seqMatch[1] : content.slice(0, 80);
      insights.push(
        `Pattern validated across ${Array.from(projects).join(" + ")}: \`${seq}\``
      );
    }
  }

  // Find high-confidence lessons from other projects that apply here
  const otherProjectLessons = memories.filter(
    (m) =>
      (m.category === "error" || m.category === "pattern") &&
      m.confidence >= 0.80 &&
      m.source?.includes("project:") &&
      !m.source?.includes(`project:${currentProject}`)
  );

  for (const lesson of otherProjectLessons.slice(0, 3)) {
    const sourceMatch = lesson.source?.match(/project:(\w+)/);
    const sourceProject = sourceMatch ? sourceMatch[1] : "other";
    const prefix = lesson.category === "error" ? "Avoid" : "Proven in";
    insights.push(`${prefix} ${sourceProject}: ${lesson.content.slice(0, 100)}`);
  }

  return insights;
}

// ── Utilities ────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}
