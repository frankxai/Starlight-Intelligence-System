#!/usr/bin/env node
/**
 * scripts/fix-agent-violations.mjs
 *
 * Automated helper to fix formatting and metadata violations for Starlight agents.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const AGENTS_DIR = join(REPO_ROOT, "agents");

// 1. Files missing frontmatter entirely
const MISSING_FRONTMATTER_SPECS = {
  "council/divine-neutral-witness.md": {
    name: "starlight-divine-neutral-witness",
    tier: "council",
    domain: "council",
    voice: "Silence, truth, and non-attached observation."
  },
  "starlight-business.md": {
    name: "starlight-business",
    tier: "universal",
    domain: "entity-architecture",
    voice: "Organizes entity, revenue, and tax-aware structure."
  },
  "starlight-embodiment.md": {
    name: "starlight-embodiment",
    tier: "universal",
    domain: "body-substrate",
    voice: "Grounded, direct, empirical athlete-architect."
  },
  "starlight-relational.md": {
    name: "starlight-relational",
    tier: "universal",
    domain: "network-architecture",
    voice: "Practical, non-manipulative network cartographer."
  },
  "starlight-visionary.md": {
    name: "starlight-visionary",
    tier: "universal",
    domain: "vision-excavation",
    voice: "First-principles axis-setter, premium and grounded."
  },
  "starlight-social-cinematic.md": {
    name: "starlight-social-cinematic",
    tier: "specialist",
    domain: "visual-production",
    voice: "Engineering cinematic visuals, image/video prompts, directing Higgsfield/Vee asset generation."
  },
  "starlight-social-factcheck.md": {
    name: "starlight-social-factcheck",
    tier: "specialist",
    domain: "claim-verification",
    voice: "Running searches, verifying claims/citations, checking links and logical math accuracy."
  },
  "starlight-social-news-analyst.md": {
    name: "starlight-social-news-analyst",
    tier: "specialist",
    domain: "real-time-news",
    voice: "Scanning AI lab releases, partner updates, tracking affiliate feature sets and tech trends."
  },
  "starlight-social-psychologist.md": {
    name: "starlight-social-psychologist",
    tier: "specialist",
    domain: "cognitive-psychology",
    voice: "Auditing audience dynamics, cognitive load, structuring hooks for organic curiosity."
  },
  "starlight-social-sentinel.md": {
    name: "starlight-social-sentinel",
    tier: "specialist",
    domain: "tone-and-publication-gating",
    voice: "Auditing social copy for brand voice, scrubbing secrets, cryptographic signing, enforcing approval gates."
  },
  "starlight-social-strategist.md": {
    name: "starlight-social-strategist",
    tier: "specialist",
    domain: "social-campaign",
    voice: "Translating blogs/releases into threads/posts, copywriting, hook engineering."
  },
  "starlight-social-vibetracker.md": {
    name: "starlight-social-vibetracker",
    tier: "specialist",
    domain: "vibe-curation",
    voice: "Tracking cultural vibes, trend matching, aligning drafts with brand aesthetic lanes."
  }
};

// 2. Energy agents missing domain/voice keys
const ENERGY_SPECS = {
  "starlight-energy-buyer.md": {
    domain: "buyer",
    voice: "Evaluates utility agreements and recommends grid sell-back paths."
  },
  "starlight-energy-cost.md": {
    domain: "cost",
    voice: "Calculates solar ROI, tax exemptions, and utility tariff plans."
  },
  "starlight-energy-grid.md": {
    domain: "grid",
    voice: "Synchronizes with municipal virtual power plant (VPP) events."
  },
  "starlight-energy-installer.md": {
    domain: "installer",
    voice: "Creates installation layouts, bill of materials, and permit files."
  },
  "starlight-energy-operations.md": {
    domain: "operations",
    voice: "Logs panel generation, flags low efficiency, and triggers repairs."
  },
  "starlight-energy-recovery.md": {
    domain: "recovery",
    voice: "Manages grid blackout alerts, battery backups, and local routing."
  },
  "starlight-energy-sizing.md": {
    domain: "sizing",
    voice: "Calculates panel setups, battery cells, and heat pump outputs."
  }
};

// 3. Core agents missing attestation footer
const MISSING_ATTESTATION_FILES = [
  "starlight-architect.md",
  "starlight-navigator.md",
  "starlight-orchestrator.md",
  "starlight-prime.md",
  "starlight-sage.md",
  "starlight-sentinel.md",
  "starlight-weaver.md",
  "starlight-social-cinematic.md",
  "starlight-social-factcheck.md",
  "starlight-social-news-analyst.md",
  "starlight-social-psychologist.md",
  "starlight-social-sentinel.md",
  "starlight-social-strategist.md",
  "starlight-social-vibetracker.md"
];

function main() {
  // Fix missing frontmatter entirely
  for (const [relPath, spec] of Object.entries(MISSING_FRONTMATTER_SPECS)) {
    const absPath = join(AGENTS_DIR, relPath);
    if (!existsSync(absPath)) {
      console.warn(`File does not exist: ${absPath}`);
      continue;
    }

    const content = readFileSync(absPath, "utf8");
    if (content.startsWith("---")) {
      console.log(`Frontmatter already exists for ${relPath}, skipping.`);
      continue;
    }

    const fm = `---
name: ${spec.name}
tier: ${spec.tier}
domain: ${spec.domain}
voice: ${spec.voice}
---
`;
    const updatedContent = fm + content;
    writeFileSync(absPath, updatedContent, "utf8");
    console.log(`Successfully added frontmatter to ${relPath}`);
  }

  // Fix energy agents (inject missing keys inside their existing frontmatter block)
  for (const [relPath, spec] of Object.entries(ENERGY_SPECS)) {
    const absPath = join(AGENTS_DIR, relPath);
    if (!existsSync(absPath)) {
      console.warn(`File does not exist: ${absPath}`);
      continue;
    }

    const content = readFileSync(absPath, "utf8");
    if (!content.startsWith("---")) {
      console.warn(`File is missing frontmatter block completely: ${relPath}`);
      continue;
    }

    const endFmIndex = content.indexOf("\n---", 3);
    if (endFmIndex === -1) {
      console.warn(`Malformed frontmatter for ${relPath}`);
      continue;
    }

    const fmBlock = content.slice(3, endFmIndex);
    const bodyBlock = content.slice(endFmIndex + 4);

    let updatedFm = fmBlock;
    if (!fmBlock.includes("domain:")) {
      updatedFm += `\ndomain: ${spec.domain}`;
    }
    if (!fmBlock.includes("voice:")) {
      updatedFm += `\nvoice: ${spec.voice}`;
    }

    const updatedContent = `---${updatedFm}\n---${bodyBlock}`;
    writeFileSync(absPath, updatedContent, "utf8");
    console.log(`Successfully injected missing keys into ${relPath}`);
  }

  // Fix missing attestation footer
  for (const relPath of MISSING_ATTESTATION_FILES) {
    const absPath = join(AGENTS_DIR, relPath);
    if (!existsSync(absPath)) {
      console.warn(`File does not exist: ${absPath}`);
      continue;
    }

    let content = readFileSync(absPath, "utf8");
    if (content.includes("Built on SIP") || content.includes("Starlight Intelligence Protocol")) {
      console.log(`Attestation already exists for ${relPath}, skipping.`);
      continue;
    }

    // Append attestation block
    const attestationBlock = `

---
**Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)**
- Substrate: starlightintelligence.org/protocol v1.1.1
- Layers: [file-contract, attestation, sovereignty, agent-profile]
`;
    content = content.trimEnd() + attestationBlock;
    writeFileSync(absPath, content, "utf8");
    console.log(`Successfully added attestation block to ${relPath}`);
  }

  console.log("\nFixes complete!");
}

main();
