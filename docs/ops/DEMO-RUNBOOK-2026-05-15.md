# Demo Runbook — Friday 2026-05-15

> The agent substrate, end to end, on this laptop. Read it once, dry-run twice, then go.

---

## TL;DR for demo-morning-Frank

**One command, T-30:**

```powershell
pwsh -NoProfile -File C:\Users\frank\Starlight-Intelligence-System\scripts\demo-friday-2026-05-15.ps1
```

Expected last line: `[demo] READY — all 10 steps green.` If you see that, open `http://127.0.0.1:3007/mission-control` and walk the 10-step path live. If you don't, jump to **Recovery branches** below.

**What to watch for during the live run:**
- Step 3 (WorkPacket appears) — refresh `/mission-control` once if it doesn't show. JSONL persistence is real; render is server-side.
- Step 7 (Council Review) — uses the seven-archetype memo template. The perspectives are not LLM-generated live; they're the doctrine, written down. That's the moat. Say so.
- Step 8 (VaultLoopEntry — Desire stage) — `vaults/loop` is the only fully-mocked surface in the demo. Frame it as the rendered shape of the doctrine, not the data layer.

---

## Pre-demo checklist (T-30 min)

Run each. If any line fails, see the matching recovery branch.

```powershell
# 1. Operator readiness — should print "Operator path ready"
cd C:\Users\frank\Starlight-Intelligence-System
npx tsx src\cli.ts doctor
```
Expect: 8 OK rows under "Starlight Operator Doctor" + memory health "healthy" + 6/6 vaults fresh + KG + mempalace + consolidation log.

```powershell
# 2. Dashboard alive on :3007
curl.exe -s -o nul -w "%{http_code}" http://127.0.0.1:3007/mission-control
```
Expect: `200`. If not, start it:
```powershell
pushd C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\dashboard
Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run","start"
popd
# wait 6s then re-probe
```

```powershell
# 3. The seven demo routes
foreach ($r in 'mission-control','agents','decisions','packs','council','vaults/loop','tooling') {
  $code = curl.exe -s -o nul -w "%{http_code}" "http://127.0.0.1:3007/$r"
  Write-Host "  $code  /$r"
}
```
Expect: seven `200` rows.

```powershell
# 4. Tail the ledger so you can prove writes during the live run
Get-Content C:\Users\frank\Starlight-Intelligence-System\memory\_audit\work-packets.jsonl -Tail 3
```
Expect: at least one recent line. Empty file is fine for a virgin demo — the live run creates one.

```powershell
# 5. Pre-warm the browser. Click each tab once so first-paint is cached.
Start-Process "http://127.0.0.1:3007/mission-control"
```

---

## Pre-call ritual — T-5 minutes

You did the work. Now show up in your body. Five minutes, six moves. Do them in order.

1. **Breath — 60 sec.** Box breathing: in 4, hold 4, out 4, hold 4. Four cycles. Pulse down. Voice settles.
2. **Water — 30 sec.** Full glass. Room temperature. Cold water tightens vocal cords.
3. **Narration card open.** `docs/ops/DEMO-NARRATION-2026-05-15.md` open in a side window. Not to read — to glance at if you blank. Three minutes of speech, twenty words you need to land. You know them.
4. **Dashboard pre-warmed.** Open each of the seven routes once so first-paint is cached:
   ```powershell
   foreach ($r in 'mission-control','agents','decisions','packs','council','vaults/loop','tooling') {
     Start-Process "http://127.0.0.1:3007/$r"
     Start-Sleep -Milliseconds 250
   }
   ```
   Then close every tab except `mission-control`. Browser cache is warm; tab strip is clean.
5. **Terminal scrolled to clean state.** In the terminal you'll use for the live `workpacket create`:
   ```powershell
   Clear-Host
   cd C:\Users\frank\Starlight-Intelligence-System
   ```
   Zero scrollback. Audience sees the command land on a virgin screen.
6. **TIMING-PAD card open if Q&A might run long.** `docs/ops/TIMING-PAD-2026-05-15.md` open in a tab. Three pre-marked cuts. If the room is hot you compress to 2:30 without thinking.

**Last 30 seconds before you start:** stand up. Shoulders down. One slow exhale through pursed lips. You built this. Now show them.

---

## The 10-step demo path

Everything below is executable. Commands in fenced blocks, clicks in italics, expected output in `> blockquote`.

### Step 1 — Open the dashboard

*Click* the browser tab on `http://127.0.0.1:3007/mission-control`.

> Mission Control surface renders: agents column, decisions column, pending council column.

### Step 2 — Enter the command

In a terminal (any tab Frank already has open):

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
npx tsx src\cli.ts workpacket create `
  --title "Council module scaffold" `
  --mission "Create a Council module scaffold for SIS." `
  --risk low `
  --agent starlight-orchestrator
```

> `[starlight] WorkPacket created: wp_<timestamp>_<hex>` followed by the JSON snapshot.

### Step 3 — WorkPacket appears in the ledger

```powershell
npx tsx src\cli.ts workpacket list --limit 3
```

> Three most recent WorkPackets, newest first. The one you just made is on top, status `[pending] (low)`.

Refresh `http://127.0.0.1:3007/mission-control` — same packet appears server-side (dashboard re-fetches on `force-dynamic`).

### Step 4 — AgentEvent logged

The CLI also wrote to `memory/_audit/work-packets.jsonl`. Show the tail:

```powershell
Get-Content C:\Users\frank\Starlight-Intelligence-System\memory\_audit\work-packets.jsonl -Tail 1
```

> One line of JSON: the full WorkPacket envelope. Append-only. This is the substrate's truth.

### Step 5 — Decision logged

The smoke script wrote a Decision row tied to the same WorkPacket. Show it:

```powershell
Get-Content C:\Users\frank\Starlight-Intelligence-System\memory\_audit\decisions.jsonl -Tail 1
```

> JSON envelope with `workPacketId` pointing at step 2. This is how the graph stitches.

### Step 6 — Brain Graph updates

*Click* the `Brain` link in the dashboard nav (or open `http://127.0.0.1:3007/brain`).

> Three.js scene renders. New decisions show up as halo pulses on next ingest pass.

### Step 7 — Council Review generated

*Click* the `Council` tab (`/council`).

> CouncilSurface renders. Show the seven-archetype memo shape: Elder Father / Elder Mother / Sage / Builder Elder / Shadow Witness / Divine Neutral Witness / Future Self 90. Walk one perspective out loud.

This template lives in `src/types.ts` as `CouncilReviewPerspectives`. The shape is the moat — not the LLM completion.

### Step 8 — VaultLoopEntry created (Desire stage)

*Click* the `Vault Loop` tab (`/vaults/loop`).

> The five stages render: Desire → Intention → Action → Reflection → Wisdom. Show the entry seeded by the smoke script in Desire.

This surface is dashboard-mock-backed today (`mockVaultLoop()` in `lib/sis-client.ts`). Frame as: "the doctrine layer is rendered first, the data layer is in flight."

### Step 9 — Pack Registry shows installed packs

*Click* the `Packs` tab (`/packs`).

> Three packs render: starlight-base, council-doctrine, vault-loop. Each tagged with version, install state, source.

### Step 10 — Docs page

*Click* the `Tooling` tab (`/tooling`).

> Partitioned tooling overlay: Claude Code / Codex / OpenCode / Gemini / Arcanea dispatcher / ACOS. Each card shows what the substrate integrates with and the path forward (OpenClaw bridge, MCP server).

---

## Demo narration

One sentence per step. Read out loud during the dry-run; trim what doesn't land.

1. **Open the dashboard.** "This is Mission Control. Every agent, every decision, every pending review — one window."
2. **Enter the command.** "I'm going to ask the substrate to scaffold a Council module. Watch the ledger."
3. **WorkPacket in ledger.** "That's the work packet — title, mission, risk level, allowed tools, forbidden actions. Audit-grade from the first keystroke."
4. **AgentEvent logged.** "Append-only JSONL. The substrate doesn't trust agents; it makes them prove every move."
5. **Decision logged.** "Decisions cite the work packet that produced them. The graph stitches itself."
6. **Brain Graph updates.** "And here's the graph — every decision lights up the brain."
7. **Council Review.** "Seven archetypes pressure-test every non-trivial move. Elder Father. Elder Mother. Sage. Builder Elder. Shadow Witness. Divine Neutral. Future Self at ninety. No competitor has this."
8. **Vault Loop — Desire stage.** "Desire, intention, action, reflection, wisdom. Five stages. Every work packet enters at Desire and earns its way up."
9. **Pack Registry.** "Capabilities ship as packs. Install. Pin. Audit. The substrate stays slim; the surface area grows by composition."
10. **Tooling.** "Claude Code, Codex, Gemini, OpenCode, Arcanea, ACOS — the substrate is the connective tissue. OpenClaw is next."

---

## Recovery branches

Every step has a fallback. Pick the one that costs the least time.

| If this fails | Show this instead |
|---|---|
| Dashboard not on :3007 | Run all 10 steps from the CLI: `workpacket create` / `workpacket list` / show JSONL tails / open `memory/_audit/decisions.jsonl` and `memory/_audit/workpackets.jsonl` directly. The substrate is the data, not the pixels. |
| `npx tsx` slow on first run | Run from `dist/` instead: `node dist\cli.js workpacket create ...`. Already built. |
| WorkPacket doesn't show in dashboard | Refresh once. If still empty, show the JSONL tail directly: `Get-Content memory\_audit\work-packets.jsonl -Tail 1`. |
| Brain Graph hangs | Stay on Mission Control. Brain viz is the encore, not the spine. |
| Council page renders empty | Show `src/types.ts` line 535 — the `CouncilReviewPerspectives` interface. Doctrine in source is the moat; the UI is one rendering of it. |
| Vault Loop renders empty | Same move — show the doctrine in `lib/sis-client.ts` mock. Be honest: "the data layer is in flight; the doctrine layer is locked." |
| Packs page renders empty | Open `lib/sis-client.ts` and show `mockPacks()`. Same story. |
| Whole dashboard dies | Switch to the docs walk-through: `docs/ops/DEMO-FALLBACK-2026-05-15.md` Tier 3. The handover history is its own demo. |
| Doctor reports MISS on a CLI | Skip the doctor step in narration. The 10-step path doesn't depend on Codex/Gemini/OpenCode being installed — it only needs Node + the SIS CLI. |
| Cockpit-Zellij hooks haven't rehydrated tabs | `pwsh C:\Users\frank\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1`. Six Task Scheduler triggers are armed; one usually wakes by 09:00. |

---

## Post-demo close

Capture before the dust settles. Two files, two minutes.

```powershell
# 1. Operational vault — what happened.
notepad C:\Users\frank\Starlight-Intelligence-System\memory\vaults\operational-vault.md
```

Append a section:

```markdown
## 2026-05-15 — Friday demo
- Audience: [who]
- 10-step path: [N/10 green live]
- Mocked surfaces flagged honestly: [yes/no]
- Reactions: [the line that landed]
- Next: [the question that opened a door]
```

```powershell
# 2. Horizon vault — what it means.
notepad C:\Users\frank\Starlight-Intelligence-System\memory\vaults\horizon-vault.md
```

Append one paragraph: what this demo means for the path to AGI alignment in the small. One sentence is enough. Future-Frank reads this on the next horizon pass.

If anyone in the room asked a question you couldn't fully answer, log it:

```powershell
Add-Content -Path C:\Users\frank\Starlight-Intelligence-System\memory\feedback_demo_open_questions.md `
  -Value "`n## 2026-05-15`n- [question]`n  - context: [who, what they were poking at]"
```

You're ready. Go land it.
