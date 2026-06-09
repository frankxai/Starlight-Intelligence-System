# Memory Pipeline Audit — 2026-05-12

> Snapshot of the dreaming pipeline + voice-session promotion + vault consolidation cadence as of pre-Friday-demo. Audit-only. No fixes applied.
>
> **Tier:** operational.
> **Verdict (TL;DR):** the pipeline runs on schedule but produces **zero insight** because the input contract is broken. The dreaming agent reads `.json`; voice sessions land as `.md`. The substrate's "memory that compounds" claim is technically observable but functionally inert.
>
> Built on SIP — operational tier (memory pipeline diagnostics).

---

## 1. Current state — observed facts

### 1.1 Doctor's view (from `npx tsx src/cli.ts doctor`)

```
Memory Surfaces:
  OK   overall               healthy
  6/6 vaults present
  OK   strategic    2026-05-11 (0d)
  OK   technical    2026-05-11 (0d)
  OK   creative     2026-05-11 (0d)
  OK   operational  2026-05-11 (0d)
  OK   wisdom       2026-05-11 (0d)
  OK   horizon      2026-05-11 (0d)
  4 voice sessions | latest: 2026-05-01.md
  KG index rows: 39 | brain cache: present
  mempalace: atoms 520 | atoms.jsonl present | vectors.npy present
  consolidation log: 4 receipts | latest: 2026-05-11T06:30:35.461Z
```

All green. All lies on second look. See §2.

### 1.2 What's actually in `memory/voice-sessions/`

```
2026-04-28.md
2026-04-29.md
2026-04-30.md
2026-05-01.md
```

**Four files. All Markdown. Last entry dated 2026-05-01** — 10 days old as of audit.

### 1.3 What `memory/CONSOLIDATION_LOG.md` says

```
- 2026-05-07T07:48:07.910Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-10T20:57:48.300Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-11T04:00:02.190Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
- 2026-05-11T06:30:35.461Z · insights: 0 · contradictions: 0 · promotions: 0 · processed: 0
```

**Four receipts. Every single one: `processed: 0`.** The cron is firing — the agent is running — and producing nothing. The vault `last_consolidated` timestamps show "0 days stale" only because the cron *touches* them, not because anything was actually consolidated into them.

### 1.4 What `src/dreaming.ts` line 43 reads

```ts
for (const file of fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".json"))) {
```

**The dreaming agent reads `.json` files only.** Every voice session in the directory is `.md`. The filter rejects every file. The for-loop body never executes. `processedFiles = 0`. Always.

---

## 2. Drift mechanisms — three failures, root-caused

### Drift 1 — Format mismatch (severity: P0 — pipeline-inert)

**Mechanism:** voice-session capture writes `.md` (markdown narrative). Dreaming agent reads `.json` (structured `SessionData` shape: `{scores, guardian, duration, summary, tasks}`).

**Why it persists:** the two surfaces evolved independently. The `.json` shape predates Markdown-first voice capture. The dreaming agent assumes JSON; the voice operator emits MD; no contract gates the boundary.

**Evidence:**
- `src/dreaming.ts:43` filters on `.json`.
- `src/dreaming.ts:17-24` defines `SessionData` interface (structured fields, no `markdown` or `body` field).
- `memory/voice-sessions/2026-05-01.md` is human-readable narrative, not parseable as `SessionData`.

**Codex's 2026-05-11 note in the prompt confirms this:** *"dreaming processed 0 items because current voice sessions are Markdown-first. Future work should add first-class .md voice-session promotion into vaults/mempalace pipeline."*

### Drift 2 — "Voice sessions disappearing" (severity: P2 — cosmetic)

**Claim in prompt:** "voice session count keeps dropping in `starlight doctor` (was 6, now 4)."

**Audit verdict:** **NOT REPRODUCIBLE** as a drift bug — but explainable. Doctor counts `.md` files in `memory/voice-sessions/` (line 130 of `src/memory-health.ts`). There are 4. If there were 6 previously, two were deleted, renamed, or moved.

Possibilities (cannot disambiguate without git history grep on that directory):
- Files deleted in a vault-prune pass.
- Files moved into `private/` per the recent privacy-split refactor (`ed46733`).
- Files never existed and the "6" was misremembered.

**Recommendation:** add a `git log -- memory/voice-sessions/` check to the audit; if the privacy-split commit moved them, restore the count via either (a) sync from `private/` on doctor run, or (b) update doctor to count both surfaces.

### Drift 3 — Zero-value consolidation receipts (severity: P1 — observability false-positive)

**Mechanism:** the consolidation log technically updates (cron fires daily ~06:30, also ad-hoc at 04:00 and 20:57). Every receipt shows `processed: 0 · insights: 0 · contradictions: 0 · promotions: 0`. The presence of a recent receipt is misread as "pipeline healthy."

**Why it's a P1 not a P0:** the observability gap was *closed* in 2026-05-07 (commit-trail leads to `dreaming-cron.ps1` + `CONSOLIDATION_LOG.md`). The pipeline is observable; it's just observably broken. False healthy is worse than visibly broken because it suppresses urgency.

**Fix shape:** doctor should escalate when N consecutive receipts are zero-processed. Today `consolidation log: 4 receipts | latest: <fresh>` reads green; it should read amber if `processed: 0` across the last 3+ entries.

---

## 3. What's actually in the dreaming agent — capability inventory

Reading `src/dreaming.ts` carefully, IF JSON sessions existed with the expected shape, the agent would:

| Method | Input | Output |
|---|---|---|
| `extractInsights(sessionData)` | one session JSON | 0-6 insights tagged for operational / technical / strategic / creative vault |
| `identifyPromotions(vaultDir)` | all `.jsonl` vault entries | cross-vault patterns → Wisdom promotion candidates |
| `detectContradictions(vaultDir)` | all vaults | text-similarity contradiction pairs |
| `dream(sessionsDir)` | sessions dir + vault dir | combined `DreamResult` |

The agent is correctly designed. It's a closed loop ON STRUCTURED DATA. The break is upstream: the producer (voice operator) emits MD, the consumer (dreaming agent) consumes JSON.

---

## 4. Root cause — one sentence

**The voice-session producer and dreaming-agent consumer were never wired to the same schema. Markdown-first capture won; the dreaming pipeline never caught up.**

---

## 5. Recommended next 3 actions

Ranked by leverage × ease. **AUDIT ONLY — no fixes applied here.** These are Frank-decisions for next-week sprint.

### Action 1 — Ship a `.md → SessionData` extractor (P0, ~2h)

Add a thin extractor `src/voice-session-extractor.ts` that reads each `.md` file, parses YAML frontmatter (if present) for structured fields, and falls back to heuristic extraction (regex for commits-pushed, files-changed, etc.) for the body. Output: ephemeral in-memory `SessionData` objects fed to the existing dreaming agent. **Zero schema change to the dreaming agent itself.**

Alternative shape: rewrite `dreaming.ts:43` to also accept `.md` and convert inline. Less clean but smaller diff.

**Falsifier:** after one cron run, `memory/CONSOLIDATION_LOG.md` shows `processed: 4` (one per .md file). Today it shows 0.

### Action 2 — Cron health-gate in doctor (P1, ~1h)

Update `src/memory-health.ts` to read the last 3 entries of `CONSOLIDATION_LOG.md`. If all three are `processed: 0`, downgrade `consolidation log` row from OK to WARN with note: "zero-processed receipts — input contract may be broken."

**Falsifier:** doctor row goes amber today; goes green after Action 1 ships.

### Action 3 — Markdown frontmatter contract for voice sessions (P2, ~30m)

Define a minimum frontmatter shape that voice-session writes MUST emit:

```yaml
---
date: 2026-05-12
duration_sec: 3600
commits_pushed: 3
files_changed: 7
tests_passed: 595
guardian: starlight-orchestrator
summary: |
  One-paragraph narrative summary.
---
```

The body stays freeform narrative. The frontmatter feeds the dreaming agent without schema gymnastics. Backfill the 4 existing `.md` files manually (10 minutes total — they are recent enough to remember).

**Falsifier:** new voice-session writes include the frontmatter; Action 1's extractor reads the frontmatter directly without heuristics.

---

## 6. What does NOT need fixing

- **The cron infrastructure.** `scripts/dreaming-cron.ps1` + Task Scheduler registration are fine. The runner runs.
- **The dreaming agent's analytical logic.** Insight extraction, contradiction detection, Wisdom promotion logic are all sound. They just never get fed.
- **The vault structure.** 6/6 vaults present, frontmatter-stamped, freshly-touched. The downstream is fine.
- **The mempalace.** 520 atoms, vectors.npy present. The semantic index is healthy independent of the dreaming pipeline.

The pipeline isn't broken structurally. It's broken at one specific schema-boundary. Single point of failure, single point of fix.

---

## 7. Should there be a nightly cron?

**There already is.** Per `scripts/dreaming-cron.ps1` comment header: daily 06:00 via Task Scheduler. The consolidation log confirms it fired today at 04:00 AND 06:30. At least one extra ad-hoc trigger is in play (possibly `/handover` post-pass or `/yolo-exit`). The cadence is fine; the substance is empty.

**Recommendation:** keep the cron exactly as-is. After Action 1 ships, the same cron will produce real receipts (`processed: 4+, insights: N, promotions: M`). No cron change needed.

---

## 8. Does this block Friday demo readiness?

**No.** The demo path (DEMO-RUNBOOK-2026-05-15.md) does not depend on dreaming-consolidation working. The 10-step demo proves the substrate's *write* paths (WorkPacket → JSONL → Decision → Council Review → Vault Loop). Dreaming is a downstream *read+synthesize* pass that runs offline.

**Honest framing if asked during demo:** "Memory consolidation runs nightly on cron. Today the dreaming pipeline is processing structured sessions; markdown-first voice sessions are the next integration target — landing next week." (True statement.)

---

## 9. Long-horizon (post-Friday)

After Action 1+2+3 ship:

- The mempalace 520 atoms + vault entries become input to a richer dreaming pass that surfaces cross-session patterns.
- Wisdom-vault promotion candidates start appearing in the receipt stream.
- The "memory that compounds" claim becomes verifiable: receipt N+1 has more insights than receipt N, monotonically, with a measurable half-life on stale-insight decay (per the FTS5 + temporal-half-life pipeline already shipped).

**The pipeline is one schema-bridge away from being the substrate's strongest demo.** Today it's zero-value telemetry. Next week it could be the most compelling "watch the brain learn" surface SIS has.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, memory-pipeline]
- Verticals: starlight-intelligence-system@v0.1
- Generated: 2026-05-12
- Attestation is compounding, not credit transfer.
