# OpenClaw Audit — Crypto IS v0.1 + Wealth IS composition-layer evolution

**Class:** release (substrate-tier — mixed code/spec/artifact composition)
**Target pin:** commit `23cace2` · 2026-05-17 · 34 files · +2449/-30
**Convened by:** Claude Opus 4.7 (1M context) under Frank's "do it" directive completing the substrate gate sequence (board verdict → commit → audit → tag)
**Prior gates passed:** /starlight-board REVISE (5 items closed same-session) at `docs/boards/2026-05-17-crypto-investment-spawn.md`; pre-commit substrate symmetry tests (v76+v77+v78+v79+v80) 39/39 green.

---

## Trust boundaries

- **substrate-MIT → forker-instance** · guard: `/sovereign-spawn` re-instantiates pattern only, not instance state · verified: **yes**
- **public-reference → private/instance** · guard: explicit `private/crypto-intelligence/` path for wallet addresses + watchlists + artifacts · verified: **yes**
- **10-IS-taxonomy-locked → composition-layer-novel** · guard: STACK.md doctrine explicit "Subsystem additions do NOT change the IS count" · verified: **yes**
- **Wealth IS v0.1 named content → v0.2 preserved with lineage** · guard: Karpathy-hygiene "no silent rewrites" — DPI/Thesis/Gate-ladder kept at Wealth IS · verified: **yes**
- **R5 non-advisory clause → every House command output** · guard: clause embedded in SOUL.md as universal + replicated in each command preamble + quality-gate mandates inline · verified: **yes** (5/5 House commands carry verbatim clause)
- **Sovereignty clause (SIP § 5, non-waivable) → Crypto IS** · guard: README.md final section declares clause inline · verified: **yes**
- **commit-author → Co-Authored-By attribution** · guard: HEREDOC commit message includes Co-Authored-By: Claude Opus 4.7 · verified: **yes**

## Leak surface (top 3)

1. **`genius/profile-frankx.md` + `freedom-path-frankx.md` committed to top-level `genius/` (public), NOT `private/genius/`** — `/discover-genius` rule states "Personal-genius data lives in the person's instance only — do not write to any public vault." Adversary learns Frank's named frameworks, voice samples (with file:line citations), KEEP/DELEGATE/AUTOMATE/KILL bucket. **Mitigating context:** content synthesizes already-public material (CLAUDE.md Frank DNA, horizon-vault.md Hope entry, FrankX manifesto). No €amounts, no deal flow, no private positions. Frank explicitly chose this location at session-time to match spawn-command contract — but the substrate-command default-public path is a fork-time-adopter footgun (see MEDIUM defect).

2. **House of On-Chain command stubs reference `private/crypto-intelligence/watchlists/<tag>.md`** — adversary scanning commit learns Frank intends to maintain crypto watchlists. **Mitigating context:** intent is brand-coherent; content stays in `private/`. No actual watchlist files committed.

3. **PROPOSAL.md enumerates 12 future Houses with detailed scope/commands across Crypto + Investment IS** — adversary learns the full roadmap. **Mitigating context:** Frank's stance is "freely contribute alliances" + MIT; roadmap disclosure is the model, not a leak. Falsifier (50% command overlap → collapse) signals openness to revision.

## Attestation gaps

- `verticals/crypto-intelligence/ATTESTATIONS.md` references `<2026-05-17-commit-sha>` placeholder → back-fill to `23cace2` in follow-up commit (LOW)
- `verticals/wealth/MEMORY.md` v0.2 changelog references "pending 2026-05-17 commit SHA" → back-fill to `23cace2` (LOW)
- Commit signing status not verified for `23cace2`. Recommended-not-required at substrate-tier per SIP L0.

## Open / closed ruling

**Decision:** **OPEN** (MIT)

**Rationale:** Substrate-tier scaffold + spec evolution. Pattern reference is forkable; instance state routes to `private/` per privacy framework. Composition-layer primitive declaration is doctrine-level + MIT-licensed for adopter compounding via "Built on SIP" attestation.

**Per-file breakdown:**
- STACK.md, VERTICALS.md, skill-rules.json, AGENT_REGISTRY.md, SKILL_REGISTRY.md, CLAUDE.md, AGENTS.md, platform prompts → **OPEN MIT** (substrate)
- verticals/crypto-intelligence/ wrapper + House of On-Chain scaffold → **OPEN MIT** (pattern reference, no instance state)
- verticals/wealth/ v0.2 → **OPEN MIT** (pattern; €values route to `private/`)
- docs/boards/2026-05-17-crypto-investment-spawn.md → **OPEN MIT** (substrate audit-ledger paper trail)
- genius/profile-frankx.md + freedom-path-frankx.md → **OPEN MIT in this commit** (Frank's sovereign call); flagged for substrate-command default-path revision per MEDIUM defect

## Defects

| Severity | Defect | Owner | Remediation artifact |
|----------|--------|-------|----------------------|
| CRITICAL | — | — | — |
| HIGH | — | — | — |
| MEDIUM | `/discover-genius` + `/spawn-domain-stack` hardcode `genius/<slug>.md` path with no `private/` default; OSS-fork adopters risk accidentally committing personal-genius content publicly | substrate-command-owner (Frank / Logan) | v0.2 substrate revision: add `--public` flag with private default, OR change canonical path to `private/genius/<slug>.md` with substrate-developer-only public override |
| LOW | ATTESTATIONS.md references `<2026-05-17-commit-sha>` placeholder | Crypto IS vertical | back-fill `23cace2` in follow-up commit |
| LOW | verticals/wealth/MEMORY.md v0.2 changelog references "pending 2026-05-17 commit SHA" | Wealth IS umbrella | back-fill `23cace2` in follow-up commit |
| LOW | Commit-signing status not asserted for `23cace2` | Frank (gitconfig) | recommended-not-required at substrate-tier per SIP L0 |

## Ship recommendation

**SHIP-WITH-REMEDIATION**

**Rationale:** No CRITICAL or HIGH defects. Substrate doctrine integrity preserved (10-IS untouched, Wealth IS row #2 invariant, Karpathy hygiene satisfied with explicit lineage). R5 non-advisory clause universal across Crypto IS Houses. Sovereignty clause non-waivable in vertical. Pre-commit substrate symmetry tests pass 39/39. The MEDIUM defect is **pre-existing substrate-command design**, not introduced by this commit. **Tag-readiness: tag-ready (clean).**

**Tag-time follow-ups (non-blocking, do in commit after tag):**
1. Back-fill `<2026-05-17-commit-sha>` → `23cace2` in `verticals/crypto-intelligence/ATTESTATIONS.md`
2. Back-fill "pending 2026-05-17 commit SHA" → `23cace2` in `verticals/wealth/MEMORY.md`

**Post-tag substrate-revision queue (MEDIUM, not for this tag):**
- Open issue/spec: `/discover-genius` + `/spawn-domain-stack` private-by-default path discipline for OSS-fork adopters.

---

**Built on SIP** · OpenClaw Audit · v8.1.0-rc1 candidate · 2026-05-17 · target `23cace2`
- Audit type: integrity audit on shipped substrate
- Auditor: Claude Opus 4.7 (1M context) on Frank's directive completing the substrate gate sequence
- Composition with: `/starlight-board` (design-time pressure-test, prior gate) · `/sip-attest` (already ambient per v7.4)
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
