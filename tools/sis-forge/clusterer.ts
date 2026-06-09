import type { Atom, Cluster } from "./atom-schema.ts";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "and", "or", "but", "if", "then", "to", "of", "in", "on", "at", "for",
  "with", "from", "by", "as", "this", "that", "these", "those", "it",
  "its", "we", "you", "i", "me", "my", "our", "ours", "they", "them",
  "their", "theirs", "do", "does", "did", "will", "would", "could",
  "should", "have", "has", "had", "not", "no", "yes", "so", "up", "down",
  "out", "off", "over", "under", "again", "more", "most", "some", "any",
  "all", "each", "every", "very", "just", "also", "than", "too", "now",
  "built", "sip", "frankx", "frank", "claude",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function tfVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function tfidfWeight(tf: Map<string, number>, df: Map<string, number>, N: number): Map<string, number> {
  const w = new Map<string, number>();
  for (const [term, freq] of tf) {
    const idf = Math.log((N + 1) / ((df.get(term) ?? 0) + 1)) + 1;
    w.set(term, freq * idf);
  }
  return w;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [t, va] of a) {
    normA += va * va;
    const vb = b.get(t);
    if (vb !== undefined) dot += va * vb;
  }
  for (const vb of b.values()) normB += vb * vb;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const SIM_THRESHOLD = 0.75;

const MAX_ATOMS_TOTAL = 1000;
const MAX_ATOMS_PER_SOURCE = 200;

export function applyAtomBudget(atoms: Atom[]): Atom[] {
  const bySource = new Map<Atom["source"], Atom[]>();
  for (const a of atoms) {
    if (!bySource.has(a.source)) bySource.set(a.source, []);
    bySource.get(a.source)!.push(a);
  }

  const truncatedPerSource: Atom[] = [];
  for (const list of bySource.values()) {
    const sorted = [...list].sort((x, y) => (y.weight ?? 1) - (x.weight ?? 1));
    truncatedPerSource.push(...sorted.slice(0, MAX_ATOMS_PER_SOURCE));
  }

  if (truncatedPerSource.length <= MAX_ATOMS_TOTAL) return truncatedPerSource;

  const globalSorted = [...truncatedPerSource].sort((x, y) => (y.weight ?? 1) - (x.weight ?? 1));
  return globalSorted.slice(0, MAX_ATOMS_TOTAL);
}

export function clusterAtoms(atoms: Atom[]): Cluster[] {
  if (atoms.length === 0) return [];

  const sorted = [...atoms].sort((x, y) => x.id.localeCompare(y.id));

  const docs = sorted.map((a) => tokenize(`${a.topic} ${a.summary}`));
  const df = new Map<string, number>();
  for (const doc of docs) {
    const seen = new Set(doc);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const vectors = docs.map((d) => tfidfWeight(tfVector(d), df, sorted.length));

  const assigned = new Array(sorted.length).fill(-1);
  const clusters: Cluster[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (assigned[i] !== -1) continue;
    const clusterId = `c${clusters.length + 1}`;
    const members = [sorted[i]];
    assigned[i] = clusters.length;
    for (let j = i + 1; j < sorted.length; j++) {
      if (assigned[j] !== -1) continue;
      const sim = cosine(vectors[i], vectors[j]);
      if (sim >= SIM_THRESHOLD) {
        members.push(sorted[j]);
        assigned[j] = clusters.length;
      }
    }
    const sources = Array.from(new Set(members.map((a) => a.source))).sort();
    const label = topTerms(vectors[i], 3);
    const distinctSourceCount = sources.length;
    const bucket: Cluster["bucket"] =
      members.length >= 7 && distinctSourceCount >= 2 ? "signature" :
      members.length >= 3 && distinctSourceCount >= 2 ? "framework" :
      "anecdote";
    clusters.push({
      id: clusterId,
      label,
      atoms: members,
      sources: sources as Cluster["sources"],
      bucket,
    });
  }

  return clusters;
}

function topTerms(vec: Map<string, number>, n: number): string {
  return Array.from(vec.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t)
    .join(" ");
}
