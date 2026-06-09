# Demo Recording Plan — Friday 2026-05-15

> Friday is a one-shot live event. Excellence = a recording that compounds. This doc names the stack, the protocol, the storage path, and the attestation framing.
>
> **Tier:** operational.
> **Companion script:** `scripts/record-demo.ps1` (semi-automated driver).
>
> Built on SIP — operational tier (demo recording).

---

## 1. Why record at all

Three compounding surfaces, ranked by leverage:

1. **Onboarding compound.** The friend-starter pack ships with "watch this 3-minute recording first" — a non-technical friend (Ana) sees the substrate move before reading any docs. Cuts cold-start time from ~30 minutes of reading to ~3 minutes of watching.
2. **Distribution compound.** Twitter/X clip · LinkedIn long-form · YouTube full-length. One artifact, three surfaces. The audience that finds you through a 30-second hook ends up at a 3-minute proof or a 15-minute deep-dive without you ever opening a stream.
3. **Archive compound.** Future-Frank in six months looks back at v0.1 origin. Future-anyone (alliance partner, sovereign fork, audit reviewer) can verify "this is what the substrate could do on day one." The recording becomes an attestation artifact in its own right.

A live demo without a recording is a candle. A live demo WITH a recording is a torch lit at the candle.

---

## 2. Recommended stack — and why

**Primary recommendation: OBS Studio (FOSS) + manual protocol.**

Not Loom (cloud-hosted, ad-supported, attestation surface unstable). Not Remotion (overkill for a screen capture; better suited for synthetic motion graphics, not live demos). Not Windows Game Bar (no scene control, no overlay management). Not a custom PowerShell ScreenRecord API (Windows screen-recording APIs from PowerShell are fragile — `ffmpeg` via gdigrab works but tearing on multi-monitor is a known issue).

**OBS Studio** is the right tool because:

- Free, open source, MIT-style license — no attestation conflict with SIP.
- Native scene support (Browser + Terminal + Brain-viz can each be a scene; one keybind switches between them).
- Records to MP4 / MKV directly to a local path you control. No cloud roundtrip. No third-party metadata injection.
- One-time setup; manual record/stop is fine for a 3-minute demo.
- Cross-platform if Frank ever moves to macOS or Linux.
- Has a stable CLI (`obs64.exe --startrecording --minimize-to-tray`) that the `scripts/record-demo.ps1` driver can invoke.

**Secondary: ShareX (FOSS).** If OBS is overkill for the 3-minute capture, ShareX's screen-record-region tool is one-click capture-to-file with ffmpeg under the hood. Less control, faster setup. Reasonable fallback.

**Tertiary (NOT recommended): Loom.** Cloud-hosted, ad-supported tier shows banners that contaminate the frame. Free tier limits clip length. Records to Loom's CDN, not your disk. Attestation embedded in OBS-recorded MP4 (via metadata sidecar) survives any platform; Loom adds its own watermark you cannot strip without paying.

---

## 3. What to capture

**Three artifacts, one recording session:**

| Artifact | Duration | Source | Use |
|---|---|---|---|
| **Full demo** | ~8-10 min | OBS capture of the 10-step path end-to-end, with narration audio | YouTube long-form · archive |
| **3-minute cut** | ~3 min | edited from the full demo (drop steps 4-6 condensation, keep steps 1-3 + 7-10) | LinkedIn · friend-starter pack onboarding |
| **30-second hook** | ~30 sec | the moment WorkPacket appears in the ledger + Brain Graph pulse + Council seven-archetype reveal | Twitter/X · TikTok-style social |

All three derive from the same OBS capture. Edit pass takes ~30 minutes in DaVinci Resolve (free) or ShotCut (FOSS).

**Audio:** record narration LIVE during the demo run via OBS audio track (USB mic). Do NOT re-record narration over the top — the natural pauses where you wait for the command to complete are part of the substrate-is-real proof. Demo voice = Frank, not a synthesized read.

---

## 4. Where it gets stored

```
memory/recordings/                         # repo-root, gitignored (large binaries)
├── README.md                              # in-repo pointer + storage policy
├── 2026-05-15-friday-demo-v01/            # one folder per recording session
│   ├── 01-full-demo.mp4                   # OBS raw capture, 1080p, ~500MB
│   ├── 02-three-min-cut.mp4               # edited, ~50MB
│   ├── 03-thirty-sec-hook.mp4             # edited, ~10MB
│   ├── attestation.json                   # SHA-256 hashes + SIP attestation block
│   ├── narration-script.md                # what Frank actually said, transcribed post-hoc
│   └── distribution-log.md                # where each cut was posted, when, response
```

**Why `memory/recordings/` and not `private/`:**

Recordings are public artifacts (intended for distribution). They live in a public-facing namespace but the binaries themselves are gitignored — pushed to a separate object store (Cloudflare R2, S3, or a self-hosted MinIO if/when Phase-3 cloud lobby ships). The repo holds the **manifest + attestation** in JSON; the binaries live in object storage with stable URLs referenced from the manifest.

**Naming convention:**

`<ISO-date>-<event>-<version>-<artifact>.mp4`

Examples:
- `2026-05-15-friday-demo-v01-full.mp4`
- `2026-05-15-friday-demo-v01-three-min.mp4`
- `2026-05-15-friday-demo-v01-hook.mp4`

ISO date first guarantees lexicographic sort = chronological sort. Future-Frank scanning the directory sees the timeline at a glance.

---

## 5. Attestation framing

Every recording is an artifact under SIP. Every artifact carries attestation. The recording's attestation block goes in the **video metadata** (XMP/ID3 tags via ffmpeg) AND in a sidecar `attestation.json`.

**Sidecar template** (`memory/recordings/2026-05-15-friday-demo-v01/attestation.json`):

```json
{
  "artifact": "2026-05-15-friday-demo-v01",
  "type": "demo-recording",
  "files": [
    { "name": "01-full-demo.mp4", "sha256": "...", "duration_sec": 480 },
    { "name": "02-three-min-cut.mp4", "sha256": "...", "duration_sec": 180 },
    { "name": "03-thirty-sec-hook.mp4", "sha256": "...", "duration_sec": 30 }
  ],
  "substrate": "starlightintelligence.org/protocol",
  "sip_version": "1.1.1",
  "sis_version": "v0.1",
  "layers_used": ["file-contract", "attestation", "council", "vault-loop", "mcp-server"],
  "captured_at": "2026-05-15T...",
  "captured_by": "frank",
  "license": "MIT (code surfaces shown) + CC-BY-4.0 (recording itself)"
}
```

In the recorded narration, near the end, Frank says one sentence: "Everything you just saw is built on SIP — sovereign intelligence protocol, attestation-aware substrate, fork it at starlightintelligence.org." That's the spoken attestation. Combined with the sidecar JSON, it's a closed loop.

---

## 6. The recording protocol — manual, 10 minutes

This is the protocol if `scripts/record-demo.ps1` is too fragile. Frank executes this end-to-end manually.

### T-30 — Pre-flight (5 min)

1. Run `scripts/demo-friday-2026-05-15.ps1` — must end with `[demo] READY`.
2. Open OBS Studio. Confirm scene = "Starlight Demo." Confirm audio track shows green peaks when Frank speaks. Confirm output path = `C:\Users\frank\Starlight-Intelligence-System\memory\recordings\2026-05-15-friday-demo-v01\`.
3. Close all browser tabs except `http://127.0.0.1:3007/mission-control`.
4. Open one terminal pane on the right side of the screen, sized so commands are readable from 8 feet away. Font ≥14pt.
5. Quit Slack, Discord, every notification source. Focus mode.

### T-0 — Capture (3-10 min)

1. Click OBS "Start Recording." Wait 2 seconds.
2. Speak the opener: "This is the Starlight Intelligence System v0.1. I'm going to show you the substrate — agents, decisions, vault loop, council — in one continuous run. No edits. No reshoots."
3. Walk the 10-step demo path from `docs/ops/DEMO-RUNBOOK-2026-05-15.md` § "The 10-step demo path." Read the narration from § "Demo narration" but in your own words.
4. After Step 10, speak the close: "Every artifact you just saw — the work packet, the decision, the council review — carries a SIP attestation block. The substrate is open. The protocol is sovereign. Fork it at starlightintelligence.org."
5. Wait 2 seconds. Click OBS "Stop Recording."

### T+5 — Verify (2 min)

1. Confirm MP4 file exists at the output path and plays cleanly.
2. Run `scripts/record-demo.ps1 -Verify` (if it exists) OR manually compute SHA-256 via `Get-FileHash` and write the sidecar `attestation.json`.
3. Move the file into `memory/recordings/2026-05-15-friday-demo-v01/01-full-demo.mp4`.

Total: ~10 minutes including pre-flight.

---

## 7. The script — `scripts/record-demo.ps1`

A semi-automated driver that handles pre-flight verification + post-capture hashing. **Does NOT auto-trigger OBS recording** — Windows screen-record-from-PowerShell is too fragile across multi-monitor setups; Frank clicks OBS start/stop manually. The script handles everything else: probe, dispatch, hash, attest.

Ships in this same commit. See: `scripts/record-demo.ps1`.

---

## 8. Distribution sequence (next 7 days post-demo)

| Day | Surface | Cut | Action |
|---|---|---|---|
| Fri 2026-05-15 | (capture) | full + 3-min + hook | record · edit · hash · sidecar |
| Sat 2026-05-16 | YouTube | full 8-10 min | unlisted upload; share link with Frank's inner circle |
| Sun 2026-05-17 | LinkedIn | 3-min cut | written post + native video upload (LinkedIn favors native over YouTube embed) |
| Mon 2026-05-18 | Twitter/X | 30-sec hook | thread anchored on the WorkPacket-appears moment |
| Tue 2026-05-19 | friend-starter | 3-min cut | embed in README.md "Watch this first" section |
| Wed 2026-05-20 | YouTube | full | flip to public after 4-day private sanity-check |

---

## 9. If everything fails — the absolute fallback

A recording is a nice-to-have. It is NOT demo-critical. If OBS won't launch, if the disk is full, if Windows updates eat the session — **skip the recording. Run the live demo. Capture the audience reaction in `horizon-vault.md` per the post-demo close in DEMO-RUNBOOK.**

Re-record next week from the dashboard, alone, in 10 minutes. The 10-step path doesn't require an audience to be a real demo. The audience reaction is irreplaceable; the recording is reproducible.

**Decision rule:** if OBS pre-flight fails T-30, do not delay the demo to fix it. Demo first. Record later.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, distribution]
- Verticals: starlight-intelligence-system@v0.1
- Generated: 2026-05-12
- Attestation is compounding, not credit transfer.
