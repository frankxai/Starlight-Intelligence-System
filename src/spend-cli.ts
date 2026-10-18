import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  addTopUp, confirmPrice, emptyLedger, parseAmount, parseCurrency, parseLedger, parseTokscaleGraph, parseTokscaleUsage,
  planSpend, type QuotaPlan, type SpendLedger, type SpendReport, type UsageSummary,
} from "./spend.js";

export const TOKSCALE_VERSION = "4.17.0";

const USAGE = `Spend and capacity:
  starlight spend [--json]                 paid vs worth per plan, this month
  starlight spend set <id> <amount> [EUR|USD]
  starlight spend topup <vendor> <amount> [EUR|USD] [YYYY-MM-DD]
  starlight plan [--json]                  where the next long job has room to run

Reads tokscale (local agent logs, quota windows) and a private ledger at
~/.starlight/pulse/spend.v1.json (override: STARLIGHT_SPEND_LEDGER).
Prices never leave this machine. tokscale runs from PATH, else npx tokscale@${TOKSCALE_VERSION}.`;

export interface SpendCliDeps {
  readUsage(sinceDate: string): UsageSummary;
  readQuota(): QuotaPlan[];
  readFx(): Promise<number | null>;
  ledgerPath: string;
  today: string;
}

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const SAFE_ARG = /^[A-Za-z0-9@._:-]+$/;

// npm installs tokscale and npx as .cmd shims on Windows, which need a shell. Every argument is a
// fixed flag or a validated date, so the command line is built from known-safe tokens only.
function spawnTool(tool: string, args: string[]) {
  const unsafe = [tool, ...args].find(a => !SAFE_ARG.test(a));
  if (unsafe) throw new Error(`Refusing unsafe tokscale argument '${unsafe}'`);
  const opts = { encoding: "utf8" as const, maxBuffer: 64 * 1024 * 1024, timeout: 300_000 };
  return process.platform === "win32"
    ? spawnSync([tool, ...args].join(" "), { ...opts, shell: true })
    : spawnSync(tool, args, opts);
}

function tokscaleJson(args: string[]): unknown {
  let res = spawnTool("tokscale", args);
  if (res.status !== 0 || !res.stdout) res = spawnTool("npx", ["--yes", `tokscale@${TOKSCALE_VERSION}`, ...args]);
  if (res.status !== 0 || !res.stdout) throw new Error(`tokscale ${args[0]} failed: ${String(res.stderr || res.error?.message || "no output").slice(0, 200)}`);
  const text = String(res.stdout);
  const start = text.search(/[[{]/);
  return JSON.parse(text.slice(start));
}

export function defaultDeps(): SpendCliDeps {
  const now = new Date();
  return {
    readUsage: sinceDate => parseTokscaleGraph(tokscaleJson(["graph", "--since", sinceDate, "--no-spinner"])),
    readQuota: () => parseTokscaleUsage(tokscaleJson(["usage", "--json"])),
    readFx: async () => {
      try {
        const r = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD", { signal: AbortSignal.timeout(10_000) });
        if (!r.ok) return null;
        const j = await r.json() as { rates?: { USD?: number } };
        return typeof j.rates?.USD === "number" ? j.rates.USD : null;
      } catch {
        return null;
      }
    },
    ledgerPath: process.env.STARLIGHT_SPEND_LEDGER || join(homedir(), ".starlight", "pulse", "spend.v1.json"),
    today: now.toISOString().slice(0, 10),
  };
}

function readLedger(path: string): SpendLedger {
  return existsSync(path) ? parseLedger(JSON.parse(readFileSync(path, "utf8"))) : emptyLedger();
}

function writeLedger(path: string, ledger: SpendLedger): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(ledger, null, 2) + "\n");
  renameSync(tmp, path);
}

const money = (usd: number | null): string => (usd === null ? "?" : `$${usd >= 100 ? Math.round(usd).toLocaleString("en-US") : usd.toFixed(2)}`);
const compact = (n: number): string => (n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : String(n));

export function formatSpend(report: SpendReport): string {
  const lines = [`Paid ${money(report.paidUsd)}/mo known · worth ${money(report.worthUsd)} at list prices this month`];
  for (const p of report.plans) {
    const ret = p.multiple === null ? "" : ` ×${p.multiple.toFixed(1)}`;
    const left = p.leftPercent === null ? "" : ` · ${p.leftPercent}% left`;
    lines.push(`  ${p.plan.padEnd(34)} ${compact(p.tokens).padStart(6)} tok  ${money(p.worthUsd).padStart(8)} of ${money(p.paidUsd)}${ret}${left}`);
  }
  for (const c of report.unattached) lines.push(`  ${`${c.client} (API keys or free)`.padEnd(34)} ${compact(c.tokens).padStart(6)} tok  ${money(c.worthUsd).padStart(8)}`);
  if (report.missingPrices.length) lines.push(`Unpriced plans: ${report.missingPrices.join(", ")} · starlight spend set <id> <amount> EUR|USD`);
  if (report.topUpsUsd) lines.push(`Top-ups this month: ${money(report.topUpsUsd)}`);
  lines.push(`Next long job: ${report.route.runOn ?? "none"} — ${report.route.reason}`);
  return lines.join("\n");
}

export function formatPlan(report: SpendReport): string {
  const r = report.route;
  const lines = [`Run the next long job on ${r.runOn ?? "API credit"}: ${r.reason}.`];
  if (r.exhausted.length) lines.push(`Out of room: ${r.exhausted.join(", ")}.`);
  if (r.resetCreditsAvailable.length) lines.push(`Reset credit available: ${r.resetCreditsAvailable.join(", ")} (use it before buying credits).`);
  return lines.join("\n");
}

export async function runSpendCli(args: string[], deps: SpendCliDeps = defaultDeps()): Promise<CliResult> {
  const [command, action, ...rest] = args;
  const json = args.includes("--json");
  try {
    if (command === "spend" && action === "set") {
      const [id, amount, currency] = rest;
      const ledger = readLedger(deps.ledgerPath);
      const sub = ledger.subscriptions.find(s => s.id === id);
      const next = confirmPrice(ledger, String(id), parseAmount(amount), parseCurrency(currency, sub?.currency ?? "USD"), deps.today);
      writeLedger(deps.ledgerPath, next);
      return { stdout: `${id}: ${parseAmount(amount).toFixed(2)} ${parseCurrency(currency, sub?.currency ?? "USD")}/month confirmed`, stderr: "", exitCode: 0 };
    }
    if (command === "spend" && action === "topup") {
      const [vendor, amount, currency, date] = rest;
      if (!vendor) throw new Error("topup needs a vendor, an amount and a currency");
      const next = addTopUp(readLedger(deps.ledgerPath), {
        vendor: vendor.toLowerCase(), amount: parseAmount(amount), currency: parseCurrency(currency, "USD"),
        date: date ?? deps.today, evidence: `logged by the owner on ${deps.today}`,
      });
      writeLedger(deps.ledgerPath, next);
      return { stdout: `top-up logged: ${vendor.toLowerCase()} ${parseAmount(amount).toFixed(2)} ${parseCurrency(currency, "USD")}`, stderr: "", exitCode: 0 };
    }
    if ((command === "spend" || command === "plan") && (action === undefined || action === "--json")) {
      const sinceDate = `${deps.today.slice(0, 8)}01`;
      const report = planSpend({
        usage: deps.readUsage(sinceDate), quota: deps.readQuota(), ledger: readLedger(deps.ledgerPath),
        usdPerEur: await deps.readFx(), sinceDate,
      });
      if (json) return { stdout: JSON.stringify(command === "plan" ? report.route : report, null, 2), stderr: "", exitCode: 0 };
      return { stdout: command === "plan" ? formatPlan(report) : formatSpend(report), stderr: "", exitCode: 0 };
    }
    return { stdout: "", stderr: USAGE, exitCode: 2 };
  } catch (error) {
    return { stdout: "", stderr: `[starlight] ${error instanceof Error ? error.message : String(error)}`, exitCode: 1 };
  }
}
