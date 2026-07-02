#!/usr/bin/env node
// privacy-check.mjs — pre-commit privacy boundary enforcer for the IIS substrate.
//
// Scans staged changes (or all files when run with --all) for patterns that
// would violate PRIVACY-BOUNDARY.md. Exits non-zero on any match so the commit
// is blocked. Operators install this as a pre-commit hook; substrate
// maintainers also run it in CI.
//
// Usage:
//   node iis/scripts/privacy-check.mjs           (checks git staged diff)
//   node iis/scripts/privacy-check.mjs --all     (checks all tracked files)
//   node iis/scripts/privacy-check.mjs --files=path1,path2  (specific files)

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const mode = args.includes('--all')
  ? 'all'
  : args.find((a) => a.startsWith('--files='))
  ? 'files'
  : 'staged'
const filesArg = args.find((a) => a.startsWith('--files='))?.slice('--files='.length)

// Patterns that flag for review. Each rule has a regex, a severity, and a reason.
// Severity: 'block' = exit non-zero; 'warn' = print only, allow commit.
const RULES = [
  // Identity tells (block) — Frank-specific tells the substrate must not propagate
  {
    regex: /\b(Witali|Riemer|Pavlovka|Seesen|Tien|Arcanea Labs)\b/i,
    severity: 'block',
    reason: 'Frank-identity reference. Replace with fictional persona.',
  },
  // Real EUR amounts that look like a position (block on > 10K not in placeholder context)
  {
    regex: /€\s?(?:1[1-9]|[2-9])\d{4,}|€\s?\d{6,}/,
    severity: 'block',
    reason: 'EUR amount > €10K — likely a real position. Use archetypal amounts (€25K, €100K) or "redacted".',
  },
  // API key shapes (block — defensive)
  {
    regex: /(api_key|apikey|api-key|secret|access_token|bearer)\s*[:=]\s*['"][a-zA-Z0-9_-]{20,}/i,
    severity: 'block',
    reason: 'Possible API key. Move to environment variable; never commit secrets.',
  },
  // Seed phrase pattern (block — defensive; never on disk anyway)
  // Tightened: requires lowercase-only words separated by single spaces (no punctuation),
  // matches typical seed phrase format (12 or 24 words) — avoids false positives on prose.
  {
    regex: /\b(?:^|\n)([a-z]{3,8}( [a-z]{3,8}){11}|[a-z]{3,8}( [a-z]{3,8}){23})\b/m,
    severity: 'block',
    reason: 'Possible BIP-39 seed phrase pattern (12 or 24 lowercase words on a single line). NEVER commit.',
    skipPaths: [/\.md$/, /\.json$/], // prose and JSON descriptions can hit length thresholds
  },
  // Wallet addresses (warn — public read-only addresses are still fingerprinting)
  {
    regex: /\b0x[a-fA-F0-9]{40}\b/,
    severity: 'warn',
    reason: 'Ethereum-shaped address. Confirm this is example data, not a real watch-address.',
  },
  // Bitcoin address (warn)
  {
    regex: /\b(?:bc1|[13])[a-zA-Z0-9]{25,39}\b/,
    severity: 'warn',
    reason: 'Possible Bitcoin address. Confirm example data.',
  },
  // Specific exchange + EUR combination (warn — fingerprints)
  {
    regex: /\b(coinbase|binance|kraken|crypto\.com|swissborg|nexo)\b[^\n]{0,30}€\s?[1-9]\d{3,}/i,
    severity: 'warn',
    reason: 'Exchange + EUR amount combination — confirm not fingerprinting.',
  },
]

// Files to skip entirely (always allowed)
const SKIP_FILES = [
  'iis/PRIVACY-BOUNDARY.md',           // documents the patterns; will match itself
  'iis/scripts/privacy-check.mjs',     // this file
  'iis/LICENSE',                       // MIT license legitimately names authors
  'iis/architecture/09-tax-overlays.md', // legitimate reference EUR amounts (Box 3 thresholds)
  'iis/architecture/10-honest-limits.md', // documents amounts in context
  'iis/architecture/11-ai-engineering.md', // documents cost/pricing math
]

function getFilesToCheck() {
  if (mode === 'files' && filesArg) {
    return filesArg.split(',').map((p) => p.trim()).filter(Boolean)
  }
  if (mode === 'all') {
    const out = execSync('git ls-files iis/', { encoding: 'utf8' })
    return out.split('\n').filter(Boolean)
  }
  // staged (default)
  const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
  return out
    .split('\n')
    .filter(Boolean)
    .filter((p) => p.startsWith('iis/'))
}

function readFileSafe(path) {
  try {
    return readFileSync(resolve(process.cwd(), path), 'utf8')
  } catch {
    return null
  }
}

function isSkipped(filePath) {
  return SKIP_FILES.some((skip) => filePath === skip || filePath.endsWith(skip))
}

function checkFile(filePath) {
  if (isSkipped(filePath)) return []
  const content = readFileSafe(filePath)
  if (!content) return []

  const findings = []
  for (const rule of RULES) {
    if (rule.skipPaths?.some((re) => re.test(filePath))) continue
    const matches = content.match(new RegExp(rule.regex, 'gi'))
    if (matches) {
      findings.push({
        file: filePath,
        severity: rule.severity,
        reason: rule.reason,
        matches: matches.slice(0, 3),
      })
    }
  }
  return findings
}

function main() {
  const files = getFilesToCheck()
  if (files.length === 0) {
    console.log('[iis-privacy-check] no IIS substrate files to check')
    process.exit(0)
  }

  console.log(`[iis-privacy-check] scanning ${files.length} file(s) (${mode} mode)`)

  const allFindings = []
  for (const file of files) {
    allFindings.push(...checkFile(file))
  }

  if (allFindings.length === 0) {
    console.log('[iis-privacy-check] ✓ no privacy-boundary violations')
    process.exit(0)
  }

  const blockers = allFindings.filter((f) => f.severity === 'block')
  const warnings = allFindings.filter((f) => f.severity === 'warn')

  if (blockers.length > 0) {
    console.error('\n[iis-privacy-check] ✗ BLOCKING violations:\n')
    for (const b of blockers) {
      console.error(`  ${b.file}`)
      console.error(`    reason: ${b.reason}`)
      console.error(`    matches: ${JSON.stringify(b.matches)}`)
      console.error('')
    }
  }

  if (warnings.length > 0) {
    console.warn('\n[iis-privacy-check] ⚠ warnings (review before commit):\n')
    for (const w of warnings) {
      console.warn(`  ${w.file}`)
      console.warn(`    reason: ${w.reason}`)
      console.warn(`    matches: ${JSON.stringify(w.matches)}`)
      console.warn('')
    }
  }

  console.log('See iis/PRIVACY-BOUNDARY.md for the full rule set.\n')
  process.exit(blockers.length > 0 ? 1 : 0)
}

main()
