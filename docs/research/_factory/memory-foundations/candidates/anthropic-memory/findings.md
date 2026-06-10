# Anthropic Memory API — Findings

**Candidate:** C6
**Scored by:** Research sub-agent (general-purpose, 2026-05-20)
**Verdict:** **REJECT on A5 (silent model lock-in)**
**Subtotal:** 20/50 + 1 axiom failure

---

## TL;DR

The Anthropic Memory tool (beta `memory_20250818`, launched 2025-09-29; Managed-Agents GA 2026-04-23) is a **client-side file-system protocol**, not a memory engine. Anthropic stores nothing. The API surface is six commands (`view`, `create`, `str_replace`, `insert`, `delete`, `rename`) operating against a `/memories` directory **your application implements**. Storage, persistence, attestation, search semantics — all yours. Anthropic supplies the tool schema + an injected system-prompt prologue.

Two consequences:
1. **A1–A4 pass trivially** because we implement storage (we control attestation, filesystem layout, vault canon, forkability).
2. **A5 fails structurally** because `memory_20250818` is a Claude API contract. GPT-5, Gemini 2.5, DeepSeek-R1 do not understand it. Cross-model = N parallel adapters. Canonical silent-model-lock-in.

## Axiom check

| Axiom | Result | Notes |
|---|---|---|
| A1 SIP attestation | PASS (conditional) | Our backend, our attestation field |
| A2 Filesystem-native | PASS | Protocol *is* a filesystem metaphor |
| A3 Vault canon preserved | PASS (conditional) | Map vaults to subdirectories |
| A4 Forkable | PASS (conditional) | Backend forkable; Claude dependency is not |
| **A5 No silent model lock-in** | **FAIL** | Claude-only tool schema; no equivalent for GPT/Gemini |

## Scoring (informational — already rejected)

| Section | Score |
|---|---|
| Architecture fit (D1–D3) | **5 / 15** — atom/namespace mappable but undifferentiated `/memories` directory, no substrate-vs-hot-path tier, cross-tab race conditions still our problem |
| Retrieval quality (D4–D6) | **2 / 15** — *no retrieval engine.* `view` returns directory listing or file contents. No vector search, no ranking, no hybrid. For 3000-atom corpus this is unworkable without us building the index. |
| Sovereignty (D7–D8) | **6 / 10** — attestation adapter-trivial; forkability partial (code yes, model no) |
| Operational (D9–D10) | **7 / 10** — SDK helpers (`BetaAbstractMemoryTool` Py / `betaMemoryTool` TS), <500 LOC adapter, p95 latency dominated by tool-call round-trip (~200-500ms/turn) |
| **Total** | **20 / 50** + 1 axiom failure |

Even ignoring A5, 20/50 is bottom-quartile. The Memory tool is a **scratchpad protocol**, not a retrieval engine.

## What we should still steal (even though we reject)

1. **The system-prompt prologue.** "IMPORTANT: ALWAYS VIEW YOUR MEMORY DIRECTORY... ASSUME INTERRUPTION." Encode the same discipline in whichever foundation we pick.
2. **Multi-session software development pattern** — initializer session → subsequent sessions → end-of-session update. Maps cleanly onto `/handover` + Chronicle cadence.
3. **Date-stamped tool-type versioning** (`memory_20250818`). Apply same convention to our atom schema.
4. **"View first" hygiene** as Karpathy-grade prompt discipline.

## Integration cost (had axiom passed)

~300 LOC `BetaAbstractMemoryTool` subclass + ~200 LOC synthetic retrieval (the protocol provides none) + ~6h wall-clock + ~2h/year maintenance. Wasted unless we accept Claude-only execution.

## Falsifier

- Anthropic open-standardizes Memory tool (Linux Foundation / RFC) + OpenAI/Google adopt → A5 passes; revisit
- SIS Board explicitly decides Claude-only is acceptable → A5 retired; revisit
- Anthropic ships server-side hybrid retrieval on top of `/memories` → D4-D6 recoverable

None on public roadmap as of 2026-05-20.

## Sources

- https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- https://www.anthropic.com/news/context-management
- https://github.com/anthropics/anthropic-sdk-python/blob/main/examples/memory/basic.py
- https://github.com/anthropics/anthropic-sdk-typescript/blob/main/examples/tools-helpers-memory.ts
- https://www.techzine.eu/news/devops/140836/anthropic-adds-memory-to-claude-managed-agents/

*Built on SIP — 2026-05-20*
