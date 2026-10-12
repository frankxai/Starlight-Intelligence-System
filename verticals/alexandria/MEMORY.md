# MEMORY — Alexandria vertical

## Declared identity
- **Vertical name:** Starlight Alexandria
- **Slug:** `alexandria`
- **Tier:** Sovereign domain sub-stack under Second Brain IS; composes with Wealth IS (Crypto IS Houses), Creator IS, Code IS, Starlight Orchestrator
- **Spawned:** 2026-10-08 (v0.1 runtime-first scaffold)
- **Reference repo:** `verticals/alexandria/` + `src/alexandria/` in `frankxai/Starlight-Intelligence-System` (extraction target when the Exchange experiment proves: `github.com/frankxai/starlight-alexandria`)

## Domain & ICP
- **Domain:** catalogued intelligence with receipts — typed capabilities, price-before-run, receipt-after-run, earned attestation, signed resale.
- **ICP:** the estate's own agents first; then allocators, founders and creators who pay for data and cannot trust the brief on top of it; then builders who want a budget-gated pass-through.
- **Open boundary (MIT):** catalogue shape, router, receipts, experiment registry, MCP server, House cards, docs.
- **Closed boundary:** paid briefs, client ledgers, signing keys, allocator pipeline, credit balances, partnership terms.

## Commitments
1. No transport call without a prior price check and budget gate.
2. No public number without a receipt id or a `METRICS_TRUTH` entry.
3. The "Built on SIP" block is earned per receipt, never blanket.
4. No agent in this vertical moves money, publishes or handles keys.
5. Catalogue prices are reconciled against Firecrawl's catalogue digest; `reconciledAt` is bumped on every reconcile.

## Anti-scope
- Not a scraper, not a data vendor, not advice, not a trading or payment engine.

## Open reconciliation
- `similarweb/traffic/overview` and `firecrawl-trends/trends/interest` capability paths are placeholders: the live contract fetch returned "provider agreements unavailable" on 2026-10-08. Both carry `"status": "unreconciled"` in the catalogue: `Library.find` leaves them out and the router refuses them (`unreconciled_capability`). Reconcile the path and terms against the live contract, then remove the status.

- No signing profile exists for Alexandria receipts: `protocol/sign.mjs` signs the `sip-conform` receipt profile only and refuses the receipts emitted here. Board condition 2 (wire signing into the Exchange path before any resale) is therefore open, and the Exchange is closed until an Alexandria signing profile or adapter lands. No provider is `redistribution: cleared`.
- A `./alexandria` entry in root `package.json` `exports` and a `test:alexandria` script are deferred: `package.json` is in the Foundry OpenAI preflight digest closure (`tools/foundry/lib/openai-preflight.mjs` → `foundry/validators/toolchain.lock.v1.json`), and relocking is an independently reviewed step. Until then: tests run through `.github/workflows/alexandria.yml`, the MCP server through `node dist/alexandria/mcp.js`, and in-repo imports through `dist/alexandria/index.js`.

## Changelog
- **2026-10-12 — v0.1 review pass, round 4.** Nine further Codex findings applied: a held reservation is bound to its call (`callFingerprint` on every receipt; a retry with the id but another capability or options is refused, `retry_mismatch`); a per-record ceiling is sent to the provider through the capability's declared `recordLimitOption` (`limit` on FullEnrich people search, `size` on PDL company search, with their contract bounds) and a per-record capability without one does not run; a pending receipt holding the reservation is written before a paid call so a crash cannot lose it, and the call does not run if that line cannot be written; a Firecrawl 5xx or 408 is an uncertain outcome that holds its reservation; a ledger line that parses but cannot be tallied is refused; stale-lock takeover claims the file by atomic rename; the signing claims in `STACK.md` and `ARCHITECTURE.md` now state that no Alexandria signing profile exists (open condition); providers carry an explicit `redistribution` policy copied onto every receipt, none cleared; the catalogue validator checks the nested option contract (`options`, `requiresOneOf`, bounds, `recordLimitOption`, `redistribution`).
- **2026-10-12 — v0.1 review pass, round 3.** Twelve further Codex findings applied: an uncertain outcome keeps its reservation (an `uncertain_outcome` receipt holds it; a retry with the same request id reuses it; the ledger restores holds per session); a success whose charge the provider did not report keeps its reservation (`chargeUnknown`) instead of being refunded; a failed ledger append after a charge returns `receipt_persist_failed` with the request id; `SIGINT`/`SIGTERM` stop the server and exit after releasing the lock; a second `Alexandria` instance in the same process cannot hold the same session; ledger, quarantine and lock files are created `0600` in a `0700` directory; an own `__proto__` record key hashes as a key; the two placeholder capabilities carry `status: unreconciled` and are kept out of routing and execution; `sis-registry/verticals` records are sorted; SIP layer names must be slugs (`invalid_sip_layer`) and the MCP server refuses non-string layers; the README synthesis section no longer compares against other products; `SDLC.md` states that the suite is not yet in `npm test` and the workflow now also runs on toolchain changes.
- **2026-10-12 — v0.1 review pass, round 2.** Nine further Codex findings applied: a resumed budget session is locked to one live process (`SessionLock`, stale locks taken over, `lock: false` for in-process use); the request id is minted in the router before the transport so a transport failure returns `uncertain_outcome` with the id and writes a failed receipt carrying it; Firecrawl gets the id as the `x-request-id` header and the body carries only `alexandria`; receipts keep the provider `observedAt`; a cut-off ledger tail is moved to `<ledger>.quarantine` before the next append; reopening a parked experiment also needs a deadline after today; `alexandria_receipts` lists the active session only unless `allSessions` is set; the README quickstart imports `REPO_ROOT` and calls `close()`; `/alexandria` takes `--expected-records` and retries with the returned request id.
- **2026-10-12 — v0.1 review pass.** Codex review on PR #320 (16 findings) applied: synchronous budget reservation before the transport call, per-record capabilities require a declared record ceiling, spend restored per budget session (`ALEXANDRIA_SESSION`), Firecrawl `requestId` on every call and receipt, terms-gate details surfaced as data, ledger tolerates a cut-off final line, option validation against the contract (types, `oneOf`, `null` as missing), tags tokenised before scoring, attestation withheld from failed or empty calls, recursive research walk, `ALEXANDRIA_MAX_CREDITS` validated at startup, receipt ids validated, reopening a parked experiment needs a later deadline, catalogue counts corrected to 20 providers / 47 capabilities and asserted by the test, README ledger example uses `homedir()`, README opening claim scoped to this repository.
- **2026-10-08 — v0.1.** Runtime (`src/alexandria/`: types, catalog, transport, receipts, router, experiments, mcp), catalogue (20 providers, 47 capabilities, 24 connectors), five Forge experiments, six House cards, seven-file contract plus ARCHITECTURE / SDLC / SWARM / REVENUE / CAPITAL / SUB-SYSTEMS / PROPOSAL, `test/v93-alexandria.test.ts`, `/alexandria` command, Board record. No revenue, no partnership, no pilot claimed.

**Built on SIP** · `alexandria@v0.1`
