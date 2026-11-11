import { createHmac, randomUUID } from "node:crypto";
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
import { isAbsolute, join, resolve } from "node:path";
import {
  ElevenLabsIntegrationError,
  canonicalJson,
  sha256Hex,
  type VoiceProvenanceRecord,
} from "./contracts.js";

export interface PutAudioAssetInput {
  readonly objectKey: string;
  readonly audioBytes: Uint8Array;
  readonly mimeType: "audio/mpeg" | "audio/wav" | "audio/pcm";
  readonly sha256: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface StoredAudioAsset {
  readonly uri: string;
  readonly playbackUrl: string;
  readonly sidecarUri: string;
  readonly sha256: string;
  readonly sizeBytes: number;
}

export interface DurableAudioStorageAdapter {
  putAudioAndSidecar(
    asset: PutAudioAssetInput,
    sidecarKey: string,
    provenance: VoiceProvenanceRecord
  ): Promise<StoredAudioAsset>;
}

const SAFE_KEY_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export function validateStorageObjectKey(key: string): string {
  const normalized = key.replace(/^\/+/, "");
  const segments = normalized.split("/");
  if (
    !normalized ||
    segments.some(seg => !seg || seg === "." || seg === ".." || !SAFE_KEY_SEGMENT.test(seg))
  ) {
    throw new ElevenLabsIntegrationError(
      "storage_failed",
      `Invalid storage object key '${key}'.`
    );
  }
  return normalized;
}

/**
 * In-memory durable audio storage adapter for deterministic testing and ephemeral sandboxes.
 */
export class InMemoryAudioStorageAdapter implements DurableAudioStorageAdapter {
  private readonly publicBaseUrl: string;
  readonly audioBlobs = new Map<string, { bytes: Uint8Array; mimeType: string; sha256: string }>();
  readonly sidecars = new Map<string, string>();

  constructor(options?: { publicBaseUrl?: string }) {
    this.publicBaseUrl = (options?.publicBaseUrl ?? "https://cdn.starlightintelligence.ai").replace(/\/+$/, "");
  }

  async putAudioAndSidecar(
    asset: PutAudioAssetInput,
    sidecarKey: string,
    provenance: VoiceProvenanceRecord
  ): Promise<StoredAudioAsset> {
    const cleanAudioKey = validateStorageObjectKey(asset.objectKey);
    const cleanSidecarKey = validateStorageObjectKey(sidecarKey);
    const computedSha = sha256Hex(asset.audioBytes);
    if (computedSha !== asset.sha256) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Audio payload SHA-256 mismatch before storage write."
      );
    }

    this.audioBlobs.set(cleanAudioKey, {
      bytes: new Uint8Array(asset.audioBytes),
      mimeType: asset.mimeType,
      sha256: computedSha,
    });
    this.sidecars.set(cleanSidecarKey, canonicalJson(provenance));

    return {
      uri: `r2://starlight-voice-vault/${cleanAudioKey}`,
      playbackUrl: `${this.publicBaseUrl}/${cleanAudioKey}`,
      sidecarUri: `r2://starlight-voice-vault/${cleanSidecarKey}`,
      sha256: computedSha,
      sizeBytes: asset.audioBytes.byteLength,
    };
  }
}

/**
 * Atomic local filesystem audio storage adapter (`wx` + `fsync` + `rename`)
 * that writes both the audio binary and its `.sip.json` provenance sidecar.
 */
export class FileSystemAudioStorageAdapter implements DurableAudioStorageAdapter {
  readonly directory: string;
  private readonly publicBaseUrl: string;

  constructor(options: { directory: string; publicBaseUrl?: string }) {
    if (!isAbsolute(options.directory)) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "FileSystemAudioStorageAdapter directory must be an absolute path."
      );
    }
    this.directory = resolve(options.directory);
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    const stat = lstatSync(this.directory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "FileSystemAudioStorageAdapter directory must be a regular directory."
      );
    }
    this.publicBaseUrl = (options.publicBaseUrl ?? "https://cdn.starlightintelligence.ai/local").replace(
      /\/+$/,
      ""
    );
  }

  private writeAtomicFile(relativeKey: string, bytes: Uint8Array | string): string {
    const cleanKey = validateStorageObjectKey(relativeKey);
    const fullPath = join(this.directory, cleanKey);
    const parentDir = resolve(fullPath, "..");
    mkdirSync(parentDir, { recursive: true, mode: 0o700 });
    const tempPath = `${fullPath}.${randomUUID()}.tmp`;
    const fd = openSync(tempPath, "wx", 0o600);
    try {
      writeFileSync(fd, bytes);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    try {
      renameSync(tempPath, fullPath);
    } catch (err) {
      if (existsSync(tempPath)) unlinkSync(tempPath);
      throw err;
    }
    return fullPath;
  }

  async putAudioAndSidecar(
    asset: PutAudioAssetInput,
    sidecarKey: string,
    provenance: VoiceProvenanceRecord
  ): Promise<StoredAudioAsset> {
    const cleanAudioKey = validateStorageObjectKey(asset.objectKey);
    const cleanSidecarKey = validateStorageObjectKey(sidecarKey);
    const computedSha = sha256Hex(asset.audioBytes);
    if (computedSha !== asset.sha256) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Audio payload SHA-256 mismatch before filesystem write."
      );
    }

    const audioFilePath = this.writeAtomicFile(cleanAudioKey, asset.audioBytes);
    const sidecarFilePath = this.writeAtomicFile(cleanSidecarKey, canonicalJson(provenance));

    // Read-back verification of written audio digest
    const verifiedSha = sha256Hex(readFileSync(audioFilePath));
    if (verifiedSha !== computedSha) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Filesystem read-back integrity check failed after audio write."
      );
    }

    return {
      uri: `file://${audioFilePath}`,
      playbackUrl: `${this.publicBaseUrl}/${cleanAudioKey}`,
      sidecarUri: `file://${sidecarFilePath}`,
      sha256: computedSha,
      sizeBytes: asset.audioBytes.byteLength,
    };
  }
}

export interface CloudflareR2StorageOptions {
  /** Cloudflare account ID or explicit S3/R2 endpoint URL. */
  readonly accountId?: string;
  readonly endpoint?: string;
  readonly bucket: string;
  readonly accessKeyId?: string | (() => string | Promise<string>);
  readonly secretAccessKey?: string | (() => string | Promise<string>);
  readonly region?: string;
  /** Public CDN / R2 custom domain base URL, or omitted to generate presigned GET URLs. */
  readonly publicBaseUrl?: string;
  /** Presigned GET URL expiration in seconds when publicBaseUrl is not set (default: 3600). */
  readonly presignExpiresSeconds?: number;
  readonly allowLoopbackHttp?: boolean;
  readonly fetchImplementation?: typeof fetch;
}

function hmacSha256(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function hmacSha256Hex(key: string | Buffer, data: string): string {
  return createHmac("sha256", key).update(data, "utf8").digest("hex");
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeUriPath(path: string): string {
  return path
    .split("/")
    .map(segment => encodeRfc3986(segment))
    .join("/");
}

function toAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function deriveSigningKey(secretAccessKey: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

/**
 * Zero-dependency Cloudflare R2 / S3-compatible storage adapter using AWS Signature V4 (`node:crypto`).
 * Uploads both the synthesized audio binary and its `.sip.json` provenance sidecar,
 * and returns either a configured CDN URL or a cryptographically presigned GET URL.
 */
export class CloudflareR2StorageAdapter implements DurableAudioStorageAdapter {
  private readonly endpointUrl: URL;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl: string | undefined;
  private readonly presignExpiresSeconds: number;
  private readonly resolveAccessKeyId: () => string | Promise<string>;
  private readonly resolveSecretAccessKey: () => string | Promise<string>;
  private readonly fetchFn: typeof fetch;

  constructor(options: CloudflareR2StorageOptions) {
    if (!options.bucket || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(options.bucket)) {
      throw new ElevenLabsIntegrationError("input_invalid", "Cloudflare R2 bucket name is invalid.");
    }
    this.bucket = options.bucket;
    this.region = options.region ?? "auto";
    this.presignExpiresSeconds = options.presignExpiresSeconds ?? 3600;
    this.publicBaseUrl = options.publicBaseUrl ? options.publicBaseUrl.replace(/\/+$/, "") : undefined;
    this.fetchFn = options.fetchImplementation ?? globalThis.fetch;

    const rawEndpoint =
      options.endpoint ??
      (options.accountId
        ? `https://${options.accountId}.r2.cloudflarestorage.com`
        : process.env.R2_ENDPOINT ??
          (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : ""));

    if (!rawEndpoint) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Cloudflare R2 endpoint or accountId is required."
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(rawEndpoint);
    } catch {
      throw new ElevenLabsIntegrationError("endpoint_insecure", "Invalid Cloudflare R2 endpoint URL.");
    }
    const isLoopback =
      parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || parsed.hostname === "::1";
    if (
      parsed.protocol !== "https:" &&
      !(options.allowLoopbackHttp && parsed.protocol === "http:" && isLoopback)
    ) {
      throw new ElevenLabsIntegrationError("endpoint_insecure", "Cloudflare R2 endpoint must use HTTPS.");
    }
    this.endpointUrl = parsed;

    const ak = options.accessKeyId;
    this.resolveAccessKeyId =
      typeof ak === "function"
        ? ak
        : typeof ak === "string"
        ? () => ak
        : () => process.env.R2_ACCESS_KEY_ID ?? "";

    const sk = options.secretAccessKey;
    this.resolveSecretAccessKey =
      typeof sk === "function"
        ? sk
        : typeof sk === "string"
        ? () => sk
        : () => process.env.R2_SECRET_ACCESS_KEY ?? "";
  }

  private async getCredentials(): Promise<{ accessKeyId: string; secretAccessKey: string }> {
    const accessKeyId = (await this.resolveAccessKeyId()).trim();
    const secretAccessKey = (await this.resolveSecretAccessKey()).trim();
    if (!accessKeyId || !secretAccessKey) {
      throw new ElevenLabsIntegrationError(
        "credential_missing",
        "Cloudflare R2 credentials (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY) are not configured."
      );
    }
    return { accessKeyId, secretAccessKey };
  }

  private async putSignedObject(params: {
    objectKey: string;
    body: Uint8Array;
    contentType: string;
    payloadSha256: string;
    metadata?: Readonly<Record<string, string>>;
    now?: Date;
  }): Promise<void> {
    const { accessKeyId, secretAccessKey } = await this.getCredentials();
    const cleanKey = validateStorageObjectKey(params.objectKey);
    const now = params.now ?? new Date();
    const { amzDate, dateStamp } = toAmzDate(now);

    const canonicalUri = encodeUriPath(`/${this.bucket}/${cleanKey}`);
    const targetUrl = new URL(canonicalUri, this.endpointUrl);

    const headers: Record<string, string> = {
      host: targetUrl.host,
      "content-type": params.contentType,
      "content-length": String(params.body.byteLength),
      "x-amz-content-sha256": params.payloadSha256,
      "x-amz-date": amzDate,
    };

    if (params.metadata) {
      for (const [k, v] of Object.entries(params.metadata)) {
        const cleanMetaKey = k.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        headers[`x-amz-meta-${cleanMetaKey}`] = v.replace(/[\r\n]/g, " ").trim();
      }
    }

    const sortedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedHeaderKeys.map(k => `${k}:${headers[k]}\n`).join("");
    const signedHeaders = sortedHeaderKeys.join(";");

    const canonicalRequest = [
      "PUT",
      canonicalUri,
      "",
      canonicalHeaders,
      signedHeaders,
      params.payloadSha256,
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = deriveSigningKey(secretAccessKey, dateStamp, this.region, "s3");
    const signature = hmacSha256Hex(signingKey, stringToSign);
    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const requestHeaders: Record<string, string> = {
      ...headers,
      authorization,
    };
    delete requestHeaders.host;

    let response: Response;
    try {
      response = await this.fetchFn(targetUrl.toString(), {
        method: "PUT",
        redirect: "error",
        credentials: "omit",
        headers: requestHeaders,
        body: Buffer.from(params.body),
      });
    } catch {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        `Cloudflare R2 transport error while uploading '${cleanKey}'.`,
        { retryable: true }
      );
    }

    await response.body?.cancel().catch(() => {});
    if (!response.ok) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        `Cloudflare R2 rejected PUT for '${cleanKey}' with HTTP ${response.status}.`,
        { retryable: response.status >= 500, statusCode: response.status }
      );
    }
  }

  async createPresignedGetUrl(objectKey: string, now = new Date()): Promise<string> {
    const { accessKeyId, secretAccessKey } = await this.getCredentials();
    const cleanKey = validateStorageObjectKey(objectKey);
    const { amzDate, dateStamp } = toAmzDate(now);
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const canonicalUri = encodeUriPath(`/${this.bucket}/${cleanKey}`);
    const targetUrl = new URL(canonicalUri, this.endpointUrl);

    const queryParams: Record<string, string> = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(this.presignExpiresSeconds),
      "X-Amz-SignedHeaders": "host",
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map(k => `${encodeRfc3986(k)}=${encodeRfc3986(queryParams[k]!)}`)
      .join("&");

    const canonicalRequest = [
      "GET",
      canonicalUri,
      canonicalQueryString,
      `host:${targetUrl.host}\n`,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = deriveSigningKey(secretAccessKey, dateStamp, this.region, "s3");
    const signature = hmacSha256Hex(signingKey, stringToSign);

    return `${targetUrl.origin}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
  }

  async putAudioAndSidecar(
    asset: PutAudioAssetInput,
    sidecarKey: string,
    provenance: VoiceProvenanceRecord
  ): Promise<StoredAudioAsset> {
    const cleanAudioKey = validateStorageObjectKey(asset.objectKey);
    const cleanSidecarKey = validateStorageObjectKey(sidecarKey);
    const computedSha = sha256Hex(asset.audioBytes);
    if (computedSha !== asset.sha256) {
      throw new ElevenLabsIntegrationError(
        "storage_failed",
        "Audio payload SHA-256 mismatch before Cloudflare R2 upload."
      );
    }

    await this.putSignedObject({
      objectKey: cleanAudioKey,
      body: asset.audioBytes,
      contentType: asset.mimeType,
      payloadSha256: computedSha,
      metadata: {
        "starlight-run-id": provenance.runId,
        "starlight-provenance-sha256": provenance.provenanceSha256,
        ...(asset.metadata ?? {}),
      },
    });

    const sidecarBytes = new Uint8Array(Buffer.from(canonicalJson(provenance), "utf8"));
    const sidecarSha = sha256Hex(sidecarBytes);
    await this.putSignedObject({
      objectKey: cleanSidecarKey,
      body: sidecarBytes,
      contentType: "application/json",
      payloadSha256: sidecarSha,
      metadata: {
        "starlight-audio-sha256": computedSha,
      },
    });

    const playbackUrl = this.publicBaseUrl
      ? `${this.publicBaseUrl}/${cleanAudioKey}`
      : await this.createPresignedGetUrl(cleanAudioKey);

    return {
      uri: `r2://${this.bucket}/${cleanAudioKey}`,
      playbackUrl,
      sidecarUri: `r2://${this.bucket}/${cleanSidecarKey}`,
      sha256: computedSha,
      sizeBytes: asset.audioBytes.byteLength,
    };
  }
}
