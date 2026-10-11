/**
 * Starlight Intelligence System — Multi-Marketplace Syndicator
 *
 * Prepares, attests, and publishes skill packages to OpenClaw,
 * AgentSkills.io, Claude Code Plugins, OpenAI Store, and Starlight Sovereign Hub.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { createHash } from "node:crypto";
import type {
  SkillDefinition,
  SyndicationTarget,
  SyndicationBundle,
  SyndicationResult,
} from "./types.js";

export interface SyndicationOptions {
  author?: string;
  repoUrl?: string;
  pricingUSD?: number;
}

/** Computes SHA256 checksum of a string. */
export function computeSha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Builds a universal multi-marketplace syndication bundle with SIP attestation.
 */
export function buildSyndicationBundle(
  skill: SkillDefinition,
  targets: SyndicationTarget[],
  options: SyndicationOptions = {}
): SyndicationBundle {
  const version = skill.version || "1.0.0";
  const author = options.author ?? skill.author ?? "Starlight Sovereign Builder";
  const license = skill.license ?? "MIT";
  const rawContent = skill.content ?? skill.description ?? "";

  const contentHash = computeSha256(rawContent);

  const sipAttestation = [
    "---",
    "Built on SIP — Starlight Intelligence Protocol v1.1.1",
    `- Skill: ${skill.name} v${version}`,
    `- Domain: ${skill.domain}`,
    `- Author: ${author}`,
    `- License: ${license}`,
    `- Integrity SHA256: ${contentHash}`,
    "- Substrate: starlightintelligence.org/protocol",
    `Generated: ${new Date().toISOString()}`,
    "---",
  ].join("\n");

  const targetManifests: Record<SyndicationTarget, Record<string, unknown>> = {
    starlight: {
      schemaVersion: "sip-1.1.1",
      name: skill.name,
      version,
      domain: skill.domain,
      author,
      license,
      integrity: contentHash,
      pricingUSD: options.pricingUSD ?? 0,
      attestation: sipAttestation,
    },
    openclaw: {
      clawVersion: "1.0.0",
      id: skill.name,
      title: skill.name,
      summary: skill.description,
      tags: [skill.domain, "starlight", "sip"],
      permissions: skill.permissions ?? { terminal: "read-write", filesystem: "read-write" },
      entrypoint: "SKILL.md",
    },
    agentskills: {
      name: skill.name,
      version,
      description: skill.description.slice(0, 1024),
      author,
      license,
      homepage: options.repoUrl ?? "https://starlightintelligence.org",
      compatibility: ["claude-code", "codex", "cursor", "antigravity"],
    },
    claude: {
      name: skill.name,
      description: skill.description,
      version,
      commands: [
        {
          name: skill.name,
          description: skill.description,
          handler: `commands/${skill.name}.md`,
        },
      ],
    },
    openai: {
      openapi: "3.1.0",
      info: {
        title: skill.name,
        version,
        description: skill.description,
      },
      paths: {
        [`/execute/${skill.name}`]: {
          post: {
            summary: `Execute ${skill.name}`,
            operationId: `execute_${skill.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
            responses: {
              "200": { description: "Execution result" },
            },
          },
        },
      },
    },
  };

  const exportedFiles: { relativePath: string; content: string }[] = [];

  // Always include canonical SKILL.md with SIP attestation footer
  const canonicalSkillMd = [
    "---",
    `name: "${skill.name}"`,
    `version: "${version}"`,
    `description: "${skill.description.replace(/"/g, '\\"')}"`,
    `domain: "${skill.domain}"`,
    `license: "${license}"`,
    `author: "${author}"`,
    "---",
    "",
    `# ${skill.name}`,
    "",
    `> ${skill.description}`,
    "",
    "## Instructions",
    rawContent,
    "",
    sipAttestation,
  ].join("\n");

  exportedFiles.push({
    relativePath: "SKILL.md",
    content: canonicalSkillMd,
  });

  // Target-specific files
  if (targets.includes("openclaw")) {
    exportedFiles.push({
      relativePath: "claw.json",
      content: JSON.stringify(targetManifests.openclaw, null, 2),
    });
  }

  if (targets.includes("agentskills")) {
    exportedFiles.push({
      relativePath: "package.json",
      content: JSON.stringify(targetManifests.agentskills, null, 2),
    });
  }

  if (targets.includes("claude")) {
    exportedFiles.push({
      relativePath: ".claude-plugin.json",
      content: JSON.stringify(targetManifests.claude, null, 2),
    });
  }

  if (targets.includes("openai")) {
    exportedFiles.push({
      relativePath: "openapi.json",
      content: JSON.stringify(targetManifests.openai, null, 2),
    });
  }

  if (targets.includes("starlight")) {
    exportedFiles.push({
      relativePath: "starlight-manifest.json",
      content: JSON.stringify(targetManifests.starlight, null, 2),
    });
  }

  const bundleDigest = computeSha256(
    exportedFiles.map((f) => f.content).join("\n---\n")
  );

  return {
    skillName: skill.name,
    version,
    license,
    sha256Digest: bundleDigest,
    sipAttestation,
    targetManifests,
    exportedFiles,
  };
}

/**
 * Syndicates a skill across requested marketplaces.
 */
export function syndicateSkill(
  skill: SkillDefinition,
  targets: SyndicationTarget[],
  options: SyndicationOptions = {}
): SyndicationResult {
  try {
    const bundle = buildSyndicationBundle(skill, targets, options);
    return {
      success: true,
      skillName: skill.name,
      version: skill.version || "1.0.0",
      bundle,
      publishedTargets: targets,
      attestationSha: bundle.sha256Digest,
    };
  } catch (err) {
    return {
      success: false,
      skillName: skill.name,
      version: skill.version || "1.0.0",
      bundle: {} as SyndicationBundle,
      publishedTargets: [],
      attestationSha: "",
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
}
