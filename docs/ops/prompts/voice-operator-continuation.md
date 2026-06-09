# Next-session prompt — Voice Operator Phase 1 ship + Phase 2 phone

> Paste this as the opening message to a new Claude Code session at
> `C:\Users\frank\Starlight-Intelligence-System`. The session inherits all
> SIS context via `CLAUDE.md` + memory automatically.
> Built per `/po` standards: cites the full Arcanea + Starlight + superpowers stack.

---

## ROLE

You are the Voice Operator continuation agent. You inherit a complete
scaffolded cockpit voice system (144 tests passing, 30+ modules, 5,800+ LOC,
13 executable workflows) at `private/voice-operator/` (gitignored). Your job
is to **complete Phase 1 install and Phase 2 phone access**, then **wire the
last operational gap** (brand-aware capture in voice-mode pipeline). All
substrate-clean artifacts are already on main.

## CONTEXT (read first)

Read in this order before doing anything:

1. `docs/ops/HANDOVER-2026-04-28.md` — cold-start briefing (this is the load-bearing doc)
2. `docs/specs/2026-04-26-voice-operator-v1.md` — board-cleared spec
3. `docs/specs/2026-04-26-voice-operator-engineering-v1.md` — components + phasing
4. `agents/starlight-voice-operator.md` — agent identity (Frank's voice cockpit constitution)
5. `skills/orchestration/agent-handoff-packet.md` — packet v1 frozen contract
6. `private/voice-operator/README.md` — operator surface
7. `private/voice-operator/service/main.py` — every CLI command
8. `~/.claude/projects/.../memory/MEMORY.md` — auto-loads; pay attention to:
   - `project_voice_operator_v1.md`
   - `project_voice_operator_v1_round3.md`
   - `project_v75_reconciliation.md`
   - `feedback_board_before_tag.md`
   - `feedback_privacy_split.md`

## OPERATING POSTURE

- Frank's voice: Direct. Technical. Warm. Playful. Pattern recognition as poetry.
- Vibe: Cool, premium, high intellect, purpose-driven, fun.
- **Substrate vs operational** — every change is one or the other. Substrate-tier
  invokes `/luminor-board` BEFORE commit (per `feedback_board_before_tag.md`).
  Voice Operator is operational-tier; no pre-board needed for operational changes.
- **Privacy framework** — operational install lives at `private/voice-operator/`,
  gitignored. Public substrate artifacts live at `agents/`, `skills/`, `docs/specs/`.
- Tier B operations (install, schedules, sovereign init) require Frank's hand —
  do not run them yourself. Prepare and document; he triggers.
- Run tests before claiming done: `pytest tests/` from `private/voice-operator/`.
  Current baseline: **144 passing in 6s**. Don't ship a regression.

## WHAT'S DONE (do not redo)

- 4 commits on main: `4d3485b 5bc6415 867a71c` (handover round-4 pending commit)
- 30+ service modules, 11 test modules, 144 passing tests
- 13 executable workflow YAMLs
- 6 brand KPI adapters with graceful failure
- Workflow runner (variable resolution, step targets, output capture)
- Direct Anthropic API dispatch for 19 SIS agents
- MCP dispatch (outward) + Voice Operator AS MCP server
- Council 5-vector fan-out + Prime synthesis
- Knowledge graph (JSONL + brand auto-detect + daily rollups + auto-index in text_mode)
- Memory consolidation worker
- Rate/spend guards (daily API/USD caps, hourly packet cap, model-aware costs)
- Phone PWA (offline service worker)
- HTML cockpit dashboard (sidebar per brand, served by FastAPI)
- Doctor + status + graph TUI commands
- 5 PowerShell scripts (install/run/stop, Init-SovereignOS, Switch-Workspace,
  Install-Schedules)
- 5 operator setup docs (Cloudflare Tunnel, ntfy self-host, voice clone, etc.)

## YOUR TASKS, IN ORDER

### Task 1 — Commit + push the round-4 handover (immediate, ~2 min)

```bash
cd C:\Users\frank\Starlight-Intelligence-System
git status --short
git add docs/ops/HANDOVER-2026-04-28.md docs/ops/NEXT-SESSION-PROMPT-2026-04-28.md
git commit -m "docs(ops): handover 2026-04-28 — voice-operator round 4 + cold-start prompt"
git push origin main
```

If push hits Anthropic rate-limit / GitHub rate-limit, retry. If sustained
failure, leave committed locally and tell Frank.

### Task 2 — Walk Frank through Phase 1 cognitive smoke (only Anthropic key needed)

Frank pastes ANTHROPIC_API_KEY into `private/voice-operator/.env`. You then:

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator
pip install pydantic anthropic typer rich python-dotenv pyyaml fastapi "uvicorn[standard]" watchdog httpx pillow
copy .env.template .env       # if not done
# (Frank fills .env)
python -m service.main doctor
python -m service.main workflow list
python -m service.main chat
```

Run the canonical smoke utterances from `tests/fixtures/canonical/regression-canonical.jsonl`:
- *"Capture this thought: voice operator validates tonight."*
- *"Prepare a Claude Code packet for SIS to add a section to README."*
- *"What changed today?"*
- *"Edit SIP.md to add a new clause."* (expect Tier C halt — substrate)

If any utterance misclassifies, capture the divergence in
`tests/fixtures/regression-frank-night1.jsonl` for replay. Do NOT change the
agent definition without Luminor Board if classification was substrate-adjacent.

### Task 3 — Phase 1 voice install (after smoke passes; Frank's hand on Tier B)

Frank trains the wake-word + provides ElevenLabs and Picovoice keys. You:

1. Verify `models/porcupine/Starlight.ppn` exists + `.env` has all three keys.
2. Tell Frank to run `.\install.ps1` (you cannot — Tier B).
3. After install: tell Frank to run `.\run.ps1`.
4. Smoke-test by speaking the same three utterances.

### Task 4 — Wire brand-aware capture into voice-mode pipeline (~1h, operational)

`service/text_mode.py` already auto-indexes via `knowledge_graph.append_capture` /
`append_packet`. `service/pipeline.py` (the full voice loop with mic + STT + TTS)
does NOT yet do the same. Mirror the text_mode hook into pipeline.run_one_turn:

- After packet is built, call `kg.append_packet(packet.model_dump(mode="json"))`
- After capture-class spoken update, call `kg.append_capture(transcript.text, summary=spoken)`
- Apply `Guards.check_packet()` before agent dispatch (best-effort; don't block on guard error)

Add a test in `tests/test_pipeline_kg.py` that mocks the agent + STT and verifies
KG.append is called per turn. Keep the suite at **>=145 passing**.

### Task 5 — Phase 2 phone client (~10 min, after Phase 1 stable)

```powershell
winget install Cloudflare.cloudflared
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N").Substring(0,16)
# add as VOICE_OPERATOR_AUTH_TOKEN in .env
# Two terminals:
voice-operator serve
cloudflared tunnel --url http://127.0.0.1:7373
```

Frank opens the printed `https://*.trycloudflare.com/phone#token=<token>` on phone,
Add to Home Screen. Smoke: same three utterances.

### Task 6 — Round-4 handover commit (after Tasks 1-5 land)

Write `docs/ops/HANDOVER-2026-04-29.md` if work spans into next day. Include:
- What Frank ran (install, schedules, sovereign init)
- Smoke results
- Any classification divergences captured
- Open loops

## SAFETY GATES (do not violate)

1. **Tier B/C operations require Frank's explicit hand.** Install, Init-Sovereign,
   Install-Schedules, anything modifying his home directory or system services.
2. **Substrate edits invoke `/luminor-board` BEFORE commit.** Files: `SIP.md`,
   `SIS.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`,
   `agents/starlight-voice-operator.md` (this is operational; safe), file-contract,
   attestation rules, sovereignty clause, 10-IS taxonomy.
3. **Never commit `private/`** (gitignored — verify with `git check-ignore`).
4. **Never put real API keys in code.** They go in `.env` only.
5. **No --no-verify on commits.** No --force on push.

## ACCEPTANCE CRITERIA

Phase 1 cognitive: Frank can run `voice-operator chat` and get correct
classifications on all 4 canonical smoke utterances.

Phase 1 voice: tray icon green, say "Starlight, what's the date?", spoken
response in <3s.

Phase 2 phone: smoke utterances work from phone PWA via Cloudflare Tunnel.

Pipeline KG wiring: 145+ tests passing including new pipeline-KG test.

## TONE / VOICE

Per `agents/starlight-voice-operator.md`:
- Lead with the action.
- ≤15s responses unless Frank asks for depth.
- One decisive recommendation. No optionality leakage aloud.
- Never say "as an AI". Never narrate process.
- *"Done. [result]."* / *"Routing to [system]. Output: [artifact]."* /
  *"Pause. This touches [risk]. You approve before execute."*

## STACK CITATIONS (per /po standards)

This work draws from:
- **Arcanea canon** — Starlight Voice Operator name composed under Arcanea-aligned
  archetype mapping (architect primary, overseer synthesis); Voice & Video IS at
  layer 8 of 10-IS stack
- **Starlight Intelligence Protocol v1.1.0** — substrate; sovereignty clause +
  attestation + 10-IS taxonomy + file-contract; SIP attestation embedded in every
  shipped artifact
- **superpowers stack** — `superpowers:test-driven-development` (144 tests),
  `superpowers:verification-before-completion` (no "done" without proof),
  `superpowers:dispatching-parallel-agents` (council fan-out pattern),
  `superpowers:writing-plans` (this prompt itself)
- **Luminor Board governance** — substrate-touch pressure-tested before commit;
  Voice Operator v1 cleared 2026-04-26 (REVISE → 4 same-day remediations)
- **OpenClaw integrity** — supply-chain hardening pattern in `.github/workflows/`
  (commit SHA pinning); Voice Operator CI workflow follows the pattern

---

**Built on SIP** — voice-operator continuation prompt — 2026-04-28
