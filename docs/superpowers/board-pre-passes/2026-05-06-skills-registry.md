# Board pre-pass — `skills/REGISTRY.md` canonical-source registry (Tier 3a)

> **Source:** Sprint 2026-W19 Tier 3a. Cited in CLAUDE.md substrate file-contract list (`REGISTRY.md`).
> **Tier:** Substrate (governs how skills are owned, versioned, and consumed across the SIS ecosystem)
> **Status:** AWAITING `/starlight-board` ratification
> **Date:** 2026-05-06

---

## Proposal

Establish `skills/REGISTRY.md` as the canonical-source registry for every SIS-managed skill. The registry adds four metadata columns that `skill-rules.json` does not currently track:

- **owner-repo** — the canonical repo where the skill lives (default: SIS substrate)
- **version** — semver, starting at 1.0.0 for currently-shipping skills
- **status** — `stable | experimental | deprecated`
- **consumers** — list of repos that pull this skill (manifest target list for future Tier 3b)

Every skill rule in `skill-rules.json` MUST appear in `REGISTRY.md`. Every skill file under `skills/**/*.md` (excluding `references/` and `SKILL_ARCHITECTURE.md`) MUST appear in `REGISTRY.md`. Symmetry enforced by a v78 substrate test (`test/v78-skill-registry.test.ts`).

## Why this is substrate

`REGISTRY.md` is named in `CLAUDE.md`'s substrate-tier governance gate: *"Substrate-level changes invoke `/starlight-board` BEFORE commit/tag... for any change touching `SIP.md` / `SIS.md` / `ALLIANCE.md` / `STACK.md` / `VERTICALS.md` / `VOICES.md` / `REGISTRY.md`"*. Creating `REGISTRY.md` is itself a structural addition to the substrate file-contract — it introduces a new governance artifact that downstream verticals will be expected to consume.

It also unblocks Tier 3b (manifest-based skill consumption): without a canonical registry, sibling repos can't pull skills via manifest because there's no source-of-truth listing what to pull.

## Why this needs `/starlight-board`

1. **File-contract addition.** Adding a top-level substrate file (alongside SIP.md, SIS.md, etc.) is the same shape of structural change as adding a vertical.
2. **Cross-repo coupling.** Once `REGISTRY.md` is canonical, every consuming repo (Arcanea, FrankX, ACOS) must pin against it. The pinning pattern is irreversible at scale.
3. **Versioning discipline introduction.** Skills go from "exists / does not exist" to "exists at version X". Future skill changes must respect semver. That's a discipline the board should pressure-test before we lock it in.
4. **Symmetry test obligation.** Adds a v78 substrate test. The pre-commit hook now enforces three contracts (v76 agents + v77 skill-rules + v78 registry).

## Coupling to existing substrate

- **`skill-rules.json`** — registry-vs-rules symmetry: every `rule.skill` must reference a `REGISTRY.md` entry. v78 test enforces.
- **`agents/AGENT_REGISTRY.md`** — precedent for substrate-level registries. Same shape; agents have a registry, skills get one.
- **v77 test** (`test/v77-skill-rules.test.ts`) — registry consumes the same `walkSkills` + `fileToSkillKey` helpers from `test/_lib/repo.ts`. No duplicate logic.
- **Cross-Repo Indexer** — registry surfaces in indexer's atom list. Sibling repos that query "what's the canonical X skill" get the registry as the answer.

## What ships if PROCEED

1. **`skills/REGISTRY.md`** — single canonical-source MD doc with:
   - Governance contract (rules of the registry: how to add, version, deprecate)
   - Schema definition (field semantics + status lifecycle)
   - Per-domain tables (intelligence/, orchestration/, memory/, integration/, intake/, vision-brand/, business/, second-brain/, relational/, music-is/, sound-intelligence/, energy-intelligence/, hr-intelligence/people-intelligence/)
   - Every skill listed with all 7 fields (name, owner-repo, version, domain, activation-rule-id, status, consumers)

2. **`test/v78-skill-registry.test.ts`** — symmetry harness:
   - Every rule's `skill` field appears in REGISTRY.md (no orphan rules)
   - Every REGISTRY.md row has an existing skill file (no orphan registry entries)
   - Every skill file is registered (covered by v77, but reasserted with registry context)
   - Every REGISTRY.md row has a non-empty `version` field

3. **Pre-commit hook scope expansion** — `tools/git-hooks/pre-commit` adds REGISTRY.md to the list of files that trigger v78 test run.

4. **CLAUDE.md substrate file-contract reference** — already names `REGISTRY.md`; no change needed there. The file simply now exists at the named path.

## What does NOT ship in this PR

- **Tier 3b manifest-based consumption** — separate ship. Registry is the source-of-truth; manifest is the consumption protocol. Splitting these is per the Memory Bus → Cross-Repo Indexer precedent (substrate ships first, consumer ships next).
- **Generated-from-registry `skill-rules.json`** — the existing `skill-rules.json` stays hand-maintained; the v78 test enforces consistency. Migrating to "registry generates rules" is v2.
- **Deprecation tooling** — when a skill goes to `status: deprecated`, what happens to consumers? Out-of-scope for v1; documented as v2.

## Pre-pass questions for the board

1. **Sovereign vector** — Is "REGISTRY.md" at `skills/REGISTRY.md` the right name + location, given that CLAUDE.md already lists `REGISTRY.md` as a top-level substrate file (alongside SIP.md, SIS.md)? Should it be at repo root (`/REGISTRY.md`) instead, with skills as one section?

2. **Seer vector** — In 18 months, every consumer repo pins against the registry. What happens when a skill needs to fork (Arcanea wants its own divergent variant of an SIS-canonical skill)? Does the registry's `owner-repo` pattern handle multi-owner cleanly, or does it force a sovereign-spawn?

3. **Harmonizer vector** — `agents/AGENT_REGISTRY.md` already exists as the agents-side analog. Does the skills registry need to mirror its shape exactly, or are skills different enough (cross-repo composition, manifest-future) that a different schema serves better?

4. **Strategist vector** — What's the leverage of shipping the registry NOW vs deferring to W20? The unblock target is Tier 3b (manifest), which itself is queued. Is there a closer use case (Cross-Repo Indexer adoption, Arcanea sync) that benefits this week?

5. **Verifier vector** — Cheapest test that proves this works: would the v78 test pass on day 1 with no false positives across the existing 60+ skills? Risk: if registry-vs-skill-rules has hidden drift, the test fires on commit and blocks unrelated work.

## Risks identified pre-board

- **Bikeshedding on schema** — every column is a fork (do we really need `consumers`? Is `version` semver or `2026-05-06` date-stamp?). Mitigation: ship v1 with documented "v2 will revisit" lines.
- **Registry-as-source-of-truth ≠ skill-rules.json today** — for the first commit, registry must match `skill-rules.json` exactly. Any drift (even pre-existing) blocks the test. Mitigation: registry written FROM `skill-rules.json` programmatically, then hand-edited for owner-repo/version/status/consumers.
- **Symmetry test creates a 3rd pre-commit gate** — pre-commit now runs v76 + v77 + v78. Test runtime grows. Mitigation: tests are fast (<1s each); cumulative still <3s.

## Falsifier (registry-pattern revisited)

If after 90 days the registry adds zero new fields, has not been used to gate a manifest pull, and has only been touched by churn-style auto-PRs — registry was bureaucracy, not infrastructure. Either Tier 3b ships (validating the unblock) or registry deprecates as v2 ledger only.

## What stays in `private/`

Nothing. This is pure-public substrate.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, skill-activation, attestation]
- Generated: 2026-05-06
- Related precedent: `agents/AGENT_REGISTRY.md`, Memory Bus singleton + Cross-Repo Indexer consumer split
