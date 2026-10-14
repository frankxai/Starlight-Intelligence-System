/**
 * v9.3 — Starlight Alexandria conformance.
 *
 * Guards:
 *   - the 7-file vertical contract plus the catalogue, connectors and
 *     experiment registry exist and validate
 *   - the Library routes needs deterministically and prices calls before
 *     they run
 *   - the router is fail-closed on budget and required options, and a
 *     successful call always yields a receipt with a stable content hash
 *   - the attestation block is earned (emitted only with declared layers)
 *   - the Forge status machine refuses verdicts without receipts
 *   - the MCP server lists the five tools and refuses unknown arguments
 *
 * No network: Firecrawl calls go through an injected fetch.
 *
 * Built on SIP — operational tier (Domain Sub-Stack: Alexandria).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { pathToFileURL } from "node:url";
import {
  Alexandria,
  AlexandriaError,
  AlexandriaMcpServer,
  FirecrawlTransport,
  Library,
  MemoryTransport,
  NativeTransport,
  ReceiptLedger,
  SessionLock,
  canTransition,
  hashRecords,
  parseMaxCredits,
  loadCatalog,
  loadExperiments,
  overdue,
  transition,
  validateCatalog,
  validateRegistry,
} from "../src/alexandria/index.js";
import type { Experiment } from "../src/alexandria/index.js";
import { capabilityTurn, ledgerIdentity } from "../src/alexandria/receipts.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const VERTICAL = join(REPO_ROOT, "verticals", "alexandria");

/** A lock as the runtime publishes it: a directory holding an `owner` file with the pid. */
function plantLock(path: string, owner: string): void {
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, "owner"), owner, "utf8");
}
const lockOwner = (path: string) => readFileSync(join(path, "owner"), "utf8");

describe("v93 — vertical contract", () => {
  it("carries the 7-file contract plus catalogue, connectors and experiments", () => {
    for (const f of ["README.md", "SKILL.md", "AGENTS.md", "MEMORY.md", "STACK.md", "CANON.md", "SOUL.md", "ARCHITECTURE.md", "SDLC.md", "SWARM.md", "REVENUE.md", "CAPITAL.md", "SUB-SYSTEMS.md", "PROPOSAL.md", "alexandria.yaml", "catalog/providers.json", "catalog/connectors.json", "experiments/registry.json"]) {
      assert.ok(existsSync(join(VERTICAL, f)), `missing verticals/alexandria/${f}`);
    }
  });

  it("catalogue validates, carries real Firecrawl provider ids, and the published counts match the file", () => {
    const catalog = loadCatalog();
    assert.equal(validateCatalog(catalog).length, 0);
    const providers = catalog.providers.length;
    const capabilities = catalog.providers.reduce((n, p) => n + p.capabilities.length, 0);
    const readme = readFileSync(join(VERTICAL, "README.md"), "utf8");
    const registry = readFileSync(join(REPO_ROOT, "VERTICALS.md"), "utf8");
    assert.equal(providers, 20, "update README.md, VERTICALS.md and CHANGELOG.md when the catalogue grows");
    assert.equal(capabilities, 47, "update README.md, VERTICALS.md and CHANGELOG.md when the catalogue grows");
    assert.ok(readme.includes("Twenty providers and forty-seven capabilities"), "README count drifted from the catalogue");
    assert.ok(registry.includes("20 providers / 47 capabilities"), "VERTICALS.md count drifted from the catalogue");
    const ids = new Set(catalog.providers.map((p) => p.id));
    for (const expected of ["gmgn-ai", "fiscal-ai", "sec-gov", "fireround", "arxiv-org", "semanticscholar-org", "federalreserve-gov", "sis-vaults", "sis-metrics"]) {
      assert.ok(ids.has(expected), `catalogue lacks ${expected}`);
    }
    assert.ok(catalog.providers.every((p) => p.kind !== "native" || p.capabilities.every((c) => c.creditsCost === 0)), "native must be free");
  });

  it("validator reports duplicates and malformed entries instead of throwing", () => {
    const problems = validateCatalog({ version: "x", reconciledAt: "2026-10-08", providers: [
      { id: "a", kind: "native", name: "A", description: "a", source: "s", categories: ["k"], capabilities: [{ id: "a/x", capability: "x", name: "X", description: "x", creditsCost: 0, perRecord: false, tags: ["x"] }] },
      { id: "a", kind: "bogus", name: "", description: "a", source: "s", categories: [], capabilities: [{ id: "wrong", capability: "Bad Path", name: "X", description: "x", creditsCost: -1, perRecord: "no", tags: ["Upper"] }] },
    ] });
    const messages = problems.map((p) => p.message).join("\n");
    for (const needle of ["duplicate provider id a", "kind must be one of", "name must be a non-empty string", "categories must be a non-empty array", "capability path must be lower-case", "creditsCost must be a non-negative", "perRecord must be boolean", "tags must be lower-case"]) {
      assert.ok(messages.includes(needle), `expected problem: ${needle}`);
    }
  });

  it("connectors name credentials by env var name only, never a value", () => {
    const raw = JSON.parse(readFileSync(join(VERTICAL, "catalog", "connectors.json"), "utf8")) as { connectors: { id: string; credential: string; status: string; lane: string }[] };
    assert.ok(raw.connectors.length >= 15);
    for (const c of raw.connectors) {
      assert.ok(["wired", "planned", "evaluating"].includes(c.status), `${c.id} status`);
      assert.ok(["runtime", "data", "generation", "distribution", "money", "infra", "trust"].includes(c.lane), `${c.id} lane`);
      assert.ok(!/[:=]\s*\S{20,}/.test(c.credential), `${c.id} credential looks like a value`);
    }
  });
});

describe("v93 — Library routing", () => {
  const library = Library.fromFile();

  it("routes a wallet need to gmgn-ai and a paper need to a research provider", () => {
    const wallet = library.find("profile this solana whale wallet address");
    assert.equal(wallet[0].provider.id, "gmgn-ai");
    assert.equal(wallet[0].capability.capability, "crypto/wallet_profile");
    const paper = library.find("search papers on predictive coding");
    assert.ok(["semanticscholar-org", "arxiv-org", "firecrawl-research-index"].includes(paper[0].provider.id));
  });

  it("is deterministic and breaks ties on cost", () => {
    const a = library.find("search papers research science").map((h) => h.capability.id);
    const b = library.find("search papers research science").map((h) => h.capability.id);
    assert.deepEqual(a, b);
    const top = library.find("search papers research science");
    const tied = top.filter((h) => h.score === top[0].score);
    for (let i = 1; i < tied.length; i++) assert.ok(tied[i - 1].capability.creditsCost <= tied[i].capability.creditsCost);
  });

  it("prices per-record capabilities by expected records and honours maxCredits", () => {
    assert.equal(library.estimate("fullenrich/people/search", 7), 35);
    assert.equal(library.estimate("gmgn-ai/crypto/wallet_profile", 7), 5);
    assert.ok(library.find("company enrich domain", { maxCredits: 10 }).every((h) => h.capability.creditsCost <= 10));
  });

  it("reports unmet requiresOneOf groups and treats null as missing", () => {
    assert.deepEqual(library.unmetRequirement("apollo/companies/enrich", {}), ["domain", "linkedin_url"]);
    assert.deepEqual(library.unmetRequirement("apollo/companies/enrich", { domain: null }), ["domain", "linkedin_url"]);
    assert.equal(library.unmetRequirement("apollo/companies/enrich", { domain: "frankx.ai" }), null);
  });

  it("validates declared option types and oneOf values before anything is charged", () => {
    assert.deepEqual(library.validateOptions("gmgn-ai/crypto/wallet_profile", { address: "abc", chain: "sol" }), []);
    assert.ok(library.validateOptions("gmgn-ai/crypto/wallet_profile", { address: 12345 }).some((p) => p.includes("address must be string")));
    assert.ok(library.validateOptions("gmgn-ai/crypto/wallet_profile", { address: "abc", chain: "xyz" }).some((p) => p.includes("chain must be one of")));
    assert.ok(library.validateOptions("gmgn-ai/crypto/wallet_profile", { address: "abc", undeclared: 1 }).length === 0, "undeclared options pass through");
  });

  it("tokenises hyphenated tags so natural queries earn the tag weight", () => {
    const hits = library.find("smart money wallets");
    assert.equal(hits[0].capability.id, "gmgn-ai/crypto/wallet_rank");
    const primary = library.find("primary source 13f filing");
    assert.equal(primary[0].provider.id, "sec-gov");
  });
});

describe("v93 — router, budget and receipts", () => {
  const library = Library.fromFile();
  const fixedNow = () => "2026-10-08T12:00:00.000Z";

  it("refuses over-budget calls before any transport call", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_profile": { records: [{ address: "x" }], creditsCost: 5 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 4 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_profile", options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "over_budget");
    assert.equal(transport.calls.length, 0);
  });

  it("refuses calls missing a required option before any charge", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", {});
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_profile" }), (err: unknown) => err instanceof AlexandriaError && err.code === "unmet_requirement");
    assert.equal(transport.calls.length, 0);
  });

  it("executes, debits the budget, appends a receipt with a stable hash", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const records = [{ address: "abc", pnl: 0.42 }];
      const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_profile": { records, creditsCost: 5 } });
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, now: fixedNow, sessionId: "session-hash" });
      const res = await alexandria.execute({ need: "whale wallet profile", options: { address: "abc", chain: "sol" } });
      assert.equal(res.hit.capability.id, "gmgn-ai/crypto/wallet_profile");
      assert.equal(res.budget.spent, 5);
      assert.equal(res.receipt.contentHash, hashRecords([{ pnl: 0.42, address: "abc" }]), "hash must be key-order independent");
      assert.equal(res.receipt.attestation, undefined, "no layers declared, no block");
      assert.equal(res.receipt.redistribution, "not-cleared", "no provider is cleared for resale until its terms say so");
      assert.match(res.receipt.callFingerprint, /^sha256:[0-9a-f]{64}$/);
      const lines = ledger.read();
      assert.equal(lines.length, 2, "a pending line before the paid call and the outcome receipt after it");
      assert.equal(lines[0].pending, true);
      assert.equal(lines[0].requestId, res.receipt.requestId, "the pending line carries the request id the outcome settles");
      assert.equal(lines[0].creditsCost, 5, "the pending line holds the reservation");
      assert.equal(ledger.spent(), 5, "a settled pending line is not counted twice");
      assert.equal(res.receipt.sessionId, "session-hash");
      assert.equal(res.receipt.reserved, 5);
      alexandria.close();
      const again = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-hash" });
      assert.equal(again.budget.spent, 5, "the same session resumes its spend from the ledger");
      again.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("emits the attestation block only when SIP layers are declared, and never bills errors", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", {
      "fiscal-ai/ownership/holders-list": { records: [{ id: 1 }], creditsCost: 0 },
      "sec-gov/filings/holdings_13f": { records: [], creditsCost: 0, error: { code: "not_found", message: "no filing" } },
    });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 10 });
    const ok = await alexandria.execute({ capabilityId: "fiscal-ai/ownership/holders-list", sipLayers: ["attestation", "file-contract"] });
    assert.ok(ok.receipt.attestation?.includes("Built on SIP"));
    assert.ok(ok.receipt.attestation?.includes("[attestation, file-contract]"));
    const bad = await alexandria.execute({ capabilityId: "sec-gov/filings/holdings_13f", sipLayers: ["attestation"] });
    assert.equal(bad.receipt.error?.code, "not_found");
    assert.equal(bad.receipt.attestation, undefined, "a failed call earns no block");
    assert.equal(bad.budget.spent, 0);
  });

  it("native transport reads the estate corpus for free", async () => {
    const alexandria = new Alexandria({ library, transports: [new NativeTransport(REPO_ROOT)], maxCredits: 0 });
    const metrics = await alexandria.execute({ capabilityId: "sis-metrics/current", options: { key: "registered_agents" } });
    assert.equal(metrics.result.records.length, 1);
    assert.equal(metrics.budget.spent, 0);
    assert.match(metrics.receipt.requestId ?? "", /^[0-9a-f-]{36}$/, "native receipts carry the request id too");
    const verticals = await alexandria.execute({ need: "list verticals registry" });
    assert.ok((verticals.result.records as { slug: string }[]).some((r) => r.slug === "alexandria"));
    const research = await alexandria.execute({ capabilityId: "sis-research/list", options: { query: "memory foundations" } });
    const paths = (research.result.records as { path: string }[]).map((r) => r.path);
    assert.ok(paths.some((p) => p.startsWith("docs/research/") && p.split("/").length > 3), "nested research artifacts are listed");
    const slugs = (verticals.result.records as { slug: string }[]).map((r) => r.slug);
    assert.deepEqual(slugs, [...slugs].sort((a, b) => a.localeCompare(b)), "vertical records are sorted so the receipt hash is reproducible across filesystems");
    assert.ok(paths.every((p) => p.startsWith("docs/research/") && p.endsWith(".md")));
  });

  it("Firecrawl transport posts an alexandria body with a request id and maps entries back by position", async () => {
    let seen: { url: string; body: { requestId?: string; alexandria: unknown[] }; auth: string; requestHeader: string } | undefined;
    const transport = new FirecrawlTransport({ apiKey: "test-key", fetchImpl: async (url, init) => {
      seen = { url, body: JSON.parse(init.body), auth: init.headers.Authorization, requestHeader: init.headers["x-request-id"] };
      return { ok: true, status: 200, json: async () => ({ data: { alexandria: [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", creditsCost: 5, records: [{ a: 1 }, { a: 2 }] }] } }) };
    } });
    const [result] = await transport.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank", options: { chain: "sol" }, requestId: "retry-7" }]);
    assert.equal(result.records.length, 2);
    assert.equal(result.creditsCost, 5);
    assert.equal(result.requestId, "retry-7");
    assert.equal(seen?.requestHeader, "retry-7", "the idempotency key is the x-request-id header");
    assert.equal(seen?.body.requestId, undefined, "the body carries only the contract's keys");
    assert.deepEqual(Object.keys(seen?.body ?? {}), ["alexandria"]);
    assert.equal(seen?.auth, "Bearer test-key");
    assert.deepEqual(seen?.body.alexandria, [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", options: { chain: "sol" } }]);
    const minted = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ data: { alexandria: [] } }) }) });
    const [noEntry] = await minted.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank" }]);
    assert.match(noEntry.requestId ?? "", /^[0-9a-f-]{36}$/, "a request id is minted when none is supplied");
  });

  it("Firecrawl transport surfaces a terms gate as data, never billed, never accepted", async () => {
    const transport = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ code: "THIRD_PARTY_DATA_TERMS_REQUIRED", error: "Accept the provider terms", requiresAction: { url: "https://example.test/terms", version: "2" } }) }) });
    const [result] = await transport.execute([{ provider: "similarweb", capability: "traffic/overview" }]);
    assert.equal(result.error?.code, "THIRD_PARTY_DATA_TERMS_REQUIRED");
    assert.deepEqual(result.error?.details, { status: 403, requiresAction: { url: "https://example.test/terms", version: "2" } });
    assert.equal(result.creditsCost, 0);
  });

  it("reserves the price synchronously, so concurrent calls cannot both pass on the same credits", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 8 });
    const results = await Promise.allSettled([
      alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }),
      alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    const rejected = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    assert.ok(rejected.reason instanceof AlexandriaError && rejected.reason.code === "over_budget");
    assert.equal(alexandria.budget.spent, 5);
    assert.equal(transport.calls.length, 1);
  });

  it("per-record capabilities need a declared ceiling, reserve ceiling times price, and an overrun suspends the capability", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-overrun-"));
    const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
    const transport = new MemoryTransport("firecrawl-alexandria", { "fullenrich/people/search": { records: [{}, {}, {}, {}, {}, {}, {}], creditsCost: 35 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 25, ledger, lock: false, sessionId: "session-overrun" });
    try {
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search" }), (err: unknown) => err instanceof AlexandriaError && err.code === "unbounded_records");
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 6 }), (err: unknown) => err instanceof AlexandriaError && err.code === "over_budget");
    assert.equal(transport.calls.length, 0);
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 5, options: { limit: 6 } }), (err: unknown) => err instanceof AlexandriaError && err.code === "unbounded_records", "a supplied limit above the ceiling is refused");
    await assert.rejects(alexandria.execute({ capabilityId: "people-data-labs/company/search", expectedRecords: 101, options: { sql: "SELECT * FROM company WHERE name = 'x'" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "invalid_option", "a ceiling above the provider's maximum is refused");
    assert.equal(transport.calls.length, 0);
    const res = await alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 5 });
    assert.equal(transport.calls[0].options?.limit, 5, "the ceiling is sent to the provider as its record-limit option");
    assert.equal(res.receipt.options.limit, 5);
    assert.equal(res.receipt.reserved, 25);
    assert.equal(res.receipt.creditsCost, 35, "a provider that ignores its own limit is recorded as an overrun, never hidden");
    assert.equal(res.budget.spent, 35);
    assert.equal(res.overrun, true);
    assert.equal(res.receipt.overrun, true);
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 1 }), (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended", "an overrun suspends the capability in this process");
    const later = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, lock: false });
    await assert.rejects(later.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 1 }), (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended", "and, through the overrun receipt, in every later process on this ledger");
    assert.equal(transport.calls.length, 1);
    assert.equal(res.receipt.catalogueReconciledAt, library.catalog.reconciledAt);
    const reconciled = new Alexandria({ library: new Library({ ...library.catalog, reconciledAt: "2026-12-01" }), transports: [transport], maxCredits: 100, ledger, lock: false });
    await reconciled.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 1 });
    assert.equal(transport.calls.length, 2, "a catalogue reconciled after the overrun clears the suspension; the reconciliation is the audit record");
    const bare = new Library({ ...library.catalog, providers: [{ ...library.get("fullenrich/people/search")!.provider, capabilities: library.get("fullenrich/people/search")!.provider.capabilities.map((c) => { const { recordLimitOption: _drop, ...rest } = c; return rest; }) }] });
    const unbounded = new Alexandria({ library: bare, transports: [transport], maxCredits: 100 });
    await assert.rejects(unbounded.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 2 }), (err: unknown) => err instanceof AlexandriaError && err.code === "unbounded_records", "without a declared record-limit option a per-record capability does not run");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses a blank request id before anything is reserved", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 10 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId: "" }), (err: unknown) => err instanceof AlexandriaError && err.code === "invalid_request_id");
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId: "   " }), (err: unknown) => err instanceof AlexandriaError && err.code === "invalid_request_id");
    assert.equal(transport.calls.length, 0);
    assert.equal(alexandria.budget.spent, 0);
  });

  it("never shrinks a held reservation when the price drops before the retry", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-shrink-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      let fail = true;
      const transport = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: readonly { provider: string; capability: string; requestId?: string }[]) => {
          if (fail) throw new Error("socket hang up");
          return [{ provider: calls[0].provider, capability: calls[0].capability, records: [{ a: 1 }], creditsCost: 3, observedAt: fixedNow(), requestId: calls[0].requestId }];
        },
      };
      const first = new Alexandria({ library, transports: [transport], maxCredits: 8, ledger, lock: false, sessionId: "session-shrink" });
      let caught: unknown;
      try { await first.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }); } catch (err) { caught = err; }
      const requestId = (caught as AlexandriaError).requestId ?? "";
      assert.equal(first.budget.spent, 5);
      const cheaper = new Library({ ...library.catalog, providers: library.catalog.providers.map((p) => p.id !== "gmgn-ai" ? p : { ...p, capabilities: p.capabilities.map((c) => c.id === "gmgn-ai/crypto/wallet_rank" ? { ...c, creditsCost: 3 } : c) }) });
      const resumed = new Alexandria({ library: cheaper, transports: [transport], maxCredits: 8, ledger, lock: false, sessionId: "session-shrink" });
      assert.equal(resumed.budget.spent, 5);
      fail = false;
      const settled = await resumed.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId });
      const pendingLines = ledger.read().filter((r) => r.pending);
      assert.equal(pendingLines[pendingLines.length - 1].reserved, 5, "the retry's pending line keeps the original hold, not the lower price");
      assert.equal(settled.receipt.reserved, 5);
      assert.equal(settled.receipt.creditsCost, 3);
      assert.equal(settled.budget.spent, 3, "the hold is released only once the provider reports the charge");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps a resumed session's ceiling and refuses to raise it", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-ceiling-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const native = new NativeTransport(REPO_ROOT);
      const opened = new Alexandria({ library, transports: [native], maxCredits: 10, ledger, sessionId: "session-cap" });
      await opened.execute({ capabilityId: "sis-metrics/current" });
      opened.close();
      assert.throws(() => new Alexandria({ library, transports: [native], maxCredits: 100, ledger, sessionId: "session-cap" }), /would raise the ceiling/);
      assert.ok(!existsSync(`${ledger.path}.session-cap.lock`), "a refused resume does not leave the session locked");
      const lowered = new Alexandria({ library, transports: [native], maxCredits: 5, ledger, sessionId: "session-cap" });
      assert.equal(lowered.budget.maxCredits, 5, "lowering is allowed");
      lowered.close();
      assert.equal(ledger.sessionCeiling("session-cap"), 10);
      assert.ok(!existsSync(`${ledger.path}.write.lock`), "the ledger write lock is held only for the duration of a read or append");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("on a transport failure: keeps the reservation held, persists the request id, and a retry with that id reuses the hold", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-uncertain-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const seen: string[] = [];
      let fail = true;
      const transport = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: readonly { provider: string; capability: string; requestId?: string }[]) => {
          seen.push(calls[0].requestId ?? "");
          if (fail) throw new Error("network down");
          return [{ provider: calls[0].provider, capability: calls[0].capability, records: [{ a: 1 }], creditsCost: 5, observedAt: fixedNow(), requestId: calls[0].requestId }];
        },
      };
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 8, ledger, sessionId: "session-uncertain" });
      let caught: unknown;
      try { await alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }); } catch (err) { caught = err; }
      assert.ok(caught instanceof AlexandriaError && caught.code === "uncertain_outcome" && caught.message.includes("network down"));
      const requestId = (caught as AlexandriaError).requestId ?? "";
      assert.match(requestId, /^[0-9a-f-]{36}$/, "the id was minted before the transport ran");
      assert.equal(seen[0], requestId, "the transport received the same id");
      assert.equal(alexandria.budget.spent, 5, "the reservation stays held: the provider may have billed it");
      const [pendingLine, receipt] = ledger.read();
      assert.equal(pendingLine.pending, true, "the pending line was written before the transport ran");
      assert.equal(pendingLine.requestId, requestId);
      assert.equal(receipt.requestId, requestId, "the id is persisted on the uncertain receipt");
      assert.equal(receipt.error?.code, "uncertain_outcome");
      assert.equal(receipt.creditsCost, 5, "the receipt carries the held reservation");
      await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "over_budget", "an unrelated call cannot spend the held credits");
      await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId, options: { period: "7d" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "retry_mismatch", "the hold is bound to the original call, not to the id alone");
      assert.equal(alexandria.budget.spent, 5, "a mismatched retry leaves the hold in place");
      assert.equal(seen.length, 1);
      const resumed = new Alexandria({ library, transports: [transport], maxCredits: 8, ledger, sessionId: "session-uncertain", lock: false });
      assert.equal(resumed.budget.spent, 5, "a restart restores the hold from the ledger");
      fail = false;
      const settled = await resumed.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId });
      assert.equal(seen[1], requestId, "a retry with the returned id reuses it instead of minting another");
      assert.equal(settled.budget.spent, 5, "the retry reuses the hold instead of reserving a second time");
      assert.equal(ledger.spent("session-uncertain"), 5, "the ledger counts the settled charge once");
      assert.equal(ledger.heldReservations("session-uncertain").size, 0, "the hold is released by the receipt that settled it");
      alexandria.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps the reservation when a successful response reports no usable charge", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }] } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 10 });
    const res = await alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
    assert.equal(res.receipt.chargeUnknown, true);
    assert.equal(res.receipt.creditsCost, 5, "an unreported charge is not a refund");
    assert.equal(res.budget.spent, 5);
    const calls: unknown[] = [];
    const firecrawl = new FirecrawlTransport({ apiKey: "k", fetchImpl: async (_url, init) => { calls.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => ({ data: { alexandria: [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", records: [{ a: 1 }] }] } }) }; } });
    const [result] = await firecrawl.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank" }]);
    assert.equal(result.chargeUnknown, true, "the transport flags a missing creditsCost instead of treating it as zero");
  });

  it("refuses to call the provider when the pending line cannot be written, and surfaces the request id when the outcome receipt cannot", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-persist-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 10, ledger, lock: false });
      mkdirSync(ledger.path); // the ledger path is now a directory: every append fails
      await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "receipt_persist_failed");
      assert.equal(transport.calls.length, 0, "nothing reached the provider");
      assert.equal(alexandria.budget.spent, 0, "nothing was reserved");
      // The outcome receipt fails after the charge: the pending line keeps the hold durable.
      // The pending line goes through appendUnlessSuspended, so the first plain append is the outcome receipt.
      class Flaky extends ReceiptLedger { writes = 0; override append(r: Parameters<ReceiptLedger["append"]>[0]) { if (++this.writes === 1) throw new Error("disk full"); super.append(r); } }
      const flaky = new Flaky(join(dir, "flaky", "receipts.jsonl"));
      const second = new Alexandria({ library, transports: [transport], maxCredits: 10, ledger: flaky, lock: false, sessionId: "session-flaky" });
      let caught: unknown;
      try { await second.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }); } catch (err) { caught = err; }
      assert.ok(caught instanceof AlexandriaError && caught.code === "receipt_persist_failed");
      const requestId = (caught as AlexandriaError).requestId ?? "";
      assert.match(requestId, /^[0-9a-f-]{36}$/, "the id is returned so a retry is not a fresh charge");
      assert.equal(second.budget.spent, 5, "the reservation is held again in this process");
      assert.equal(flaky.heldReservations("session-flaky").get(requestId)?.amount, 5, "the pending line keeps the reservation held in the ledger");
      assert.equal(new Alexandria({ library, transports: [transport], maxCredits: 10, ledger: flaky, lock: false, sessionId: "session-flaky" }).budget.spent, 5, "a restart restores it as a hold");
      const settled = await second.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", requestId });
      assert.equal(settled.budget.spent, 5, "a retry in the same process reuses the restored hold instead of reserving again");
      assert.equal(flaky.heldReservations("session-flaky").size, 0, "and settles the pending line");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("matches batched Firecrawl entries by identity and treats a missing entry as uncertain", async () => {
    const swapped = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ data: { alexandria: [
      { provider: "gmgn-ai", capability: "crypto/wallet_rank", records: [{ rank: 1 }], creditsCost: 5 },
      { provider: "gmgn-ai", capability: "crypto/wallet_profile", records: [{ profile: 1 }], creditsCost: 5 },
    ] } }) }) });
    const [profile, rank] = await swapped.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_profile" }, { provider: "gmgn-ai", capability: "crypto/wallet_rank" }]);
    assert.deepEqual(profile.records, [{ profile: 1 }], "a reordered response is matched by capability, never by position");
    assert.deepEqual(rank.records, [{ rank: 1 }]);
    const sentAt = Date.now();
    const slow = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => { await new Promise((r) => setTimeout(r, 60)); return { ok: true, status: 200, json: async () => ({ data: { alexandria: [
      { provider: "gmgn-ai", capability: "crypto/wallet_rank", records: [{ a: 1 }], creditsCost: 5 },
      { provider: "gmgn-ai", capability: "crypto/wallet_profile", records: [{ b: 1 }], creditsCost: 5, observedAt: "2026-10-01T00:00:00Z" },
    ] } }) }; } });
    const [late, stamped] = await slow.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank" }, { provider: "gmgn-ai", capability: "crypto/wallet_profile" }]);
    assert.ok(Date.parse(late.observedAt) >= sentAt + 30, "observedAt is when the answer arrived, never when the request was sent");
    assert.equal(stamped.observedAt, "2026-10-01T00:00:00.000Z", "a provider-supplied observation time is preferred");
    const missing = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ data: { alexandria: [] } }) }) });
    const alexandria = new Alexandria({ library, transports: [missing], maxCredits: 8 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "uncertain_outcome" && err.message.includes("no entry"));
    assert.equal(alexandria.budget.spent, 5, "a 2xx without this call's entry does not prove the provider did not bill it");
  });

  it("treats a Firecrawl 5xx as an uncertain outcome and keeps the reservation", async () => {
    const firecrawl = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: false, status: 502, json: async () => ({ error: "bad gateway" }) }) });
    const alexandria = new Alexandria({ library, transports: [firecrawl], maxCredits: 8 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "uncertain_outcome" && err.message.includes("502"));
    assert.equal(alexandria.budget.spent, 5, "a gateway failure after the request may have reached the provider holds the credits");
    const refused = new FirecrawlTransport({ apiKey: "k", fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: "bad request" }) }) });
    const definite = new Alexandria({ library, transports: [refused], maxCredits: 8 });
    const res = await definite.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
    assert.equal(res.receipt.error?.code, "http_400");
    assert.equal(res.budget.spent, 0, "a 4xx is a definite refusal and is not billed");
  });

  it("refuses a ledger line that parses but cannot be tallied", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-tally-"));
    try {
      const path = join(dir, "receipts.jsonl");
      writeFileSync(path, '{"id":"rcpt_x","sessionId":"s","creditsCost":"5","reserved":5,"callFingerprint":"sha256:0"}\n', "utf8");
      assert.throws(() => new ReceiptLedger(path).spent("s"), /corrupt at line 1: creditsCost/);
      writeFileSync(path, '{"id":"rcpt_x","sessionId":"s","creditsCost":5,"reserved":5,"maxCredits":10,"callFingerprint":"sha256:0"}\n{"id":"rcpt_y","sessionId":"s","reserved":5,"callFingerprint":"sha256:0"}\n', "utf8");
      assert.throws(() => new ReceiptLedger(path).spent("s"), /corrupt at line 2/);
      writeFileSync(path, '{"id":"rcpt_x","sessionId":"s","creditsCost":5,"reserved":5,"callFingerprint":"sha256:0"}\n', "utf8");
      assert.throws(() => new ReceiptLedger(path).spent("s"), /corrupt at line 1: maxCredits/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("validates the nested option contract when the catalogue loads", () => {
    const base = { version: "1", reconciledAt: "2026-10-08" };
    const cap = (extra: Record<string, unknown>) => ({ id: "p/x", capability: "x", name: "X", description: "d", creditsCost: 1, perRecord: false, tags: ["t"], ...extra });
    const prov = (extra: Record<string, unknown>) => ({ ...base, providers: [{ id: "p", kind: "firecrawl-alexandria", name: "P", description: "d", source: "s", categories: ["c"], capabilities: [cap(extra)] }] });
    assert.deepEqual(validateCatalog(prov({ options: { name: "q" } })).map((p) => p.path), ["$.providers[0].capabilities[0].options"]);
    assert.deepEqual(validateCatalog(prov({ requiresOneOf: "query" })).map((p) => p.path), ["$.providers[0].capabilities[0].requiresOneOf"]);
    assert.deepEqual(validateCatalog(prov({ options: [{ name: "q", type: "text" }] })).map((p) => p.path), ["$.providers[0].capabilities[0].options[0].type"]);
    assert.deepEqual(validateCatalog(prov({ perRecord: true })).map((p) => p.path), ["$.providers[0].capabilities[0].recordLimitOption"]);
    assert.deepEqual(validateCatalog(prov({ perRecord: true, recordLimitOption: "limit", options: [{ name: "limit", type: "string" }] })).map((p) => p.path), ["$.providers[0].capabilities[0].recordLimitOption"]);
    assert.equal(validateCatalog(prov({ perRecord: true, recordLimitOption: "limit", options: [{ name: "limit", type: "number", min: 1, max: 6 }] })).length, 0);
    const cleared = { ...prov({}), providers: [{ ...prov({}).providers[0], redistribution: { policy: "cleared" } }] };
    assert.deepEqual(validateCatalog(cleared).map((p) => p.path), ["$.providers[0].redistribution.termsVersion"], "a cleared provider must name the terms that clear it");
    assert.ok(loadCatalog().providers.every((p) => p.redistribution === undefined || p.redistribution.policy === "not-cleared"), "no provider in the shipped catalogue is cleared for resale");
  });

  it("lets exactly one of two concurrent processes take over a stale lock", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-stale-"));
    try {
      const ledgerPath = join(dir, "receipts.jsonl");
      plantLock(`${ledgerPath}.race.lock`, "999999"); // a pid that is not alive
      const receiptsUrl = pathToFileURL(join(REPO_ROOT, "src", "alexandria", "receipts.ts")).href;
      const script = `import { SessionLock } from ${JSON.stringify(receiptsUrl)}; const l = new SessionLock(${JSON.stringify(ledgerPath)}, "race"); try { l.acquire(); console.log("acquired"); setTimeout(() => l.release(), 400); } catch (e) { console.log("refused: " + e.message); }`;
      const results = [0, 1].map(() => spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], { cwd: REPO_ROOT, encoding: "utf8" }));
      const outputs = results.map((r) => r.stdout.trim());
      assert.ok(outputs.every((o) => o === "acquired" || o.startsWith("refused: Budget session race is held by process")), `unexpected: ${JSON.stringify(outputs)} ${results.map((r) => r.stderr).join("")}`);
      assert.ok(!existsSync(`${ledgerPath}.race.lock`), "the lock is released at the end");
      // The two processes ran one after the other here; the atomic claim is the rename, which
      // either succeeds once or fails: a losing claimant can never unlink a lock it did not win.
      assert.equal(new SessionLock(ledgerPath, "race").path, `${ledgerPath}.race.lock`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("hashes an own __proto__ key as an ordinary record field", () => {
    const withProto = JSON.parse('{"a":1,"__proto__":{"x":1}}') as Record<string, unknown>;
    assert.notEqual(hashRecords([withProto]), hashRecords([{ a: 1 }]), "a record with an own __proto__ key must not collide with one without it");
    assert.equal(hashRecords([withProto]), hashRecords([JSON.parse('{"__proto__":{"x":1},"a":1}') as Record<string, unknown>]), "and the hash stays key-order independent");
  });

  it("keeps unreconciled capabilities out of routing and refuses to execute them", async () => {
    const placeholders = ["similarweb/traffic/overview", "firecrawl-trends/trends/interest"];
    for (const id of placeholders) assert.equal(library.get(id)?.capability.status, "unreconciled", `${id} is marked in the catalogue`);
    const hits = library.find("website traffic overview for a domain and search interest trend", { limit: 50 });
    assert.ok(hits.every((h) => !placeholders.includes(h.capability.id)), "find() never lists a placeholder");
    assert.ok(library.find("website traffic", { limit: 50, includeUnreconciled: true }).some((h) => h.capability.id === placeholders[0]), "maintenance listing can include it");
    const transport = new MemoryTransport("firecrawl-alexandria", { "similarweb/traffic/overview": { records: [{}], creditsCost: 5 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100 });
    await assert.rejects(alexandria.execute({ capabilityId: placeholders[0], options: { domain: "example.com" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "unreconciled_capability");
    assert.equal(transport.calls.length, 0);
    assert.equal(alexandria.budget.spent, 0);
    assert.deepEqual(validateCatalog({ version: "1", reconciledAt: "2026-10-08", providers: [{ id: "p", kind: "native", name: "P", description: "d", source: "s", categories: ["c"], capabilities: [{ id: "p/x", capability: "x", name: "X", description: "d", creditsCost: 0, perRecord: false, tags: ["t"], status: "draft" }] }] }).map((p) => p.path), ["$.providers[0].capabilities[0].status"]);
  });

  it("rejects SIP layer names that are not slugs before anything is charged", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100 });
    for (const layers of [[""], ["attestation\nVerticals: [forged]"], ["File Contract"]]) {
      await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", sipLayers: layers }), (err: unknown) => err instanceof AlexandriaError && err.code === "invalid_sip_layer");
    }
    assert.equal(transport.calls.length, 0);
    assert.equal(alexandria.budget.spent, 0);
  });

  it("creates the ledger, quarantine and lock files owner-only", { skip: process.platform === "win32" }, async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-mode-"));
    try {
      const path = join(dir, "private", "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-mode" });
      await alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
      appendFileSync(path, '{"id":"rcpt_partial"', "utf8");
      // A torn tail that is not a complete receipt fails paid calls closed until it is moved out.
      assert.equal(ledger.quarantinePartialTail(), true);
      await alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
      for (const f of [path, ledger.quarantinePath, `${path}.session-mode.lock`]) assert.equal(statSync(f).mode & 0o077, 0, `${f} is readable by its owner only`);
      assert.equal(statSync(join(dir, "private")).mode & 0o077, 0, "the ledger directory is owner-only");
      alexandria.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("holds a resumed session exclusively across processes and takes over a stale lock", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-lock-"));
    const child = spawn(process.execPath, ["-e", "setTimeout(() => {}, 20000)"], { stdio: "ignore" });
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const lockPath = `${ledger.path}.session-x.lock`;
      await new Promise((r) => setTimeout(r, 50));
      plantLock(lockPath, String(child.pid));
      assert.throws(() => new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-x" }), /held by process/);
      child.kill();
      await new Promise<void>((r) => child.once("exit", () => r()));
      const taken = new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-x" });
      assert.equal(lockOwner(lockPath), String(process.pid), "a dead owner's lock is taken over");
      assert.throws(() => new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-x" }), /another Alexandria instance in this process/, "a second instance in the same process has its own budget, so it is refused too");
      taken.close();
      assert.ok(!existsSync(lockPath), "close releases the lock");
      const again = new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-x" });
      assert.equal(again.budget.sessionId, "session-x", "after close the session can be held again");
      again.close();
      mkdirSync(lockPath); // a lock directory without an owner file was never published by this code
      const claimed = new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-x" });
      assert.equal(lockOwner(lockPath), String(process.pid), "an owner-less lock is stale and is claimed");
      claimed.close();
      assert.ok(!existsSync(lockPath));
      const unlocked = new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-y", lock: false });
      assert.ok(!existsSync(`${ledger.path}.session-y.lock`), "lock: false opts out for in-process use");
      unlocked.close();
    } finally {
      if (!child.killed) child.kill();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("restores spend per budget session and tolerates a cut-off ledger line", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-session-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
      const first = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-a" });
      await first.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
      await first.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
      appendFileSync(path, '{"id":"rcpt_partial","sessionId":"session-a","credits', "utf8");
      const detailed = ledger.readDetailed();
      assert.equal(detailed.truncatedTail, true);
      assert.equal(detailed.receipts.filter((r) => !r.pending).length, 2);
      first.close();
      const resumed = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-a" });
      assert.equal(resumed.budget.spent, 10, "the same session resumes its spend");
      const callsBefore = transport.calls.length;
      await assert.rejects(resumed.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "receipt_persist_failed" && /cut-off line/.test(err.message), "a torn tail that is not a complete receipt may be suspension evidence: paid calls fail closed");
      assert.equal(transport.calls.length, callsBefore, "nothing reached the provider");
      assert.equal(resumed.budget.spent, 10, "and nothing stays reserved");
      assert.equal(ledger.quarantinePartialTail(), true, "an operator moves the fragment out explicitly");
      const third = await resumed.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
      assert.equal(third.receipt.observedAt, third.result.observedAt, "the receipt keeps the provider observation time");
      const after = ledger.readDetailed();
      assert.equal(after.truncatedTail, false, "the cut-off tail was moved out before the append");
      assert.equal(after.receipts.filter((r) => !r.pending).length, 3);
      assert.ok(readFileSync(ledger.quarantinePath, "utf8").includes('"rcpt_partial"'), "the fragment is kept in quarantine");
      assert.equal(resumed.budget.spent, 15);
      const fresh = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger });
      assert.equal(fresh.budget.spent, 0, "a new session starts with a fresh allowance");
      assert.equal(ledger.spent(), 15);
      assert.ok(ledger.read().every((r) => r.sessionId === "session-a"));
      resumed.close();
      fresh.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses a corrupt line in the middle of the ledger, and a complete but corrupt last line", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-corrupt-"));
    try {
      const path = join(dir, "receipts.jsonl");
      writeFileSync(path, 'not json\n{"id":"rcpt_x","sessionId":"s","creditsCost":1}\n', "utf8");
      assert.throws(() => new ReceiptLedger(path).read(), /corrupt at line 1/);
      const good = '{"id":"rcpt_x","sessionId":"s","creditsCost":5,"reserved":5,"maxCredits":10,"callFingerprint":"sha256:0"}\n';
      writeFileSync(path, `${good}{"id":"rcpt_y","sessionId":"s","creditsCost":5,"reserved":5,"maxCredits":10,"callFingerprint":"sha256:0"\n`, "utf8");
      assert.throws(() => new ReceiptLedger(path).read(), /corrupt at line 2/, "a last line that ends in a newline is complete; if it does not parse it is corruption, not a cut-off write");
      writeFileSync(path, `${good}{"id":"rcpt_y","sessionId":"s","credi`, "utf8");
      assert.deepEqual(new ReceiptLedger(path).readDetailed().truncatedTail, true, "only an unterminated last line is a cut-off write");
      const ledger = new ReceiptLedger(path);
      writeFileSync(path, 'not json\n', "utf8");
      assert.throws(() => new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-corrupt" }), /corrupt at line 1/);
      assert.ok(!existsSync(`${path}.session-corrupt.lock`), "a constructor that fails after taking the session lock releases it");
      writeFileSync(path, "", "utf8");
      new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "session-corrupt" }).close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a malformed credit limit at startup", () => {
    assert.equal(parseMaxCredits(undefined), 200);
    assert.equal(parseMaxCredits("50"), 50);
    assert.throws(() => parseMaxCredits("200x"), /ALEXANDRIA_MAX_CREDITS/);
    assert.throws(() => parseMaxCredits("-1"), /ALEXANDRIA_MAX_CREDITS/);
    assert.throws(() => new Alexandria({ library, transports: [], maxCredits: Number.NaN }), /maxCredits/);
  });
});

describe("v93 — Forge experiments", () => {
  it("registry validates and every experiment names a falsifier", () => {
    const list = loadExperiments();
    assert.ok(list.length >= 5);
    for (const e of list) assert.ok(e.falsifier.length > 20, `${e.id} falsifier`);
    assert.equal(overdue(list, "2026-10-08").length, 0);
    assert.ok(overdue(list, "2027-01-01").length > 0);
  });

  it("status machine refuses verdicts without receipts", () => {
    const base: Experiment = { id: "exp-2026-10-08-x", house: "forge", hypothesis: "something testable here", metric: "a number we count", falsifier: "the number is zero after a month", budget: "10 credits", owner: "frank", status: "running", openedAt: "2026-10-08", closesBy: "2026-11-08", receipts: [] };
    assert.throws(() => transition(base, "proven"), /needs a receipt/);
    assert.throws(() => transition(base, "proven", { receipts: ["rcpt_1"] }), /ledger receipt id/);
    const good = "rcpt_0f9c8b3a-6b6c-4d2e-9f1a-1234567890ab";
    assert.throws(() => transition(base, "proven", { receipts: [good] }), /needs a receipt lookup/, "a well-formed id alone is not evidence");
    const ledgerOf = (rows: Record<string, { id: string; pending?: boolean; error?: unknown }>) => (id: string) => rows[id];
    assert.throws(() => transition(base, "proven", { receipts: [good], lookup: ledgerOf({}) }), /not in the ledger/);
    assert.throws(() => transition(base, "proven", { receipts: [good], lookup: ledgerOf({ [good]: { id: good, pending: true } }) }), /pending line/);
    assert.throws(() => transition(base, "proven", { receipts: [good], lookup: ledgerOf({ [good]: { id: good, error: { code: "x" } } }) }), /failed call/);
    const proven = transition(base, "proven", { receipts: [good], lookup: ledgerOf({ [good]: { id: good } }) });
    assert.equal(proven.status, "proven");
    assert.equal(base.status, "running", "input not mutated");
    assert.throws(() => transition(proven, "running"), /cannot move/);
    assert.ok(canTransition("parked", "running"));
    assert.ok(!canTransition("falsified", "running"));
    assert.ok(validateRegistry({ experiments: [{ ...base, status: "falsified" }] }).some((p) => p.message.includes("needs at least one receipt")));
    assert.ok(validateRegistry({ experiments: [{ ...base, status: "falsified", receipts: [""] }] }).some((p) => p.message.includes("ledger receipt id")));
    const parked = transition(base, "parked");
    assert.throws(() => transition(parked, "running"), /needs a new closesBy/);
    assert.throws(() => transition(parked, "running", { closesBy: "2026-11-08", today: "2026-10-12" }), /later than/);
    assert.throws(() => transition(parked, "running", { closesBy: "2026-12-01", today: "2027-01-01" }), /after today/);
    assert.equal(transition(parked, "running", { closesBy: "2026-12-01", today: "2026-10-12" }).closesBy, "2026-12-01");
    assert.throws(() => transition(parked, "running", { closesBy: "2027-02-30", today: "2026-10-12" }), /real calendar date/);
    assert.ok(validateRegistry({ experiments: [{ ...base, closesBy: "2026-02-31" }] }).some((p) => p.message.includes("real calendar date")), "a shape-correct impossible date is refused");
    assert.ok(validateRegistry({ experiments: [{ ...base, openedAt: "2026-99-99" }] }).some((p) => p.message.includes("real calendar date")));
  });
});

describe("v93 — MCP server", () => {
  const library = Library.fromFile();

  it("lists five tools and rejects unknown arguments without charging", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-mcp-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const transport = new MemoryTransport("firecrawl-alexandria", { "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
      const alexandria = new Alexandria({ library, transports: [transport, new NativeTransport(REPO_ROOT)], maxCredits: 50, ledger });
      const server = new AlexandriaMcpServer({ alexandria, ledger });
      const list = await server.handleRequest({ method: "tools/list", id: 1 });
      assert.deepEqual((list?.result as { tools: { name: string }[] }).tools.map((t) => t.name), ["alexandria_find", "alexandria_plan", "alexandria_execute", "alexandria_receipts", "alexandria_experiments"]);
      const bad = await server.handleRequest({ method: "tools/call", id: 2, params: { name: "alexandria_execute", arguments: { capabilityId: "gmgn-ai/crypto/wallet_rank", bogus: 1 } } });
      assert.equal((bad?.result as { isError: boolean }).isError, true);
      assert.equal(transport.calls.length, 0);
      const ok = await server.handleRequest({ method: "tools/call", id: 3, params: { name: "alexandria_execute", arguments: { capabilityId: "gmgn-ai/crypto/wallet_rank" } } });
      const content = ok?.result as { structuredContent: { receipt: { creditsCost: number }; budget: { spent: number } } };
      assert.equal(content.structuredContent.budget.spent, 5);
      ledger.append({ ...ledger.read().find((r) => !r.pending)!, id: "rcpt_other", sessionId: "someone-else", options: { address: "private" } });
      const receipts = await server.handleRequest({ method: "tools/call", id: 4, params: { name: "alexandria_receipts", arguments: {} } });
      const rc = (receipts?.result as { structuredContent: { spentThisSession: number; spentAllSessions: number; truncatedTail: boolean; sessionId: string; receipts: { sessionId: string }[] } }).structuredContent;
      assert.equal(rc.spentThisSession, 5);
      assert.equal(rc.spentAllSessions, 10);
      assert.equal(rc.truncatedTail, false);
      assert.equal(rc.sessionId, alexandria.budget.sessionId);
      assert.ok(rc.receipts.every((r) => r.sessionId === alexandria.budget.sessionId), "other sessions' receipts stay out by default");
      assert.equal(rc.receipts.length, 1, "a settled pending line is not listed");
      const audit = await server.handleRequest({ method: "tools/call", id: 7, params: { name: "alexandria_receipts", arguments: { allSessions: true } } });
      assert.equal((audit?.result as { structuredContent: { receipts: unknown[] } }).structuredContent.receipts.length, 2);
      const badFlag = await server.handleRequest({ method: "tools/call", id: 8, params: { name: "alexandria_receipts", arguments: { allSessions: "yes" } } });
      assert.equal((badFlag?.result as { isError: boolean }).isError, true);
      const badLayers = await server.handleRequest({ method: "tools/call", id: 9, params: { name: "alexandria_execute", arguments: { capabilityId: "gmgn-ai/crypto/wallet_rank", sipLayers: [42] } } });
      assert.equal((badLayers?.result as { isError: boolean }).isError, true, "a non-string layer is refused, not coerced");
      assert.equal(transport.calls.length, 1, "and nothing was charged for it");
      const blankId = await server.handleRequest({ method: "tools/call", id: 10, params: { name: "alexandria_execute", arguments: { capabilityId: "gmgn-ai/crypto/wallet_rank", requestId: "" } } });
      assert.ok((blankId?.result as { isError: boolean; content: { text: string }[] }).content[0].text.includes("requestId must be a non-empty string"));
      assert.equal(transport.calls.length, 1, "a blank request id is refused before any charge");
      const exps = await server.handleRequest({ method: "tools/call", id: 5, params: { name: "alexandria_experiments", arguments: { status: "running" } } });
      assert.ok((exps?.result as { structuredContent: { experiments: unknown[] } }).structuredContent.experiments.length >= 1);
      const unknown = await server.handleRequest({ method: "nope", id: 6 });
      assert.equal(unknown?.error?.code, -32601);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("v93 — paid-call guard fix-forward (#320 audit)", () => {
  const library = Library.fromFile();
  const cap = "gmgn-ai/crypto/wallet_profile";

  it("refuses a blank sessionId before taking a lock or writing a receipt", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      assert.throws(() => new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "" }), /sessionId must be a non-empty string/);
      assert.throws(() => new Alexandria({ library, transports: [], maxCredits: 10, ledger, sessionId: "   " }), /sessionId must be a non-empty string/);
      assert.equal(existsSync(join(dir, "receipts.jsonl")), false);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("refuses execution after close() released the session lock", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const transport = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "closed-session" });
      alexandria.close();
      await assert.rejects(alexandria.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "session_closed");
      assert.equal(transport.calls.length, 0);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("sees an overrun recorded by another live instance before admitting the next call", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const over = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 50 } });
      const fine = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      const a = new Alexandria({ library, transports: [over], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "session-a" });
      const b = new Alexandria({ library, transports: [fine], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "session-b" });
      try {
        const res = await a.execute({ capabilityId: cap, options: { address: "x" } });
        assert.equal(res.overrun, true);
        await assert.rejects(b.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended");
        assert.equal(fine.calls.length, 0);
      } finally { a.close(); b.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("stamps the router request id on outcomes from a transport that omits it", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      const bare = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string }[]) => calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 5, observedAt: "2026-10-08T12:00:00.000Z" })) };
      const alexandria = new Alexandria({ library, transports: [bare as never], maxCredits: 100, ledger, sessionId: "bare-transport" });
      try {
        const res = await alexandria.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-bare-1" });
        assert.equal(res.result.requestId, "req-bare-1");
        assert.equal(ledger.spent("bare-transport"), 5, "the outcome settles the pending hold instead of adding to it");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it("treats an outcome for a different provider or capability as uncertain and keeps the hold", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const ledger = new ReceiptLedger(join(dir, "receipts.jsonl"));
      for (const wrong of [{ provider: "other-provider" }, { capability: "crypto/wallet_rank" }]) {
        const t = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 5, observedAt: "2026-10-08T12:00:00.000Z", requestId: c.requestId, ...wrong })) };
        const sessionId = `mismatch-${Object.keys(wrong)[0]}`;
        const alexandria = new Alexandria({ library, transports: [t as never], maxCredits: 100, ledger, sessionId });
        try {
          let id: string | undefined;
          await assert.rejects(alexandria.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => { id = (err as AlexandriaError).requestId; return err instanceof AlexandriaError && err.code === "uncertain_outcome"; });
          assert.ok(id, "the caller gets the request id back to retry");
          assert.equal(ledger.heldReservations(sessionId).size, 1, "a mismatched outcome never settles the pending hold");
          assert.ok(!ledger.read().some((r) => r.sessionId === sessionId && !r.pending && !r.error), "no settled receipt is written for a mismatched outcome");
        } finally { alexandria.close(); }
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("checks suspension and writes the pending line under one ledger lock, so a stale admission is not dispatched", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const over = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 50 } });
      const fine = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      // B's unlocked suspension read is stale (it ran before A's overrun landed); only the
      // locked check-and-append that precedes dispatch can still stop the call.
      class StaleLedger extends ReceiptLedger { override suspendedCapabilities(): Set<string> { return new Set(); } }
      const staleLedger = new StaleLedger(path);
      const b = new Alexandria({ library, transports: [fine], maxCredits: 100, ledger: staleLedger, sessionId: "race-b" });
      const a = new Alexandria({ library, transports: [over], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "race-a" });
      try {
        assert.equal((await a.execute({ capabilityId: cap, options: { address: "x" } })).overrun, true);
        const before = readFileSync(path, "utf8");
        await assert.rejects(b.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended");
        assert.equal(fine.calls.length, 0, "the suspended capability was never dispatched");
        assert.equal(readFileSync(path, "utf8"), before, "no pending line was written for the refused call");
        assert.equal(staleLedger.spent("race-b"), 0);
      } finally { a.close(); b.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("scans the ledger for overruns incrementally: new lines, finished tails, and a shrunk file", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const base = { id: "rcpt_test", callFingerprint: "f", provider: "p", capability: "c", records: [], creditsCost: 1, reserved: 1, sessionId: "s", maxCredits: 10, observedAt: "2026-10-08T12:00:00.000Z" };
      const line = (extra: Record<string, unknown>) => JSON.stringify({ ...base, ...extra }) + "\n";
      writeFileSync(path, line({}));
      assert.equal(ledger.suspendedCapabilities().size, 0);
      const overrun = line({ capability: "x", overrun: true, catalogueReconciledAt: "2026-10-01" });
      appendFileSync(path, overrun.slice(0, 20));
      assert.throws(() => ledger.suspendedCapabilities(), /cut-off line/, "a torn tail that is not a complete receipt fails closed");
      appendFileSync(path, overrun.slice(20));
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/x"], "the finished line is picked up on the next scan");
      assert.equal(ledger.suspendedCapabilities("2026-10-02").size, 0, "a later reconciliation still clears it from the cache");
      appendFileSync(path, "{not json\n");
      assert.throws(() => ledger.suspendedCapabilities(), /corrupt/, "new corrupt lines still fail closed");
      writeFileSync(path, line({ capability: "y", overrun: true }));
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/y"], "a shrunk ledger resets the cache instead of trusting it");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("counts a torn final line that is a complete receipt and never truncates it", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const over = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 50 } });
      const a = new Alexandria({ library, transports: [over], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "torn-a" });
      try { assert.equal((await a.execute({ capabilityId: cap, options: { address: "x" } })).overrun, true); } finally { a.close(); }
      // The overrun receipt lost its newline, as a crash between the write and the newline would leave it.
      const raw = readFileSync(path, "utf8");
      writeFileSync(path, raw.slice(0, -1));
      const ledger = new ReceiptLedger(path);
      assert.equal(ledger.readDetailed().truncatedTail, false, "a complete receipt is not a cut-off write");
      assert.ok(ledger.read().some((r) => r.overrun), "the torn overrun receipt is counted");
      assert.deepEqual([...ledger.suspendedCapabilities()], [cap], "and it suspends the capability");
      const fine = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 }, "gmgn-ai/crypto/wallet_rank": { records: [{ a: 1 }], creditsCost: 5 } });
      const b = new Alexandria({ library, transports: [fine], maxCredits: 100, ledger, sessionId: "torn-b" });
      try {
        await assert.rejects(b.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended");
        await b.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" });
        assert.equal(fine.calls.length, 1, "only the unsuspended capability was dispatched");
      } finally { b.close(); }
      assert.ok(readFileSync(path, "utf8").startsWith(raw), "the torn line was finished with a newline, never truncated");
      assert.ok(!existsSync(ledger.quarantinePath), "nothing was moved to quarantine");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("holds the capability turn through the provider call, so a second call waits for the first outcome", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      let releaseFirst!: () => void;
      const gate = new Promise<void>((resolve) => { releaseFirst = resolve; });
      const slowOver = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => { await gate; return calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 50, observedAt: "2026-10-08T12:00:00.000Z", requestId: c.requestId })); } };
      const fine = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      const a = new Alexandria({ library, transports: [slowOver as never], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "turn-a" });
      const b = new Alexandria({ library, transports: [fine], maxCredits: 100, ledger: new ReceiptLedger(path), sessionId: "turn-b" });
      try {
        const first = a.execute({ capabilityId: cap, options: { address: "x" } });
        await new Promise((r) => setTimeout(r, 20));
        // B is admitted (A's overrun is not known yet) but must not be dispatched while A is in flight.
        const second = b.execute({ capabilityId: cap, options: { address: "x" } });
        await new Promise((r) => setTimeout(r, 50));
        assert.equal(fine.calls.length, 0, "the second call waits for the first call's outcome");
        releaseFirst();
        assert.equal((await first).overrun, true);
        await assert.rejects(second, (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended");
        assert.equal(fine.calls.length, 0, "and is refused once the overrun lands");
        assert.equal(b.budget.spent, 0, "with nothing reserved");
      } finally { a.close(); b.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("rescans in full when the ledger file is replaced, even by a longer one", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const base = { id: "rcpt_test", callFingerprint: "f", provider: "p", capability: "c", records: [], creditsCost: 1, reserved: 1, sessionId: "s", maxCredits: 10, observedAt: "2026-10-08T12:00:00.000Z" };
      const line = (extra: Record<string, unknown>) => JSON.stringify({ ...base, ...extra }) + "\n";
      writeFileSync(path, line({ capability: "x", overrun: true }));
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/x"]);
      // Rewritten in place (same inode) with a longer, different history: the prefix no longer matches.
      writeFileSync(path, line({ capability: "y", sessionId: "other" }) + line({ capability: "z" }));
      assert.equal(ledger.suspendedCapabilities().size, 0, "a rewritten ledger is rescanned, not appended to the old cache");
      // Replaced by rename (new inode) with a file whose first 4 KB match the cached prefix but whose
      // later history differs: only the file identity tells the cache it is stale.
      const filler = Array.from({ length: 60 }, (_, i) => line({ capability: `f${i}` })).join("");
      writeFileSync(path, filler + line({ capability: "x", overrun: true }));
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/x"]);
      const replacement = join(dir, "replacement.jsonl");
      writeFileSync(replacement, filler + line({ capability: "v" }) + line({ capability: "w", overrun: true }));
      renameSync(replacement, path);
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/w"]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("outcome writes refuse a torn tail that is not a receipt, leave it in place and keep admits closed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      // Another process crashes mid-write while this call is at the provider.
      const tearing = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => { appendFileSync(path, '{"id":"rcpt_torn","overrun":tr'); return calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 5, observedAt: "2026-10-08T12:00:00.000Z", requestId: c.requestId })); } };
      const alexandria = new Alexandria({ library, transports: [tearing as never], maxCredits: 100, ledger, sessionId: "torn-outcome" });
      try {
        await assert.rejects(alexandria.execute({ capabilityId: cap, options: { address: "x" } }), (err: unknown) => err instanceof AlexandriaError && err.code === "receipt_persist_failed" && /cut-off line/.test(err.message));
        assert.ok(readFileSync(path, "utf8").endsWith('{"id":"rcpt_torn","overrun":tr'), "the torn tail stays where it is");
        assert.ok(!existsSync(ledger.quarantinePath), "writes never quarantine on their own");
        assert.equal(alexandria.budget.spent, 5, "the reservation stays held by the pending line");
        await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), (err: unknown) => err instanceof AlexandriaError && err.code === "receipt_persist_failed", "admits stay closed until an operator acts");
        assert.equal(ledger.quarantinePartialTail(), true, "the operator path still works");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("rehashes the whole cached prefix, so a rewrite past the first 4 KB is caught", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const base = { id: "rcpt_test", callFingerprint: "f", provider: "p", capability: "c", records: [], creditsCost: 1, reserved: 1, sessionId: "s", maxCredits: 10, observedAt: "2026-10-08T12:00:00.000Z" };
      const line = (extra: Record<string, unknown>) => JSON.stringify({ ...base, ...extra }) + "\n";
      const head = Array.from({ length: 40 }, (_, i) => line({ capability: `f${i}` })).join("");
      assert.ok(head.length > 4096);
      const before = line({ capability: "aa", overrun: false });
      const after = line({ capability: "xxx", overrun: true });
      assert.equal(before.length, after.length);
      writeFileSync(path, head + before);
      assert.equal(ledger.suspendedCapabilities().size, 0);
      // Same inode, same first 4 KB, same length: only a record past 4 KB changed, now an overrun.
      writeFileSync(path, head + after);
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/xxx"], "the changed record past 4 KB is seen");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("keys the capability turn on the ledger's real identity and times out the in-process wait", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      mkdirSync(join(dir, "sub"));
      const path = join(dir, "receipts.jsonl");
      const alias = `${dir}/sub/../receipts.jsonl`;
      const release = await capabilityTurn(path, cap);
      const started = Date.now();
      await assert.rejects(capabilityTurn(alias, cap, 100), /held the .* turn/, "an alias of the same ledger shares the turn");
      assert.ok(Date.now() - started < 2000, "the in-process wait is bounded");
      release();
      const again = await capabilityTurn(alias, cap, 100);
      again();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("snapshots validated options before waiting for the turn", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const seen: unknown[] = [];
      const t = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string; options?: Record<string, unknown>; requestId?: string }[]) => { seen.push(...calls.map((c) => c.options)); return calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 5, observedAt: "2026-10-08T12:00:00.000Z", requestId: c.requestId })); } };
      const alexandria = new Alexandria({ library, transports: [t as never], maxCredits: 100, ledger: new ReceiptLedger(join(dir, "receipts.jsonl")), sessionId: "snapshot" });
      try {
        const opts: Record<string, unknown> = { address: "x" };
        const pending = alexandria.execute({ capabilityId: cap, options: opts });
        opts.address = "changed-after-validation";
        const res = await pending;
        assert.deepEqual(seen, [{ address: "x" }], "the provider gets the options that were validated and priced");
        assert.equal((res.receipt as unknown as { options?: Record<string, unknown> }).options?.address ?? "x", "x");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("refunds and rejects a queued call whose session closed while it waited for the turn", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      let releaseFirst!: () => void;
      const gate = new Promise<void>((resolve) => { releaseFirst = resolve; });
      let dispatched = 0;
      const slow = { kind: "firecrawl-alexandria" as const, execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => { dispatched += 1; await gate; return calls.map((c) => ({ provider: c.provider, capability: c.capability, records: [{ address: "x" }], creditsCost: 5, observedAt: "2026-10-08T12:00:00.000Z", requestId: c.requestId })); } };
      const alexandria = new Alexandria({ library, transports: [slow as never], maxCredits: 100, ledger: new ReceiptLedger(join(dir, "receipts.jsonl")), sessionId: "queued-close" });
      const first = alexandria.execute({ capabilityId: cap, options: { address: "x" } });
      await new Promise((r) => setTimeout(r, 20));
      const second = alexandria.execute({ capabilityId: cap, options: { address: "x" } });
      await new Promise((r) => setTimeout(r, 20));
      alexandria.close();
      releaseFirst();
      await first;
      await assert.rejects(second, (err: unknown) => err instanceof AlexandriaError && err.code === "session_closed");
      assert.equal(dispatched, 1, "the queued call was never sent");
      assert.equal(alexandria.budget.spent, 5, "its reservation was refunded");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("gives a dangling symlink and its not-yet-created target one ledger identity and one turn", { skip: process.platform === "win32" }, async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      mkdirSync(join(dir, "real"));
      const target = join(dir, "real", "receipts.jsonl");
      const link = join(dir, "link.jsonl");
      symlinkSync(target, link);
      assert.ok(!existsSync(target), "the ledger does not exist yet");
      assert.equal(ledgerIdentity(link).key, ledgerIdentity(target).key, "a dangling link resolves to its target");
      symlinkSync("other.jsonl", join(dir, "real", "relative.jsonl"));
      symlinkSync(join(dir, "real"), join(dir, "dirlink"));
      assert.equal(ledgerIdentity(join(dir, "dirlink", "relative.jsonl")).key, ledgerIdentity(join(dir, "real", "other.jsonl")).key, "a relative target is read from the link's real directory");
      const release = await capabilityTurn(target, cap);
      await assert.rejects(capabilityTurn(link, cap, 100), /held the .* turn/, "the link waits on the target's turn");
      release();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("skips the prefix rehash only for a settled, unchanged ledger", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const base = { id: "rcpt_test", callFingerprint: "f", provider: "p", capability: "c", records: [], creditsCost: 1, reserved: 1, sessionId: "s", maxCredits: 10, observedAt: "2026-10-08T12:00:00.000Z" };
      writeFileSync(path, Array.from({ length: 40 }, (_, i) => JSON.stringify({ ...base, capability: `f${i}` }) + "\n").join(""));
      await new Promise((r) => setTimeout(r, 2100)); // settled on fine and coarse timestamps alike
      const ledger = new ReceiptLedger(path);
      const scan = () => (ledger as unknown as { overrunScan: { stamp?: string; scansSinceVerify: number } }).overrunScan;
      ledger.suspendedCapabilities();
      assert.ok(scan().stamp, "a settled ledger records its stamp");
      ledger.suspendedCapabilities();
      assert.equal(scan().scansSinceVerify, 1, "an unchanged settled ledger is trusted by stamp");
      ledger.append({ ...base, capability: "own" } as never);
      assert.equal(scan().stamp, undefined, "a post-append stamp is never trusted");
      ledger.suspendedCapabilities();
      assert.equal(scan().scansSinceVerify, 0, "so the next scan rehashes");
      appendFileSync(path, JSON.stringify({ ...base, capability: "foreign", overrun: true }) + "\n");
      assert.deepEqual([...ledger.suspendedCapabilities()], ["p/foreign"], "a foreign append is seen");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe("v93 — replay deduplication and settled receipts (#424)", () => {
  const library = Library.fromFile();
  const cap = "gmgn-ai/crypto/wallet_profile";

  it("ReceiptLedger tracks settledIds, settledRequestIds, and settledReceipts per session and estate-wide", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const base = { id: "rcpt_test", callFingerprint: "fp1", provider: "gmgn-ai", capability: "crypto/wallet_profile", recordCount: 0, contentHash: "h", redistribution: "cleared", source: "s", reserved: 5, maxCredits: 20, observedAt: "2026-10-08T12:00:00.000Z" };
      const line = (extra: Record<string, unknown>) => JSON.stringify({ ...base, ...extra }) + "\n";

      // Session 1:
      // req-1: pending, then settled successfully
      // req-2: pending, then failed definitely
      // req-3: pending, then uncertain outcome (remains held)
      // req-4: pending only (crashed mid-call)
      // Session 2:
      // req-5: settled directly (creditsCost 2)
      writeFileSync(path,
        line({ id: "rcpt_1a", sessionId: "session-1", requestId: "req-1", pending: true, creditsCost: 5 }) +
        line({ id: "rcpt_1b", sessionId: "session-1", requestId: "req-1", pending: false, creditsCost: 5 }) +
        line({ id: "rcpt_2a", sessionId: "session-1", requestId: "req-2", pending: true, creditsCost: 5 }) +
        line({ id: "rcpt_2b", sessionId: "session-1", requestId: "req-2", pending: false, creditsCost: 0, error: { code: "not_found", message: "not found" } }) +
        line({ id: "rcpt_3a", sessionId: "session-1", requestId: "req-3", pending: true, creditsCost: 5 }) +
        line({ id: "rcpt_3b", sessionId: "session-1", requestId: "req-3", pending: false, creditsCost: 5, error: { code: "uncertain_outcome", message: "timeout" } }) +
        line({ id: "rcpt_4a", sessionId: "session-1", requestId: "req-4", pending: true, creditsCost: 5 }) +
        line({ id: "rcpt_5a", sessionId: "session-2", requestId: "req-5", pending: false, creditsCost: 2, callFingerprint: "fp5" })
      );

      // Session 1 settled
      const s1Settled = ledger.settledIds("session-1");
      assert.deepEqual([...s1Settled].sort(), ["req-1", "req-2"]);
      assert.deepEqual([...ledger.settledRequestIds("session-1")].sort(), ["req-1", "req-2"]);

      // Session 1 held
      const s1Held = ledger.heldReservations("session-1");
      assert.deepEqual([...s1Held.keys()].sort(), ["req-3", "req-4"]);

      // Session 2 settled
      assert.deepEqual([...ledger.settledIds("session-2")], ["req-5"]);

      // Estate-wide settled
      assert.deepEqual([...ledger.settledIds()].sort(), ["req-1", "req-2", "req-5"]);
      assert.deepEqual([...ledger.settledRequestIds()].sort(), ["req-1", "req-2", "req-5"]);

      // settledReceipts details
      const receipts1 = ledger.settledReceipts("session-1");
      assert.equal(receipts1.get("req-1")?.receiptId, "rcpt_1b");
      assert.equal(receipts1.get("req-1")?.creditsCost, 5);
      assert.equal(receipts1.get("req-1")?.fingerprint, "fp1");
      assert.equal(receipts1.get("req-2")?.receiptId, "rcpt_2b");
      assert.equal(receipts1.get("req-2")?.creditsCost, 0);

      // Retrying req-3 settles it
      appendFileSync(path,
        line({ id: "rcpt_3c", sessionId: "session-1", requestId: "req-3", pending: true, creditsCost: 5 }) +
        line({ id: "rcpt_3d", sessionId: "session-1", requestId: "req-3", pending: false, creditsCost: 5 })
      );
      assert.deepEqual([...ledger.settledIds("session-1")].sort(), ["req-1", "req-2", "req-3"]);
      assert.deepEqual([...ledger.heldReservations("session-1").keys()], ["req-4"]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay after a successful call without re-reserving or re-dispatching", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      let dispatchCount = 0;
      const transport = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          dispatchCount += 1;
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [{ address: "0xabc", balance: 100 }],
            creditsCost: 5,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
          }));
        },
      };
      const alexandria = new Alexandria({ library, transports: [transport as never], maxCredits: 20, ledger, sessionId: "replay-success-sess" });
      try {
        const res1 = await alexandria.execute({ capabilityId: cap, options: { address: "0xabc" }, requestId: "req-succ-1" });
        assert.equal(res1.result.records.length, 1);
        assert.equal(alexandria.budget.spent, 5);
        assert.equal(dispatchCount, 1);
        const linesBefore = ledger.read().length;
        assert.equal(linesBefore, 2, "pending + outcome receipt");

        // Replay under the same requestId
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xabc" }, requestId: "req-succ-1" }),
          (err: unknown) =>
            err instanceof AlexandriaError &&
            err.code === "replay_completed" &&
            err.requestId === "req-succ-1" &&
            /was already executed and settled/.test(err.message)
        );

        assert.equal(dispatchCount, 1, "transport was not called a second time");
        assert.equal(alexandria.budget.spent, 5, "spent was not double-counted");
        assert.equal(ledger.read().length, linesBefore, "no duplicate receipts appended");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay after a call that exhausted the session ceiling without failing over_budget", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const transport = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      // Exactly 5 maxCredits: first call spends all credits
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 5, ledger, sessionId: "replay-exhaust-sess" });
      try {
        await alexandria.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-exhaust-1" });
        assert.equal(alexandria.budget.spent, 5);

        // Replay must reject with replay_completed, NOT over_budget
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-exhaust-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-exhaust-1"
        );
        assert.equal(alexandria.budget.spent, 5);
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay after a definite failure without charging or re-dispatching", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      let dispatchCount = 0;
      const failing = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          dispatchCount += 1;
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [],
            creditsCost: 0,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
            error: { code: "wallet_not_found", message: "no such wallet address" },
          }));
        },
      };
      const alexandria = new Alexandria({ library, transports: [failing as never], maxCredits: 20, ledger, sessionId: "replay-fail-sess" });
      try {
        const res = await alexandria.execute({ capabilityId: cap, options: { address: "0xmissing" }, requestId: "req-fail-1" });
        assert.equal(res.result.error?.code, "wallet_not_found");
        assert.equal(alexandria.budget.spent, 0, "failed call is not billed");
        assert.equal(dispatchCount, 1);
        const linesBefore = ledger.read().length;

        // Replay under the same requestId
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xmissing" }, requestId: "req-fail-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-fail-1"
        );
        assert.equal(dispatchCount, 1, "failed call replay does not re-dispatch");
        assert.equal(alexandria.budget.spent, 0, "budget spent remains 0");
        assert.equal(ledger.read().length, linesBefore, "no duplicate receipts appended");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay across a process restart", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      let dispatch1 = 0;
      const transport1 = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          dispatch1 += 1;
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [{ address: "0xrestart" }],
            creditsCost: 5,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
          }));
        },
      };

      // Process 1 runs call
      const alexandria1 = new Alexandria({ library, transports: [transport1 as never], maxCredits: 20, ledger, sessionId: "restart-session" });
      await alexandria1.execute({ capabilityId: cap, options: { address: "0xrestart" }, requestId: "req-restart-1" });
      assert.equal(alexandria1.budget.spent, 5);
      assert.equal(dispatch1, 1);
      alexandria1.close();

      // Process 2 resumes same session
      let dispatch2 = 0;
      const transport2 = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          dispatch2 += 1;
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [{ address: "0xrestart" }],
            creditsCost: 5,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
          }));
        },
      };
      const alexandria2 = new Alexandria({ library, transports: [transport2 as never], maxCredits: 20, ledger, sessionId: "restart-session" });
      try {
        assert.equal(alexandria2.budget.spent, 5, "restored spent from ledger");
        await assert.rejects(
          alexandria2.execute({ capabilityId: cap, options: { address: "0xrestart" }, requestId: "req-restart-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-restart-1"
        );
        assert.equal(dispatch2, 0, "resumed process did not call transport");
        assert.equal(alexandria2.budget.spent, 5, "spent did not increase");
      } finally { alexandria2.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router throws retry_mismatch if replay changes capability or options of a settled call", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const transport = new MemoryTransport("firecrawl-alexandria", {
        [cap]: { records: [{ address: "0x111" }], creditsCost: 5 },
        "gmgn-ai/crypto/wallet_rank": { records: [{ rank: 1 }], creditsCost: 5 },
      });
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 20, ledger, sessionId: "mismatch-session" });
      try {
        await alexandria.execute({ capabilityId: cap, options: { address: "0x111" }, requestId: "req-mismatch-1" });
        assert.equal(alexandria.budget.spent, 5);

        // Different options with same requestId
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0x222" }, requestId: "req-mismatch-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "retry_mismatch" && err.requestId === "req-mismatch-1"
        );

        // Different capability with same requestId
        await assert.rejects(
          alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank", options: { period: "7d" }, requestId: "req-mismatch-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "retry_mismatch" && err.requestId === "req-mismatch-1"
        );

        assert.equal(alexandria.budget.spent, 5, "mismatched replays reserve nothing");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router permits retry of an uncertain outcome and then rejects replay once settled", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      let attempt = 0;
      const flaky = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          attempt += 1;
          if (attempt === 1) throw new Error("timeout connecting to provider");
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [{ address: "0xflaky" }],
            creditsCost: 5,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
          }));
        },
      };
      const alexandria = new Alexandria({ library, transports: [flaky as never], maxCredits: 20, ledger, sessionId: "flaky-sess" });
      try {
        // Attempt 1 fails uncertainly
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xflaky" }, requestId: "req-flaky-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "uncertain_outcome"
        );
        assert.equal(alexandria.budget.spent, 5, "reservation is held");

        // Attempt 2 retries and succeeds
        const res = await alexandria.execute({ capabilityId: cap, options: { address: "0xflaky" }, requestId: "req-flaky-1" });
        assert.equal(res.result.records.length, 1);
        assert.equal(alexandria.budget.spent, 5, "held reservation settled without doubling");

        // Attempt 3 replays: now settled, should reject with replay_completed
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xflaky" }, requestId: "req-flaky-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-flaky-1"
        );
        assert.equal(attempt, 2, "flaky transport was not called on 3rd replay attempt");
        assert.equal(alexandria.budget.spent, 5, "spent remains 5");
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay as replay_completed even if capability was suspended by an overrun", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      // Transport returns overrun (charges 10 against 5 reserved)
      const overrunTransport = {
        kind: "firecrawl-alexandria" as const,
        execute: async (calls: { provider: string; capability: string; requestId?: string }[]) => {
          return calls.map((c) => ({
            provider: c.provider,
            capability: c.capability,
            records: [{ address: "0xoverrun" }],
            creditsCost: 10,
            observedAt: "2026-10-08T12:00:00.000Z",
            requestId: c.requestId,
          }));
        },
      };
      const alexandria = new Alexandria({ library, transports: [overrunTransport as never], maxCredits: 50, ledger, sessionId: "overrun-sess" });
      try {
        const res = await alexandria.execute({ capabilityId: cap, options: { address: "0xoverrun" }, requestId: "req-overrun-1" });
        assert.equal(res.overrun, true);
        assert.equal(alexandria.budget.spent, 10);

        // A new call to the now-suspended capability fails with capability_suspended
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xnew" }, requestId: "req-new" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "capability_suspended"
        );

        // But replaying the completed call returns replay_completed, not capability_suspended!
        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "0xoverrun" }, requestId: "req-overrun-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-overrun-1"
        );
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("router rejects replay across restart without needing provider transport registered", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const transport = new MemoryTransport("firecrawl-alexandria", { [cap]: { records: [{ address: "x" }], creditsCost: 5 } });
      const alexandria1 = new Alexandria({ library, transports: [transport], maxCredits: 20, ledger, sessionId: "no-transport-replay" });
      await alexandria1.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-fc-1" });
      alexandria1.close();

      // Process 2 resumes session with empty transports array (no firecrawl-alexandria transport)
      const alexandria2 = new Alexandria({ library, transports: [], maxCredits: 20, ledger, sessionId: "no-transport-replay" });
      try {
        // Replaying settled call does not need transport and returns replay_completed, not no_transport
        await assert.rejects(
          alexandria2.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-fc-1" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "replay_completed" && err.requestId === "req-fc-1"
        );

        // A fresh call fails with no_transport
        await assert.rejects(
          alexandria2.execute({ capabilityId: cap, options: { address: "y" }, requestId: "req-fresh" }),
          (err: unknown) => err instanceof AlexandriaError && err.code === "no_transport"
        );
      } finally { alexandria2.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it("translates ledger read error during settled lookup to receipt_persist_failed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-"));
    try {
      const path = join(dir, "receipts.jsonl");
      const ledger = new ReceiptLedger(path);
      const alexandria = new Alexandria({ library, transports: [], maxCredits: 20, ledger, sessionId: "corrupt-lookup-sess" });
      try {
        // Write corrupt JSON to ledger after Alexandria was constructed
        writeFileSync(path, "corrupt\nnot-valid-json\n", "utf8");

        await assert.rejects(
          alexandria.execute({ capabilityId: cap, options: { address: "x" }, requestId: "req-corrupt" }),
          (err: unknown) =>
            err instanceof AlexandriaError &&
            err.code === "receipt_persist_failed" &&
            err.requestId === "req-corrupt" &&
            /the ledger could not be read to check replays/.test(err.message)
        );
      } finally { alexandria.close(); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
