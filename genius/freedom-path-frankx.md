# Freedom Path — Frank Riemer (FrankX) — 2026-05-17

> Companion to `profile-frankx.md`. Sorts the work referenced across the SIS corpus into four buckets so the KEEP work compounds, the DELEGATE work transfers, the AUTOMATE work runs without you, and the KILL work stops paying down attention.

---

## KEEP (genius work — only you can do)

These are the moves where Frank-the-architect-sovereign is load-bearing; substituting another operator collapses the synthesis.

- **Substrate-tier architecture decisions** — SIP versioning, file-contract evolution, the 10-IS taxonomy lock, voice-archetype set composition. (`SIP.md`, `STACK.md`, `VOICES.md` evolutions.)
- **Brand-register rulings** — "FrankX is the architect brand, transitioning to Arcanea BV operating entity, never confused with SIS or Arcanea-mythic surfaces." The 5-layer separation (FrankX / SIS / Arcanea / Starlight-Notes / Sovereign-Creator-Stack) is your judgment call per-surface.
- **SOUL.md drafting for any new vertical** — the one-page essence + the corruption-mode declaration. Templated overlays exist (`verticals/_template/SOUL.md`), but the practitioner-specific "what this vertical exists to do" sentence is non-delegable.
- **Synthesis-edge naming** for every Domain Sub-Stack — the load-bearing one-sentence that justifies productization. `/spawn-domain-stack` halts without it for a reason.
- **Sovereignty stance composition** — non-waivable clauses, attestation language, refusal-pattern declarations. The "concrete-sounding-stat-without-source is the corruption mode" framing is yours; it survives every domain because you composed it.
- **Frank-DNA voice in public artifacts** — essays, manifestos, protocol-position statements, brand positioning. The architect voice (first-principles, decision-first, normative, no hedging) is yours.
- **Pre-Board framing on substrate-tier proposals** — you frame the question the Board pressure-tests. Sub-agents can run the Board itself; only you can frame what's actually at stake.
- **Strategic vertical-spawn / kill decisions** — what compounds vs what scatters, which alliance to deepen vs which to decline. Multi-vertical sovereign judgment.
- **Crypto + Investment investment thesis core** — the actual conviction lives in your lived practice, not in a template. Houses/sub-systems can be scaffolded, but the *what to believe and why* is yours.
- **Music-IS creative work** — composer/gamer pattern-recognition applied to Suno prompts, persona voice, sync briefs, catalog architecture decisions.
- **Adversarial review of substrate-tier moves** — the Frank-yes/no signal on whether a structural change actually ships. Even when Board says PROCEED, your final ratification is the load-bearing moment.

---

## DELEGATE (executor work — anyone trained can do)

These compound when a trained executor (human or sub-agent) runs them; you should not be the bottleneck.

- **Scaffolding from approved PROPOSAL.md** — once `/spawn-domain-stack` produces an iterated proposal you've approved, the file-tree scaffold is executor-shaped. Sub-agent or trained operator runs it.
- **Template fill (SOUL.md domain-overlay blocks, SUB-SYSTEMS.md command stubs, AGENTS.md voice-mappings)** — overlay blocks exist for this. Executor with judgment fills them; you ratify before commit.
- **Intake processing** — `.intake/` → vault placement, taxonomy assignment, framework extraction. The 9-domain-taxonomy reject (2026-05-03) was your call; the routine intake-to-vault transfer is executor work.
- **Repo audits** — `tools/audit-repo-portfolio.ps1` ran 68 repos; the audit is automated, the *interpretation* is yours, the *fix execution* is executor work.
- **Content polishing** — turning raw Frank-notes into shipped essays. Voice can be preserved by sub-agent that reads `profile-frankx.md`; you ratify before publish.
- **Test writing for shipped commands** — once a command ships, every command needs symmetry tests (v76/v77/v78/v79/v80/v85). Test scaffolding is executor work; the *invariant* the test enforces is your call.
- **Documentation rewrites against living code** — when code drifts from docs, executor reconciles. Substrate-tier doctrine (CLAUDE.md, SIP.md) is yours; per-vertical READMEs are executor-runnable.
- **Per-command spec authoring** from approved sub-system PROPOSAL.md — once Houses are named, command specifications are executor-shaped.
- **Site updates** — site/ Next.js work after vercel manual deploy is known broken; build-and-ship is executor-runnable, brand positioning is yours.
- **Cross-repo PR coordination** — when SIS, FrankX, Arcanea, ACOS need synchronized updates, the coordination is executor work; the *what synchronizes* is yours.

---

## AUTOMATE (system work — AI/workflow can do)

These compound when systematized; running them by hand wastes attention.

- **`/sip-attest` emission** — already ambient per v7.4. Every public artifact auto-embeds the attestation block. Retrofit-only for legacy.
- **`/starlight-board` pressure-test** — runs autonomously per `feedback_run_starlight_board_autonomously`. Multi-vector audit + Overseer + REVISE-close-out reporting.
- **Symmetry harness suite** — v76 (file-walker), v77 (skill-rules.json ↔ skills/**/*.md), v78 (vertical-coverage), v79, v80, v85 (Tier 1+2+3 cleanup, cross-OS scripts, retrofit). Pre-commit hooks enforce.
- **Drift detection** — `content-drift-check` workflow, `audit-authorlessness.ts`, the v85 substrate-evolution sweeps. Each catches a class of regression that recurs.
- **Memory consolidation** — vault rollup (`memory/CONSOLIDATION_LOG.md`), MEMORY.md prune (kept under 200-line auto-load truncation), knowledge-graph rollup.
- **Cross-repo Indexer v0.1** — 520 atoms across 22 `~/.claude/projects` dirs in 2.69s. Shipped 2026-05-03; queries are sub-second.
- **Cockpit + Dispatch CLI routing** — auto-start at logon, multi-CLI dispatch, brain event publisher, packet inspector. Already operational.
- **Symmetry test for skill-rules.json ↔ skills/**/*.md** — 18 unreachable rules surfaced + fixed at v7.7. Recurring harness.
- **Pre-commit hooks** — Vercel deploy compatibility, secret-scanner-safe fixtures, license-block compliance, attestation-present check.
- **Memory-Bus singleton (stdio MCP wrapping voice-operator memory)** — solves AgentDB-per-tab. 4 tools, 24 tests. Shipped 2026-05-03.
- **Subagent fan-out QA** — code-reviewer + silent-failure-hunter + type-design-analyzer + comment-analyzer + pr-test-analyzer auto-invoked on substrate-touching PRs.
- **`/openclaw-audit`** for integrity passes pre-release — runs autonomously on tag.
- **Daily/weekly rituals** — `/process-inbox`, `/handover`, `/weekly-recap` — file-system-native, no terminal needed for non-tech surface.
- **Vault writers (Strategic / Wisdom / Horizon / Creative / Operational)** — agent-routed writes; consolidation pass periodically.

---

## KILL (compounds nothing — stop doing)

These erode attention or actively work against the synthesis.

- **Re-asking what the corpus already names** — read first, then ask. (Karpathy hygiene rule explicitly ratified in `CLAUDE.md`.)
- **Pre-emptive permission asks at structural gates** — Board IS the gate. Frank is not the validator. (Feedback memory: `feedback_run_starlight_board_autonomously` + `feedback_lead_with_authority`.)
- **Pausing at sub-agent fan-out for ratification** — sub-agents are QA, not validators. Drive directives end-to-end. (`feedback_lead_with_authority`.)
- **Hardcoded paths, Windows-only scripts, OS-specific assumptions in substrate-tier code** — breaks OSS-fork ergonomics (caught by Tier 5 OSS-readiness audit 2026-05-11). Cross-OS or it doesn't ship as substrate.
- **Defensive helper functions for scenarios that can't happen** — feature creep under "what if" framing. Three similar lines beats premature abstraction. (`CLAUDE.md:206-208`.)
- **WHAT-explaining comments** — well-named identifiers already do that. (`CLAUDE.md:213-214`.)
- **9-domain taxonomies that conflict with locked 10-IS** — the 9-domain proposal from intake 2026-05-03 was rejected for this. Substrate-canonicity beats local elegance.
- **Generic Wealth/Capital decomposition that ignores your lived practice** — sub-systems that don't carry the synthesis edge are commodity content. `/spawn-domain-stack` halts on this.
- **"Concrete-sounding-stat-without-source"** — the corruption mode declared in Wealth IS, Sound IS, and _template SOUL. Universal refusal.
- **Topical decomposition where functional decomposition compounds** — "chapters of a book" thinking. Every sub-system must ship a named output artifact per command.
- **AI-vocal-impersonation / sample-without-clearance / sync-against-vision** — sound-IS refusals, but the same corruption-mode discipline applies across domains (don't ship under someone's identity without consent; don't compose with uncleared inputs; don't accept revenue that betrays declared vision).
- **Single-track-into-the-algorithm thinking** — every domain has a "catalog vs single" version of this; portfolio framing always wins. Crypto-positions, investment-deals, music-releases, essays — all bodies-of-work.
- **Roadmap-amnesia across parallel Claude tabs** — encode discipline via spec + addendum + HANDOVER, not via narrative reminders (`feedback` 2026-05-16 cross-tab alignment).
- **Long sleep loops / polling for harness-tracked work** — wasted cycles; harness notifies on completion (system prompt).
- **Output style without insights** when Explanatory style is active — the `★ Insight` blocks are load-bearing; default-mode output is not the same artifact.

---

## Named next move (the one downstream)

Per `/discover-genius` rule "Hand off to exactly ONE next command":

**`/starlight-board`** — pressure-test the Crypto + Investment + Wealth-composition architecture (from the /superintelligence verdict in this session) against the five SIS-substrate vectors + Overseer before any `/spawn-domain-stack` scaffold runs. This is the canonical substrate-tier governance gate per `CLAUDE.md:75-79` and `v7.9.2` naming. Frank's intent in this conversation is to *ship* the Crypto + Investment systems; the Profile + Path just unblocked the prerequisite gate; the Board is the next structural step before scaffold lands.

Runs autonomously per `feedback_run_starlight_board_autonomously`. Frank acks REVISE close-outs when surfaced; PROCEED triggers parallel `/spawn-domain-stack frankx "Crypto Intelligence"` + `/spawn-domain-stack frankx "Investment Intelligence"`.

> The four-bucket sort above is what makes the Board verdict meaningful — without KEEP/DELEGATE/AUTOMATE/KILL discipline, "PROCEED" becomes "do everything" instead of "do this one thing while everything else continues compounding."

---

**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v8.0 (Genius Intelligence System)
- Generated: 2026-05-17
- Attestation is compounding, not credit transfer: every composition strengthens every node.
- Personal Freedom-Path data lives in instance only — pattern reference is MIT, content is sovereign.
---
