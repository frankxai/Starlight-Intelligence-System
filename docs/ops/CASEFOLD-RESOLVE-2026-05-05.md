---
title: Casefold-ghost investigation — `~/.arcanea/arcanea/` vs `~/Arcanea/`
date: 2026-05-05
sprint: SIS-2026-W19
sweep: S2 (skill ecosystem reset)
audit-ref: memory/sprints/audits/2026-05-04-portfolio-audit.md § Skill ecosystem (Audit D)
verdict: NOT-A-GHOST · two distinct repos · no deletion required
---

# Casefold-ghost investigation — Audit D follow-through

## TL;DR

**Verdict: NOT a casefold ghost. These are two distinct git repositories.** No deletion. The naming similarity is coincidence (both projects called "arcanea") plus Windows/NTFS being case-insensitive at the filesystem layer.

## Evidence

### Path 1 — `C:\Users\frank\Arcanea\` (the active arcanea-ai-app repo)

```
.git/HEAD                       : ref to feat/cockpit-2026-05-05
HEAD commit                     : bd83e552 (2026-05-05 02:03)
remote origin                   : https://github.com/frankxai/arcanea-ai-app.git
remote oss                      : https://github.com/frankxai/arcanea.git
remote records                  : https://github.com/frankxai/arcanea-records.git
top-level entries               : 96 dirs (e.g. apps/, packages/, .changeset/, book/, agents/...)
.claude/skills/ recursive count : 250 .md files
git status                      : 51 dirty entries (active WIP — book chapters, intake, planning)
```

### Path 2 — `C:\Users\frank\.arcanea\arcanea\` (a separate older repo)

```
.git/HEAD                       : ref to a different SHA
HEAD commit                     : 83b05d6a (2026-01-27 — 3+ months stale)
remote origin                   : https://github.com/frankxai/arcanea.git    (NOT arcanea-ai-app)
top-level entries               : 36 dirs (e.g. Arcanea/, Arcanean Academy/, agents/, packages/, supabase/)
.claude/skills/ recursive count : 87 .md files
git status                      : 1 dirty entry
```

### Comparison

| Property | `C:\Users\frank\Arcanea\` | `C:\Users\frank\.arcanea\arcanea\` |
|---|---|---|
| Origin remote | `arcanea-ai-app.git` | `arcanea.git` (different repo!) |
| HEAD commit | bd83e552 (2026-05-05) | 83b05d6a (2026-01-27) |
| `.git/HEAD` SHA256 | byte-different from Path 2 | byte-different from Path 1 |
| `.git/config` SHA256 | `3484...D2FC` | `B272...6A67` (different) |
| Top-level dirs | 96 | 36 |
| Skills .md count | 250 | 87 |
| Has `book/`, `apps/web/`, etc | yes (active product) | no |
| Has `Arcanean Academy/` etc | no | yes (older world-building repo) |

**These two trees have different content, point to different remote repos, sit at different commits, and have completely different folder structures.** They are not the same content surfaced under two paths.

## Decision

**NEITHER directory is a redundant casefold ghost. NO deletion required.**

The audit's framing of "`~/.arcanea/arcanea/` and `~/Arcanea/` may be the same content surfaced as two physical directories" was a reasonable hypothesis worth checking — but the byte-level evidence falsifies it. Both trees exist intentionally:

- `~/Arcanea/` is the active arcanea-ai-app (frequently committed, currently on `feat/cockpit-2026-05-05`, with heavy WIP).
- `~/.arcanea/arcanea/` is a snapshot/local of the older `frankxai/arcanea` (last touched January 2026; appears largely abandoned but contains the legacy world-building corpus — `Arcanean Academy/`, `Arcanea Big Vision/`, `Arcanea Framer Landing Pages/`, etc.).

The `~/.arcanea/` parent directory is ALSO not a ghost — it hosts the runtime state of an Arcanea desktop/CLI agent (`.arcanea/db/`, `.arcanea/sessions/`, `.arcanea/voice-inbox/` etc.), separate concerns entirely.

## Recommendation for SIS Queen / Frank

1. **Do nothing destructive.** Both trees serve a purpose.
2. **If one is desired to be retired**, the legacy one (`~/.arcanea/arcanea/`) is the candidate — but only after confirming:
   - No local-only commits beyond HEAD (`git log origin/main..HEAD` should return empty),
   - No untracked files of value (`git status --porcelain` shows 1 entry — review it),
   - Frank confirms the corresponding GitHub repo `frankxai/arcanea.git` is either archived or not the source-of-truth for the Arcanean world-building corpus that lives in subdirectories.
3. **If retained**, optionally rename `~/.arcanea/arcanea/` to `~/.arcanea/arcanea-legacy/` for clarity — but this is cosmetic; nothing depends on the path.

This investigation is read-only. **Sweep S2 final worker did not modify anything in either tree.**

## Out of scope (not investigated this run)

- Whether other `~/.arcanea/*` subdirs (app-windows, db, gallery, etc.) are stale or active runtime state.
- Whether `~/Arcanea/clawhub-staging/`, `~/Arcanea/arcanea-flow/`, `~/Arcanea/oh-my-arcanea/` (visible nested git repos in the active Arcanea tree) are healthy.
- The audit's other Sweep S2 items (FM backfill on 25 SIS legacy skills, FM backfill on 3 People IS skills, v76 FM-presence assertion, 18 disk-orphan documentation) — those were prior workers' scope.

## Cross-ref

- Audit: `memory/sprints/audits/2026-05-04-portfolio-audit.md` § Skill ecosystem (Audit D), § Reversals item 5
- Sync ship: `tools/sync-arcanea-skills.ps1` (committed alongside this doc)
- Sweep S2 final worker entry: SIS-2026-W19 sprint log

---

*Built on SIP — operational tier · investigation-of-record · 2026-05-05 · read-only*
