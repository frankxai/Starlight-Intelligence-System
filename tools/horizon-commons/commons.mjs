#!/usr/bin/env node
// Horizon Commons: turn Horizon vault material into a dataset release that carries
// only what can be proven. Every released record is consented by the person who
// owns the words, honestly attributed (human, co-authored, or agent-drafted), and
// clear of private data. Everything else is held back, with the reason.
//
//   node tools/horizon-commons/commons.mjs audit  [--consent <ledger.jsonl>] [--pairs <loop.jsonl>]
//   node tools/horizon-commons/commons.mjs build  --out <dir> [--released-at YYYY-MM-DD]
//                                                 [--consent <ledger.jsonl>] [--pairs <loop.jsonl>] [--key <ed25519.pem>]
//   node tools/horizon-commons/commons.mjs verify <dir> --pub <ed25519.pub>
//
// Exit 0 on success, 1 when nothing is releasable or verification fails, 2 on a
// usage or read error. Zero dependencies. Offline. Nothing is uploaded anywhere:
// publishing a release is a separate, human decision.
//
// Agents cannot grant consent. The consent ledger is written by the person who
// owns the words, and consent binds to the sha256 of the exact text: change the
// words and consent must be given again.

import { createHash, createPrivateKey, createPublicKey, sign as edSign, verify as edVerify } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PAYLOAD_TYPE, STATEMENT_TYPE, keyIdOf, pae } from "../../protocol/lib/dsse.mjs";

export const SCHEMA = "horizon-record/0.1";
export const RELEASE_SCHEMA = "horizon-commons-release/0.1";
// Proposed, not ratified: see docs/boards/2026-11-08-horizon-commons.md.
export const RELEASE_PREDICATE_TYPE = "https://starlightintelligence.org/protocol/dataset-release/v0.1.0-proposed";

// Open licenses a lab can train on. Non-commercial licenses are refused on purpose:
// a CC-BY-NC record cannot sit in a dataset meant for every lab.
export const LICENSES = new Map([
  ["CC-BY-4.0", "cc-by-4.0"],
  ["CC0-1.0", "cc0-1.0"],
  ["CDLA-Permissive-2.0", "cdla-permissive-2.0"],
]);

// Who wrote the words, from most to least human. agent-inferred is never released.
export const TIERS = [
  "human-authored",
  "human-agent-co-authored",
  "human-edited-agent-draft",
  "agent-drafted-human-approved",
  "agent-inferred",
];

// Agent, model, brand, and persona identities. A record attributed to one of these
// is not a person's words, whatever its tier field says. Lumina, Luminor and
// Horizon are system personas; Arcanea canon is CC-BY-NC and cannot enter an
// open-licensed release in any case.
const NON_PERSON = /\b(codex|claude|gpt-?\d*|chatgpt|openai|gemini|grok|antigravity|copilot|cursor|cline|jules|assistant|agent|bot|arcanea|lumina|luminor|horizon|starlight central command)\b/i;

// A legacy line that declares no tier. Its author field is a claim, not evidence;
// the owner attests the tier in the consent ledger line that releases it.
export const UNATTESTED = "unattested";

const PRIVACY_PATTERNS = [
  ["email address", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ["phone number", /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4}/],
  ["secret-like token", /\b(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|xox[abpr]-[A-Za-z0-9-]{10,})\b|-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["bank account number", /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/],
  ["private-memory reference", /starlight-private-memory|vaults\/(?:family|health|spiritual|second-brain)\b/i],
];

const PLACEHOLDER = /replace this example|template example|do not ship this line/i;
const MIN_CHARS = 40;

// ---------------------------------------------------------------------------
// Hashing

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined && value[k] !== null && value[k] !== "")
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** The record's identity: sha256 over its kind and words, nothing else. Consent binds to this. */
export function recordHash(kind, text) {
  return sha256(canonical({ kind, text }));
}

function makeRecord({ kind, text, horizon, language, tags, tier, fieldTiers, author, agents, source, createdAt, legacyId }) {
  const hash = recordHash(kind, text);
  return {
    id: `hzn_${hash.slice(0, 16)}`,
    schema: SCHEMA,
    kind,
    text,
    horizon: horizon || null,
    language: language || "en",
    tags: [...new Set((tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean))].sort(),
    provenance: {
      tier,
      ...(fieldTiers ? { fieldTiers } : {}),
      author: author || "unknown",
      agents: agents || [],
      source,
      ...(legacyId ? { legacyId } : {}),
    },
    createdAt: createdAt || null,
    sha256: hash,
  };
}

const agentsIn = (s) => [...new Set((String(s || "").match(new RegExp(NON_PERSON.source, "gi")) || []).map((a) => a.toLowerCase()))];
const isNonPerson = (s) => NON_PERSON.test(String(s || ""));

// ---------------------------------------------------------------------------
// Sources

/** Starlight Notes in memory/vaults/horizon-vault.md (### [YYYY-MM-DD] — Title). */
export function parseVaultMarkdown(markdown, source = "memory/vaults/horizon-vault.md") {
  const lines = markdown.split(/\r?\n/);
  const records = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inFence = !inFence;
    const head = !inFence && lines[i].match(/^### \[(\d{4}-\d{2}-\d{2})\] — (.+)$/);
    if (!head) continue;
    let j = i + 1;
    while (j < lines.length && !/^#{2,3} /.test(lines[j])) j++;
    const body = lines.slice(i + 1, j).join("\n").replace(/\n-{3,}\s*$/, "").trim();
    const field = (re) => (body.match(re)?.[1] ?? "").trim();
    const from = field(/\*\*From:\*\*\s*(.+)/);
    const hope = field(/\*\*The Hope:\*\*\s*([\s\S]*?)(?=\n\*\*The Reasoning:\*\*|\n\*\*Tags:\*\*|$)/);
    const reasoning = field(/\*\*The Reasoning:\*\*\s*([\s\S]*?)(?=\n\*\*Tags:\*\*|$)/);
    const agents = agentsIn(from);
    const humanNamed = from.replace(new RegExp(NON_PERSON.source, "gi"), "").replace(/[&,()\s]|and/gi, "").length > 0;
    // The vault template defines The Reasoning as AI-augmented, so a record with
    // reasoning is co-authored even when the hope is wholly human.
    const hopeTier = !humanNamed ? "agent-inferred" : agents.length ? "human-agent-co-authored" : "human-authored";
    const reasoningTier = reasoning ? (humanNamed ? "human-agent-co-authored" : "agent-inferred") : null;
    const tier = hopeTier === "agent-inferred" ? "agent-inferred" : reasoningTier ? "human-agent-co-authored" : hopeTier;
    records.push(
      makeRecord({
        kind: "horizon-entry",
        text: { title: head[2].trim(), hope, reasoning },
        horizon: field(/\*\*Horizon:\*\*\s*(.+)/),
        tags: field(/\*\*Tags:\*\*\s*(.+)/).split(","),
        tier,
        fieldTiers: reasoning ? { hope: hopeTier, reasoning: reasoningTier } : undefined,
        author: from,
        agents: [...new Set([...agents, ...(reasoning ? ["ai-augmented-reasoning"] : [])])],
        source: `${source}#L${i + 1}`,
        createdAt: head[1],
      }),
    );
    i = j - 1;
  }
  return records;
}

/** public-vault/horizon.jsonl lines ({ wish, meditation, implication, author, coAuthored, ... }). */
export function parsePublicVaultJsonl(jsonl, source = "public-vault/horizon.jsonl") {
  return jsonl.split(/\r?\n/).flatMap((line, i) => {
    if (!line.trim()) return [];
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      return [{ invalid: true, source: `${source}#L${i + 1}`, reason: "line is not JSON" }];
    }
    const author = row.author ?? "unknown";
    // Fail closed: an agent-attributed line with no declared review is agent-inferred;
    // any other line without a declared tier waits for the owner's attestation.
    const tier = row.provenance?.tier ?? (isNonPerson(author) && !row.coAuthored ? "agent-inferred" : UNATTESTED);
    return [
      makeRecord({
        kind: "horizon-wish",
        text: { hope: row.wish ?? "", reflection: row.meditation, implication: row.implication },
        horizon: row.horizon,
        language: row.language,
        tags: row.tags,
        tier,
        author,
        agents: agentsIn(author),
        source: `${source}#L${i + 1}`,
        createdAt: row.createdAt,
        legacyId: row.id,
      }),
    ];
  });
}

/**
 * Daily Starlight loop: an agent drafts, the person edits. The pair (agent draft,
 * human final) is a preference signal with a human rationale, the scarcest kind
 * of alignment data. Line: { prompt, draft, final, rationale?, author, agent, createdAt }.
 */
export function parseLoopJsonl(jsonl, source = "daily-loop.jsonl") {
  return jsonl.split(/\r?\n/).flatMap((line, i) => {
    if (!line.trim()) return [];
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      return [{ invalid: true, source: `${source}#L${i + 1}`, reason: "line is not JSON" }];
    }
    const record = makeRecord({
      kind: "preference-pair",
      text: { prompt: row.prompt ?? "", chosen: row.final ?? "", rejected: row.draft ?? "", rationale: row.rationale },
      horizon: row.horizon,
      language: row.language,
      tags: row.tags,
      tier: "human-edited-agent-draft",
      author: row.author,
      agents: row.agent ? [String(row.agent).toLowerCase()] : [],
      source: `${source}#L${i + 1}`,
      createdAt: row.createdAt,
    });
    record.pair = { editRatio: editRatio(row.draft ?? "", row.final ?? "") };
    return [record];
  });
}

/** 1 − token Jaccard similarity. 0 means the person changed nothing. */
export function editRatio(a, b) {
  const tok = (s) => new Set(String(s).toLowerCase().match(/[\p{L}\p{N}']+/gu) || []);
  const A = tok(a);
  const B = tok(b);
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return Number((1 - inter / (A.size + B.size - inter)).toFixed(4));
}

/** Consent ledger (JSONL). Later lines override earlier ones, so release:false revokes. */
export function loadConsent(jsonl) {
  const ledger = new Map();
  for (const line of jsonl.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (/^[0-9a-f]{64}$/.test(row.sha256 ?? "")) ledger.set(row.sha256, row);
  }
  return ledger;
}

// ---------------------------------------------------------------------------
// Gates

const textOf = (r) => Object.values(r.text || {}).filter((v) => typeof v === "string").join("\n");

const effectiveTier = (record, c) => (c?.release === true && TIERS.includes(c.tier) ? c.tier : record.provenance.tier);

export function gate(record, consent, seen) {
  const reasons = [];
  if (record.invalid) return [`G0-format: ${record.reason}`];

  // G1 consent: the person who owns the words said yes, under an open license.
  const c = consent.get(record.sha256);
  if (!c || c.release !== true) reasons.push("G1-consent: no release consent on file for this exact text");
  else if (!LICENSES.has(c.license)) reasons.push(`G1-consent: license ${JSON.stringify(c.license)} is not open for training (allowed: ${[...LICENSES.keys()].join(", ")})`);

  // G2 provenance: say honestly who wrote it. The owner's ledger line may attest the tier.
  const tier = effectiveTier(record, c);
  const author = c?.attribution ?? record.provenance.author;
  if (tier === UNATTESTED) reasons.push("G2-provenance: authorship unattested; the owner confirms the tier when granting consent");
  else if (!TIERS.includes(tier)) reasons.push(`G2-provenance: unknown tier ${JSON.stringify(tier)}`);
  else if (tier === "agent-inferred") reasons.push("G2-provenance: agent-inferred text with no human review is never released");
  else if (tier === "human-authored" && isNonPerson(author)) reasons.push(`G2-provenance: tier claims human authorship but author ${JSON.stringify(author)} is an agent or brand`);

  // G3 privacy: nothing that identifies or exposes a person or a secret.
  const body = textOf(record);
  for (const [label, re] of PRIVACY_PATTERNS) if (re.test(body)) reasons.push(`G3-privacy: contains a ${label}`);

  // G4 placeholder: template lines are not anyone's hope.
  if (PLACEHOLDER.test(body) || /\bexample\b/i.test(record.provenance.legacyId ?? "")) reasons.push("G4-placeholder: template or example text");

  // G5 duplicate.
  if (seen.has(record.sha256)) reasons.push(`G5-duplicate: same text as ${seen.get(record.sha256)}`);

  // G6 substance.
  if (body.replace(/\s+/g, " ").trim().length < MIN_CHARS) reasons.push(`G6-substance: under ${MIN_CHARS} characters`);

  // G7 pairs: a preference pair needs a real human edit.
  if (record.kind === "preference-pair") {
    if (!record.text.chosen.trim() || !record.text.rejected.trim()) reasons.push("G7-pair: draft and final are both required");
    else if (record.text.chosen.replace(/\s+/g, " ").trim() === record.text.rejected.replace(/\s+/g, " ").trim()) {
      reasons.push("G7-pair: approved unchanged, so it carries no preference signal");
    }
  }
  return reasons;
}

/** Run every record through the gates. Returns { released, held, ready }. */
export function evaluate(records, consent = new Map()) {
  const seen = new Map();
  const released = [];
  const held = [];
  for (const record of records) {
    const reasons = gate(record, consent, seen);
    if (!record.invalid && !seen.has(record.sha256)) seen.set(record.sha256, record.id);
    if (reasons.length) {
      held.push({ id: record.id ?? null, source: record.source ?? record.provenance?.source, sha256: record.sha256 ?? null, tier: record.provenance?.tier ?? null, reasons });
      continue;
    }
    const c = consent.get(record.sha256);
    const tier = effectiveTier(record, c);
    released.push({
      ...record,
      provenance: {
        ...record.provenance,
        tier,
        author: c.attribution ?? record.provenance.author,
        ...(tier !== record.provenance.tier ? { attestedBy: c.grantedBy ?? null } : {}),
      },
      consent: { license: c.license, grantedBy: c.grantedBy ?? null, grantedAt: c.grantedAt ?? null, evidence: c.evidence ?? null },
    });
  }
  released.sort((a, b) => a.id.localeCompare(b.id));
  // Held only for want of the owner's decision (consent, and attestation where unattested).
  const ownerOnly = (r) => r.startsWith("G1-consent: no release") || r.startsWith("G2-provenance: authorship unattested");
  const ready = held.filter((h) => h.reasons.every(ownerOnly));
  return { released, held, ready };
}

// ---------------------------------------------------------------------------
// Release

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const countBy = (items, key) => items.reduce((acc, x) => ((acc[key(x)] = (acc[key(x)] ?? 0) + 1), acc), {});

function sizeCategory(n) {
  if (n < 1000) return "n<1K";
  if (n < 10000) return "1K<n<10K";
  if (n < 100000) return "10K<n<100K";
  return "100K<n<1M";
}

export function datasetCard(released, { releasedAt }) {
  const licenses = [...new Set(released.map((r) => r.consent.license))].sort();
  const hfLicense = licenses.length === 1 ? LICENSES.get(licenses[0]) : "other";
  const languages = [...new Set(released.map((r) => r.language))].sort();
  const tiers = countBy(released, (r) => r.provenance.tier);
  const kinds = countBy(released, (r) => r.kind);
  const table = (obj) => Object.entries(obj).sort().map(([k, v]) => `| ${k} | ${v} |`).join("\n");
  return `---
license: ${hfLicense}
language:
${languages.map((l) => `- ${l}`).join("\n")}
pretty_name: Horizon Commons
size_categories:
- ${sizeCategory(released.length)}
task_categories:
- text-generation
tags:
- alignment
- values
- provenance
- consent
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train.jsonl
---

# Horizon Commons

Hopes for the future of intelligence, written by people, with the provenance of
every word on the record. Release ${releasedAt}: ${plural(released.length, "record")}.

## What makes a record eligible

Each record passed seven gates. The owner of the words consented to this exact
text under an open license (G1); the record says honestly who wrote it (G2); it
holds no personal data, secrets, or private-memory references (G3); it is not
template text (G4), not a duplicate (G5), long enough to mean something (G6),
and, for preference pairs, the person actually changed the agent's draft (G7).
Agent-inferred text with no human review is never released.

## Who wrote the words

| Provenance tier | Records |
|---|---|
${table(tiers)}

\`human-agent-co-authored\` records carry \`provenance.fieldTiers\` where the
source separates a human hope from AI-augmented reasoning. Filter on
\`provenance.tier\` to train on human-authored text only.

| Kind | Records |
|---|---|
${table(kinds)}

## Consent and licensing

Licenses in this release: ${licenses.join(", ")}. Consent binds to the sha256 of
each record's text (\`sha256\`). A revoked record is dropped from the next
release; copies of earlier releases cannot be recalled.

## Limitations

- Small and young. Treat it as a values reference and an eval seed, not a
  pretraining corpus.
- Not representative. Contributors are early Starlight builders, mostly writing
  in ${languages.join(", ")}.
- Values-laden by design. The records state hopes; they do not establish facts.

## Verification

\`manifest.json\` lists the sha256 of every file. When \`manifest.dsse.json\` is
present it is a DSSE envelope (Ed25519, in-toto Statement v1) over those
digests; verify it with
\`node tools/horizon-commons/commons.mjs verify <dir> --pub <key.pub>\` from the
Starlight Intelligence System repository.

Built on SIP. Layers used: file-contract, attestation, sovereignty.
`;
}

export function buildRelease({ released, held }, { outDir, releasedAt, keyPem }) {
  if (released.length === 0) throw new Error("nothing is releasable; run audit to see why");
  const files = new Map();
  files.set("data/train.jsonl", released.map((r) => JSON.stringify(r)).join("\n") + "\n");
  files.set("README.md", datasetCard(released, { releasedAt }));
  files.set(
    "audit.json",
    JSON.stringify(
      {
        released: released.length,
        held: held.length,
        heldByGate: countBy(held.flatMap((h) => h.reasons.map((r) => r.split(":")[0])), (g) => g),
      },
      null,
      2,
    ) + "\n",
  );
  const digests = [...files.entries()].map(([path, body]) => ({ path, sha256: sha256(Buffer.from(body, "utf8")) }));
  const manifest = { schema: RELEASE_SCHEMA, recordSchema: SCHEMA, releasedAt, records: released.length, files: digests };
  files.set("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

  if (keyPem) {
    const privateKey = createPrivateKey(keyPem);
    if (privateKey.asymmetricKeyType !== "ed25519") throw new Error("signing key must be Ed25519");
    const statement = {
      _type: STATEMENT_TYPE,
      subject: digests.map((d) => ({ name: d.path, digest: { sha256: d.sha256 } })),
      predicateType: RELEASE_PREDICATE_TYPE,
      predicate: manifest,
    };
    const payload = Buffer.from(JSON.stringify(statement), "utf8");
    const envelope = {
      payloadType: PAYLOAD_TYPE,
      payload: payload.toString("base64"),
      signatures: [{ keyid: keyIdOf(createPublicKey(privateKey)), sig: edSign(null, pae(PAYLOAD_TYPE, payload), privateKey).toString("base64") }],
    };
    files.set("manifest.dsse.json", JSON.stringify(envelope, null, 2) + "\n");
  }

  for (const [path, body] of files) {
    const target = join(outDir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
  return { manifest, files: [...files.keys()] };
}

/** Check a release directory: signature over the statement, and every subject digest against the bytes on disk. */
export function verifyRelease(dir, publicKeyPem) {
  const fail = (reason) => ({ ok: false, reason });
  const envPath = join(dir, "manifest.dsse.json");
  if (!existsSync(envPath)) return fail("release is unsigned (no manifest.dsse.json)");
  const envelope = JSON.parse(readFileSync(envPath, "utf8"));
  if (envelope.payloadType !== PAYLOAD_TYPE) return fail("unexpected payloadType");
  const key = createPublicKey(publicKeyPem);
  const payload = Buffer.from(envelope.payload, "base64");
  const signed = (envelope.signatures || []).some((s) => {
    try {
      return edVerify(null, pae(PAYLOAD_TYPE, payload), key, Buffer.from(String(s.sig), "base64"));
    } catch {
      return false;
    }
  });
  if (!signed) return fail("no signature verifies against the supplied key");
  const statement = JSON.parse(payload.toString("utf8"));
  if (statement._type !== STATEMENT_TYPE || statement.predicateType !== RELEASE_PREDICATE_TYPE) return fail("statement is not a Horizon Commons release");
  for (const s of statement.subject) {
    const path = join(dir, s.name);
    if (!existsSync(path)) return fail(`${s.name} is missing`);
    if (sha256(readFileSync(path)) !== s.digest.sha256) return fail(`${s.name} does not match its signed digest`);
  }
  return { ok: true, keyid: keyIdOf(key), records: statement.predicate.records };
}

// ---------------------------------------------------------------------------
// CLI

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadSources({ root = REPO, pairs } = {}) {
  const records = [];
  const md = join(root, "memory/vaults/horizon-vault.md");
  const jsonl = join(root, "public-vault/horizon.jsonl");
  if (existsSync(md)) records.push(...parseVaultMarkdown(readFileSync(md, "utf8")));
  if (existsSync(jsonl)) records.push(...parsePublicVaultJsonl(readFileSync(jsonl, "utf8")));
  if (pairs) records.push(...parseLoopJsonl(readFileSync(pairs, "utf8"), pairs));
  return records;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") || argv[i + 1] === undefined ? true : argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

const USAGE = `horizon-commons: consent-gated, provenance-honest dataset releases from the Horizon vault

  audit  [--consent <ledger.jsonl>] [--pairs <loop.jsonl>]
  build  --out <dir> [--released-at YYYY-MM-DD] [--consent ...] [--pairs ...] [--key <ed25519.pem>]
  verify <dir> --pub <ed25519.pub>`;

export function main(argv) {
  const args = parseArgs(argv);
  const [cmd] = args._;
  try {
    if (cmd === "verify") {
      if (!args._[1] || typeof args.pub !== "string") return console.error(USAGE), 2;
      const result = verifyRelease(resolve(args._[1]), readFileSync(args.pub, "utf8"));
      console.log(result.ok ? `VERIFIED  ${plural(result.records, "record")}  key ${result.keyid.slice(0, 16)}…` : `FAILED  ${result.reason}`);
      return result.ok ? 0 : 1;
    }
    if (cmd !== "audit" && cmd !== "build") return console.error(USAGE), 2;
    const consent = typeof args.consent === "string" ? loadConsent(readFileSync(args.consent, "utf8")) : new Map();
    const result = evaluate(loadSources({ pairs: typeof args.pairs === "string" ? args.pairs : undefined }), consent);

    if (cmd === "audit") {
      for (const r of result.released) console.log(`PASS  ${r.id}  ${r.provenance.tier.padEnd(28)} ${r.provenance.source}`);
      for (const h of result.held) {
        console.log(`HOLD  ${h.id ?? "-"}  ${(h.tier ?? "-").padEnd(28)} ${h.source}`);
        for (const reason of h.reasons) console.log(`        ${reason}`);
      }
      console.log(`\n${result.released.length} releasable, ${result.held.length} held, ${result.ready.length} waiting only on the owner's consent.`);
      if (result.ready.length) {
        console.log("Ready for a consent decision (append to your ledger if you agree):");
        for (const h of result.ready) console.log(`  ${h.sha256}  ${h.source}`);
      }
      return 0;
    }

    if (typeof args.out !== "string") return console.error(USAGE), 2;
    const releasedAt = typeof args["released-at"] === "string" ? args["released-at"] : new Date().toISOString().slice(0, 10);
    const keyPem = typeof args.key === "string" ? readFileSync(args.key, "utf8") : undefined;
    const { files } = buildRelease(result, { outDir: resolve(args.out), releasedAt, keyPem });
    console.log(`Built ${plural(result.released.length, "record")} into ${resolve(args.out)}: ${files.join(", ")}`);
    return 0;
  } catch (err) {
    console.error(`horizon-commons: ${err.message}`);
    return err.message.startsWith("nothing is releasable") ? 1 : 2;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exit(main(process.argv.slice(2)));
