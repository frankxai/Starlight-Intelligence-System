# Jarvis Integration Acceptance — 2026-04-29

**Tier:** Operational. Substrate untouched. No `/luminor-board` pre-pass.

> The test plan that says: after the 3 parallel tabs merge + the phone PWA lands,
> is this actually Jarvis-grade? Concrete utterances, concrete acceptance, concrete
> proof.

---

## What's converging tonight

| Source | Surface / capability |
|---|---|
| Tab 1 (`feature/browser-bridge`) | Browser autonomy — `agent:browser` packet target via Playwright + browser-use |
| Tab 2 (`feature/brain-viz`) | 3D `/brain` route in dashboard — react-three-fiber instanced particle cloud |
| Tab 3 (`feature/cognition-cli-complete`) | Codex / Gemini / OpenCode cognition backends + voice pipeline migrated to CognitionRouter |
| Main thread (this tab) | Phone PWA — 4th surface at port 3008 |

**Test count target:** 245 baseline → ≥269 after merge.

---

## Pre-merge ritual

After each tab reports "blocks complete + tests green":

```powershell
# In each worktree, verify
cd C:\Users\frank\jarvis-1-browser
git -C ../Starlight-Intelligence-System log --oneline | head -3
# (no commits expected on tab branches — all work is in private/)

# Run tests in tab 1 (browser-use)
cd C:\Users\frank\Starlight-Intelligence-System\private\voice-operator
python -m pytest tests/test_browser_session.py tests/test_dispatch_browser.py -q

# Run tests in tab 3 (cognition CLI)
python -m pytest tests/test_cognition_codex_cli.py tests/test_cognition_gemini_cli.py \
                 tests/test_cognition_opencode_cli.py -q

# Run full suite — must reach ≥269
python -m pytest tests/ -q
```

If any tab is incomplete, **don't proceed to acceptance** — finish the tab first.

---

## The 7 Jarvis-grade utterances

These are the gold-standard tests. If all 7 pass, you can call this Jarvis-grade.

### Utterance 1 — Deterministic capture (tier 0, $0, ~10ms)

**Say:** "Capture this thought: voice operator validates."

**Acceptance:**
- Vault file `memory/voice-sessions/<today>.md` contains the utterance
- Spoken update: "Captured." (≤3 words)
- Backend: `pattern:capture`
- Latency: <50ms
- Cost: $0.00
- No LLM API call

### Utterance 2 — Tier A build packet (cognition routes correctly)

**Say:** "Prepare a Claude Code packet for SIS to update the README footer."

**Acceptance:**
- Packet built: target=`agent:claude-code`, intent=`build`, tier=A
- `attestation: "built-on-sip"` embedded
- Routes to `agent:claude-code` dispatcher
- Spoken update ≤40 words

### Utterance 3 — Tier C halt (substrate gate intact)

**Say:** "Edit SIP.md to add a new clause about cognition."

**Acceptance:**
- Tier C detected
- target=`agent:luminor-board`
- `do_not_touch` includes `SIP.md`
- Halt panel shown
- No file actually modified
- Spoken update mentions Luminor Board

### Utterance 4 — Browser autonomy (Tab 1 deliverable)

**Say:** "Navigate to anthropic.com and tell me what's new on the homepage."

**Acceptance:**
- Packet built: target=`agent:browser`
- BrowserDispatcher invoked
- Screenshot saved at `private/voice-operator/logs/browser-screenshots/<packet_id>.png`
- DOM snapshot saved
- Returns markdown summary of homepage
- Tier A (read-only browse, no auth credential exposure)

### Utterance 5 — Long-context routing (Tab 3 deliverable, optional)

**Say:** "Read every file in `core/orchestrator/harnesses/` and produce a unified architectural summary."

**Acceptance:**
- `classify_intent` returns `long-context` (because task length + many files)
- routing.toml maps long-context → gemini
- GeminiDispatcher invoked
- routing.jsonl logs the decision
- Returns coherent multi-file synthesis

### Utterance 6 — Council-of-CLIs (stretch goal, optional)

**Say:** "Get a quick scratchpad sketch from OpenCode about caching strategies for the cognition router."

**Acceptance:**
- `classify_intent` returns `scratchpad`
- routing.toml maps scratchpad → opencode
- OpenCodeDispatcher invoked (~50ms TTFT via Cerebras)
- Cost: ~$0
- Returns response in <2s

### Utterance 7 — End-to-end via phone

**Phone setup:** Tailscale on phone + Mac/PC. Phone Safari opens `http://<windows-machine>:3008`.

**Action:** Tap **Voice** tab → record "Capture this from phone: Jarvis-grade end of day 2026-04-29." → release.

**Acceptance:**
- Phone shows recording animation while pressed
- Audio uploads to `/api/voice` → FastAPI :7373
- Capture appears in `memory/voice-sessions/<today>.md`
- Phone Pulse tab shows captures count incremented
- Phone receives spoken update: "Captured." (or similar)

**⚠ Note:** This requires `POST /v1/voice` exposed in FastAPI — see Phase 5 follow-up below.

---

## Visual surfaces — what to look at

### Desktop dashboard (port 3007)

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\dashboard
npm install     # one-time
npm run dev     # opens localhost:3007
```

Acceptance:
- Header shows brand: **Arcanea** + green pulse dot
- Center panel: live routing decisions feed (updates within 2s of each utterance)
- Right rail: today's captures
- Left rail: cognition + voice key state, FastAPI online indicator

### Brain viz (Tab 2 deliverable, port 3007/brain)

```powershell
# Same dev server, navigate to /brain
```

Acceptance:
- 3D scene renders within 3s
- Particles: ~N nodes (N = entries in `memory/knowledge-graph/`)
- 60fps drag/rotate
- Hover → tooltip with metadata
- Time-warp slider works

### Phone PWA (port 3008)

```powershell
cd C:\Users\frank\Starlight-Intelligence-System\private\local-command-center\apps\phone
npm install
npm run dev      # binds 0.0.0.0:3008
# Phone: open http://<windows-tailscale-name>:3008 in Safari
# Add to Home Screen → installs as PWA
```

Acceptance:
- Loads in <2s on cellular
- Bottom nav: Pulse / Voice / Gate
- Pulse tab shows live counts
- Voice tab: tap-record-release works, returns spoken update
- Gate tab: shows pending Tier B/C approvals; approve/reject works

### Zellij cockpit (terminal)

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
zellij --layout private\local-command-center\cockpit\Arcanea.kdl --session arcanea
```

Acceptance:
- 4-pane grid renders: claude / codex / gemini / opencode
- Voice tab opens text-mode chat
- Server tab runs FastAPI

---

## Phase 5 follow-up — wire FastAPI for phone

The phone PWA is complete on its side, but FastAPI :7373 doesn't yet expose:

| Endpoint | Purpose | Effort |
|---|---|---|
| `POST /v1/voice` | Accept multipart audio → STT → cognition router → return result | ~30 min |
| `POST /v1/approvals/<id>/approve` | Mark queue entry approved (also unblocks dispatch) | ~10 min |
| `POST /v1/approvals/<id>/reject` | Mark queue entry rejected | ~10 min |

These are small route handlers calling existing pipeline. Add to
`private/voice-operator/service/server.py`. Phone PWA returns helpful 501 messages
with hints when these aren't yet wired — graceful degradation.

**Don't bundle this with the merge.** Ship it as a separate v7.5.4 release once
tabs 1-3 land and you've smoked the desktop side.

---

## Merge ritual (when all 4 streams green)

Since all work is in `private/` (gitignored), there's nothing to merge through git
branches. The "merge" is just consolidation of any tracked-file changes (mostly
tests in tab 3, possibly handover doc updates from main thread):

```powershell
cd C:\Users\frank\Starlight-Intelligence-System

# If tabs added tests under private/voice-operator/tests/ — those are gitignored.
# Tab 3 may have edited service/cognition/backends/__init__.py — that's gitignored too.

# What COULD be tracked:
# - docs/ops/HANDOVER-* per tab if they wrote one
# - test/ at substrate level (unlikely; tabs were operational tier)

# Verify nothing leaked into substrate
git status --short

# If clean → all tab work landed in private/, no merge needed
# Just clean up worktrees:
git worktree remove ..\jarvis-1-browser
git worktree remove ..\jarvis-2-brain
git worktree remove ..\jarvis-3-cognition

# Branches can be deleted (they tracked nothing meaningful for this body of work)
git branch -D feature/browser-bridge feature/brain-viz feature/cognition-cli-complete
```

This is the structural insight from the worktree-private gap: **gitignored work
doesn't need branches**. The branches were vestigial. Future parallel work in
`private/` should run in shared sessions or with the junction pattern, skipping
the branch ceremony.

---

## Post-acceptance: tag + handover

If all 7 utterances pass:

```powershell
# Write the v7.5.3-jarvis handover
# (suggested at docs/ops/HANDOVER-JARVIS-2026-04-29.md — main thread can do this)

# Memory entry
# (already written: ~/.claude/.../memory/project_v753_cognition_lcc.md)

# Optional: tag the substrate-tier state
git tag v7.5.3-cockpit-complete -m "4 surfaces live: terminal + voice + dashboard + phone"
git push origin v7.5.3-cockpit-complete
```

---

## Failure modes — what to debug if something breaks

| Symptom | Likely cause | Fix |
|---|---|---|
| Test count <269 | One of the tabs didn't ship its tests | Check tab status; rerun pytest in voice-operator/ |
| Browser navigation hangs | playwright Chromium not installed | `playwright install chromium` |
| Brain viz blank | Knowledge graph empty | Run a few capture utterances first; refresh `/brain` |
| Phone can't reach FastAPI | Tailscale not connecting OR FastAPI not on 0.0.0.0 | `python -m service.main serve --host 0.0.0.0 --port 7373` |
| `/api/voice` returns 501 | FastAPI `/v1/voice` not yet exposed | Phase 5 follow-up; expected — phone falls back gracefully |
| Substrate file modified accidentally | Tab agent overstepped tier | `git diff` to see; `git checkout` to revert; flag in retro |

---

## What "Jarvis-grade" means here, honestly

It does NOT mean:
- AGI
- Sentient assistant
- Cinematic floating holograms
- Agent that solves problems you didn't ask about

It DOES mean:
- 4 surfaces working in concert (terminal / voice / dashboard / phone)
- Browser autonomy on demand
- Memory visualized
- Multi-CLI cognition router routing to the cheapest viable provider
- Sovereignty + attestation through every artifact
- Tier C halts hold under stress
- Frank can ask his phone to do something, the cockpit does it, the dashboard shows it, the terminal logs it

If those 7 utterances pass, **call this Jarvis-grade and tag the ship**. Don't
let perfect be the enemy of done. Phase 6 (productization) starts the day after.
