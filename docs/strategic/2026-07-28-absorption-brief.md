# Absorption Brief — What SIS Should Take from the July 2026 Landscape

**Date:** 2026-07-28 · **Method:** 3 parallel research agents (protocols/standards, agent frameworks, memory/evals/infra), all claims web-verified same-day with sources · **Audience:** Frank + Starlight Board · **Status:** proposal — substrate-touching items below go through `/starlight-board` before adoption.

The question this answers: *"Don't we need more agents and skills and a meta layer — more latest stuff absorbed from other top-tier GitHubs?"*

**Short answer: not more agents — more edges.** 144 agents and 84 skills is already above the credibility line the evals repo can defend. The gap between SIS and the July 2026 frontier is not roster size; it is (1) the wire protocols the frontier standardized this quarter, (2) three memory-schema patterns that are pure upgrades, and (3) distribution surfaces that put the existing roster where adopters already are. Every recommendation below composes — nothing replaces the substrate.

---

## 1. Protocol layer — the standards that locked in this quarter

| Standard | State (verified 2026-07-28) | What SIS does |
|---|---|---|
| **MCP spec rev 2026-07-28** | Published **today**: stateless core (protocol session removed; identity/capabilities move to `_meta`), Extensions framework, Tasks, MCP Apps, `.well-known` server metadata, formal deprecation policy. v2 SDK betas (TS/Python/Go/C#). | **Highest priority.** Migrate `src/mcp-server.ts` + `starlight-mcp` from the 2024-11-05 protocol to the new revision. Statelessness means session semantics must move into application-layer memory keys — the vault layer already works this way, so the port is favorable. Publish `.well-known` metadata for both servers. |
| **A2A v1.0** (Linux Foundation, 2026-04-09; 150+ orgs; shipped in Google/Microsoft/AWS platforms) | protobuf data model, JSON-RPC/gRPC/REST bindings, AgentCard discovery, extension mechanism. | Publish **A2A AgentCards for the Queens** (starlight-swarm) so external ADK/MAF/CrewAI agents can delegate into the swarm. Define a small **SIP extension** on the AgentCard carrying the attestation + sovereignty declaration — this is white space no one else occupies. |
| **AGNTCY / OASF** (signed agent records) | Agent Directory Service with cryptographically signed agent records. | Export the 144-agent registry as signed OASF records in CI — machine-verifiable roster, generated from `agents/`, checked by the same fail-closed harness. |
| **agents.md** (60k+ repos, LF Agentic AI Foundation) | De facto cross-harness convention. | Already aligned (AGENTS.md exists per-repo). Keep. |
| **x402 Foundation + AP2 v0.2.0** | Payments protocols consolidating (Apr 2026). | payment-intelligence-system already models AP2 mandates fail-closed. Track v0.2.0 delta; no autonomous money movement — unchanged, non-waivable. |
| **C2PA 2.3 / ISO/IEC 22144; EU AI Act Art. 50 applies 2026-08-02** | Content provenance goes regulatory **in 5 days**. | Extend `/sip-attest` to emit C2PA manifests for media artifacts. SIP's **text/code attestation** remains the differentiator — C2PA covers media; nobody owns text/code provenance. Claim it. |

## 2. Framework layer — patterns worth stealing (no runtimes worth adopting)

Verified state: OpenAI is **winding down AgentKit visual builder + Evals (discontinued 2026-11-30)** and steering everyone to code-first SDKs; Microsoft MAF 1.0 (Apr 2026) merged AutoGen+SK; Google ADK 2.0 GA'd at I/O with native OTel; LangGraph holds a no-breaking-changes line; CrewAI shipped pluggable memory backends. The market converged on exactly the bet SIS made: **markdown/code-first agent definitions, MCP + A2A interop, no visual-builder lock-in.** The builders are churning; the protocols are not.

Absorb as patterns:
- **CodeAct** (MAF, BUILD 2026): worker collapses a multi-step plan into one sandboxed program calling tools — claimed ~50% latency / >60% token cuts. Prototype as an execution mode for starlight-swarm workers **behind the existing fail-closed gate**.
- **Checkpoint/resume** (LangGraph durable execution): map Queen-session checkpoints onto the vault/AgentDB tier so long swarm runs survive interruption. Semantics only; no dependency.
- **Plugin packaging** (Claude Code ecosystem: ~36.6k plugins): package the 84 skills + agent roster as a Claude Code plugin-marketplace repo — distribution to where adopters already are, zero new code in the substrate.
- **CrewAI memory-backend adapter**: thin shim exposing the SIS MCP memory server as a CrewAI backend. Low effort, real reach.

## 3. Memory + evals layer — three pure-upgrade schema changes

1. **Bi-temporal facts** (Zep/Graphiti pattern): add `valid_from` / `invalidated_at` to vault JSONL entries — facts get superseded, never overwritten. Composes perfectly with the existing `sis_invalidate` / `sis_contradict` tools; SQLite edge table beside FTS5, no Neo4j.
2. **Memory-op taxonomy** (Mem0 v2.0 pattern): consolidation pass classifies each incoming entry ADD/UPDATE/DELETE against existing memory. Formalizes what vault consolidation already does by hand.
3. **Retrieval-usage feedback** (AgentDB pattern): log which retrieved entries a session actually used (`used_in_session` signal), re-rank by it. SIS already names AgentDB as tier 3 — this wires the learning loop.

Evals: adopt **promptfoo's declarative scorecard format** (pinned version — OpenAI acquired promptfoo Mar 2026, governance risk nonzero) as the interchange format in starlight-evals; run **LOCOMO** against Mem0/Zep published numbers so SIS retrieval has a public benchmark, not just self-reported scorecards. Emit **OTel `gen_ai.*` spans** from the MCP server pinned to a dated semconv snapshot (nothing tagged Stable as of 2026-07-17); optional self-hosted Langfuse for the trace UI. Mirror scorecards as a **Hugging Face dataset** (HF MCP server gained `hf_fs` + Sandboxes on 2026-07-26) — first concrete step of the Layer-4 preservation blueprint.

## 4. Sequenced adoption plan

| # | Move | Tier | Effort |
|---|---|---|---|
| 1 | MCP server migration to spec 2026-07-28 (v2 SDK) + `.well-known` metadata | Substrate → **Board first** | M |
| 2 | Bi-temporal vault fields + memory-op consolidation pass | Substrate (schema) → **Board first** | S |
| 3 | A2A AgentCards for Queens + SIP AgentCard extension | Substrate (cross-party) → **Board first** | S |
| 4 | promptfoo-format scorecards + LOCOMO run in starlight-evals | Operational | S |
| 5 | Claude Code plugin-marketplace packaging of skills/agents | Operational | S |
| 6 | OASF signed registry export in CI | Operational | S |
| 7 | C2PA emission in `/sip-attest` (before EU AI Act Art. 50, 2026-08-02) | Substrate → **Board first** | M |
| 8 | CodeAct worker mode prototype (fail-closed gated) | Operational | M |
| 9 | Retrieval-usage feedback column + re-rank | Operational | S |
| 10 | OTel spans + optional Langfuse; HF dataset mirror of scorecards | Operational | S–M |

**What we deliberately do NOT do:** adopt any framework runtime (MAF/ADK/LangGraph/CrewAI) as a dependency; chase agent-count growth; build on visual-builder surfaces (AgentKit's wind-down is the cautionary tale); anchor anything on-chain before two attested corpora exist (per the Layer-4 blueprint).

---

*Synthesized from three same-day research sweeps; full source lists live in the session journal. Companion doc: `docs/validation/2026-07-13-multiagent-ecosystem-validation.md` (the 5-layer blueprint this sequences into).*

**Built on SIP** — Starlight Intelligence Protocol.
