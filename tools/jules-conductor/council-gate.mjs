/**
 * Starlight Multi-Agent Council Gate for Jules
 * Coordinates the Specialist Council (Architect, Sentinel, Weaver, Sage)
 * to govern pre-flight prompt formulation and post-execution ratification.
 *
 * Built on SIP — Starlight Intelligence Protocol.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const VAULT_DIR = join(ROOT, 'memory', 'vaults');

// ── SAGE: Institutional Memory Retrieval ────────────────────────
export function consultSageMemory(repo, keywords = []) {
  const hits = [];
  const vaultFiles = ['operational.jsonl', 'technical.jsonl'];

  for (const file of vaultFiles) {
    const fullPath = join(VAULT_DIR, file);
    if (!existsSync(fullPath)) continue;

    try {
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line);
          const text = JSON.stringify(entry).toLowerCase();
          const repoLower = repo.toLowerCase();

          if (text.includes(repoLower)) {
            hits.push({
              action: entry.action || entry.type || 'lesson',
              summary: entry.summary || entry.task || entry.details || JSON.stringify(entry).slice(0, 120),
              timestamp: entry.timestamp || entry.createdAt,
            });
          }
        } catch {}
      }
    } catch {}
  }

  // Return up to 3 most relevant recent memories
  return hits.slice(-3);
}

// ── ARCHITECT: Pre-Flight Approach Gate ─────────────────────────
export function architectPreflight({ repo, taskDescription, repoProfile }) {
  const blockers = [];
  const invariants = [];

  const descLower = taskDescription.toLowerCase();

  // Guard against massive broad refactors
  if (descLower.includes('refactor everything') || descLower.includes('rewrite entire')) {
    blockers.push('Architect veto: Broad whole-repository rewrites are prohibited. Must be decomposed into surgical sub-tasks.');
  }

  // Inject repo-specific architectural invariants
  if (repoProfile.type === 'substrate-core') {
    invariants.push('Substrate-Tier Invariant: Must adhere to SIP v1.1.1 protocol contracts. Do not mutate core schema definitions without migration.');
  } else if (repoProfile.type === 'fullstack-nextjs') {
    invariants.push('Next.js Invariant: Keep client components minimal. Preserve server component boundaries. Ensure zero layout shift (CLS).');
  } else if (repoProfile.type === 'agent-runtime') {
    invariants.push('Agent Invariant: Preserve deterministic state serialization. Ensure zero-hang async loops.');
  }

  return {
    approved: blockers.length === 0,
    blockers,
    invariants,
    assignedLead: repoProfile.primaryAgent || 'starlight-architect',
  };
}

// ── WEAVER: Code Elegance & Anti-Slop Audit ─────────────────────
export function weaverTasteReview(diffText) {
  const warnings = [];

  // Check for AI placeholder slop
  const slopPatterns = [
    /TODO:\s*implement later/i,
    /insert logic here/i,
    /\/\/\s*placeholder/i,
    /as an AI language model/i,
  ];

  for (const p of slopPatterns) {
    if (p.test(diffText)) {
      warnings.push(`Weaver detected potential AI slop/placeholder: ${p.source}`);
    }
  }

  return {
    approved: warnings.length === 0,
    warnings,
  };
}

// ── SENTINEL: Security & Supply Chain Audit ─────────────────────
export function sentinelAudit(diffText, safetyRules) {
  const blockers = [];

  // Supply chain check: package.json additions
  if (diffText.includes('diff --git a/package.json')) {
    const pkgLines = diffText.split('\n');
    for (const l of pkgLines) {
      const trimmedPlus = l.replace(/^\+\s*/, '');
      if (l.startsWith('+') && !l.startsWith('+++') && (trimmedPlus.includes('http://') || trimmedPlus.includes('git://'))) {
        blockers.push('Sentinel veto: Non-standard git or http npm dependency detected in package.json.');
      }
    }
  }

  // GitHub Actions workflow modification check
  if (diffText.includes('diff --git a/.github/workflows/')) {
    blockers.push('Sentinel veto: Modification to GitHub Actions workflows requires explicit human operator sign-off.');
  }

  return {
    approved: blockers.length === 0,
    blockers,
  };
}
