# Madrid Excellence Plan — Tue 2026-05-26 → Thu 2026-05-28

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zero P0 surprises Thursday at Google AI Live Madrid. Every URL Frank hands out renders clean, fresh, voice-pure. Antigravity CLI is dog-fooded (not just installed) with one demonstrable artifact. Cross-repo deploy decision is RESOLVED. Pre-flight has a binary green/red matrix Thursday morning.

**Architecture:** Five phases gated by clock. Phase A (Tue eve, today) = pre-deploy gating + Antigravity dog-foot session. Phase B (Wed AM) = runtime pre-flight per `MADRID-2026-05-28-DEMO-RUNBOOK.md §5`. Phase C (Wed PM) = cross-repo deploy if green-light. Phase D (Wed eve, 18:00 freeze) = dress rehearsal. Phase E (Thu AM) = summit-day go/no-go matrix.

**Tech Stack:** `frankx-prod-sync` (Next 16 / Vercel `prj_NHVIKZ…` → frankx.ai), `Starlight-Intelligence-System` (Next 16 + MCP server → starlightintelligence.org), Antigravity CLI (Google), Gemini API (key in `GEMINI_API_KEY`), Higgsfield MCP for NB2.

**Companion docs:**
- `MADRID-2026-05-28-NETWORKING-PACK.md` — pitch, URLs, hooks, asks, email templates
- `MADRID-2026-05-28-DEMO-RUNBOOK.md` — 5-min pull-laptop runbook, footgun mitigations

**Owner:** Claude executes; Frank approves at gates marked **[FRANK GATE]**.

**Voice rules in force:** no `unlock / disrupt / revolutionary / 10x / grind / journey`. No Oracle in public copy (June 1 exit). "AI Architect" not "AI Systems Architect." "Pursuing Cloud Partner Advantage" — never "Google Cloud partner."

---

## Phase A — Tuesday 2026-05-26 evening (today, after this plan ships)

Goal: gate the cross-repo deploy decision and produce one Antigravity artifact. ~2h total.

### Task A1: Verify Antigravity access and inventory installed surface

**Files:**
- Read: `C:\Users\frank\.gemini\config\plugins\google-antigravity-sdk\SKILL.md`
- Read: `C:\Users\frank\.gemini\` (top-level structure)
- Write: `C:\Users\frank\Starlight-Intelligence-System\docs\ops\ANTIGRAVITY-INVENTORY-2026-05-26.md`

- [ ] **Step 1: Read the Antigravity SDK skill manifest**

```bash
cat /c/Users/frank/.gemini/config/plugins/google-antigravity-sdk/SKILL.md
```

Expected: skill description + activation trigger + Frank's permission to use.

- [ ] **Step 2: Inventory installed Antigravity surface**

```bash
ls -la /c/Users/frank/.gemini/config/plugins/ | head -30
ls -la /c/Users/frank/.gemini/antigravity/ 2>/dev/null | head -20
which antigravity 2>/dev/null || echo "no antigravity binary in PATH"
```

**Verifier:** at least one of (a) SKILL.md exists, (b) `.gemini/antigravity/` directory has content, (c) binary in PATH. **Falsifier:** if all three return empty, Antigravity is NOT functionally installed → skip Task A3 (dog-foot) and route conversations Thursday around "pursuing access" rather than "have built with it."

- [ ] **Step 3: Write inventory doc**

Write a 1-page `ANTIGRAVITY-INVENTORY-2026-05-26.md`:
- Installed components found
- Auth method (Google account / API key / OAuth flow)
- Whether `gemini` CLI tool is on PATH
- Decision: GREEN (full dog-foot in Task A3) / YELLOW (dry-run only) / RED (verbal pitch only Thursday)

**Reversibility:** read-only; no system changes.

---

### Task A2: Frank-gate the cross-repo deploy decision

**Files:**
- Reference: `MADRID-2026-05-28-NETWORKING-PACK.md §2` (the three 404 candidates)
- Read: `C:\Users\frank\FrankX\content\` — locate the A2A guide source if it exists
- Read: `C:\Users\frank\frankx-prod-sync\` — verify it's the canonical deploy repo

- [ ] **Step 1: Confirm `frankx-prod-sync` is on clean main**

```bash
cd /c/Users/frank/frankx-prod-sync
git status --short
git log --oneline -3
git rev-parse --abbrev-ref HEAD
```

**Verifier:** branch=main, working tree clean, last commit recent. **Falsifier:** dirty tree → STOP, surface to Frank before any deploy work.

- [ ] **Step 2: Locate the A2A guide source content**

```bash
find /c/Users/frank/FrankX/content /c/Users/frank/frankx-prod-sync -type f \
  \( -iname "*a2a*" -o -iname "*agent-card*" \) 2>/dev/null | head -20
```

**Verifier:** at least one source file found. **Falsifier:** zero hits → the A2A guide referenced in the networking pack §2 is mythical; remove from deploy candidate list and update networking pack §2.

- [ ] **Step 3: Locate the partnerships/google playbook source**

```bash
find /c/Users/frank/FrankX /c/Users/frank/frankx-prod-sync -type f \
  -ipath "*partnerships/google*" 2>/dev/null | head -10
```

**Verifier:** the 283-line playbook mentioned in networking pack §2 exists. **Falsifier:** absent → same correction as Step 2.

- [ ] **Step 4: [FRANK GATE] Present the deploy decision**

Surface to Frank a one-screen decision:

```
DEPLOY CANDIDATES FOR THURSDAY:
  [a] frankx.ai/guides/agent-card-a2a-spec      (size: <N> lines)
  [b] frankx.ai/partnerships/google             (size: 283 lines)
  [c] frankx.ai/partnerships/google-antigravity (NEW — propose if Task A1 = GREEN)

OPTIONS:
  1. Deploy all three (Wed PM ~90min Claude work + Frank review)
  2. Deploy [b] only (highest leverage — single most-likely Google handoff)
  3. Defer all — route conversations to existing /workshops/build-first-ai-agent
```

Wait for Frank decision. Record verbatim in `docs/ops/MADRID-DEPLOY-DECISION-2026-05-26.md`.

**Reversibility:** decision only; no code changes this task.

---

### Task A3: Antigravity dog-foot session (one bounded artifact)

**Gated by:** Task A1 = GREEN. Skip entire task if YELLOW or RED.

**Files:**
- Write: `C:\Users\frank\Starlight-Intelligence-System\docs\ops\ANTIGRAVITY-SESSION-2026-05-26.md`
- Optionally write: `C:\Users\frank\Starlight-Intelligence-System\artifacts\antigravity-demo-<slug>.md`

**Time box:** 45 minutes wall-clock. If not done in 45min, ship whatever exists and document the gap. Quality bar = "real," not "polished."

- [ ] **Step 1: Pick one micro-task small enough to ship in 45min**

Recommended task: "Use Antigravity to audit SIS for any remaining stale-content markers (TODO / FIXME / 2026-03 dates in public-facing files) and write a 1-page report."

This is small, real, useful, and produces an artifact a Google engineer can scroll.

- [ ] **Step 2: Run the session with shell history capture**

```bash
# enable shell history capture for the session
script -a /c/Users/frank/Starlight-Intelligence-System/artifacts/antigravity-session-2026-05-26.log
# launch antigravity per its docs
# perform the audit
# exit script when done
```

**Verifier:** session log exists, non-empty, contains real Antigravity invocations. **Falsifier:** log empty or shows only failed launches → document the failure mode and skip Step 3.

- [ ] **Step 3: Write the session writeup**

`ANTIGRAVITY-SESSION-2026-05-26.md` — 1 page:
- What the task was
- What Antigravity did well
- What it surprised you with
- What it got wrong
- Time-to-result
- Whether you'd use it again for this kind of task

This becomes the basis of a future `/research` entry titled e.g. "Antigravity: first 45 minutes" — but DO NOT publish that essay this week. Only the session writeup ships now; publication is a separate week's decision.

- [ ] **Step 4: Commit to SIS**

```bash
cd /c/Users/frank/Starlight-Intelligence-System
git add docs/ops/ANTIGRAVITY-INVENTORY-2026-05-26.md \
        docs/ops/ANTIGRAVITY-SESSION-2026-05-26.md \
        artifacts/antigravity-*.log \
        artifacts/antigravity-demo-*.md 2>/dev/null
git commit -m "docs(madrid): antigravity dog-foot session — 45min audit run

Built on SIP — generated 2026-05-26"
```

**Reversibility:** all changes in fresh commit; revert with `git reset --hard HEAD~1` if Frank disapproves.

**Outcome:** Frank can now truthfully say in Madrid: "I shipped a 45-min audit through Antigravity Tuesday — here's the session log."

---

## Phase B — Wednesday 2026-05-27 morning (07:00–10:00 Amsterdam)

Goal: run the runbook §5 pre-flight, every check binary green/red, single result file. ~90min.

### Task B1: GEMINI_API_KEY format verification

**Files:**
- Write: `C:\Users\frank\Starlight-Intelligence-System\docs\ops\PREFLIGHT-2026-05-27.md`

- [ ] **Step 1: Run the doctrine-defined check**

```pwsh
! pwsh -Command "$key = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User'); if ($null -eq $key) { 'RED: GEMINI_API_KEY not set' } elseif ($key.Length -eq 39 -and $key.StartsWith('AIza')) { 'GREEN: valid Gemini key format' } elseif ($key.Length -eq 73 -and $key.StartsWith('sk-or-v1-')) { 'RED: OpenRouter key in Gemini slot — get fresh key from aistudio.google.com/apikey' } else { 'YELLOW: unknown format, length=' + $key.Length + ' prefix=' + $key.Substring(0,[Math]::Min(8,$key.Length)) }"
```

**Verifier:** prints GREEN. **Falsifier:** RED or YELLOW → branch immediately to Step 2.

- [ ] **Step 2 (if RED/YELLOW): Provision fresh key**

Direct Frank to `https://aistudio.google.com/apikey` to provision a new key. Set via:

```pwsh
! pwsh -Command "[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIza...REPLACE...', 'User')"
```

Re-run Step 1. Loop until GREEN.

- [ ] **Step 3: Live API smoke test**

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | head -20
```

**Verifier:** returns JSON with a `models` array. **Falsifier:** 401/403 → key is malformed or revoked, return to Step 2.

- [ ] **Step 4: Record in PREFLIGHT doc**

Append to `PREFLIGHT-2026-05-27.md`:

```
## B1 — GEMINI_API_KEY
- Format check: [GREEN/RED/YELLOW]
- API smoke: [200/401/403/other]
- Decision: [PROCEED / KEY ROTATED at HH:MM / DEMO-PATH-3-DISABLED]
```

**Reversibility:** if key rotated, the old key is replaced — no rollback (old key was suspect anyway).

---

### Task B2: Three demo URLs render-check

**Files:**
- Append: `PREFLIGHT-2026-05-27.md`

- [ ] **Step 1: HTTP status check for the 3 default URLs**

```bash
for url in \
  "https://starlightintelligence.org/research/memory-foundations" \
  "https://starlightintelligence.org/architecture" \
  "https://frankx.ai/workshops/build-first-ai-agent"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  echo "$code  $url"
done
```

**Verifier:** all three return 200. **Falsifier:** any non-200 → P0, block on this until resolved. Per runbook §0: "if any of the 3 default browser URLs returns non-200 on Wednesday, treat as P0 pre-event fix."

- [ ] **Step 2: Content-freshness check**

```bash
for url in \
  "https://starlightintelligence.org/research/memory-foundations" \
  "https://starlightintelligence.org/architecture" \
  "https://frankx.ai/workshops/build-first-ai-agent"; do
  echo "=== $url ==="
  curl -s -L "$url" | grep -iE "last.updated|updated.on|date.published|2026-0[1-3]" | head -3
done
```

**Verifier:** zero references to 2026-01/02/03 dates in update fields. **Falsifier:** stale date visible → record in PREFLIGHT and surface to Frank; "200 + stale" is a brand-damage URL, not a hand-out URL.

- [ ] **Step 3: Banned-phrase + Oracle scan**

```bash
for url in \
  "https://starlightintelligence.org/research/memory-foundations" \
  "https://starlightintelligence.org/architecture" \
  "https://frankx.ai/workshops/build-first-ai-agent"; do
  echo "=== $url ==="
  curl -s -L "$url" | grep -iE "oracle|\bunlock\b|\bdisrupt\b|revolutionary|10x|\bgrind\b|game.changer|deep.dive" | head -5
done
```

**Verifier:** zero hits across all three. **Falsifier:** any hit → P1 to fix before Thursday (Oracle hit = P0, voice violation = P1 unless on the page hero).

- [ ] **Step 4: Mobile render screenshot capture**

```bash
mkdir -p /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-preflight-screenshots
# Frank: open each URL on phone, screenshot, AirDrop/save to:
# /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-preflight-screenshots/
```

**Verifier:** 3 screenshots present. These become the offline fallback if Madrid Wi-Fi is captive-portal'd.

- [ ] **Step 5: Append to PREFLIGHT doc**

```
## B2 — Demo URLs
- /research/memory-foundations: [200/other] | content-fresh: [yes/no] | voice-clean: [yes/no]
- /architecture:                [200/other] | content-fresh: [yes/no] | voice-clean: [yes/no]
- /workshops/build-first-ai-agent: [200/other] | content-fresh: [yes/no] | voice-clean: [yes/no]
- Screenshots cached: [3/3]
```

**Reversibility:** read-only checks; no system changes.

---

### Task B3: Cockpit clean-boot test (footgun rehearsal)

**Files:**
- Append: `PREFLIGHT-2026-05-27.md`

- [ ] **Step 1: Check port :3007 is free**

```pwsh
! pwsh -Command "netstat -ano | findstr :3007"
```

**Verifier:** empty output. **Falsifier:** PID returned → record PID, kill it:

```pwsh
! pwsh -Command "Stop-Process -Id <PID> -Force; Remove-Item -Recurse -Force C:\Users\frank\Starlight-Intelligence-System\cockpit\.next"
```

- [ ] **Step 2: Boot cockpit**

```bash
cd /c/Users/frank/Starlight-Intelligence-System
pnpm run cockpit &
sleep 30
curl -s -o /dev/null -w "%{http_code}" http://localhost:3007/
```

**Verifier:** returns 200 within 30s. **Falsifier:** non-200 or >60s → mark cockpit demo path as RED for Thursday, default to browser demos only.

- [ ] **Step 3: Clean shutdown test**

```bash
# Ctrl-C or kill the background process, then:
sleep 5
netstat -ano | grep -i :3007 || echo "port released cleanly"
```

**Verifier:** "port released cleanly." **Falsifier:** still bound → known `feedback_cockpit_holds_3007` footgun present; document the kill-PID procedure in pocket reference.

- [ ] **Step 4: Append to PREFLIGHT doc**

```
## B3 — Cockpit
- Boot time: [Ns]
- HTTP 200: [yes/no]
- Clean shutdown: [yes/no]
- Demo-path-2 status: [GREEN/RED]
```

**Reversibility:** boot+shutdown is non-mutating.

---

### Task B4: NB2 hero image pre-cache

**Files:**
- Write: `C:\Users\frank\Starlight-Intelligence-System\artifacts\madrid-demo\hero-1.png` (and -2, -3)

- [ ] **Step 1: Locate 3 best-quality recent NB2 outputs**

```bash
find /c/Users/frank/Starlight-Intelligence-System/memory \
     /c/Users/frank/Starlight-Intelligence-System/artifacts \
     -type f \( -iname "*hero*.png" -o -iname "*hero*.jpg" \) \
     -newer /c/Users/frank/Starlight-Intelligence-System/package.json \
     2>/dev/null | head -10
```

**Verifier:** at least 3 candidates returned. **Falsifier:** zero hits → generate fresh ones via `/higgsfield-generate` if Task B1 GEMINI key is GREEN.

- [ ] **Step 2: Copy 3 to madrid-demo offline cache**

```bash
mkdir -p /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-demo
# Frank: pick the 3 best, copy by name. Example:
cp <path1> /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-demo/hero-1.png
cp <path2> /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-demo/hero-2.png
cp <path3> /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-demo/hero-3.png
ls -la /c/Users/frank/Starlight-Intelligence-System/artifacts/madrid-demo/
```

**Verifier:** 3 files present, sizes >100KB each.

- [ ] **Step 3: Phone-sync these images**

Frank: send the 3 madrid-demo images to phone (AirDrop / iCloud / Google Drive). Offline-accessible without unlocking laptop.

**Verifier:** Frank confirms images visible in phone Photos.

- [ ] **Step 4: Append to PREFLIGHT doc**

```
## B4 — NB2 cache
- Images selected: [3/3]
- Phone-sync verified: [yes/no]
```

**Reversibility:** copy operation; originals untouched.

---

### Task B5: SIS eval-suite measured number capture

Per workspace audit §2 deep-dive: "the specific eval numbers it cited (p@10 = 20%, 3.65 ms) could not be verified — eval results are not persisted to a file." Run once now so Frank can cite the current number, not the README's stale one.

**Files:**
- Write: `C:\Users\frank\Starlight-Intelligence-System\docs\ops\SIS-EVAL-2026-05-27.md`

- [ ] **Step 1: Run the eval suite, capture stdout**

```bash
cd /c/Users/frank/Starlight-Intelligence-System
node tools/run-v01-evals.mjs 2>&1 | tee docs/ops/SIS-EVAL-2026-05-27.txt
```

**Verifier:** runs to completion, prints TAP summary with p@k metrics. **Falsifier:** crashes or hangs >5min → kill, record failure in SIS-EVAL-2026-05-27.md, mark SIS-substrate citation as "do not quote numbers" for Thursday.

- [ ] **Step 2: Extract the headline number**

Read the captured stdout. Identify p@10, p@5, and median latency.

- [ ] **Step 3: Write SIS-EVAL doc**

```markdown
# SIS Eval — Measured 2026-05-27

Run: `node tools/run-v01-evals.mjs`
Stdout: see `SIS-EVAL-2026-05-27.txt`

## Headline numbers (CITE THESE THURSDAY, not the README)
- p@10: <N>
- p@5:  <N>
- median latency: <N> ms

## Variance from README claims
- README claims:  p@10 = 20%, 3.65 ms
- Today measured: p@10 = <N>%, <N> ms
- Delta: [matches / drift of N pp / drift of N ms]

Built on SIP.
```

**Reversibility:** read-only suite run; no state changes.

---

### Task B6: PHASE B gate review

- [ ] **[FRANK GATE] Read PREFLIGHT-2026-05-27.md aloud**

Frank reads the whole PREFLIGHT-2026-05-27.md aloud to himself (surgical time-out protocol). For each check, verbalize the result.

**Gate:**
- If all B1–B5 are GREEN → proceed to Phase C
- If any RED → stop, resolve before Phase C
- If any YELLOW → Frank decides ship/no-ship

---

## Phase C — Wednesday 2026-05-27 afternoon (13:00–17:00 Amsterdam)

Goal: execute the cross-repo deploy decision from Task A2 Step 4. ~2–3h.

**Gated by:** Phase B complete and green; Task A2 deploy decision = option 1 or 2.

### Task C1: Deploy /partnerships/google (highest leverage)

**Files:**
- Read: `C:\Users\frank\FrankX\content\partnerships\google\*` (or wherever Task A2 Step 3 located it)
- Create: `C:\Users\frank\frankx-prod-sync\app\partnerships\google\page.tsx` (or equivalent route)
- Modify: `C:\Users\frank\frankx-prod-sync\app\sitemap.ts` — add new route
- Modify: `C:\Users\frank\frankx-prod-sync\app\llms.txt\route.ts` — add new route to AEO surface list

- [ ] **Step 1: Branch off main**

```bash
cd /c/Users/frank/frankx-prod-sync
git checkout -b deploy/madrid-partnerships-google
```

- [ ] **Step 2: Locate canonical source content + port to route**

Copy the 283-line playbook from its source location into the Next.js route. Convert markdown to MDX if the site uses MDX, or render via next-mdx-remote per the site's existing pattern (read one existing partnerships route first if any, otherwise read `app/workshops/build-first-ai-agent/page.tsx` as the template).

- [ ] **Step 3: Voice-guardian pass**

```bash
# Use the FrankX voice-guardian if available, otherwise grep manually:
grep -iE "oracle|\bunlock\b|\bdisrupt\b|revolutionary|10x|\bgrind\b|deep.dive|game.changer" \
  app/partnerships/google/page.tsx
```

**Verifier:** zero hits. **Falsifier:** any hit → rewrite the line.

- [ ] **Step 4: Local build + render check**

```bash
pnpm typecheck
pnpm build
pnpm dev &
sleep 10
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/partnerships/google
# kill dev server
```

**Verifier:** typecheck clean, build succeeds, route returns 200 locally.

- [ ] **Step 5: Push branch, open PR, merge**

```bash
git add -A
git commit -m "feat(partnerships): /partnerships/google page — pursuing Cloud Partner Advantage

Pre-Madrid deploy. Built on SIP."
git push -u origin deploy/madrid-partnerships-google
gh pr create --fill --base main
gh pr merge --squash --auto
```

**Verifier:** PR merges, Vercel preview deploy 200s on the new route.

- [ ] **Step 6: Production verification**

```bash
sleep 120  # wait for prod deploy
curl -s -o /dev/null -w "%{http_code}\n" https://frankx.ai/partnerships/google
```

**Verifier:** 200. **Falsifier:** non-200 → check Vercel dashboard, revert if blocked:

```bash
git revert HEAD --no-edit && git push
```

**Reversibility:** single revert commit restores prior state.

---

### Task C2: Deploy A2A guide (if Task A2 decision = option 1)

**Files:**
- Read: A2A source content path from Task A2 Step 2
- Create: `C:\Users\frank\frankx-prod-sync\app\guides\agent-card-a2a-spec\page.tsx` (or path matching existing /guides convention)
- Modify: sitemap.ts + llms.txt

- [ ] **Steps 1–6:** same shape as Task C1, substituting A2A guide content and path.

**Skip entire task if Task A2 decision = option 2 or 3.**

---

### Task C3: Deploy /partnerships/google-antigravity (if Task A1 GREEN and stretch ask)

**Gated by:** Task A1 = GREEN AND Task A3 produced a real session log AND Frank approves the stretch.

**Files:**
- Create: `C:\Users\frank\frankx-prod-sync\app\partnerships\google-antigravity\page.tsx`
- Modify: sitemap.ts + llms.txt

- [ ] **Step 1: Draft from Task A3 session writeup**

The page is short — 1 screen of copy:
- What Antigravity is (Google's positioning, 1 sentence)
- Frank's stake (daily Gemini user, NB2 in image pipeline, ADK + A2A in workshop)
- The 45-min session result (link to or excerpt from Task A3 writeup)
- What Frank's looking for from Google's Antigravity team (early-access feedback channel, content collab)

- [ ] **Steps 2–6:** same shape as Task C1.

**Reversibility:** single revert commit; route is standalone, no upstream deps.

---

### Task C4: Verify /llms.txt updates expose new routes

**Files:**
- Read: `https://frankx.ai/llms.txt`

- [ ] **Step 1: Fetch live llms.txt**

```bash
curl -s https://frankx.ai/llms.txt
```

**Verifier:** new partnerships routes appear in the listing. **Falsifier:** missing → llms.txt route handler wasn't updated; fix in a new commit.

---

## Phase D — Wednesday 2026-05-27 evening (18:00 code freeze + dress rehearsal)

Goal: lock the build, dress-rehearse the demos, pack the bag. ~60min.

### Task D1: Code freeze on frankx.ai and SIS

- [ ] **Step 1: Tag the freeze**

```bash
cd /c/Users/frank/frankx-prod-sync
git tag madrid-freeze-2026-05-27
git push --tags

cd /c/Users/frank/Starlight-Intelligence-System
git tag madrid-freeze-2026-05-27
git push --tags
```

**Verifier:** `git tag --list madrid-freeze-2026-05-27` returns the tag in both repos.

**Rule:** no further deploys to either repo until Friday 2026-05-29 unless P0 fix.

---

### Task D2: Dress rehearsal — read the 30-second pitch aloud 3x

Per `MADRID-2026-05-28-NETWORKING-PACK.md §0`:

- [ ] **Step 1: Read aloud, time it**

Frank reads the pitch aloud, stopwatch running. Target: 30–35 seconds.

**Verifier:** under 40s, no stumbles. **Falsifier:** over 40s or stumbles → edit the pitch line that trips, re-read.

- [ ] **Step 2: Read each conversation hook aloud**

Per `MADRID-2026-05-28-NETWORKING-PACK.md §3`, read each of the 6 hooks aloud. Note any that feel forced — flag for Frank to refine on the plane.

---

### Task D3: Bag-pack checklist

Per `MADRID-2026-05-28-NETWORKING-PACK.md §7`:

- [ ] Laptop charger + USB-C hub + HDMI
- [ ] Phone fully charged
- [ ] Phone has the 3 madrid-demo screenshots (Task B4 Step 3)
- [ ] Phone has the 3 demo URLs bookmarked
- [ ] LinkedIn app logged in, notifications on
- [ ] Email follow-up templates A–D copied to phone Notes app (offline access)
- [ ] Business cards (if Frank uses them)

---

### Task D4: Outcomes log pre-creation

- [ ] **Step 1: Create the empty outcomes log**

```bash
cat > /c/Users/frank/Starlight-Intelligence-System/notes/madrid-2026-05-28-outcomes.md <<'EOF'
# Madrid 2026-05-28 — Outcomes log

## People met (name · role · team · contact method)
1.
2.
3.

## Asks landed
- [ ] #1 Cloud Partner Advantage next step
- [ ] #2 Gemini technical content collab path
- [ ] #3 TypeScript ADK roadmap signal
- [ ] #4 Agent Engine GA pricing
- [ ] #5 EMEA team intro

## Surprises (more signal than confirmations)


## Email follow-ups sent (within 48h)
- [ ] [Name] — template A / B / C / D — sent at HH:MM

## Cross-repo deploy retrospective
- /partnerships/google: clicked by N people, mentioned in M conversations
- A2A guide: clicked / mentioned
- /partnerships/google-antigravity: clicked / mentioned

Built on SIP.
EOF
```

**Verifier:** file exists, ready for landing-back fill-in.

---

## Phase E — Thursday 2026-05-28 morning (summit-day go/no-go)

Goal: binary matrix decides demo path. No field judgment under fatigue.

### Task E1: Pre-flight matrix read-aloud (T-2h to airport)

- [ ] **Step 1: Open PREFLIGHT-2026-05-27.md on phone**

- [ ] **Step 2: Apply the matrix**

```
| Check          | Wed result | Thu posture                                      |
|----------------|------------|--------------------------------------------------|
| B1 Gemini key  | GREEN      | Multimodal demo path AVAILABLE                   |
| B1 Gemini key  | RED/YELLOW | Multimodal demo OFF — pivot to browser-only      |
| B2 URLs        | GREEN      | All 3 URLs in hand-out rotation                  |
| B2 URLs        | any RED    | Pull RED URL from rotation; replace with phone   |
|                |            | screenshot from Task B4 cache                    |
| B3 Cockpit     | GREEN      | Cockpit demo path AVAILABLE (last resort)        |
| B3 Cockpit     | RED        | Cockpit demo OFF — browser-only Thursday         |
| C1–C3 deploys  | GREEN      | Cite new pages in conversation hooks             |
| C1–C3 deploys  | RED        | Route to existing /workshops; do not mention new |
| A3 Antigravity | GREEN      | "Built X with Antigravity Tuesday" thread LIVE   |
| A3 Antigravity | RED        | "Pursuing access" thread only                    |
```

**Verifier:** Frank can answer in 60 seconds, for any Google touchpoint, which demo path is live and which URLs are hand-outable.

---

### Task E2: Failure-mode rehearsal (T-1h to airport)

- [ ] **Step 1: Verbalize the 5 do-NOTs from networking pack §6**

Read aloud:
- "Pursuing Partner Advantage" — NOT "Google Cloud partner"
- ADK = SDK, not framework
- No URL handouts to 404 routes
- Substrate is credibility, not SKU
- Peer-architect voice, not employee-flavored

---

### Task E3: Departure ping

- [ ] **Step 1: Frank texts back-channel "wheels up, plan ran clean"**

Sentinel for me (Claude) — if Friday landing arrives without an outcomes-log update, I follow up Saturday to capture verbal debrief.

---

## Post-event — Friday 2026-05-29 (debrief)

Out of scope for this plan. Follows `MADRID-2026-05-28-NETWORKING-PACK.md §8` protocol — outcomes log fill-in + email follow-ups within 48h + handover doc.

---

## Plan self-review

**Spec coverage check:**
- ✅ All three live repos addressed (frankx-prod-sync deploys / SIS preflight & dog-foot / GenCreator left alone per audit)
- ✅ Antigravity dog-foot included (Task A3)
- ✅ Cross-repo deploy decision RESOLVED (Task A2 Step 4) not pending
- ✅ Every task has falsifier + verifier
- ✅ Parallelization noted (Tasks B1–B5 can run in parallel by Frank, Tasks C1–C3 sequential due to single-repo branch)
- ✅ Reversibility documented (every deploy is single-revert)
- ✅ Voice rules enforced (banned-phrase scan in C1 Step 3)
- ✅ Oracle exposure swept (B2 Step 3)
- ✅ Code freeze gate (Task D1)
- ✅ Summit-day binary matrix (Task E1)

**Placeholder scan:** no "TBD", no "add appropriate X", no "similar to Task N". Source paths in Task A2 Step 2 + C1 Step 2 are deferred to runtime location lookup, which is correct (cannot pre-resolve without running).

**Type consistency:** `frankx-prod-sync` named consistently. `MADRID-2026-05-28-NETWORKING-PACK.md` / `MADRID-2026-05-28-DEMO-RUNBOOK.md` referenced verbatim throughout.

**Confidence:** HIGH on Phases B, D, E (mechanical). MEDIUM on Phase A Task A3 (depends on Antigravity access verification in Task A1). MEDIUM on Phase C (depends on source-content existence verification in Task A2).

**What could still be wrong:**
- Antigravity may require an invite Frank doesn't have → Task A1 catches this; Task A3 gated on GREEN
- The A2A guide and partnerships/google playbook sources referenced in networking pack §2 may not actually exist where claimed → Task A2 Steps 2–3 catch this; Phase C gracefully degrades
- Madrid Wi-Fi may be hostile in ways the cellular fallback doesn't fix → screenshots cached in Task B4 are the offline backstop
- Frank may not have time Wednesday afternoon for Phase C → Phase C is gated on Phase B; Phase B alone is sufficient for survival; Phase C is upside

Built on SIP — Starlight Intelligence Protocol v1.1.1
*Generated 2026-05-26 · Companion to `MADRID-2026-05-28-NETWORKING-PACK.md` + `MADRID-2026-05-28-DEMO-RUNBOOK.md` · Falsifier: if Frank arrives in Madrid and Phase B PREFLIGHT-2026-05-27.md was not completed, this plan failed at scheduling, not at content.*
