#!/usr/bin/env node

/**
 * Starlight run receipt standalone verifier CLI.
 *
 * Usage:
 *   verify-receipt <file.json> --public-key <file>
 *   starlight verify-receipt <file.json> --public-key <file>
 *
 * Reads a DSSE envelope JSON, checks signature & key id against trusted public key(s),
 * runs receiptProblems on the payload, and prints a short pass/fail report plus each problem.
 *
 * Exit codes:
 *   0 — everything passes (valid envelope, valid signature, no receipt problems).
 *       The only other exit 0 is `--help` given on its own.
 *   1 — verification or structural problem found
 *   2 — unreadable input (file missing or over the size limit, malformed JSON, invalid CLI args)
 *
 * Read-only: never writes or signs.
 */

import { createPublicKey } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { verifyRunReceipt } from "./run-receipt.js";

/** Largest envelope or key file the command will read. A real envelope is a few KiB. */
export const MAX_INPUT_BYTES = 1024 * 1024;

/**
 * Encodings of Ed25519 points of small order (the 8 canonical ones, including the identity, plus
 * the non-canonical aliases of the identity and of the order-2 point). A signature under such a key
 * can be forged for any message, so the command refuses them as trusted keys.
 */
const SMALL_ORDER_ED25519_POINTS = new Set(
  [
    "0100000000000000000000000000000000000000000000000000000000000000", // identity (order 1)
    "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f", // order 2
    "0000000000000000000000000000000000000000000000000000000000000000", // order 4
    "0000000000000000000000000000000000000000000000000000000000000080", // order 4, sign bit set
    "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a", // order 8
    "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa", // order 8, sign bit set
    "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05", // order 8
    "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85", // order 8, sign bit set
    "0100000000000000000000000000000000000000000000000000000000000080", // identity, sign bit set
    "edffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f", // non-canonical identity (y = p)
    "edffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // same, sign bit set
    "eeffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f", // non-canonical (y = p + 1)
    "eeffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // same, sign bit set
    "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // order 2, sign bit set
  ],
);

/** True when the PEM parses as an Ed25519 key whose raw point is a small-order point. */
export function isSmallOrderEd25519Key(pem: string): boolean {
  try {
    const der = createPublicKey(pem).export({ type: "spki", format: "der" });
    return SMALL_ORDER_ED25519_POINTS.has(der.subarray(der.length - 32).toString("hex"));
  } catch {
    return false; // unparseable keys are rejected by the shared verifier as "unusable"
  }
}

/**
 * Standard base64 (padding required) or base64url (padding optional), never a mix, with no stray
 * characters and no non-zero trailing bits. Node's decoder forgives all of those; this does not.
 */
export function isStrictBase64(value: unknown): value is string {
  if (typeof value !== "string" || value === "") return false;
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) return false;
  const hasStandard = /[+/]/.test(value);
  const hasUrl = /[-_]/.test(value);
  if (hasStandard && hasUrl) return false;
  const body = value.replace(/=+$/, "");
  const padding = value.length - body.length;
  if (body.length % 4 === 1) return false;
  if (padding > 0 && (body.length + padding) % 4 !== 0) return false;
  if (hasStandard && padding === 0 && body.length % 4 !== 0) return false;
  const encoding = hasUrl ? "base64url" : "base64";
  return Buffer.from(body, encoding).toString(encoding).replace(/=+$/, "") === body;
}

/** Encoding faults the shared decoder would silently forgive; found before it runs. */
export function encodingProblems(envelope: unknown): string[] {
  if (typeof envelope !== "object" || envelope === null || Array.isArray(envelope)) return [];
  const env = envelope as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof env.payload === "string" && !isStrictBase64(env.payload)) problems.push("payload is not strict base64 or base64url");
  if (Array.isArray(env.signatures)) {
    env.signatures.forEach((sig, i) => {
      if (typeof sig !== "object" || sig === null || Array.isArray(sig)) return;
      if (!isStrictBase64((sig as Record<string, unknown>).sig)) problems.push(`signature ${i} sig is not a strict base64 string`);
    });
  }
  return problems;
}

function readBounded(path: string, label: string): string {
  const info = statSync(path);
  if (!info.isFile()) throw new Error(`${label} is not a regular file`);
  if (info.size > MAX_INPUT_BYTES) throw new Error(`${label} is ${info.size} bytes, over the ${MAX_INPUT_BYTES} byte limit`);
  const bytes = readFileSync(path);
  if (bytes.length > MAX_INPUT_BYTES) throw new Error(`${label} grew past the ${MAX_INPUT_BYTES} byte limit while reading`);
  return bytes.toString("utf-8");
}

export interface VerifyReceiptCliOptions {
  envelopePath?: string;
  publicKeyPaths?: string[];
}

export function runVerifyReceipt(args: string[]): number {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      options: {
        "public-key": { type: "string", multiple: true },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: true,
      strict: true,
    });
  } catch (err: unknown) {
    console.error(`Error parsing arguments: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  if (parsed.values.help) {
    if (parsed.positionals.length > 0 || Object.keys(parsed.values).some((k) => k !== "help")) {
      console.error("--help cannot be combined with other arguments");
      return 2;
    }
    console.log(`
Usage: verify-receipt <file.json> --public-key <file>

Options:
  --public-key <file>   Path to trusted Ed25519 public key PEM (can be specified multiple times)
  --help, -h            Show this help message
`);
    return 0;
  }

  const envelopePath = parsed.positionals[0];
  const publicKeyPaths = parsed.values["public-key"] as string[] | string | undefined;

  const keyPathList: string[] = Array.isArray(publicKeyPaths)
    ? publicKeyPaths
    : typeof publicKeyPaths === "string"
      ? [publicKeyPaths]
      : [];

  if (!envelopePath || parsed.positionals.length !== 1 || keyPathList.length === 0) {
    console.error("Usage: verify-receipt <file.json> --public-key <file>");
    return 2;
  }

  let envelopeContent: string;
  try {
    envelopeContent = readBounded(envelopePath, `envelope file "${envelopePath}"`);
  } catch (err: unknown) {
    console.error(`Error reading ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  let envelope: unknown;
  try {
    envelope = JSON.parse(envelopeContent);
  } catch (err: unknown) {
    console.error(`Error parsing envelope JSON from "${envelopePath}": ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const trustedKeys: string[] = [];
  for (const kp of keyPathList) {
    try {
      const keyPem = readBounded(kp, `public key file "${kp}"`);
      trustedKeys.push(keyPem);
    } catch (err: unknown) {
      console.error(`Error reading ${err instanceof Error ? err.message : String(err)}`);
      return 2;
    }
  }

  const refused = keyPathList.filter((_, i) => isSmallOrderEd25519Key(trustedKeys[i]));
  if (refused.length > 0) {
    console.log("FAIL: Receipt verification failed");
    for (const kp of refused) console.log(`  - trusted key "${kp}" is a small-order Ed25519 point; signatures under it can be forged, so it cannot be trusted`);
    return 1;
  }

  const encoding = encodingProblems(envelope);
  if (encoding.length > 0) {
    console.log("FAIL: Receipt verification failed");
    for (const problem of encoding) console.log(`  - ${problem}`);
    return 1;
  }

  let result;
  try {
    result = verifyRunReceipt(envelope, trustedKeys);
  } catch (err: unknown) {
    // verifyRunReceipt promises never to throw. If it does, that is a rejection, never a pass.
    console.log(`FAIL: verifier error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }

  if (result.ok === true) {
    console.log(`PASS: signature and structure verified (keyid: ${result.keyid})`);
    console.log("Not checked: that the maker differs from the checker, that costs match a provider bill, that checker output is genuine.");
    return 0;
  }

  console.log("FAIL: Receipt verification failed");
  if (result.reasons && result.reasons.length > 0) {
    for (const reason of result.reasons) {
      console.log(`  - ${reason}`);
    }
  }
  return 1;
}

// Standalone CLI execution: only when this file is the entry point, not when cli.ts imports it.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const exitCode = runVerifyReceipt(process.argv.slice(2));
  process.exitCode = exitCode;
}
