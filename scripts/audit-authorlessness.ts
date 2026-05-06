#!/usr/bin/env tsx
/**
 * scripts/audit-authorlessness.ts — operational test for SIP § 5 item 7
 *
 * Per SIP v1.1.1 § 5 item 7 ("Encoded-self forkable boundary"), forks of the
 * SIS substrate must inherit the *pattern* (agents, skills, commands, methods,
 * governance) but not *the person* (founder voice clones, identity vectors,
 * personal canon, vault-specific paths, fingerprinting artifacts).
 *
 * This script is the operational test cited in the clause. v0.1 scaffold —
 * full implementation lands with the create-sis-cockpit boilerplate distribution
 * (master plan Phase 3). Scaffold's job is to:
 *
 *   1. Make the SIP § 5 item 7 contract enforceable from day one (no
 *      contract-without-enforcement window per board 2026-05-06 Verifier vector)
 *   2. Define the encoded-self pattern set in code where the future fork-output
 *      audit can build on it
 *   3. Run cleanly against the SIS itself (which is the source-canonical, NOT
 *      a fork — encoded-self is permitted here by definition)
 *
 * Usage:
 *   tsx scripts/audit-authorlessness.ts <target-dir>
 *   tsx scripts/audit-authorlessness.ts --self-check    # validate patterns are
 *                                                         non-empty and the
 *                                                         scaffold runs
 *
 * Exit codes:
 *   0 — clean (no encoded-self artifacts found in target)
 *   1 — violations found (target contains encoded-self artifacts)
 *   2 — usage error or scaffold-only mode (no target)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate clause: § 5 item 7
 * - Boards: docs/boards/luminor-cockpit-v8.md (REVISE #4 ratification),
 *           docs/boards/2026-05-06-sip-section-5-encoded-self-amendment.md (wording REVISE)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

// =============================================================================
// Encoded-self pattern set (what a fork-output must NOT contain)
// =============================================================================

/**
 * Founder name fingerprints. Hardcoded references to the source sovereign
 * within fork-output indicate the person leaked through the strip step.
 * Pattern set v0.1 — anchored to current SIS founder; future versions
 * accept this as a parameter so the audit can run against any sovereign's
 * fork output.
 */
const NAME_FINGERPRINTS: readonly string[] = [
  "Frank Riemer",
  "frankxai",
  "Starlight Holding BV",
  "Starlight Holding",
  "frankx.ai",
  "frankx-eth",
  "friemerx",
];

/**
 * Voice-clone artifact extensions. Audio files under specific paths
 * (voice/, audio/, captures/, samples/) likely carry voice fingerprints.
 * Extension alone is not enough — combined with path heuristic.
 */
const VOICE_ARTIFACT_EXTENSIONS: readonly string[] = [
  ".wav",
  ".mp3",
  ".flac",
  ".m4a",
  ".ogg",
];

const VOICE_ARTIFACT_PATHS: readonly string[] = [
  "voice/",
  "audio/",
  "captures/",
  "samples/",
  "private/voice-operator/",
];

/**
 * Identity-vector artifact patterns. Embedding/model files with names
 * suggesting biometric or identity content.
 */
const IDENTITY_VECTOR_NAMES: readonly RegExp[] = [
  /voice[-_]embedding/i,
  /identity[-_]vector/i,
  /biometric[-_]/i,
  /speaker[-_]embedding/i,
  /personal[-_]canon[-_]embedding/i,
];

const IDENTITY_VECTOR_EXTENSIONS: readonly string[] = [
  ".npy",
  ".pt",
  ".safetensors",
  ".pkl",
  ".onnx",
];

/**
 * Vault-specific path fingerprints. Hardcoded references to the source
 * sovereign's filesystem layout indicate the vault structure leaked.
 */
const VAULT_PATH_FINGERPRINTS: readonly RegExp[] = [
  /C:\\Users\\frank\\/i,
  /\/Users\/frank\//,
  /~\/frank\//i,
  /\/home\/frank\//,
];

/**
 * Personal canon fingerprints — phrases/identifiers that uniquely tag the
 * source sovereign's ecosystem. Conservative list; expanded as the audit
 * encounters fork outputs in the wild.
 */
const PERSONAL_CANON_FINGERPRINTS: readonly RegExp[] = [
  /\bArcanea BV\b/,           // legal entity name
  /\bGuardian.{0,20}Vel'Tara\b/i,  // Arcanea canon naming pair
];

// =============================================================================
// Files/directories the audit always skips (build artifacts, metadata, etc.)
// =============================================================================

const SKIP_DIR_NAMES: readonly string[] = [
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "_archive",
  "coverage",
];

// =============================================================================
// Audit core
// =============================================================================

interface Violation {
  file: string;
  category: "name" | "voice" | "identity-vector" | "vault-path" | "personal-canon";
  evidence: string;
}

function isUnderVoiceArtifactPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, "/");
  return VOICE_ARTIFACT_PATHS.some((p) => norm.includes(p));
}

function* walkFiles(root: string, prefix = ""): Generator<string> {
  for (const entry of readdirSync(root)) {
    if (SKIP_DIR_NAMES.includes(entry)) continue;
    const full = join(root, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      yield* walkFiles(full, rel);
    } else if (s.isFile()) {
      yield rel;
    }
  }
}

function scanFile(absPath: string, relPath: string): Violation[] {
  const violations: Violation[] = [];
  const ext = extname(relPath).toLowerCase();

  // 1. Voice artifacts: extension + path heuristic
  if (VOICE_ARTIFACT_EXTENSIONS.includes(ext) && isUnderVoiceArtifactPath(relPath)) {
    violations.push({
      file: relPath,
      category: "voice",
      evidence: `audio file under voice-artifact path (${ext})`,
    });
  }

  // 2. Identity-vector artifacts: extension + name pattern
  if (IDENTITY_VECTOR_EXTENSIONS.includes(ext)) {
    const baseName = relPath.split(/[\\/]/).pop() ?? "";
    for (const pat of IDENTITY_VECTOR_NAMES) {
      if (pat.test(baseName)) {
        violations.push({
          file: relPath,
          category: "identity-vector",
          evidence: `embedding file matching ${pat.source}`,
        });
        break;
      }
    }
  }

  // 3. Text-content fingerprints (name, vault-path, personal-canon).
  // Only scan text-like files to avoid loading binary blobs.
  const TEXT_EXTENSIONS = new Set([
    ".md",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".txt",
    ".env",
    ".sh",
    ".ps1",
  ]);
  if (!TEXT_EXTENSIONS.has(ext)) return violations;

  let content: string;
  try {
    content = readFileSync(absPath, "utf-8");
  } catch {
    return violations;
  }

  for (const fingerprint of NAME_FINGERPRINTS) {
    if (content.includes(fingerprint)) {
      violations.push({
        file: relPath,
        category: "name",
        evidence: `contains "${fingerprint}"`,
      });
      break;
    }
  }

  for (const pat of VAULT_PATH_FINGERPRINTS) {
    if (pat.test(content)) {
      violations.push({
        file: relPath,
        category: "vault-path",
        evidence: `matches vault-path pattern ${pat.source}`,
      });
      break;
    }
  }

  for (const pat of PERSONAL_CANON_FINGERPRINTS) {
    if (pat.test(content)) {
      violations.push({
        file: relPath,
        category: "personal-canon",
        evidence: `matches personal-canon pattern ${pat.source}`,
      });
      break;
    }
  }

  return violations;
}

function audit(targetDir: string): { violations: Violation[]; scanned: number } {
  const root = resolve(targetDir);
  const violations: Violation[] = [];
  let scanned = 0;
  for (const rel of walkFiles(root)) {
    scanned++;
    const abs = join(root, rel);
    violations.push(...scanFile(abs, rel));
  }
  return { violations, scanned };
}

// =============================================================================
// CLI
// =============================================================================

function selfCheck(): number {
  // Validate the pattern set is non-empty and types are well-formed.
  const allPatternsNonEmpty =
    NAME_FINGERPRINTS.length > 0 &&
    VOICE_ARTIFACT_EXTENSIONS.length > 0 &&
    VOICE_ARTIFACT_PATHS.length > 0 &&
    IDENTITY_VECTOR_NAMES.length > 0 &&
    IDENTITY_VECTOR_EXTENSIONS.length > 0 &&
    VAULT_PATH_FINGERPRINTS.length > 0 &&
    PERSONAL_CANON_FINGERPRINTS.length > 0;

  if (!allPatternsNonEmpty) {
    console.error("FAIL: one or more pattern sets is empty");
    return 1;
  }

  console.log("audit-authorlessness.ts v0.1 self-check");
  console.log(`  name fingerprints: ${NAME_FINGERPRINTS.length}`);
  console.log(`  voice artifact extensions: ${VOICE_ARTIFACT_EXTENSIONS.length}`);
  console.log(`  voice artifact paths: ${VOICE_ARTIFACT_PATHS.length}`);
  console.log(`  identity vector names: ${IDENTITY_VECTOR_NAMES.length}`);
  console.log(`  identity vector extensions: ${IDENTITY_VECTOR_EXTENSIONS.length}`);
  console.log(`  vault path fingerprints: ${VAULT_PATH_FINGERPRINTS.length}`);
  console.log(`  personal canon fingerprints: ${PERSONAL_CANON_FINGERPRINTS.length}`);
  console.log("PASS — patterns ready for fork-output audit");
  return 0;
}

function main(): number {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("usage: tsx scripts/audit-authorlessness.ts <target-dir>");
    console.error("       tsx scripts/audit-authorlessness.ts --self-check");
    console.error("");
    console.error("This audit checks fork-outputs (e.g., create-sis-cockpit");
    console.error("strip-output) for encoded-self artifacts that must NOT");
    console.error("travel from the source sovereign per SIP § 5 item 7.");
    console.error("");
    console.error("It does NOT run against the SIS substrate itself — that's");
    console.error("the source-canonical, where encoded-self is permitted.");
    return 2;
  }

  if (args[0] === "--self-check") {
    return selfCheck();
  }

  const target = args[0];
  let targetStat;
  try {
    targetStat = statSync(target);
  } catch {
    console.error(`error: target "${target}" not found`);
    return 2;
  }
  if (!targetStat.isDirectory()) {
    console.error(`error: target "${target}" is not a directory`);
    return 2;
  }

  const { violations, scanned } = audit(target);

  console.log(`audit-authorlessness.ts v0.1 — scanned ${scanned} files in ${target}`);
  console.log("");

  if (violations.length === 0) {
    console.log("CLEAN — no encoded-self artifacts found");
    console.log("Fork-output may ship per SIP § 5 item 7.");
    return 0;
  }

  console.log(`VIOLATIONS — ${violations.length} encoded-self artifact(s) found:`);
  console.log("");
  const byCategory: Record<string, Violation[]> = {};
  for (const v of violations) {
    (byCategory[v.category] ??= []).push(v);
  }
  for (const [cat, vs] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${vs.length}`);
    for (const v of vs.slice(0, 5)) {
      console.log(`    - ${v.file} — ${v.evidence}`);
    }
    if (vs.length > 5) {
      console.log(`    ... and ${vs.length - 5} more`);
    }
  }
  console.log("");
  console.log("Per SIP § 5 item 7, fork-output must NOT contain encoded-self");
  console.log("artifacts of the source sovereign. Strip and re-run.");
  return 1;
}

process.exit(main());
