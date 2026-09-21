#!/usr/bin/env node
// SIP graph conformance checker.
//
//   node protocol/conform.mjs <profile.json> [--json <out>] [--quiet]
//
// Exit 0 on PASS, 1 on FAIL, 2 on a usage or read error. Zero dependencies —
// an adopter runs this with the node they already have, offline, without
// installing anything from this repo.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { validateProfile, SIP_GRAPH_VERSION } from "./lib/graph.mjs";

export const CONFORM_VERSION = "0.1.0";

function parseArgs(argv) {
  const args = { path: null, json: null, quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") args.json = argv[++i];
    else if (a === "--quiet") args.quiet = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (!args.path) args.path = a;
  }
  return args;
}

const USAGE = `sip-conform ${CONFORM_VERSION} — SIP graph v${SIP_GRAPH_VERSION}

  node protocol/conform.mjs <profile.json> [--json <receipt.json>] [--quiet]

Validates a SIP graph profile against the structural rules (G*), the version
compatibility rule (C1) and the public/private projection rules (P*), then
prints a receipt. Exit 0 = PASS, 1 = FAIL, 2 = usage error.`;

/**
 * Build a conformance receipt for an already-parsed profile.
 * Pure: no I/O, deterministic apart from `checkedAt`.
 */
export function buildReceipt({ profile, raw, subject, checkedAt }) {
  const { verdict, rules, counts } = validateProfile(profile);
  return {
    receiptVersion: "0.1.0",
    tool: `sip-conform@${CONFORM_VERSION}`,
    sipGraphVersion: SIP_GRAPH_VERSION,
    declaredGraphVersion: profile?.sipGraphVersion ?? null,
    subject: subject ?? profile?.profile?.subject ?? null,
    profileId: profile?.profile?.id ?? null,
    profileSha256: createHash("sha256").update(raw).digest("hex"),
    checkedAt,
    counts,
    verdict,
    rules: rules.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      findings: r.findings,
    })),
  };
}

function render(receipt) {
  const pad = (s, n) => String(s).padEnd(n);
  const lines = [];
  lines.push("");
  lines.push(`  SIP graph conformance receipt`);
  lines.push(`  ${"─".repeat(66)}`);
  lines.push(`  subject          ${receipt.subject ?? "(undeclared)"}`);
  lines.push(`  profile          ${receipt.profileId ?? "(undeclared)"}`);
  lines.push(`  sha256           ${receipt.profileSha256}`);
  lines.push(
    `  graph version    declared ${receipt.declaredGraphVersion ?? "?"} · checked against ${receipt.sipGraphVersion}`
  );
  lines.push(`  tool             ${receipt.tool}`);
  lines.push(`  checked at       ${receipt.checkedAt}`);
  const byType = Object.entries(receipt.counts.byType ?? {})
    .map(([t, n]) => `${t} ${n}`)
    .join(", ");
  lines.push(
    `  graph            ${receipt.counts.nodes ?? 0} nodes, ${receipt.counts.edges ?? 0} edges, ${receipt.counts.projections ?? 0} projections`
  );
  if (byType) lines.push(`                   ${byType}`);
  lines.push(`  ${"─".repeat(66)}`);
  for (const rule of receipt.rules) {
    const mark = rule.status === "pass" ? "PASS" : "FAIL";
    lines.push(`  ${mark}  ${pad(rule.id, 4)} ${rule.title}`);
    for (const f of rule.findings) lines.push(`             · ${f}`);
  }
  lines.push(`  ${"─".repeat(66)}`);
  const failed = receipt.rules.filter((r) => r.status === "fail").length;
  lines.push(
    `  VERDICT ${receipt.verdict}   ${receipt.rules.length - failed}/${receipt.rules.length} rules passed`
  );
  lines.push("");
  return lines.join("\n");
}

function main(argv) {
  const args = parseArgs(argv);
  if (args.help || !args.path) {
    console.log(USAGE);
    return args.help ? 0 : 2;
  }

  const path = resolve(args.path);
  let raw;
  try {
    raw = readFileSync(path); // bytes: profileSha256 must equal sha256sum of the file
  } catch (err) {
    console.error(`sip-conform: cannot read ${path}: ${err.message}`);
    return 2;
  }

  let profile;
  try {
    profile = JSON.parse(raw.toString("utf8"));
  } catch (err) {
    console.error(`sip-conform: ${basename(path)} is not valid JSON: ${err.message}`);
    return 2;
  }

  const receipt = buildReceipt({
    profile,
    raw,
    checkedAt: new Date().toISOString(),
  });

  if (!args.quiet) process.stdout.write(render(receipt));
  if (args.json) {
    writeFileSync(args.json, `${JSON.stringify(receipt, null, 2)}\n`);
    if (!args.quiet) console.log(`  receipt written to ${args.json}\n`);
  }

  return receipt.verdict === "PASS" ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main(process.argv.slice(2)));
}

export { main, render };
