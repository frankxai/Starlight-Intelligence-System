/**
 * Metadata Enricher — Starlight Ingestion Substrate
 *
 * Enriches ingested Markdown/HTML atoms with YAML frontmatter,
 * document structural analysis, and 6-Vault semantic routing heuristics.
 *
 * Built on SIP — operational tier.
 */

export interface DocumentMetadata {
  title: string;
  author?: string;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  sourceSha256?: string;
  tags: string[];
  vault: 'strategic' | 'technical' | 'creative' | 'operational' | 'wisdom' | 'horizon';
  confidence: number;
  wordCount: number;
  headings: { level: number; text: string; id?: string }[];
  codeBlockCount: number;
  hasTables: boolean;
}

const VAULT_KEYWORDS: Record<DocumentMetadata['vault'], string[]> = {
  strategic: [
    'strategy', 'strategic', 'architecture', 'decision', 'roadmap', 'business',
    'revenue', 'monetization', 'alliance', 'governance', 'tier', 'pricing', 'gtm'
  ],
  technical: [
    'code', 'api', 'schema', 'database', 'typescript', 'rust', 'sqlite', 'vector',
    'algorithm', 'benchmark', 'runtime', 'worker', 'cloudflare', 'infra', 'function',
    'deploy', 'docker', 'endpoint', 'refactor', 'git'
  ],
  creative: [
    'lore', 'voice', 'brand', 'design', 'aesthetic', 'art', 'music', 'prompt',
    'style', 'visual', 'audio', 'cinema', 'story', 'narrative', 'gate', 'arcanea'
  ],
  operational: [
    'task', 'todo', 'runbook', 'workflow', 'ci/cd', 'session', 'status', 'progress',
    'incident', 'checklist', 'cron', 'receipt', 'harness', 'ingestion', 'audit'
  ],
  wisdom: [
    'principle', 'mental model', 'philosophy', 'lesson', 'first principles',
    'truth', 'axiom', 'sovereignty', 'reflection', 'ethics', 'law', 'pattern'
  ],
  horizon: [
    'moonshot', 'future', 'vision', 'long-term', '2030', 'quantum', 'dream',
    'superintelligence', 'autonomous economy', 'frontier', 'experiment'
  ],
};

/**
 * Heuristically route document text to one of the 6 Starlight Semantic Vaults.
 */
export function classifyVault(text: string): { vault: DocumentMetadata['vault']; confidence: number } {
  const lower = text.toLowerCase();
  const scores: Record<DocumentMetadata['vault'], number> = {
    strategic: 0,
    technical: 0,
    creative: 0,
    operational: 0,
    wisdom: 0,
    horizon: 0,
  };

  for (const [vault, keywords] of Object.entries(VAULT_KEYWORDS) as [DocumentMetadata['vault'], string[]][]) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        scores[vault] += matches.length;
      }
    }
  }

  let topVault: DocumentMetadata['vault'] = 'operational';
  let maxScore = 0;
  let totalScore = 0;

  for (const [vault, score] of Object.entries(scores) as [DocumentMetadata['vault'], number][]) {
    totalScore += score;
    if (score > maxScore) {
      maxScore = score;
      topVault = vault;
    }
  }

  // Keyword share is a routing hint, not a calibrated probability of correctness.
  const confidence = totalScore === 0 ? 0 : Number((maxScore / totalScore).toFixed(2));
  return { vault: topVault, confidence };
}

/**
 * Extract structural headings from Markdown text.
 */
export function extractHeadings(markdown: string): { level: number; text: string; id?: string }[] {
  const headings: { level: number; text: string; id?: string }[] = [];
  const lines = markdown.split(/\r?\n/);
  let fence: { marker: string; length: number } | undefined;

  for (const line of lines) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = { marker: marker[1][0], length: marker[1].length };
      else if (marker[1][0] === fence.marker && marker[1].length >= fence.length && /^\s{0,3}(`{3,}|~{3,})\s*$/.test(line)) fence = undefined;
      continue;
    }
    if (fence) continue;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\s*\{#([^\}]+)\}\s*$/, '');
      const idMatch = match[2].match(/\{#([^\}]+)\}/);
      const id = idMatch ? idMatch[1] : text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  }

  return headings;
}

/**
 * Extract candidate tags from document content and headings.
 */
export function extractTags(text: string, headings: { text: string }[]): string[] {
  const tags = new Set<string>();
  const lower = text.toLowerCase();

  const commonKeywords = [
    'second-brain', 'architecture', 'cloudflare', 'sqlite', 'vector', 'swarm',
    'arcanea', 'governance', 'voice', 'prompting', 'ingestion', 'evals',
    'design-system', 'pipeline', 'memory', 'truth', 'protocol', 'automation'
  ];

  for (const kw of commonKeywords) {
    if (lower.includes(kw)) {
      tags.add(kw);
    }
  }

  for (const h of headings.slice(0, 5)) {
    const words = h.text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    for (const w of words) {
      if (/^[a-z-]+$/.test(w)) {
        tags.add(w);
      }
    }
  }

  return Array.from(tags).slice(0, 8);
}

/**
 * Generate full metadata block for a converted document.
 */
export function enrichMetadata(markdown: string, options: {
  title?: string;
  author?: string;
  source?: string;
  sourceSha256?: string;
  createdAt?: string;
  tags?: string[];
  vault?: DocumentMetadata['vault'];
} = {}): DocumentMetadata {
  if (options.vault && !Object.hasOwn(VAULT_KEYWORDS, options.vault)) {
    throw new Error(`Unsupported vault: ${options.vault}`);
  }
  const headings = extractHeadings(markdown);
  const title = options.title || (headings.length > 0 ? headings[0].text : 'Untitled Document');
  const classification = classifyVault(markdown);
  const wordCount = (markdown.match(/\S+/g) || []).length;
  const codeBlockCount = (markdown.match(/```/g) || []).length / 2;
  const hasTables = /\|[^\n]+\|\n\|[-:\s|]+\|\n/.test(markdown);
  const tags = options.tags && options.tags.length > 0 ? options.tags : extractTags(markdown, headings);

  return {
    title,
    author: options.author,
    createdAt: options.createdAt || new Date().toISOString(),
    source: options.source,
    sourceSha256: options.sourceSha256,
    tags,
    vault: options.vault || classification.vault,
    confidence: classification.confidence,
    wordCount,
    headings,
    codeBlockCount: Math.floor(codeBlockCount),
    hasTables,
  };
}

/**
 * Format metadata as YAML frontmatter string.
 */
export function formatFrontmatter(meta: DocumentMetadata): string {
  return [
    '---',
    `title: ${JSON.stringify(meta.title)}`,
    meta.author ? `author: ${JSON.stringify(meta.author)}` : null,
    `created_at: ${JSON.stringify(meta.createdAt)}`,
    meta.source ? `source: ${JSON.stringify(meta.source)}` : null,
    meta.sourceSha256 ? `source_sha256: ${JSON.stringify(meta.sourceSha256)}` : null,
    'source_role: "untrusted-input"',
    'classification_method: "keyword-heuristic"',
    `vault: ${meta.vault}`,
    `confidence: ${meta.confidence}`,
    `tags: [${meta.tags.map(t => JSON.stringify(t)).join(', ')}]`,
    `word_count: ${meta.wordCount}`,
    '---',
    '',
  ].filter(line => line !== null).join('\n');
}
