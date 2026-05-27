# PREFLIGHT — 2026-05-27 (T-1 day to Madrid)

> Binary green/red checklist for Thursday 2026-05-28 Google AI Live Madrid.
> Frank reads this aloud T-2h to airport per Excellence Plan Task E1.
>
> **Tier:** operational. **Built on SIP.**

---

## Top-line verdict (will be updated as checks complete)

| Check | Status | Verdict |
|---|---|---|
| B1 GEMINI_API_KEY | **RED** ❌ | Provision new key before relying on Gemini live gen |
| B2 Demo URLs (5) | **GREEN** ✅ | All hand-out URLs render HTTP 200 |
| B3 Cockpit boot | **DEFERRED** | Frank-action Wed AM (60s check; see § B3) |
| B5 Eval suite | **GREEN** ✅ | 34/34 risk evals pass · p@10 = 20% (5/22) — both cite-worthy with right framing |
| Public-surface audit | _running_ | Result lands in `PUBLIC-SURFACE-AUDIT-2026-05-27.md` |
| Antigravity inventory | **GREEN** ✅ | 5-month dog-foot, 12 brains, last live 5/22 — Frank is operator, not waitlist |

---

## B1 — GEMINI_API_KEY format + live smoke

**Status: RED** ❌

**Finding:** Current `GEMINI_API_KEY` env var contains an **OpenRouter-format key** (73 chars, prefix `sk-or-v1-`), NOT a valid Gemini API key (39 chars, prefix `AIza`).

This was predicted by global `~/.claude/CLAUDE.md` Doctrine 4 (2026-05-18 audit) — the slot was suspected of holding an OpenRouter key mis-pasted into the Gemini variable. **Now confirmed.**

**Impact:**
- Live Gemini / NB2 / Veo / Imagen calls from this machine will fail with 401/403.
- The multimodal-demo specialist path in `MADRID-2026-05-28-DEMO-RUNBOOK.md § 3` is currently OFF.
- The OpenRouter route to Gemini models (`openai/gemini-3-pro` via OpenRouter) still works — but Frank cannot say "live Gemini API call" with this key.

**Fix (~3 minutes):**

```pwsh
# Step 1: Open the AI Studio key page in browser
start https://aistudio.google.com/apikey

# Step 2: Create a new API key (free tier OK), copy the 39-char AIza... value

# Step 3: Set it as User-scope env var (replace AIza...REPLACE...)
[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIza...REPLACE...', 'User')

# Step 4: Open a NEW PowerShell window (env vars only refresh in new sessions)
# Step 5: Verify format
powershell -NoProfile -Command '$key = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY","User"); Write-Output ("len=" + $key.Length + " prefix=" + $key.Substring(0,4))'
# Expected: len=39 prefix=AIza

# Step 6: Live smoke test
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$env:GEMINI_API_KEY" | Select-Object -First 1
# Expected: JSON starting with {"models":[...
```

**After rotation:** flip this section's status to GREEN in PREFLIGHT.

**Reversibility:** the suspect OpenRouter-shaped key is preserved in `~/.claude/CLAUDE.md` Doctrine 4 audit notes — but practically, the User env var slot was wrong; overwriting it is the fix, not a destructive operation.

---

## B2 — Demo URLs render check

**Status: GREEN** ✅ (all 5 URLs return HTTP 200, verified 2026-05-27)

| URL | HTTP | Use as |
|---|---|---|
| `https://starlightintelligence.org/research/memory-foundations` | 200 | Primary handout for research-heavy Google folk |
| `https://starlightintelligence.org/architecture` | 200 | Architecture overview, 10-IS map |
| `https://frankx.ai/workshops/build-first-ai-agent` | 200 | Workshop landing, ADK enterprise lane |
| `https://www.frankx.ai/guides/agent-card-a2a-spec` | 200 | Killer Google-facing artifact (A2A wire-level guide) |
| `https://www.frankx.ai/partnerships/google` | 200 | For Cloud Partner Advantage contacts |

**Note:** frankx.ai routes 307 → www.frankx.ai. That's a normal apex-to-www redirect, not a problem. Both `frankx.ai/...` and `www.frankx.ai/...` work for hand-out.

**Content + voice scan:** running in background T2 audit agent. Verdict lands in `PUBLIC-SURFACE-AUDIT-2026-05-27.md`.

---

## B3 — Cockpit clean-boot test (DEFERRED — Frank action Wed AM, ~3 min)

**Why deferred:** known footgun `feedback_cockpit_holds_3007` — cockpit auto-start can lock port :3007 even when stopped. Running this test in an automated background while eval suite + agents run risks compounding the lock. Better to run it Wed morning when Frank can watch + recover.

**Procedure (Wed AM, before leaving for airport):**

```pwsh
# Step 1: Check :3007 free
netstat -ano | findstr :3007
# Expected: empty output. If you see a PID, kill it first:
#   Stop-Process -Id <PID-from-netstat> -Force
#   Remove-Item -Recurse -Force C:\Users\frank\Starlight-Intelligence-System\cockpit\.next

# Step 2: Boot cockpit
cd C:\Users\frank\Starlight-Intelligence-System
pnpm run cockpit
# Wait ~30 seconds for SSE stream to come live

# Step 3: Open in browser
start http://localhost:3007/
# Expected: page renders, no console errors

# Step 4: Clean shutdown
# Ctrl-C in the cockpit terminal, then verify port released:
netstat -ano | findstr :3007
# Expected: empty
```

**Verdict matrix:**
- All 4 steps clean → **GREEN** — cockpit demo path available Thursday as last-resort
- Boot fails → **RED** — cockpit demo path OFF; default to browser demos only (§ B2 URLs)
- Boot works but shutdown doesn't release port → **YELLOW** — boot path available but document the kill-PID procedure in pocket reference

---

## B5 — SIS eval suite — **GREEN** ✅

**Two cite-worthy numbers:**

1. **Track D risk-dimension correctness: 34/34 pass · 0 fail · 7 todo** (measured 2026-05-27 via `node tools/run-v01-evals.mjs`)
2. **Retrieval precision@10: 20.0%** (measured 2026-05-22; corpus unchanged since; cite with the date)

**Framing per audience:**
- Risk discipline / quality / governance question → cite 34/34
- DeepMind / retrieval / Vertex / RAG question → cite p@10 = 20% with honest floor framing ("hashing-TF on 520 atoms; ceiling 65-75% post-sentence-transformer swap")

Full data: `docs/ops/SIS-EVAL-2026-05-27.md` + `SIS-EVAL-2026-05-27.txt` (TAP stdout).

---

## Public-surface audit (running in background)

T2 agent auditing 11 high-leverage routes across frankx.ai + starlightintelligence.org.

Checking:
- HTTP status (must be 200; 307 chain OK if logged)
- Voice violations (banned phrases per `MASSIVE_ACTION_PLAN.md` + Excellence Plan voice rules)
- Stale dates (2026-Q1 visible in "Last updated" fields)
- Internal link rot
- Missing critical meta (description, og:image, title)

Result lands in `PUBLIC-SURFACE-AUDIT-2026-05-27.md` with P0/P1/P2 fix list.

---

## Antigravity inventory — **GREEN** ✅

**Finding:** Frank has been actively dog-fooding Antigravity IDE since 2025-12-07 (~5 months). 12 conversations + 12 project brains with real artifacts. Last live activity 2026-05-22 (5 days ago). Onboarding complete. Python SDK plugin installed. 26 substrate-level references across CLAUDE.md, AGENTS.md, platform adapters.

**Madrid posture:** Lead with "installed-and-dog-fooded" — not "pursuing access." Frank can speak as a 5-month native operator with persistent brain state.

**Pre-Madrid action (10-15 min, Wed):** Open the IDE, resume the May 22 brain, run one fresh agent turn, screenshot the result into `artifacts/madrid-demo/antigravity-fresh-session.png`. Frank can then truthfully say "I ran a fresh Antigravity session yesterday" at Madrid.

**Important dependency:** Antigravity SDK auth depends on `GEMINI_API_KEY`. The B1 RED finding means demos through Antigravity will fail until the key is rotated. Order of operations: rotate key (B1) → warm Antigravity IDE → ship screenshot.

Full inventory: `docs/ops/ANTIGRAVITY-INVENTORY-2026-05-27.md`.

---

## Deploy-state audit (additional finding 2026-05-27)

- `frankx-prod-sync` local is **5 commits BEHIND origin/main** with 3 uncommitted local files (`app/library/page.tsx M`, `app/build/` untracked, `data/bv-ops.json` untracked). Live site deploys from `origin/main` (per Vercel project `prj_NHVIKZ...`), so this does NOT affect live URL state. **But Wed AM hygiene:** `cd C:/Users/frank/frankx-prod-sync && git fetch origin && git status` so Frank can see what changed remotely and whether the local uncommitted files matter.
- `Starlight-Intelligence-System` site/ — latest commit `bf42dae` (memory foundations research surface). Working tree clean per `git status`.

**Verdict:** GREEN — Madrid-relevance is low. Live URLs are stable.

---

## Summary matrix for Thursday morning (T-2h to airport)

To be filled in as background tasks complete. Frank reads aloud per Excellence Plan Task E1.

```
| Check          | Wed result | Thu posture                                      |
|----------------|------------|--------------------------------------------------|
| B1 Gemini key  | RED        | Provision new key OR multimodal demo OFF        |
| B1 Gemini key  | GREEN      | Multimodal demo path AVAILABLE                  |
| B2 URLs (5/5)  | GREEN      | All 5 URLs in hand-out rotation                 |
| B3 Cockpit     | _Wed AM_   | Run procedure; default browser-only if RED      |
| B5 Eval        | _running_  | Cite measured numbers from SIS-EVAL doc         |
| Audit P0       | _running_  | Block-fix or accept; informs hand-out confidence|
| Antigravity    | _running_  | GREEN→dog-foot / YELLOW→workspace / RED→pursuing|
```

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
*Generated 2026-05-27 by Claude (T1 main thread) + background agents (T2). Falsifier: if any GREEN check above is wrong on Thursday morning, this preflight failed at verification, not at structure.*
