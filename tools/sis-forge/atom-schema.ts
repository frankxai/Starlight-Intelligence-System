export type AtomSource =
  | "transcripts"
  | "vault"
  | "prompts"
  | "repos"
  | "external";

export interface Atom {
  id: string;
  source: AtomSource;
  file?: string;
  line?: number;
  topic: string;
  summary: string;
  weight?: number;
  ts: string;
}

export interface Cluster {
  id: string;
  label: string;
  atoms: Atom[];
  sources: AtomSource[];
  bucket: "signature" | "framework" | "anecdote";
}

export interface BucketReport {
  mode: "auto-build" | "propose-menu" | "empower";
  clusters: Cluster[];
  totalAtoms: number;
  byBucket: { signature: number; framework: number; anecdote: number };
  snapshotPath: string;
  generatedAt: string;
}

export function atomToJsonl(atom: Atom): string {
  return JSON.stringify(atom);
}

const VALID_SOURCES: readonly AtomSource[] = [
  "transcripts",
  "vault",
  "prompts",
  "repos",
  "external",
];

export function jsonlToAtom(line: string): Atom {
  const parsed = JSON.parse(line);
  if (
    typeof parsed.id !== "string" ||
    typeof parsed.source !== "string" ||
    !VALID_SOURCES.includes(parsed.source as AtomSource) ||
    typeof parsed.topic !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.ts !== "string"
  ) {
    throw new Error(`Invalid atom JSONL: ${line.slice(0, 80)}`);
  }
  if (parsed.weight !== undefined && typeof parsed.weight !== "number") {
    throw new Error(
      `Invalid atom weight (must be number if present): ${line.slice(0, 80)}`
    );
  }
  if (parsed.file !== undefined && typeof parsed.file !== "string") {
    throw new Error(
      `Invalid atom file (must be string if present): ${line.slice(0, 80)}`
    );
  }
  if (parsed.line !== undefined && typeof parsed.line !== "number") {
    throw new Error(
      `Invalid atom line (must be number if present): ${line.slice(0, 80)}`
    );
  }
  return parsed as Atom;
}
