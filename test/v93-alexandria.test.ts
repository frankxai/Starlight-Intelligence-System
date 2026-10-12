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
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { repoRootFromTestFile } from "./_lib/repo.js";
import {
  Alexandria,
  AlexandriaError,
  AlexandriaMcpServer,
  FirecrawlTransport,
  Library,
  MemoryTransport,
  NativeTransport,
  ReceiptLedger,
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

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const VERTICAL = join(REPO_ROOT, "verticals", "alexandria");

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
      assert.equal(ledger.read().length, 1);
      assert.equal(ledger.spent(), 5);
      assert.equal(res.receipt.sessionId, "session-hash");
      assert.equal(res.receipt.reserved, 5);
      const again = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-hash" });
      assert.equal(again.budget.spent, 5, "the same session resumes its spend from the ledger");
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
    const verticals = await alexandria.execute({ need: "list verticals registry" });
    assert.ok((verticals.result.records as { slug: string }[]).some((r) => r.slug === "alexandria"));
    const research = await alexandria.execute({ capabilityId: "sis-research/list", options: { query: "memory foundations" } });
    const paths = (research.result.records as { path: string }[]).map((r) => r.path);
    assert.ok(paths.some((p) => p.startsWith("docs/research/") && p.split("/").length > 3), "nested research artifacts are listed");
    assert.ok(paths.every((p) => p.startsWith("docs/research/") && p.endsWith(".md")));
  });

  it("Firecrawl transport posts an alexandria body with a request id and maps entries back by position", async () => {
    let seen: { url: string; body: { requestId?: string; alexandria: unknown[] }; auth: string } | undefined;
    const transport = new FirecrawlTransport({ apiKey: "test-key", fetchImpl: async (url, init) => {
      seen = { url, body: JSON.parse(init.body), auth: init.headers.Authorization };
      return { ok: true, status: 200, json: async () => ({ data: { alexandria: [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", creditsCost: 5, records: [{ a: 1 }, { a: 2 }] }] } }) };
    } });
    const [result] = await transport.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank", options: { chain: "sol" }, requestId: "retry-7" }]);
    assert.equal(result.records.length, 2);
    assert.equal(result.creditsCost, 5);
    assert.equal(result.requestId, "retry-7");
    assert.equal(seen?.body.requestId, "retry-7", "the idempotency key rides the request body");
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

  it("per-record capabilities need a declared ceiling, reserve ceiling times price, and record an overrun", async () => {
    const transport = new MemoryTransport("firecrawl-alexandria", { "fullenrich/people/search": { records: [{}, {}, {}, {}, {}, {}, {}], creditsCost: 35 } });
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 30 });
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search" }), (err: unknown) => err instanceof AlexandriaError && err.code === "unbounded_records");
    await assert.rejects(alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 7 }), (err: unknown) => err instanceof AlexandriaError && err.code === "over_budget");
    assert.equal(transport.calls.length, 0);
    const res = await alexandria.execute({ capabilityId: "fullenrich/people/search", expectedRecords: 5 });
    assert.equal(res.receipt.reserved, 25);
    assert.equal(res.receipt.creditsCost, 35, "the provider's actual charge is recorded, and exceeds the reservation");
    assert.equal(res.budget.spent, 35);
  });

  it("releases the reservation when the transport throws", async () => {
    const transport = { kind: "firecrawl-alexandria" as const, execute: async () => { throw new Error("network down"); } };
    const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 10 });
    await assert.rejects(alexandria.execute({ capabilityId: "gmgn-ai/crypto/wallet_rank" }), /network down/);
    assert.equal(alexandria.budget.spent, 0);
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
      assert.equal(detailed.receipts.length, 2);
      const resumed = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, sessionId: "session-a" });
      assert.equal(resumed.budget.spent, 10, "the same session resumes its spend");
      const fresh = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger });
      assert.equal(fresh.budget.spent, 0, "a new session starts with a fresh allowance");
      assert.equal(ledger.spent(), 10);
      assert.ok(ledger.read().every((r) => r.sessionId === "session-a"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses a corrupt line in the middle of the ledger", () => {
    const dir = mkdtempSync(join(tmpdir(), "alexandria-corrupt-"));
    try {
      const path = join(dir, "receipts.jsonl");
      writeFileSync(path, 'not json\n{"id":"rcpt_x","sessionId":"s","creditsCost":1}\n', "utf8");
      assert.throws(() => new ReceiptLedger(path).read(), /corrupt at line 1/);
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
    const proven = transition(base, "proven", { receipts: ["rcpt_0f9c8b3a-6b6c-4d2e-9f1a-1234567890ab"] });
    assert.equal(proven.status, "proven");
    assert.equal(base.status, "running", "input not mutated");
    assert.throws(() => transition(proven, "running"), /cannot move/);
    assert.ok(canTransition("parked", "running"));
    assert.ok(!canTransition("falsified", "running"));
    assert.ok(validateRegistry({ experiments: [{ ...base, status: "falsified" }] }).some((p) => p.message.includes("needs at least one receipt")));
    assert.ok(validateRegistry({ experiments: [{ ...base, status: "falsified", receipts: [""] }] }).some((p) => p.message.includes("ledger receipt id")));
    const parked = transition(base, "parked");
    assert.throws(() => transition(parked, "running"), /needs a new closesBy/);
    assert.throws(() => transition(parked, "running", { closesBy: "2026-11-08" }), /later than/);
    assert.equal(transition(parked, "running", { closesBy: "2026-12-01" }).closesBy, "2026-12-01");
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
      const receipts = await server.handleRequest({ method: "tools/call", id: 4, params: { name: "alexandria_receipts", arguments: {} } });
      const rc = (receipts?.result as { structuredContent: { spentThisSession: number; spentAllSessions: number; truncatedTail: boolean; sessionId: string } }).structuredContent;
      assert.equal(rc.spentThisSession, 5);
      assert.equal(rc.spentAllSessions, 5);
      assert.equal(rc.truncatedTail, false);
      assert.equal(rc.sessionId, alexandria.budget.sessionId);
      const exps = await server.handleRequest({ method: "tools/call", id: 5, params: { name: "alexandria_experiments", arguments: { status: "running" } } });
      assert.ok((exps?.result as { structuredContent: { experiments: unknown[] } }).structuredContent.experiments.length >= 1);
      const unknown = await server.handleRequest({ method: "nope", id: 6 });
      assert.equal(unknown?.error?.code, -32601);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
