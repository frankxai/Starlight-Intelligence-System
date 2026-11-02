/**
 * Starlight Fleet Ingress Router — Cloudflare Worker
 *
 * Receives authenticated, source-pinned GitHub work and records a durable dispatch
 * attempt before calling the configured Cloud Run Job. Public ingress remains
 * contained until the deployment and workload admission gates are qualified.
 * No measured latency, cost, completion or GPU qualification is claimed here.
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1.
 */

import { AdmissionError, authorizeSource, parsePolicy } from './admission.ts';
import { accept, claim, LedgerUnavailable } from './delivery-ledger.ts';
import type { DeliveryStorage } from './delivery-ledger.ts';

export interface Env {
  GITHUB_WEBHOOK_SECRET?: string;
  GCP_PROJECT_ID?: string;
  GCP_REGION?: string;
  CLOUD_RUN_JOB?: string;
  GCP_SERVICE_ACCOUNT_TOKEN?: string;
  INGRESS_AUTH_BEARER?: string;
  FLEET_ADMISSION_POLICY?: string;
  FLEET_DELIVERIES?: {
    idFromName(name: string): unknown;
    get(id: unknown): { fetch(request: Request): Promise<Response> };
  };
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
  labels?: string[];
}

/**
 * Verify GitHub HMAC-SHA256 signature using standard Web Crypto API.
 */
export async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
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
    ['verify']
  );

  const sigBytes = new Uint8Array(
    signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  const dataBytes = encoder.encode(rawBody);

  return crypto.subtle.verify('HMAC', cryptoKey, sigBytes, dataBytes);
}

/**
 * Extract normalized metadata from a GitHub webhook event payload.
 */
export function extractEventMetadata(
  eventType: string,
  payload: Record<string, any>
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
    labels: payload.workflow_job?.labels,
  };
}

/**
 * Advisory event filter for callers. This does not authorize dispatch.
 * handleRequest independently enforces the full source policy.
 */
export function shouldDispatchRunner(meta: WebhookEventMeta): boolean {
  // Candidate PR states; the effect boundary separately checks repository, draft and SHA.
  if (meta.event === 'pull_request') {
    return ['opened', 'synchronize', 'reopened'].includes(meta.action || '');
  }
  // Trigger on push to main or release branches
  if (meta.event === 'push') {
    return meta.ref === 'refs/heads/main' || meta.ref?.startsWith('refs/tags/v') === true;
  }
  // Trigger on workflow jobs queued requesting starlight-runner label
  if (meta.event === 'workflow_job' && meta.action === 'queued') {
    return Array.isArray(meta.labels) && meta.labels.includes('self-hosted')
      && meta.labels.includes('starlight-runner');
  }
  return false;
}

/**
 * Build the Cloud Run Job `run` API body with environment variable overrides.
 */
export function buildCloudRunExecutionPayload(
  meta: WebhookEventMeta,
  callbackUrl?: string
): Record<string, any> {
  const envOverrides: Array<{ name: string; value: string }> = [
    { name: 'STARLIGHT_REPO', value: meta.repo },
    { name: 'TRIGGER_EVENT', value: meta.event },
  ];

  if (meta.sha) envOverrides.push({ name: 'STARLIGHT_COMMIT_SHA', value: meta.sha });
  if (meta.prNumber) envOverrides.push({ name: 'PR_NUMBER', value: String(meta.prNumber) });
  if (meta.ref) envOverrides.push({ name: 'GIT_REF', value: meta.ref });
  if (callbackUrl) envOverrides.push({ name: 'CALLBACK_URL', value: callbackUrl });

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

export const MAX_BODY_BYTES = 1024 * 1024;
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function boundedText(request: Request | Response, limit = MAX_BODY_BYTES): Promise<string> {
  const declared = request.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit))
    throw new AdmissionError('payload_too_large', 413);
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const read = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit) throw new AdmissionError('payload_too_large', 413);
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    };
    return await Promise.race([read(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new AdmissionError('body_timeout', 408)), 2000);
    })]);
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof AdmissionError) throw error;
    throw new AdmissionError('malformed_body', 400);
  } finally { clearTimeout(timer); }
}

async function inspect(request: Request, env: Env) {
  if (!env.GITHUB_WEBHOOK_SECRET?.trim()) throw new AdmissionError('webhook_unavailable', 503);
  const raw = await boundedText(request);
  if (!await verifySignature(raw, request.headers.get('x-hub-signature-256'), env.GITHUB_WEBHOOK_SECRET))
    throw new AdmissionError('invalid_signature', 401);
  let payload: Record<string, any>;
  try { payload = JSON.parse(raw); } catch { throw new AdmissionError('malformed_json', 400); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new AdmissionError('malformed_json', 400);
  const event = request.headers.get('x-github-event');
  if (!event) throw new AdmissionError('event_header_required', 400);
  if (event === 'ping') return { response: json({ ok: true, pong: true }) };
  if (!['push','pull_request','workflow_job'].includes(event))
    return { response: json({ ok: true, skipped: 'untracked_event' }) };
  if (![env.GCP_PROJECT_ID, env.GCP_REGION, env.CLOUD_RUN_JOB, env.GCP_SERVICE_ACCOUNT_TOKEN]
    .every(v => typeof v === 'string' && v.trim().length > 0))
    throw new AdmissionError('runner_unavailable', 503);
  if (!/^(?:[a-z][a-z0-9-]{4,28}[a-z0-9]|[0-9]{6,20})$/.test(env.GCP_PROJECT_ID!)
    || !/^[a-z]+-[a-z]+[0-9]+$/.test(env.GCP_REGION!)
    || !/^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(env.CLOUD_RUN_JOB!)
    || /[\x00-\x20\x7f]/.test(env.GCP_SERVICE_ACCOUNT_TOKEN!))
    throw new AdmissionError('runner_unavailable', 503);
  const policy = parsePolicy(env.FLEET_ADMISSION_POLICY);
  authorizeSource(event, payload, policy);
  const meta = extractEventMetadata(event, payload)!;
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)));
  const fingerprint = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return { raw, event, policy, meta, fingerprint };
}
function failure(error: unknown): Response {
  return error instanceof AdmissionError ? json({ error: error.message }, error.status)
    : json({ error: 'ingress_unavailable' }, 503);
}

export async function handleRequest(request: Request, env: Env = {}): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (request.method === 'GET' && ['/health','/v1/health'].includes(path))
    return json({ status: 'healthy', readiness: 'not_evaluated', substrate: 'starlight-fleet-ingress',
      timestamp: new Date().toISOString(), protocol: 'SIP-1.1.1' });
  if (request.method !== 'POST' || !['/webhook','/v1/github/events'].includes(path))
    return json({ error: 'not_found' }, 404);
  try {
    const admitted = await inspect(request, env);
    if (admitted.response) return admitted.response;
    if (!env.FLEET_DELIVERIES) return json({ error: 'ledger_unavailable' }, 503);
    // Delivery headers are not signed. Key only by the verified, unchanged body.
    const stub = env.FLEET_DELIVERIES.get(env.FLEET_DELIVERIES.idFromName(admitted.fingerprint));
    return await stub.fetch(new Request('https://delivery.internal/dispatch', {
      method: 'POST', headers: {
        'x-github-event': admitted.event,
        'x-hub-signature-256': request.headers.get('x-hub-signature-256')!,
      }, body: admitted.raw,
    }));
  } catch (error) { return failure(error); }
}

/** Private binding only. Storage is a dispatch journal, not another task owner. */
export class FleetDelivery {
  private storage: DeliveryStorage;
  private env: Env;
  constructor(state: { storage: DeliveryStorage }, env: Env) {
    this.storage = state.storage; this.env = env;
  }
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/dispatch')
      return json({ error: 'not_found' }, 404);
    try {
      // Recheck body, scope and expiry at the effect boundary, not just at ingress.
      const admitted = await inspect(request, this.env);
      if (admitted.response) return admitted.response;
      const { meta, policy, fingerprint } = admitted;
      const { claimed, receipt } = await claim(this.storage, fingerprint, policy.policy_id);
      if (!claimed) return receipt.state === 'accepted'
        ? json({ status: 'dispatch_accepted', duplicate: true, receipt })
        : json({ error: 'runner_dispatch_uncertain', reconciliation_required: true }, 409);
      const uncertain = () => json({ error: 'runner_dispatch_uncertain', reconciliation_required: true }, 502);
      try {
        // An expiry reached while waiting for durable admission must prevent the effect.
        const currentPolicy = parsePolicy(this.env.FLEET_ADMISSION_POLICY);
        if (JSON.stringify(currentPolicy) !== JSON.stringify(policy)) return uncertain();
        const body = buildCloudRunExecutionPayload(meta);
        body.etag = policy.job_etag;
        body.overrides.taskCount = 1;
        body.overrides.timeout = `${policy.max_duration_seconds}s`;
        body.overrides.containerOverrides[0].env.push({
          name: 'STARLIGHT_TIMEOUT_SECONDS', value: String(policy.max_duration_seconds),
        });
        const prefix = `projects/${this.env.GCP_PROJECT_ID}/locations/${this.env.GCP_REGION}`;
        const response = await fetch(`https://run.googleapis.com/v2/${prefix}/jobs/${this.env.CLOUD_RUN_JOB}:run`, {
          // Workers supports manual/follow, not redirect:error. Non-2xx is held below.
          method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(5000),
          headers: { Authorization: `Bearer ${this.env.GCP_SERVICE_ACCOUNT_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) { void response.body?.cancel().catch(() => {}); return uncertain(); }
        const operation = JSON.parse(await boundedText(response, 65536));
        const name = operation?.name;
        if (operation.error || typeof name !== 'string' || !name.startsWith(`${prefix}/operations/`)
          || !/^[A-Za-z0-9_-]{1,200}$/.test(name.slice(`${prefix}/operations/`.length))) return uncertain();
        await accept(this.storage, receipt, name);
        return json({ ok: true, status: 'dispatch_accepted', duplicate: false,
          gcp: { dispatched: true, operation: name }, completion_verified: false }, 202);
      } catch { return uncertain(); }
    } catch (error) {
      if (error instanceof LedgerUnavailable) return json({ error: 'ledger_unavailable' }, 503);
      return failure(error);
    }
  }
}

export default { fetch: handleRequest };
