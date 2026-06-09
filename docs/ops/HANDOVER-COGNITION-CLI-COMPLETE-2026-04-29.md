# Handover — Cognition CLI Completion + Voice Pipeline Migration

**Date:** 2026-04-29
**Operator:** Cognition Completion Architect (Lyssandria + Draconis + Ino braid)
**Tab:** 3 of 3 in the v7.5.3 parallel push (Tab 1 = browser-bridge, Tab 2 = brain-viz, Tab 3 = cognition CLI)
**Tier:** Operational. No substrate files touched. No `/luminor-board` pre-pass required.

---

## TL;DR

**The headline:** Voice mode and text mode now share one cognition layer. The pure $0 path (no API tokens) is live and proven — `COGNITION_PRIMARY_BACKEND=claude-code-cli` with both API keys unset routes cognition through your Claude Max plan via subprocess. Both smoke (a) OpenRouter and (b) Claude-CLI confirmed live.

**Test progression:** 245 (baseline) → 295 (current). Tab 3 contribution: +39 tests across 4 net-new test files + 2 edited; Tab 1 contributed +11 (`test_browser_session.py`); Tab 2's `test_brain_graph.py` is still in TDD red and excluded from my runs.

**One-line summary:** "One mind, four bodies" is now real for cognition: every utterance — typed, spoken, future-mic, future-phone — flows through the same `CognitionRouter` regardless of which backend (text-API or any of 4 CLIs) is primary.

---

## Shipped this session

### Block A — Three CLI cognition backends

`service/cognition/backends/`
- `codex_cli.py` — `codex --json` via stdin (matches handover dispatcher pattern)
- `gemini_cli.py` — `gemini --output-format json -p <prompt>` (prompt as flag arg, not stdin — Gemini's CLI shape)
- `opencode_cli.py` — `opencode --no-tui --prompt <prompt>` (raw model output, no envelope)

Each backend:
- Eager `find_cli` at construction → fail fast at `build_router_from_env` time
- Uses the shared `_cli_subprocess` helpers (no duplicate subprocess code)
- Returns `CognitionResult` matching the existing contract (`packet`, `spoken_update`, `tier`, `backend`, `latency_ms`, `cost_usd`)
- Backend identifier: `"codex-cli"` / `"gemini-cli"` / `"opencode-cli"`
- Errors raised as `{Codex,Gemini,OpenCode}CliError` (all `RuntimeError` subclasses, so router's existing `except RuntimeError` for missing CLIs still works)

Tests: 18 net-new (6 per backend), all mock `subprocess.run` + `shutil.which`.

### Block B — Router + config wiring

`service/cognition/router.py`:
- `build_router_from_env` extended with `enable_codex_cli` / `enable_gemini_cli` / `enable_opencode_cli` boolean params
- New `primary_backend_override` param wired from env `COGNITION_PRIMARY_BACKEND`
  - When set to a CLI backend name, that CLI is auto-enabled (so Frank doesn't need to set both `COGNITION_PRIMARY_BACKEND=codex-cli` AND `COGNITION_ENABLE_CODEX_CLI=true`)
  - Validates the override is in registered backends after build; raises with helpful error otherwise
- Halt-tier candidate ordering codified as `_HALT_CANDIDATES = ("anthropic-direct", "claude-code-cli", "openrouter")` — explicitly excludes the 3 new CLI backends. Halt re-judge needs strong-refusal posture; codex/gemini/opencode run different model families and must not auto-fill that role
- **Bug fix:** halt resolution now validates explicit `halt_backend_name` against registered backends. Previously when `cognition.toml` defaulted halt to `anthropic-direct` and the Anthropic key was absent, the halt name pointed at a non-existent backend (silent dead config). Router now logs a warning and walks the candidate list

`service/config.py`:
- 4 new `Config` fields: `enable_codex_cli`, `enable_gemini_cli`, `enable_opencode_cli`, `cognition_primary_backend`
- `load()` precondition relaxed: zero-API-key path is now valid when `COGNITION_PRIMARY_BACKEND` names a CLI backend. Updated error message points at the $0 path

`service/text_mode.py`: passes the new flags + override through to `build_router_from_env`.

Tests: 6 net-new, covering each enable flag, the zero-API-key override path, override-auto-enables-CLI, and the never-CLI-for-halt invariant.

### Block C — Pipeline migration to CognitionRouter

`service/pipeline.py`:
- `PipelineComponents.agent: AgentClient` → `cognition: CognitionRouter`
- `build()` now constructs the cognition router via `build_router_from_env` with the same args text_mode uses
- `run_one_turn` calls `components.cognition.route(transcript.text, history=[])`, handles `CognitionResult.direct_action` for Tier 0 deterministic captures (mirrors text_mode's existing path), then proceeds through `packet → gate → router → tts`
- `from .agent_client import AgentClient` removed
- Voice-mode precondition error rewritten: now lists all three valid configurations (OpenRouter / Anthropic / `COGNITION_PRIMARY_BACKEND=...-cli`)

Tests: 2 net-new in `tests/test_pipeline_voice.py` — stubs audio deps at `sys.modules` (process doesn't have `sounddevice`/`faster_whisper`), constructs `PipelineComponents` with mocked collaborators, asserts the cognition surface is the call site (not legacy `AgentClient`), asserts capture path writes vault, asserts packet path reaches `router.execute(packet)`.

### Block D — Doctor + live smoke

`service/doctor.py`:
- New `cognition keys` check accepts the CLI-primary path (no longer fails when API keys missing if `COGNITION_PRIMARY_BACKEND` is a CLI backend)
- New `COGNITION_PRIMARY_BACKEND=<x>` check: when set, verifies the matching CLI binary is on PATH; flags unknown backend names as required failures

Tests: 2 net-new in `test_doctor.py`.

**Live smoke proof (run from this session):**

| Test | Mode | Result |
|------|------|--------|
| (a-1) | OpenRouter default + capture | ✅ Tier 0, 0ms, vault write |
| (a-2) initial | OpenRouter default + LLM query | ⚠️ Hit pre-existing JSON parser bug (now fixed below) |
| (a-2) after fix | same | ✅ Live OpenRouter→Sonnet, 3s, parsed cleanly |
| (b-1) | $0 path + capture | ✅ Zero API keys, Tier 0, vault write |
| (b-2) | $0 path + LLM query | ✅ **Real Claude CLI invocation, accurate response citing v7.5.3 commits + test counts from MEMORY.md** |

### Bonus fixes (latent bugs surfaced + fixed during smoke)

1. **`tests/test_smoke_e2e.py` fixture** — `monkeypatch.delenv("OPENROUTER_API_KEY")` was being silently overridden by `config.load()`'s `load_dotenv(.env)` re-injecting the real key from disk. Switched to empty-string env override (`load_dotenv` skips already-set vars). Unblocks the 6 smoke tests that were failing in baseline despite the previous handover claiming "245 passing".
2. **Halt validation** — see Block B above.
3. **JSON extraction robustness** — surfaced by smoke (a-2). Sonnet now returns markdown-fenced JSON with trailing prose; the `index('{')` / `rindex('}')` fallback in `OpenRouterBackend._parse_json` (and the same pattern in all 3 new CLI backends) couldn't handle multi-block output. Factored into `service/cognition/_json.py::extract_first_json_object` using `json.JSONDecoder.raw_decode` — peels markdown fences first, then parses the first complete JSON object regardless of trailing data. Wired into all 4 backends. 11 new tests covering pure JSON, fenced JSON with prose, prose-embedded JSON, and error cases.

### Test ledger (after all changes)

| File | Tests |
|------|-------|
| `test_cognition_codex_cli.py` (NEW) | 6 |
| `test_cognition_gemini_cli.py` (NEW) | 6 |
| `test_cognition_opencode_cli.py` (NEW) | 6 |
| `test_cognition_router.py` (added `TestCliBackendsAndPrimaryOverride`) | +6 (12→18) |
| `test_pipeline_voice.py` (NEW) | 2 |
| `test_doctor.py` (added 2 cases) | +2 (3→5) |
| `test_cognition_json_utils.py` (NEW) | 11 |
| **Total Tab 3 contribution** | **+39** |

Combined: 295 passing (245 baseline + 39 mine + 11 Tab 1 browser-bridge). Tab 2's `test_brain_graph.py` excluded (still in red — TDD in progress).

---

## What's now live and how it works

### Cognition layer (one mind)

```
service/cognition/
├── deterministic.py              ← Tier 0: pattern match (10ms, $0)
├── router.py                     ← picks tier, fallback, halt re-judge, primary override
├── system_prompt.py              ← shared prompt builder
├── types.py                      ← CognitionResult dataclass
├── _json.py                      ← shared robust JSON extractor (NEW)
└── backends/
    ├── openrouter.py             ← Tier 1 hot (Cerebras llama-4-scout: 50ms TTFT)
    ├── anthropic_direct.py       ← legacy AgentClient wrapper
    ├── claude_code_cli.py        ← cold path, $0 marginal on Max plan
    ├── codex_cli.py              ← NEW — codex --json
    ├── gemini_cli.py             ← NEW — gemini --output-format json -p
    └── opencode_cli.py           ← NEW — opencode --no-tui --prompt
```

### Resolution order (in `build_router_from_env`)

1. If `COGNITION_PRIMARY_BACKEND=<x>` is set → primary = `<x>` (auto-enables matching CLI)
2. Else if `OPENROUTER_API_KEY` set → primary = `openrouter`
3. Else if `ANTHROPIC_API_KEY` set → primary = `anthropic-direct`
4. Else if any CLI backend enabled and present → primary = first enabled CLI
5. Else → `ValueError`

### Halt re-judge (Tier C escalation)

Resolution: explicit `halt_backend_name` (validated against registered backends) → else `_HALT_CANDIDATES` walk: `anthropic-direct` → `claude-code-cli` → `openrouter`. The 3 new CLI backends are deliberately excluded — they run different model families from Sonnet's strong refusal posture.

### "One mind, four bodies"

```
                  ┌─────────────────────────────┐
                  │     CognitionRouter         │
                  │  (deterministic / hot LLM)  │
                  └────────────┬────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼─────┐          ┌─────▼──────┐         ┌─────▼─────┐
   │ text     │          │  voice     │         │ phone     │
   │ mode CLI │          │ pipeline   │         │ (Phase 5) │
   │ (typed)  │          │ (mic→tts)  │         │           │
   └──────────┘          └────────────┘         └───────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                  Same CognitionRouter instance.
                  Same packet schema.
                  Same approval gate.
                  Same packet router → 4 dispatchers.
```

Voice mode pipeline migration (Block C) was the keystone: now `pipeline.py` has zero direct LLM-SDK calls. All cognition flows through the router.

---

## How to use it

### Default (recommended for voice — TTFT matters)

```powershell
# .env has OPENROUTER_API_KEY set; nothing else needed.
python -m service.main chat --once "Capture this thought."
```

### Pure $0 path (Frank's Max plan, no API tokens)

```powershell
$env:COGNITION_PRIMARY_BACKEND="claude-code-cli"
$env:OPENROUTER_API_KEY=""
$env:ANTHROPIC_API_KEY=""
python -m service.main chat --once "What changed in the cognition layer today?"
```

### Specialty CLIs

```powershell
# Long-context tasks (1M tokens via Gemini)
$env:COGNITION_PRIMARY_BACKEND="gemini-cli"

# Mechanical refactors (Codex)
$env:COGNITION_PRIMARY_BACKEND="codex-cli"

# Speed-bound exploratory (OpenCode → Cerebras)
$env:COGNITION_PRIMARY_BACKEND="opencode-cli"
```

### Doctor

```powershell
python -m service.main doctor
# All required checks pass.
```

---

## Did Tab 3 deliver everything the prompt asked for

**Yes, plus three latent fixes.** Acceptance criteria from the original prompt:

| Block | Required | Delivered |
|-------|----------|-----------|
| A | codex/gemini/opencode cognition backends · 18 tests · 263+ total | ✅ 18 tests, total 263 after Block A |
| B | `build_router_from_env` supports 3 new flags · 267+ tests | ✅ 6 router tests, total 269 after Block B |
| C | `pipeline.py` uses CognitionRouter · `AgentClient` gone from `pipeline.py` | ✅ Migrated; `grep AgentClient pipeline.py` returns zero |
| D | Text mode works with no API keys, `COGNITION_PRIMARY_BACKEND=claude-code-cli` | ✅ **Live-verified end-to-end** in this session |

Beyond the prompt:
- Smoke fixture fix unblocked 6 pre-existing failing tests in baseline
- Halt-validation fix removes a silent dead-config trap when API keys absent
- JSON extraction robustness handles current Sonnet-via-OpenRouter output (markdown-fenced + trailing prose)

---

## What still needs to happen for Frank's full vision

Source: `docs/strategy/COCKPIT-VISION-v753-2026-04-28.md` §13 ("the next 5 ships") and §9 (Jarvis-grade gap).

### Cognition layer — DONE

The cognition substrate is now feature-complete for the v7.5.3 horizon. Future enhancements (smarter Tier classification, learned routing per `cognition.toml`, etc.) are Phase 5+.

### Closing in this same parallel push (Tabs 1 + 2)

| Surface | Owner | Status |
|---------|-------|--------|
| Browser autonomy (`agent:browser` packet target) | Tab 1 | In progress — `test_browser_session.py` already passing 11 tests |
| Brain graph viz (3D) at dashboard `/brain` | Tab 2 | In progress — `test_brain_graph.py` in TDD red, source pending |

### Voice mode — ready in code, needs install

The pipeline is migrated and unit-tested with mocks. Live voice end-to-end requires:
1. `pip install sounddevice pvporcupine faster-whisper elevenlabs` (or `uv sync`)
2. Train Porcupine wake-word "Starlight" at https://console.picovoice.ai → drop the `.ppn` at `private/voice-operator/models/porcupine/Starlight.ppn`
3. ELEVENLABS_API_KEY + PICOVOICE_ACCESS_KEY in `.env`
4. Run `python -m service.main voice` (the existing voice command — pipeline.py is what it invokes)

After (1)–(4), voice mode will go through the same CognitionRouter as text mode. No code change needed.

### Phone surface — Phase 5 (1 week)

Per Vision §13:
- Same Next.js app at `:3007`, deployed to Vercel
- Tailscale tunnel for sovereign access (recommended over Cloudflare Access per Vision §14)
- WebSocket client to FastAPI `:7373`
- Push notifications for Tier B/C approvals

### Productization — Phase 6 (2 weeks)

Per Vision §6 "5 channels":
- Digital products ($29-99) → 2 weeks
- Boilerplate ($99-499) → 1 month
- Agentic-as-a-service ($29-299/mo) → 3 months
- DPI ledger → 6 months
- Smart-contract attestation → 12 months (Phase 7+)

### Long-tail (Phase 7+)

- Reasoning cortex feedback loop (basal ganglia analog — see Vision §11)
- Agent swarm coordinator with concrete weekly use cases (don't build before 3 use cases exist)
- Voyager-style agent self-tooling
- Bittensor / Olas economic layer

---

## Caveats Frank should know

1. **Halt re-judge in pure CLI mode is None.** Without an Anthropic API key or claude-code-cli-as-secondary, Tier C halts get the primary's verdict only — no Sonnet re-judge. To get re-judge in pure-CLI mode, either set `ANTHROPIC_API_KEY` (small fee per halt) or accept the primary's verdict.
2. **`OpenRouterBackend` provider routing for Cerebras still works** but voice's hot path now flows through the same router as text — verify TTFT on a few real voice mic-driven utterances once audio deps are installed; the latency budget hasn't changed in code but should be measured.
3. **The cross-worktree contamination risk:** the original parallel-tabs design assumed worktree isolation, but `private/voice-operator/` is gitignored so worktrees don't isolate it. All 3 tabs are operating against the same physical directory. This is fine because the test surfaces are mostly disjoint, but coordinate before any mass refactor.
4. **Nothing committed to git.** All Tab 3 changes are in `private/voice-operator/` (gitignored). Files are on disk and importable; nothing to push or merge.

---

## Files touched (Tab 3 only)

### Net-new (5 source + 4 test)

```
service/cognition/_json.py
service/cognition/backends/codex_cli.py
service/cognition/backends/gemini_cli.py
service/cognition/backends/opencode_cli.py
tests/test_cognition_codex_cli.py
tests/test_cognition_gemini_cli.py
tests/test_cognition_opencode_cli.py
tests/test_cognition_json_utils.py
tests/test_pipeline_voice.py
```

### Edited (8)

```
service/cognition/backends/__init__.py    (exports + 3 new)
service/cognition/backends/openrouter.py  (uses _json.extract_first_json_object)
service/cognition/router.py               (3 new flags + override + halt validation)
service/config.py                         (4 new fields + relaxed precondition)
service/doctor.py                         (cognition_primary_backend check)
service/pipeline.py                       (AgentClient → CognitionRouter migration)
service/text_mode.py                      (passes new flags through)
tests/test_smoke_e2e.py                   (fixture fix: empty-string env vs delenv)
tests/test_cognition_router.py            (+TestCliBackendsAndPrimaryOverride)
tests/test_doctor.py                      (+2 cases for new check)
```

---

## Suggested memory entry (when Frank chooses to write it)

Append to `MEMORY.md` (extending the existing v7.5.3 entry, line 21):

```
- [v7.5.3 Tab 3 — Cognition CLI complete + voice pipeline migration]
  (project_v753_tab3_cognition_complete.md) — 2026-04-29 (uncommitted; private/).
  Three CLI cognition backends (codex, gemini, opencode). pipeline.py migrated:
  AgentClient gone, CognitionRouter is the single cognition surface for both
  text and voice modes. COGNITION_PRIMARY_BACKEND env var enables pure $0 path
  on Max plan — proven live. JSON extractor + halt-validation + smoke-fixture
  bugs fixed. 245→295 tests (Tab 3 +39, Tab 1 +11).
```

---

*Built on SIP. Operational tier. No substrate edit.*
