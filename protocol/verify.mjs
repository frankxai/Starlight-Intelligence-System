#!/usr/bin/env node
// Verify a signed SIP graph conformance receipt (SIP-native profile).
//
//   node protocol/verify.mjs <envelope.json> --pub <key.pub> [--pub <key.pub> ...]
//                            [--profile <profile.json>] [--json]
//
// Without --profile this proves who signed which receipt. With --profile it also
// re-runs the conformance check on the exact bytes and requires the same result,
// so a verifier trusts the checker, not the signer's word.
//
// Exit 0 = verified, 1 = not verified, 2 = usage or read error. Zero dependencies.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

import { verifyEnvelope } from "./lib/dsse.mjs";
import { buildReceipt } from "./conform.mjs";

const USAGE = `sip-verify — verify a signed SIP receipt (Ed25519, DSSE v1, in-toto Statement v1)

  node protocol/verify.mjs <envelope.json> --pub <key.pub> [--pub ...] [--profile <profile.json>] [--json]`;

/** Re-check the profile bytes and compare with what was signed. Returns a list of mismatches. */
export function recheckProfile(statement, raw) {
  const mismatches = [];
  const signed = statement.predicate;
  const sha = createHash("sha256").update(raw).digest("hex");
  if (sha !== signed.profileSha256) {
    mismatches.push(`profile sha256 ${sha.slice(0, 16)}… differs from signed ${signed.profileSha256.slice(0, 16)}…`);
    return mismatches;
  }
  let profile;
  try {
    profile = JSON.parse(raw);
  } catch {
    return ["profile is not valid JSON"];
  }
  const fresh = buildReceipt({ profile, raw, checkedAt: signed.checkedAt });
  if (fresh.verdict !== signed.verdict) mismatches.push(`re-check verdict ${fresh.verdict} differs from signed ${signed.verdict}`);
  const signedRules = new Map(signed.rules.map((r) => [r.id, r.status]));
  for (const r of fresh.rules) {
    if (signedRules.get(r.id) !== r.status) {
      mismatches.push(`rule ${r.id}: re-check ${r.status}, signed ${signedRules.get(r.id) ?? "absent"}`);
    }
  }
  if (mismatches.length && fresh.tool !== signed.tool) {
    mismatches.push(`signed with ${signed.tool}, re-checked with ${fresh.tool} — a rule may have changed between versions`);
  }
  return mismatches;
}

function main(argv) {
  const args = { path: null, pubs: [], profile: null, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--pub") args.pubs.push(argv[++i]);
    else if (a === "--profile") args.profile = argv[++i];
    else if (a === "--json") args.json = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!args.path) args.path = a;
  }
  if (args.help || !args.path || args.pubs.length === 0) {
    console.log(USAGE);
    return args.help ? 0 : 2;
  }

  let envelope;
  let pubs;
  let raw = null;
  try {
    envelope = JSON.parse(readFileSync(resolve(args.path), "utf8"));
    pubs = args.pubs.map((p) => readFileSync(resolve(p), "utf8"));
    if (args.profile) raw = readFileSync(resolve(args.profile), "utf8");
  } catch (err) {
    console.error(`sip-verify: ${err.message}`);
    return 2;
  }

  const result = verifyEnvelope(envelope, pubs);
  let recheck = null;
  if (result.ok && raw !== null) {
    recheck = recheckProfile(result.statement, raw);
    if (recheck.length) {
      result.ok = false;
      result.reasons.push(...recheck);
    }
  }

  const summary = {
    verified: result.ok,
    keyid: result.keyid,
    subject: result.statement?.subject?.[0]?.name ?? null,
    profileSha256: result.statement?.predicate?.profileSha256 ?? null,
    tool: result.statement?.predicate?.tool ?? null,
    checkedAt: result.statement?.predicate?.checkedAt ?? null,
    reChecked: raw !== null && result.statement !== null,
    reasons: result.reasons,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("");
    console.log(`  ${summary.verified ? "VERIFIED" : "NOT VERIFIED"}`);
    if (summary.subject) console.log(`  subject      ${summary.subject}`);
    if (summary.profileSha256) console.log(`  sha256       ${summary.profileSha256}`);
    if (summary.keyid) console.log(`  signed by    ${summary.keyid}`);
    if (summary.tool) console.log(`  checked by   ${summary.tool} at ${summary.checkedAt}`);
    console.log(`  re-checked   ${summary.reChecked ? "yes, against the profile bytes" : "no (pass --profile to re-run the check)"}`);
    for (const r of summary.reasons) console.log(`  · ${r}`);
    console.log("");
  }
  return summary.verified ? 0 : 1;
}

if (process.argv[1]?.endsWith("verify.mjs")) {
  process.exit(main(process.argv.slice(2)));
}

export { main };
