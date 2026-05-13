# Handover Packet — Arcanea sibling tab — Phase 0.4

**Dispatcher:** SIS substrate tab (Claude Opus 4.7 1M)
**Target tab:** Claude Code session opened on `C:\Users\frank\Arcanea\`
**Authored:** 2026-05-13
**Reference plan:** ULTRAPLAN Phase 0.4 (`Starlight-Intelligence-System/docs/ops/ULTRAPLAN-2026-05-12.md`)

## Scope

ULTRAPLAN identified `arcanea-voice/src/transcribe.mjs` as a 50–100ms latency bleed and `curl.exe` dependency surface. This packet bundles the exact edit + the test plan + the rollback so a fresh sibling tab can ship the change in one short session.

## Target file

```
C:\Users\frank\Arcanea\packages\arcanea-voice\src\transcribe.mjs
```

Lines 33–39 (the curl invocation) and lines 50–71 (the Python-whisper fallback that becomes dead code once Groq cascade is sole STT).

## Current state (per ULTRAPLAN audit 2026-05-12, verify before editing)

`transcribe.mjs:33-39` shells out via `spawnSync('curl', ...)` per utterance:

- Windows cold-spawn cost: ~50–100ms each turn
- External `curl.exe` dependency (not always on `PATH` after laptop rebuild — see SIS memory `feedback_ps7_first_after_rebuild.md` for the analogous rebuild gotcha)
- Sync subprocess blocks the Node event loop

`transcribe.mjs:50-71`: Python whisper fallback. Per ULTRAPLAN: "100 lines of dead code" because Groq is primary and faster-whisper local STT is the documented offline-sovereignty path (see SIS memory `project_jarvis_intelligence_layer.md` for the Orpheus + Groq choice).

## The fix

Replace `spawnSync('curl', ...)` with native `fetch` + `FormData`:

```javascript
// Before (lines 33-39 region, paraphrased — verify exact shape against current file):
const result = spawnSync('curl', [
  '-s', '-X', 'POST',
  'https://api.groq.com/openai/v1/audio/transcriptions',
  '-H', `Authorization: Bearer ${apiKey}`,
  '-F', `file=@${audioFilePath}`,
  '-F', 'model=whisper-large-v3',
]);
const json = JSON.parse(result.stdout.toString());

// After (Node 18+ has native fetch + FormData):
const form = new FormData();
const buf = await readFile(audioFilePath);
form.append('file', new Blob([buf]), 'audio.wav');
form.append('model', 'whisper-large-v3');
const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: form,
});
if (!resp.ok) {
  throw new Error(`Groq STT failed ${resp.status}: ${await resp.text()}`);
}
const json = await resp.json();
```

Then **delete** the Python-whisper fallback (lines 50–71) if its only role is "fallback when curl is missing" — which is no longer relevant.

## Verification steps (in order)

1. Confirm Node 18+ in the Arcanea repo: `node --version` (should be >= 18 for native FormData; 24.x preferred per SIS's own better-sqlite3 reconciliation)
2. Run any existing arcanea-voice tests: `cd packages/arcanea-voice && npm test` (or whatever the package's test script is)
3. Hand-fire a single utterance through the orb (`:7777`) and measure round-trip — should drop noticeably
4. Confirm `curl.exe` is no longer in the dependency graph by grepping `transcribe.mjs` for `spawn|curl` — should be empty
5. Confirm the dead-code section was removed cleanly (no dangling imports)

## Rollback

If the fetch path produces a different response shape than curl's stdout (e.g. Node's `fetch` adds wrapper fields not present in raw curl output), revert via `git revert <commit>`. The shape is empirically straightforward (Groq returns the same JSON either way), but verify before committing to production.

## Rollback safety

Per SIS memory `feedback_lead_with_authority.md`: drive end-to-end. Don't pause at a gate after the fix lands + tests pass. Don't ask for permission to revert if the experiment fails — just revert.

## What NOT to do in this packet's scope

- Don't restructure the cognition router (separate dispatch).
- Don't change the voice persona / model selection (already established in `start-cockpit.ps1`'s `orbEnv` from the SIS launcher).
- Don't introduce a new STT vendor (Deepgram Nova-3 is Phase 1 of ULTRAPLAN; this packet is Phase 0).

## Commit message template

```
fix(voice): replace spawnSync('curl') with native fetch in transcribe.mjs

Catches ULTRAPLAN Phase 0.4 — Windows cold-spawn cost ~50-100ms per utterance
plus curl.exe dependency removed. Native fetch + FormData (Node 18+).

Verified:
- npm test (arcanea-voice package): N passing
- Hand-fired orb utterance: round-trip dropped ~XXms (measure)
- No curl/spawn references remain in transcribe.mjs

Dead code: removed Python whisper fallback (~20 lines) — Groq is primary,
faster-whisper handled separately as offline-sovereignty path.

Reference: SIS docs/ops/ULTRAPLAN-2026-05-12.md Phase 0.4
Reference: SIS docs/ops/HANDOVER-PACKET-ARCANEA-PHASE-0.4-2026-05-13.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## Cross-repo coordination back to SIS

After the Arcanea commit lands, leave a one-line entry in the SIS-side memory: `~/.claude/projects/C--Users-frank-Starlight-Intelligence-System/memory/MEMORY.md` index entry pointing at a new topic file describing the cross-repo ship.

---

## Built on SIP · Operational Tier
