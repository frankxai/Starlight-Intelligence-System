/**
 * The vault: what the Desk remembers, as JSONL the customer owns.
 *
 * One line per belief. Plain text, append-only, readable with `cat`, portable
 * with `cp`. No database to run, nothing to migrate, and a founder can read
 * their own memory without asking anyone for access.
 *
 * Every write is best-effort by design: a vault that cannot be written records
 * a failed stage and the run still produces its brief and its receipt. Memory
 * is worth having and worth nobody's demo.
 *
 * Built on SIP — operational tier.
 */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface VaultAtom {
  id: string;
  kind: "belief";
  /** The question whose run produced this belief. */
  question: string;
  claim: string;
  quote: string;
  url: string;
  confidence: number;
  receiptId: string;
  at: string;
}

/**
 * Where the vault lives. A serverless filesystem is read-only apart from /tmp,
 * so a deployed Desk keeps its vault there and the operator carries it off in
 * the receipt's evidence; a laptop keeps it in the repo where it survives.
 */
export function vaultPath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DESK_VAULT_PATH) return env.DESK_VAULT_PATH;
  return env.VERCEL ? "/tmp/desk-vault.jsonl" : ".starlight/desk-vault.jsonl";
}

/** Append beliefs. Returns how many landed; zero when the vault refused the write. */
export async function appendAtoms(path: string, atoms: VaultAtom[]): Promise<number> {
  if (atoms.length === 0) return 0;
  await mkdir(dirname(path), { recursive: true }).catch(() => undefined);
  const body = atoms.map((atom) => JSON.stringify(atom)).join("\n") + "\n";
  await appendFile(path, body, "utf8");
  return atoms.length;
}

/** Read beliefs, newest last. A malformed line is skipped rather than fatal. */
export async function readAtoms(path: string, limit = 500): Promise<VaultAtom[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    return [];
  }
  const atoms: VaultAtom[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const value: unknown = JSON.parse(trimmed);
      if (isAtom(value)) atoms.push(value);
    } catch {
      // a torn line is a line to skip
    }
  }
  return atoms.slice(-limit);
}

const STOP = new Set([
  "the","a","an","and","or","of","to","in","is","are","was","were","be","been","for","on","at","by","with","that","this","it","as","from","what","which","how","why","when","do","does","did","has","have","had","not","no","yes","can","could","should","would","will","about","into","than","then","there","their","them","they","you","your","we","our","us",
]);

/** Content words, lowercased, stopwords dropped. */
export function terms(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP.has(word)),
  );
}

/** Jaccard overlap of two term sets, 0 to 1. */
export function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const term of a) if (b.has(term)) shared += 1;
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
}

/**
 * Prior beliefs close enough to the question to be worth checking against.
 * Keyword overlap rather than embeddings: it needs no model, no index, and no
 * network, so the contradiction pass still runs when the venue Wi-Fi does not.
 */
export function findRelated(atoms: VaultAtom[], question: string, max = 6, threshold = 0.08): VaultAtom[] {
  const asked = terms(question);
  return atoms
    .map((atom) => ({ atom, score: Math.max(overlap(asked, terms(atom.question)), overlap(asked, terms(atom.claim))) }))
    .filter((scored) => scored.score >= threshold)
    .sort((left, right) => right.score - left.score)
    .slice(0, max)
    .map((scored) => scored.atom);
}

function isAtom(value: unknown): value is VaultAtom {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.kind === "belief" &&
    typeof record.id === "string" &&
    typeof record.claim === "string" &&
    typeof record.question === "string"
  );
}
