# Interconnection Mesh — why parallel builds go invisible, and how the memory/automation substrate becomes live

> Status: blueprint · Branch: `claude/starlight-system-integration-gc2piq` · Date: 2026-07-13
> Trigger: a Codex/Rova session created `frankxai/ana-ai-business-kit` (2 PRs merged same day) and an open PR on `rova-resort`. Neither was visible to the Starlight Intelligence System. This documents why, and the fix.

---

## 1. The one-sentence diagnosis

**The memory + automation substrate is documentation and local PowerShell scripts, not a live event bus** — nothing writes to it unless a human or agent manually runs a sync, and nothing discovers work that happens outside one machine's `~/.claude/projects/` directory. Parallel harnesses (Codex, Cursor, Gemini, Antigravity) and newly-created repos are outside its field of view *by construction*.

The scaffolding is excellent. The wiring is missing. Every gap below is a wire, not a rebuild.

---

## 2. Why it isn't interconnected yet — the five concrete gaps (all verified 2026-07-13)

| # | Gap | Evidence in-repo | Consequence |
|---|-----|------------------|-------------|
| G1 | **Context is static, hand-assembled, stale** | `context/unified-context.md` last assembled **2026-02-10**, still declares **"v1.0.0"** while `CLAUDE.md` is **v8.3.0**. Only **5** repo-contexts exist (`acos, ai-ops, arcanea, arcanea-flow, music-intelligence-systems`) against **42** repos on disk / **73** referenced. | The map is 5 months old and covers ~12% of the estate. |
| G2 | **The cross-repo indexer is Claude-only + local-machine** | `scripts/run-cross-repo-indexer.ps1` crawls `~/.claude/projects/*/memory/` via a local Python `indexer`. | Codex/Cursor/Gemini write elsewhere → their work is never ingested. |
| G3 | **No GitHub-org discovery** | No script queries `gh api /users/frankxai/repos`. Registry is implicit (whatever has a local Claude memory dir). | A brand-new repo like `ana-ai-business-kit` is structurally undiscoverable. |
| G4 | **Automation is Windows-Task-Scheduler bound** | `register-*-task.ps1`, `dreaming-cron.ps1` — all PowerShell, all local. | Cloud/mobile/web sessions (this one, and the Codex one) write **zero** durable memory. |
| G5 | **The memory bus is pull-model + manual** | `skills/integration/ecosystem-sync/SKILL.md` is a list of procedures an agent must *choose* to run; `transmissions/channels/memory-bus.md` is a doc, not a pipe. | Interconnection depends on someone remembering to sync. Usually nobody does. |

**Root cause, restated:** there is no shared substrate that (a) every harness writes to, (b) survives outside one laptop, and (c) updates itself on events. GitHub is the only surface all harnesses already touch — so GitHub must become the nervous system.

---

## 3. How it can and will be — GitHub as the shared spine

```
        every harness already does this ──► git push / open PR
                                                   │
                    ┌──────────────────────────────┼───────────────────────────┐
                    ▼                               ▼                           ▼
             org webhook                     scheduled poller             session-end atom
        (repository[created],            (gh api /users/frankxai/repos    (each agent writes 1
         pull_request[closed+            diffed vs registry — the         JSONL line on wrap:
         merged=true], push → ingest)
                    │                      webhook safety net)              repo/branch/harness/
                    └──────────────┬──────────────┘   │                     summary/commits)
                                   ▼                   │                          │
                        memory/bus/*.jsonl  ◄──────────┴──────────────────────────┘
                     (committed to Starlight — one store, all sessions, any harness)
                                   │
                    ┌──────────────┼───────────────┐
                    ▼              ▼                ▼
            unified-context   drift alerts    daily digest DM
            (auto-regen)      (Sentinel)      (durable-output-sink)
```

The unlock: **GitHub is the convergence point.** Codex, Cursor, Gemini, and Claude disagree on everything except that they all commit and PR. Anchor discovery + memory to GitHub events and every harness is covered for free — including the ones not written yet.

---

## 4. The layered wiring plan (minimum-viable → full)

### Layer 0 — Truth reconciliation *(safe, do now)*
- [x] `context/repo-registry.json` — canonical live registry (42 on-disk repos + the 2 outside-field-of-view repos). Schema: top-level `repos[]`, full 40-char `sha`, `schema_version: 1`. Generated this session.
- [ ] **Migrate existing tooling onto the canonical registry (avoid split-brain).** `scripts/agy-tools.ps1` currently reads a machine-local `C:\Users\frank\repo-registry.json` and iterates `registry.repos`. The new file matches that `.repos` shape deliberately — point `agy-tools.ps1` (and any peer script) at `context/repo-registry.json`, or generate the machine-local copy from it, so there is one source of truth.
- [ ] Regenerate `context/unified-context.md` + `context/STATE.md` from the registry; kill the v1.0.0→v8.3.0 drift.
- [ ] Backfill missing `context/repo-contexts/*.md` (one per active repo, or a single rolled-up index).

### Layer 1 — GitHub event spine *(the key unlock)*
- [ ] `scripts/org-poller.mjs` (Node, cloud-runnable) — `gh api /users/frankxai/repos`, diff vs `context/repo-registry.json`, emit memory-bus atoms for new repos + merges. **This is the thing that would have caught `ana-ai-business-kit`.**
- [ ] GitHub App / org webhook → single ingest endpoint. Real event names: `repository` (action `created`), `pull_request` (action `closed` with `merged=true`), `push`. Webhook = realtime; poller = safety net for missed events.

### Layer 2 — Cloud-native memory bus
- [ ] Move memory from `~/.claude/projects/*` local crawl to committed `memory/bus/*.jsonl` in Starlight (v1), migrate to AgentDB/Supabase table (v2) when volume warrants. One store every session reads/writes, local or remote.

### Layer 3 — Harness-neutral write contract
- [ ] Define the **session-end atom** schema: `{ts, repo, branch, harness, summary, commits[], next}`.
- [ ] Wire the writer per harness: Claude → `Stop` hook; Codex → `AGENTS.md` instruction; Cursor → `.cursor/rules`; Gemini → `.gemini/`. One JSONL line on every wrap. **This is the "everything interconnected and updated" primitive.**
- [ ] **Reconcile with per-repo `MEMORY.md`.** 7+ repos (`payment-intelligence-system`, `agentic-mind-os`, `human-mind-intelligence-system`, `second-brain-os`, `starlight-mind-os-pro`, `arcanea-ai-app`, and Starlight itself) already treat `MEMORY.md` as their canonical durable-state file, and `GEMINI.md` mandates *"periodic sweeps of all repo `MEMORY.md` files to update the global state."* The write contract must not create a parallel truth: the session-end atom updates the repo's own `MEMORY.md` (durable, human-readable, in-repo) **and** appends to the central bus (queryable, cross-repo). The bus indexes; `MEMORY.md` remains authoritative per repo.

### Layer 4 — Cross-CLI discovery in every repo
- [ ] Every repo carries `AGENTS.md` + `.claude/` + `.cursor/rules` + `.gemini/` that point back to the same Starlight registry + write contract, so any harness in any repo knows the mesh exists and how to report into it.

### Layer 5 — Scheduled reconciliation + drift digest
- [ ] A cloud Routine (this environment's trigger infra) runs poller → **`MEMORY.md` sweep** (the `GEMINI.md` global-state mandate) → consolidation → drift check, then **DMs Frank a daily "what changed across all repos" digest**. Obeys the durable-output-sink law — never report-only into run-history.

---

## 5. What to CREATE / INSTALL / WIRE — the checklist

**CREATE**
- `context/repo-registry.json` ✅ (this session)
- `scripts/org-poller.mjs` — Node org-discovery + merge poller
- `memory/bus/` committed JSONL store + append helper
- session-end atom schema + per-harness writers
- cross-repo daily-digest Routine

**INSTALL**
- GitHub App / org webhook on `frankxai`
- write-contract stub (`AGENTS.md` pointer + `.claude/` + `.cursor/rules` + `.gemini/`) into every repo missing one
- one scheduled Routine in the cloud environment

**WIRE**
- memory bus → committed JSONL in Starlight (not `~/.claude` local)
- every harness config file → the registry
- PR-activity subscription for the live parallel builds
- **add `ana-ai-business-kit` + `rova-resort` into session scope + registry** (blocked: not in current repo scope — needs Frank to authorize `add_repo`, see §6)

---

## 6. Open decisions for Frank (can't be defaulted)

1. **Scope** — `ana-ai-business-kit` and `rova-resort` are outside this session's repo scope; I can't read or wire them until they're added. Authorize `add_repo`?
2. **Memory store** — start with committed JSONL in Starlight (zero infra, git-versioned) or go straight to AgentDB/Supabase (queryable, scales)? Recommendation: JSONL now, migrate at volume.
3. **Webhook host** — where does the ingest endpoint live (Vercel function on frankx.ai, a small worker, or poll-only for now)? Recommendation: poll-only Layer 1 first (no infra), add webhook when realtime matters.

---

*Built on SIP. This doc is itself a memory atom: the next session — any harness — reads it to know the mesh's real state.*
