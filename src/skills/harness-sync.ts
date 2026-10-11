/**
 * Starlight Intelligence System — Universal 10-Harness Sync Engine
 *
 * Detects active developer harnesses in a workspace, renders their native
 * syntax schemas, and projects configuration files directly to disk with
 * zero friction, conflict preservation, and dry-run auditing.
 *
 * Supported Harnesses:
 *   1. Claude Code (.claude/config.json & .claude/commands/)
 *   2. OpenAI Codex (.codex/skills.json)
 *   3. Antigravity (.antigravity/skills.json)
 *   4. Grok CLI (grok-skills.json)
 *   5. Hermes Agent (hermes-skills.json)
 *   6. Gemini CLI (gemini-skills.yaml)
 *   7. Cursor IDE (.cursorrules & .cursor/rules/)
 *   8. OpenCode (opencode.json)
 *   9. Kilo Code (kilo.json)
 *  10. Windsurf Cascade (windsurf.json)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { generateHarnessConfig } from "./harness-configurator.js";
import { scanWorkspaceSkills } from "./skill-scanner.js";
import type { HarnessTarget, SkillDefinition } from "./types.js";

export interface HarnessInfo {
  id: HarnessTarget;
  name: string;
  vendor: string;
  configPath: string;
  markerFound?: string;
  detected: boolean;
}

export const SUPPORTED_HARNESS_REGISTRY: Array<{
  id: HarnessTarget;
  name: string;
  vendor: string;
  configPath: string;
  markers: string[];
}> = [
  {
    id: "claude-code",
    name: "Claude Code",
    vendor: "Anthropic",
    configPath: ".claude/skills.json",
    markers: [".claude", ".claude.json", "CLAUDE.md"],
  },
  {
    id: "codex",
    name: "OpenAI Codex CLI",
    vendor: "OpenAI",
    configPath: ".codex/skills.json",
    markers: [".codex", "AGENTS.md"],
  },
  {
    id: "antigravity",
    name: "Deepmind Antigravity",
    vendor: "Google DeepMind",
    configPath: ".antigravity/skills.json",
    markers: [".antigravity", ".gemini/antigravity-cli"],
  },
  {
    id: "grok",
    name: "xAI Grok Build",
    vendor: "xAI",
    configPath: "grok-skills.json",
    markers: ["grok-skills.json", ".grok"],
  },
  {
    id: "hermes",
    name: "Hermes Agent",
    vendor: "Nous Research",
    configPath: "hermes-skills.json",
    markers: ["hermes-skills.json", ".hermes"],
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    vendor: "Google",
    configPath: "gemini-skills.yaml",
    markers: ["gemini-skills.json", "gemini-skills.yaml", "GEMINI.md"],
  },
  {
    id: "cursor",
    name: "Cursor Composer",
    vendor: "Anysphere",
    configPath: ".cursor/rules/starlight.mdc",
    markers: [".cursorrules", ".cursor"],
  },
  {
    id: "opencode",
    name: "OpenCode Agent",
    vendor: "OpenCode Community",
    configPath: "opencode.json",
    markers: ["opencode.json", ".opencode"],
  },
  {
    id: "kilo",
    name: "Kilo Code",
    vendor: "Kilo Labs",
    configPath: "kilo.json",
    markers: ["kilo.json", ".kilo"],
  },
  {
    id: "windsurf",
    name: "Windsurf Cascade",
    vendor: "Codeium",
    configPath: "windsurf.json",
    markers: ["windsurf.json", ".windsurfrules"],
  },
];

export const ALL_SUPPORTED_HARNESSES: HarnessTarget[] = SUPPORTED_HARNESS_REGISTRY.map((h) => h.id);

export interface HarnessSyncOptions {
  workspaceRoot?: string;
  harnesses?: HarnessTarget[];
  targets?: HarnessTarget[];
  all?: boolean;
  skills?: SkillDefinition[];
  skillsDir?: string;
  dryRun?: boolean;
  backup?: boolean;
  projectName?: string;
  customOutDir?: string;
}

export interface ProjectedConfigFile {
  relativePath: string;
  absolutePath: string;
  bytes: number;
  format: string;
  harness: HarnessTarget;
}

export interface HarnessSyncResult {
  success: boolean;
  workspaceRoot: string;
  detectedHarnesses: HarnessTarget[];
  discoveredHarnesses: HarnessTarget[];
  syncedHarnesses: HarnessTarget[];
  targetHarnesses: HarnessTarget[];
  projectedFiles: ProjectedConfigFile[];
  writtenFiles: ProjectedConfigFile[];
  backupFiles: string[];
  backedUpFiles: string[];
  warnings: string[];
  dryRun: boolean;
  activeSkillsCount: number;
}

/**
 * Discovers active harnesses in a project workspace by inspecting marker directories and files.
 */
export function discoverInstalledHarnesses(workspaceRoot: string = process.cwd()): HarnessInfo[] {
  return SUPPORTED_HARNESS_REGISTRY.map((h) => {
    let detected = false;
    let markerFound: string | undefined;

    for (const m of h.markers) {
      if (existsSync(join(workspaceRoot, m))) {
        detected = true;
        markerFound = m;
        break;
      }
    }

    return {
      id: h.id,
      name: h.name,
      vendor: h.vendor,
      configPath: h.configPath,
      markerFound,
      detected,
    };
  });
}

/**
 * Syncs skill configurations across active or specified harnesses in the workspace.
 */
export function syncHarnessConfigs(
  options: HarnessSyncOptions = {}
): HarnessSyncResult {
  const root = options.customOutDir ?? options.workspaceRoot ?? process.cwd();
  const dryRun = options.dryRun ?? false;
  const backup = options.backup ?? true;
  const projectName = options.projectName ?? "starlight-agent";
  const warnings: string[] = [];

  // 1. Resolve skills to project
  let skills = options.skills;
  if (!skills || skills.length === 0) {
    const scanDir = options.skillsDir ?? join(root, "skills");
    if (existsSync(scanDir)) {
      const scanResult = scanWorkspaceSkills(scanDir);
      skills = scanResult.skillsFound.map((s) => ({
        name: s.name,
        version: "1.0.0",
        description: `Discovered workspace skill ${s.name} in domain ${s.domain}`,
        domain: s.domain,
        contextBudgetTokens: s.estimatedTokens,
        triggers: { keywords: s.triggersDetected },
      }));
    } else {
      // Fallback baseline skills
      skills = [
        {
          name: "safety/secret-detector",
          version: "1.0.0",
          description: "Zero-trust PII & credential scrubbing gateway",
          domain: "safety",
        },
        {
          name: "orchestration/multi-agent-coordination",
          version: "1.0.0",
          description: "Hierarchical multi-agent swarm coordination",
          domain: "orchestration",
        },
      ];
    }
  }

  // 2. Discover or filter target harnesses
  const discoveredInfos = discoverInstalledHarnesses(root);
  const detected = discoveredInfos.filter((h) => h.detected).map((h) => h.id);

  let targets: HarnessTarget[] = [];
  const requested = options.harnesses ?? options.targets;

  if (options.all) {
    targets = [...ALL_SUPPORTED_HARNESSES];
  } else if (requested && requested.length > 0) {
    targets = requested;
  } else if (detected.length > 0) {
    targets = detected;
  } else {
    // Default to primary triad if zero detected in bare workspace
    targets = ["claude-code", "codex", "antigravity"];
    warnings.push("No harness markers found on disk; defaulted to baseline triad (claude-code, codex, antigravity)");
  }

  const projectedFiles: ProjectedConfigFile[] = [];
  const backupFiles: string[] = [];

  // 3. Generate and project configs for each harness
  for (const target of targets) {
    const config = generateHarnessConfig(target, skills, { projectName });

    for (const outputFile of config.outputFiles) {
      const destPath = join(root, outputFile.relativePath);

      if (!dryRun) {
        // Back up existing configuration if present and backup is requested
        if (backup && existsSync(destPath)) {
          const backupPath = `${destPath}.${Date.now()}.bak`;
          try {
            copyFileSync(destPath, backupPath);
            backupFiles.push(backupPath);
          } catch {
            warnings.push(`Could not backup existing file at ${destPath}`);
          }
        }

        const destDir = dirname(destPath);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }

        writeFileSync(destPath, outputFile.content, "utf8");
      }

      projectedFiles.push({
        relativePath: outputFile.relativePath,
        absolutePath: destPath,
        bytes: Buffer.byteLength(outputFile.content, "utf8"),
        format: outputFile.format,
        harness: target,
      });
    }
  }

  return {
    success: true,
    workspaceRoot: root,
    detectedHarnesses: detected,
    discoveredHarnesses: detected,
    syncedHarnesses: targets,
    targetHarnesses: targets,
    projectedFiles,
    writtenFiles: projectedFiles,
    backupFiles,
    backedUpFiles: backupFiles,
    warnings,
    dryRun,
    activeSkillsCount: skills.length,
  };
}
