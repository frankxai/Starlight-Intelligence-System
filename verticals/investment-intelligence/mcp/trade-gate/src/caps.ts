/**
 * Cap enforcement + single-execution replay guard + DCA whitelist — durable.
 *
 * ⚠️ v0.1. UNAUDITED. NOT FOR LIVE FUNDS.
 *
 * Over ANY cap → over-cap (escalates to the human gate; NEVER auto-approved).
 * An intent id that already committed spend → reject (replay).
 *
 * Committed spend persists to `.trade-gate-data/spend.jsonl` so the replay
 * guard and the rolling 24h totals survive a restart. `check` never mutates;
 * `commit` appends the durable event FIRST, then mutates memory.
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type {
  AssetClass,
  CapPolicy,
  CapResult,
  DcaWhitelistEntry,
  TradeIntent,
} from "./types.js";
import { resolveDataDir } from "./audit.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const SPEND_FILE = "spend.jsonl";

interface SpendEvent {
  intentId: string;
  ts: number;
  notional: number;
  assetClass: AssetClass;
}

export class CapLedger {
  private readonly consumed = new Set<string>();
  /** Rolling-window records for the 24h caps; pruned so growth is bounded. */
  private records: SpendEvent[] = [];
  private readonly path: string;

  constructor(dataDir?: string) {
    this.path = join(resolveDataDir(dataDir), SPEND_FILE);
    mkdirSync(dirname(this.path), { recursive: true });
    this.load();
  }

  private load(): void {
    if (!existsSync(this.path)) return;
    const raw = readFileSync(this.path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let ev: SpendEvent;
      try {
        ev = JSON.parse(trimmed) as SpendEvent;
      } catch {
        continue; // corrupt line skipped on read, never rewritten
      }
      if (!ev.intentId || typeof ev.notional !== "number") continue;
      // Replay protection is lifetime; the 24h window seeds from recent events.
      this.consumed.add(ev.intentId);
      this.records.push(ev);
    }
  }

  isConsumed(intentId: string): boolean {
    return this.consumed.has(intentId);
  }

  private prune(now: number): void {
    const cutoff = now - DAY_MS;
    this.records = this.records.filter((r) => r.ts > cutoff);
  }

  private spentToday(now: number): number {
    const cutoff = now - DAY_MS;
    return this.records
      .filter((r) => r.ts > cutoff)
      .reduce((sum, r) => sum + r.notional, 0);
  }

  private spentTodayOnClass(assetClass: AssetClass, now: number): number {
    const cutoff = now - DAY_MS;
    return this.records
      .filter((r) => r.assetClass === assetClass && r.ts > cutoff)
      .reduce((sum, r) => sum + r.notional, 0);
  }

  /**
   * Evaluate an intent against the caps. Does NOT mutate — call `commit`
   * separately once the intent is cleared to count against the ledger.
   *
   * @param now injectable clock (ms) for deterministic tests.
   */
  check(intent: TradeIntent, caps: CapPolicy, now: number = Date.now()): CapResult {
    this.prune(now);

    // Replay guard first: an intent that already spent is never re-spendable.
    if (this.consumed.has(intent.intentId)) {
      return {
        verdict: "reject",
        reason: `replay: intent ${intent.intentId} already committed`,
      };
    }

    if (!Number.isFinite(intent.notional) || intent.notional <= 0) {
      return { verdict: "reject", reason: `invalid notional '${String(intent.notional)}'` };
    }

    if (intent.notional > caps.perOrder) {
      return {
        verdict: "over-cap",
        reason:
          `over per-order cap: ${intent.notional.toFixed(2)} ${intent.currency} ` +
          `> ${caps.perOrder.toFixed(2)}`,
      };
    }

    const day = this.spentToday(now) + intent.notional;
    if (day > caps.perDay) {
      return {
        verdict: "over-cap",
        reason:
          `over per-day cap: ${day.toFixed(2)} ${intent.currency} > ${caps.perDay.toFixed(2)}`,
      };
    }

    const classCap = caps.perAssetClassDay?.[intent.assetClass];
    if (classCap !== undefined) {
      const classDay = this.spentTodayOnClass(intent.assetClass, now) + intent.notional;
      if (classDay > classCap) {
        return {
          verdict: "over-cap",
          reason:
            `over per-day cap for '${intent.assetClass}': ` +
            `${classDay.toFixed(2)} ${intent.currency} > ${classCap.toFixed(2)}`,
        };
      }
    }

    return {
      verdict: "within-cap",
      reason:
        `within all caps (order ${intent.notional.toFixed(2)} / day ${day.toFixed(2)} ` +
        `${intent.currency})`,
    };
  }

  /**
   * Count the intent against the ledger and consume its id. Throws on a
   * replay — the caller must `check` first. Durable write FIRST: if the append
   * throws, no in-memory state is mutated, so replay protection cannot be lost
   * to a crash.
   */
  commit(intent: TradeIntent, now: number = Date.now()): void {
    if (this.consumed.has(intent.intentId)) {
      throw new Error(`refusing to re-commit intent ${intent.intentId}`);
    }
    const ev: SpendEvent = {
      intentId: intent.intentId,
      ts: now,
      notional: intent.notional,
      assetClass: intent.assetClass,
    };
    appendFileSync(this.path, JSON.stringify(ev) + "\n", "utf8");
    this.consumed.add(intent.intentId);
    this.records.push(ev);
  }

  filePath(): string {
    return this.path;
  }
}

/**
 * DCA-whitelist eligibility — the ONLY auto-approvable class. Verified
 * against the pre-declared whitelist, never trusted from the intent's own
 * `dca` flag. Sells are never DCA (accumulation only).
 */
export function dcaEligible(
  intent: TradeIntent,
  whitelist: readonly DcaWhitelistEntry[],
): CapResult {
  if (!intent.dca) {
    return { verdict: "reject", reason: "intent not flagged dca" };
  }
  if (intent.side !== "buy") {
    return { verdict: "reject", reason: "dca is accumulation only — sells take the human gate" };
  }
  const entry = whitelist.find((w) => w.instrument === intent.instrument);
  if (!entry) {
    return {
      verdict: "reject",
      reason: `instrument '${intent.instrument}' not on the dca whitelist`,
    };
  }
  if (intent.notional > entry.maxNotional) {
    return {
      verdict: "reject",
      reason:
        `dca notional ${intent.notional.toFixed(2)} > whitelist max ` +
        `${entry.maxNotional.toFixed(2)} for '${intent.instrument}'`,
    };
  }
  return { verdict: "within-cap", reason: `dca-eligible for '${intent.instrument}'` };
}
