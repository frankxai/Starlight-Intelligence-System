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

---

## Tier 2 — Dashboard down → CLI demo (same flow, different surface)

**Trigger:** `:3007` not responding, or a route 500s, or the browser hangs.

**Pivot line:** *"Honestly — the dashboard is the prettiest face of the substrate, but the substrate IS the JSONL. Let me show you the real thing."*

**Open a terminal. Run the same 10 steps via CLI:**

```powershell
cd C:\Users\frank\Starlight-Intelligence-System

# Step 2 — create the WorkPacket
npx tsx src\cli.ts workpacket create `
  --title "Council module scaffold" `
  --mission "Create a Council module scaffold for SIS." `
  --risk low `
  --agent starlight-orchestrator

# Step 3 — list it
npx tsx src\cli.ts workpacket list --limit 3

# Step 4 — show the append-only ledger
Get-Content memory\_audit\work-packets.jsonl -Tail 1

# Step 5 — show decisions ledger
Get-Content memory\_audit\decisions.jsonl -Tail 1

# Step 7 — show the council review schema in source
code src\types.ts
# (or: notepad src\types.ts — jump to line 535, CouncilReviewPerspectives)

# Step 9 — system stats
npx tsx src\cli.ts stats

# Step doctor (extra credit — show the full operator readiness)
npx tsx src\cli.ts doctor
```

**What you lose:** the visual moments — Brain Graph spinning, Vault Loop pentagram, pack tiles.
**What you keep:** every claim about the substrate, with receipts. JSONL is the truth. The dashboard is one rendering of it.

**Cover line for the moat moment:** *"The Council surface is dashboard chrome. The Council is doctrine — seven archetypes, in source, gating every non-trivial move. Right here."* (Open `src/types.ts` line 535, point at `CouncilReviewPerspectives`.)

---

## Tier 3 — Everything dies → docs + handover walkthrough

**Trigger:** Node crashed, laptop wedged, network gone, terminal frozen.

**Pivot line:** *"Forget the live system for a minute. Let me show you what's been built — and how the substrate documents its own evolution."*

**Open these in order. Each is a story.**

1. **`docs/ops/HANDOVER-2026-05-11-three-tier-fleet-build.md`** — current state of the fleet build. Frank's voice. The most recent ship.
2. **`MEMORY.md`** (auto-load file at repo root, or `~/.claude/projects/.../memory/MEMORY.md`) — every project breadcrumb. Show the volume. Each line is a shipped thing.
3. **`docs/ops/DEMO-RUNBOOK-2026-05-15.md`** (this morning's runbook) — the very document that drove today's demo. Show that the demo itself was version-controlled and reviewable.
4. **`memory/vaults/operational-vault.md`** — the operational vault. Show one section: "what we shipped this week, why, and what's next."
5. **`memory/vaults/horizon-vault.md`** — the horizon vault. Show one paragraph: long-view alignment with AGI/AGI alignment in the small.
6. **`CLAUDE.md`** — the system prompt that constrains every agent in this repo. Layer routing. Frank DNA. Agent hygiene rules. Read the "Agent hygiene (Karpathy-distilled)" section out loud — 12 rules.
7. **`src/types.ts` line 535** — the moat in source. `CouncilReviewPerspectives` — seven archetypes, no LLM completion, doctrine first.

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
