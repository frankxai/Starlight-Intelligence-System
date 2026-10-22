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
 *   0 — everything passes (valid envelope, valid signature, no receipt problems)
 *   1 — verification or structural problem found
 *   2 — unreadable input (file missing, malformed JSON, invalid CLI args)
 *
 * Read-only: never writes or signs.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { verifyRunReceipt } from "./run-receipt.js";

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
    envelopeContent = readFileSync(envelopePath, "utf-8");
  } catch (err: unknown) {
    console.error(`Error reading envelope file "${envelopePath}": ${err instanceof Error ? err.message : String(err)}`);
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
      const keyPem = readFileSync(kp, "utf-8");
      trustedKeys.push(keyPem);
    } catch (err: unknown) {
      console.error(`Error reading public key file "${kp}": ${err instanceof Error ? err.message : String(err)}`);
      return 2;
    }
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
