/**
 * Starlight Queen — Independent Review Receipt Generator and Validator
 *
 * Produces and verifies exact-head STARLIGHT-INDEPENDENT-REVIEW-V1 receipts
 * compatible with tools/merge-review/merge_review_gate.py.
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { createHash } from 'node:crypto';
import { posix as posixPath } from 'node:path';

export const REVIEW_RECEIPT_MARKER = 'STARLIGHT-INDEPENDENT-REVIEW-V1\n';

export const MAKERS = [
  'codex',
  'claude-code',
  'antigravity',
  'cto',
  'jules',
  'grok',
  'dependabot',
  'github-actions',
] as const;

export const REVIEW_PROVIDERS = [
  'codex',
  'claude-code',
  'antigravity',
  'cto',
] as const;

export const INDEPENDENT_OF_CTO = [
  'codex',
  'claude-code',
  'antigravity',
] as const;

export type MakerSeat = (typeof MAKERS)[number];
export type ReviewProviderSeat = (typeof REVIEW_PROVIDERS)[number];
export type ReviewVerdict = 'PASS' | 'FAIL';

export interface ReviewReceiptV1 {
  repository: string;
  pr: number;
  headSha: string;
  maker: MakerSeat;
  provider: ReviewProviderSeat;
  verdict: ReviewVerdict;
  blockingFindings: string[];
  reviewedFiles: string[];
  review: string;
  reviewSha256: string;
  packetSha256: string;
  resolution: string;
}

export interface CreateReviewReceiptInput {
  repository: string;
  pr: number;
  headSha: string;
  maker: MakerSeat;
  provider: ReviewProviderSeat;
  verdict?: ReviewVerdict;
  blockingFindings?: string[];
  reviewedFiles: string[];
  review: string;
  resolution: string;
  packetSha256?: string;
  diffSummary?: string;
}

export interface ReviewChangedFile {
  filename: string;
  previous_filename?: string;
}

/** GitHub-provided provenance, fetched through the trusted read path. Never take it from a receipt body. */
export interface ReviewCommentEnvelope {
  body: string;
  user: { login: string };
  author_association: string;
  performed_via_github_app: { slug: string } | null;
  created_at: string;
  updated_at: string;
  edit_history_checked: boolean;
  last_edited_at: string | null;
  content_edit_count: number;
}

export interface ValidateReceiptExpectation {
  repository: string;
  pr: number;
  headSha: string;
  changedFiles: Array<string | ReviewChangedFile>;
  autoMergeArmed?: boolean;
}

export interface ValidateReceiptResult {
  valid: boolean;
  risky: boolean;
  reason: string;
  receipt?: ReviewReceiptV1;
  provenanceChecked?: boolean;
}

const INSTRUCTION_NAMES = new Set([
  'agents.md',
  'agents.override.md',
  'skill.md',
  'skills.md',
  'soul.md',
  'rules.md',
  'claude.md',
  'gemini.md',
  'grok.md',
]);

const MANIFEST_NAMES = new Set([
  'package.json',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',
  'bun.lockb',
  'bun.lock',
  '.npmrc',
  'cargo.toml',
  'cargo.lock',
  'pyproject.toml',
  'poetry.lock',
  'uv.lock',
  'pipfile',
  'pipfile.lock',
  'setup.py',
  'setup.cfg',
  'go.mod',
  'go.sum',
  'gemfile',
  'gemfile.lock',
]);

const MANIFEST_PATTERNS = [
  /^requirements([-_.][a-z0-9_.-]*)?\.(txt|in)$/,
  /^constraints([-_.][a-z0-9_.-]*)?\.txt$/,
];

const MANIFEST_DIR_PATTERNS = [
  /(^|\/)requirements\/([^/]+\/)*[^/]+\.(txt|in)$/,
];

const HIGH_RISK_PATTERNS = [
  /(^|\/)\.github\//,
  /(^|\/)tools\/merge-review\//,
  /(^|\/)tools\/jules-conductor\//,
  /(^|\/)docs\/merge-review\.md$/,
  /(^|\/)(codeowners|license|licence|notice)(\.[a-z]+)?$/,
  /licens/,
  /(pay|billing|stripe|checkout|price|pricing|invoice|money|wallet|marketplace)/,
  /(publish|release|deploy|npm-|vercel)/,
  /(secret|credential|token|\.env|\.pem$|\.key$)/,
  /(auth|login|session|oauth|permission|rbac|security)/,
  /(^|\/)src\/finance\//,
  /(finance|revenue|payout|pnl)/,
  /(^|\/)src\/infra\/cost-snapshot\.ts$/,
  /(^|\/)src\/infra\/cost-sources\//,
  /(^|\/)cost-plane-config\.template\.json$/,
  /(^|\/)scripts\/install-cost-snapshot-cron\.sh$/,
  /(^|\/)scripts\/run-cost-snapshot\.mjs$/,
  /(^|\/)src\/alexandria\//,
];

const NON_FINANCIAL_LEDGERS = new Set([
  'docs/architecture/decision-ledger.md',
  'docs/decisions/ledger.md',
  'memory/source-ledger.json',
]);

/**
 * Computes a lowercase hex SHA-256 digest of a UTF-8 string.
 */
export function sha256Hex(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Classifies whether a repository-relative path touches a high-risk surface.
 */
export function isHighRiskPath(filePath: string): boolean {
  const normalized = String(filePath).replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
  const baseName = posixPath.basename(normalized);

  if (INSTRUCTION_NAMES.has(baseName) || MANIFEST_NAMES.has(baseName)) {
    return true;
  }
  if (MANIFEST_PATTERNS.some((re) => re.test(baseName))) {
    return true;
  }
  if (MANIFEST_DIR_PATTERNS.some((re) => re.test(normalized))) {
    return true;
  }
  if (HIGH_RISK_PATTERNS.some((re) => re.test(normalized))) {
    return true;
  }
  if (/ledger/.test(normalized) && !NON_FINANCIAL_LEDGERS.has(normalized)) {
    return true;
  }
  return false;
}

/**
 * Checks whether a review provider is permitted to review a change authored by maker.
 */
export function isReviewerAllowed(
  maker: string,
  provider: string,
  risky: boolean,
): boolean {
  if (!(MAKERS as readonly string[]).includes(maker) || !(REVIEW_PROVIDERS as readonly string[]).includes(provider)) {
    return false;
  }
  if (maker === provider) {
    return false;
  }
  if (!risky) {
    return true;
  }
  if (maker === 'cto') {
    return (INDEPENDENT_OF_CTO as readonly string[]).includes(provider);
  }
  return provider === 'cto';
}

/**
 * Computes a deterministic 64-hex packet SHA-256 for the review context.
 */
export function computePacketSha256(params: {
  repository: string;
  pr: number;
  headSha: string;
  reviewedFiles: string[];
  diffSummary?: string;
}): string {
  const canonical = JSON.stringify({
    repository: params.repository,
    pr: params.pr,
    headSha: params.headSha,
    reviewedFiles: [...new Set(params.reviewedFiles)].sort(),
    diffSummary: params.diffSummary ?? '',
  });
  return sha256Hex(canonical);
}

/**
 * Builds a structured ReviewReceiptV1 and its formatted GitHub comment body.
 */
export function createReviewReceipt(input: CreateReviewReceiptInput): {
  receipt: ReviewReceiptV1;
  body: string;
  risky: boolean;
} {
  if (!/^[0-9a-f]{40}$/.test(input.headSha)) {
    throw new Error(`Invalid headSha: expected 40-char lowercase hex SHA, received "${input.headSha}"`);
  }
  if (!Number.isInteger(input.pr) || input.pr < 1) {
    throw new Error(`Invalid PR number: ${input.pr}`);
  }
  if (!Array.isArray(input.reviewedFiles) || input.reviewedFiles.length === 0 ||
      !input.reviewedFiles.every((file) => typeof file === 'string' && file.trim().length > 0)) {
    throw new Error('reviewedFiles must contain at least one file path');
  }
  if (typeof input.review !== 'string' || input.review.length < 80) {
    throw new Error('review report must be at least 80 characters long');
  }
  if (typeof input.resolution !== 'string' || !input.resolution.trim()) {
    throw new Error('resolution must be a non-empty string');
  }

  const normalizedFiles = [...new Set(input.reviewedFiles.map((f) => f.replace(/\\/g, '/')))].sort();
  const risky = normalizedFiles.some((f) => isHighRiskPath(f));

  if (!isReviewerAllowed(input.maker, input.provider, risky)) {
    throw new Error(
      `Reviewer "${input.provider}" is not permitted to ratify maker "${input.maker}" (risky=${risky})`,
    );
  }

  const verdict: ReviewVerdict = input.verdict ?? 'PASS';
  if (!['PASS', 'FAIL'].includes(verdict) || (input.blockingFindings !== undefined &&
      (!Array.isArray(input.blockingFindings) || !input.blockingFindings.every((item) => typeof item === 'string'))) ||
      (verdict === 'PASS' && (input.blockingFindings?.length ?? 0) > 0)) {
    throw new Error('Invalid verdict or blocking findings; PASS cannot carry blocking findings.');
  }
  const blockingFindings = input.blockingFindings ?? [];
  const reviewSha256 = sha256Hex(input.review);
  const packetSha256 =
    input.packetSha256 && /^[0-9a-f]{64}$/.test(input.packetSha256)
      ? input.packetSha256
      : computePacketSha256({
          repository: input.repository,
          pr: input.pr,
          headSha: input.headSha,
          reviewedFiles: normalizedFiles,
          diffSummary: input.diffSummary,
        });

  const receipt: ReviewReceiptV1 = {
    repository: input.repository,
    pr: input.pr,
    headSha: input.headSha,
    maker: input.maker,
    provider: input.provider,
    verdict,
    blockingFindings,
    reviewedFiles: normalizedFiles,
    review: input.review,
    reviewSha256,
    packetSha256,
    resolution: input.resolution.trim(),
  };

  const body = `${REVIEW_RECEIPT_MARKER}${JSON.stringify(receipt, null, 2)}`;
  if (body.length > 60000) throw new Error('Receipt exceeds the merge gate comment limit.');
  return { receipt, body, risky };
}

/**
 * Checks payload shape and exact-head coverage only. This does not authenticate a reviewer.
 * Use validateReviewReceiptComment with GitHub provenance for a trusted-comment decision.
 */
export function validateReviewReceiptBody(
  body: string,
  expected: ValidateReceiptExpectation,
): ValidateReceiptResult {
  if (!Array.isArray(expected.changedFiles) || expected.changedFiles.some((file) =>
    typeof file !== 'string' && (!file || typeof file.filename !== 'string' ||
      (file.previous_filename !== undefined && typeof file.previous_filename !== 'string')))) {
    return { valid: false, risky: true, reason: 'Malformed changed-file metadata.', provenanceChecked: false };
  }
  const entries = expected.changedFiles.map((file) => typeof file === 'string' ? { filename: file } : file);
  const normalizedChanged = [...new Set(entries.map((file) => file.filename.replace(/\\/g, '/')))].sort();
  const risky = entries.some((file) => isHighRiskPath(file.filename) ||
    (file.previous_filename !== undefined && isHighRiskPath(file.previous_filename)));

  if (!/^[0-9a-f]{40}$/.test(expected.headSha) || normalizedChanged.length === 0) {
    return {
      valid: false,
      risky,
      reason: 'Missing or invalid source identity or changed files.',
    };
  }

  if (risky && expected.autoMergeArmed) {
    return {
      valid: false,
      risky,
      reason: 'High-risk change has auto-merge armed; disable it. High-risk PRs never auto-merge.',
    };
  }

  const crlfMarker = REVIEW_RECEIPT_MARKER.replace('\n', '\r\n');
  const marker = body.startsWith(REVIEW_RECEIPT_MARKER)
    ? REVIEW_RECEIPT_MARKER
    : body.startsWith(crlfMarker)
      ? crlfMarker
      : null;

  if (!marker || body.length > 60000) {
    return {
      valid: false,
      risky,
      reason: 'Comment does not start with STARLIGHT-INDEPENDENT-REVIEW-V1 marker or exceeds size limit.',
    };
  }

  let receipt: ReviewReceiptV1;
  try {
    receipt = JSON.parse(body.slice(marker.length)) as ReviewReceiptV1;
  } catch {
    return {
      valid: false,
      risky,
      reason: 'Failed to parse JSON payload after receipt marker.',
    };
  }

  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt) ||
      !Array.isArray(receipt.reviewedFiles) ||
      !receipt.reviewedFiles.every((file) => typeof file === 'string' && file.trim().length > 0)) {
    return { valid: false, risky, reason: 'Malformed receipt object or reviewedFiles.' };
  }
  const reviewedSet = new Set(receipt.reviewedFiles.map((f) => f.replace(/\\/g, '/')));
  const expectedSet = new Set(normalizedChanged);
  const filesMatch =
    reviewedSet.size === expectedSet.size &&
    [...expectedSet].every((file) => reviewedSet.has(file));

  const valid =
    receipt.repository === expected.repository &&
    typeof receipt.pr === 'number' &&
    Number.isInteger(receipt.pr) &&
    receipt.pr === expected.pr &&
    receipt.headSha === expected.headSha &&
    (MAKERS as readonly string[]).includes(receipt.maker) &&
    isReviewerAllowed(receipt.maker, receipt.provider, risky) &&
    receipt.verdict === 'PASS' &&
    Array.isArray(receipt.blockingFindings) &&
    receipt.blockingFindings.length === 0 &&
    filesMatch &&
    typeof receipt.review === 'string' &&
    receipt.review.length >= 80 &&
    receipt.reviewSha256 === sha256Hex(receipt.review) &&
    typeof receipt.packetSha256 === 'string' &&
    /^[0-9a-f]{64}$/.test(receipt.packetSha256) &&
    typeof receipt.resolution === 'string' &&
    receipt.resolution.trim().length > 0;

  if (!valid) {
    return {
      valid: false,
      risky,
      reason: 'Latest trusted review receipt is invalid or reports blocking findings.',
      receipt,
    };
  }

  return {
    valid: true,
    risky,
    reason: `Exact-head payload PASS by ${receipt.provider}; GitHub provenance has not been checked.`,
    provenanceChecked: false,
    receipt,
  };
}

/** Mirrors trusted-App, author-association and immutable-comment checks of the canonical gate.
 * The caller must fetch a complete current-head file listing and select the latest trusted receipt.
 * This single-comment helper does not establish chronology against newer reviews.
 */
export function validateReviewReceiptComment(
  comment: ReviewCommentEnvelope,
  expected: ValidateReceiptExpectation,
): ValidateReceiptResult {
  if (!comment || typeof comment !== 'object' || comment.user?.login !== 'frankxai' ||
      !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(comment.author_association) ||
      !['cursor', 'chatgpt-codex-connector'].includes(comment.performed_via_github_app?.slug ?? '') ||
      typeof comment.created_at !== 'string' || !comment.created_at ||
      comment.created_at !== comment.updated_at || comment.edit_history_checked !== true ||
      comment.last_edited_at !== null || comment.content_edit_count !== 0 || typeof comment.body !== 'string') {
    return { valid: false, risky: true, reason: 'Missing or untrusted GitHub comment provenance.', provenanceChecked: false };
  }
  // A trusted gate decision requires the authoritative record form, including rename sources.
  if (!Array.isArray(expected.changedFiles) || expected.changedFiles.some((file) => typeof file === 'string')) {
    return { valid: false, risky: true, reason: 'Trusted validation requires GitHub changed-file records.', provenanceChecked: true };
  }
  const result = validateReviewReceiptBody(comment.body, expected);
  return { ...result, provenanceChecked: true,
    reason: result.valid ? 'Exact-head receipt payload and GitHub comment provenance pass; latest-review selection remains required.' : result.reason };
}
