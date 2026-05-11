# Demo Fallback — Friday 2026-05-15

> If something dies live. Three tiers, escalating from "barely noticed" to "this is the demo now."

---

## Tier 1 — Cockpit auto-rehydrate (you barely noticed)

**Trigger:** a Zellij tab died, a panel lost focus, the orchestrator process exited.

**Action:** nothing. Cockpit Continuity v0.2 has six Task Scheduler triggers armed; one wakes within a minute. Keep narrating; the surface comes back.

**Manual nudge if you need it now:**
```powershell
pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1
```

Then re-load the dashboard tab in the browser.

**Cover line if asked:** *"That's the cockpit's auto-recovery — Task Scheduler reattaches dead panes within sixty seconds. The substrate is designed to outlive any single process."*

### Diagnostic command set (run if symptom unclear)

If you don't know which surface died, run these in order. First failing line tells you which tier to enter.

```powershell
# 1. Is the dashboard listening on :3007?
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3007/mission-control
#   200 = dashboard alive, problem is elsewhere
#   anything else = restart dashboard (see below)

# 2. Are all 7 demo routes alive?
foreach ($r in 'mission-control','agents','decisions','packs','council','vaults/loop','tooling') {
  $code = curl.exe -s -o NUL -w "%{http_code}" "http://127.0.0.1:3007/$r"
  Write-Host "  $code  /$r"
}
#   want 7 x 200; anything 5xx => one route crashed, rest are still demoable

# 3. Is the dashboard node process still running?
Get-Process -Name 'node' -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -match 'dashboard|next' -or $_.Path -match 'dashboard' } |
  Select-Object Id, ProcessName, StartTime

# 4. Is the SIS CLI healthy?
cd C:\Users\frank\Starlight-Intelligence-System
npx tsx src\cli.ts version
npx tsx src\cli.ts doctor

# 5. Are the audit ledgers writable?
Test-Path C:\Users\frank\Starlight-Intelligence-System\memory\_audit\work-packets.jsonl
Test-Path C:\Users\frank\Starlight-Intelligence-System\memory\_audit\decisions.jsonl
```

### Restart the dashboard (under 30 seconds)

```powershell
pushd C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\dashboard
Start-Process -WindowStyle Hidden -FilePath 'npm.cmd' -ArgumentList 'run','start'
popd
# wait 6 seconds then re-probe
Start-Sleep -Seconds 6
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3007/mission-control
```

### Re-run the smoke (10 steps, ~45 seconds)

```powershell
pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\demo-friday-2026-05-15.ps1
```

Want to see `[demo] READY — all 16 steps green.` If yes, you're back on Tier 0. If no, escalate to Tier 2.

---

## Tier 2 — Dashboard down → CLI demo (same flow, different surface)

**Trigger:** `:3007` not responding, or a route 500s, or the browser hangs, and the restart above didn't help.

**Pivot line:** *"Honestly — the dashboard is the prettiest face of the substrate, but the substrate IS the JSONL. Let me show you the real thing."*

**Open a terminal. Run all 10 steps via CLI. Each produces the same audit-grade artifact the dashboard renders.**

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
```

### Step 1 — Mission Control (dashboard equivalent: `/mission-control`)
```powershell
# Show the substrate is alive — version + memory + 6 vaults + KG + ledgers
npx tsx src\cli.ts doctor
```
*Narrate:* "This is what mission control renders. CLI, dashboard, same source of truth."

### Step 2 — Enter the command (dashboard equivalent: command bar)
```powershell
npx tsx src\cli.ts workpacket create `
  --title "Council module" `
  --mission "scaffold" `
  --risk low `
  --agent starlight-orchestrator
```
*Expect:* `[starlight] WorkPacket created: wp_<timestamp>_<hex>` + JSON snapshot.

### Step 3 — WorkPacket in the ledger (dashboard equivalent: WorkPacket row)
```powershell
npx tsx src\cli.ts workpacket list --limit 3
```
*Expect:* three most recent packets, newest first.

### Step 4 — AgentEvent / append-only ledger (dashboard equivalent: live feed)
```powershell
Get-Content memory\_audit\work-packets.jsonl -Tail 1
```
*Expect:* one line of JSON — the WorkPacket envelope. *"Append-only. The substrate doesn't trust agents; it makes them prove every move."*

### Step 5 — Decision logged (dashboard equivalent: Decisions column)
```powershell
Get-Content memory\_audit\decisions.jsonl -Tail 1
```
*Expect:* JSON envelope with `workPacketId` linking back to step 2. *"The graph stitches itself."*

### Step 6 — Brain Graph (dashboard equivalent: `/brain` 3D scene)
```powershell
# Show the knowledge graph indexed atom count + most recent rollup
Get-ChildItem memory\knowledge-graph\rollup\*.json |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 3 Name, LastWriteTime
```
*Narrate:* "The brain viz is decoration. The brain is the JSON. Daily rollups, every decision indexed."

### Step 7 — Council Review (dashboard equivalent: `/council` page)
```powershell
# Show the doctrine in source — seven archetypes typed at compile-time
notepad src\types.ts
# Then: Ctrl+F "CouncilReviewPerspectives"
```
Or open in your editor of choice. The shape is the moat — not the LLM completion. Read the seven keys out loud: `elderFather`, `elderMother`, `sage`, `builderElder`, `shadowWitness`, `divineNeutralWitness`, `futureSelf90`.

### Step 8 — VaultLoop entry (dashboard equivalent: `/vaults/loop` pentagram)
```powershell
# Show the 9-stage doctrine in the type definition
notepad src\types.ts
# Then: Ctrl+F "VaultLoopStage"
```
Read the nine stages out loud: desire → gratitude → visualization → surrender → intuition → aligned_action → evidence → outcome → proof. *"Every WorkPacket enters at Desire and earns its way through the loop."*

### Step 9 — Pack Registry (dashboard equivalent: `/packs` tile grid)
```powershell
Get-ChildItem packs\ -Directory |
  ForEach-Object {
    $manifest = Join-Path $_.FullName 'pack.json'
    if (Test-Path $manifest) {
      $m = Get-Content $manifest -Raw | ConvertFrom-Json
      [pscustomobject]@{ name=$m.name; version=$m.version; kind=$m.kind }
    }
  } | Format-Table -AutoSize
```
*Expect:* three packs (starlight-base, council-doctrine, vault-loop) with versions.

### Step 10 — Tooling overlay (dashboard equivalent: `/tooling` page)
```powershell
# Show the integration matrix is documented, not vibes
Get-Content docs\ops\TOOLING-INTEGRATIONS.md -ErrorAction SilentlyContinue |
  Select-Object -First 40
# (if that file doesn't exist, show MEMORY.md instead — same evidence pattern)
notepad memory\MEMORY.md
```
*Narrate:* "Claude Code, Codex, OpenCode, Gemini, Arcanea, ACOS — the substrate is the connective tissue. Each integration documented and version-pinned."

### Bonus — Run the full smoke as a "did we just see all 10?" closer
```powershell
pwsh -NoProfile -File scripts\demo-friday-2026-05-15.ps1
```
*Narrate:* "And here's the regression test that proves every step we just walked. Sixteen green. Same machine, same flow, every morning."

**What you lose in Tier 2:** the visual moments — Brain Graph spinning, Vault Loop pentagram, pack tiles.
**What you keep:** every claim about the substrate, with receipts. JSONL is the truth. The dashboard is one rendering of it.

**Cover line for the moat moment:** *"The Council surface is dashboard chrome. The Council is doctrine — seven archetypes, in source, gating every non-trivial move."* (Open `src/types.ts`, search for `CouncilReviewPerspectives`.)

---

## Tier 3 — Everything dies → docs + handover walkthrough

**Trigger:** Node crashed, laptop wedged, network gone, terminal frozen.

**Pivot line:** *"Forget the live system for a minute. Let me show you what's been built — and how the substrate documents its own evolution."*

**Open these in order. Each is a story. Walk in this exact sequence — vision first, then evidence, then doctrine.**

### 1. The vision prompt (what we're building)
```
docs/ops/prompts/starlight-v01-vision.md
```
The canonical brief Claude Code operates against. Read the **Council Doctrine** and **Vault Doctrine** sections out loud. *"This is what every agent in this repo reads on boot. Doctrine in source."*

### 2. The Friday board verdict (independent pressure test)
```
docs/boards/starlight-v01-2026-05-11.md
```
(or whichever `docs/boards/starlight-v01-*.md` is most recent)
Show the `/starlight-board` PROCEED-WITH-REVISE verdict on the v0.1 design. *"This system pressure-tests itself. Five archetypes plus overseer. Decisions get reviewed before they ship — even by AI."*

### 3. The shipped commits (audit trail)
```powershell
git log --oneline --since='2026-05-08' --until='2026-05-12'
```
Three to four squash commits land the entire Friday build. Read the messages out loud. *"Substrate work. Council doctrine. VaultLoop. Cost plane. Each one independently reviewed."*

### 4. The handover history (substrate documents itself)
```
docs/ops/HANDOVER-2026-05-11-jarvis-grade-naming.md
```
(or the most recent `docs/ops/HANDOVER-*.md`)
Frank's voice. The most recent ship. *"Every ship has a handover. Future Frank reads it on Monday."*

### 5. MEMORY.md (every shipped thing, breadcrumbed)
```
~/.claude/projects/C--Users-frank-Starlight-Intelligence-System/memory/MEMORY.md
```
Show the volume. Each bullet is a shipped capability. Scroll slowly. *"This is the persistent context. Every Claude tab boots into this list."*

### 6. The demo runbook itself (this morning's drive)
```
docs/ops/DEMO-RUNBOOK-2026-05-15.md
```
*"The very document that drove today's demo. Version-controlled. Reviewed. The demo itself is in git."*

### 7. The operational + horizon vaults (state + meaning)
```
memory/vaults/operational-vault.md
memory/vaults/horizon-vault.md
```
Operational = what shipped this week. Horizon = the long-view alignment with AGI alignment in the small.

### 8. CLAUDE.md — the constitution
```
CLAUDE.md
```
The system prompt that constrains every agent in this repo. Layer routing. Frank DNA. Read the **Agent hygiene (Karpathy-distilled)** section out loud — 12 rules. *"This is what keeps the agents honest."*

### 9. `src/types.ts` line 535 — the moat in source
```powershell
notepad src\types.ts
# Ctrl+F: CouncilReviewPerspectives
```
Seven archetypes, no LLM completion, doctrine first. The shape itself is the IP.

**The pivot frame:**
> "The substrate's evolution is its own substrate. Every ship has a handover. Every decision has a vault entry. Every doctrine has a schema. The fact that I can walk this history with you, file by file, is the demo. The live UI is downstream of that."

**Cover line for landing:**
> "What you just saw is the part I'm willing to show today. The next layer — alliance protocols, OpenClaw, the multi-person trust model — is in flight. The pattern is the same as the council. Doctrine first, data second, decoration third."

---

## Last-resort recovery commands

If you have ten seconds and one shot:

```powershell
# Full restart from a fresh terminal
pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\scripts\start-cockpit.ps1

# Smoke check that everything came back
pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\demo-friday-2026-05-15.ps1
```

If the smoke prints `[demo] READY` you're back. If not, you're in Tier 3. Pivot graciously; the docs are the demo.

---

*The fight plan is: never apologize, always pivot. The substrate's value doesn't depend on a single process surviving sixty seconds of a live call.*
