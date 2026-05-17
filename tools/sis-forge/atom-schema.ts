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

export function jsonlToAtom(line: string): Atom {
  const parsed = JSON.parse(line);
  if (
    typeof parsed.id !== "string" ||
    typeof parsed.source !== "string" ||
    typeof parsed.topic !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.ts !== "string"
  ) {
    throw new Error(`Invalid atom JSONL: ${line.slice(0, 80)}`);
  }
  return parsed as Atom;
}
