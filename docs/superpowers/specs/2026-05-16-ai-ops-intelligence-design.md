# AI Ops Intelligence — Design Spec (v0.1)

**Date:** 2026-05-16
**Author:** Frank Riemer (with Claude Opus 4.7)
**Status:** Design approved — pending /starlight-board substrate gate → writing-plans → implementation
**Tier:** Substrate-class (Domain Sub-Stack, sibling of People Intelligence and Sound Intelligence)
**Vertical:** `verticals/ai-ops-intelligence/`
**Brainstorming session:** `.superpowers/brainstorm/253084-1778966851/`

---

## 1. Purpose

Build the **AI Operations Intelligence** Domain Sub-Stack — a forkable reference vertical that turns scattered AI assistants across **11 supported platforms** (Claude Code projects, Claude Projects, ChatGPT Custom GPTs, Gemini Gems, Grok, Kimi, Cursor rules, Cline rules, Codex profiles, Gemini CLI configs, Antigravity rules) into one canonical fleet with continuous quality control via a multi-model council and a strategic CoE methodology surface.

The vertical exposes two top-level skills:

- **`/ai-ops`** — operational umbrella for managing the personal fleet
- **`/ai-coe`** — strategic / methodology umbrella for producing Center-of-Excellence artifacts, aligned with the published framework at `https://www.frankx.ai/ai-coe`

Both compose the same registry. `/ai-ops` is for fleet hygiene; `/ai-coe` is for stakeholder-facing assessment and delivery framework generation.

**Relationship to ACOS:** Per `frankx.ai/ai-coe`, "ACOS serves as one implementation runtime for this personal CoE pattern." This vertical does not replace ACOS — it extends the pattern with multi-platform registry + multi-model council, and pushes back into ACOS via skill + command propagation (see §11 Distribution).

**Canonical CoE framework (from frankx.ai/ai-coe):** six pillars — **Strategy · Governance · Talent · Technology · Data · Ethics** — operated at two scales (**Personal AI CoE** for individuals; **Team AI CoE** for small teams or business units), with a **weekly 5-step cadence** as the operating ritual:

1. Pick one domain where AI saves time
2. Write rules for what AI may draft, decide, and never touch
3. Build reusable prompt or agent for repeatable work
4. Store outputs where future sessions retrieve them
5. Review weekly and improve one bottleneck

The `/ai-ops-council` and `/ai-coe-*` commands operationalize this cadence directly: step 4 is the registry; step 5 is the council.

## 2. Success criteria

v0.1 ships if and only if **all** of:

1. `/ai-ops-excavate` produces ≥ 1 entry per platform Frank actually uses (across the 11 supported platforms).
2. `/ai-ops-list` renders the full fleet in one place — the stated v0.1 success criterion ("I can see every assistant I have in one place").
3. `/ai-ops-council <slug>` runs the full 6-seat ensemble (4 Claude subagents + Gemini CLI + Codex CLI) with graceful degradation when any external CLI is unavailable, and produces a readout with a verdict line (`KEEP | TIGHTEN | REWRITE | RETIRE`).
4. `/ai-coe-assess` produces a CoE maturity scorecard across the **six pillars from frankx.ai/ai-coe** (Strategy · Governance · Talent · Technology · Data · Ethics) from the current registry, supporting both Personal-CoE and Team-CoE scales.
5. v86 symmetry test passes (every registry entry validates against schema + carries attestation).
6. Notion DB sync runs on post-commit hook without blocking commits when Notion is unavailable.
7. /starlight-board pre-tag verdict is PROCEED (per CLAUDE.md substrate-tier governance gate).
8. Skills + commands install **globally** to `~/.claude/skills/` and `~/.claude/commands/` — available from every Claude Code project, not just SIS.
9. ACOS (`FrankX/agentic-creator-os` + `FrankX/agentic-creator-os-npm`) updated to reference `/ai-ops` and `/ai-coe` so any ACOS instance inherits them.

## 3. Scope

### In scope (v0.1)

- Domain Sub-Stack scaffold at `verticals/ai-ops-intelligence/`
- Public substrate (forkable, MIT) + private instance (Frank's fleet) split per `feedback_privacy_split.md`
- Frontmatter-validated Markdown schema for assistant entries
- Excavation walker (file-based) + interactive prompts (chat-platform)
- 6 commands under `/ai-ops-*` (incl. umbrella `/ai-ops`)
- 4 commands under `/ai-coe-*` (incl. umbrella `/ai-coe`, plus `/ai-coe-assess`, `/ai-coe-report`, `/ai-coe-frame`)
- Both skills built via `/skill-creator:skill-creator` (the meta-skill for skill authoring)
- **Global install** to `~/.claude/skills/{ai-ops,ai-coe}/` and `~/.claude/commands/{ai-ops*,ai-coe*}.md` via `verticals/ai-ops-intelligence/install.sh`
- **ACOS propagation**: update `FrankX/agentic-creator-os/CLAUDE.md` + `FrankX/agentic-creator-os-npm/src/` to declare `/ai-ops` and `/ai-coe` as inherited capabilities, with a bootstrap step that installs them if not already present
- Cross-link to `frankx.ai/ai-coe` from the `/ai-coe` skill description (canonical framework reference)
- Multi-model council (4 Claude subagents + 2 sibling-CLI seats + synthesizer)
- 1 new agent: `starlight-ai-ops` (council coordinator)
- Notion DB one-way push on post-commit hook
- Obsidian canvas auto-generation in `memory/ai-ops/ai-ops.canvas`
- Ambient attestation per v7.4 pattern on every artifact
- v86 symmetry test (registry ↔ schema ↔ attestation)
- CLAUDE.md update: register the new vertical + commands
- VERTICALS.md update: add "AI Ops Intelligence" under Domain Sub-Stack section
- agents/AGENT_REGISTRY.md update: add `starlight-ai-ops`
- skills/skill-rules.json update: auto-activation triggers for `/ai-ops` and `/ai-coe`

### Out of scope (v0.2 or later)

- Notion → Git reverse sync (acknowledged; user accepted this deferral)
- Playwright-driven browser sync for Custom GPTs / Gems (manual entry until then)
- Continuous canon-change drift detection (council surfaces drift on demand in v0.1)
- Weekly cadence automation via `/schedule` (commands work; user triggers them in v0.1)
- Supabase pgvector-backed embedding similarity across system prompts
- Dashboard panel in cockpit at `:3007`
- CoE engagement persistence (each `/ai-coe-frame` invocation generates a fresh framework — engagement tracking is v0.2)

## 4. Architecture

### 4.1 Three-layer substrate / instance / mirrors

**Layer 1 — Public Substrate** (forkable, MIT) at `verticals/ai-ops-intelligence/`:

```
verticals/ai-ops-intelligence/
├── SKILL.md                              # substrate skill (invariants)
├── SIS-instance.md                       # vertical declaration
├── STACK.md                              # overrides (Notion + Obsidian)
├── README.md                             # public docs
├── schemas/
│   └── assistant.schema.json             # JSON-schema for entry frontmatter
├── prompts/
│   ├── council-researcher.md             # 1 prompt per council seat
│   ├── council-prompt-engineer.md        # Luminor-kernel prompt
│   ├── council-kb-engineer.md
│   ├── council-sentinel.md
│   ├── council-gemini-vector.md          # cross-family POV prompt
│   ├── council-gpt-vector.md             # cross-family POV prompt
│   ├── council-synthesizer.md            # Starlight Prime reconciliation
│   ├── coe-assessment-framework.md       # 6-pillar scorecard rubric (Strategy·Governance·Talent·Technology·Data·Ethics, mirrors frankx.ai/ai-coe)
│   ├── coe-delivery-framework.md         # engagement template
│   ├── coe-personal-scale.md             # Personal AI CoE variant
│   ├── coe-team-scale.md                 # Team AI CoE variant
│   └── coe-weekly-cadence.md             # 5-step weekly operating cadence
├── platforms/
│   ├── claude-code.ts
│   ├── claude-project.ts
│   ├── chatgpt-custom-gpt.ts
│   ├── gemini-gem.ts
│   ├── grok.ts
│   ├── kimi.ts
│   ├── cursor.ts
│   ├── cline.ts
│   ├── codex.ts
│   ├── gemini-cli.ts
│   └── antigravity.ts
├── excavation/
│   ├── walker.ts                         # filesystem walker (auto)
│   └── manual-template.md                # interactive prompt template
├── sync/
│   ├── notion-push.ts                    # one-way Git → Notion
│   └── obsidian-canvas.ts                # generates ai-ops.canvas
├── council/
│   └── dispatch.ts                       # parallel seat invocation
├── coe/
│   ├── assess.ts                         # 6-pillar maturity scoring
│   ├── report.ts                         # stakeholder-format output
│   └── frame.ts                          # engagement framework generator
├── install/
│   ├── install.sh                        # global install to ~/.claude/
│   ├── uninstall.sh                      # clean removal
│   └── acos-bridge.ts                    # ACOS propagation (CLAUDE.md + npm pkg update)
└── tests/
    ├── v86-ai-ops-symmetry.test.ts
    ├── excavate.test.ts
    ├── council.integration.test.ts
    └── coe-assess.test.ts
```

**Layer 2 — Private Instance** (Frank's fleet, Git-backed, Obsidian-visible) at `memory/ai-ops/`:

```
memory/ai-ops/
├── README.md                              # instance index
├── ai-ops.canvas                          # Obsidian canvas (fleet graph)
├── REGISTRY.md                            # auto-generated overview
├── excavation.log                         # excavation events
├── {platform}/                            # one dir per platform
│   └── {slug}.md                          # one file per assistant
├── council/
│   └── {YYYY-MM-DD}-{slug}.md             # one file per council run
└── coe/
    ├── assessments/{YYYY-MM-DD}-scorecard.md
    └── frames/{client-or-self}-{date}.md
```

**Layer 3 — Mirrors** (read views):

- **Notion DB** "AI Ops Registry" — one-way push from Git on post-commit hook
- **Obsidian canvas** at `memory/ai-ops/ai-ops.canvas` — auto-generated, groups by platform, edges = KB-source overlap

### 4.2 Operational surface

**Skills (top-level umbrellas):**

| Skill | Built via | Purpose |
|---|---|---|
| `/ai-ops` | `/skill-creator:skill-creator` | Routes operational intents to the 5 commands below + council |
| `/ai-coe` | `/skill-creator:skill-creator` | Routes strategic intents to assess / report / frame |

**Commands:**

| Command | Behavior |
|---|---|
| `/ai-ops-excavate` | Scans disk (file-based platforms) + interactive prompts for chat-platform entries · idempotent · covers all 11 supported platforms |
| `/ai-ops-list [--platform X] [--stale]` | Table view; `--stale` filters `last_reviewed > 14d` |
| `/ai-ops-show <slug>` | Full entry incl. system_prompt + kb_sources + drift hash |
| `/ai-ops-add` | Guided add with auto-attestation; validates schema before write |
| `/ai-ops-council <slug \| --all-stale>` | Full 6-seat ensemble; writes `memory/ai-ops/council/{date}-{slug}.md` |
| `/ai-coe-assess [--scale personal\|team]` | Reads registry → scores against 6 pillars (Strategy·Governance·Talent·Technology·Data·Ethics) → scorecard. Default scale `personal`. |
| `/ai-coe-report` | Formats latest assessment for stakeholders (markdown + Notion page) |
| `/ai-coe-frame <name> [--scale personal\|team]` | Generates delivery framework template for a new CoE engagement; embeds the 5-step weekly cadence |

**Agents:**

- `starlight-ai-ops` (council coordinator — dispatches seats, hands to Starlight Prime for synthesis)

### 4.3 Council seat composition

Per CLAUDE.md and `model-routing` skill:

| Seat | Engine | Reason |
|---|---|---|
| Researcher | Sonnet 4.6 | KB-source freshness sweep; cheap volume |
| Prompt Engineer (Luminor-kernel) | Opus 4.7 | Heavy prompt-craft reasoning |
| KB Engineer | Sonnet 4.6 | KB → SIS canon diff |
| Sentinel | Haiku 4.5 | Fast attestation + safety scan |
| Gemini Pressure Vector | `gemini` CLI via cockpit/dispatch | Cross-family POV (Gemini idioms) |
| GPT Pressure Vector | `codex` CLI via cockpit/dispatch | Cross-family POV (GPT idioms) |
| Synthesizer | Opus 4.7 (Starlight Prime) | Reconciles 6 outputs → verdict |

External CLI invocation reuses the dispatch infrastructure shipped in v7.5.3 (`cockpit/dispatch/`), which is already proven on Frank's machine (3 sibling CLIs live-fired, 433/433 green per memory `project_v753_dispatch_cli.md`).

## 5. Assistant entry schema

Per-entry Markdown file with YAML frontmatter:

```yaml
---
slug: frankx-architect                       # kebab-case, unique within platform
name: "FrankX Architect"                     # human label
platform: chatgpt-custom-gpt                 # enum of 11 platforms
owner: frank                                 # who maintains it
purpose: "Personal-brand architect …"        # one line
status: active                               # active | dormant | retired
system_prompt_hash: sha256:a1b2…             # auto-computed
system_prompt: |
  ...                                        # full text, source of truth
kb_sources:
  - type: sis-canon
    path: STACK.md
  - type: url
    url: https://frankx.ai
  - type: file
    path: memory/vaults/strategic-vault.md
last_reviewed: 2026-05-16                    # set by /ai-ops-council
last_verdict: keep                           # keep | tighten | rewrite | retire
last_council_readout: memory/ai-ops/council/2026-05-16-frankx-architect.md
attestation: built-on-sip-v1.1.1             # auto-embedded
notion_page_id: null                         # filled after first Notion push
---

# {name}

{body — handover doc, change log, manual notes}
```

**Schema invariants** (enforced by v86 symmetry test):

- `slug` matches `^[a-z0-9-]+$`
- `platform` ∈ enum of 11 supported platforms
- `system_prompt_hash` = `sha256(system_prompt)`
- `attestation` present, ≥ `built-on-sip-v1.0.0`
- `last_verdict` ∈ {keep, tighten, rewrite, retire, unreviewed}

## 6. Data flow

```
        /ai-ops-excavate
              │
              ├── walker.ts → scans disk (11 platforms)
              │            → emits memory/ai-ops/{platform}/{slug}.md
              │            → ambient /sip-attest on every write
              │
              └── manual-template → interactive prompts for chat platforms
                                  → same write path

              ▼
        post-commit hook
              │
              ├── notion-push.ts → Notion DB (non-blocking on failure)
              └── obsidian-canvas.ts → regenerates ai-ops.canvas

              ▼
        Query surface
              ├── /ai-ops-list
              ├── /ai-ops-show <slug>
              ├── /ai-ops-council <slug>
              │       │
              │       ├── parallel dispatch:
              │       │   • 4 Claude subagents (researcher, prompt-eng, kb-eng, sentinel)
              │       │   • cockpit/dispatch → gemini CLI subprocess
              │       │   • cockpit/dispatch → codex CLI subprocess
              │       │
              │       └── Starlight Prime synthesizer
              │             → memory/ai-ops/council/{date}-{slug}.md
              │             → updates entry: last_reviewed, last_verdict
              │
              ├── /ai-coe-assess → coe/assess.ts → memory/ai-ops/coe/assessments/
              ├── /ai-coe-report → coe/report.ts → markdown + Notion page
              └── /ai-coe-frame  → templated framework → memory/ai-ops/coe/frames/
```

## 7. Error handling

Boundary failures only — per CLAUDE.md hygiene rule "only validate at system boundaries."

| Boundary | Failure | Behavior |
|---|---|---|
| Schema validation on `/ai-ops-add` | invalid frontmatter | reject write; show diff vs schema |
| Excavation walker | unreadable file | skip; log to `excavation.log`; never crash |
| Notion sync hook | API down / token missing | log + continue (Git stays canonical) |
| Council seat: Claude subagent | timeout (> 120s) | seat reports `unavailable`; synthesizer notes gap |
| Council seat: Gemini/Codex CLI | CLI exit ≠ 0 OR not installed | seat reports `cli-unavailable`; synthesizer notes which family POVs are missing |
| Synthesizer | no seats returned | abort; no readout written; exit code ≠ 0 |
| `/ai-coe-assess` | < 1 assistant in registry | abort with "excavate first" message |

**Graceful degradation invariant:** the council always produces *some* output if at least one Claude seat returned. External CLIs missing → reduced cross-family coverage, never failure.

## 8. Testing

| Test layer | Location | Asserts |
|---|---|---|
| **Schema (symmetry)** | `tests/v86-ai-ops-symmetry.test.ts` | every file in `memory/ai-ops/{platform}/` validates against schema; attestation present; cross-references resolvable |
| **Excavation** | `tests/excavate.test.ts` | seeded fixture filesystem at `tests/fixtures/excavate-fleet/`; assert walker emits N entries with correct frontmatter |
| **Council integration** | `tests/council.integration.test.ts` | mocked Claude subagents + stubbed Gemini/Codex CLIs; assert synthesizer produces valid readout with verdict; `last_reviewed` updates; readout round-trips |
| **CoE assessment** | `tests/coe-assess.test.ts` | scorecard schema; all 6 pillars (Strategy · Governance · Talent · Technology · Data · Ethics) present; numeric coherence; scale flag (personal/team) honored |
| **Pre-commit hook** | existing | runs symmetry + lint |

Expected delta: ~25-35 new tests.

## 9. Substrate updates

| File | Change |
|---|---|
| `CLAUDE.md` | Add `/ai-ops` and `/ai-coe` to Commands table; note AI Ops Intelligence as Domain Sub-Stack |
| `VERTICALS.md` | Add "AI Ops Intelligence" entry under "Sovereign domain sub-stacks" section (third reference vertical after People IS + Sound IS) |
| `STACK.md` | No change (the 10-IS taxonomy is unaffected — domain sub-stacks compose inside, don't promote to top-level) |
| `agents/AGENT_REGISTRY.md` | Add `starlight-ai-ops` |
| `skills/skill-rules.json` | Add auto-activation rules for `/ai-ops` and `/ai-coe` |
| `tests/v79-vertical-coverage.test.ts` | Add `ai-ops-intelligence` to vertical coverage list (or to EXEMPT_VERTICALS if v0.1 ships incomplete sub-system coverage) |

## 10. Global install

### 10.1 Why global

Frank operates from multiple repos beyond SIS (FrankX, Arcanea, AnimeLegends, GenCreator, Starlight-Agent-Lab, etc.). The `/ai-ops` and `/ai-coe` skills must be available in every Claude Code session regardless of `cwd`. User-level install at `~/.claude/{skills,commands}/` accomplishes this.

### 10.2 Install targets

| Target | Source (SIS canonical) | Mechanism |
|---|---|---|
| `~/.claude/skills/ai-ops/SKILL.md` | `verticals/ai-ops-intelligence/skills/ai-ops/SKILL.md` | copy (default) or symlink (`--link` flag) |
| `~/.claude/skills/ai-coe/SKILL.md` | `verticals/ai-ops-intelligence/skills/ai-coe/SKILL.md` | copy or symlink |
| `~/.claude/commands/ai-ops.md`, `ai-ops-excavate.md`, `ai-ops-list.md`, `ai-ops-show.md`, `ai-ops-add.md`, `ai-ops-council.md` | `verticals/ai-ops-intelligence/commands/` | copy or symlink |
| `~/.claude/commands/ai-coe.md`, `ai-coe-assess.md`, `ai-coe-report.md`, `ai-coe-frame.md` | `verticals/ai-ops-intelligence/commands/` | copy or symlink |
| `~/.claude/skills/skill-rules.json` | merged from `verticals/ai-ops-intelligence/skill-rules.fragment.json` | additive merge (preserves existing rules) |

### 10.3 Install script

`verticals/ai-ops-intelligence/install/install.sh`:

- Detects pre-existing entries; refuses to overwrite without `--force`
- Default mode is **copy** (durable; survives SIS uninstall)
- `--link` mode symlinks back to SIS (live updates; breaks if SIS moves)
- `--dry-run` previews actions without writing
- Writes `~/.claude/skills/ai-ops/.installed-from` with SIS commit SHA for traceability

### 10.4 Substrate registry entry

Skill files (`SKILL.md`) carry an `installed_at_path` frontmatter pointing to the canonical SIS source. Symmetry test v86 asserts that any installed copy still references the SIS canonical path.

## 11. ACOS distribution

### 11.1 Why ACOS

Per `frankx.ai/ai-coe`: "ACOS serves as one implementation runtime for this personal CoE pattern." ACOS users should inherit `/ai-ops` and `/ai-coe` automatically. Two ACOS surfaces matter:

- `FrankX/agentic-creator-os/` — the local in-repo ACOS implementation (CLAUDE.md, adapters, instances, templates)
- `FrankX/agentic-creator-os-npm/` — the published npm package (`acos` CLI, distributed broadly)

### 11.2 Changes per ACOS surface

**`FrankX/agentic-creator-os/CLAUDE.md`** — append a section "Inherited from Starlight Intelligence System":

```markdown
## Inherited from SIS

ACOS instances inherit the following SIS Domain Sub-Stack capabilities by default:

- `/ai-ops` — fleet hygiene for AI assistants across 11 platforms (registry, council, audit)
- `/ai-coe` — CoE methodology (6-pillar assessment, report, engagement framework)

Source: `frankxai/Starlight-Intelligence-System` → `verticals/ai-ops-intelligence/`
Canonical framework: https://www.frankx.ai/ai-coe
Install: `npx acos install ai-ops-intelligence` (or manual via SIS install.sh)
```

**`FrankX/agentic-creator-os-npm/src/`** — add an install hook:

- New file `src/installers/ai-ops-intelligence.ts` — pulls from SIS substrate (either via git clone or published package — TBD during impl)
- New CLI verb `acos install ai-ops-intelligence` — invokes the installer
- Updated `README.md` listing `/ai-ops` and `/ai-coe` as inherited capabilities

**ACOS-side bootstrap** — when `acos init` runs in a new project and detects no `~/.claude/skills/ai-ops/`, prompt the user "Install AI Ops Intelligence (/ai-ops + /ai-coe)? [Y/n]". Default Y for new ACOS instances.

### 11.3 Related agent-harness repos

Per memory `[arcanea-flow connect-not-absorb]` and the multi-repo pattern: SIS is the source of truth for the substrate; sibling repos consume via attestation + reference. The following repos get a similar one-line note in their CLAUDE.md or README pointing back to SIS:

- `FrankX/arcanea-flow` — note `/ai-ops` inheritance
- `FrankX/starlight-agent-lab` — note `/ai-ops` + `/ai-coe` inheritance
- `FrankX/FrankX` (the personal brand vertical) — note `/ai-coe` is now backed by SIS (was previously a content-only page at frankx.ai/ai-coe)

No code changes in these repos beyond reference notes; the global install handles the runtime side.

## 12. Governance

**Substrate-tier governance gate per CLAUDE.md v7.5.1+:**

- `/starlight-board` MUST run before commit/tag (board-before-tag is structural-not-discretionary)
- Board verdict required: PROCEED, REVISE, or BLOCK
- REVISE items close before tag; BLOCK halts ship

This spec triggers the gate because it touches:
- `VERTICALS.md` (substrate registry — new vertical)
- `CLAUDE.md` (substrate self-description)
- `agents/AGENT_REGISTRY.md` (new agent)
- attestation rules (new domain sub-stack carries attestation)

**Falsifier for /ai-ops-council multi-CLI architecture:** if both Gemini and Codex CLIs are unavailable on Frank's machine at council-run time AND the council still claims cross-family POV coverage, the design is broken. Synthesizer must surface "Gemini POV: unavailable, Codex POV: unavailable" verbatim in the readout when this happens.

## 13. Implementation order (for writing-plans)

Suggested phasing (real plan to be produced by `writing-plans` skill):

1. **Scaffold** — directories, SKILL.md, SIS-instance.md, STACK.md overrides, schema JSON
2. **Excavation walker** — file-based platforms first (cheap), then manual templates
3. **Notion + Obsidian sync** — one-way push hooks
4. **Commands `/ai-ops-list` + `/ai-ops-show` + `/ai-ops-add`** — read/write basics
5. **Council seats** — 4 Claude prompts first, then cockpit/dispatch wiring for Gemini + Codex, then synthesizer
6. **`/ai-ops-council`** command
7. **CoE surface** — assess.ts, report.ts, frame.ts + `/ai-coe-*` commands
8. **`/ai-ops` and `/ai-coe` umbrella skills** via `/skill-creator:skill-creator`
9. **v86 symmetry test** + excavate test + council integration test + coe-assess test
10. **Substrate updates** — CLAUDE.md, VERTICALS.md, AGENT_REGISTRY.md, skill-rules.json
11. **Global install script** — install/install.sh; verify `~/.claude/skills/{ai-ops,ai-coe}/` populated; smoke-test from a non-SIS cwd
12. **ACOS bridge** — install/acos-bridge.ts; update ACOS CLAUDE.md + npm pkg; verify `npx acos install ai-ops-intelligence` succeeds
13. **Pre-commit hook integration**
14. **/starlight-board pre-tag gate**
15. **Commit, tag, ship — across SIS + ACOS + agentic-creator-os-npm in coordinated push**

## 14. Open questions (deferred to implementation)

- Notion DB schema fields beyond what's listed — finalize during Notion-push implementation
- Whether `/ai-coe-frame` consumes a YAML brief or interactive prompts — pick during impl
- **CoE maturity rubric weights across the 6 pillars (Strategy · Governance · Talent · Technology · Data · Ethics)** — start equal-weighted, calibrate after first real assessment against frankx.ai/ai-coe scoring (if any public scoring exists)
- ACOS install mechanism: should `npx acos install ai-ops-intelligence` clone SIS via git, or pull from a published `@starlight/ai-ops-intelligence` npm package? Decide during impl based on which surface lands first
- Realistic v0.1 effort: **~3-5 days of focused work** for a senior architect (scaffold 0.5d · excavation 0.5d · sync 0.5d · commands 0.5d · council seats incl. CLI dispatch 1d · CoE surface 0.5d · tests 0.5d · global install + ACOS bridge 0.5d · substrate updates + board gate 0.5d). Stretch to 1 week with proper code review per `feedback_subagent_code_needs_review_before_ship.md`.

## 15. References

- **frankx.ai/ai-coe** — canonical 6-pillar CoE framework (Strategy · Governance · Talent · Technology · Data · Ethics; weekly 5-step cadence; Personal + Team scales; ACOS as runtime)
- CLAUDE.md (substrate routing + governance gate)
- STACK.md (10-IS taxonomy + L2 memory pattern)
- VERTICALS.md (Domain Sub-Stack precedents: People IS, Sound IS)
- `FrankX/agentic-creator-os/CLAUDE.md` (ACOS local runtime)
- `FrankX/agentic-creator-os-npm/` (ACOS published package — distribution surface)
- `memory/MEMORY.md`:
  - `feedback_privacy_split.md` (public substrate / private instance)
  - `project_v753_dispatch_cli.md` (cockpit/dispatch primitive for sibling CLIs)
  - `feedback_lead_with_authority.md` (drive directives end-to-end)
  - `feedback_board_before_tag.md` (substrate gate)
  - `project_v85_substrate_evolution_2026_05_14.md` (v85 symmetry test pattern; v86 continues)
- Brainstorming session: `.superpowers/brainstorm/253084-1778966851/`

---

**Built on SIP** · v1.1.1 · MIT
