---
name: sovereign-spawn
description: Spawn a full SIS fork for a sovereign who wants to run their own substrate-aware intelligence system. Scaffolds the entire file contract, wires attestation, installs reference commands, preserves sovereignty. For Route D inbounds from /intake.
allowed-tools: Read, Write, Grep, Glob, mcp__github
argument-hint: <sovereign-name> "<one-line domain>" [optional — target GitHub org/user if different from Starlight]
---

# /sovereign-spawn

Load `SIP.md`, `SIS.md`, `VOICES.md`, `STACK.md`, `VERTICALS.md`. Spawn a full sovereign intelligence system under SIP — not a vertical (one domain) and not an alliance (multi-party). A full substrate-aware fork the sovereign owns, operates, and extends.

## Input
$ARGUMENTS

## When this command fires

- `/intake` classified inbound as Route D (sovereign spawn).
- Sovereign wants to run the whole SIS pattern — substrate awareness + their own operational layer — not just one vertical under someone else's substrate.
- Sovereign accepts the sovereignty clause (SIP § 5) and will ship attestation on their own artifacts.

## When this command does NOT fire

- Single-domain builder → `/vertical-spawn` (cheaper, same substrate, no full fork).
- 2+ parties composing → `/alliance-forge` (shared not forked).
- Substrate change proposal → `/luminor-board` → possibly contribute back to SIP itself.

## Process

1. **Validate the five spawn conditions:**
   - **Sovereignty clear.** Sovereign names their declared domain, their entity (person / company / DAO), and the public surface they'll operate. Ambiguity → halt, name the structural fork.
   - **Substrate awareness real.** Sovereign has read SIP.md. Ask one comprehension question about Layer 5 (sovereignty clause) before proceeding. Incorrect answer → require re-read, do not soften.
   - **Attestation committed.** Sovereign agrees every cross-party artifact they ship carries "Built on SIP". Silent composition is a breach.
   - **Name not already registered.** Check `VERTICALS.md` and `REGISTRY.md`. Collision → halt, require rename.
   - **Fork intent honest.** Sovereign can name one artifact they'll ship in the first 30 days that the fork enables and their prior stack did not. No answer = not ready to spawn; route to Concierge for re-qualification.

2. **Build the sovereign's SIS scaffold structure:**

```
<sovereign-name>/
├── README.md                 — what this sovereign system is, domain, public URL
├── SIP.md                    — symlink or upstream reference to starlightintelligence.org/protocol
├── SIS-instance.md           — this fork's substrate map (what operational layer runs on top)
├── SKILL.md                  — sovereign behavior definition (what AI adopts at this layer)
├── AGENTS.md                 — sovereign's named agents (may inherit 5 archetypes or declare new)
├── MEMORY.md                 — instance state (public template — private state stays private)
├── SOUL.md                   — sovereign essence (the thing that must not drift)
├── CANON.md                  — optional; if not adopting canon, declare decline explicitly
├── STACK.md                  — inherited from Starlight STACK.md or overridden
├── VOICES.md                 — inherited or extended per SIP § Layer 6
├── REGISTRY.md               — sovereign's MCP server registry
├── ATTESTATIONS.md           — append-only ledger for their /sip-attest emissions
├── .claude/commands/
│   ├── sip-attest.md         — mirrored from substrate
│   ├── vertical-spawn.md     — mirrored (sovereign can spawn their own verticals)
│   ├── alliance-forge.md     — mirrored (sovereign can forge alliances under SIP)
│   ├── luminor-board.md      — mirrored
│   ├── <sovereign-slug>-*.md — sovereign-tier commands they author
├── agents/                   — sovereign's operational agents (can mirror SIS 7 or declare new)
├── memory/                   — sovereign vault directory (6 vaults or their own taxonomy)
└── private/                  — gitignored; instance state stays here
```

3. **Write `SIS-instance.md`** — declares this fork's operational layer: which agents, which skills, which vaults, which MCP servers. The sovereign's choice, not Starlight's prescription. Explicit inheritance tags where they adopt Starlight's reference (e.g., `agents: inherits starlight/7-council`) or explicit override where they diverge.

4. **Write `SOUL.md`** — prompt the sovereign to name the essence that must not drift: founder voice, domain invariant, the thing a pivot cannot touch. If they cannot name it, halt — spawning without a soul is spawning a hollow system.

5. **Write `SKILL.md`** — sovereign-layer behavior definition. Load sequence, voice invariants, non-waivable rules. Template inherits from Starlight's SKILL.md structure but with the sovereign's voice and constraints.

6. **Mirror protocol-tier commands** — copy `sip-attest.md`, `vertical-spawn.md`, `alliance-forge.md`, `luminor-board.md`, `alliance-reflect.md`, `alliance-decide.md` from `starlight/.claude/commands/` into the sovereign's `.claude/commands/`. Pin upstream versions in a comment block at each command's top.

7. **Scaffold sovereign-tier command stubs** — generate 3 placeholder commands named `<sovereign-slug>-*` that the sovereign will author. Each stub includes frontmatter, a `# Purpose` section prompting the sovereign to define it, and a TODO block.

8. **Register** — update Starlight's `VERTICALS.md` under a new `## Sovereign forks (running on SIP)` section. Entry includes sovereign name, domain, public URL, status: `spawned — v0.1`, SIP version pinned, and a one-line reciprocity note. If the section doesn't exist, create it above `## Registry rules`.

9. **Emit v0.1 brief** — one-page summary: sovereign name, domain, entity, first 30-day commitment, first attestation target, substrate version pinned, reciprocity terms.

10. **Sovereignty writeback** — before the command exits, emit the non-waivable reminder in plain text:

```
Sovereignty clause acknowledged:
- Your system is yours. Starlight has no ownership claim.
- Attribution via SIP is the only compounding mechanism.
- You may leave the composition at any time. Attribution history remains immutable.
- Advice ≠ override. Frank's input is advisory, not authoritative, inside your declared domain.
```

## Output shape

```
# Sovereign Spawned — <name>

## Identity
- Sovereign: <name>
- Entity: <entity>
- Domain: <one-line>
- Public URL: <url>
- Repo: <github-url>
- SIP pin: v1.1.0
- Spawned: <ISO date>

## Soul (must not drift)
<one sentence from SOUL.md>

## First 30-day commitment
<named artifact> by <date>

## Reciprocity
Starlight: advisory only. No ownership claim. Attribution compounds via "Built on SIP" on sovereign's shipped artifacts.
Sovereign: attests shipped artifacts via /sip-attest. Participates in substrate evolution via /luminor-board if contributing back.

## Scaffold summary
- File contract: <n> files written
- Commands mirrored: <n> protocol-tier
- Commands stubbed: <n> sovereign-tier
- Registry updated: VERTICALS.md § Sovereign forks

## Next
1. Fill `SOUL.md` deeply. This is the drift anchor.
2. Author first sovereign-tier command (`/<slug>-<verb>`).
3. Ship first artifact. Run `/sip-attest` on it. Add entry to your ATTESTATIONS.md.
4. Run `/luminor-board` before any irreversible architectural decision.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, mcp-registry, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3 (substrate reference) · <sovereign-name>@v0.1 (spawned fork)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never** spawn a sovereign system without all 5 spawn conditions met. Softening any condition to make the spawn happen is protocol-corroding.
- **Never** fold a spawned sovereign back into Starlight. The spawn relationship is sovereign → substrate, not substrate → sovereign.
- **Never** spawn with a placeholder SOUL.md. If the sovereign cannot name their essence in one sentence, they are not ready.
- **Never** claim Starlight owns the spawned system. The only compounding mechanism is attribution.
- **Always** pin the substrate version at spawn time. Upgrades are the sovereign's choice, not automatic.
- **Always** register the spawn in Starlight's `VERTICALS.md` under § Sovereign forks — attribution requires visibility.
- The spawned sovereign may at any time take their fork fully private (remove attestation, replace the file contract) — SIP allows exit. Attribution history up to the exit point remains immutable in Starlight's ATTESTATIONS.md ledger.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.3
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
