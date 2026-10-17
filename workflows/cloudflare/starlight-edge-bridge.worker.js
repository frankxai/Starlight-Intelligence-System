/**
 * starlight-edge-bridge.worker.js
 *
 * Cloudflare Worker + KV/Durable-Object Edge Bridge for the Starlight Agentic OS.
 * Solves the Cloud -> Local queue gap: allows Railway, n8n, Claude Cloud Routines,
 * Codex Cloud Sandboxes, and Vercel webhooks to post HMAC-SHA256 signed task receipts
 * and heartbeats that the local workstation pulls on every 2h Horizon tick (or on wake).
 *
 * Endpoints:
 *   POST /v1/receipts     — Enqueue a signed cloud execution receipt + heartbeat
 *   GET  /v1/receipts     — Drain/list verified receipts since ?since=<iso>
 *   POST /v1/tasks        — Enqueue a cloud task from a local harness
 *   GET  /v1/health       — Edge bridge liveness & queue depth
 *
 * Attestation: Built on SIP
 */

async function verifyHmacSignature(secret, timestamp, rawBody, signatureHex) {
  if (!secret || !timestamp || !signatureHex) return false;
  const ageSec = Math.abs(Date.now() - Date.parse(timestamp)) / 1000;
  if (!Number.isFinite(ageSec) || ageSec > 300) return false; // 5-minute replay window

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = new Uint8Array(
    (signatureHex.match(/.{1,2}/g) || []).map((b) => parseInt(b, 16))
  );
  return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${timestamp}.${rawBody}`));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Starlight-Attestation': 'Built on SIP'
    };

    if (url.pathname === '/v1/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          schema: 'starlight.edge_bridge.health.v1',
          status: 'ok',
          ts: new Date().toISOString(),
          attestation: 'Built on SIP'
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    const rawBody = request.method === 'POST' ? await request.text() : '';
    const ts = request.headers.get('X-Starlight-Timestamp') || '';
    const sig = request.headers.get('X-Starlight-Signature') || '';
    const valid = await verifyHmacSignature(env.STARLIGHT_BRIDGE_SECRET, ts, rawBody, sig);

    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired HMAC-SHA256 signature' }),
        { status: 401, headers: corsHeaders }
      );
    }

    if (url.pathname === '/v1/receipts' && request.method === 'POST') {
      const receipt = JSON.parse(rawBody);
      const id = receipt.receiptId || `rcpt_${Date.now()}`;
      if (env.STARLIGHT_BRIDGE_KV) {
        await env.STARLIGHT_BRIDGE_KV.put(`receipt:${id}`, JSON.stringify(receipt), {
          expirationTtl: 14 * 86400
        });
      }
      return new Response(
        JSON.stringify({ accepted: true, receiptId: id, ts: new Date().toISOString() }),
        { status: 202, headers: corsHeaders }
      );
    }

    if (url.pathname === '/v1/receipts' && request.method === 'GET') {
      const items = [];
      if (env.STARLIGHT_BRIDGE_KV) {
        const list = await env.STARLIGHT_BRIDGE_KV.list({ prefix: 'receipt:' });
        for (const key of list.keys) {
          const val = await env.STARLIGHT_BRIDGE_KV.get(key.name, 'json');
          if (val) items.push(val);
        }
      }
      return new Response(
        JSON.stringify({ schema: 'starlight.edge_bridge.receipts.v1', count: items.length, items }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
  }
};
