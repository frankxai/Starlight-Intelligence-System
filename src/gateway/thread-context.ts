/**
 * src/gateway/thread-context.ts — 9-Section ThreadContext Working Note Schema,
 * Trajectory Distillation (SuggestedLearning -> Vault Promotion Queue), and
 * Cross-Harness Memory Importer for the SIS Memory Gateway.
 *
 * Zero external dependencies. Enforces SIS Gateway privacy rules:
 * `[private]` and `privacy:*` (non-shareable) items are scrubbed and dropped
 * before entering `PROMOTION_QUEUE` or operational vault append surfaces.
 *
 * Built on SIP — operational tier (memory gateway v0.1)
 */

import { createHash } from 'node:crypto';
import type { CanonicalVaultType } from '../types.js';

// ── 1. 9-Section ThreadContext Schema ────────────────────────────────────────

export const THREAD_CONTEXT_SECTIONS = [
  'numbers_and_values',
  'corrections',
  'constraints',
  'key_entities',
  'decisions',
  'notes',
  'plan_overview',
  'plan_tasks',
  'plan_context',
] as const;

export type ThreadContextSection = (typeof THREAD_CONTEXT_SECTIONS)[number];

export interface ThreadContextDocument {
  sessionId: string;
  harness: string;
  updatedAt: string;
  sections: Record<ThreadContextSection, string[]>;
}

const SECTION_HEADING_ALIASES: Record<string, ThreadContextSection> = {
  numbers_and_values: 'numbers_and_values',
  'numbers and values': 'numbers_and_values',
  'numbers & values': 'numbers_and_values',
  metrics: 'numbers_and_values',
  'metrics and values': 'numbers_and_values',
  budgets: 'numbers_and_values',
  corrections: 'corrections',
  fixes: 'corrections',
  'anti-patterns': 'corrections',
  pitfalls: 'corrections',
  constraints: 'constraints',
  guardrails: 'constraints',
  'the five guardrails': 'constraints',
  rules: 'constraints',
  boundaries: 'constraints',
  'non-waivable': 'constraints',
  security: 'constraints',
  'security doctrine': 'constraints',
  key_entities: 'key_entities',
  'key entities': 'key_entities',
  entities: 'key_entities',
  agents: 'key_entities',
  'agent hierarchy': 'key_entities',
  'estate map': 'key_entities',
  decisions: 'decisions',
  'decision discipline': 'decisions',
  architecture: 'decisions',
  'locked decisions': 'decisions',
  notes: 'notes',
  memory: 'notes',
  observations: 'notes',
  soul: 'notes',
  identity: 'notes',
  voice: 'notes',
  plan_overview: 'plan_overview',
  'plan overview': 'plan_overview',
  overview: 'plan_overview',
  mission: 'plan_overview',
  'north star': 'plan_overview',
  'identity & north star': 'plan_overview',
  objective: 'plan_overview',
  plan_tasks: 'plan_tasks',
  'plan tasks': 'plan_tasks',
  tasks: 'plan_tasks',
  heartbeat: 'plan_tasks',
  checklist: 'plan_tasks',
  'next actions': 'plan_tasks',
  workflow: 'plan_tasks',
  plan_context: 'plan_context',
  'plan context': 'plan_context',
  context: 'plan_context',
  workspace: 'plan_context',
  environment: 'plan_context',
};

function createEmptySections(): Record<ThreadContextSection, string[]> {
  return {
    numbers_and_values: [],
    corrections: [],
    constraints: [],
    key_entities: [],
    decisions: [],
    notes: [],
    plan_overview: [],
    plan_tasks: [],
    plan_context: [],
  };
}

function normalizeItems(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of items) {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) continue;
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}

/**
 * Create an empty 9-section ThreadContext working note document.
 */
export function createThreadContext(
  sessionId: string,
  harness = 'default',
): ThreadContextDocument {
  const cleanSessionId = sessionId.trim() || 'default-session';
  const cleanHarness = harness.trim() || 'default';
  return {
    sessionId: cleanSessionId,
    harness: cleanHarness,
    updatedAt: new Date().toISOString(),
    sections: createEmptySections(),
  };
}

/**
 * Upsert items into one of the 9 canonical ThreadContext sections.
 * Deduplicates trimmed non-empty strings in deterministic order.
 * Mutates `doc` in place AND returns `doc` for ergonomic chaining.
 */
export function upsertThreadContextSection(
  doc: ThreadContextDocument,
  section: ThreadContextSection,
  items: readonly string[],
  mode: 'append' | 'replace' = 'append',
): ThreadContextDocument {
  if (!THREAD_CONTEXT_SECTIONS.includes(section)) {
    throw new Error(`Invalid ThreadContext section: ${String(section)}`);
  }
  const existing = mode === 'replace' ? [] : (doc.sections[section] ?? []);
  doc.sections[section] = normalizeItems([...existing, ...items]);
  doc.updatedAt = new Date().toISOString();
  return doc;
}

/**
 * Deterministically serialize a ThreadContextDocument to Markdown.
 */
export function serializeThreadContextMarkdown(doc: ThreadContextDocument): string {
  const lines: string[] = [
    '# Thread Context',
    `- session_id: ${doc.sessionId}`,
    `- harness: ${doc.harness}`,
    `- updated_at: ${doc.updatedAt}`,
    '',
  ];

  for (const section of THREAD_CONTEXT_SECTIONS) {
    lines.push(`## ${section}`);
    const items = doc.sections[section] ?? [];
    if (items.length === 0) {
      lines.push('_empty_');
    } else {
      for (const item of items) {
        const singleLine = item.replace(/\r?\n+/g, ' ').trim();
        lines.push(`- ${singleLine}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

function resolveHeadingToSection(rawHeading: string): ThreadContextSection | null {
  const cleaned = rawHeading
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/^[\d.\-\s]+/, '')
    .replace(/[:—–-]+$/, '')
    .trim();

  if (SECTION_HEADING_ALIASES[cleaned]) {
    return SECTION_HEADING_ALIASES[cleaned]!;
  }

  const snake = cleaned.replace(/[\s&-]+/g, '_');
  if (SECTION_HEADING_ALIASES[snake]) {
    return SECTION_HEADING_ALIASES[snake]!;
  }

  if (cleaned.includes('number') || cleaned.includes('metric') || cleaned.includes('budget')) {
    return 'numbers_and_values';
  }
  if (cleaned.includes('correction') || cleaned.includes('fix') || cleaned.includes('pitfall')) {
    return 'corrections';
  }
  if (
    cleaned.includes('constraint') ||
    cleaned.includes('guardrail') ||
    cleaned.includes('rule') ||
    cleaned.includes('non-waivable') ||
    cleaned.includes('security') ||
    cleaned.includes('boundary')
  ) {
    return 'constraints';
  }
  if (
    cleaned.includes('entit') ||
    cleaned.includes('agent') ||
    cleaned.includes('map') ||
    cleaned.includes('registry')
  ) {
    return 'key_entities';
  }
  if (cleaned.includes('decision') || cleaned.includes('architect')) {
    return 'decisions';
  }
  if (
    cleaned.includes('plan overview') ||
    cleaned.includes('overview') ||
    cleaned.includes('north star') ||
    cleaned.includes('mission') ||
    cleaned.includes('objective')
  ) {
    return 'plan_overview';
  }
  if (
    cleaned.includes('plan task') ||
    cleaned.includes('task') ||
    cleaned.includes('heartbeat') ||
    cleaned.includes('checklist') ||
    cleaned.includes('todo')
  ) {
    return 'plan_tasks';
  }
  if (
    cleaned.includes('plan context') ||
    cleaned.includes('context') ||
    cleaned.includes('workspace') ||
    cleaned.includes('environment')
  ) {
    return 'plan_context';
  }
  if (cleaned.includes('note') || cleaned.includes('memory') || cleaned.includes('soul')) {
    return 'notes';
  }

  return null;
}

/**
 * Parse a serialized Thread Context Markdown string back into a ThreadContextDocument.
 */
export function parseThreadContextMarkdown(
  markdown: string,
  sessionId?: string,
  harness?: string,
): ThreadContextDocument {
  let parsedSessionId = sessionId?.trim() || '';
  let parsedHarness = harness?.trim() || '';
  let parsedUpdatedAt = '';

  const sections = createEmptySections();
  let currentSection: ThreadContextSection | null = null;

  const lines = markdown.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === '_empty_') continue;

    // Heading detection
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const headingText = headingMatch[2]!.trim();
      if (level === 1 && headingText.toLowerCase() === 'thread context') {
        currentSection = null;
        continue;
      }
      const mapped = resolveHeadingToSection(headingText);
      currentSection = mapped;
      continue;
    }

    // Metadata header lines (before any section heading)
    if (currentSection === null) {
      const metaMatch = line.match(/^[-*]\s*(session_id|harness|updated_at)\s*:\s*(.+)$/i);
      if (metaMatch) {
        const key = metaMatch[1]!.toLowerCase();
        const val = metaMatch[2]!.trim();
        if (key === 'session_id' && !parsedSessionId) parsedSessionId = val;
        if (key === 'harness' && !parsedHarness) parsedHarness = val;
        if (key === 'updated_at' && !parsedUpdatedAt) parsedUpdatedAt = val;
        continue;
      }
    }

    if (currentSection !== null) {
      const bulletMatch = line.match(/^(?:[-*+]|\d+\.)\s+(.+)$/);
      const itemText = bulletMatch ? bulletMatch[1]!.trim() : line;
      if (itemText && itemText !== '_empty_') {
        sections[currentSection].push(itemText);
      }
    }
  }

  for (const sec of THREAD_CONTEXT_SECTIONS) {
    sections[sec] = normalizeItems(sections[sec]);
  }

  return {
    sessionId: parsedSessionId || 'default-session',
    harness: parsedHarness || 'default',
    updatedAt: parsedUpdatedAt || new Date().toISOString(),
    sections,
  };
}

// ── 2. Trajectory Distillation (SuggestedLearning -> Vault Promotion Queue) ──

export interface SuggestedLearning {
  id: string;
  sourceSection: ThreadContextSection;
  /** Cleaned actionable rule text (with inline `[private]` markers scrubbed). */
  rule: string;
  /** Alias for `rule` for compatibility with VaultEntry / MemoryAddBody shapes. */
  content: string;
  vault: CanonicalVaultType;
  confidence: number;
  tags: string[];
  rationale: string;
  isPrivate: boolean;
  sessionId: string;
  harness: string;
}

export interface VaultPromotionRecord {
  id: string;
  op: 'vault.promote';
  queue: 'PROMOTION_QUEUE';
  vault: CanonicalVaultType;
  content: string;
  confidence: number;
  tags: string[];
  privacy: 'public' | 'private-shareable';
  sourceSection: ThreadContextSection;
  sessionId: string;
  harness: string;
  reviewerId: string;
  approvedAt: string;
  /** Pre-serialized single-line JSONL string ready for append to PROMOTION_QUEUE. */
  jsonl: string;
}

const TRAJECTORY_VAULT_RULES: Array<{
  vault: CanonicalVaultType;
  keywords: string[];
  domainTag: string;
  rationale: string;
}> = [
  {
    vault: 'strategic',
    keywords: [
      'money',
      'fail closed',
      'fail-closed',
      'spend',
      'pricing',
      'refund',
      'billing',
      'wallet',
      'contract',
      'governance',
      'board',
      'sovereignty',
      'alliance',
      'canon lock',
      'roadmap',
      'revenue',
    ],
    domainTag: 'governance-strategy',
    rationale: 'Matches strategic/money/governance invariant rules',
  },
  {
    vault: 'creative',
    keywords: [
      'voice',
      'tone',
      'copy',
      'editorial',
      'sentence case',
      'brand',
      'anti-slop',
      'slop',
      'narrative',
      'style',
      'typography',
      'aesthetic',
      'design token',
    ],
    domainTag: 'voice-editorial',
    rationale: 'Matches brand voice, copy, or design/aesthetic rules',
  },
  {
    vault: 'technical',
    keywords: [
      'ci',
      'tsc',
      'typecheck',
      'typescript',
      'build',
      'lint',
      'test',
      'schema',
      'sqlite',
      'fts5',
      'api',
      'database',
      'dependency',
      'dependencies',
      'compile',
      'endpoint',
      'protocol',
    ],
    domainTag: 'ci-engineering',
    rationale: 'Matches CI gate, build, schema, or technical verification rules',
  },
  {
    vault: 'operational',
    keywords: [
      'worktree',
      'branch',
      'lane',
      'handover',
      'session',
      'queue',
      'heartbeat',
      'daemon',
      'staging',
      'deploy',
      'commit',
      'push',
      'ops',
      'checkout',
    ],
    domainTag: 'lane-hygiene',
    rationale: 'Matches operational lane hygiene, worktree, or session workflow rules',
  },
  {
    vault: 'wisdom',
    keywords: [
      'principle',
      'lesson',
      'philosophy',
      'meta-pattern',
      'insight',
      'universal',
      'compounding',
      'truth',
      'first-principles',
    ],
    domainTag: 'meta-wisdom',
    rationale: 'Matches cross-domain principle or philosophical insight',
  },
  {
    vault: 'horizon',
    keywords: [
      'wish',
      'benevolent',
      'golden age',
      'future vision',
      'dream',
      'horizon',
      'abundance',
    ],
    domainTag: 'horizon-vision',
    rationale: 'Matches long-horizon benevolent vision or aspiration',
  },
];

interface ParsedPrivacyTags {
  cleanedText: string;
  tags: string[];
  isPrivate: boolean;
}

function parseAndScrubPrivacyMarkers(rawText: string): ParsedPrivacyTags {
  const tags: string[] = [];
  let isPrivate = false;

  // Match bracketed tags like [private], [privacy:second-brain], [private-shareable], [tag:ci]
  const cleanedText = rawText
    .replace(/\[\s*(private-shareable|private|public|privacy:[a-z0-9_-]+|tag:[a-z0-9_-]+)\s*\]/gi, (_match, rawTag: string) => {
      const normalized = rawTag.trim().toLowerCase();
      if (normalized === 'private' || normalized === 'privacy:private') {
        isPrivate = true;
        tags.push('private');
      } else if (normalized === 'private-shareable' || normalized === 'privacy:shareable') {
        tags.push('private-shareable');
      } else if (normalized.startsWith('privacy:')) {
        isPrivate = true;
        tags.push(normalized);
      } else if (normalized.startsWith('tag:')) {
        tags.push(normalized.slice(4));
      } else if (normalized === 'public') {
        tags.push('public');
      }
      return '';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Also check unbracketed privacy:* tokens
  const unbracketedMatch = cleanedText.match(/\b(privacy:[a-z0-9_-]+)\b/gi);
  if (unbracketedMatch) {
    for (const token of unbracketedMatch) {
      const lower = token.toLowerCase();
      if (!tags.includes(lower)) tags.push(lower);
      if (lower !== 'privacy:public' && lower !== 'privacy:shareable') {
        isPrivate = true;
      }
    }
  }

  return {
    cleanedText,
    tags,
    isPrivate,
  };
}

/**
 * Classify a trajectory rule string into one of the 6 canonical semantic vaults.
 */
export function classifyTrajectoryVault(text: string): {
  vault: CanonicalVaultType;
  domainTag: string;
  rationale: string;
} {
  const lower = text.toLowerCase();
  let bestVault: CanonicalVaultType = 'operational';
  let bestDomainTag = 'lane-hygiene';
  let bestRationale = 'Default operational trajectory learning';
  let bestScore = 0;

  for (const candidate of TRAJECTORY_VAULT_RULES) {
    let score = 0;
    for (const kw of candidate.keywords) {
      if (lower.includes(kw)) {
        // Weight multi-word phrases slightly higher for specificity
        score += kw.includes(' ') ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestVault = candidate.vault;
      bestDomainTag = candidate.domainTag;
      bestRationale = candidate.rationale;
    }
  }

  return {
    vault: bestVault,
    domainTag: bestDomainTag,
    rationale: bestRationale,
  };
}

function isActionableRule(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  return true;
}

function makeDeterministicId(prefix: string, seed: string): string {
  const digest = createHash('sha256').update(seed).digest('hex').slice(0, 12);
  return `${prefix}_${digest}`;
}

/**
 * Scan `corrections` and `constraints` in a ThreadContextDocument for actionable
 * rules and classify each into one of the 6 semantic vaults.
 */
export function extractTrajectoryLearnings(
  doc: ThreadContextDocument,
): SuggestedLearning[] {
  const learnings: SuggestedLearning[] = [];
  const seenRules = new Set<string>();
  const targetSections: ThreadContextSection[] = ['corrections', 'constraints'];

  for (const section of targetSections) {
    const items = doc.sections[section] ?? [];
    for (const rawItem of items) {
      const { cleanedText, tags: privacyTags, isPrivate } = parseAndScrubPrivacyMarkers(rawItem);
      if (!isActionableRule(cleanedText)) continue;

      const dedupeKey = `${section}:${cleanedText.toLowerCase()}`;
      if (seenRules.has(dedupeKey)) continue;
      seenRules.add(dedupeKey);

      const { vault, domainTag, rationale } = classifyTrajectoryVault(cleanedText);
      const baseConfidence = section === 'corrections' ? 0.9 : 0.85;
      const allTags = normalizeItems([
        'trajectory-learning',
        `section:${section}`,
        `vault:${vault}`,
        domainTag,
        ...privacyTags,
      ]);

      const id = makeDeterministicId(
        'learn',
        `${doc.harness}:${doc.sessionId}:${section}:${cleanedText}`,
      );

      learnings.push({
        id,
        sourceSection: section,
        rule: cleanedText,
        content: cleanedText,
        vault,
        confidence: baseConfidence,
        tags: allTags,
        rationale,
        isPrivate,
        sessionId: doc.sessionId,
        harness: doc.harness,
      });
    }
  }

  return learnings;
}

function hasPrivateMarker(learning: SuggestedLearning): boolean {
  if (learning.isPrivate) return true;
  if (/\[private\]/i.test(learning.rule) || /\[private\]/i.test(learning.content)) {
    return true;
  }
  for (const t of learning.tags) {
    const lower = t.toLowerCase().trim();
    if (lower === 'private' || lower === 'privacy:private') return true;
    if (
      lower.startsWith('privacy:') &&
      lower !== 'privacy:public' &&
      lower !== 'privacy:shareable'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Format an approved trajectory learning into an event-sourced JSONL entry
 * ready for `PROMOTION_QUEUE` / vault append.
 *
 * Enforces SIS Gateway privacy rules:
 * - Drops `[private]` or non-shareable `privacy:*` items (returns `null`).
 * - Preserves allowed privacy tags (e.g. `private-shareable`) on promoted records.
 */
export function buildVaultPromotionRecord(
  learning: SuggestedLearning,
  reviewerId: string,
): VaultPromotionRecord | null {
  const cleanReviewer = reviewerId.trim();
  if (!cleanReviewer) {
    throw new Error('reviewerId is required to build a vault promotion record');
  }

  if (hasPrivateMarker(learning)) {
    return null;
  }

  const { cleanedText } = parseAndScrubPrivacyMarkers(learning.rule || learning.content);
  if (!cleanedText) {
    return null;
  }

  const isShareable = learning.tags.some((t) => {
    const lower = t.toLowerCase();
    return lower === 'private-shareable' || lower === 'privacy:shareable';
  });

  const privacy: 'public' | 'private-shareable' = isShareable
    ? 'private-shareable'
    : 'public';

  const preservedTags = normalizeItems(
    learning.tags.filter((t) => {
      const lower = t.toLowerCase();
      return lower !== 'private' && !lower.startsWith('privacy:private');
    }),
  );

  const approvedAt = new Date().toISOString();
  const id = makeDeterministicId('promo', `${learning.id}:${cleanReviewer}`);

  const payload = {
    id,
    op: 'vault.promote' as const,
    queue: 'PROMOTION_QUEUE' as const,
    vault: learning.vault,
    content: cleanedText,
    confidence: learning.confidence,
    tags: preservedTags,
    privacy,
    sourceSection: learning.sourceSection,
    sessionId: learning.sessionId,
    harness: learning.harness,
    reviewerId: cleanReviewer,
    approvedAt,
  };

  return {
    ...payload,
    jsonl: JSON.stringify(payload),
  };
}

// ── 3. Cross-Harness Memory Importer ─────────────────────────────────────────

export type SupportedMemoryHarness =
  | 'openclaw'
  | 'claude-code'
  | 'hyperagent'
  | 'cursor';

export interface HarnessMemoryPacketInput {
  harness: SupportedMemoryHarness;
  markdown: string;
  sessionId?: string;
  sourceFile?: string;
  reviewerId?: string;
}

export interface HarnessMemoryImportResult {
  harness: SupportedMemoryHarness;
  sourceFileKind: string;
  document: ThreadContextDocument;
  suggestedLearnings: SuggestedLearning[];
  promotionCandidates: VaultPromotionRecord[];
  droppedPrivateCount: number;
}

function detectSourceFileKind(
  harness: SupportedMemoryHarness,
  markdown: string,
  sourceFile?: string,
): string {
  if (sourceFile && sourceFile.trim()) {
    return sourceFile.trim();
  }
  const lower = markdown.toLowerCase();
  if (harness === 'openclaw') {
    if (lower.includes('# soul') || lower.includes('soul.md')) return 'SOUL.md';
    if (lower.includes('# heartbeat') || lower.includes('heartbeat.md')) return 'HEARTBEAT.md';
    if (lower.includes('# agents') || lower.includes('agents.md')) return 'AGENTS.md';
    if (lower.includes('# memory') || lower.includes('memory.md')) return 'MEMORY.md';
    return 'SOUL.md';
  }
  if (harness === 'claude-code') return 'CLAUDE.md';
  if (harness === 'hyperagent') return 'Thread Context';
  if (harness === 'cursor') return '.cursorrules';
  return 'unknown';
}

function classifyBulletLineToSection(
  line: string,
  fallbackSection: ThreadContextSection,
): ThreadContextSection {
  const lower = line.toLowerCase();

  if (
    lower.startsWith('correction:') ||
    lower.startsWith('fix:') ||
    lower.startsWith('avoid ') ||
    lower.includes('instead of ') ||
    lower.includes('was broken') ||
    lower.includes('regression')
  ) {
    return 'corrections';
  }

  if (
    lower.startsWith('never ') ||
    lower.startsWith('do not ') ||
    lower.startsWith("don't ") ||
    lower.startsWith('must ') ||
    lower.startsWith('always ') ||
    lower.startsWith('constraint:') ||
    lower.startsWith('rule:') ||
    lower.includes('fail closed') ||
    lower.includes('fail-closed') ||
    lower.includes('non-waivable') ||
    lower.includes('human-gated')
  ) {
    return 'constraints';
  }

  if (
    lower.startsWith('decision:') ||
    lower.startsWith('chosen:') ||
    lower.startsWith('architecture:')
  ) {
    return 'decisions';
  }

  if (
    lower.startsWith('- [ ]') ||
    lower.startsWith('- [x]') ||
    lower.startsWith('todo:') ||
    lower.startsWith('task:')
  ) {
    return 'plan_tasks';
  }

  if (
    /\b(\d+(\.\d+)?%|\$\d+|\d+\s*(ms|s|sec|min|hours|days|mb|gb|tokens|commits|tests))\b/i.test(
      line,
    ) &&
    fallbackSection === 'notes'
  ) {
    return 'numbers_and_values';
  }

  return fallbackSection;
}

/**
 * Deterministic cross-harness memory importer accepting markdown from:
 * - `'openclaw'` (`SOUL.md` / `AGENTS.md` / `HEARTBEAT.md` / `MEMORY.md`)
 * - `'claude-code'` (`CLAUDE.md`)
 * - `'hyperagent'` (`Thread Context`)
 * - `'cursor'` (`.cursorrules`)
 *
 * Maps content into a canonical 9-section `ThreadContextDocument` and extracts
 * `SuggestedLearning` items + privacy-scrubbed `VaultPromotionRecord` candidates.
 */
export function importHarnessMemoryPacket(
  input: HarnessMemoryPacketInput,
): HarnessMemoryImportResult;
export function importHarnessMemoryPacket(
  harness: SupportedMemoryHarness,
  markdown: string,
  options?: { sessionId?: string; sourceFile?: string; reviewerId?: string },
): HarnessMemoryImportResult;
export function importHarnessMemoryPacket(
  inputOrHarness: HarnessMemoryPacketInput | SupportedMemoryHarness,
  maybeMarkdown?: string,
  maybeOptions?: { sessionId?: string; sourceFile?: string; reviewerId?: string },
): HarnessMemoryImportResult {
  const packet: HarnessMemoryPacketInput =
    typeof inputOrHarness === 'string'
      ? {
          harness: inputOrHarness,
          markdown: maybeMarkdown ?? '',
          sessionId: maybeOptions?.sessionId,
          sourceFile: maybeOptions?.sourceFile,
          reviewerId: maybeOptions?.reviewerId,
        }
      : inputOrHarness;

  const harness = packet.harness;
  const sessionId = packet.sessionId?.trim() || `${harness}-import`;
  const reviewerId = packet.reviewerId?.trim() || `importer:${harness}`;
  const sourceFileKind = detectSourceFileKind(harness, packet.markdown, packet.sourceFile);

  // Fast-path for Hyperagent Thread Context documents while also supporting mixed headings
  let doc: ThreadContextDocument;
  if (harness === 'hyperagent' && packet.markdown.includes('# Thread Context')) {
    doc = parseThreadContextMarkdown(packet.markdown, sessionId, harness);
  } else {
    doc = createThreadContext(sessionId, harness);
    let currentSection: ThreadContextSection =
      sourceFileKind === 'HEARTBEAT.md'
        ? 'plan_tasks'
        : sourceFileKind === '.cursorrules'
          ? 'constraints'
          : 'notes';

    const lines = packet.markdown.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === '_empty_' || line.startsWith('<!--')) continue;

      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const headingText = headingMatch[2]!.trim();
        const mapped = resolveHeadingToSection(headingText);
        if (mapped) {
          currentSection = mapped;
        }
        continue;
      }

      // Skip metadata bullets from Thread Context headers if present
      const metaMatch = line.match(/^[-*]\s*(session_id|harness|updated_at)\s*:\s*(.+)$/i);
      if (metaMatch) {
        continue;
      }

      // Strip leading bullet or numbered prefix
      const checkboxMatch = line.match(/^[-*+]\s*\[[ xX]\]\s+(.+)$/);
      const bulletMatch = line.match(/^(?:[-*+]|\d+\.)\s+(.+)$/);
      const cleanItem = checkboxMatch
        ? checkboxMatch[1]!.trim()
        : bulletMatch
          ? bulletMatch[1]!.trim()
          : line;

      if (!cleanItem) continue;

      const targetSection = checkboxMatch
        ? 'plan_tasks'
        : classifyBulletLineToSection(cleanItem, currentSection);

      doc.sections[targetSection].push(cleanItem);
    }

    for (const sec of THREAD_CONTEXT_SECTIONS) {
      doc.sections[sec] = normalizeItems(doc.sections[sec]);
    }
  }

  const suggestedLearnings = extractTrajectoryLearnings(doc);
  const promotionCandidates: VaultPromotionRecord[] = [];
  let droppedPrivateCount = 0;

  for (const learning of suggestedLearnings) {
    const record = buildVaultPromotionRecord(learning, reviewerId);
    if (record === null) {
      droppedPrivateCount++;
    } else {
      promotionCandidates.push(record);
    }
  }

  return {
    harness,
    sourceFileKind,
    document: doc,
    suggestedLearnings,
    promotionCandidates,
    droppedPrivateCount,
  };
}
