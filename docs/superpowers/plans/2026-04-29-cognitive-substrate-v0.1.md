---
plan: cognitive-substrate-v0.1
date: 2026-04-29
status: DRAFT — overnight autonomous, awaiting Frank's morning ack
package: "@starlight/cognitive-substrate"
parent_specs:
  - 2026-04-29-memory-substrate-program-overview.md
  - 2026-04-29-memory-bus-core-design.md
  - 2026-04-29-two-package-architecture.md
  - 2026-04-29-hnsw-concurrency-smoke.md
parent_board: docs/boards/luminor-v77-memory-bus.md
target_release: v7.7
attestation: Built on SIP — implementation plan, no code touched until Phase 0 gates clear
---

# Implementation Plan — `@starlight/cognitive-substrate` v0.1

## Goal

Land the **lower-layer foundation** of the Memory Bus: singleton daemon, multi-client transport, storage abstraction, attestation primitives, tenant namespacing, the 10 backwards-compat `sis_*` MCP tools + 6 new substrate tools.

Out of scope (lives in `@starlight/memory-palace` v0.1 plan): wings/rooms/drawers concept, mining pipeline, agent diaries, palace-flavored MCP tools.

## Success criteria (all must hold)

- [ ] Daemon launches on `localhost:38421` with HTTP+SSE MCP transport
- [ ] 10 concurrent MCP clients connect without lock contention
- [ ] All 10 v6 `sis_*` tools work unchanged (voice operator pipeline.py compatibility test)
- [ ] 6 new substrate tools (vector_search, hybrid_search, kg_query, kg_add_fact, attest, subscribe) functional
- [ ] SIP attestation fields persist round-trip via FileBackend (failing test from Gate 2 flips to passing)
- [ ] HNSW concurrent-write smoke (Gate 3) passes — 1000/1000 vectors retrievable
- [ ] `~/.starlight/bus.lock` discovery works
- [ ] Tenant namespacing operational — `tenantId` parameter on all writes/reads
- [ ] Stdio fallback transport still works for legacy single-client use
- [ ] Test coverage > 70% on substrate package

## Dependencies (gates in)

- ✅ Spec written + user-acked
- ⏸ Phase 0 Gate 1 (Provenance) cleared — see `docs/attribution/memory-bus-absorption.md`
- ⏸ Phase 0 Gate 2 (Metadata test passing) cleared — patch applied to absorbed FileBackend
- ⏸ Phase 0 Gate 3 (HNSW concurrency smoke) passing — see `docs/superpowers/specs/2026-04-29-hnsw-concurrency-smoke.md`
- ⏸ Frank's resolution of naming + ownership questions (resolved by his "both packages" directive — D2 with two-package split)
- ⏸ Luminor Board re-pass not required; revisions applied to specs

## Phasing (5 phases over ~3-4 days focused)

### Phase 0 — Gates clearance (BLOCKING, runs first)

**Effort:** ~1 day total
**Owner:** Frank to ack each gate; agents execute under ack

| Task | Spec ref | Effort |
|---|---|---|
| 0.1 — Add LICENSE to SIS root + Arcanea-run-graph root; verify claude-flow v3 license; restore upstream copyright on `hnsw-index.ts` | `docs/attribution/memory-bus-absorption.md` | 2-4h |
| 0.2 — Run failing-test suite from `tests/__sandbox__/file-backend-metadata-persistence.test.ts` against current `@arcanea/memory-system` source — confirm a/b/c/f FAIL on current code | Gate 2 | 1h |
| 0.3 — Apply 12-line patch (entryToMd / mdToEntry / serializeFrontmatter / parseFrontmatter); rerun test — confirm all 6 cases PASS | Gate 2 | 2-3h |
| 0.4 — Run HNSW concurrency smoke (10-writer × 100-vec × 60s on Windows 11) | Gate 3 spec | 1-2h |
| 0.5 — If 0.4 fails: pick contingency (write mutex / sqlite-vec swap / Windows lockfile); execute and re-run | Gate 3 contingencies | varies |

**Gate exit criteria:** Gates 1, 2, 3 all GREEN. If any fail, plan halts; revise + re-board.

### Phase 1 — Package scaffold + workspace setup (~0.5 day)

| Task | Output |
|---|---|
| 1.1 — Convert SIS to npm/pnpm workspace if not already | `package.json` workspaces field |
| 1.2 — Create `packages/cognitive-substrate/` with `package.json`, `tsconfig.json`, `README.md` | Package skeleton |
| 1.3 — Set up vitest + node:test for testing | Test runner config |
| 1.4 — Set up esbuild/tsup for build | Build config |
| 1.5 — CI: GitHub Actions workflow for cognitive-substrate package | `.github/workflows/cognitive-substrate.yml` |

### Phase 2 — Source absorption (~1 day)

Per `docs/superpowers/specs/2026-04-29-memory-bus-core-design.md` absorption Steps 1.5 / 1.7 / 2.

| Task | Source → Target |
|---|---|
| 2.1 — Apply provenance file headers per attribution doc | All absorbed files |
| 2.2 — Absorb `types.ts` (generalize `Guardian` → `tenantId`) | `cognitive-substrate/src/types.ts` |
| 2.3 — Absorb `file-backend.ts` (with metadata patch from Phase 0) | `cognitive-substrate/src/storage/FileBackend.ts` |
| 2.4 — Absorb `arcaneMD.ts` (parser + serializer) | `cognitive-substrate/src/arcaneMD.ts` |
| 2.5 — Absorb `hnsw-index.ts` (with claude-flow upstream credit) | `cognitive-substrate/src/storage/HNSWBackend.ts` |
| 2.6 — Absorb tenant-aware HNSW wrapper (de-Guardian-ed) | `cognitive-substrate/src/storage/TenantNamespacedHNSW.ts` |
| 2.7 — Move `integration.test.ts` + add metadata persistence test | `cognitive-substrate/tests/` |

**Acceptance:** all absorbed files compile, all tests pass, test coverage > 70% on absorbed code.

### Phase 3 — Substrate-native code (~1.5 days)

New code that doesn't come from absorption.

| Task | Output |
|---|---|
| 3.1 — `IBusStorage` interface | `cognitive-substrate/src/storage/IBusStorage.ts` |
| 3.2 — `IBusTransport` interface | `cognitive-substrate/src/transport/IBusTransport.ts` |
| 3.3 — HTTP+SSE transport (`localhost:38421`, JSON-RPC POST + SSE stream) | `cognitive-substrate/src/transport/HttpSseTransport.ts` |
| 3.4 — Stdio transport (legacy single-client fallback, ported from `src/mcp-server.ts`) | `cognitive-substrate/src/transport/StdioTransport.ts` |
| 3.5 — Daemon lifecycle (start/stop/lock) | `cognitive-substrate/src/daemon/lifecycle.ts` |
| 3.6 — `~/.starlight/bus.lock` discovery | `cognitive-substrate/src/daemon/discovery.ts` |
| 3.7 — SIP attestation primitives (`SipAttest`, `AttestChain`) | `cognitive-substrate/src/attestation/` |
| 3.8 — TenantId namespacing + scoping | `cognitive-substrate/src/tenant/Namespace.ts` |
| 3.9 — Graphiti-equivalent temporal KG (TypeScript port — entities + triples + validity windows) | `cognitive-substrate/src/storage/TemporalKG.ts` |
| 3.10 — Multi-client write mutex (if Gate 3 contingency required) | `cognitive-substrate/src/storage/WriteMutex.ts` |

**Acceptance:** unit tests for each module > 80% coverage; integration test runs daemon + connects 2 clients.

### Phase 4 — MCP tool surface (~1 day)

| Task | Output |
|---|---|
| 4.1 — Wire 10 v6 backwards-compat tools as wrappers (`sis_vault_search`, `sis_recent_entries`, `sis_stats`, `sis_append_entry`, `sis_entry_types`, `sis_search`, `sis_confirm`, `sis_invalidate`, `sis_contradict`, `sis_stale`) | `cognitive-substrate/src/tools/sis_*.ts` |
| 4.2 — `sis_vector_search` (vector-only) | `cognitive-substrate/src/tools/sis_vector_search.ts` |
| 4.3 — `sis_hybrid_search` (vector + keyword + temporal) | `cognitive-substrate/src/tools/sis_hybrid_search.ts` |
| 4.4 — `sis_kg_query` (Graphiti-style, validity-window aware) | `cognitive-substrate/src/tools/sis_kg_query.ts` |
| 4.5 — `sis_kg_add_fact` | `cognitive-substrate/src/tools/sis_kg_add_fact.ts` |
| 4.6 — `sis_attest` (explicit attestation write) | `cognitive-substrate/src/tools/sis_attest.ts` |
| 4.7 — `sis_subscribe` (SSE stream URL) | `cognitive-substrate/src/tools/sis_subscribe.ts` |
| 4.8 — Tool registry binding both transport layers | `cognitive-substrate/src/tools/registry.ts` |
| 4.9 — Backwards-compat smoke: voice operator's existing `sis_append_entry` calls succeed unchanged | tests/integration/voice-op-compat.test.ts |

**Acceptance:** Each tool has 3+ unit tests; backwards-compat suite passes 100%.

### Phase 5 — Bus daemon binary + smoke (~0.5 day)

| Task | Output |
|---|---|
| 5.1 — `apps/starlight-bus/` binary that bundles cognitive-substrate (and palace, when palace lands) | `apps/starlight-bus/bin/starlight-bus.js` |
| 5.2 — `npx starlight-bus start` / `stop` / `status` commands | `apps/starlight-bus/src/cli.ts` |
| 5.3 — End-to-end smoke: 10 Claude Code mock clients connect to running daemon, fire 100 queries each | tests/e2e/multi-client-smoke.test.ts |
| 5.4 — Performance baseline: cold start < 2s, query p50 < 100ms, p99 < 500ms | tests/e2e/perf-baseline.test.ts |

**Acceptance:** all e2e tests green; `npx starlight-bus start` works on Frank's Windows 11 machine.

## Risks + mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Gate 3 (HNSW) fails on Windows | High | Three contingencies pre-planned (mutex / sqlite-vec / lockfile); pick best per failure mode |
| Tenant generalization breaks Arcanea Guardian usage | Med | Compatibility layer: `tenantId = 'guardian:Aiyami'` syntax accepted; Arcanea continues working |
| HTTP+SSE transport on Windows 11 networking quirks | Low | Tested early in Phase 3; fallback to stdio for any client that fails |
| Backwards-compat regression for voice operator | High | Dedicated regression test in 4.9; voice operator's pipeline.py exercised against new daemon before voice-op team migrates |
| ArcaneMD parser limitations on attestation (nested object support) | Med | Patch from Gate 2 already addresses via JSON-stringify escape hatch |
| Graphiti TS port effort underestimated | Med | If port grows past 2 days, skip in v0.1 — defer KG to v0.2; mark `sis_kg_*` tools NOT_YET_IMPLEMENTED |

## Test strategy

- **Unit tests** per module (vitest)
- **Integration tests** for cross-module flows (node:test)
- **Backwards-compat tests** running real `sis_*` tool calls used by voice operator
- **E2E tests** spawning the daemon + multiple mock clients
- **Performance baseline** measured and recorded for regression detection
- **Coverage target:** 70% line / 80% branch on cognitive-substrate package

## Acceptance for v0.1 ship

- All 5 phases complete
- All success criteria met
- Phase 0 gates green
- Backwards-compat 100%
- Performance baseline established
- README + API docs written
- Published to private npm registry as `@starlight/cognitive-substrate@0.1.0`

## Post-ship

- `@starlight/memory-palace` v0.1 plan kicks off (separate plan doc)
- Voice operator team migrates to Bus (S5)
- arcanea-flow `IMemoryBackend` adapter written (S4)
- `MEMORY.md` updated with `project_v77_memory_substrate.md` entry

## Estimated total: 25-32 hours focused (~3-4 days)

Phase 0: 8h
Phase 1: 4h
Phase 2: 8h
Phase 3: 12h
Phase 4: 8h
Phase 5: 4h
Buffer: 4h

---

*Built on SIP. Implementation plan v0.1. v7.7 candidate.*
