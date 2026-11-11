#!/usr/bin/env node
/** Read-only containment smoke check. Never establishes production readiness. */
import { pathToFileURL } from 'node:url';

const DEFAULT_ENDPOINT = 'https://starlight-cloud-worker.frankxai.workers.dev';
const PROBE_PATH = '/v1/__containment_probe__';
const SYNTHETIC_TOKEN = 'containment-probe-not-an-issued-credential';
const MAX_BYTES = 16 * 1024;

function originFor(endpoint) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password ||
      url.search || url.hash || url.pathname !== '/') {
    throw new Error('Use an HTTPS origin without credentials, path, query or fragment.');
  }
  return url.origin;
}

async function readJson(response, signal) {
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) {
    throw new Error('json_required');
  }
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) {
    throw new Error('body_limit');
  }
  if (!response.body) throw new Error('body_missing');
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks = [];
  let size = 0;
  try {
    if (signal.aborted) throw new Error('deadline');
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error('body_limit');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } finally {
    signal.removeEventListener('abort', cancel);
    cancel();
  }
}

async function probe(origin, spec, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  let timer;
  let response;
  const task = async () => {
    response = await fetchImpl(`${origin}${spec.path}`, {
      method: 'GET', redirect: 'error', cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json', ...spec.headers },
    });
    if (response.redirected || response.status >= 300 && response.status < 400) {
      throw new Error('redirect_refused');
    }
    const body = await readJson(response, controller.signal);
    return {
      name: spec.name, passed: response.status === spec.status && spec.accept(body),
      httpStatus: response.status,
    };
  };
  try {
    return await Promise.race([
      task(),
      new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('deadline')); }, timeoutMs);
      }),
    ]);
  } catch {
    // WAF denial, transport failure and invalid bodies cannot prove containment.
    // Keep provider diagnostics and response bodies out of the receipt.
    return { name: spec.name, passed: false, httpStatus: response?.status ?? null };
  } finally {
    clearTimeout(timer);
    controller.abort();
    if (response?.body && !response.body.locked) void response.body.cancel().catch(() => {});
  }
}

export async function checkCloudContainment({
  endpoint = DEFAULT_ENDPOINT, fetchImpl = globalThis.fetch, timeoutMs = 5000,
} = {}) {
  const origin = originFor(endpoint);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) {
    throw new Error('Probe timeout must be between 1 and 5000 milliseconds.');
  }
  const contained = body => body?.code === 'protected_api_unavailable' &&
    body.success === undefined && body.results === undefined && body.choices === undefined;
  const specs = [
    {
      name: 'public_health_reports_containment', path: '/v1/health', status: 200,
      accept: body => body?.service === 'starlight-cloud-worker' &&
        body.protectedApi?.status === 'unavailable' &&
        body.protectedApi?.reason === 'identity_membership_verifier_missing',
    },
    {
      name: 'anonymous_request_denied', path: PROBE_PATH, status: 401,
      accept: body => body?.error === 'Unauthorized',
    },
    ...['tenant-a', 'tenant-b'].map(tenant => ({
      name: `unissued_credential_${tenant}_contained`, path: PROBE_PATH, status: 503,
      headers: { Authorization: `Bearer ${SYNTHETIC_TOKEN}`, 'X-Starlight-Tenant': tenant },
      accept: contained,
    })),
  ];
  const checks = [];
  for (const spec of specs) checks.push(await probe(origin, spec, fetchImpl, timeoutMs));
  return {
    status: checks.every(check => check.passed) ? 'verified_contained' : 'unverified',
    productionReady: false,
    scope: 'Read-only ingress containment; no authenticated tenant, persistence, model, lease or cost qualification.',
    checks,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await checkCloudContainment({ endpoint: process.env.STARLIGHT_CLOUD_URL || DEFAULT_ENDPOINT });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'verified_contained') process.exitCode = 1;
  } catch {
    console.error('Containment check could not run: use an HTTPS origin and valid bounded configuration.');
    process.exitCode = 1;
  }
}
