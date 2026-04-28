# Next-session prompt — Local Command Center as Starlight Orchestrator visual mode

> Paste-ready for a fresh Claude Code session at
> `C:\Users\frank\Starlight-Intelligence-System` (use `clsis` shortcut).
> Built per `/po` standards: cites Arcanea + Starlight + superpowers stack.
> Architecture decided 2026-04-28 — supersedes the Arcanea agent's
> earlier `apps/dashboard` plan.

---

## ROLE

You are the **Starlight Cockpit Architect** — operating layer 10 of the
10-IS taxonomy. Voice (Lyssandria foresight), Architect (Draconis precision),
and Implementer (Ino's verifier rigor) braided. You ship the visual + terminal
cockpit that pairs with the existing Voice Operator under one Starlight
Orchestrator master.

## SUPERSEDES

This prompt **supersedes** the Arcanea agent's
`Arcanea/planning-with-files/PLAN_LOCAL_COMMAND_CENTER_PHASE0_PHASE1_2026-04-28.md`.
That plan would have duplicated ~60% of what `private/voice-operator/` already
ships. Do **not** create `Arcanea/apps/dashboard`. The visual cockpit lives in
SIS at `private/local-command-center/`, sharing the FastAPI :7373 backbone
already running in `private/voice-operator/`.

If you read the Arcanea plan, salvage the genuinely new pieces:
- Zellij 4-pane KDL layout
- WSL/bash setup script
- Multi-runtime CLI router (Codex / Gemini / OpenCode subprocess)
- Next.js dashboard (now port 3007 to avoid `apps/web`)

## MISSION

Stand up `private/local-command-center/` as the visual + terminal mode of
Starlight Orchestrator. Consume the existing Voice Operator FastAPI on
port 7373. Add only the net-new layer: Zellij layout, WSL installer,
3 CLI dispatchers, Next.js cockpit with 6 tabs. **No duplicate FastAPI,
no duplicate brand panels, no duplicate agent registry.**

## CONTEXT — read in this order before touching code

1. **`docs/ops/HANDOVER-2026-04-28.md`** — full state of voice-operator (144 tests, 13 workflows, 30+ modules)
2. **`docs/ops/NEXT-SESSION-PROMPT-2026-04-28.md`** — Voice Operator continuation (Phase 1 install + Phase 2 phone)
3. **`docs/specs/2026-04-26-voice-operator-engineering-v1.md`** — engineering spec
4. **`core/orchestrator/README.md`** — layer-10 master (LCC is its visual mode)
5. **`core/orchestrator/harnesses/{claude,codex,gemini,opencode}/`** — system prompts you'll wire into the CLI dispatchers
6. **`agents/starlight-voice-operator.md`** — agent identity (the Anthropic system prompt for VO)
7. **`skills/orchestration/agent-handoff-packet.md`** — packet v1 contract (LCC dispatchers MUST emit valid packets)
8. **`private/voice-operator/service/server.py`** — FastAPI you extend (do not replace)
9. **`private/voice-operator/service/packet_router.py`** — agent dispatcher you extend (add codex/gemini/opencode targets)
10. **`private/voice-operator/client/dashboard/`** — current HTML dashboard (Next.js will replace, consuming the same API)
11. **MEMORY.md** — auto-loads. Pay attention to:
    - `project_voice_operator_v1.md`
    - `project_voice_operator_v1_round3.md`
    - `project_v75_reconciliation.md` (10-IS taxonomy)
    - `feedback_privacy_split.md` (private/ for instance state)
    - `feedback_board_before_tag.md` (substrate gate)

## VERIFIED MACHINE STATE (2026-04-28)

```
zellij 0.43.1   fd 10.4.2     fzf 0.72.0    rg 15.1.0
claude 2.1.121  codex 0.123.0 gemini 0.38.1 opencode 1.14.21
kilocode 7.2.10 bun 1.3.11    gh 2.88.1     jq 1.8.1

~/.claude  ~/.arcanea  ~/.codex  ~/.gemini  ~/.starlight  EXISTS
~/.opencode  config dir MISSING — seed in Phase 0

C:\Users\frank\Starlight-Intelligence-System  EXISTS, on main
C:\Users\frank\Arcanea  EXISTS, separate repo (do NOT modify apps/)
private/voice-operator/ EXISTS, 144 tests passing, FastAPI :7373 ready
```

## ARCHITECTURE (the load-bearing call)

```
                 ┌──────────────────────────────────────┐
                 │   STARLIGHT ORCHESTRATOR (layer 10)  │
                 │   master · routes intent · 10-IS     │
                 └─────────────────┬────────────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
   VOICE COCKPIT             VISUAL COCKPIT                MULTI-CLI HARNESS
   (private/voice-           (private/local-               (extends VO router)
    operator/)                command-center/)              │
       │                           │                           │
       └─────── shared packet contract (skills/orch/) ────────┘
                                   │
                                   ▼
                    SIS substrate (agents · skills · KG)
                    + FastAPI :7373 (voice-operator/server.py)
```

**Identity invariants:**
- Voice Operator owns: mic, STT, TTS, wake-word, phone PWA, FastAPI server.
- Local Command Center owns: Zellij KDL, WSL setup, Codex/Gemini/OpenCode subprocess dispatchers, Next.js cockpit UI.
- Shared by both: packet contract, agent registry, knowledge graph, vaults, brand adapters, approval gate, FastAPI :7373 endpoints.

## OPERATING POSTURE

- **Frank's voice:** Direct. Technical. Warm. Playful. Pattern recognition as poetry.
- **Vibe:** Cool, premium, high intellect, purpose-driven, fun.
- **Substrate vs operational:** LCC is fully operational tier (private/, gitignored). No `/luminor-board` pre-gate needed for additions. Substrate-tier files (`SIP.md`, `SIS.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `agents/*.md` modifications) require board first per `feedback_board_before_tag.md`.
- **Privacy framework:** All instance state in `private/`. Verify `git check-ignore private/local-command-center/` returns the path (gitignored).
- **Tier B/C operations require Frank's hand:** install scripts, Task Scheduler writes, anything modifying `~/`. Prepare and document; he triggers.
- **Test before claiming done.** Voice Operator baseline: **144 passing in 6s**. After your work, `pytest tests/` from `private/voice-operator/` must show **>=150 passing**.

## TASKS, IN ORDER

### Phase 0 — Foundation (sequential, ~30 min)

#### Task 0.1 — Verify and bootstrap
- Run `python -m service.main doctor` from `private/voice-operator/` — confirm baseline.
- Verify Zellij + fd + fzf + rg installed (`command -v zellij`, etc.).
- Create `private/local-command-center/` directory tree:
  ```
  private/local-command-center/
  ├── README.md
  ├── cockpit/
  ├── scripts/
  ├── service/
  ├── apps/dashboard/         # Next.js scaffold goes here in Phase 2
  └── tests/
  ```
- Verify gitignore: `git check-ignore private/local-command-center/` must succeed.

#### Task 0.2 — Author `cockpit/Arcanea.kdl`
Zellij KDL layout, 4 panes:
- Top-left: `claude` CLI with `core/orchestrator/harnesses/claude/system-prompt.md` loaded
- Top-right: `codex` CLI with `core/orchestrator/harnesses/codex/system-prompt.md`
- Bottom-left: `gemini` CLI with `core/orchestrator/harnesses/gemini/system-prompt.md`
- Bottom-right: `opencode` CLI with `core/orchestrator/harnesses/opencode/system-prompt.md`
- Tab bar shows current brand from `~/.starlight/current-brand.txt`
- Status bar: model + cost + RAM via existing zellij plugins

Verify: `zellij --layout private/local-command-center/cockpit/Arcanea.kdl` opens 4 panes correctly.

#### Task 0.3 — Author `scripts/setup-cockpit.sh`
WSL/bash mirror of `private/voice-operator/install.ps1`:
- Verify Python 3.11+ (suggest install if missing — don't auto-install)
- Verify Node 20+ (for the Next.js dashboard)
- Seed `~/.opencode/` config dir if missing
- Seed `~/.starlight/routing.toml` with intent → CLI mapping
- Verify `~/Sovereign/` exists; if not, point to `Init-SovereignOS.ps1`
- Smoke-test: `zellij --layout cockpit/Arcanea.kdl --session smoke` opens then closes cleanly

#### Task 0.4 — Seed `~/.opencode/` + `~/.starlight/`
- `~/.opencode/config.toml` — minimum config (model, max-tokens)
- `~/.starlight/routing.toml`:
  ```toml
  [routing]
  refactor = "codex"
  long-context = "gemini"
  substrate = "claude"
  scratchpad = "opencode"
  voice = "claude"
  ```

#### Phase 0 commit + STOP
```bash
git status --short
# (nothing should appear from private/local-command-center/ — gitignored)
# Only docs/ops/HANDOVER-LCC-PHASE0-2026-04-28.md if you wrote one
git add docs/ops/HANDOVER-LCC-PHASE0-*.md
git commit -m "docs(ops): LCC Phase 0 — foundation verified, scaffolds authored"
# Don't push yet. Verify Phase 0 with Frank, then continue.
```

**REPORT after Phase 0:**
- File tree under `private/local-command-center/`
- Zellij smoke test result (screenshot or output)
- Files in `~/.opencode/`, `~/.starlight/`
- Voice Operator test count (must still be 144)

---

### Phase 1 — Multi-CLI dispatchers (sequential, ~60 min)

#### Task 1.1 — `service/dispatch_codex.py`
Mirror `private/voice-operator/service/dispatch_claude_api.py` shape:
- Class `CodexDispatcher`
- `dispatch(packet) → DispatchResult`
- Subprocess: `codex --json --prompt-file <packet-rendered.md>`
- Stream stdout, parse JSON events
- Honor packet's `do_not_touch` + `must_preserve` constraints (passed in prompt)
- Verify: `proof_required=["codex_response_received"]` on packet, returns response text

#### Task 1.2 — `service/dispatch_gemini.py`
Same shape. Subprocess: `gemini --output-format json -p <prompt>`.
- Bias: long-context tasks (>200K tokens) → Gemini gets the work
- 1M context model

#### Task 1.3 — `service/dispatch_opencode.py`
Same shape. Subprocess: `opencode --no-tui --prompt <prompt>`.
- Bias: latency-bound, scratchpad, <30s round-trip

#### Task 1.4 — `service/orchestrator_router.py`
Cross-CLI routing logic:
- Reads `~/.starlight/routing.toml`
- Classifies packet intent (refactor / long-context / substrate / scratchpad / voice)
- Picks dispatcher accordingly
- Falls back to Claude API (`dispatch_claude_api`) if no rule matches
- Logs routing decision: `logs/routing.jsonl` (last 100 entries)

#### Task 1.5 — Wire into `packet_router.py` (extend, don't replace)
In `private/voice-operator/service/packet_router.py`:
```python
def _dispatch_agent(self, packet, agent_name):
    if agent_name == "claude-code":
        return self._dispatch_claude_code(packet)
    if agent_name == "codex":
        from local_command_center.service.dispatch_codex import CodexDispatcher
        return CodexDispatcher(...).dispatch(packet)
    if agent_name == "gemini":
        ...
    # ... existing branches
```

Note: this requires the LCC service module to be importable. Add a `pyproject.toml` shim
or sys.path append in voice-operator's main, OR keep dispatchers in voice-operator's
service/ directory and let LCC layout reference them. Pick the simpler option.

#### Task 1.6 — Tests
Add `private/voice-operator/tests/test_dispatch_codex.py`, `test_dispatch_gemini.py`,
`test_dispatch_opencode.py`, `test_orchestrator_router.py`. Mock subprocess. Validate:
- Routing rules pick correct dispatcher
- Fallback to Claude API works
- Routing logged to logs/routing.jsonl

Target: voice-operator/tests/ at **>=156 passing** after Phase 1.

#### Phase 1 commit + STOP
```bash
git add docs/ops/HANDOVER-LCC-PHASE1-2026-04-28.md
git commit -m "docs(ops): LCC Phase 1 — multi-CLI dispatchers + tests (156+ passing)"
```

**REPORT after Phase 1:**
- New test count
- Sample routing decision for 3 utterances (refactor / long-context / substrate)
- Any subprocess JSON parsing edge cases discovered

---

### Phase 2 — Next.js cockpit dashboard (sequential, ~120 min)

#### Task 2.1 — Scaffold Next.js app
```bash
cd private/local-command-center/apps/dashboard
bun create next-app . --typescript --tailwind --app --no-eslint --use-bun
```
Configure: Next.js 16.2 (match `Arcanea/apps/web`), React 19, TS strict, Tailwind 3.4,
shadcn/ui, Geist font, `framer-motion` 11. Port: **3007** (avoid 3001 conflict with apps/web).

#### Task 2.2 — Six tab routes
`app/dashboard/[slug]/page.tsx` with slugs:
1. `today` — packet log + activity (consumes `:7373/api/today`)
2. `coding-agents` — live agent constellation (consumes `:7373/ws` for live events)
3. `arcanea` — Arcanea brand panel (consumes `:7373/api/brand/arcanea`)
4. `cowork` — multi-agent topology (TODO: wire to cowork repo when path verified)
5. `starlight-orchestration` — 10-IS visualization + routing rules
6. `frankx` — FrankX brand (Plausible + Stripe + GitHub + Vercel via :7373/api/brand/frankx)

#### Task 2.3 — Shared backend pattern
Every page calls `:7373` API. **No duplicate data layer.** All KPIs, packet
logs, brand stats already there. Just render.

#### Task 2.4 — Premium polish
- Geist for body, Instrument Serif for headings (match Frank's brand)
- shadcn/ui card / table primitives
- framer-motion 240ms transitions (per the Arcanea plan's spec)
- Dark mode default with palette: `--bg #0a0e14, --fg #d8e0f0, --accent #5b9eff`
- Responsive — works on phone too (replace `client/phone/index.html`? Or keep both? Decide based on quality)

#### Task 2.5 — Verify + demo
- `bun dev` from `apps/dashboard/`
- Open `localhost:3007/dashboard/today`
- Speak "Starlight, prepare a Claude Code packet for SIS" via voice-operator chat
- Watch the new packet appear in Today tab within 2s

#### Phase 2 commit + STOP
```bash
git add docs/ops/HANDOVER-LCC-PHASE2-2026-04-28.md
# private/ stays gitignored
git commit -m "docs(ops): LCC Phase 2 — Next.js cockpit dashboard live at :3007"
```

---

### Phase 3 — Coding-agents live visualization (~60 min)

`/dashboard/coding-agents` route renders an active session graph:
- Nodes: Claude Code / Codex / Gemini / OpenCode CLI sessions currently running
- Edges: packet flow between sessions
- Live update via WebSocket from voice-operator's `:7373/ws`
- Color coding: green = idle, blue = active, amber = pending approval, red = error
- Click node → see packet log for that session

Animation: framer-motion, 240ms easing per spec.

#### Phase 3 commit
`feat(LCC): live coding-agents visualization`

---

### Phase 4 — Final integration + handover (~30 min)

- Update `private/voice-operator/README.md` with LCC pointer.
- Update `core/orchestrator/README.md` — note LCC is the visual mode (substrate-clean addition; verify it counts as cross-ref not substrate edit per `feedback_board_before_tag.md`).
- Write `docs/ops/HANDOVER-LCC-2026-04-28.md` with full state.
- Save memory entry: `project_local_command_center_v1.md`.
- Final commit + push (substrate-clean docs only; private/ stays gitignored).

## SAFETY GATES (do not violate)

1. **Tier B/C operations require Frank's explicit hand.** install scripts, schedules, anything in `~/`.
2. **Substrate edits invoke `/luminor-board` BEFORE commit.** Files: `SIP.md`, `SIS.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`, `agents/starlight-voice-operator.md` (modifications, not the existing file), file-contract, attestation rules, sovereignty clause, 10-IS taxonomy.
3. **Never commit `private/`** — verify with `git check-ignore`.
4. **Never put real API keys in code.** `.env` only.
5. **No `--no-verify` on commits. No `--force` on push.**
6. **Don't break voice-operator tests.** 144 baseline must hold.
7. **Don't replace the FastAPI server.** Extend it.

## ACCEPTANCE CRITERIA

| Phase | Done means |
|---|---|
| Phase 0 | Zellij 4-pane opens via KDL · setup script idempotent · ~/.opencode + ~/.starlight seeded · 144 voice-op tests still pass |
| Phase 1 | 156+ tests pass · 3 dispatchers + router work · routing logged to JSONL · 3 sample utterances correctly routed |
| Phase 2 | Next.js dashboard at :3007 · 6 tabs render · all consume :7373 API · packet appears live in Today tab |
| Phase 3 | Coding-agents tab shows ≥1 live session, animated within 2s of packet creation |
| Phase 4 | Handover doc + memory entry committed · LCC referenced from VO + orchestrator READMEs |

## TONE / VOICE

Per `agents/starlight-voice-operator.md`:
- Lead with the action.
- ≤15s responses unless asked for depth.
- One decisive recommendation. No optionality leakage.
- Never say "as an AI". Never narrate process.

## STACK CITATIONS

This work draws from:

- **Arcanea canon** — Lyssandria foundation discipline (Phase 0 rigor), Draconis precision (Architect tier), Ino verifier (test gates). Voice & Video IS at layer 8 of 10-IS stack ships the audio-side; LCC is the visual sibling at layer 10.
- **Starlight Intelligence Protocol v1.1.0** — substrate; sovereignty clause + attestation + 10-IS taxonomy + file-contract; LCC is the visual mode of layer-10 Orchestrator per `core/orchestrator/README.md`.
- **superpowers stack** —
  - `superpowers:writing-plans` — this prompt itself
  - `superpowers:test-driven-development` — 144 → 156+ test trajectory
  - `superpowers:verification-before-completion` — every phase ends with proof
  - `superpowers:dispatching-parallel-agents` — used by orchestrator router for fan-out (council pattern)
  - `superpowers:systematic-debugging` — when CLI subprocess JSON parsing breaks edge cases
- **Luminor Board governance** — substrate-touching changes pressure-tested before commit; LCC is operational so no pre-board needed for additions.
- **OpenClaw integrity** — supply-chain hardening pattern in CI workflows (commit SHA pinning); LCC inherits the pattern.
- **Voice Operator round 1-3** — `private/voice-operator/` is the foundation. LCC extends, does not replace.

---

**Built on SIP** — Local Command Center continuation prompt — 2026-04-28
