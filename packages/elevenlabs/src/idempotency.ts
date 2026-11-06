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
import { createHash, randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";
import {
  ElevenLabsIntegrationError,
  canonicalJson,
  isSafeIdentifier,
  type SynthesizeSpeechResult,
} from "./contracts.js";

/**
 * Idempotency states for paid-effect safety (review blocker #2 fix).
 *
 * - `in_progress`: lock acquired, no paid provider call has been dispatched yet.
 *   A crash here is safe: nothing was charged; the lock can be released.
 * - `dispatched`: a paid provider request HAS been sent. A crash or timeout here
 *   is ambiguous — the provider may have synthesized and charged. The key is
 *   never silently re-dispatched.
 * - `ambiguous`: a failure occurred after dispatch (transport/timeout/storage).
 *   When the synthesized audio was received before a storage failure, it is
 *   cached so the retry only re-uploads (no second provider charge). When the
 *   outcome is unknown (timeout after acceptance), retrying requires an explicit
 *   operator resolution (`ambiguousResolution: "redispatch"`).
 * - `completed`: terminal success; replays return the cached result.
 */
export type IdempotencyState = "in_progress" | "dispatched" | "ambiguous" | "completed";

export interface CachedAudioPayload {
  readonly sha256: string;
  readonly mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm";
  readonly sizeBytes: number;
}

export interface DispatchDetail {
  readonly providerRequestId: string | null;
  readonly providerHistoryItemId: string | null;
  readonly attempts: number;
  readonly latencyMs: number;
  readonly reservedAt: string;
}

export interface IdempotencyRecord {
  readonly idempotencyKey: string;
  readonly requestFingerprintSha256: string;
  readonly state: IdempotencyState;
  readonly updatedAt: string;
  readonly result?: SynthesizeSpeechResult;
  readonly cachedAudio?: CachedAudioPayload;
  readonly dispatchDetail?: DispatchDetail;
  readonly ambiguousReason?: string;
}

export interface CachedAudioBytes extends CachedAudioPayload {
  readonly bytes: Uint8Array;
}

export interface ElevenLabsIdempotencyStore {
  acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
    | { status: "ambiguous"; cachedAudio?: CachedAudioBytes; dispatchDetail?: DispatchDetail; ambiguousReason?: string }
  >;
  /** Persists that a paid provider request has been dispatched for this key. */
  markDispatched(idempotencyKey: string, requestFingerprintSha256: string, detail: DispatchDetail): Promise<void>;
  /**
   * Persists an ambiguous outcome after dispatch. `cachedAudio` (when the audio
   * was received) allows a storage-only retry with no second provider charge.
   */
  markAmbiguous(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    reason: string,
    cachedAudio?: CachedAudioBytes,
    dispatchDetail?: DispatchDetail
  ): Promise<void>;
  complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void>;
  inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined>;
}

function assertFingerprintMatch(record: IdempotencyRecord, fingerprint: string, key: string): void {
  if (record.requestFingerprintSha256 !== fingerprint) {
    throw new ElevenLabsIntegrationError(
      "idempotency_conflict",
      `Idempotency key '${key}' is already bound to a different request payload fingerprint.`
    );
  }
}

/**
 * In-memory idempotency store with atomic lock semantics, payload fingerprint
 * verification, and paid-effect ambiguity tracking.
 */
export class InMemoryIdempotencyStore implements ElevenLabsIdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();
  private readonly cachedAudio = new Map<string, Uint8Array>();

  async acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
    | { status: "ambiguous"; cachedAudio?: CachedAudioBytes; dispatchDetail?: DispatchDetail; ambiguousReason?: string }
  > {
    if (!isSafeIdentifier(idempotencyKey)) {
      throw new ElevenLabsIntegrationError("input_invalid", "idempotencyKey must be a safe identifier.");
    }
    const existing = this.records.get(idempotencyKey);
    if (existing) {
      assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
      if (existing.state === "completed") {
        return {
          status: "completed",
          result: { ...existing.result!, status: "replayed" },
        };
      }
      if (existing.state === "ambiguous") {
        const bytes = this.cachedAudio.get(idempotencyKey);
        return {
          status: "ambiguous",
          ...(existing.cachedAudio && bytes
            ? { cachedAudio: { ...existing.cachedAudio, bytes } }
            : {}),
          ...(existing.dispatchDetail ? { dispatchDetail: existing.dispatchDetail } : {}),
          ...(existing.ambiguousReason ? { ambiguousReason: existing.ambiguousReason } : {}),
        };
      }
      throw new ElevenLabsIntegrationError(
        "idempotency_in_progress",
        `Synthesis request for idempotency key '${idempotencyKey}' is currently in progress.`
      );
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
        if (current && (current.state === "in_progress" || current.state === "dispatched")) {
          this.records.delete(idempotencyKey);
          this.cachedAudio.delete(idempotencyKey);
        }
      },
    };
  }

  async markDispatched(idempotencyKey: string, requestFingerprintSha256: string, detail: DispatchDetail): Promise<void> {
    const existing = this.records.get(idempotencyKey);
    if (!existing) {
      throw new ElevenLabsIntegrationError("input_invalid", `No in-progress record for '${idempotencyKey}'.`);
    }
    assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    this.records.set(idempotencyKey, {
      ...existing,
      state: "dispatched",
      updatedAt: new Date().toISOString(),
      dispatchDetail: detail,
    });
  }

  async markAmbiguous(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    reason: string,
    cachedAudio?: CachedAudioBytes,
    dispatchDetail?: DispatchDetail
  ): Promise<void> {
    const existing = this.records.get(idempotencyKey);
    if (!existing) {
      throw new ElevenLabsIntegrationError("input_invalid", `No in-progress record for '${idempotencyKey}'.`);
    }
    assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    this.records.set(idempotencyKey, {
      ...existing,
      state: "ambiguous",
      updatedAt: new Date().toISOString(),
      ambiguousReason: reason,
      ...(cachedAudio ? { cachedAudio } : {}),
      ...(dispatchDetail ?? existing.dispatchDetail ? { dispatchDetail: dispatchDetail ?? existing.dispatchDetail } : {}),
    });
    if (cachedAudio) {
      this.cachedAudio.set(idempotencyKey, new Uint8Array(cachedAudio.bytes));
    }
  }

  async complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void> {
    const existing = this.records.get(idempotencyKey);
    if (existing) {
      assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    }
    this.records.set(idempotencyKey, {
      idempotencyKey,
      requestFingerprintSha256,
      state: "completed",
      updatedAt: new Date().toISOString(),
      result,
    });
    this.cachedAudio.delete(idempotencyKey);
  }

  async inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined> {
    return this.records.get(idempotencyKey);
  }
}

const MAX_JOURNAL_BYTES = 524_288;
const MAX_CACHED_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MiB, matches the client response ceiling

/**
 * Durable filesystem idempotency journal using exclusive lockfiles (`wx` mode `0o600`),
 * fsynced atomic temp-file renames, and paid-effect ambiguity persistence.
 * Cached audio for storage-only retries is kept in a sibling binary file
 * (`<key>.audio`) so the JSON record stays within its byte ceiling.
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

  private audioCachePath(idempotencyKey: string): string {
    return join(this.directory, `${idempotencyKey}.audio`);
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

  private writeAudioCacheSync(idempotencyKey: string, bytes: Uint8Array): void {
    const target = this.audioCachePath(idempotencyKey);
    const temp = `${target}.${randomUUID()}.tmp`;
    const fd = openSync(temp, "wx", 0o600);
    try {
      writeFileSync(fd, bytes);
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

  private readAudioCacheSync(idempotencyKey: string, expected: CachedAudioPayload): Uint8Array | undefined {
    const file = this.audioCachePath(idempotencyKey);
    if (!existsSync(file)) return undefined;
    const stat = lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== expected.sizeBytes) return undefined;
    if (stat.size > MAX_CACHED_AUDIO_BYTES) return undefined;
    const bytes = new Uint8Array(readFileSync(file));
    if (createHash("sha256").update(bytes).digest("hex") !== expected.sha256) {
      unlinkSync(file);
      return undefined;
    }
    return bytes;
  }

  async acquireOrInspect(
    idempotencyKey: string,
    requestFingerprintSha256: string
  ): Promise<
    | { status: "acquired"; releaseOnFailure: () => Promise<void> }
    | { status: "completed"; result: SynthesizeSpeechResult }
    | { status: "ambiguous"; cachedAudio?: CachedAudioBytes; dispatchDetail?: DispatchDetail; ambiguousReason?: string }
  > {
    const existing = this.readRecordSync(idempotencyKey);
    if (existing) {
      assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
      if (existing.state === "completed" && existing.result) {
        return {
          status: "completed",
          result: { ...existing.result, status: "replayed" },
        };
      }
      if (existing.state === "ambiguous") {
        const cachedBytes = existing.cachedAudio
          ? this.readAudioCacheSync(idempotencyKey, existing.cachedAudio)
          : undefined;
        return {
          status: "ambiguous" as const,
          ...(existing.cachedAudio && cachedBytes
            ? { cachedAudio: { ...existing.cachedAudio, bytes: cachedBytes } }
            : {}),
          ...(existing.dispatchDetail ? { dispatchDetail: existing.dispatchDetail } : {}),
          ...(existing.ambiguousReason ? { ambiguousReason: existing.ambiguousReason } : {}),
        };
      }
      // in_progress or dispatched (crash mid-flight): fail closed.
      throw new ElevenLabsIntegrationError(
        "idempotency_in_progress",
        existing.state === "dispatched"
          ? `A paid provider request for idempotency key '${idempotencyKey}' was dispatched but never finalized (crash or timeout); the outcome may be ambiguous. Resolve before retrying.`
          : `Synthesis request for idempotency key '${idempotencyKey}' is already in progress.`
      );
    }

    const lockFile = this.lockPath(idempotencyKey);
    const ownerToken = randomUUID();
    let fd: number;
    try {
      fd = openSync(lockFile, "wx", 0o600);
    } catch {
      const raced = this.readRecordSync(idempotencyKey);
      if (raced) {
        assertFingerprintMatch(raced, requestFingerprintSha256, idempotencyKey);
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
        if (current && (current.state === "in_progress" || current.state === "dispatched")) {
          if (current.state === "dispatched") {
            // Paid request may have landed; keep the ambiguity on disk.
            this.writeRecordSync({
              ...current,
              state: "ambiguous",
              updatedAt: new Date().toISOString(),
              ambiguousReason: "released after dispatch; provider outcome unknown",
            });
            return;
          }
          unlinkSync(recordFile);
        }
        if (existsSync(lockFile) && readFileSync(lockFile, "utf8") === ownerToken) {
          unlinkSync(lockFile);
        }
      },
    };
  }

  async markDispatched(idempotencyKey: string, requestFingerprintSha256: string, detail: DispatchDetail): Promise<void> {
    const existing = this.readRecordSync(idempotencyKey);
    if (!existing) {
      throw new ElevenLabsIntegrationError("input_invalid", `No in-progress record for '${idempotencyKey}'.`);
    }
    assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    this.writeRecordSync({
      ...existing,
      state: "dispatched",
      updatedAt: new Date().toISOString(),
      dispatchDetail: detail,
    });
  }

  async markAmbiguous(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    reason: string,
    cachedAudio?: CachedAudioBytes,
    dispatchDetail?: DispatchDetail
  ): Promise<void> {
    const existing = this.readRecordSync(idempotencyKey);
    if (!existing) {
      throw new ElevenLabsIntegrationError("input_invalid", `No in-progress record for '${idempotencyKey}'.`);
    }
    assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    if (cachedAudio) {
      if (cachedAudio.bytes.byteLength > MAX_CACHED_AUDIO_BYTES) {
        throw new ElevenLabsIntegrationError("storage_failed", "Cached audio exceeds the journal audio cache ceiling.");
      }
      this.writeAudioCacheSync(idempotencyKey, cachedAudio.bytes);
    }
    this.writeRecordSync({
      ...existing,
      state: "ambiguous",
      updatedAt: new Date().toISOString(),
      ambiguousReason: reason,
      ...(cachedAudio ? { cachedAudio } : {}),
      ...(dispatchDetail ?? existing.dispatchDetail ? { dispatchDetail: dispatchDetail ?? existing.dispatchDetail } : {}),
    });
  }

  async complete(
    idempotencyKey: string,
    requestFingerprintSha256: string,
    result: SynthesizeSpeechResult
  ): Promise<void> {
    const existing = this.readRecordSync(idempotencyKey);
    if (existing) {
      assertFingerprintMatch(existing, requestFingerprintSha256, idempotencyKey);
    }
    this.writeRecordSync({
      idempotencyKey,
      requestFingerprintSha256,
      state: "completed",
      updatedAt: new Date().toISOString(),
      result,
    });
    const audioCache = this.audioCachePath(idempotencyKey);
    if (existsSync(audioCache)) {
      unlinkSync(audioCache);
    }
    const lockFile = this.lockPath(idempotencyKey);
    if (existsSync(lockFile)) {
      unlinkSync(lockFile);
    }
  }

  async inspect(idempotencyKey: string): Promise<IdempotencyRecord | undefined> {
    return this.readRecordSync(idempotencyKey);
  }
}
