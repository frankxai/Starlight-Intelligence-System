# Starlight claim and evidence map

Snapshot: `origin/main` at `a54cc7090f53ebe4f79765ba01e6a459d835b2dd` (2026-09-23). This map classifies what the repository can support before the Next Era narrative is written. A passing unit test establishes a local contract, not a deployed service or an outcome for a venture.

| Capability | Status | Evidence in current main | Public claim boundary / next proof |
| --- | --- | --- | --- |
| Command | **STAGED** | `plugins/starlight-intelligence/server/src/{worker,mcp,store}.ts`; `store.test.ts`, `auth.test.ts`; local `src/cli.ts`, `src/ledgers.ts` | Authenticated portfolio tools and a local work ledger exist. Deployment and live workspace state need direct verification before claiming an operating Command Center. |
| Memory | **LIVE locally** | `src/memory.ts`, `src/vault-memory.ts`, `src/gateway/{server,daemon}.ts`; `test/v90-gateway*.test.ts` | Local JSONL memory, search, and gateway are executable. Reliable cross-venture recall and performance improvement remain unmeasured. |
| Teams and multi-agent work | **STAGED** | `src/orchestrator.ts`, `src/swarm.ts`, `src/queen-session.ts`; `test/queen-session.test.ts` | Routing and bounded execution contracts exist. The default orchestrator executor is a placeholder; the portfolio swarm path is dry run. Do not claim autonomous agent teams operate ventures. |
| Capabilities | **STAGED** | `tools/foundry/lib/{graph,compile,prove}.mjs`; `test/v92-foundry.test.ts` | Local graph, skill-package compilation, and proof paths pass. The audited main's OpenAI plugin projection fails `RULES_LOCK` because `package.json` changed without refreshing the reviewed toolchain source-closure digest; a Windows symlink fixture also fails before compiler logic. Full packaging and reuse outcomes are not proven. |
| Operations | **STAGED** | `src/{work-graph,loop-engine}.ts`; Command Center workspace tools | Work and loop models exist. End-to-end product operation and improvement across ventures need receipts and outcome measures. |
| Transfer | **STAGED** | `src/multi-sync.ts`; `transmissions/TRANSMISSION_PROTOCOL.md` | Registered local project context can be imported. Manual transmission channels are a convention, not an automatic verified capability-transfer service. |
| Evidence | **LIVE locally** | `protocol/{conform,sign,verify}.mjs`; `protocol/test/{conform,sign}.test.mjs`; `src/ledgers.ts`; `test/v01-evals/` | Local conformance, signed-receipt verification, ledger constraints, and eval fixtures exist. A “Built on SIP” footer declares composition; it is not itself a signed receipt. |
| SIP interoperability | **STAGED** | `SIP.md`, `protocol/README.md`, `protocol/test/conform.test.mjs` | A local reference profile and conformance tool exist. External-host interoperability is not proven by these tests. |
| Starlight Network and federation | **RESEARCH** | `protocol/README.md` calls graph v0.1 proposed; `src/multi-sync.ts` imports local registered paths | No demonstrated sovereign node exchange or multi-party conformance. Never use present-tense network language. |
| Academy | **RESEARCH** | `site/src/app/field-notes/page.tsx` labels Academy practice awaiting publication | Learning/distribution intent exists; no Academy product runtime or current course claim is supported. |
| Starlight Notes / Horizon Vault | **STAGED** | `notes/NOTES_SYSTEM.md`, `public-vault/*.jsonl`, `site/src/lib/vault.ts`, `site/src/app/api/vaults/` | Public machine-readable vault entries exist. The full Notes artifact schema, revisions, export contract, and privacy review are incomplete. |
| Portfolio intelligence | **STAGED** | Command Center workspace model and `src/{work-graph,ledgers}.ts` | Portfolio state can be represented; measured decision advantage, economic value, and independent venture outcomes need verification. |
| Self-improvement | **STAGED** | `tools/foundry/lib/evolve.mjs` defaults to proposal; `src/active-healing.ts`; `src/memory-eval.ts` | Evolution proposals and eval code exist. The default memory eval corpus is absent from main; no public memory score or safe autonomous repair claim is earned. |
| Autonomous venture operation | **HORIZON** | No end-to-end operating receipt or test on main | Describe as intended direction only. |
| Generational/civilizational infrastructure | **HORIZON** | `site/src/app/constitution/page.tsx`, `memory/vaults/horizon-vault.md` | Mission and values, not present product capability. |

## Claim defects to remove from the public path

- `site/src/components/OperationalProofConsole.tsx` displays an illustrative **0.97 score**, “Verified release run,” “Governance clear,” and “READY” with no source receipt. The homepage places it under Evidence. Replace it with linked source and tests or mark it unmistakably illustrative.
- `plugins/starlight-intelligence/server/seed/workspace.json` and `plugins/starlight-intelligence/supabase/migrations/20260831111500_create_starlight_workspaces.sql` contain seed revenue, health, progress, releases, and evidence coverage. They cannot be used as traction or production metrics.
- `metrics/current.json` contains dated inventory counts. Agent and skill counts measure registry size, not venture outcomes, autonomy, or the compounding thesis.
- The Foundry v9.2 suite is not wholly green on audited main: OpenAI plugin projection is blocked by a stale source-closure digest, and the symlink fixture requires privilege on Windows. A separate repair must refresh the reviewed digest without bypassing the lock and make the test fixture portable. Do not present that projection as working today.
- `src/gateway/server.ts` does not sanitize every `memory.add` payload. `src/sandbox.ts` does not isolate processes, network, or filesystem. `src/active-healing.ts` does not use its `dryRun` flag as a guard inside `heal()`. Avoid blanket PII, sandbox, or autonomous repair claims.

## Product thesis measurement

North star: **verified capability reuse that improves a real venture outcome**. A qualifying record needs a source venture, destination venture, capability version, verification receipt, baseline, outcome, and attribution caveat. Current main has no complete qualifying record; the baseline is **unmeasured**, not zero.

Supporting measures to instrument without invented numbers: idea-to-working-product time, new operator time-to-context, capability reuse across at least two ventures, decision recall/provenance success, inherited-context versus cold-start task success, duplicated-work reduction, venture export independence, and share of public product claims linked to executable evidence.

---
**Built on SIP** — Starlight Intelligence Protocol

Substrate: starlightintelligence.org/protocol v1.1.1
Layers used: attestation, sovereignty
Verticals: none
Canon: none
Nodes: Starlight Holding BV · role: architect · substrate and claim governance
Generated: 2026-09-23
Attestation is compounding, not credit transfer: every composition strengthens every node.
---
