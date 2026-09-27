/**
 * The vault: what the Desk remembers, as JSON lines the customer owns.
 *
 * One line per belief, append-only. Two stores behind one interface:
 *
 *   file    a JSONL file on disk. The local, sovereign default: readable with
 *           `cat`, portable with `cp`, no database to run, nothing to migrate,
 *           and a founder can read their own memory without asking anyone.
 *   redis   the same JSON lines, one per list entry, in a Redis list reached
 *           over the Upstash REST API. The deployed path, because a serverless
 *           filesystem is per-instance and erased between invocations.
 *           `LRANGE key 0 -1` gives the lines back verbatim, so the memory is
 *           still one command away from being a file again.
 *
 * Every write is best-effort by design: a vault that cannot be written records
 * a failed stage and the run still produces its brief and its receipt. Memory
 * is worth having and worth nobody's demo.
 *
 * Built on SIP — operational tier.
 */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { memoryAccess } from "./access";
import { PublicError } from "./public-error";
import { deskKey, deskNamespace, redisCommand, redisConfigFromEnv, type RedisRestConfig } from "./redis-rest";

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

/** Where beliefs are kept. Both stores append JSON lines and read them back newest last. */
export interface VaultStore {
  readonly kind: "file" | "redis";
  /** Where the memory lives, as the receipt's evidence names it. Never a credential. */
  readonly ref: string;
  /** Returns how many landed. Throws when the store refused the write. `signal` abandons a network store's call. */
  append(atoms: VaultAtom[], signal?: AbortSignal): Promise<number>;
  /** The newest `limit` beliefs, oldest first. An empty or absent vault reads as []. */
  read(limit?: number, signal?: AbortSignal): Promise<VaultAtom[]>;
}

/** Which store this environment gets, or why it gets none. */
export type VaultSelection = { store: VaultStore; reason?: undefined } | { store: null; reason: string };

export const NO_DURABLE_VAULT = "no durable vault configured";
export const DEFAULT_READ_LIMIT = 500;

/**
 * Choose the store. A configured Redis REST backend wins. Otherwise a laptop
 * gets the file. A deployment on Vercel with no durable store gets no vault at
 * all: its filesystem would only take the write in /tmp, which is per-instance
 * and erased, and a memory that silently forgets is worse than an honest
 * "skipped" on the receipt.
 */
export function selectVault(env: NodeJS.ProcessEnv = process.env, fetchImpl?: typeof fetch): VaultSelection {
  const redis = redisConfigFromEnv(env);
  if (redis) return { store: redisVault({ ...redis, fetchImpl }, deskNamespace(env)) };
  if (env.VERCEL) return { store: null, reason: NO_DURABLE_VAULT };
  return { store: fileVault(vaultPath(env)) };
}

/**
 * The store for one run, given who is asking. An anonymous run on a deployment
 * gets no vault and the reason (see memoryAccess); nothing is read or written
 * for it. Everyone else gets what selectVault chooses.
 */
export function vaultForRun(env: NodeJS.ProcessEnv, authorized: boolean, fetchImpl?: typeof fetch): VaultSelection {
  const memory = memoryAccess(env, authorized);
  if (!memory.allowed) return { store: null, reason: memory.reason };
  return selectVault(env, fetchImpl);
}

/** Where the file vault lives on a machine the customer controls. */
export function vaultPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.DESK_VAULT_PATH || ".starlight/desk-vault.jsonl";
}

export function fileVault(path: string): VaultStore {
  return {
    kind: "file",
    ref: path,
    append: (atoms) => appendAtoms(path, atoms),
    read: (limit) => readAtoms(path, limit),
  };
}

/** One Redis list per namespace, so two Desks can share a database without sharing a memory. */
export function redisVault(config: RedisRestConfig, namespace = "default"): VaultStore {
  const key = deskKey(namespace, "vault");
  return {
    kind: "redis",
    ref: `redis:${key}`,
    async append(atoms, signal) {
      if (atoms.length === 0) return 0;
      await redisCommand(config, ["RPUSH", key, ...atoms.map((atom) => JSON.stringify(atom))], signal);
      return atoms.length;
    },
    async read(limit = DEFAULT_READ_LIMIT, signal) {
      const result = await redisCommand(config, ["LRANGE", key, -Math.max(1, Math.floor(limit)), -1], signal);
      return parseLines(Array.isArray(result) ? result.filter((line): line is string => typeof line === "string") : []);
    },
  };
}

/** Append beliefs to a file vault. Returns how many landed; zero when there was nothing to write. */
export async function appendAtoms(path: string, atoms: VaultAtom[]): Promise<number> {
  if (atoms.length === 0) return 0;
  await mkdir(dirname(path), { recursive: true }).catch(() => undefined);
  const body = atoms.map((atom) => JSON.stringify(atom)).join("\n") + "\n";
  await appendFile(path, body, "utf8");
  return atoms.length;
}

export const VAULT_UNREADABLE = "vault could not be read";

/**
 * Read a file vault's beliefs, newest last. A missing file reads as empty.
 * Any other failure (a directory, no permission, an I/O error) throws, so
 * recall records failed rather than an empty memory it did not read.
 */
export async function readAtoms(path: string, limit = DEFAULT_READ_LIMIT): Promise<VaultAtom[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code;
    if (code === "ENOENT") return [];
    // The code only: the error's own message names a server path.
    throw new PublicError(`file vault read failed (${typeof code === "string" ? code : "unknown"})`, VAULT_UNREADABLE);
  }
  return parseLines(text.split("\n")).slice(-limit);
}

/** JSON lines to beliefs. A malformed or foreign line is skipped rather than fatal. */
function parseLines(lines: string[]): VaultAtom[] {
  const atoms: VaultAtom[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const value: unknown = JSON.parse(trimmed);
      if (isAtom(value)) atoms.push(value);
    } catch {
      // a torn line is a line to skip
    }
  }
  return atoms;
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
 *
 * This is the floor. Embedding recall, when it is added, sits behind this
 * signature and degrades to exactly this path when its model is unset or
 * unreachable. It is not built yet: each embedding call is spend the receipt
 * must record and the price table must carry, and a vector per line would
 * stop the file vault being memory a person can read with `cat`.
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

/**
 * A persisted line is a belief only when every field VaultAtom declares is
 * present with its type. Callers (recall, the contradict prompt, the page)
 * read all of them, so a line missing one is skipped like a torn line.
 */
function isAtom(value: unknown): value is VaultAtom {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    record.kind === "belief" &&
    typeof record.id === "string" &&
    typeof record.question === "string" &&
    typeof record.claim === "string" &&
    typeof record.quote === "string" &&
    typeof record.url === "string" &&
    typeof record.confidence === "number" &&
    Number.isFinite(record.confidence) &&
    typeof record.receiptId === "string" &&
    typeof record.at === "string"
  );
}
