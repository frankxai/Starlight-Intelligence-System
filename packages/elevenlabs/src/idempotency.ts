import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";
import {
  ElevenLabsIntegrationError,
  canonicalJson,
  isSafeIdentifier,
  type SynthesizeSpeechResult,
} from "./contracts.js";

export interface IdempotencyRecord {
  readonly idempotencyKey: string;
  readonly requestFingerprintSha256: string;
  readonly state: "in_progress" | "completed";
  readonly updatedAt: string;
  readonly result?: SynthesizeSpeechResult;
}

export interface ElevenLabsIdempotencyStore {
  acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
  >;
  complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void>;
  inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined>;
}

/**
 * In-memory idempotency store with atomic lock semantics and payload fingerprint verification.
 */
export class InMemoryIdempotencyStore implements ElevenLabsIdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  async acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
  > {
    if (!isSafeIdentifier(idempotencyKey)) {
      throw new ElevenLabsIntegrationError("input_invalid", "idempotencyKey must be a safe identifier.");
    }
    const existing = this.records.get(idempotencyKey);
    if (existing) {
      if (existing.requestFingerprintSha256 !== requestFingerprintSha256) {
        throw new ElevenLabsIntegrationError(
          "idempotency_conflict",
          `Idempotency key '${idempotencyKey}' is already bound to a different request payload fingerprint.`
        );
      }
      if (existing.state === "in_progress") {
        throw new ElevenLabsIntegrationError(
          "idempotency_in_progress",
          `Synthesis request for idempotency key '${idempotencyKey}' is currently in progress.`
        );
      }
      return {
        status: "completed",
        result: { ...existing.result!, status: "replayed" },
      };
    }

    this.records.set(idempotencyKey, {
      idempotencyKey,
      requestFingerprintSha256,
      state: "in_progress",
      updatedAt: new Date().toISOString(),
    });

    return {
      status: "acquired",
      releaseOnFailure: async () => {
        const current = this.records.get(idempotencyKey);
        if (current && current.state === "in_progress") {
          this.records.delete(idempotencyKey);
        }
      },
    };
  }

  async complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void> {
    const existing = this.records.get(idempotencyKey);
    if (existing && existing.requestFingerprintSha256 !== requestFingerprintSha256) {
      throw new ElevenLabsIntegrationError(
        "idempotency_conflict",
        `Idempotency key '${idempotencyKey}' fingerprint mismatch during completion.`
      );
    }
    this.records.set(idempotencyKey, {
      idempotencyKey,
      requestFingerprintSha256,
      state: "completed",
      updatedAt: new Date().toISOString(),
      result,
    });
  }

  async inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined> {
    return this.records.get(idempotencyKey);
  }
}

const MAX_JOURNAL_BYTES = 524_288;

/**
 * Durable filesystem idempotency journal using exclusive lockfiles (`wx` mode `0o600`)
 * and fsynced atomic temp-file renames, matching Starlight `TerminalRunJournal` invariants.
 */
export class FileSystemIdempotencyJournal implements ElevenLabsIdempotencyStore {
  readonly directory: string;

  constructor(directory: string) {
    if (!isAbsolute(directory)) {
      throw new ElevenLabsIntegrationError("input_invalid", "Idempotency journal directory must be an absolute path.");
    }
    this.directory = resolve(directory);
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    const stat = lstatSync(this.directory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new ElevenLabsIntegrationError(
        "input_invalid",
        "Idempotency journal directory must be a regular directory, not a symlink."
      );
    }
  }

  private recordPath(idempotencyKey: string): string {
    if (!isSafeIdentifier(idempotencyKey)) {
      throw new ElevenLabsIntegrationError("input_invalid", "idempotencyKey must be a safe identifier.");
    }
    return join(this.directory, `${idempotencyKey}.json`);
  }

  private lockPath(idempotencyKey: string): string {
    return `${this.recordPath(idempotencyKey)}.lock`;
  }

  private readRecordSync(idempotencyKey: string): IdempotencyRecord | undefined {
    const file = this.recordPath(idempotencyKey);
    if (!existsSync(file)) return undefined;
    const stat = lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_JOURNAL_BYTES) {
      throw new ElevenLabsIntegrationError("storage_failed", "Invalid idempotency journal file on disk.");
    }
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as IdempotencyRecord;
    if (parsed.idempotencyKey !== idempotencyKey) {
      throw new ElevenLabsIntegrationError("storage_failed", "Idempotency journal key mismatch on disk.");
    }
    return parsed;
  }

  private writeRecordSync(record: IdempotencyRecord): void {
    const target = this.recordPath(record.idempotencyKey);
    const serialized = canonicalJson(record);
    if (Buffer.byteLength(serialized) > MAX_JOURNAL_BYTES) {
      throw new ElevenLabsIntegrationError("storage_failed", "Idempotency journal record exceeds byte ceiling.");
    }
    const temp = `${target}.${randomUUID()}.tmp`;
    const fd = openSync(temp, "wx", 0o600);
    try {
      writeFileSync(fd, serialized);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    try {
      renameSync(temp, target);
    } catch (err) {
      if (existsSync(temp)) unlinkSync(temp);
      throw err;
    }
  }

  async acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
  > {
    const existing = this.readRecordSync(idempotencyKey);
    if (existing) {
      if (existing.requestFingerprintSha256 !== requestFingerprintSha256) {
        throw new ElevenLabsIntegrationError(
          "idempotency_conflict",
          `Idempotency key '${idempotencyKey}' is already bound to a different request payload fingerprint.`
        );
      }
      if (existing.state === "completed" && existing.result) {
        return {
          status: "completed",
          result: { ...existing.result, status: "replayed" },
        };
      }
      throw new ElevenLabsIntegrationError(
        "idempotency_in_progress",
        `Synthesis request for idempotency key '${idempotencyKey}' is already in progress.`
      );
    }

    const lockFile = this.lockPath(idempotencyKey);
    const ownerToken = randomUUID();
    let fd: number;
    try {
      fd = openSync(lockFile, "wx", 0o600);
    } catch {
      const raced = this.readRecordSync(idempotencyKey);
      if (raced && raced.requestFingerprintSha256 !== requestFingerprintSha256) {
        throw new ElevenLabsIntegrationError(
          "idempotency_conflict",
          `Idempotency key '${idempotencyKey}' is already bound to a different request payload fingerprint.`
        );
      }
      throw new ElevenLabsIntegrationError(
        "idempotency_in_progress",
        `Concurrent writer holds lock for idempotency key '${idempotencyKey}'.`
      );
    }

    try {
      writeFileSync(fd, ownerToken);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }

    this.writeRecordSync({
      idempotencyKey,
      requestFingerprintSha256,
      state: "in_progress",
      updatedAt: new Date().toISOString(),
    });

    return {
      status: "acquired",
      releaseOnFailure: async () => {
        const recordFile = this.recordPath(idempotencyKey);
        const current = this.readRecordSync(idempotencyKey);
        if (current && current.state === "in_progress" && existsSync(recordFile)) {
          unlinkSync(recordFile);
        }
        if (existsSync(lockFile) && readFileSync(lockFile, "utf8") === ownerToken) {
          unlinkSync(lockFile);
        }
      },
    };
  }

  async complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void> {
    const existing = this.readRecordSync(idempotencyKey);
    if (existing && existing.requestFingerprintSha256 !== requestFingerprintSha256) {
      throw new ElevenLabsIntegrationError(
        "idempotency_conflict",
        `Idempotency key '${idempotencyKey}' fingerprint mismatch during completion.`
      );
    }
    this.writeRecordSync({
      idempotencyKey,
      requestFingerprintSha256,
      state: "completed",
      updatedAt: new Date().toISOString(),
      result,
    });
    const lockFile = this.lockPath(idempotencyKey);
    if (existsSync(lockFile)) {
      unlinkSync(lockFile);
    }
  }

  async inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined> {
    return this.readRecordSync(idempotencyKey);
  }
}
