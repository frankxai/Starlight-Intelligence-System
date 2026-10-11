/**
 * scripts/check-identity-drift.mjs — ClawHavoc-class identity drift detector
 *
 * Guards the SIS identity surface — the files that shape agent behaviour across
 * every Claude Code / Cursor / Cline / Codex / Gemini / Antigravity session.
 * Named after the ClawHavoc incident (early 2026) in which a series of
 * individually-plausible edits to a SOUL.md-equivalent file cumulatively
 * changed agent identity without triggering any safety gate ("Ship of Theseus"
 * drift pattern).
 *
 * Identity files monitored:
 *   CLAUDE.md · AGENTS.md · SKILL.md
 *   .cursor/rules/*.mdc
 *   .clinerules/*.md
 *   .gemini/GEMINI.md
 *   .antigravity/instructions.md
 *
 * Modes:
 *   --baseline   Compute SHA-256 + semantic fingerprint per file, write
 *                memory/_audit/identity-baseline.json.
 *   --update     Re-baseline after a reviewed legitimate change (alias of
 *                --baseline, listed separately for clarity in scripts).
 *   (default)    Recompute, compare, report; exit 1 on DRIFTED or injection hit.
 *
 * Exit codes:
 *   0  All files UNCHANGED or EDITED-clean (hash diff but injection-free and
 *      cosine ≥ 0.85 vs baseline fingerprint).
 *   1  One or more files DRIFTED (cosine < 0.85) or injection pattern matched.
 *   2  Baseline file missing — run with --baseline first.
 *
 * Dependency-free: SHA-256 via node:crypto, FNV-1a hashing-TF vector inline.
 *
 * Built on SIP — operational tier (security hardening v0.1 · ClawHavoc lesson).
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ── Repo root resolution ───────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url));
// STARLIGHT_IDENTITY_REPO_ROOT may be set by tests to point at a temp dir.
const REPO_ROOT = process.env.STARLIGHT_IDENTITY_REPO_ROOT ?? resolve(HERE, "..");
const BASELINE_DIR = join(REPO_ROOT, "memory", "_audit");
const BASELINE_PATH = join(BASELINE_DIR, "identity-baseline.json");

// ── Identity file manifest ─────────────────────────────────────────────────────

/** Collect all identity file paths relative to repo root. */
function collectIdentityFiles() {
  const files = [];

  // Top-level single files
  for (const name of ["CLAUDE.md", "AGENTS.md", "SKILL.md"]) {
    files.push(name);
  }

  // .cursor/rules/*.mdc
  const cursorRules = join(REPO_ROOT, ".cursor", "rules");
  if (existsSync(cursorRules)) {
    for (const f of readdirSync(cursorRules)) {
      if (f.endsWith(".mdc")) files.push(join(".cursor", "rules", f));
    }
  }

  // .clinerules/*.md
  const clinerules = join(REPO_ROOT, ".clinerules");
  if (existsSync(clinerules)) {
    for (const f of readdirSync(clinerules)) {
      if (f.endsWith(".md")) files.push(join(".clinerules", f));
    }
  }

  // .gemini/GEMINI.md
  const geminiFile = join(".gemini", "GEMINI.md");
  if (existsSync(join(REPO_ROOT, geminiFile))) files.push(geminiFile);

  // .antigravity/instructions.md
  const agFile = join(".antigravity", "instructions.md");
  if (existsSync(join(REPO_ROOT, agFile))) files.push(agFile);

  return files;
}

// ── SHA-256 ────────────────────────────────────────────────────────────────────

function sha256(content) {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

// ── Inline FNV-1a hashing-TF semantic fingerprint ────────────────────────────
//
// Mirrors HashingTFProvider from src/embedding.ts so this script stays
// dependency-free (no tsx import needed). Same 1024-dim, same FNV-1a bucket,
// same L2-normalise so cosine == dot product.

const VECTOR_DIM = 1024;
const TOKEN_RE = /[A-Za-z][A-Za-z0-9_-]+/g;

function tokenize(text) {
  const m = text.match(TOKEN_RE);
  return m ? m.map((t) => t.toLowerCase()) : [];
}

function fnv1a32(token) {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h % VECTOR_DIM;
}

/** Compute L2-normalised TF hashing vector for a text. */
function semanticFingerprint(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return new Array(VECTOR_DIM).fill(0);

  const tf = new Map();
  for (const t of tokens) {
    const h = fnv1a32(t);
    tf.set(h, (tf.get(h) ?? 0) + 1);
  }

  const vec = new Array(VECTOR_DIM).fill(0);
  for (const [h, count] of tf) {
    vec[h] = count;
  }

  // L2 normalise
  let norm = 0;
  for (const x of vec) norm += x * x;
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) vec[i] /= norm;
  }
  return vec;
}

/** Cosine similarity of two L2-normalised vectors (dot product). */
function cosine(a, b) {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return Math.max(0, dot);
}

// ── Injection pattern detection ───────────────────────────────────────────────

// Imperative override attempts: matches patterns like "ignore previous instructions"
const INJECTION_RE =
  /(?:ignore|disregard|override|bypass).{0,40}(?:previous|prior|above|instructions|rules)/i;

// Base64-looking blobs: 80+ char string of [A-Za-z0-9+/=]
const BASE64_RE = /[A-Za-z0-9+/=]{80,}/;

// Zero-width unicode characters used for invisible text injection
const ZERO_WIDTH_RE = /[​‌‍﻿⁠]/;

/**
 * Scan content lines for injection patterns.
 * Returns array of { line, lineNo, pattern } hits.
 * Never interpolates raw content into error messages (per /openclaw-audit CRITICAL 2).
 */
function scanForInjection(content, filePath) {
  const hits = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const lineNo = i + 1;
    if (INJECTION_RE.test(ln)) {
      hits.push({ filePath, lineNo, pattern: "imperative-override" });
    }
    if (BASE64_RE.test(ln)) {
      hits.push({ filePath, lineNo, pattern: "base64-blob" });
    }
    if (ZERO_WIDTH_RE.test(ln)) {
      hits.push({ filePath, lineNo, pattern: "zero-width-unicode" });
    }
  }
  return hits;
}

// ── Baseline I/O ──────────────────────────────────────────────────────────────

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function writeBaseline(data) {
  mkdirSync(BASELINE_DIR, { recursive: true });
  writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ── Baseline mode ─────────────────────────────────────────────────────────────

function runBaseline() {
  const identityFiles = collectIdentityFiles();
  const baseline = {
    created: new Date().toISOString(),
    files: {},
  };

  for (const rel of identityFiles) {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) {
      console.log(`  SKIP  ${rel} (not found)`);
      continue;
    }
    const content = readFileSync(abs, "utf-8").replace(/^\uFEFF/, "");
    const hash = sha256(content);
    const vector = semanticFingerprint(content);
    baseline.files[rel] = { hash, vector, timestamp: new Date().toISOString() };
    console.log(`  BASELINED  ${rel}  (${hash.slice(0, 8)}…)`);
  }

  writeBaseline(baseline);
  console.log(`\nBaseline written → ${BASELINE_PATH}`);
  console.log(`Files captured: ${Object.keys(baseline.files).length}`);
}

// ── Check mode ────────────────────────────────────────────────────────────────

const COSINE_EDIT_THRESHOLD = 0.85; // below this = DRIFTED

function runCheck() {
  const baseline = readBaseline();
  if (!baseline) {
    console.error(
      `ERROR: No baseline found at ${BASELINE_PATH}\n` +
        `Run with --baseline first.`,
    );
    process.exit(2);
  }

  const identityFiles = collectIdentityFiles();
  const baselineKeys = new Set(Object.keys(baseline.files));
  const checkedKeys = new Set();

  let exitCode = 0;
  const driftedFiles = [];
  const injectionHits = [];
  const report = [];

  for (const rel of identityFiles) {
    checkedKeys.add(rel);
    const abs = join(REPO_ROOT, rel);

    if (!existsSync(abs)) {
      if (baselineKeys.has(rel)) {
        report.push(`  MISSING   ${rel}`);
        driftedFiles.push(rel);
        exitCode = 1;
      }
      // Not in baseline and not on disk — skip silently
      continue;
    }

    const content = readFileSync(abs, "utf-8").replace(/^\uFEFF/, "");
    const hash = sha256(content);

    if (!baselineKeys.has(rel)) {
      report.push(`  NEW       ${rel}  (not in baseline — run --update if intentional)`);
      // NEW files are flagged but don't cause exit 1 on their own; they're not DRIFTED
      continue;
    }

    const entry = baseline.files[rel];

    if (hash === entry.hash) {
      report.push(`  UNCHANGED ${rel}`);
      continue;
    }

    // Hash differs — compute cosine vs baseline fingerprint
    const currentVec = semanticFingerprint(content);
    const sim = cosine(currentVec, entry.vector);

    const hits = scanForInjection(content, rel);

    if (sim < COSINE_EDIT_THRESHOLD) {
      report.push(
        `  DRIFTED   ${rel}  (cosine ${sim.toFixed(3)} < ${COSINE_EDIT_THRESHOLD} threshold)`,
      );
      driftedFiles.push(rel);
      exitCode = 1;
    } else {
      report.push(
        `  EDITED    ${rel}  (hash changed, cosine ${sim.toFixed(3)} — within safe range)`,
      );
    }

    if (hits.length > 0) {
      injectionHits.push(...hits);
      exitCode = 1;
    }
  }

  // Files that were in baseline but not in the current identity manifest
  for (const rel of baselineKeys) {
    if (!checkedKeys.has(rel) && !existsSync(join(REPO_ROOT, rel))) {
      report.push(`  MISSING   ${rel}  (was in baseline)`);
      driftedFiles.push(rel);
      exitCode = 1;
    }
  }

  // Print report
  console.log("\nIdentity Drift Check\n" + "=".repeat(40));
  for (const line of report) console.log(line);

  if (injectionHits.length > 0) {
    console.log("\nINJECTION PATTERNS DETECTED:");
    for (const h of injectionHits) {
      // Per /openclaw-audit CRITICAL 2: only file:line and pattern name, no raw content
      console.log(`  ${h.filePath}:${h.lineNo}  [${h.pattern}]`);
    }
  }

  if (exitCode === 0) {
    console.log("\nResult: CLEAN — all identity files UNCHANGED or safely EDITED");
  } else {
    console.log(
      "\nResult: ALERT — " +
        [
          driftedFiles.length > 0
            ? `${driftedFiles.length} DRIFTED/MISSING file(s)`
            : null,
          injectionHits.length > 0
            ? `${injectionHits.length} injection hit(s)`
            : null,
        ]
          .filter(Boolean)
          .join(", "),
    );
  }

  process.exit(exitCode);
}

// ── Entry point ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const mode = args.includes("--baseline") || args.includes("--update")
  ? "baseline"
  : "check";

if (mode === "baseline") {
  console.log("Identity Drift — Baseline Mode\n" + "=".repeat(40));
  runBaseline();
} else {
  runCheck();
}
