# Naming — SIS substrate name register

Canonical reconciliation of every parallel name in the substrate.
Each fork was chosen deliberately; this file makes the choice readable.

> **Why this exists:** a stranger reading the codebase cold should be able to
> deduce which name owns what scope, and which name is canonical. Without this
> file, the choices live in Frank's head — invisible to forks and to
> future-Frank. Per SIP § 5 sovereignty clause, name discipline is part of
> file-contract integrity.

**Tier:** substrate (file-contract participant)
**Audit cadence:** every substrate-tier release. v80 platform-prompt symmetry
test should grow to assert this file's row count against the actual fork
inventory.

---

## Fork 1 — Governance pressure-test command

| Name | Canon | Scope | When to use |
|---|---|---|---|
| `/starlight-board` | **canonical for SIS substrate** | Canon-free, functional vector names (Sovereign / Seer / Harmonizer / Strategist / Verifier / Overseer) | Default for any SIS-substrate-tier governance |
| `/luminor-board` | Arcanea-canonical alias | Guardian archetype names (Lumina, etc.) + CC-BY-NC attribution | Only when the proposal composes Arcanea canon explicitly |

**Resolution date:** 2026-05-03 per `CLAUDE.md` "Naming note".
**Falsifier:** if both fire on the same SIS-substrate proposal, one is redundant — pick `/starlight-board`.

---

## Fork 2 — CLI dispatcher

| Name | Canon | Scope | When to use |
|---|---|---|---|
| `@arcanea/orchestrator` / `arco` | Arcanea (sibling-brand) — runtime dependency | Working production dispatcher. 21/21 tests pass. Routes to Claude/Codex/Gemini/OpenCode. | Today; everywhere |
| `starlight dispatch` | SIS — thin bridge to arco | Loads `STARLIGHT_HARNESS_PROMPT` env per surface, then invokes arco | SIS-originated dispatch with harness policy injection |

**Resolution date:** UNRESOLVED — `docs/superpowers/specs/2026-05-11-dispatcher-canonicalization-decision.md` parks three options (A: promote arco→@starlight/orchestrator with compat shim, B: formally adopt arco, C: vendor). Frank decides.
**Falsifier:** if a fork user runs SIS without the Arcanea package, option B fails. Currently the substrate has a runtime brand dependency.

---

## Fork 3 — Voice agent

| Name | Canon | Scope | Path |
|---|---|---|---|
| **`voice-operator`** | SIS canonical — substrate-tier voice path | Python FastAPI at `:7373`. Cognition router, memory router, packet system, approval gate. Carries `FRANK_DNA` loaded from CLAUDE.md (A2). | `private/voice-operator/service/` |
| **`arcanea-voice`** | Arcanea sibling-repo — UI orb | Node at `:7777`. Native Groq + native tools (shell_run, file_write, claude_prompt, etc.). The thing Frank actually talks to. | `C:/Users/frank/Arcanea/packages/arcanea-voice/` |

**Bridge:** `COGNITION_BRIDGE_URL=http://127.0.0.1:7373/api/utterance` set by `start-cockpit.ps1` env. Orb POSTs each utterance to voice-operator for cognition, gets `spoken_update` back, runs TTS. Bridge mode shipped 2026-04-27, toggled off 2026-04-30 (per `feedback_voice_operator_bridge_off`), confirmed back ON 2026-05-11.

**Resolution status:** intentional dual path. voice-operator owns cognition/memory/identity; arcanea-voice owns tool execution + UI. Bridge connects them.
**Falsifier:** orb behaves coherently with `COGNITION_BRIDGE_URL=""` (native Groq path holds). Test by setting empty and probing `/api/text`.

---

## Fork 4 — "Cockpit" (the most overloaded word in the substrate)

Four distinct concepts share this name. **Disambiguate by always saying which.**

| Name | What it is | Path |
|---|---|---|
| **Cockpit Continuity** (`cockpit/`) | v0.2 session-manifest layer. Tracks `(terminal pane → agent session ID)`, registers 6 Task Scheduler triggers, exposes `arc` CLI + MCP server. | `cockpit/` (committed 2026-05-11) |
| **cockpit-zellij** (`cockpit-zellij/`) | Terminal multiplexer layouts. Per-repo Zellij configs invoked by `arc <project>`. | `cockpit-zellij/` |
| **Dashboard `/cockpit` route** | Next.js page at `http://localhost:3007/cockpit`. Iframes the orb + renders HUD. | `private/local-command-center/apps/dashboard/app/cockpit/page.tsx` |
| **Cockpit ORB** | The voice-input UI at `:7777` (arcanea-voice). What Frank speaks to. | `C:/Users/frank/Arcanea/packages/arcanea-voice/` |

**Resolution:** all four names hold but are mutually-exclusive in scope. Frank says "the cockpit" colloquially → usually means dashboard route + orb together. Substrate docs **must** specify which when load-bearing.
**Falsifier:** if a doc says "open the cockpit" without saying which, that doc is ambiguous and should be edited.

---

## Fork 5 — Voice operator identity

| Name | Where | What it loads |
|---|---|---|
| `## Frank DNA` (section) | `CLAUDE.md` lines 7–28 | Substrate-canonical operator-DNA source |
| `FRANK_DNA` (Python constant) | `private/voice-operator/service/cognition/system_prompt.py` | Module-level cache loaded once at import via `_load_operator_dna()` regex-slicing `CLAUDE.md` |
| `_OPERATOR_DNA_FALLBACK` | same file | Generic operator posture if CLAUDE.md unreadable; loud WARNING log on every fallback hit |

**Resolution:** single source of truth = `CLAUDE.md`. Python constant is a cached load, not a duplicate. Fork users edit `CLAUDE.md` once to retheme; the constant name `FRANK_DNA` is the Python identifier, not the content.
**Falsifier:** v80-voice-loop-coverage test asserts `_load_operator_dna` AND `CLAUDE.md` are both referenced in system_prompt.py AND that CLAUDE.md carries the markers. If load mechanism breaks, the test fails.
**Bypass:** `STARLIGHT_ALLOW_OPERATOR_DNA_FALLBACK=1` env var permits fork scenarios where CLAUDE.md is intentionally absent.

---

## Fork 6 — Substrate vs Instance

| Name | Scope |
|---|---|
| **SIP** (Starlight Intelligence Protocol) | The spec. `SIP.md`. Substrate definition. |
| **SIS** (Starlight Intelligence System) | This repo. The reference implementation / Frank's instance. |
| **Starlight** | The brand register over both. Canonical for substrate-tier governance, file-contracts, attestation. |

**Resolution:** **SIP is the spec, SIS is the build, Starlight is the brand.** Three different words on purpose. Don't conflate.
**Falsifier:** any doc that says "SIP" when it should say "SIS" (or vice versa) — e.g., "edit SIP to add a new vault" is wrong; vaults are instance-level (SIS), not spec-level (SIP).

---

## Fork 7 — Network layer (L99 2026-06-12)

| Name | Canon | Scope | When to use |
|---|---|---|---|
| **Starlight Intelligence Network** | Open extension of Starlight brand | The full federation: sovereign humans + their IS/OS instances + attested artifacts + privacy-respecting memory graph + shared research + transmissions + the beautiful shared viz layer. The living network of systems built on SIP. | Public positioning, research surface, community, "the network of people building their intelligence on the substrate". |
| **Starlight Network** | Short form | The protocol graph + discovery + composition surface. The technical + social layer that makes sovereign IS/OS possible and compounding. | When brevity matters (domain names, internal, "join the Starlight Network"). |

**Resolution date:** 2026-06-12 (L99 massive action on user /goal l99).  
**Rationale:** SIP is the open protocol (MIT, file contract, attestation, sovereignty clause). "Starlight" is the brand register over the protocol + reference build. The Network names are the natural emergent layer once multiple sovereign nodes exist. They are deliberately open — anyone can adopt SIP, run their own instance, and participate. Always emit "Built on SIP" + pin version. No trademark conflicts in current register (internal discipline on FrankX / SIS / Arcanea / Starlight layers).  
**Falsifier:** If a surface uses the Network name without a visible SIP attestation or link to starlightintelligence.org/protocol, the usage is decorative and must be corrected.  
**Governance:** Substrate-tier naming changes still route through /starlight-board (or /luminor-board when Arcanea canon is composed).

## What this file is NOT

- Not a policy document. It records what IS, not what SHOULD BE.
- Not an aspiration. Each fork above is in active use right now.
- Not exhaustive for time. As new forks emerge, add rows. Removing rows requires removing the corresponding name from the codebase first.

## Auditing

Run these to verify the register stays honest:

```bash
# Fork 4 check — search for ambiguous "the cockpit" mentions in substrate docs
grep -rn "the cockpit" --include='*.md' . | grep -v NAMING.md

# Fork 5 check — v80 voice-loop coverage test must pass
npx tsx --test test/v80-voice-loop-coverage.test.ts

# Fork 6 check — SIP-when-should-be-SIS drift
grep -rn "SIP\." --include='*.md' . | grep -iE "(vault|instance|local|frank's)"
```

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Generated: 2026-05-11
- Tier: substrate (file-contract participant — recommended to gate v8.1 board pre-pass on additions)
