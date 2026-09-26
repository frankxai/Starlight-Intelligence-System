/**
 * Shareable /verify links for run receipts, node side.
 *
 * Two forms travel in the `r` parameter of https://starlightintelligence.ai/verify:
 *
 *   r=b64u:<base64url of the DSSE envelope JSON>   plain; ~3.8k chars for a
 *                                                   four-stage receipt, past
 *                                                   what a QR holds (2953)
 *   r=z:<base64url of deflate-raw({t, p, s})>       compact; the statement JSON
 *                                                   stored decoded (p) so the
 *                                                   deflate sees text, ~1.4k
 *                                                   chars, fits a printed QR
 *
 * The compact form restores the envelope byte for byte: the payload is the
 * UTF-8 of `p` re-encoded as base64, which is what the signature covers. The
 * site parses both forms (lib/receipt-share.ts there); this file is the issuer
 * side and its test pins a vector the site's test also pins.
 *
 * Built on SIP — operational tier
 */
import { deflateRawSync, inflateRawSync } from 'node:zlib';

import type { DsseEnvelope } from './run-receipt.js';

export const SHARE_ORIGIN = 'https://starlightintelligence.ai';
/** Hard cap on the `r` parameter, matching the site. */
export const MAX_SHARE_PARAM_BYTES = 16_384;
/** Hard cap on what a compact link may inflate to. */
export const MAX_INFLATED_BYTES = 65_536;
/** The largest text a QR holds (version 40, level L). */
export const QR_MAX_CHARS = 2953;

const B64U_PREFIX = 'b64u:';
const Z_PREFIX = 'z:';
const BASE64URL = /^[A-Za-z0-9_-]*$/;

function isEnvelope(value: unknown): value is DsseEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const env = value as Record<string, unknown>;
  return typeof env.payloadType === 'string' && typeof env.payload === 'string' && Array.isArray(env.signatures);
}

/** `b64u:` plus base64url of the envelope JSON. */
export function shareParam(envelope: object): string {
  return `${B64U_PREFIX}${Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64url')}`;
}

/**
 * `z:` plus base64url of deflate-raw over `{t, p, s}`; null when the payload is
 * not valid UTF-8 (then only the plain form is exact).
 */
export function compactShareParam(envelope: object): string | null {
  if (!isEnvelope(envelope)) return null;
  const payloadBytes = Buffer.from(envelope.payload, 'base64');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(payloadBytes);
  } catch {
    return null;
  }
  if (Buffer.from(text, 'utf8').toString('base64') !== payloadBytes.toString('base64')) return null;
  const compact = JSON.stringify({ t: envelope.payloadType, p: text, s: envelope.signatures });
  return `${Z_PREFIX}${deflateRawSync(compact, { level: 9 }).toString('base64url')}`;
}

/** The share URL, compact when the envelope allows it, plain otherwise. */
export function receiptShareUrl(envelope: object, origin: string = SHARE_ORIGIN): string {
  return `${origin}/verify?r=${compactShareParam(envelope) ?? shareParam(envelope)}`;
}

/** Inverse of both forms. Never throws; a bad value comes back as `error`. */
export function parseShareParam(r: string): { envelope?: DsseEnvelope; error?: string } {
  if (typeof r !== 'string' || !r.trim()) return { error: 'The link carried no receipt.' };
  if (Buffer.byteLength(r, 'utf8') > MAX_SHARE_PARAM_BYTES) return { error: 'The link is larger than 16 KB.' };
  if (r.startsWith(Z_PREFIX)) {
    const body = r.slice(Z_PREFIX.length);
    if (!BASE64URL.test(body) || body.length % 4 === 1 || body.length === 0) return { error: "The link's receipt is not base64url." };
    let compact: unknown;
    try {
      const inflated = inflateRawSync(Buffer.from(body, 'base64url'), { maxOutputLength: MAX_INFLATED_BYTES });
      compact = JSON.parse(inflated.toString('utf8'));
    } catch {
      return { error: "The link's receipt did not decompress to JSON." };
    }
    if (!compact || typeof compact !== 'object' || Array.isArray(compact)) return { error: "The link's receipt is not an envelope object." };
    const { t, p, s } = compact as Record<string, unknown>;
    if (typeof t !== 'string' || typeof p !== 'string' || !Array.isArray(s)) return { error: "The link's receipt is not an envelope object." };
    return { envelope: { payloadType: t, payload: Buffer.from(p, 'utf8').toString('base64'), signatures: s as DsseEnvelope['signatures'] } };
  }
  if (r.startsWith(B64U_PREFIX)) {
    const body = r.slice(B64U_PREFIX.length);
    if (!BASE64URL.test(body) || body.length % 4 === 1 || body.length === 0) return { error: "The link's receipt is not base64url." };
    let envelope: unknown;
    try {
      envelope = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch {
      return { error: "The link's receipt is not JSON." };
    }
    if (!isEnvelope(envelope)) return { error: "The link's receipt is not an envelope object." };
    return { envelope };
  }
  return { error: 'The link is neither a receipt nor a receipt id.' };
}
