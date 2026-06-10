# World-Class Plan — Starlight Constellation v2

> Multi-action plan from the 2026-06-10 `/superintelligence` five-agent audit sweep
> (portfolio · memory-privacy · doc-drift · competitive · runtime-validation).
> Reconciles with `MASSIVE_ACTION_PLAN.md` (v1, ACCEPTED 2026-04-25) — this document
> updates positioning + repo-excellence strategy; v1's spine (three surfaces, ten IS,
> Orchestrator naming, capture stack) remains in force where not contradicted here.
> Layer: operational (positioning execution gated on `/starlight-board` where marked).
> Status: P0 items executed same-day; P1-P3 sequenced below.

---

## 0. Ground truth (measured 2026-06-10)

- **Health:** 967/968 tests green (183 operational + 750 substrate + 34 evals). Sole
  failure was AGENTS.md agent-count drift — fixed in this ship. Site live (200),
  sovereign JSONL substrate verified live-written today, sentinel/key-monitor/indexer/
  backup all firing daily.
- **GitHub standing:** 5 stars. README A-grade but leads with protocol abstraction;
  license shows `NOASSERTION` (machine-unreadable); no hero visual; not listed on
  awesome-claude-code (46k★).
- **Privacy:** Three real exposures found in the public repo (closed or stubbed in this
  ship — see §3); history-rewrite decision left to Frank.
- **Portfolio:** ~15-repo constellation; declared interconnection map
  (`ECOSYSTEM_ARCHITECTURE.md`, Feb 2026) describes a 3-repo world — actively misleading.

## 1. The Real Question (superintelligence synthesis)

Surface ask: "make this the best repo on GitHub."
Real question: **which category can SIS own outright, and what is the shortest path
from 5 stars to being the obvious answer in that category?**

First-principles answer: SIS cannot win "memory library" (mem0 58k★, graphiti 27k★,
benchmark-driven, VC-funded) or "orchestration framework" (ruflo 58k★, daily releases).
The unclaimed category — verified empty across the June 2026 landscape — is:

> **The sovereign intelligence substrate: persistent memory, identity, and attested
> governance for one operator's entire AI fleet, across Claude Code, Cursor, Codex,
> Gemini CLI, and Antigravity.**

Every memory vendor sells to app developers building agents *for users*. Nobody serves
the **operator running 5 parallel sessions across 6 CLIs who needs them to share one
brain and one set of rules**. That operator persona is the fastest-growing on GitHub
(superpowers: 0→223k★ in 8 months; awesome-claude-code 46k★) and is Frank's literal
daily reality — the repo demos itself.

Structural tailwinds: Claude Code auto-memory commoditized per-project memory (value
moved above the line: cross-tool, cross-repo, governed, attested); OpenAI Assistants
API sunsets 2026-08-26; EU-AI-Act-driven "audit trails by default" maps directly onto
SIP attestation — no competitor has a provenance protocol.

**Contrarian check:** the risk is not the category — it's legibility. SIS's depth
(boards, doctrines, verticals, canon) reads as complexity tax to a newcomer. The
counter-move is the superpowers lesson: let people get value from ONE primitive in
5 minutes before they meet the methodology. Starter tier ≠ dumbing down; it's a funnel.

## 2. Massive-action phases

### P0 — Shipped 2026-06-10 (this commit)

1. Privacy: `memory/mempalace_sovereign/` + `artifacts/` gitignored (closed the
   one-`git add -A`-from-public near-leak).
2. Privacy: `context/STATE.md` → `private/context/STATE.md`, sanitized public stub left.
3. Privacy: `/wealth-dpi` gate ladder re-genericized; real ladder stays in
   `private/VERTICALS-state.md`. Personal-email test fixture replaced.
4. Drift: agent count 47→48 (Evaluator) across AGENTS.md / CLAUDE.md / README.md /
   AGENT_REGISTRY.md ("Forty-two minds" → "Forty-eight"); SKILL_REGISTRY header 69/13 →
   71/14; command counts corrected. Unblocks the failing harness check + GHA.

### P1 — This week (operational tier; board pre-pass only where marked)

1. **Repositioning ship** *(board pre-pass: `/starlight-board`, autonomous per standing
   directive)* — GitHub description + topics to the sovereign-substrate category
   sentence; README first screen rewritten: category one-liner → 5-line quickstart →
   hero visual; two-layer prose moves below the fold.
2. **License legibility** — make `LICENSE` parse as pure MIT (layered text fully into
   `NOTICE`) so GitHub shows "MIT" instead of `NOASSERTION`.
3. **Hero demo** — the demo only SIS can make: two different CLIs (Claude Code + Codex)
   recalling the same attested memory atom. 90s GIF/asciinema, committed at
   `docs/assets/hero.gif` (root `/*.png` ignore doesn't cover docs/assets).
4. **Walker-level drift fix** — `v87-agent-registry` symmetry test: `agents/**/*.md`
   count == registry rows-with-files == count claims in CLAUDE.md/AGENTS.md/README.md;
   extend v78 to assert SKILL_REGISTRY header == table rows. Counts can never drift
   silently again.
5. **Ops repairs** — FrankXMachineMonitor launch-refusal (task conditions),
   StarlightSecretScan ExecutionTimeLimit + gitleaks allowlist for the test fixture,
   GHA Vercel secrets decision (set via `gh secret set` or delete the cosmetic job).
6. **Key rotation** *(ASK-CLASS — Frank executes)* — OPENAI_API_KEY revoked 24 days;
   GEMINI_API_KEY slot still holds an OpenRouter-format key. Rotate both; re-run monitor.
7. **Ana anonymization** — friend-starter pack: rename to fully fictional persona with
   invented frameworks (~25 mentions), or record explicit consent.

### P2 — Next 30 days (distribution + proof)

1. **Submit to awesome-claude-code** + skill marketplaces (SkillsMP, claudemarketplaces,
   aitmpl). Highest-leverage free distribution in the niche.
2. **One-command install** — Claude Code plugin manifest: `claude plugin add starlight` /
   `npx skills add frankxai/Starlight-Intelligence-System`; per-platform copy-paste
   setup for Cursor/Codex/Gemini CLI.
3. **BENCHMARKS.md** — publish the existing retrieval eval (precision@10, recall@5,
   51x JSONL-vs-vector latency from the sovereign flip) with CI badge. A number beats
   prose; benchmarks are the marketing currency of this niche.
4. **STARTER tier** — 5-minute adoptable core (MCP server + 6 vaults + 10 skills, zero
   governance reading); full 48-agent/71-skill stack stays as the reference build.
5. **Release cadence** — tag v8.2.x weekly with human-readable notes; the release feed
   is the aliveness signal every top repo maintains.
6. **Constellation map refresh** — rewrite `ECOSYSTEM_ARCHITECTURE.md` from the real
   ~15-repo constellation; mark ai-ops/arcanea/broadcast channels DORMANT; add channel
   rows for sentinel, second-brain-os, starlight-evals (real integrations, undeclared).
7. **Portfolio hygiene** — archive `starlight-intelligence.ai/` (superseded by `site/`);
   push `starlight-agent-lab` to a remote (only unbacked-up repo); resolve
   claude-skills-library vs ACOS duplication (mirror-with-provenance or archive);
   `git init` StarlightAudio config; merge or close stale feature branches on
   Arcanea / library-os / arcanea-flow.

### P3 — 60-90 days (absorb the best of competitors)

1. **Temporal validity edges (from graphiti)** — `valid_from` / `invalidated_by` on
   vault atoms; the dreaming pipeline already detects contradictions, so this is cheap
   and closes the LongMemEval-style gap.
2. **Self-editing memory blocks (from Letta)** — `sis_memory_edit` MCP tool, every edit
   SIP-attested. Attested self-editing memory is a first.
3. **Hosted feel (from mem0)** — 60-second no-install demo via the Console at
   starlightintelligence.org, linked top-of-README.
4. **History decision** *(ASK-CLASS)* — old STATE.md / gate-ladder content remains in
   git history on the public remote; full removal = history rewrite + force-push to
   main. Frank decides: accept residual exposure (content is strategic, not credential)
   or schedule a rewrite window.

## 3. Memory privacy ruling (validated architecture)

| Bucket | What | Where |
|---|---|---|
| PRIVATE-LOCAL | `private/` tree, `memory/_audit/`, `memory/mempalace*` (all gitignored), security-posture memories, credentials (→ Infisical, not memory text) | this machine only |
| PRIVATE-SYNCED | Claude auto-memory dir (84 project/feedback files), api-monitor plans, key-slot state | Restic channel between Frank's machines — never via this repo |
| INTERCONNECTED | operational-vault, consolidation log, KG rollups, sprints, repo-contexts, transmissions | Memory Bus + channels; redaction filter runs BEFORE indexing |
| PUBLIC-VAULT | wisdom/creative/technical/horizon vaults (verified clean), `public-vault/` 108 atoms (verified clean), substrate docs | tracked, public — quarterly review of operational-vault, which drifts private |

Enforcement: wire the €-figure guard-grep into the pre-commit hook (it was un-runnable
while real figures sat in 18 tracked files; after this ship it can be enforced).

## 4. Confidence + falsifiers

**Confidence: HIGH** on category choice and P0/P1 mechanics (measured landscape, measured
repo). **MEDIUM** on star-growth velocity (distribution submissions have review queues;
the hero demo quality decides conversion). Falsifiers: if 30 days post-P2 the repo gains
<50 stars, the category sentence is wrong or the quickstart isn't landing — rerun the
competitive sweep and test alternative first-screen framings. If the STARTER tier draws
adopters who never graduate to the substrate, the funnel thesis fails — re-examine
whether governance is the product or the tax.

---
**Built on SIP** · audit agents: portfolio acf90ec · privacy ab0a463 · drift ac9da12 ·
competitive ab3c4f2 · validation a9f1de2 · 2026-06-10
