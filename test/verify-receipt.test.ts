/**
 * Run receipt standalone verifier CLI tests (src/verify-receipt.ts)
 *
 * Each planted-fault fixture under test/fixtures/run-receipt/ is signed correctly by the trusted
 * test key (see tools/gen-run-receipt-fixtures.mjs), so the verifier has to reject it for the
 * reason under test. Every rejection asserts the exit code AND the reported reason.
 */

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPublicKey } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAYLOAD_TYPE, keyIdOf, verifyRunReceipt } from "../src/run-receipt.js";
import { MAX_INPUT_BYTES, isStrictBase64, runVerifyReceipt } from "../src/verify-receipt.js";

const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const FIXTURES_DIR = join(REPO_ROOT, "test", "fixtures", "run-receipt");
const PUBKEY = join(FIXTURES_DIR, "pubkey.pem");
const OTHER_PUBKEY = join(FIXTURES_DIR, "other-pubkey.pem");
const fixture = (name: string) => join(FIXTURES_DIR, `${name}.envelope.json`);

let out: string[] = [];
const realLog = console.log;
const realError = console.error;
beforeEach(() => {
  out = [];
  console.log = (...a: unknown[]) => void out.push(a.join(" "));
  console.error = (...a: unknown[]) => void out.push(a.join(" "));
});
afterEach(() => {
  console.log = realLog;
  console.error = realError;
});

const text = () => out.join("\n");

function rejects(name: string, reason: RegExp, keys: string[] = [PUBKEY]) {
  const code = runVerifyReceipt([fixture(name), ...keys.flatMap((k) => ["--public-key", k])]);
  assert.equal(code, 1, `${name} must exit 1, got ${code}: ${text()}`);
  assert.match(text(), /^FAIL/m);
  assert.match(text(), reason, `${name} was rejected, but not for the intended reason:\n${text()}`);
  assert.doesNotMatch(text(), /^PASS/m);
}

describe("verify-receipt: valid receipt", () => {
  it("ACCEPTS the valid fixture and says what it did not check", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", PUBKEY]), 0);
    assert.match(text(), /^PASS/m);
    assert.match(text(), /Not checked: .*maker.*checker/);
  });

  it("accepts when the right key is one of several trusted keys", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", OTHER_PUBKEY, "--public-key", PUBKEY]), 0);
  });
});

describe("verify-receipt: planted faults are REJECTED for the intended reason", () => {
  it("tampered subject digest", () => rejects("tampered-subject-digest", /subject digest does not match/));
  it("wrong signing key", () => rejects("wrong-signing-key", /not a trusted key/));
  it("payload edited after signing", () => rejects("payload-edited-after-signing", /does not verify/));
  it("PASS verdict with a failed stage", () => rejects("pass-verdict-with-failed-stage", /verdict is PASS but stage synthesize failed/));
  it("totals.costEur below the stage sum", () => rejects("totals-cost-below-stage-sum", /totals\.costEur .* below the stage sum/));
  it("human decision without approvalRef", () => rejects("human-decision-without-approval-ref", /decidedBy human has no proof/));
  it("endedAt before startedAt", () => rejects("ended-at-before-started-at", /run\.endedAt is before run\.startedAt/));
  it("evidence entry missing sha256", () => rejects("evidence-missing-sha256", /has no sha256/));

  it("a valid receipt is rejected when only the wrong key is trusted", () => {
    rejects("valid", /not a trusted key|does not verify/, [OTHER_PUBKEY]);
  });
});

describe("verify-receipt: cannot be fooled into exit 0 by broken input", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "verify-receipt-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const file = (name: string, body: string) => {
    const p = join(dir, name);
    writeFileSync(p, body);
    return p;
  };

  it("empty envelope file exits 2", () => {
    assert.equal(runVerifyReceipt([file("empty.json", ""), "--public-key", PUBKEY]), 2);
  });

  it("truncated envelope file exits 2", () => {
    const whole = readFileSync(fixture("valid"), "utf8");
    assert.equal(runVerifyReceipt([file("cut.json", whole.slice(0, whole.length >> 1)), "--public-key", PUBKEY]), 2);
  });

  for (const body of ["{}", "null", "[]", "42", '"text"', '{"payloadType":"x","payload":"","signatures":[]}']) {
    it(`structurally wrong JSON ${body} exits 1`, () => {
      assert.equal(runVerifyReceipt([file("bad.json", body), "--public-key", PUBKEY]), 1);
      assert.match(text(), /^FAIL/m);
    });
  }

  it("envelope with its signatures removed exits 1", () => {
    const env = JSON.parse(readFileSync(fixture("valid"), "utf8"));
    env.signatures = [];
    assert.equal(runVerifyReceipt([file("nosig.json", JSON.stringify(env)), "--public-key", PUBKEY]), 1);
    assert.match(text(), /no signatures/);
  });

  it("empty public key file exits 1 and names the key as unusable", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", file("empty.pem", "")]), 1);
    assert.match(text(), /trusted key is unusable/);
  });

  it("garbage public key file exits 1", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", file("junk.pem", "not a key")]), 1);
    assert.match(text(), /trusted key is unusable/);
  });
});

describe("verify-receipt: argument and file errors exit 2", () => {
  it("missing envelope file", () => {
    assert.equal(runVerifyReceipt(["non-existent-file.json", "--public-key", PUBKEY]), 2);
  });
  it("missing public key file", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", "non-existent-key.pem"]), 2);
  });
  it("no arguments", () => {
    assert.equal(runVerifyReceipt([]), 2);
  });
  it("no public key", () => {
    assert.equal(runVerifyReceipt([fixture("valid")]), 2);
  });
  it("two envelopes at once", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), fixture("valid"), "--public-key", PUBKEY]), 2);
  });
  it("unknown flag", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", PUBKEY, "--write"]), 2);
  });
  it("--public-key with no value", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key"]), 2);
  });
});

describe("verify-receipt: --help", () => {
  it("alone prints usage and exits 0", () => {
    assert.equal(runVerifyReceipt(["--help"]), 0);
    assert.match(text(), /Usage: verify-receipt/);
    assert.doesNotMatch(text(), /^PASS/m);
  });
  it("-h alone exits 0", () => {
    assert.equal(runVerifyReceipt(["-h"]), 0);
  });
  it("with a missing envelope file exits 2, not 0", () => {
    assert.equal(runVerifyReceipt(["--help", "non-existent-file.json", "--public-key", PUBKEY]), 2);
  });
  it("with two envelopes exits 2", () => {
    assert.equal(runVerifyReceipt(["--help", fixture("valid"), fixture("valid")]), 2);
  });
  it("with a valid receipt and key exits 2, so help can never read as verified", () => {
    assert.equal(runVerifyReceipt(["--help", fixture("valid"), "--public-key", PUBKEY]), 2);
    assert.doesNotMatch(text(), /^PASS/m);
  });
  it("with only a key flag exits 2", () => {
    assert.equal(runVerifyReceipt(["--help", "--public-key", PUBKEY]), 2);
  });
  for (const args of [["--help", "--help"], ["-hh"], ["--help", "--"], ["-h", "--help"], ["-h", "-h"], ["--help", "--"], ["--", "--help"]]) {
    it(`${JSON.stringify(args)} exits 2: only the exact argument list ["--help"] or ["-h"] is help`, () => {
      assert.equal(runVerifyReceipt(args), 2);
    });
  }
});

describe("verify-receipt: through the real starlight CLI (subprocess)", () => {
  const cli = (args: string[]) =>
    spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", "verify-receipt", ...args], { cwd: REPO_ROOT, encoding: "utf8", timeout: 120_000 });

  it("verify-receipt --help exits 0", () => {
    const r = cli(["--help"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Usage: verify-receipt/);
  });
  it("verify-receipt <missing file> --help exits 2, not 0 (the parent help handler does not run first)", () => {
    const r = cli(["definitely-missing.json", "--help"]);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /Usage: starlight|Commands:/);
  });
  it("verify-receipt --write --help exits 2", () => {
    const r = cli(["--write", "--help"]);
    assert.equal(r.status, 2, r.stdout + r.stderr);
  });
  it("verify-receipt verifies a valid receipt and rejects a tampered one with the right exit codes", () => {
    assert.equal(cli([fixture("valid"), "--public-key", PUBKEY]).status, 0);
    const bad = cli([fixture("tampered-subject-digest"), "--public-key", PUBKEY]);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /subject digest does not match/);
  });
});

describe("verify-receipt: bad entries in signatures", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "verify-receipt-sigs-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  /** The valid envelope with an extra entry appended after the genuine signature. */
  const withExtraEntry = (entry: unknown) => {
    const env = JSON.parse(readFileSync(fixture("valid"), "utf8"));
    env.signatures.push(entry);
    const p = join(dir, "env.json");
    writeFileSync(p, JSON.stringify(env));
    return p;
  };
  const validSig = () => JSON.parse(readFileSync(fixture("valid"), "utf8")).signatures[0];

  it("sanity: the genuine signature alone passes", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", PUBKEY]), 0);
  });
  for (const [label, entry, reason] of [
    ["null", null, /signature 1 is not an object/],
    ["a number", 7, /signature 1 is not an object/],
    ["a string", "sig", /signature 1 is not an object/],
    ["an array", [], /signature 1 is not an object/],
  ] as Array<[string, unknown, RegExp]>) {
    it(`${label} next to a valid signature is rejected with exit 1`, () => {
      assert.equal(runVerifyReceipt([withExtraEntry(entry), "--public-key", PUBKEY]), 1);
      assert.match(text(), reason);
      assert.doesNotMatch(text(), /^PASS/m);
    });
  }
  it("a numeric keyid next to a valid signature is rejected with exit 1", () => {
    assert.equal(runVerifyReceipt([withExtraEntry({ keyid: 5, sig: validSig().sig }), "--public-key", PUBKEY]), 1);
    assert.match(text(), /signature 1 keyid is not a string/);
  });
  it("a missing keyid next to a valid signature is rejected with exit 1", () => {
    assert.equal(runVerifyReceipt([withExtraEntry({ sig: validSig().sig }), "--public-key", PUBKEY]), 1);
    assert.match(text(), /signature 1 keyid is not a string/);
  });
});

describe("verify-receipt: non-regular files", () => {
  it("a directory is refused with exit 2", () => {
    const dir = mkdtempSync(join(tmpdir(), "verify-receipt-dir-"));
    try {
      assert.equal(runVerifyReceipt([dir, "--public-key", PUBKEY]), 2);
      assert.match(text(), /not a regular file/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
  it("an endless device is refused without being read (POSIX only)", { skip: process.platform === "win32" }, () => {
    assert.equal(runVerifyReceipt(["/dev/zero", "--public-key", PUBKEY]), 2);
    assert.match(text(), /not a regular file/);
  });
  it("a public key that is a directory is refused with exit 2", () => {
    const dir = mkdtempSync(join(tmpdir(), "verify-receipt-keydir-"));
    try {
      assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", dir]), 2);
      assert.match(text(), /not a regular file/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("verify-receipt: size limit", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "verify-receipt-size-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  /** The valid envelope followed by spaces so the file is exactly `bytes` long. */
  const paddedEnvelope = (bytes: number) => {
    const body = readFileSync(fixture("valid"), "utf8").trimEnd();
    const p = join(dir, `env-${bytes}.json`);
    writeFileSync(p, body + " ".repeat(bytes - Buffer.byteLength(body)));
    return p;
  };
  const paddedKey = (bytes: number) => {
    const pem = readFileSync(PUBKEY, "utf8");
    const p = join(dir, `key-${bytes}.pem`);
    writeFileSync(p, pem + " ".repeat(bytes - Buffer.byteLength(pem)));
    return p;
  };

  it("an envelope exactly at the limit is still verified", () => {
    assert.equal(runVerifyReceipt([paddedEnvelope(MAX_INPUT_BYTES), "--public-key", PUBKEY]), 0);
  });
  it("an envelope one byte over the limit exits 2 with a size message", () => {
    assert.equal(runVerifyReceipt([paddedEnvelope(MAX_INPUT_BYTES + 1), "--public-key", PUBKEY]), 2);
    assert.match(text(), /over the 1048576 byte limit/);
  });
  it("a public key file just under the limit is still read and verifies", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", paddedKey(MAX_INPUT_BYTES - 1)]), 0);
  });
  it("a public key file one byte over the limit exits 2 with a size message", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", paddedKey(MAX_INPUT_BYTES + 1)]), 2);
    assert.match(text(), /over the 1048576 byte limit/);
  });
  it("a directory is not read", () => {
    assert.equal(runVerifyReceipt([dir, "--public-key", PUBKEY]), 2);
    assert.match(text(), /not a regular file/);
  });
});

describe("verify-receipt: strict encodings", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "verify-receipt-enc-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  const envelopeFile = (edit: (env: any) => void) => {
    const env = JSON.parse(readFileSync(fixture("valid"), "utf8"));
    edit(env);
    const p = join(dir, "env.json");
    writeFileSync(p, JSON.stringify(env));
    return p;
  };

  it("sanity: an unmodified copy of the valid envelope passes", () => {
    assert.equal(runVerifyReceipt([envelopeFile(() => {}), "--public-key", PUBKEY]), 0);
  });
  it("sig as an array is rejected, not coerced to a string", () => {
    const p = envelopeFile((env) => { env.signatures[0].sig = [env.signatures[0].sig]; });
    assert.equal(runVerifyReceipt([p, "--public-key", PUBKEY]), 1);
    assert.match(text(), /signature 0 sig is not a strict base64 string/);
  });
  it("sig as a number is rejected", () => {
    const p = envelopeFile((env) => { env.signatures[0].sig = 42; });
    assert.equal(runVerifyReceipt([p, "--public-key", PUBKEY]), 1);
    assert.match(text(), /signature 0 sig is not a strict base64 string/);
  });
  it("trailing junk after the signature is rejected", () => {
    const p = envelopeFile((env) => { env.signatures[0].sig += "!@#$"; });
    assert.equal(runVerifyReceipt([p, "--public-key", PUBKEY]), 1);
    assert.match(text(), /signature 0 sig is not a strict base64 string/);
  });
  it("trailing junk after the payload is rejected", () => {
    const p = envelopeFile((env) => { env.payload += "!!"; });
    assert.equal(runVerifyReceipt([p, "--public-key", PUBKEY]), 1);
    assert.match(text(), /payload is not strict base64/);
  });
  it("whitespace inside the payload is rejected", () => {
    const p = envelopeFile((env) => { env.payload = env.payload.slice(0, 8) + "\n" + env.payload.slice(8); });
    assert.equal(runVerifyReceipt([p, "--public-key", PUBKEY]), 1);
    assert.match(text(), /payload is not strict base64/);
  });

  for (const [value, ok] of [
    ["YQ==", true], ["YWI=", true], ["YWJj", true], ["YW_-", true], ["YQ", true],
    ["", false], ["Y", false], ["YR==", false], ["YQ=", false], ["Y+/=", false], ["YQ==!", false], ["a-b+", false], ["a b=", false],
  ] as Array<[string, boolean]>) {
    it(`isStrictBase64(${JSON.stringify(value)}) is ${ok}`, () => assert.equal(isStrictBase64(value), ok));
  }
  it("isStrictBase64 rejects non-strings", () => {
    for (const v of [undefined, null, 42, ["YQ=="], {}]) assert.equal(isStrictBase64(v), false);
  });
});

describe("verify-receipt: small-order trusted keys", () => {
  const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
  const pemOf = (raw: Buffer) =>
    `-----BEGIN PUBLIC KEY-----\n${Buffer.concat([SPKI_PREFIX, raw]).toString("base64")}\n-----END PUBLIC KEY-----\n`;
  const IDENTITY = Buffer.from("01" + "00".repeat(31), "hex");
  // With A = identity, any (R, S) with R = [S]B verifies for every message. S = 1 gives R = B.
  const BASE_POINT = Buffer.from("58" + "66".repeat(31), "hex");
  const TRIVIAL_SIG = Buffer.concat([BASE_POINT, Buffer.from("01" + "00".repeat(31), "hex")]);

  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "verify-receipt-so-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  /** The valid fixture's statement, re-issued under the identity key's id, edited, trivially "signed". */
  function forged() {
    const pem = pemOf(IDENTITY);
    const keyid = keyIdOf(createPublicKey(pem));
    const env = JSON.parse(readFileSync(fixture("valid"), "utf8"));
    const statement = JSON.parse(Buffer.from(env.payload, "base64").toString("utf8"));
    statement.predicate.issuer.keyid = keyid;
    statement.predicate.totals.costEur = 123.456; // an edit nobody signed
    const payload = Buffer.from(JSON.stringify(statement), "utf8");
    const envelope = { payloadType: PAYLOAD_TYPE, payload: payload.toString("base64"), signatures: [{ keyid, sig: TRIVIAL_SIG.toString("base64") }] };
    const keyFile = join(dir, "identity.pem");
    const envFile = join(dir, "forged.json");
    writeFileSync(keyFile, pem);
    writeFileSync(envFile, JSON.stringify(envelope));
    return { pem, envelope, keyFile, envFile };
  }

  it("the guard does not depend on the runtime: the shared verifier's answer for this forgery varies by Node/OpenSSL build", () => {
    // Node 22.23 (OpenSSL 3.5.8) verifies the trivial signature; Node 24.21 rejects it. Record
    // that the shared verifier gives a boolean either way, and require the CLI to refuse in both.
    const f = forged();
    const shared = verifyRunReceipt(f.envelope, [f.pem]);
    // Two explicit outcomes only: this build rejects the forgery with a stated reason, or it is a
    // build that accepts it. Either way the CLI must refuse, and must not print PASS.
    if (shared.ok === false) assert.ok(shared.reasons && shared.reasons.length > 0, "a rejection from the shared verifier must carry a reason");
    else assert.equal(shared.ok, true);
    assert.equal(runVerifyReceipt([f.envFile, "--public-key", f.keyFile]), 1);
    assert.match(text(), /small-order Ed25519 point/);
    assert.doesNotMatch(text(), /^PASS/m);
  });

  it("the CLI REFUSES the identity key and exits 1 with the reason", () => {
    const f = forged();
    assert.equal(runVerifyReceipt([f.envFile, "--public-key", f.keyFile]), 1);
    assert.match(text(), /small-order Ed25519 point/);
    assert.doesNotMatch(text(), /^PASS/m);
  });

  it("the CLI refuses the identity key even when a good key is trusted alongside it", () => {
    const f = forged();
    assert.equal(runVerifyReceipt([f.envFile, "--public-key", PUBKEY, "--public-key", f.keyFile]), 1);
    assert.match(text(), /small-order Ed25519 point/);
  });

  for (const hex of [
    "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    "0000000000000000000000000000000000000000000000000000000000000000",
    "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
    "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
  ]) {
    it(`refuses small-order point ${hex.slice(0, 8)}...`, () => {
      const keyFile = join(dir, "k.pem");
      writeFileSync(keyFile, pemOf(Buffer.from(hex, "hex")));
      assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", keyFile]), 1);
      assert.match(text(), /small-order Ed25519 point|trusted key is unusable/);
    });
  }

  it("does not refuse an ordinary key", () => {
    assert.equal(runVerifyReceipt([fixture("valid"), "--public-key", PUBKEY]), 0);
  });
});

describe("verify-receipt: read-only, key hygiene, reproducible fixtures", () => {
  const digestOfDir = () => {
    const h = createHash("sha256");
    for (const f of readdirSync(FIXTURES_DIR).sort()) h.update(f).update(readFileSync(join(FIXTURES_DIR, f), "utf8").replace(/\r\n/g, "\n"));
    return h.digest("hex");
  };

  it("never modifies the fixtures it reads", () => {
    const before = digestOfDir();
    for (const f of readdirSync(FIXTURES_DIR).filter((n) => n.endsWith(".envelope.json"))) {
      runVerifyReceipt([join(FIXTURES_DIR, f), "--public-key", PUBKEY]);
    }
    assert.equal(digestOfDir(), before);
  });

  it("fixtures directory holds public keys only", () => {
    for (const f of readdirSync(FIXTURES_DIR)) {
      assert.doesNotMatch(readFileSync(join(FIXTURES_DIR, f), "utf8"), /PRIVATE KEY/, `${f} must not contain a private key`);
    }
    assert.match(readFileSync(PUBKEY, "utf8"), /BEGIN PUBLIC KEY/);
    assert.match(readFileSync(OTHER_PUBKEY, "utf8"), /BEGIN PUBLIC KEY/);
  });

  it("the generator refuses to write through a symlink and leaves the target alone", (t) => {
    const out = mkdtempSync(join(tmpdir(), "verify-receipt-symlink-"));
    const victim = join(out, "victim.txt");
    try {
      writeFileSync(victim, "do not touch");
      try {
        symlinkSync(victim, join(out, "pubkey.pem"));
      } catch {
        t.skip("this account cannot create symlinks");
        return;
      }
      const run = spawnSync(process.execPath, ["--import", "tsx", "tools/gen-run-receipt-fixtures.mjs", "--out", out], { cwd: REPO_ROOT, encoding: "utf8" });
      assert.equal(run.status, 1, run.stdout + run.stderr);
      assert.match(run.stderr, /refusing to write through a symlink/);
      assert.equal(readFileSync(victim, "utf8"), "do not touch");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  it("fixtures regenerate byte for byte from tools/gen-run-receipt-fixtures.mjs, without writing into the checkout", () => {
    const before = digestOfDir();
    const out = mkdtempSync(join(tmpdir(), "verify-receipt-regen-"));
    try {
      const run = spawnSync(process.execPath, ["--import", "tsx", "tools/gen-run-receipt-fixtures.mjs", "--out", out], { cwd: REPO_ROOT, encoding: "utf8" });
      assert.equal(run.status, 0, run.stderr);
      const norm = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
      const committed = readdirSync(FIXTURES_DIR).sort();
      assert.deepEqual(readdirSync(out).sort(), committed, "generator and committed fixtures list different files");
      for (const f of committed) assert.equal(norm(join(out, f)), norm(join(FIXTURES_DIR, f)), `${f} differs from generator output`);
      assert.equal(digestOfDir(), before, "the test must not modify the tracked fixtures");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
