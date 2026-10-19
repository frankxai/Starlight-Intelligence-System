/**
 * Starlight Queen — Continuous Immune System and CX Sweeper
 *
 * Scans source files, markdown documents, and repository metrics for:
 * - Editorial sentence-case violations (stacked uppercase headings, raw slash labels)
 * - Weaver anti-slop placeholders and leftover debug artifacts
 * - Metrics truth freshness (metrics/current.json verification timestamp)
 * - Sentinel high-risk surface exposure and auto-merge safety
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isHighRiskPath } from './review-receipt.js';

export type ImmuneSeverity = 'blocker' | 'warning' | 'info';

export type ImmuneCheckCategory =
  | 'editorial-sentence-case'
  | 'weaver-anti-slop'
  | 'metrics-truth'
  | 'sentinel-risk-surface';

export interface ImmuneFinding {
  category: ImmuneCheckCategory;
  severity: ImmuneSeverity;
  file?: string;
  line?: number;
  message: string;
}

export interface FileSample {
  path: string;
  content: string;
}

export interface ImmuneSweepInput {
  repoRoot?: string;
  files?: FileSample[];
  changedPaths?: string[];
  autoMergeArmed?: boolean;
  maxMetricsAgeDays?: number;
  now?: Date;
}

export interface ImmuneSweepReport {
  healthy: boolean;
  score: number;
  blockerCount: number;
  warningCount: number;
  findings: ImmuneFinding[];
  riskSurface: {
    highRisk: boolean;
    highRiskFiles: string[];
    autoMergeAllowed: boolean;
  };
  summary: string;
}

const SLOP_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /TODO:\s*implement later/i, label: 'unfinished placeholder comment' },
  { pattern: /insert logic here/i, label: 'template placeholder instruction' },
  { pattern: /\/\/\s*placeholder\b/i, label: 'placeholder code comment' },
  { pattern: /as an ai language model/i, label: 'synthetic model disclaimer' },
];

const ACRONYM_ALLOWLIST = new Set([
  'API',
  'CLI',
  'CPU',
  'CSS',
  'CTO',
  'DNS',
  'DOM',
  'E2E',
  'FAQ',
  'FTS',
  'GCP',
  'GPU',
  'HTML',
  'HTTP',
  'HTTPS',
  'IDE',
  'JSON',
  'JSONL',
  'JWT',
  'LLM',
  'MCP',
  'MDX',
  'OOM',
  'PDF',
  'PII',
  'PR',
  'RAM',
  'RBAC',
  'REST',
  'RRF',
  'RSA',
  'SAGE',
  'SDK',
  'SHA',
  'SIP',
  'SIS',
  'SQL',
  'SSH',
  'SSR',
  'SVG',
  'TCP',
  'TLS',
  'TSX',
  'TTL',
  'UDP',
  'URI',
  'URL',
  'UTF',
  'UUID',
  'WCAG',
  'XML',
  'YAML',
]);

/**
 * Checks markdown content for stacked uppercase headings or raw slash-command headings.
 */
export function auditEditorialSentenceCase(
  filePath: string,
  content: string,
): ImmuneFinding[] {
  const findings: ImmuneFinding[] = [];
  const lines = content.split(/\r?\n/);
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!headingMatch) {
      continue;
    }

    const headingText = headingMatch[2].trim();

    if (/^\/[a-z0-9-]+/i.test(headingText)) {
      findings.push({
        category: 'editorial-sentence-case',
        severity: 'warning',
        file: filePath,
        line: i + 1,
        message: `Heading starts with a raw slash label ("${headingText}"); use sentence case instead.`,
      });
    }

    const words = headingText
      .replace(/[`*_~[\]()]/g, ' ')
      .split(/\s+/)
      .filter((w) => /^[A-Z]{2,}$/.test(w) && !ACRONYM_ALLOWLIST.has(w));

    const capitalized = headingText.replace(/`[^`]*`/g, '').split(/\s+/).slice(1)
      .filter((word) => /^[A-Z][a-z]+$/.test(word) && !['Starlight', 'Arcanea', 'FrankX', 'GenCreator', 'TypeScript', 'JavaScript'].includes(word));
    if (words.length >= 1 || capitalized.length >= 2) {
      findings.push({
        category: 'editorial-sentence-case',
        severity: 'warning',
        file: filePath,
        line: i + 1,
        message: `Heading uses stacked uppercase words ("${headingText}"); convert to sentence case.`,
      });
    }
  }

  return findings;
}

/**
 * Scans a file for Weaver anti-slop placeholders.
 */
export function auditWeaverAntiSlop(
  filePath: string,
  content: string,
): ImmuneFinding[] {
  const findings: ImmuneFinding[] = [];
  // Exact fixtures/rule definitions contain the phrases on purpose. Do not suppress arbitrary tests.
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized === 'src/queen/immune-sweeper.ts' || normalized === 'test/queen-swarm-immune.test.ts') return findings;
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of SLOP_PATTERNS) {
      if (rule.pattern.test(line)) {
        findings.push({
          category: 'weaver-anti-slop',
          severity: 'blocker',
          file: filePath,
          line: i + 1,
          message: `Detected ${rule.label} in ${filePath}:${i + 1}.`,
        });
      }
    }
  }

  return findings;
}

/**
 * Verifies metrics/current.json freshness if present in repoRoot.
 */
export function auditMetricsTruth(
  repoRoot: string,
  maxAgeDays = 45,
  now: Date = new Date(),
): ImmuneFinding[] {
  const findings: ImmuneFinding[] = [];
  const metricsPath = join(repoRoot, 'metrics', 'current.json');

  if (!existsSync(metricsPath)) {
    return findings;
  }

  try {
    const raw = readFileSync(metricsPath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
        !parsed.metrics || typeof parsed.metrics !== 'object' || Array.isArray(parsed.metrics) ||
        Object.keys(parsed.metrics).length === 0) {
      throw new Error('Expected non-empty metrics.<key> entries.');
    }
    if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0 || !Number.isFinite(now.getTime())) {
      throw new Error('Invalid metrics freshness policy or clock.');
    }
    for (const [key, value] of Object.entries(parsed.metrics as Record<string, unknown>)) {
      const metric = value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown> : null;
      const verified = metric?.last_verified;
      const date = typeof verified === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(verified)
        ? new Date(`${verified}T00:00:00.000Z`) : new Date(NaN);
      const validDate = Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === verified;
      const age = validDate ? (now.getTime() - date.getTime()) / 86_400_000 : NaN;
      if (!validDate || age < 0 || age > maxAgeDays || metric?.stale === true) {
        findings.push({ category: 'metrics-truth', severity: 'blocker', file: 'metrics/current.json',
          message: `Metric ${key} has missing, invalid, future, explicitly stale or expired verification evidence.` });
      }
    }
  } catch (err) {
    findings.push({
      category: 'metrics-truth',
      severity: 'blocker',
      file: 'metrics/current.json',
      message: `Failed to parse metrics/current.json: ${(err as Error).message}`,
    });
  }

  return findings;
}

/**
 * Executes a unified immune sweep across provided files, changed paths, and repository metrics.
 */
export function runImmuneSweep(input: ImmuneSweepInput): ImmuneSweepReport {
  const findings: ImmuneFinding[] = [];
  const files = input.files ?? [];
  if (files.length === 0) {
    findings.push({ category: 'weaver-anti-slop', severity: 'blocker', message: 'No file samples supplied; source audit was not performed.' });
  }
  const allPaths = new Set<string>(
    (input.changedPaths ?? []).map((p) => p.replace(/\\/g, '/')),
  );

  for (const sample of files) {
    const normalizedPath = sample.path.replace(/\\/g, '/');
    allPaths.add(normalizedPath);

    findings.push(...auditWeaverAntiSlop(normalizedPath, sample.content));

    if (normalizedPath.endsWith('.md') || normalizedPath.endsWith('.mdx')) {
      findings.push(...auditEditorialSentenceCase(normalizedPath, sample.content));
    }
  }

  const highRiskFiles = [...allPaths].filter((p) => isHighRiskPath(p)).sort();
  const highRisk = highRiskFiles.length > 0;
  const autoMergeAllowed = !highRisk;

  if (highRisk && input.autoMergeArmed) {
    findings.push({
      category: 'sentinel-risk-surface',
      severity: 'blocker',
      message: `Auto-merge is armed while touching ${highRiskFiles.length} high-risk path(s): ${highRiskFiles.join(', ')}.`,
    });
  }

  if (input.repoRoot) {
    findings.push(
      ...auditMetricsTruth(input.repoRoot, input.maxMetricsAgeDays ?? 45, input.now),
    );
  }

  const blockerCount = findings.filter((f) => f.severity === 'blocker').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const penalty = blockerCount * 25 + warningCount * 5;
  const score = Math.max(0, 100 - penalty);
  const healthy = blockerCount === 0;

  const summary = healthy
    ? `Immune sweep passed with score ${score}/100 (${warningCount} warning(s), ${highRiskFiles.length} high-risk path(s)).`
    : `Immune sweep blocked with ${blockerCount} blocker(s) and ${warningCount} warning(s) (score ${score}/100).`;

  return {
    healthy,
    score,
    blockerCount,
    warningCount,
    findings,
    riskSurface: {
      highRisk,
      highRiskFiles,
      autoMergeAllowed,
    },
    summary,
  };
}
