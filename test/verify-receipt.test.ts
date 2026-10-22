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
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runVerifyReceipt } from "../src/verify-receipt.js";

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

describe("verify-receipt: read-only, key hygiene, reproducible fixtures", () => {
  const digestOfDir = () => {
    const h = createHash("sha256");
    for (const f of readdirSync(FIXTURES_DIR).sort()) h.update(f).update(readFileSync(join(FIXTURES_DIR, f), "utf8").replace(/
/g, "
"));
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

  it("fixtures regenerate byte for byte from tools/gen-run-receipt-fixtures.mjs", () => {
    const before = digestOfDir();
    const run = spawnSync(process.execPath, ["--import", "tsx", "tools/gen-run-receipt-fixtures.mjs"], { cwd: REPO_ROOT, encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(digestOfDir(), before, "committed fixtures differ from generator output");
  });
});
