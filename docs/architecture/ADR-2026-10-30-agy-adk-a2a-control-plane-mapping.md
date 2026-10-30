# ADR: Map the Gemini, Antigravity, ADK and A2A control-plane proposal onto SIS

Status: Proposed (not accepted; no runtime change)

Date: 2026-10-30

Scope: SIS operational layer. No SIP substrate change.

Owner: Starlight Architecture

## Context

A five-part proposal circulated on 2026-10-30. It describes a Gemini web chat as a strategy and spec control plane. Antigravity (`agy`) executes. Google Workspace (Docs and Sheets) acts as a shared state bus. ADK 2.0 orchestrates. A2A links specialists. GitHub Actions and an `agy` remote daemon run the work.

SIS already has most of these parts. This ADR does three things:

1. checks each external claim against current sources and records how well it is supported;
2. maps each proposed layer onto the SIS component that already fills it;
3. lists the real gaps and the order to close them.

It builds nothing. It starts no service, schedule, daemon, cloud identity or write-back.

## Claim verification (2026-10-30)

Evidence level: **corroborated** means current secondary sources agree and the claim is consistent with SIS behavior. **unverified** means no source found. **qualified** means the claim is partly right. No claim below has been run against a live `agy`, ADK or A2A installation. Primary-source and live checks are the first task in the follow-up slice.

| Claim | Level | Note |
|---|---|---|
| `agy plugin import gemini` converts legacy Gemini CLI extensions to plugins | corroborated (secondary) | Run it in a scratch profile before relying on it. |
| That import turns the Workspace extension into "5 skills and 2 slash commands" | unverified | The count has no source. |
| Antigravity reads workspace skills from `.agents/skills/` | corroborated (secondary) | SIS has no `.agents/skills/` today. Skills live in this repo's `skills/` and in the estate's `starlight-agent-config/core/skills`. |
| `agy` parses `AGENTS.md` and `GEMINI.md` | corroborated (secondary) | SIS already ships both, with generated Band A in `AGENTS.md`. |
| A2A Agent Cards are served at `/.well-known/agent.json` (also `agent-card.json`) | corroborated | Spelling varies by spec version. Pin the version before writing code. |
| ADK `RemoteA2aAgent` consumes a remote card | corroborated | |
| ADK `LoopAgent` gives bounded refine loops | qualified | Newer ADK versions move templated loops toward graph workflows. Do not depend on the class name. |
| Event compaction cuts tokens by about 38% and latency by about 18% | unverified | No source. Do not cite the figures. |
| Compaction can pin `memory_keys` so they survive summarisation | qualified | Sources describe `memory_keys` as context-segment mapping, not a guarantee that a value survives compaction. Treat pinning as unproven. |
| `run-gemini-cli` supports keyless auth through Workload Identity Federation | corroborated | Needs `id-token: write` and a pool scoped to this org and repo. Requires GCP setup and Frank's approval. |
| Remote Control daemon and an `Alt+J` fast-path alert | unverified | |

## Layer mapping

| Proposed layer | SIS component that fills it today | Gap |
|---|---|---|
| Strategy and spec plane (Gemini chat) | Strategy and ADRs in `docs/architecture/`, locked decisions via `/lock-decision` | None needed. A chat is an input surface, not an authority. |
| Memory bus (Docs and Sheets) | Operational work graph (`src/work-graph.ts`), queen envelopes (runtime queue under the estate's `starlight/queen/`; contract in `docs/operations/queen-session.md`), vault event logs | A Workspace adapter does not exist. See decision 2. |
| Tool layer (MCP) | `src/mcp-server.ts` surface, per-harness MCP configs, `docs/architecture/context7-and-sovereign-telemetry.md` | No per-subagent MCP profiles, so tool-schema bloat is unmanaged. |
| Specialist layer (A2A) | `agents/AGENT_REGISTRY.md`, `agents/catalog/*.json`, example Agent Card in PR #203 (draft) | No live card, no auth, no exchange. By design today. |
| Orchestrator and governance (ADK) | Queen dispatcher, `.loop` contracts in `starlight-agent-config`, SAGE goal checklists, work-graph read model that already projects A2A-aligned states | No Judge stage with a capped refine loop on every worker path. |
| Research, judge, refine gate | Independent verifier rule in the estate spine, Santa loop, `/starlight-board` | Not uniform. Several loops have failing verify gates (see the 2026-10-30 estate status). |
| Execution engines (GitHub Actions and daemon) | Queen runners, worktrees, `fleet-ingress`, cloud worker | WIF and a remote daemon are not set up. |

## Decisions proposed

1. **SIS stays the system of record.** The work graph owns the ledger. A2A, MCP, Workspace and ADK are adapters. This matches `operational-work-graph.md` ("neither owns the ledger, memory authority, or completion decision") and `PRODUCTION-AND-SOVEREIGN-RUNTIME.md` ("an agent file, A2A card or MCP tool description cannot escalate" grants).
2. **Workspace is an untrusted proposal inbox, never an executor.** A Sheet row or Doc edit is attacker-reachable input. It may only create a *proposal* envelope. It then follows the existing path: ingress that fails closed (per #513), human gate for money, sends and releases, and an independent verifier. Status flows back as a one-way projection of the work graph. No direct write access to repos, secrets or queue state.
3. **One context source.** `AGENTS.md` stays universal and its generated Band A stays generated. `GEMINI.md` carries only Gemini-specific routing. No duplicated rule files. Skills in `.agents/skills/` are generated projections of `core/skills` and never hand-edited, consistent with the estate rule that harness directories are projections.
4. **Judge before human, bounded.** Every autonomous worker path gets a deterministic judge stage (tests, lint, anti-slop rules) and at most three refine iterations. Escalate to the human after the cap. The cap lives in the loop contract (already required: max iterations, no-progress stop), not in a framework class.
5. **A2A is internal-first and private by default.** Any Agent Card is served only on loopback or a private network, with auth declared in the card and enforced by the host. Public reachability needs a named approval. No card is published without a live-verified exchange.
6. **No new always-on process, schedule, cloud identity or write-back is created by this ADR.** Each needs Frank's approval under Doctrine 0 and the security doctrine.

## Rejected for now

- A single Workspace-driven dispatcher that executes rows automatically: it defeats the fail-closed ingress model.
- Adopting ADK as orchestrator before a measured gap exists. The queen and work graph already cover routing, state and receipts.
- Citing the compaction figures in any public or customer-facing material until a primary source exists.

## Follow-up slices (each its own branch, tests, draft PR)

1. **Primary-source check.** Pin `agy`, ADK and A2A versions from official docs and run `agy plugin import gemini` in a scratch profile. Update the claim table with real evidence.
2. **Private A2A Agent Card for one read-only specialist** (queen status reporter), loopback only, with a schema test and an auth-required test.
3. **Judge stage with a three-iteration cap** wrapped around one existing loop contract. Pick a loop that is currently red so the judge is exercised against a real failure.
4. **`.agents/skills/` projection** generated from `core/skills` with a drift check.
5. **Workspace proposal-inbox design** (read-only adapter, threat model, redaction rules). Needs approval before any credential or write scope exists.
6. **WIF for GitHub Actions.** Needs GCP setup and explicit approval. Scope the pool to this org and repo.

## Evidence limits

- Claim levels come from search summaries that cite secondary sources. No primary documentation was fetched and no live tool was run.
- Repository facts come from `origin/main` at `7e4ca5b29`.
- No quota-limited subagent review was possible on 2026-10-30. Independent exact-revision review is still required before this ADR moves from Proposed to Accepted.
