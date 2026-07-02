import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CapLedger, dcaEligible } from "./caps.js";
import type { CapPolicy, TradeIntent } from "./types.js";

const CAPS: CapPolicy = { perOrder: 500, perDay: 1000, perAssetClassDay: { crypto: 300 } };

function intent(overrides: Partial<TradeIntent> = {}): TradeIntent {
  return {
    intentId: `ti_${Math.random().toString(36).slice(2)}`,
    instrument: "VWCE",
    assetClass: "etf",
    side: "buy",
    notional: 100,
    currency: "EUR",
    broker: "paper",
    dca: false,
    ...overrides,
  };
}

function tempLedger(): { ledger: CapLedger; dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "trade-gate-caps-"));
  return { ledger: new CapLedger(dir), dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test("within all caps → within-cap", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    assert.equal(ledger.check(intent(), CAPS).verdict, "within-cap");
  } finally {
    cleanup();
  }
});

test("over per-order cap → over-cap (escalate, never approve)", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    const res = ledger.check(intent({ notional: 501 }), CAPS);
    assert.equal(res.verdict, "over-cap");
    assert.match(res.reason, /per-order/);
  } finally {
    cleanup();
  }
});

test("per-day cap accumulates across commits", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    const now = Date.now();
    for (let i = 0; i < 3; i++) {
      const ti = intent({ notional: 300 });
      assert.equal(ledger.check(ti, CAPS, now).verdict, "within-cap");
      ledger.commit(ti, now);
    }
    // 900 committed; another 300 breaches the 1000/day cap.
    const res = ledger.check(intent({ notional: 300 }), CAPS, now);
    assert.equal(res.verdict, "over-cap");
    assert.match(res.reason, /per-day/);
  } finally {
    cleanup();
  }
});

test("per-asset-class day cap is tighter than the global day cap", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    const now = Date.now();
    const btc = intent({ assetClass: "crypto", instrument: "BTC-EUR", notional: 200 });
    assert.equal(ledger.check(btc, CAPS, now).verdict, "within-cap");
    ledger.commit(btc, now);
    const more = intent({ assetClass: "crypto", instrument: "BTC-EUR", notional: 200 });
    const res = ledger.check(more, CAPS, now);
    assert.equal(res.verdict, "over-cap");
    assert.match(res.reason, /'crypto'/);
  } finally {
    cleanup();
  }
});

test("replayed intent id → reject; re-commit throws", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    const ti = intent();
    ledger.commit(ti);
    assert.equal(ledger.check(ti, CAPS).verdict, "reject");
    assert.throws(() => ledger.commit(ti), /refusing to re-commit/);
  } finally {
    cleanup();
  }
});

test("replay protection survives a restart (durable JSONL)", () => {
  const dir = mkdtempSync(join(tmpdir(), "trade-gate-caps-"));
  try {
    const ti = intent();
    new CapLedger(dir).commit(ti);
    const reloaded = new CapLedger(dir);
    assert.equal(reloaded.isConsumed(ti.intentId), true);
    assert.equal(reloaded.check(ti, CAPS).verdict, "reject");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("invalid notional → reject", () => {
  const { ledger, cleanup } = tempLedger();
  try {
    assert.equal(ledger.check(intent({ notional: 0 }), CAPS).verdict, "reject");
    assert.equal(ledger.check(intent({ notional: Number.NaN }), CAPS).verdict, "reject");
  } finally {
    cleanup();
  }
});

test("dcaEligible: whitelisted within-max buy passes; everything else fails", () => {
  const wl = [{ instrument: "VWCE", side: "buy" as const, maxNotional: 250 }];
  assert.equal(dcaEligible(intent({ dca: true, notional: 200 }), wl).verdict, "within-cap");
  // not flagged
  assert.equal(dcaEligible(intent({ dca: false }), wl).verdict, "reject");
  // sells never DCA
  assert.equal(dcaEligible(intent({ dca: true, side: "sell" }), wl).verdict, "reject");
  // not whitelisted
  assert.equal(dcaEligible(intent({ dca: true, instrument: "TSLA" }), wl).verdict, "reject");
  // over whitelist max
  assert.equal(dcaEligible(intent({ dca: true, notional: 251 }), wl).verdict, "reject");
});
