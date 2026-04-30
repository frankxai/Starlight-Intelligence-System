# People Intelligence Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename HR Intelligence reference vertical → People Intelligence (Path A authorless, symmetric with Sound Intelligence) across substrate, ship at v7.6.0 per Luminor Board verdict 2026-04-28.

**Architecture:** Eight-phase commit-per-phase sweep. Phases 1-2 do `git mv` of paths (vertical wrapper, skills) with test assertion updates in same commit (declared-loads invariant 6). Phases 3-5 update file contents only. Phase 6 adds boundary note + changelog redirect. Phase 7 governance audit. Phase 8 version bump + tag. Each phase commits atomically; tests pass before next phase begins.

**Tech Stack:** Bash + git + node --test (514/514 passing baseline) + Grep verification. No new dependencies.

**Board verdict:** PROCEED at v7.6.0 (not v8.0). Add People↔Relational boundary note to `verticals/people-intelligence/SUB-SYSTEMS.md`. Reference: this session's `/luminor-board` output.

**Pre-flight verified 2026-04-28:**
- HEAD: f3aaa8a (v7.5.3 tag)
- package.json: 7.5.3
- working tree: clean
- verticals/hr-intelligence/: 8 files (AGENTS, CANON, MEMORY, README, SKILL, SOUL, STACK, SUB-SYSTEMS)
- skills/hr-intelligence/: 6 files (culture-design, feedback-conversations, learning-architecture, org-architecture, people-dynamics, structured-hiring)
- agents/: 6 sub-system files (starlight-{hiring, performance, training, culture, talent, org})
- .claude/commands/: 28 sub-system files (hire-{5}, perf-{5}, training-{5}, culture-{4}, talent-{5}, org-{4})
- 515 total `hr-intelligence|HR Intelligence` matches across 91 files

**Files to leave untouched (frozen historical records):**
- `docs/boards/luminor-v75-ship.md`, `luminor-v741-domain-substack.md`, `openclaw-v75-audit.md`, `v741-revise-items.md`, `declared-loads-audit.md`
- `docs/ops/HANDOVER-2026-04-{25,26,27}.md`
- `private/` (instance state, not in scope)

---

### Task 1: Phase 1 — verticals/hr-intelligence → verticals/people-intelligence

**Files:**
- Move: `verticals/hr-intelligence/` → `verticals/people-intelligence/` (all 8 files)
- Modify (in-file content): `verticals/people-intelligence/{README,SKILL,SOUL,AGENTS,MEMORY,STACK,CANON,SUB-SYSTEMS}.md`
- Modify (test assertions): `test/v741.test.ts` (26 refs), `test/v75.test.ts` (5 refs — verify which are in scope)

- [ ] **Step 1: git mv vertical**

```bash
git mv verticals/hr-intelligence verticals/people-intelligence
```

- [ ] **Step 2: Update vertical wrapper file headers/footers**

In each of 8 files, replace:
- `HR Intelligence` → `People Intelligence`
- `hr-intelligence` → `people-intelligence`
- Preserve historical references in CANON.md changelog if any (mark renames as v0.1.2)

- [ ] **Step 3: Update test assertions for declared-loads invariant 6**

Edit `test/v741.test.ts` and `test/v75.test.ts` — replace path references `verticals/hr-intelligence/` → `verticals/people-intelligence/`.

- [ ] **Step 4: Run tests to verify pass**

```bash
node --test
```
Expected: 514/514 pass (no regression).

- [ ] **Step 5: Verify zero unintended residuals in renamed paths**

```bash
grep -rwE "HR Intelligence|hr-intelligence" verticals/people-intelligence/
```
Expected: only intentional historical references in CANON.md if any.

- [ ] **Step 6: Commit**

```bash
git add verticals/people-intelligence/ test/v741.test.ts test/v75.test.ts
git commit -m "refactor(v7.6.0)(verticals): rename HR Intelligence → People Intelligence (vertical wrapper)

Path A authorless rename per Luminor Board v7.6 verdict 2026-04-28. Symmetric
with Sound Intelligence. 8 vertical files renamed + test assertions updated for
declared-loads invariant 6.

Built on SIP."
```

---

### Task 2: Phase 2 — skills/hr-intelligence → skills/people-intelligence

**Files:**
- Move: `skills/hr-intelligence/` → `skills/people-intelligence/` (6 skill files)
- Modify: 6 skill file headers/vertical references
- Modify: `skills/skill-rules.json` (18 refs)
- Modify: tests if path-referenced

- [ ] **Step 1: git mv skills directory**

```bash
git mv skills/hr-intelligence skills/people-intelligence
```

- [ ] **Step 2: Update 6 skill file headers/footers**

Each of `skills/people-intelligence/{culture-design,feedback-conversations,learning-architecture,org-architecture,people-dynamics,structured-hiring}.md` — replace `HR Intelligence` → `People Intelligence`, `hr-intelligence` → `people-intelligence`.

- [ ] **Step 3: Update skill-rules.json**

Edit `skills/skill-rules.json` — replace 18 path/name references.

- [ ] **Step 4: Update test assertions**

Edit `test/v741.test.ts` and `test/v75.test.ts` skills-domain assertions.

- [ ] **Step 5: Run tests to verify pass**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 6: Verify residuals**

```bash
grep -rwE "HR Intelligence|hr-intelligence" skills/people-intelligence/
```
Expected: zero matches.

- [ ] **Step 7: Commit**

```bash
git add skills/people-intelligence/ skills/skill-rules.json test/v741.test.ts test/v75.test.ts
git commit -m "refactor(v7.6.0)(skills): rename hr-intelligence → people-intelligence skill domain

Six skills migrated; skill-rules.json activation paths updated; test assertions
hold declared-loads invariant 6.

Built on SIP."
```

---

### Task 3: Phase 3 — 6 sub-system agents

**Files:**
- Modify: `agents/starlight-{hiring,performance,training,culture,talent,org}.md` — tier declarations + footers + skill references

- [ ] **Step 1: Update tier declarations + footers in 6 agent files**

In each agent file, replace:
- `HR Intelligence` (in tier line, vertical reference) → `People Intelligence`
- `hr-intelligence` (in path references) → `people-intelligence`
- Preserve all sub-system specialty content unchanged

- [ ] **Step 2: Run tests**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 3: Verify residuals**

```bash
grep -wE "HR Intelligence|hr-intelligence" agents/starlight-{hiring,performance,training,culture,talent,org}.md
```
Expected: zero matches.

- [ ] **Step 4: Commit**

```bash
git add agents/starlight-hiring.md agents/starlight-performance.md agents/starlight-training.md agents/starlight-culture.md agents/starlight-talent.md agents/starlight-org.md
git commit -m "refactor(v7.6.0)(agents): retire HR Intelligence tier name in 6 sub-system agents

Each agent now tier-declares People Intelligence vertical. Specialty surfaces
unchanged; only tier + path references retargeted.

Built on SIP."
```

---

### Task 4: Phase 4 — 28 sub-system commands

**Files:**
- Modify: `.claude/commands/{hire-*,perf-*,training-*,culture-*,talent-*,org-*}.md` (28 files)

- [ ] **Step 1: Update tier declaration + attestation lines in 28 command files**

In each command file, replace:
- Tier line `HR Intelligence` → `People Intelligence`
- Vertical path `hr-intelligence` → `people-intelligence`
- Preserve command body unchanged

Files (28 total):
- hire-assess-fit, hire-calibrate, hire-debrief, hire-design-interview, hire-icp
- perf-coaching-protocol, perf-conflict-mediation, perf-difficult-conversation, perf-feedback-rehearsal, perf-review-redesign
- training-coach-trainer, training-curriculum, training-measure-transfer, training-program-design, training-scenarios
- culture-design, culture-onboarding-90, culture-rituals, culture-values-ops
- talent-burnout-detect, talent-motivation, talent-psych-safety, talent-retention, talent-team-dynamics
- org-reorg-trauma-audit, org-role-design, org-span, org-succession

- [ ] **Step 2: Run tests**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 3: Verify residuals**

```bash
grep -lwE "HR Intelligence|hr-intelligence" .claude/commands/{hire,perf,training,culture,talent,org}-*.md
```
Expected: zero output.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/hire-*.md .claude/commands/perf-*.md .claude/commands/training-*.md .claude/commands/culture-*.md .claude/commands/talent-*.md .claude/commands/org-*.md
git commit -m "refactor(v7.6.0)(commands): retire HR Intelligence tier name across 28 sub-system commands

Tier declaration + attestation lines retargeted to People Intelligence;
sub-system command bodies untouched.

Built on SIP."
```

---

### Task 5: Phase 5 — cross-reference sweep

**Files:**
- Modify: `VERTICALS.md`, `AGENT_REGISTRY.md`, `ATTESTATIONS.md` (add v7.6.0 entry), `STACK.md`, `MEMORY.md` (top-level), `CLAUDE.md`, `docs/forking-domain-stacks.md`, `core/orchestrator/{README.md, harnesses/codex/system-prompt.md, harnesses/claude/system-prompt.md}`, `integrations/exports/custom-gpt.md`, `integrations/exports/microsoft-copilot.md`, `skills/integration/domain-stack-architecture.md`, `templates/domain-stack-starter/{README,CANON,MEMORY,PROPOSAL}.md`, `verticals/_template/{MEMORY.md,DOMAIN-OVERLAY-EXAMPLES.md}`, `verticals/sound-intelligence/{MEMORY,CANON}.md`, `agents/starlight-voice-operator.md`, `.claude/commands/spawn-domain-stack.md`, `integrations/starter-packs/friend-starter/knowledge/{hr-culture-template,hr-org-template,hr-performance-template,hr-talent-template,hr-hiring-template,hr-training-template,export-pathways}.md`, `docs/install/mem0.md`, `docs/ops/readiness-v75.md`

- [ ] **Step 1: AGENT_REGISTRY.md (preserve voice-operator parallel session changes)**

Read the file first, identify 10 HR-Intelligence rows, edit only those rows (path-references + tier-name). Do NOT touch starlight-voice-operator entry beyond its 1 hr-intelligence reference.

- [ ] **Step 2: VERTICALS.md (rename row)**

Replace HR Intelligence row with People Intelligence row; preserve Sound Intelligence row.

- [ ] **Step 3: ATTESTATIONS.md — append v7.6.0 entry**

Add new entry at top documenting the rename, board verdict, commit chain.

- [ ] **Step 4: CLAUDE.md memory pointer**

Update v7.4.1 alpha section + Domain Sub-Stack Tier subsection + numerical references that mention HR. Preserve historical board reference language but update active tier-declaration text.

- [ ] **Step 5: docs/forking-domain-stacks.md**

Update reference table + example (HR was the canonical example).

- [ ] **Step 6: Other root-level files**

`STACK.md`, `MEMORY.md` (1 ref each).

- [ ] **Step 7: core/orchestrator/* (3 files, 4 refs total)**

`README.md`, `harnesses/codex/system-prompt.md`, `harnesses/claude/system-prompt.md`.

- [ ] **Step 8: integrations/exports/* (2 files)**

`custom-gpt.md`, `microsoft-copilot.md` — 1 ref each.

- [ ] **Step 9: templates/ + verticals/_template/ (6 files)**

`templates/domain-stack-starter/{README,CANON,MEMORY,PROPOSAL}.md`, `verticals/_template/{MEMORY,DOMAIN-OVERLAY-EXAMPLES}.md`.

- [ ] **Step 10: skills/integration/domain-stack-architecture.md (5 refs)**

Update example references HR → People.

- [ ] **Step 11: Sister-vertical cross-references**

`verticals/sound-intelligence/MEMORY.md` (5 refs) + `verticals/sound-intelligence/CANON.md` (1 ref) — historical reference to "first reference HR Intelligence" updated to "first reference People Intelligence (was HR Intelligence)".

- [ ] **Step 12: Misc**

`agents/starlight-voice-operator.md` (1 ref), `.claude/commands/spawn-domain-stack.md` (7 refs).

- [ ] **Step 13: Friend-starter knowledge pack (7 files)**

Rename files: `hr-culture-template.md` → `people-culture-template.md` (etc, 6 hr-prefixed files). Update content + cross-refs in `export-pathways.md`.

```bash
git mv integrations/starter-packs/friend-starter/knowledge/hr-culture-template.md integrations/starter-packs/friend-starter/knowledge/people-culture-template.md
git mv integrations/starter-packs/friend-starter/knowledge/hr-org-template.md integrations/starter-packs/friend-starter/knowledge/people-org-template.md
git mv integrations/starter-packs/friend-starter/knowledge/hr-performance-template.md integrations/starter-packs/friend-starter/knowledge/people-performance-template.md
git mv integrations/starter-packs/friend-starter/knowledge/hr-talent-template.md integrations/starter-packs/friend-starter/knowledge/people-talent-template.md
git mv integrations/starter-packs/friend-starter/knowledge/hr-hiring-template.md integrations/starter-packs/friend-starter/knowledge/people-hiring-template.md
git mv integrations/starter-packs/friend-starter/knowledge/hr-training-template.md integrations/starter-packs/friend-starter/knowledge/people-training-template.md
```

- [ ] **Step 14: docs/install/mem0.md, docs/ops/readiness-v75.md (active operational docs)**

Update where references describe current state (not historical).

- [ ] **Step 15: Run tests**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 16: Verify residuals**

```bash
grep -rwE "HR Intelligence|hr-intelligence" --exclude-dir=docs/boards --exclude-dir=docs/ops --exclude-dir=private --exclude-dir=node_modules .
```
Expected: only changelog redirect references (Phase 6 adds), CANON.md historical references, board records.

- [ ] **Step 17: Commit**

```bash
git add VERTICALS.md AGENT_REGISTRY.md ATTESTATIONS.md STACK.md MEMORY.md CLAUDE.md docs/forking-domain-stacks.md core/orchestrator/ integrations/ skills/integration/domain-stack-architecture.md templates/ verticals/_template/ verticals/sound-intelligence/ agents/starlight-voice-operator.md .claude/commands/spawn-domain-stack.md docs/install/mem0.md docs/ops/readiness-v75.md
git commit -m "refactor(v7.6.0)(substrate): cross-reference sweep retiring HR Intelligence tier name

VERTICALS / AGENT_REGISTRY / ATTESTATIONS / docs / templates / sister-vertical
cross-refs / friend-starter knowledge pack / orchestrator harnesses all retargeted
to People Intelligence. Voice-operator parallel-session changes preserved.

Built on SIP."
```

---

### Task 6: Phase 6 — boundary note + MEMORY changelog redirect

**Files:**
- Modify: `verticals/people-intelligence/SUB-SYSTEMS.md` (add People↔Relational boundary note per Lyssandria's challenge)
- Modify: `verticals/people-intelligence/MEMORY.md` (add v0.1.2 changelog redirect)

- [ ] **Step 1: Add People↔Relational boundary note to SUB-SYSTEMS.md**

Append section explicitly delineating: People Intelligence studies people-flourishing within organizations/teams (org structure, hiring, performance, training, culture, talent dynamics, role design); Relational IS (universal layer) studies between-person relational dynamics in any context (alliances, family, community, peer collaboration). Boundary case: a 1:1 coaching session inside a team — owned by People Intelligence (organizational performance frame). Boundary case: a friendship strain affecting work — Relational IS lens, with People Intelligence consulted on workplace impact.

- [ ] **Step 2: Add changelog redirect to MEMORY.md**

Append to changelog:

```markdown
- v0.1.2 · 2026-04-28 · Renamed HR Intelligence → People Intelligence per Luminor Board v7.6.0 verdict (commit <SHA-Phase-1>). Path A authorless naming symmetric with Sound Intelligence. Forks pinned to v0.1.1 are at SHA <v0.1.1-SHA>; rename does not break frozen historical board records. Boundary note added to SUB-SYSTEMS.md delineating People Intelligence ↔ Relational IS.
```

- [ ] **Step 3: Run tests**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 4: Commit**

```bash
git add verticals/people-intelligence/SUB-SYSTEMS.md verticals/people-intelligence/MEMORY.md
git commit -m "docs(v7.6.0)(people-intelligence): boundary note + v0.1.2 changelog redirect

People↔Relational delineation per Luminor Board verdict (Lyssandria challenge).
v0.1.2 entry preserves fork point at v0.1.1 SHA.

Built on SIP."
```

---

### Task 7: Phase 7 — /openclaw-audit governance loop closure

**Files:**
- Possibly modify: any defects surfaced

- [ ] **Step 1: Run /openclaw-audit on accumulated v7.6.0 ship**

Audit checks: file contract compliance, attestation footer presence, declared-loads invariant 6, sovereignty clause integrity, voice-operator boundary preserved.

- [ ] **Step 2: Same-day remediation on any CRITICAL findings**

If audit returns clean: proceed to Phase 8. If REVISE/CRITICAL: address before tagging.

- [ ] **Step 3: Document audit verdict**

Save to `docs/boards/openclaw-v76-audit.md`.

- [ ] **Step 4: Commit (if remediations)**

```bash
git add docs/boards/openclaw-v76-audit.md [+ any remediation files]
git commit -m "docs(v7.6.0)(governance): /openclaw-audit verdict + remediations

[Verdict summary]

Built on SIP."
```

---

### Task 8: Phase 8 — v7.6.0 release

**Files:**
- Modify: `package.json` (bump to 7.6.0)

- [ ] **Step 1: Bump package.json version**

Edit version field: `7.5.3` → `7.6.0`.

- [ ] **Step 2: Run tests**

```bash
node --test
```
Expected: 514/514 pass.

- [ ] **Step 3: Commit version bump**

```bash
git add package.json
git commit -m "chore(v7.6.0): bump package.json to 7.6.0

Release marker for People Intelligence rename. Substrate naming-symmetry sweep.

Built on SIP."
```

- [ ] **Step 4: Tag annotated**

```bash
git tag -a v7.6.0 -m "v7.6.0 — People Intelligence rename (Path A authorless symmetric naming)

HR Intelligence reference vertical → People Intelligence. Substrate naming
symmetry restored across Domain Sub-Stack Tier (Sound Intelligence pattern).
Board verdict: PROCEED at v7.6.0 (revised down from proposed v8.0).

8-phase ship:
  Phase 1: vertical wrapper rename (8 files)
  Phase 2: skills domain rename (6 files)
  Phase 3: 6 sub-system agents
  Phase 4: 28 sub-system commands
  Phase 5: cross-reference sweep (~30 files including templates, friend-starter, sister-vertical refs)
  Phase 6: boundary note + changelog redirect
  Phase 7: /openclaw-audit
  Phase 8: version bump + tag

Tests: 514/514 pass.

Built on SIP."
```

- [ ] **Step 5: Push main + tags**

```bash
git push origin main && git push origin v7.6.0
```

- [ ] **Step 6: Verify push**

```bash
git log --oneline -10 && git tag --list | tail -5
```

---

## Self-Review

**Spec coverage:** Each prompt phase mapped to a task. v7.6.0 substitution honored throughout. Boundary note (Lyssandria's challenge) added in Phase 6. Friend-starter `hr-`-prefixed files explicitly renamed (caught in scope expansion). Test assertion updates folded into Phases 1-2 (declared-loads invariant 6 preservation). Voice-operator parallel session boundary preserved (Step 1 of Phase 5 explicitly).

**Placeholder scan:** `<SHA-Phase-1>` and `<v0.1.1-SHA>` in changelog redirect — these resolve at execution time after Phase 1 commits and from existing v7.5.2 commit. Acceptable: not placeholders for unwritten content; pointers to runtime values.

**Type consistency:** "People Intelligence" (Title Case display name), "people-intelligence" (kebab-case path). Used consistently throughout. Tier name and path align.

**Historical preservation:** docs/boards/, docs/ops/HANDOVER-*, private/ explicitly excluded from sweep — these are frozen records and renaming would corrupt verdict provenance.

---
**Built on SIP** · /superpowers:writing-plans · 2026-04-28
