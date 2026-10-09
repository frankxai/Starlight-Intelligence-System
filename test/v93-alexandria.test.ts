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
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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

  it("catalogue validates and carries real Firecrawl provider ids", () => {
    const catalog = loadCatalog();
    assert.equal(validateCatalog(catalog).length, 0);
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

  it("reports unmet requiresOneOf groups", () => {
    assert.deepEqual(library.unmetRequirement("apollo/companies/enrich", {}), ["domain", "linkedin_url"]);
    assert.equal(library.unmetRequirement("apollo/companies/enrich", { domain: "frankx.ai" }), null);
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
      const alexandria = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger, now: fixedNow });
      const res = await alexandria.execute({ need: "whale wallet profile", options: { address: "abc", chain: "sol" } });
      assert.equal(res.hit.capability.id, "gmgn-ai/crypto/wallet_profile");
      assert.equal(res.budget.spent, 5);
      assert.equal(res.receipt.contentHash, hashRecords([{ pnl: 0.42, address: "abc" }]), "hash must be key-order independent");
      assert.equal(res.receipt.attestation, undefined, "no layers declared, no block");
      assert.equal(ledger.read().length, 1);
      assert.equal(ledger.spent(), 5);
      const again = new Alexandria({ library, transports: [transport], maxCredits: 100, ledger });
      assert.equal(again.budget.spent, 5, "budget resumes from the ledger");
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
    const bad = await alexandria.execute({ capabilityId: "sec-gov/filings/holdings_13f" });
    assert.equal(bad.receipt.error?.code, "not_found");
    assert.equal(bad.budget.spent, 0);
  });

  it("native transport reads the estate corpus for free", async () => {
    const alexandria = new Alexandria({ library, transports: [new NativeTransport(REPO_ROOT)], maxCredits: 0 });
    const metrics = await alexandria.execute({ capabilityId: "sis-metrics/current", options: { key: "registered_agents" } });
    assert.equal(metrics.result.records.length, 1);
    assert.equal(metrics.budget.spent, 0);
    const verticals = await alexandria.execute({ need: "list verticals registry" });
    assert.ok((verticals.result.records as { slug: string }[]).some((r) => r.slug === "alexandria"));
  });

  it("Firecrawl transport posts an alexandria body and maps entries back by position", async () => {
    let seen: { url: string; body: unknown; auth: string } | undefined;
    const transport = new FirecrawlTransport({ apiKey: "test-key", fetchImpl: async (url, init) => {
      seen = { url, body: JSON.parse(init.body), auth: init.headers.Authorization };
      return { ok: true, status: 200, json: async () => ({ data: { alexandria: [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", creditsCost: 5, records: [{ a: 1 }, { a: 2 }] }] } }) };
    } });
    const [result] = await transport.execute([{ provider: "gmgn-ai", capability: "crypto/wallet_rank", options: { chain: "sol" } }]);
    assert.equal(result.records.length, 2);
    assert.equal(result.creditsCost, 5);
    assert.equal(seen?.auth, "Bearer test-key");
    assert.deepEqual((seen?.body as { alexandria: unknown[] }).alexandria, [{ provider: "gmgn-ai", capability: "crypto/wallet_rank", options: { chain: "sol" } }]);
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
    const proven = transition(base, "proven", { receipts: ["rcpt_1"] });
    assert.equal(proven.status, "proven");
    assert.equal(base.status, "running", "input not mutated");
    assert.throws(() => transition(proven, "running"), /cannot move/);
    assert.ok(canTransition("parked", "running"));
    assert.ok(!canTransition("falsified", "running"));
    assert.ok(validateRegistry({ experiments: [{ ...base, status: "falsified" }] }).some((p) => p.message.includes("needs at least one receipt")));
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
      assert.equal((receipts?.result as { structuredContent: { spent: number } }).structuredContent.spent, 5);
      const exps = await server.handleRequest({ method: "tools/call", id: 5, params: { name: "alexandria_experiments", arguments: { status: "running" } } });
      assert.ok((exps?.result as { structuredContent: { experiments: unknown[] } }).structuredContent.experiments.length >= 1);
      const unknown = await server.handleRequest({ method: "nope", id: 6 });
      assert.equal(unknown?.error?.code, -32601);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
