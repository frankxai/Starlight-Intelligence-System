/**
 * Spend and capacity planning for the agents a person already pays for.
 *
 * Three local inputs, no account access: tokscale's usage graph (tokens and
 * list-price value per client), tokscale's quota report (plan names and the
 * share of each window left), and a private ledger of what the person pays.
 * The planner joins them into paid vs worth per plan and says where the next
 * long job has room to run. Prices from the ledger stay on the machine.
 */

export const SPEND_LEDGER_VERSION = "starlight.spend.v1" as const;

export type Currency = "EUR" | "USD";
export type Vendor = "claude" | "openai" | "grok" | "gemini" | "github-copilot" | string;

export interface ClientUsage {
  client: string;
  tokens: number;
  worthUsd: number;
}

export interface UsageSummary {
  clients: ClientUsage[];
  days: { date: string; tokens: number; worthUsd: number }[];
  worthUsd: number;
  /** Models with tokens and no list price, excluding ones named as free. */
  unpriced: string[];
}

export interface QuotaWindow {
  label: string;
  usedPercent: number;
  resetsAt: string | null;
}

export interface QuotaPlan {
  provider: string;
  vendor: Vendor;
  plan: string | null;
  windows: QuotaWindow[];
  resetCredits: number;
}

export interface Subscription {
  id: string;
  vendor: Vendor;
  plan: string;
  amount: number | null;
  currency: Currency;
  period: "month";
  status: "confirmed" | "derived" | "unconfirmed";
  evidence?: string;
}

export interface TopUp {
  vendor: Vendor;
  amount: number;
  currency: Currency;
  date: string;
  evidence?: string;
}

export interface SpendLedger {
  schema: typeof SPEND_LEDGER_VERSION;
  subscriptions: Subscription[];
  topUps: TopUp[];
  [extra: string]: unknown;
}

export interface PlanLine {
  vendor: Vendor;
  plan: string;
  paidUsd: number | null;
  worthUsd: number;
  tokens: number;
  /** worth / paid; null when the price or the usage is unknown. */
  multiple: number | null;
  /** Share left on the binding window (weekly where one exists), 0-100. */
  leftPercent: number | null;
  resetsAt: string | null;
  resetCredits: number;
  status: Subscription["status"] | "no-subscription";
}

export interface SpendReport {
  plans: PlanLine[];
  paidUsd: number;
  worthUsd: number;
  topUpsUsd: number;
  missingPrices: string[];
  /** Clients whose work is not tied to a subscription (API keys, free models). */
  unattached: ClientUsage[];
  route: RouteAdvice;
}

export interface RouteAdvice {
  runOn: Vendor | null;
  reason: string;
  exhausted: Vendor[];
  resetCreditsAvailable: Vendor[];
}

/** Which subscription a coding client draws on. The client decides, not the model it calls. */
export const CLIENT_VENDOR: Readonly<Record<string, Vendor>> = Object.freeze({
  claude: "claude",
  codex: "openai",
  grok: "grok",
  antigravity: "gemini",
  "antigravity-cli": "gemini",
  gemini: "gemini",
  copilot: "github-copilot",
});

const PROVIDER_VENDOR: Readonly<Record<string, Vendor>> = Object.freeze({
  claude: "claude",
  codex: "openai",
  chatgpt: "openai",
  grok: "grok",
  "grok build": "grok",
  copilot: "github-copilot",
  gemini: "gemini",
  antigravity: "gemini",
});

const FREE_MODEL = /free|big-pickle/i;
const EXHAUSTED_PERCENT = 10;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const num = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const str = (value: unknown): string | null => (typeof value === "string" ? value : null);

function tokenTotal(tokens: Record<string, unknown>): number {
  return num(tokens.input) + num(tokens.output) + num(tokens.cacheRead) + num(tokens.cacheWrite) + num(tokens.reasoning);
}

/** Parses `tokscale graph --json` output: one entry per day, each with its clients. */
export function parseTokscaleGraph(raw: unknown): UsageSummary {
  const byClient = new Map<string, ClientUsage>();
  const unpriced = new Set<string>();
  const days: UsageSummary["days"] = [];
  const contributions = record(raw).contributions;
  for (const day of Array.isArray(contributions) ? contributions : []) {
    const d = record(day);
    const totals = record(d.totals);
    days.push({ date: str(d.date) ?? "", tokens: num(totals.tokens), worthUsd: num(totals.cost) });
    for (const entry of Array.isArray(d.clients) ? d.clients : []) {
      const c = record(entry);
      const client = str(c.client) ?? "unknown";
      const tokens = tokenTotal(record(c.tokens));
      const worth = num(c.cost);
      const prev = byClient.get(client) ?? { client, tokens: 0, worthUsd: 0 };
      byClient.set(client, { client, tokens: prev.tokens + tokens, worthUsd: prev.worthUsd + worth });
      const model = str(c.modelId);
      if (model && tokens > 0 && worth === 0 && !FREE_MODEL.test(model)) unpriced.add(model);
    }
  }
  const clients = [...byClient.values()].sort((a, b) => b.worthUsd - a.worthUsd);
  return { clients, days, worthUsd: days.reduce((sum, d) => sum + d.worthUsd, 0), unpriced: [...unpriced].sort() };
}

/** Parses `tokscale usage --json`: one entry per provider with its plan and quota windows. */
export function parseTokscaleUsage(raw: unknown): QuotaPlan[] {
  return (Array.isArray(raw) ? raw : []).map(entry => {
    const e = record(entry);
    const provider = str(e.provider) ?? "unknown";
    const windows = (Array.isArray(e.metrics) ? e.metrics : []).map(m => {
      const metric = record(m);
      return { label: str(metric.label) ?? "", usedPercent: num(metric.used_percent), resetsAt: str(metric.resets_at) };
    });
    return {
      provider,
      vendor: PROVIDER_VENDOR[provider.toLowerCase()] ?? provider.toLowerCase(),
      plan: str(e.plan),
      windows,
      resetCredits: num(record(e.reset_credits).available_count),
    };
  });
}

/** The window that limits a long job: the weekly one where it exists, else the most used. */
export function bindingWindow(plan: QuotaPlan): QuotaWindow | null {
  const weekly = plan.windows.find(w => /weekly/i.test(w.label));
  if (weekly) return weekly;
  return [...plan.windows].sort((a, b) => b.usedPercent - a.usedPercent)[0] ?? null;
}

export function toUsd(amount: number | null, currency: Currency, usdPerEur: number | null): number | null {
  if (amount === null) return null;
  if (currency === "USD") return amount;
  return usdPerEur === null ? null : amount * usdPerEur;
}

export function planSpend(input: {
  usage: UsageSummary;
  quota: QuotaPlan[];
  ledger: SpendLedger;
  usdPerEur: number | null;
  sinceDate: string;
}): SpendReport {
  const { usage, quota, ledger, usdPerEur, sinceDate } = input;
  const worthByVendor = new Map<Vendor, { worthUsd: number; tokens: number }>();
  const unattached: ClientUsage[] = [];
  for (const c of usage.clients) {
    const vendor = CLIENT_VENDOR[c.client];
    if (!vendor) { unattached.push(c); continue; }
    const prev = worthByVendor.get(vendor) ?? { worthUsd: 0, tokens: 0 };
    worthByVendor.set(vendor, { worthUsd: prev.worthUsd + c.worthUsd, tokens: prev.tokens + c.tokens });
  }

  const quotaByVendor = new Map(quota.map(q => [q.vendor, q]));
  const plans: PlanLine[] = ledger.subscriptions.map(s => {
    const paidUsd = toUsd(s.amount, s.currency, usdPerEur);
    const used = worthByVendor.get(s.vendor) ?? { worthUsd: 0, tokens: 0 };
    worthByVendor.delete(s.vendor);
    const q = quotaByVendor.get(s.vendor);
    const binding = q ? bindingWindow(q) : null;
    return {
      vendor: s.vendor,
      plan: s.plan,
      paidUsd,
      worthUsd: used.worthUsd,
      tokens: used.tokens,
      multiple: paidUsd && used.worthUsd ? used.worthUsd / paidUsd : null,
      leftPercent: binding ? 100 - binding.usedPercent : null,
      resetsAt: binding?.resetsAt ?? null,
      resetCredits: q?.resetCredits ?? 0,
      status: s.status,
    };
  });
  for (const [vendor, used] of worthByVendor) {
    const q = quotaByVendor.get(vendor);
    const binding = q ? bindingWindow(q) : null;
    plans.push({
      vendor, plan: q?.plan ?? vendor, paidUsd: null, worthUsd: used.worthUsd, tokens: used.tokens, multiple: null,
      leftPercent: binding ? 100 - binding.usedPercent : null, resetsAt: binding?.resetsAt ?? null,
      resetCredits: q?.resetCredits ?? 0, status: "no-subscription",
    });
  }
  plans.sort((a, b) => b.worthUsd - a.worthUsd);

  const topUpsUsd = ledger.topUps
    .filter(t => t.date >= sinceDate)
    .reduce((sum, t) => sum + (toUsd(t.amount, t.currency, usdPerEur) ?? 0), 0);

  return {
    plans,
    paidUsd: plans.reduce((sum, p) => sum + (p.paidUsd ?? 0), 0),
    worthUsd: usage.worthUsd,
    topUpsUsd,
    missingPrices: ledger.subscriptions.filter(s => s.amount === null).map(s => s.id),
    unattached,
    route: adviseRoute(quota),
  };
}

/** Where the next long job should run: the plan with the most room on its binding window. */
export function adviseRoute(quota: QuotaPlan[]): RouteAdvice {
  const scored = quota
    .map(q => ({ q, window: bindingWindow(q) }))
    .filter((x): x is { q: QuotaPlan; window: QuotaWindow } => x.window !== null);
  const exhausted = scored.filter(x => 100 - x.window.usedPercent <= EXHAUSTED_PERCENT).map(x => x.q.vendor);
  const resetCreditsAvailable = quota.filter(q => q.resetCredits > 0).map(q => q.vendor);
  const best = scored
    .filter(x => !exhausted.includes(x.q.vendor))
    .sort((a, b) => a.window.usedPercent - b.window.usedPercent)[0];
  if (!best) {
    return { runOn: null, reason: "No plan reports quota room; run on API credit or wait for a reset.", exhausted, resetCreditsAvailable };
  }
  const left = 100 - best.window.usedPercent;
  return {
    runOn: best.q.vendor,
    reason: `${best.q.provider}${best.q.plan ? ` ${best.q.plan}` : ""} has ${left}% of its ${best.window.label.toLowerCase()} window left`,
    exhausted,
    resetCreditsAvailable,
  };
}

export function emptyLedger(): SpendLedger {
  return { schema: SPEND_LEDGER_VERSION, subscriptions: [], topUps: [] };
}

/** Validates a ledger read from disk; unknown fields are kept so other tools can extend it. */
export function parseLedger(raw: unknown): SpendLedger {
  const r = record(raw);
  if (r.schema !== SPEND_LEDGER_VERSION) throw new Error(`Ledger schema must be ${SPEND_LEDGER_VERSION}`);
  const subscriptions = (Array.isArray(r.subscriptions) ? r.subscriptions : []).map(s => {
    const x = record(s);
    const id = str(x.id);
    if (!id) throw new Error("Every subscription needs an id");
    return {
      ...x,
      id,
      vendor: str(x.vendor) ?? id,
      plan: str(x.plan) ?? id,
      amount: typeof x.amount === "number" ? x.amount : null,
      currency: x.currency === "EUR" ? "EUR" : "USD",
      period: "month",
      status: x.status === "confirmed" || x.status === "derived" ? x.status : "unconfirmed",
    } as Subscription;
  });
  const topUps = (Array.isArray(r.topUps) ? r.topUps : []).map(t => {
    const x = record(t);
    return { ...x, vendor: str(x.vendor) ?? "unknown", amount: num(x.amount), currency: x.currency === "EUR" ? "EUR" : "USD",
      date: str(x.date) ?? "" } as TopUp;
  });
  return { ...r, schema: SPEND_LEDGER_VERSION, subscriptions, topUps };
}

export function parseAmount(text: string | undefined): number {
  const n = Number(String(text ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) throw new Error(`'${text}' is not an amount`);
  return Math.round(n * 100) / 100;
}

export function parseCurrency(text: string | undefined, fallback: Currency): Currency {
  const c = String(text ?? fallback).toUpperCase();
  if (c !== "EUR" && c !== "USD") throw new Error(`Currency must be EUR or USD, got '${text}'`);
  return c;
}

/** Returns a new ledger with one subscription's price confirmed. */
export function confirmPrice(ledger: SpendLedger, id: string, amount: number, currency: Currency, today: string): SpendLedger {
  const found = ledger.subscriptions.some(s => s.id === id);
  if (!found) throw new Error(`No subscription '${id}'. Known: ${ledger.subscriptions.map(s => s.id).join(", ") || "none"}`);
  return {
    ...ledger,
    subscriptions: ledger.subscriptions.map(s => s.id === id
      ? { ...s, amount, currency, status: "confirmed" as const, evidence: `confirmed by the owner on ${today}${s.evidence ? `; ${s.evidence}` : ""}` }
      : s),
  };
}

/** Returns a new ledger with a subscription added, or its plan and price replaced. */
export function upsertSubscription(ledger: SpendLedger, sub: Subscription): SpendLedger {
  const rest = ledger.subscriptions.filter(s => s.id !== sub.id);
  return { ...ledger, subscriptions: [...rest, sub] };
}

export function addTopUp(ledger: SpendLedger, topUp: TopUp): SpendLedger {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(topUp.date)) throw new Error(`Date must be YYYY-MM-DD, got '${topUp.date}'`);
  return { ...ledger, topUps: [...ledger.topUps, topUp] };
}
