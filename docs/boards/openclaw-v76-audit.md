# OpenClaw Audit — v7.6.0 People Intelligence rename ship

**Class:** release (multi-commit substrate-tier rename ship)
**Target pin:** HEAD = `a5053d7` (commit chain `4ee6c54` → `a060e04` → `e1ac834` → `358cb29` → `a1f2774` → `a5053d7`)

## Trust boundaries

- public substrate ↔ `private/` instance state · guard: `.gitignore` + naming convention · **verified: yes** (`private/` excluded from rename sweep per spec)
- Starlight reference vertical ↔ practitioner forks · guard: SIP § 5 sovereignty clause + reference lineage SHA chain in `MEMORY.md` · **verified: yes** (v0.1.1 SHA `5010a08` preserved as fork pin point in v0.1.2 changelog)
- Operating files ↔ frozen historical records (`docs/boards/`, `docs/ops/HANDOVER-*`) · guard: explicit do-not-touch list during sweep · **verified: yes** (`git log --since="2026-04-28" -- docs/boards/luminor-v75-ship.md` returns no commits; HANDOVER files untouched in commit chain)
- Test harness ↔ disk reality (declared-loads invariant 6) · guard: `test/substrate.test.ts` invariant + `test/v741.test.ts` paths · **verified: yes** (596/596 pass after every phase; sed-rewrite of 29 commands' skill-load paths in `a060e04` was the load-bearing fix)
- Voice-operator parallel session ↔ rename sweep on `agents/AGENT_REGISTRY.md` · guard: surgical Edit only on Domain Sub-Stack Tier section · **verified: yes** (Voice Operator entries preserved per Phase 5 agent's diff verification)
- Sister-vertical (`sound-intelligence/`) historical accuracy ↔ rename · guard: rephrase preserves "was HR Intelligence at v7.5.1 ship time" annotation · **verified: yes**

## Leak surface (top 3)

1. **Phase-chain SHAs incomplete in ATTESTATIONS.md v7.6.0 entry** — entry was written during Phase 5 with `(this commit)` placeholder for phase 5 and missing SHAs for phases 3, 4, 6. A forking practitioner reading the entry alone cannot verify the full phase chain without `git log`. Bites at: substrate's own reciprocity contract ("structural attribution" — source verticals model the lineage-SHA pattern). Recoverable cost.
2. **Local-IDE state staleness** — `.obsidian/workspace.json` (gitignored) and `.claude/settings.local.json` (gitignored) hold pre-rename paths. Bites at: a returning user's editor surface shows broken file-list entries until manual refresh. Zero public exposure (gitignored).
3. **Rename annotation decay surface** — "(renamed from HR Intelligence at v7.6.0)" annotations in `CLAUDE.md`, `AGENT_REGISTRY.md`, and ~10 other files are intentional historical-accuracy markers but age over time and may become noise by v8.0+. Bites at: long-horizon readability. Trade-off explicitly accepted by the rename methodology (preserve fork integrity over annotation hygiene).

## Attestation gaps

- ATTESTATIONS.md v7.6.0 entry → **REQUIRED:** fill phase-3/4/5/6 SHAs (`e1ac834`, `358cb29`, `a1f2774`, `a5053d7`) at Phase 8 commit time. Replace `(this commit)` placeholder.
- `package.json` version → **REQUIRED:** bump `7.5.3` → `7.6.0` at Phase 8.
- Annotated tag `v7.6.0` → **REQUIRED:** create at Phase 8 close-of-rename SHA.
- Boundary note in SUB-SYSTEMS.md → **PRESENT** (added in Phase 6, commit `a5053d7`).
- Friend-starter knowledge pack rename + cross-refs → **PRESENT** (Phase 5 commit `a1f2774`, 6 files renamed via git mv, `export-pathways.md` cross-refs updated).
- Voice-operator parallel session preservation → **PRESENT** (Phase 5 agent confirmed surgical edit; diff verified before commit).

## Open / closed ruling

**Decision:** OPEN
**Rationale:** All renamed surface (vertical wrapper, skills, agents, commands, cross-refs, friend-starter knowledge pack, ATTESTATIONS entry, boundary note) is substrate-aligned reference under MIT per `verticals/people-intelligence/README.md` license declaration; sovereignty clause non-waivable per SIP § 5; practitioner-specific content remains practitioner IP under each fork's own `CANON.md`.
**Gate mechanism:** N/A.

## Defects

| Severity | Defect | Owner | Remediation artifact |
|----------|--------|-------|----------------------|
| CRITICAL | — | — | — |
| HIGH | — | — | — |
| MEDIUM | — | — | — |
| LOW-1 | ATTESTATIONS.md v7.6.0 entry has placeholder `(this commit)` for phase 5 + missing SHAs for phases 3/4/6 | Frank | Phase 8 release commit fills SHAs `e1ac834` / `358cb29` / `a1f2774` / `a5053d7` |
| LOW-2 | `package.json` version still `7.5.3`; release marker not bumped | Frank | Phase 8 chore commit: `7.5.3` → `7.6.0` |
| LOW-3 | Tag `v7.6.0` not yet annotated | Frank | Phase 8: `git tag -a v7.6.0 -m "..."` after release commit |

## Ship recommendation

**SHIP-WITH-REMEDIATION** — proceed with Phase 8 (release commit + tag) to close the 3 LOW defects in a single chore + tag operation. No CRITICAL, HIGH, or MEDIUM defects identified. Tests 596/596 pass at HEAD. Trust boundaries verified clean. Voice-operator parallel session preserved. Historical record preserved per do-not-touch list. Boundary note delineation per board verdict landed.

The rename ship is structurally sound. Phase 8 is the standard release-mechanics close, not a remediation of substantive defects.

---

## Audit metadata

- **Auditor:** OpenClaw (Logan, Layer 4 sovereign command)
- **Auditor instance:** Claude Opus 4.7 acting as substrate node, audit scope substrate-tier
- **Date:** 2026-04-28
- **Substrate at audit:** starlight-intelligence-system @ HEAD `a5053d7`, package.json `7.5.3` (pre-bump)
- **Test status at audit:** 596/596 pass
- **Process:** /openclaw-audit (Layer 4 sovereign command per SIP)
- **Predecessor audits:** `docs/boards/openclaw-v75-audit.md` (v7.5.0 ship audit, 2 CRITICAL + 6 HIGH + 5 MEDIUM + 4 LOW); `docs/boards/declared-loads-audit.md` (v7.5.1 invariant 6 verification audit)
- **Successor work:** Phase 8 release commit (LOW-1, LOW-2, LOW-3 remediation) + tag annotation + push

---
**Built on SIP** · OpenClaw Audit · 2026-04-28
