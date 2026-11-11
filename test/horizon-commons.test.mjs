// Horizon Commons: release gates, consent binding, and signed-release verification.
//   node --test test/horizon-commons.test.mjs

import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  buildRelease,
  editRatio,
  evaluate,
  loadConsent,
  loadSources,
  parseLoopJsonl,
  parsePublicVaultJsonl,
  parseVaultMarkdown,
  verifyRelease,
} from "../tools/horizon-commons/commons.mjs";

const HOPE = "That every person who works with an intelligence system leaves more capable than they arrived.";

const row = (fields) => JSON.stringify({ wish: HOPE, author: "frank", tags: ["agency"], createdAt: "2026-11-01T00:00:00Z", ...fields });
const consentFor = (records, extra = {}) =>
  loadConsent(records.map((r) => JSON.stringify({ sha256: r.sha256, release: true, license: "CC-BY-4.0", grantedBy: "frank", grantedAt: "2026-11-08", tier: "human-authored", ...extra })).join("\n"));
const reasonsOf = (result) => result.held.flatMap((h) => h.reasons);

test("nothing is released without consent from the owner", () => {
  const records = parsePublicVaultJsonl(row({ provenance: { tier: "human-authored" } }));
  const result = evaluate(records);
  assert.equal(result.released.length, 0);
  assert.match(reasonsOf(result)[0], /^G1-consent/);
  assert.equal(result.ready.length, 1, "a record held only for consent is ready for the owner's decision");
});

test("consent binds to the exact words: edited text needs consent again", () => {
  const original = parsePublicVaultJsonl(row({ provenance: { tier: "human-authored" } }));
  const consent = consentFor(original);
  assert.equal(evaluate(original, consent).released.length, 1);
  const edited = parsePublicVaultJsonl(row({ wish: `${HOPE} Edited.`, provenance: { tier: "human-authored" } }));
  assert.equal(evaluate(edited, consent).released.length, 0);
});

test("a later ledger line revokes consent", () => {
  const records = parsePublicVaultJsonl(row({ provenance: { tier: "human-authored" } }));
  const grant = JSON.stringify({ sha256: records[0].sha256, release: true, license: "CC-BY-4.0" });
  const revoke = JSON.stringify({ sha256: records[0].sha256, release: false });
  assert.equal(evaluate(records, loadConsent(`${grant}\n${revoke}`)).released.length, 0);
});

test("non-commercial licenses are refused", () => {
  const records = parsePublicVaultJsonl(row({ provenance: { tier: "human-authored" } }));
  const result = evaluate(records, consentFor(records, { license: "CC-BY-NC-4.0" }));
  assert.equal(result.released.length, 0);
  assert.match(reasonsOf(result).join(), /not open for training/);
});

test("agent and persona authors are never released as human, even with consent", () => {
  for (const author of ["Codex", "Arcanea", "Lumina", "Horizon", "claude"]) {
    const records = parsePublicVaultJsonl(row({ author }));
    assert.equal(records[0].provenance.tier, "agent-inferred", author);
    const result = evaluate(records, consentFor(records, { tier: undefined }));
    assert.equal(result.released.length, 0, author);
  }
  const lying = parsePublicVaultJsonl(row({ author: "Codex", provenance: { tier: "human-authored" } }));
  assert.match(reasonsOf(evaluate(lying, consentFor(lying, { tier: undefined }))).join(), /claims human authorship/);
});

test("legacy lines without a declared tier wait for the owner's attestation", () => {
  const records = parsePublicVaultJsonl(row({}));
  assert.equal(records[0].provenance.tier, "unattested");
  assert.equal(evaluate(records, consentFor(records, { tier: undefined })).released.length, 0);
  const released = evaluate(records, consentFor(records)).released;
  assert.equal(released.length, 1);
  assert.equal(released[0].provenance.tier, "human-authored");
  assert.equal(released[0].provenance.attestedBy, "frank");
});

test("private data, secrets, and template text are held", () => {
  const cases = [
    ["reach me at frank@example.org about this hope for the future", /email/],
    ["call +31 6 1234 5678 any time to talk about intelligence and care", /phone/],
    ["the key sk-abcdefghijklmnopqrstuvwx should stay hidden from everyone", /secret/],
    ["see starlight-private-memory for the long version of this hope", /private-memory/],
    ["Replace this example before you publish. Write a letter to the future.", /G4-placeholder/],
    ["hope", /G6-substance/],
  ];
  for (const [wish, expected] of cases) {
    const records = parsePublicVaultJsonl(row({ wish, provenance: { tier: "human-authored" } }));
    const result = evaluate(records, consentFor(records));
    assert.equal(result.released.length, 0, wish);
    assert.match(reasonsOf(result).join(), expected, wish);
  }
});

test("dates are not mistaken for phone numbers", () => {
  const records = parsePublicVaultJsonl(row({ wish: `${HOPE} Written 2026-11-08, revisited 2027-01-01.`, provenance: { tier: "human-authored" } }));
  assert.equal(evaluate(records, consentFor(records)).released.length, 1);
});

test("duplicates are released once", () => {
  const records = parsePublicVaultJsonl(`${row({ provenance: { tier: "human-authored" } })}\n${row({ provenance: { tier: "human-authored" } })}`);
  const result = evaluate(records, consentFor(records));
  assert.equal(result.released.length, 1);
  assert.match(reasonsOf(result).join(), /G5-duplicate/);
});

test("vault markdown separates the human hope from AI-augmented reasoning", () => {
  const md = [
    "## Entries",
    "",
    "```markdown",
    "### [YYYY-MM-DD] — {Title}",
    "```",
    "",
    "### [2026-02-10] — The First Entry",
    "",
    "**From:** FrankX",
    "**Horizon:** For whoever reads this",
    "",
    "**The Hope:**",
    "",
    HOPE,
    "",
    "**The Reasoning:**",
    "",
    "Systems optimize for what they measure, so measure whether people grow.",
    "",
    "**Tags:** alignment, care",
    "",
    "---",
    "",
    "## How to Contribute",
  ].join("\n");
  const [record, ...rest] = parseVaultMarkdown(md);
  assert.equal(rest.length, 0, "the template heading inside a code fence is not an entry");
  assert.equal(record.text.hope, HOPE);
  assert.equal(record.provenance.tier, "human-agent-co-authored");
  assert.deepEqual(record.provenance.fieldTiers, { hope: "human-authored", reasoning: "human-agent-co-authored" });
  assert.deepEqual(record.tags, ["alignment", "care"]);
});

test("the daily loop turns a human edit of an agent draft into a preference pair", () => {
  const loop = [
    { prompt: "Write tonight's Starlight Note", draft: "AI will make everything better for everyone.", final: "I hope the tools we build tonight teach my daughter to build her own.", rationale: "Specific beats generic.", author: "frank", agent: "claude", createdAt: "2026-11-08" },
    { prompt: "Write tonight's Starlight Note", draft: "Same words kept as they were.", final: "Same words kept as they were.", author: "frank", agent: "claude" },
  ].map((x) => JSON.stringify(x)).join("\n");
  const records = parseLoopJsonl(loop);
  const result = evaluate(records, consentFor(records, { tier: undefined }));
  assert.equal(result.released.length, 1);
  const [pair] = result.released;
  assert.equal(pair.kind, "preference-pair");
  assert.equal(pair.provenance.tier, "human-edited-agent-draft");
  assert.ok(pair.pair.editRatio > 0.5);
  assert.match(reasonsOf(result).join(), /approved unchanged/);
  assert.equal(editRatio("a b c", "a b c"), 0);
});

test("a built release is signed, verifiable, and tamper-evident", () => {
  const dir = mkdtempSync(join(tmpdir(), "horizon-commons-"));
  try {
    const records = parsePublicVaultJsonl(row({ provenance: { tier: "human-authored" } }));
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const keyPem = privateKey.export({ type: "pkcs8", format: "pem" });
    const pubPem = publicKey.export({ type: "spki", format: "pem" });
    buildRelease(evaluate(records, consentFor(records)), { outDir: dir, releasedAt: "2026-11-08", keyPem });

    const lines = readFileSync(join(dir, "data/train.jsonl"), "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    assert.equal(JSON.parse(lines[0]).consent.license, "CC-BY-4.0");
    const card = readFileSync(join(dir, "README.md"), "utf8");
    assert.match(card, /^---\nlicense: cc-by-4\.0\n/);
    assert.match(card, /path: data\/train\.jsonl/);

    assert.equal(verifyRelease(dir, pubPem).ok, true);
    const other = generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" });
    assert.equal(verifyRelease(dir, other).ok, false);
    writeFileSync(join(dir, "data/train.jsonl"), `${lines[0]}\n${lines[0]}\n`);
    assert.match(verifyRelease(dir, pubPem).reason, /does not match its signed digest/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an empty release is refused", () => {
  assert.throws(() => buildRelease({ released: [], held: [] }, { outDir: tmpdir(), releasedAt: "2026-11-08" }), /nothing is releasable/);
});

test("the repository's own Horizon material releases nothing until its owner consents", () => {
  const result = evaluate(loadSources());
  assert.ok(result.held.length > 0, "the vault sources are readable");
  assert.equal(result.released.length, 0);
  for (const h of result.held) assert.ok(h.tier, `${h.source} declares or infers a tier`);
});
