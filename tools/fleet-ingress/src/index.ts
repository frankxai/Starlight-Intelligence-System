/**
 * Starlight Fleet Ingress Router — Cloudflare Worker (2026 Architecture)
 *
 * Receives GitHub webhooks across Frank's multi-brand estate (~80+ repos),
 * enforces bounded request payloads, verifies HMAC-SHA256 signatures,
 * deduplicates deliveries via SQLite-backed Durable Objects (`WebhookDeduplicator`),
 * buffers or dispatches scale-to-zero Google Cloud Run Jobs runners (direct or Cloudflare Queues),
 * records HMAC-signed runner completion receipts (`/v1/runner/callback`),
 * and exposes read-only authenticated Streamable HTTP MCP diagnostics (`POST /mcp`).
 *
 * Latency budget: <15ms edge routing, $0.00 idle cost.
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

export const MAX_WEBHOOK_BYTES = 1_048_576; // 1 MiB ceiling on webhook payloads
export const MAX_CALLBACK_BYTES = 65_536; // 64 KiB ceiling on runner receipts
export const DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24h idempotency window
export const CALLBACK_SKEW_SECONDS = 60;

export interface DurableObjectIdLike {
  toString(): string;
}

export interface DurableObjectStubLike {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface DurableObjectNamespaceLike {
  idFromName(name: string): DurableObjectIdLike;
  get(id: DurableObjectIdLike): DurableObjectStubLike;
}

export interface SqlStorageCursorLike<T = Record<string, unknown>> {
  toArray(): T[];
}

export interface SqlStorageLike {
  exec<T = Record<string, unknown>>(query: string, ...bindings: unknown[]): SqlStorageCursorLike<T>;
}

export interface DurableObjectStateLike {
  storage?: {
    sql?: SqlStorageLike;
  };
}

export interface QueueBindingLike<T = FleetDispatchMessage> {
  send(message: T): Promise<void>;
}

export interface QueueMessageLike<T = FleetDispatchMessage> {
  readonly id: string;
  readonly body: T;
  readonly attempts?: number;
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

export interface MessageBatchLike<T = FleetDispatchMessage> {
  readonly queue: string;
  readonly messages: ReadonlyArray<QueueMessageLike<T>>;
}

export interface Env {
  GITHUB_WEBHOOK_SECRET?: string;
  GCP_PROJECT_ID?: string;
  GCP_REGION?: string;
  CLOUD_RUN_JOB?: string;
  GCP_SERVICE_ACCOUNT_TOKEN?: string;
  INGRESS_AUTH_BEARER?: string;
  RUNNER_CALLBACK_SECRET?: string;
  DISPATCH_MODE?: 'direct' | 'queue';
  DEDUPLICATOR?: DurableObjectNamespaceLike;
  FLEET_DISPATCH_QUEUE?: QueueBindingLike<FleetDispatchMessage>;
}

export interface WebhookEventMeta {
  event: string;
  action?: string;
  repo: string;
  ref?: string;
  sha?: string;
  prNumber?: number;
  sender: string;
  installationId?: number;
}

export interface FleetDispatchMessage {
  deliveryId: string;
  meta: WebhookEventMeta;
  callbackUrl: string;
  enqueuedAt: string;
}

export interface DeliveryRecord {
  deliveryId: string;
  eventType: string;
  repo: string | null;
  status: string;
  detail: string | null;
  firstSeenMs: number;
  updatedMs: number;
  expiresAtMs: number;
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function hasRunnerCredentials(env: Env): boolean {
  return [env.GCP_PROJECT_ID, env.GCP_REGION, env.CLOUD_RUN_JOB, env.GCP_SERVICE_ACCOUNT_TOKEN].every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

/**
 * Constant-time string comparison using Web Crypto HMAC-SHA256 digests so
 * neither string length nor prefix timing leaks across the network boundary.
 */
export async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const ephemeralKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('starlight-constant-time-compare-v1'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const [ macA, macB ] = await Promise.all([
    crypto.subtle.sign('HMAC', ephemeralKey, encoder.encode(a)),
    crypto.subtle.sign('HMAC', ephemeralKey, encoder.encode(b)),
  ]);
  const bytesA = new Uint8Array(macA);
  const bytesB = new Uint8Array(macB);
  let diff = bytesA.length ^ bytesB.length;
  for (let i = 0; i < bytesA.length; i += 1) {
    diff |= bytesA[i] ^ (bytesB[i] ?? 0);
  }
  return diff === 0;
}

/**
 * Stream-read request text up to `maxBytes` UTF-8 bytes so oversized bodies
 * without an honest Content-Length header cannot exhaust isolate memory.
 */
export async function readBoundedText(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; text: string } | { ok: false; status: 413 }> {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const declared = Number(contentLengthHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return { ok: false, status: 413 };
    }
  }

  if (!request.body) {
    return { ok: true, text: '' };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder().decode(merged) };
}

/**
 * Verify GitHub HMAC-SHA256 signature using standard Web Crypto API.
 */
export async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !/^sha256=[0-9a-f]{64}$/i.test(signatureHeader)) {
    return false;
  }
  const signatureHex = signatureHeader.slice(7);
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const sigBytes = new Uint8Array(
    signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
  );
  const dataBytes = encoder.encode(rawBody);

  return crypto.subtle.verify('HMAC', cryptoKey, sigBytes, dataBytes);
}

/**
 * Verify runner completion callback HMAC-SHA256 (`v1=<hex>` or `sha256=<hex>`)
 * over `${timestamp}.${rawBody}` with strict replay-window skew protection.
 */
export async function verifyCallbackSignature(
  rawBody: string,
  timestampHeader: string | null,
  signatureHeader: string | null,
  secret: string,
  nowMs: number = Date.now(),
  toleranceSeconds: number = CALLBACK_SKEW_SECONDS,
): Promise<{ valid: boolean; reason?: string }> {
  if (!timestampHeader || !/^\d{9,12}$/.test(timestampHeader.trim())) {
    return { valid: false, reason: 'invalid_timestamp' };
  }
  const tsSeconds = Number(timestampHeader.trim());
  const ageSeconds = Math.abs(nowMs / 1000 - tsSeconds);
  if (!Number.isFinite(ageSeconds) || ageSeconds > toleranceSeconds) {
    return { valid: false, reason: 'stale_timestamp' };
  }

  if (!signatureHeader || !/^(?:v1|sha256)=[0-9a-f]{64}$/i.test(signatureHeader.trim())) {
    return { valid: false, reason: 'invalid_signature_format' };
  }

  const normalizedSig = `sha256=${signatureHeader.trim().split('=')[1]}`;
  const signedPayload = `${tsSeconds}.${rawBody}`;
  const ok = await verifySignature(signedPayload, normalizedSig, secret);
  return ok ? { valid: true } : { valid: false, reason: 'invalid_signature' };
}

/**
 * Extract normalized metadata from a GitHub webhook event payload.
 */
export function extractEventMetadata(
  eventType: string,
  payload: Record<string, any>,
): WebhookEventMeta | null {
  const repo = payload.repository?.full_name;
  if (!repo) return null;

  const sender = payload.sender?.login || 'unknown';
  const installationId = payload.installation?.id;

  let sha: string | undefined;
  let prNumber: number | undefined;
  let ref: string | undefined;
  const action = payload.action;

  if (eventType === 'pull_request') {
    prNumber = payload.pull_request?.number;
    sha = payload.pull_request?.head?.sha;
    ref = payload.pull_request?.head?.ref;
  } else if (eventType === 'push') {
    sha = payload.after;
    ref = payload.ref;
  } else if (eventType === 'workflow_job') {
    sha = payload.workflow_job?.head_sha;
    ref = payload.workflow_job?.head_branch;
  } else if (eventType === 'check_run') {
    sha = payload.check_run?.head_sha;
  }

  return {
    event: eventType,
    action,
    repo,
    ref,
    sha,
    prNumber,
    sender,
    installationId,
  };
}

/**
 * Determine if an event should spin up a scale-to-zero Cloud Run runner instance.
 */
export function shouldDispatchRunner(meta: WebhookEventMeta): boolean {
  if (meta.event === 'pull_request') {
    return ['opened', 'synchronize', 'reopened'].includes(meta.action || '');
  }
  if (meta.event === 'push') {
    return meta.ref === 'refs/heads/main' || meta.ref?.startsWith('refs/tags/v') === true;
  }
  if (meta.event === 'workflow_job' && meta.action === 'queued') {
    return true;
  }
  return false;
}

/**
 * Build the Cloud Run Job `run` API body with environment variable overrides.
 */
export function buildCloudRunExecutionPayload(
  meta: WebhookEventMeta,
  callbackUrl?: string,
  deliveryId?: string,
): Record<string, any> {
  const envOverrides: Array<{ name: string; value: string }> = [
    { name: 'REPO', value: meta.repo },
    { name: 'TRIGGER_EVENT', value: meta.event },
  ];

  if (meta.sha) envOverrides.push({ name: 'COMMIT_SHA', value: meta.sha });
  if (meta.prNumber) envOverrides.push({ name: 'PR_NUMBER', value: String(meta.prNumber) });
  if (meta.ref) envOverrides.push({ name: 'GIT_REF', value: meta.ref });
  if (callbackUrl) envOverrides.push({ name: 'CALLBACK_URL', value: callbackUrl });
  if (deliveryId) envOverrides.push({ name: 'DELIVERY_ID', value: deliveryId });

  return {
    overrides: {
      containerOverrides: [
        {
          env: envOverrides,
        },
      ],
    },
  };
}

/**
 * SQLite-backed Durable Object (`new_sqlite_classes = ["WebhookDeduplicator"]`)
 * providing single-threaded idempotency for GitHub `x-github-delivery` IDs and
 * runner callback receipts. Automatically falls back to an in-memory map when
 * instantiated in local Node unit tests without `state.storage.sql`.
 */
export class WebhookDeduplicator {
  private readonly sql: SqlStorageLike | null;
  private readonly memory: Map<string, DeliveryRecord>;
  private schemaReady: boolean;

  constructor(state?: DurableObjectStateLike) {
    this.sql = state?.storage?.sql ?? null;
    this.memory = new Map();
    this.schemaReady = false;
  }

  private ensureSchema(): void {
    if (!this.sql || this.schemaReady) return;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        delivery_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        repo TEXT,
        status TEXT NOT NULL,
        detail TEXT,
        first_seen_ms INTEGER NOT NULL,
        updated_ms INTEGER NOT NULL,
        expires_at_ms INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_expires
        ON webhook_deliveries(expires_at_ms);
    `);
    this.schemaReady = true;
  }

  private pruneExpired(nowMs: number): void {
    if (this.sql) {
      this.ensureSchema();
      this.sql.exec('DELETE FROM webhook_deliveries WHERE expires_at_ms <= ?', nowMs);
      return;
    }
    for (const [id, rec] of this.memory.entries()) {
      if (rec.expiresAtMs <= nowMs) this.memory.delete(id);
    }
  }

  private getRecord(deliveryId: string, nowMs: number): DeliveryRecord | null {
    this.pruneExpired(nowMs);
    if (this.sql) {
      const rows = this.sql
        .exec<Record<string, unknown>>(
          `SELECT delivery_id, event_type, repo, status, detail, first_seen_ms, updated_ms, expires_at_ms
             FROM webhook_deliveries
            WHERE delivery_id = ?`,
          deliveryId,
        )
        .toArray();
      const row = rows[0];
      if (!row) return null;
      return {
        deliveryId: String(row.delivery_id),
        eventType: String(row.event_type),
        repo: row.repo == null ? null : String(row.repo),
        status: String(row.status),
        detail: row.detail == null ? null : String(row.detail),
        firstSeenMs: Number(row.first_seen_ms),
        updatedMs: Number(row.updated_ms),
        expiresAtMs: Number(row.expires_at_ms),
      };
    }
    return this.memory.get(deliveryId) ?? null;
  }

  private putRecord(record: DeliveryRecord): void {
    if (this.sql) {
      this.ensureSchema();
      this.sql.exec(
        `INSERT INTO webhook_deliveries
           (delivery_id, event_type, repo, status, detail, first_seen_ms, updated_ms, expires_at_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(delivery_id) DO UPDATE SET
           event_type = excluded.event_type,
           repo = COALESCE(excluded.repo, webhook_deliveries.repo),
           status = excluded.status,
           detail = excluded.detail,
           updated_ms = excluded.updated_ms,
           expires_at_ms = excluded.expires_at_ms`,
        record.deliveryId,
        record.eventType,
        record.repo,
        record.status,
        record.detail,
        record.firstSeenMs,
        record.updatedMs,
        record.expiresAtMs,
      );
      return;
    }
    this.memory.set(record.deliveryId, record);
  }

  private deleteRecord(deliveryId: string): void {
    if (this.sql) {
      this.ensureSchema();
      this.sql.exec('DELETE FROM webhook_deliveries WHERE delivery_id = ?', deliveryId);
      return;
    }
    this.memory.delete(deliveryId);
  }

  private getStats(nowMs: number): { activeDeliveries: number; byStatus: Record<string, number>; backend: 'sqlite' | 'memory' } {
    this.pruneExpired(nowMs);
    const byStatus: Record<string, number> = {};
    let total = 0;

    if (this.sql) {
      const rows = this.sql
        .exec<Record<string, unknown>>(
          'SELECT status, COUNT(*) AS count FROM webhook_deliveries GROUP BY status',
        )
        .toArray();
      for (const row of rows) {
        const st = String(row.status);
        const count = Number(row.count);
        byStatus[st] = count;
        total += count;
      }
      return { activeDeliveries: total, byStatus, backend: 'sqlite' };
    }

    for (const rec of this.memory.values()) {
      byStatus[rec.status] = (byStatus[rec.status] ?? 0) + 1;
      total += 1;
    }
    return { activeDeliveries: total, byStatus, backend: 'memory' };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const nowMs = Date.now();

    if (request.method === 'GET' && url.pathname === '/stats') {
      return jsonResponse({ ok: true, ...this.getStats(nowMs) });
    }

    if (request.method === 'GET' && url.pathname === '/receipt') {
      const id = url.searchParams.get('id')?.trim() || '';
      if (!id) return jsonResponse({ error: 'missing_id' }, 400);
      const record = this.getRecord(id, nowMs);
      if (!record) return jsonResponse({ found: false, deliveryId: id }, 404);
      return jsonResponse({ found: true, receipt: record });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'method_not_allowed' }, 405);
    }

    const body = (await request.json().catch(() => null)) as Record<string, any> | null;
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'malformed_json' }, 400);
    }

    const deliveryId = typeof body.deliveryId === 'string' ? body.deliveryId.trim() : '';
    if (!deliveryId) {
      return jsonResponse({ error: 'missing_delivery_id' }, 400);
    }

    const ttlMs = typeof body.ttlMs === 'number' && body.ttlMs > 0 ? body.ttlMs : DEDUP_TTL_MS;

    if (url.pathname === '/claim') {
      const existing = this.getRecord(deliveryId, nowMs);
      if (existing) {
        return jsonResponse({
          claimed: false,
          duplicate: true,
          status: existing.status,
          firstSeenMs: existing.firstSeenMs,
        });
      }
      this.putRecord({
        deliveryId,
        eventType: typeof body.eventType === 'string' ? body.eventType : 'unknown',
        repo: typeof body.repo === 'string' ? body.repo : null,
        status: 'in_flight',
        detail: null,
        firstSeenMs: nowMs,
        updatedMs: nowMs,
        expiresAtMs: nowMs + ttlMs,
      });
      return jsonResponse({ claimed: true, duplicate: false });
    }

    if (url.pathname === '/release') {
      this.deleteRecord(deliveryId);
      return jsonResponse({ released: true });
    }

    if (url.pathname === '/complete' || url.pathname === '/callback') {
      const existing = this.getRecord(deliveryId, nowMs);
      this.putRecord({
        deliveryId,
        eventType:
          typeof body.eventType === 'string'
            ? body.eventType
            : existing?.eventType ?? 'runner_callback',
        repo: typeof body.repo === 'string' ? body.repo : existing?.repo ?? null,
        status: typeof body.status === 'string' ? body.status : 'dispatched',
        detail: typeof body.detail === 'string' ? body.detail : existing?.detail ?? null,
        firstSeenMs: existing?.firstSeenMs ?? nowMs,
        updatedMs: nowMs,
        expiresAtMs: nowMs + ttlMs,
      });
      return jsonResponse({ ok: true, recorded: true });
    }

    return jsonResponse({ error: 'not_found' }, 404);
  }
}

function getDeduplicatorStub(env: Env): DurableObjectStubLike | null {
  if (!env.DEDUPLICATOR) return null;
  const id = env.DEDUPLICATOR.idFromName('estate-primary');
  return env.DEDUPLICATOR.get(id);
}

async function dispatchToCloudRun(
  meta: WebhookEventMeta,
  callbackUrl: string,
  env: Env,
  deliveryId?: string,
): Promise<{ ok: true; status: number; body: unknown } | { ok: false; status: 502 | 503; error: string }> {
  if (!hasRunnerCredentials(env)) {
    return { ok: false, status: 503, error: 'runner_unavailable' };
  }

  const execPayload = buildCloudRunExecutionPayload(meta, callbackUrl, deliveryId);
  const gcpEndpoint = `https://run.googleapis.com/v2/projects/${env.GCP_PROJECT_ID}/locations/${env.GCP_REGION}/jobs/${env.CLOUD_RUN_JOB}:run`;

  try {
    const gcpRes = await fetch(gcpEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GCP_SERVICE_ACCOUNT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(execPayload),
    });

    if (!gcpRes.ok) {
      return { ok: false, status: 502, error: 'runner_dispatch_failed' };
    }

    return {
      ok: true,
      status: gcpRes.status,
      body: await gcpRes.json().catch(() => ({})),
    };
  } catch {
    return { ok: false, status: 502, error: 'runner_dispatch_failed' };
  }
}

async function handleRunnerCallback(request: Request, env: Env): Promise<Response> {
  if (!env.RUNNER_CALLBACK_SECRET?.trim()) {
    return jsonResponse({ error: 'callback_unavailable' }, 503);
  }

  const bounded = await readBoundedText(request, MAX_CALLBACK_BYTES);
  if (!bounded.ok) {
    return jsonResponse({ error: 'payload_too_large' }, 413);
  }

  const verification = await verifyCallbackSignature(
    bounded.text,
    request.headers.get('x-starlight-timestamp'),
    request.headers.get('x-starlight-signature'),
    env.RUNNER_CALLBACK_SECRET,
  );
  if (!verification.valid) {
    return jsonResponse({ error: verification.reason || 'invalid_signature' }, 401);
  }

  let payload: Record<string, any> | null = null;
  try {
    payload = JSON.parse(bounded.text);
  } catch {
    return jsonResponse({ error: 'malformed_json' }, 400);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse({ error: 'malformed_json' }, 400);
  }

  const receiptId =
    (typeof payload.deliveryId === 'string' && payload.deliveryId.trim()) ||
    (typeof payload.runId === 'string' && payload.runId.trim()) ||
    '';
  const status = typeof payload.status === 'string' ? payload.status.trim() : '';

  if (!receiptId || !['succeeded', 'failed', 'cancelled', 'running'].includes(status)) {
    return jsonResponse({ error: 'invalid_callback_payload' }, 400);
  }

  const stub = getDeduplicatorStub(env);
  if (stub) {
    await stub.fetch('https://dedup.internal/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryId: receiptId,
        repo: typeof payload.repo === 'string' ? payload.repo : undefined,
        status: `runner_${status}`,
        detail: JSON.stringify({
          exitCode: typeof payload.exitCode === 'number' ? payload.exitCode : null,
          commitSha: typeof payload.commitSha === 'string' ? payload.commitSha : null,
          durationMs: typeof payload.durationMs === 'number' ? payload.durationMs : null,
        }),
      }),
    });
  }

  return jsonResponse({
    ok: true,
    recorded: Boolean(stub),
    receiptId,
    status,
  });
}

async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  const expectedBearer = env.INGRESS_AUTH_BEARER?.trim() || '';
  if (!expectedBearer) {
    return jsonResponse({ error: 'mcp_unavailable' }, 503);
  }

  const authHeader = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader.trim());
  if (!match || !(await timingSafeEqualStrings(match[1], expectedBearer))) {
    return jsonResponse(
      { error: 'unauthorized' },
      401,
      { 'WWW-Authenticate': 'Bearer realm="starlight-fleet-ingress"' },
    );
  }

  const bounded = await readBoundedText(request, MAX_CALLBACK_BYTES);
  if (!bounded.ok) {
    return jsonResponse({ error: 'payload_too_large' }, 413);
  }

  let rpc: Record<string, any> | null = null;
  try {
    rpc = JSON.parse(bounded.text);
  } catch {
    return jsonResponse(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      400,
    );
  }

  if (!rpc || typeof rpc !== 'object' || rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string') {
    return jsonResponse(
      { jsonrpc: '2.0', id: rpc?.id ?? null, error: { code: -32600, message: 'Invalid Request' } },
      400,
    );
  }

  const id = rpc.id ?? null;

  if (rpc.method === 'notifications/initialized') {
    return new Response(null, { status: 202 });
  }

  if (rpc.method === 'ping') {
    return jsonResponse({ jsonrpc: '2.0', id, result: {} });
  }

  if (rpc.method === 'initialize') {
    return jsonResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'starlight-fleet-ingress-mcp',
          version: '1.1.0',
        },
      },
    });
  }

  if (rpc.method === 'tools/list') {
    return jsonResponse({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'fleet_ingress_status',
            description:
              'Read-only diagnostics for Starlight Fleet Ingress: dispatch mode, runner readiness, and SQLite Durable Object deduplication counters.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
          },
          {
            name: 'fleet_delivery_receipt',
            description:
              'Inspect the deduplication and runner callback receipt for a GitHub x-github-delivery ID or runner runId.',
            inputSchema: {
              type: 'object',
              properties: {
                deliveryId: {
                  type: 'string',
                  description: 'GitHub x-github-delivery UUID or Cloud Run callback runId.',
                },
              },
              required: ['deliveryId'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
          },
        ],
      },
    });
  }

  if (rpc.method === 'tools/call') {
    const toolName = rpc.params?.name;
    const args = (rpc.params?.arguments ?? {}) as Record<string, unknown>;
    const stub = getDeduplicatorStub(env);

    if (toolName === 'fleet_ingress_status') {
      let dedupStats: unknown = { available: false };
      if (stub) {
        const res = await stub.fetch('https://dedup.internal/stats');
        dedupStats = await res.json().catch(() => ({ available: false }));
      }
      const statusPayload = {
        substrate: 'starlight-fleet-ingress',
        protocol: 'SIP-1.1.1',
        dispatchMode: env.FLEET_DISPATCH_QUEUE && env.DISPATCH_MODE !== 'direct' ? 'queue' : 'direct',
        webhookSecretConfigured: Boolean(env.GITHUB_WEBHOOK_SECRET?.trim()),
        runnerCredentialsConfigured: hasRunnerCredentials(env),
        callbackSecretConfigured: Boolean(env.RUNNER_CALLBACK_SECRET?.trim()),
        deduplicator: dedupStats,
      };
      return jsonResponse({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(statusPayload, null, 2) }],
          structuredContent: statusPayload,
        },
      });
    }

    if (toolName === 'fleet_delivery_receipt') {
      const deliveryId = typeof args.deliveryId === 'string' ? args.deliveryId.trim() : '';
      if (!deliveryId) {
        return jsonResponse({
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: 'deliveryId is required' }],
          },
        });
      }
      if (!stub) {
        return jsonResponse({
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: 'DEDUPLICATOR Durable Object binding is not configured' }],
          },
        });
      }
      const res = await stub.fetch(
        `https://dedup.internal/receipt?id=${encodeURIComponent(deliveryId)}`,
      );
      const data = await res.json().catch(() => ({ found: false }));
      return jsonResponse({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          structuredContent: data,
        },
      });
    }

    return jsonResponse({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown tool: ${String(toolName)}` },
    });
  }

  return jsonResponse({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${rpc.method}` },
  });
}

export async function handleRequest(request: Request, env: Env = {}): Promise<Response> {
  const url = new URL(request.url);

  // Health probe
  if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/v1/health')) {
    return jsonResponse({
      status: 'healthy',
      substrate: 'starlight-fleet-ingress',
      timestamp: new Date().toISOString(),
      protocol: 'SIP-1.1.1',
      dispatchMode: env.FLEET_DISPATCH_QUEUE && env.DISPATCH_MODE !== 'direct' ? 'queue' : 'direct',
      deduplicatorBound: Boolean(env.DEDUPLICATOR),
    });
  }

  // Signed Cloud Run runner completion callback
  if (request.method === 'POST' && url.pathname === '/v1/runner/callback') {
    return handleRunnerCallback(request, env);
  }

  // Read-only authenticated Streamable HTTP MCP diagnostics
  if (request.method === 'POST' && url.pathname === '/mcp') {
    return handleMcpRequest(request, env);
  }

  // GitHub Webhook receiver endpoint
  if (request.method === 'POST' && (url.pathname === '/webhook' || url.pathname === '/v1/github/events')) {
    // Missing credentials must never turn a private webhook into an unsigned one.
    if (!env.GITHUB_WEBHOOK_SECRET?.trim()) {
      return jsonResponse({ error: 'webhook_unavailable' }, 503);
    }

    const bounded = await readBoundedText(request, MAX_WEBHOOK_BYTES);
    if (!bounded.ok) {
      return jsonResponse({ error: 'payload_too_large' }, 413);
    }

    const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event') || 'ping';
    const deliveryHeader = request.headers.get('x-github-delivery')?.trim() || '';

    const isValid = await verifySignature(bounded.text, signature, env.GITHUB_WEBHOOK_SECRET);
    if (!isValid) {
      return jsonResponse({ error: 'invalid_signature' }, 401);
    }

    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(bounded.text);
    } catch {
      return jsonResponse({ error: 'malformed_json' }, 400);
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return jsonResponse({ error: 'malformed_json' }, 400);
    }

    if (eventType === 'ping') {
      return jsonResponse({ ok: true, pong: true });
    }

    const meta = extractEventMetadata(eventType, payload);
    if (!meta) {
      return jsonResponse({ ok: true, skipped: 'untracked_event' });
    }

    const needsRunner = shouldDispatchRunner(meta);
    if (!needsRunner) {
      return jsonResponse({ ok: true, skipped: 'no_runner_action_needed', meta });
    }

    // Durable Object SQLite replay deduplication when x-github-delivery is present
    const dedupStub = deliveryHeader ? getDeduplicatorStub(env) : null;
    if (dedupStub && deliveryHeader) {
      const claimRes = await dedupStub.fetch('https://dedup.internal/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: deliveryHeader,
          eventType: meta.event,
          repo: meta.repo,
          ttlMs: DEDUP_TTL_MS,
        }),
      });
      const claimJson = (await claimRes.json().catch(() => ({}))) as Record<string, any>;
      if (claimJson.duplicate === true) {
        return jsonResponse({
          ok: true,
          deduplicated: true,
          deliveryId: deliveryHeader,
          priorStatus: claimJson.status ?? 'dispatched',
        });
      }
    }

    const callbackUrl = `${url.origin}/v1/runner/callback`;
    const deliveryId = deliveryHeader || crypto.randomUUID();

    // Queue-buffered dispatch path when Cloudflare Queues producer is active
    if (env.FLEET_DISPATCH_QUEUE && env.DISPATCH_MODE !== 'direct') {
      try {
        await env.FLEET_DISPATCH_QUEUE.send({
          deliveryId,
          meta,
          callbackUrl,
          enqueuedAt: new Date().toISOString(),
        });
        if (dedupStub && deliveryHeader) {
          await dedupStub.fetch('https://dedup.internal/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveryId: deliveryHeader,
              eventType: meta.event,
              repo: meta.repo,
              status: 'queued',
            }),
          });
        }
        return jsonResponse(
          {
            ok: true,
            queued: true,
            deliveryId,
            event: meta.event,
            repo: meta.repo,
            runnerRequired: true,
          },
          202,
        );
      } catch {
        if (dedupStub && deliveryHeader) {
          await dedupStub.fetch('https://dedup.internal/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryId: deliveryHeader }),
          });
        }
        return jsonResponse({ error: 'queue_enqueue_failed' }, 502);
      }
    }

    // Direct Cloud Run Jobs dispatch path
    const dispatchResult = await dispatchToCloudRun(meta, callbackUrl, env, deliveryId);
    if (!dispatchResult.ok) {
      if (dedupStub && deliveryHeader) {
        await dedupStub.fetch('https://dedup.internal/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryId: deliveryHeader }),
        });
      }
      return jsonResponse({ error: dispatchResult.error }, dispatchResult.status);
    }

    if (dedupStub && deliveryHeader) {
      await dedupStub.fetch('https://dedup.internal/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: deliveryHeader,
          eventType: meta.event,
          repo: meta.repo,
          status: 'dispatched',
        }),
      });
    }

    return jsonResponse(
      {
        ok: true,
        deliveryId,
        event: meta.event,
        repo: meta.repo,
        runnerRequired: true,
        gcp: {
          dispatched: true,
          status: dispatchResult.status,
          body: dispatchResult.body,
        },
      },
      202,
    );
  }

  return jsonResponse({ error: 'not_found' }, 404);
}

/**
 * Cloudflare Queues batch consumer for `starlight-fleet-dispatch`.
 * Acks successful Cloud Run Job dispatches and retries transient 5xx failures
 * with backoff before routing exhausted messages to `starlight-fleet-dlq`.
 */
export async function handleQueueBatch(
  batch: MessageBatchLike<FleetDispatchMessage>,
  env: Env,
): Promise<void> {
  const stub = getDeduplicatorStub(env);

  for (const message of batch.messages) {
    const payload = message.body;
    if (!payload?.meta?.repo || !payload.callbackUrl) {
      message.ack();
      continue;
    }

    const result = await dispatchToCloudRun(
      payload.meta,
      payload.callbackUrl,
      env,
      payload.deliveryId,
    );

    if (result.ok) {
      if (stub && payload.deliveryId) {
        await stub
          .fetch('https://dedup.internal/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveryId: payload.deliveryId,
              eventType: payload.meta.event,
              repo: payload.meta.repo,
              status: 'dispatched',
            }),
          })
          .catch(() => {});
      }
      message.ack();
    } else {
      message.retry({ delaySeconds: 15 });
    }
  }
}

export default {
  fetch: handleRequest,
  queue: handleQueueBatch,
};
