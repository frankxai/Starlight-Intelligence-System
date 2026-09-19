#!/usr/bin/env node
// Built on SIP — recomputes SIS's own conformance receipt for the /verify page.
//
//   node site/scripts/sync-sis-receipt.mjs           write the committed copy
//   node site/scripts/sync-sis-receipt.mjs --check   exit 1 if the copy drifted
//
// Reads protocol/profiles/sis.json, runs buildReceipt() from protocol/conform.mjs
// (the same checker the sip-self-receipt workflow runs before it signs), and
// writes site/src/lib/generated/sis-receipt.json. The page imports that JSON, so
// the site never depends on paths outside site/ at runtime. Same committed-copy
// pattern as sync-explainer.mjs; --check is the drift gate CI runs.
//
// `checkedAt` is the only non-deterministic field, so --check ignores it.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const repoRoot = resolve(siteRoot, "..");

const PROFILE_PATH = "protocol/profiles/sis.json";
const REPO_URL = "https://github.com/frankxai/Starlight-Intelligence-System";

const src = join(repoRoot, ...PROFILE_PATH.split("/"));
const conformPath = join(repoRoot, "protocol", "conform.mjs");
const dstDir = join(siteRoot, "src", "lib", "generated");
const dst = join(dstDir, "sis-receipt.json");
const check = process.argv.includes("--check");

if (!existsSync(src) || !existsSync(conformPath)) {
  if (!check && existsSync(dst)) {
    console.log(`[sync-sis-receipt] source not reachable at ${src} — using committed copy at ${dst}`);
    process.exit(0);
  }
  console.error(`[sync-sis-receipt] source missing at ${src} (or checker at ${conformPath})`);
  process.exit(1);
}

const { buildReceipt } = await import(pathToFileURL(conformPath).href);

const raw = readFileSync(src); // bytes: the digest must equal sha256sum of the file
const profile = JSON.parse(raw.toString("utf8"));
const nodes = Array.isArray(profile.nodes) ? profile.nodes : [];
const edges = Array.isArray(profile.edges) ? profile.edges : [];
const byId = new Map(nodes.map((n) => [n.id, n]));

const receipt = buildReceipt({ profile, raw, checkedAt: new Date().toISOString() });

const claims = nodes
  .filter((n) => n.type === "Claim")
  .map((claim) => ({
    id: claim.id,
    label: claim.label ?? claim.id,
    statement: claim.body?.statement ?? null,
    sources: edges
      .filter((e) => e.type === "derivedFrom" && e.from === claim.id)
      .map((e) => byId.get(e.to))
      .filter(Boolean)
      .map((s) => ({
        id: s.id,
        label: s.label ?? s.id,
        locator: s.body?.locator ?? null,
        commit: s.body?.commit ?? null,
      })),
  }));

const attestationNode = nodes.find((n) => n.type === "Attestation");
const declaredBy = byId.get(profile.profile?.declaredBy);

const out = {
  _generated: `by site/scripts/sync-sis-receipt.mjs from ${PROFILE_PATH}; do not edit by hand`,
  source: {
    path: PROFILE_PATH,
    url: `${REPO_URL}/blob/main/${PROFILE_PATH}`,
    rawUrl: `https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/main/${PROFILE_PATH}`,
  },
  profile: {
    id: profile.profile?.id ?? null,
    subject: profile.profile?.subject ?? null,
    declaredBy: profile.profile?.declaredBy ?? null,
    declaredByLabel: declaredBy?.label ?? null,
  },
  attestation: attestationNode
    ? {
        statementType: attestationNode.body?.statementType ?? null,
        signatureRef: attestationNode.body?.signatureRef ?? null,
        signer: attestationNode.body?.signer ?? null,
      }
    : null,
  claims,
  receipt,
};

const next = `${JSON.stringify(out, null, 2)}\n`;

if (check) {
  if (!existsSync(dst)) {
    console.error(`[sync-sis-receipt] ${dst} is missing. Run: node site/scripts/sync-sis-receipt.mjs`);
    process.exit(1);
  }
  const strip = (o) => ({ ...o, receipt: { ...o.receipt, checkedAt: null } });
  const committed = strip(JSON.parse(readFileSync(dst, "utf8")));
  if (JSON.stringify(committed) !== JSON.stringify(strip(out))) {
    console.error(
      `[sync-sis-receipt] drift: ${dst} does not match a fresh receipt for ${PROFILE_PATH}.\n` +
        "Run: node site/scripts/sync-sis-receipt.mjs and commit the result."
    );
    process.exit(1);
  }
  console.log(`[sync-sis-receipt] in sync (sha256 ${receipt.profileSha256}, verdict ${receipt.verdict})`);
  process.exit(0);
}

if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true });
writeFileSync(dst, next);
console.log(`[sync-sis-receipt] ${PROFILE_PATH} -> ${dst} (verdict ${receipt.verdict})`);
