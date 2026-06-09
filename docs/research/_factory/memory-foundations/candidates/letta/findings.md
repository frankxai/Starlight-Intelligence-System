# Letta (was MemGPT) — Findings

**Candidate:** C3
**Scored by:** Research sub-agent (general-purpose, 2026-05-20)
**Verdict:** **RECOMMEND**
**Subtotal:** 44/50

---

## TL;DR (50 words)

Letta is Apache-2.0 (22.8k stars, letta-ai/letta) stateful-agent platform built on the MemGPT hierarchy. Its 2026 MemFS layer stores memory as **markdown files in a local git repo at `~/.letta/agents/<id>/memory`** — filesystem-native, git-tracked, diff-friendly. Headline strength: substrate-shaped by design. Headline weakness: agent-framework opinionation may overconstrain pure-substrate use.

## Constraint axioms

- **A1 SIP attestation possible?** — **Yes (native via frontmatter).** Each MemFS file is markdown with YAML frontmatter (`description`, `limit`, arbitrary keys). `attestation: "Built on SIP — <hash>"` becomes first-class frontmatter, queryable by any tool that reads markdown.
- **A2 Filesystem-native atoms?** — **Yes — strongest PASS of any candidate.** "Just plaintext markdown files in a git repo" at `~/.letta/agents/<id>/memory`. `cat`, `grep`, Obsidian, VS Code all work. Engine-death survives.
- **A3 Vault canon layerable over?** — **Yes.** Directory tree of markdown files. 6-vault ontology maps directly. `system/` convention (auto-loaded into prompt) maps to "hot canon"; everything else to warm/cold — incidentally satisfies D2 natively.
- **A4 Forkable without cloud/key?** — **Yes.** Self-hosts via Docker; framework is white-box OSS. `git clone` of memory repo IS the fork primitive. Model provider operator's choice (Ollama / OpenRouter / direct).
- **A5 No silent model lock-in?** — **Yes (explicitly).** Docs: "Letta is fully model-agnostic." Backends: OpenAI, Anthropic, vLLM, Ollama, OpenRouter via base-URL. Recommends Opus 4.5/GPT-5.2 for *quality* (not lock-in). Honest disclosure.

**Axiom verdict:** All 5 PASS. Only candidate in this pair that passes A2 without adapter glue.

## Scoring (D1–D10)

| # | Dim | Score | Rationale |
|---|---|---|---|
| D1 | Ontology compat | **5/5** | Atom = markdown file. Vault = directory or top-level file. Namespace = agent_id (path-prefixed). Attestation = YAML frontmatter key. Tier = `system/` vs other directories (native distinction). Source = frontmatter field. All 5 native. |
| D2 | Substrate-vs-hot-path | **5/5** | `system/` "always loaded into system prompt"; everything else "visible but not auto-loaded." That IS substrate-vs-operational, native and load-bearing. Promotion = `git mv` into `system/`. Best-in-class. |
| D3 | Cross-tab semantics | **4/5** | Memory subagents use git worktrees for concurrent writes; git merge resolves conflicts. Filesystem-native coordination, not singleton. Strong but git-merge-conflict-prone under high write parallelism. |
| D4 | Precision@10 | **4/5** | LoCoMo benchmark **83.2%** (highest in comparison set). Architecture-fit prediction for SIS: high, because retrieval treats markdown as first-class. Expect rank-1 hits. |
| D5 | Recall cross-session | **4/5** | Stateful agent + archival + recall hierarchy purpose-built for cross-session continuity (original MemGPT thesis). Estimated >85% on "what shipped in v7.5.3?"-class queries. |
| D6 | Hybrid retrieval | **5/5** | Vector (over file chunks) + filesystem path (directory tree IS structural) + chronicle linkage (git history per file = native chronicle). Best-in-class. |
| D7 | Attestation surface | **5/5** | YAML frontmatter IS the native attestation primitive. Per-atom, queryable without engine, fork-survives. Cannot beat this with any adapter. |
| D8 | Forkability | **4/5** | `git clone` + `letta start --memfs-path .` ≈ offline. Requires Letta installed (Python/Docker) + model provider. Loses 1 point for Python-runtime vs pure `cat` access. |
| D9 | Maintenance burden | **4/5** | ~100-200 LOC adapter (path mapper + frontmatter validator + Obsidian symlink). 177 releases since founding, v0.16.8 May 2026. Active but coherent semver. Annual review feasible. |
| D10 | Latency p95 | **4/5** | Filesystem-native retrieval over 3000 markdown with embedding index: 50-200ms p95 plausible. Sub-100ms achievable for 1000-atom corpus. |

**Subtotal: 44/50**

## Integration path for SIS

- **LOC:** ~150-250 (MemFS path mapper from `memory/vaults/*.md` + `atoms.jsonl` → `~/.letta/agents/sis/memory/`; frontmatter schema validator; Obsidian symlink / git-submodule pattern)
- **Wall-clock:** 8-14 hours (Docker + OpenRouter config + migration + canonical vault mapping + smoke tests). Lower than mem0 — vaults ARE files.
- **Reversibility:** **High.** MemFS files ARE the substrate. Walking away = stopping engine. Markdown remains. Cost ≈ 1 hour.
- **Replace vs augment:** Replaces `memory/mempalace/` engine. **AUGMENTS** `memory/vaults/` by adding retrieval + git-tracked changelog *over* existing markdown. Obsidian workflow continues. Letta becomes retrieval engine *over* canon, not replacement.

## Falsifier

Reverses if (a) Letta pivots from MemFS to DB-resident memory (unlikely; context-repositories blog commits hard to git thesis), (b) agent-framework opinionation imposes runtime constraints SIS can't accept (needs probe in eval), (c) actual eval precision@10 <60% despite LoCoMo strength (LoCoMo doesn't transfer), or (d) git-worktree conflict resolution brittle under SIS concurrent-tab write load.

## Verdict

**RECOMMEND.** Only candidate in pair that passes A2 cleanly, and only one whose architecture *shape* matches SIS substrate by construction rather than adapter glue. MemFS = markdown files in a git repo IS the SIS file-contract restated by a vendor that arrived at the same conclusion independently. 5-axiom pass + 44/50 + LoCoMo 83.2% + high reversibility + low integration cost (~10h, ~200 LOC) = convergent answer. Risk: agent-framework opinionation. Mitigation: use Letta as *library* (MemFS + retrieval) without committing to full agent loop. Strong recommend pending eval phase.

## Sources

- https://github.com/letta-ai/letta
- https://docs.letta.com/letta-code/memfs
- https://www.letta.com/blog/context-repositories
- https://docs.letta.com/letta-code/memory/
- https://docs.letta.com/guides/docker
- https://docs.letta.com/guides/server/providers/ollama
- https://hub.docker.com/r/letta/letta
- https://docs.letta.com/concepts/memgpt

*Built on SIP — 2026-05-20*
