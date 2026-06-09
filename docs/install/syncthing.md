# Install — Syncthing

> The sync layer. Lenovo + Acer + phone, no cloud middleman, conflict-free for Markdown, encrypted in transit. Syncthing is the primitive that makes the substrate **multi-device sovereign** — every other primitive (screenpipe, meetscribe, Mem0, Graphiti, the vault) writes locally; Syncthing is the only thing that decides what crosses to the Acer mirror and the phone. Get this wrong and Frank loses either privacy (cloud-leak) or continuity (single-point-of-failure on Lenovo). Get it right and the substrate becomes effectively unkillable.

**Role in the stack:** Sync Layer · L0 (transport between machines) · the third leg of resilience after Lenovo + Acer + Vercel mirror
**Why Syncthing over alternatives:** peer-to-peer, encrypted, open-source, GPLv3, no vendor account, conflict-resolution that respects file mtime + a `.stversions` history. OneDrive / iCloud / Dropbox all fail on three counts: (1) PII surface — vault contains client + family data, (2) no graph awareness — they treat the vault as opaque files, (3) no conflict-merge for Markdown — they overwrite or duplicate-suffix. Risk Register § 12 (single point of failure on Lenovo) is the install's reason to exist.
**Source:** https://syncthing.net · https://github.com/syncthing/syncthing
**License:** MPL-2.0
**Status in substrate:** unsurfaced → **scaffolded** (this install moves it to `live` once the three-device folder ring is replicating with a clean log)

## Prerequisites

- **OS:** Windows 11 on both Lenovo + Acer. Phone: Android (preferred, native Syncthing app) or iOS (use Möbius Sync — Syncthing-compatible third-party).
- **Hardware:** trivial. Syncthing idle: ~80MB RAM, <1% CPU when not actively syncing.
- **Disk:** match the largest folder on the smallest device. Phone will only sync a subset (vault + briefs, NOT raw captures).
- **Network:** ideally same LAN at home so peer-discovery works without relays. Cellular sync works but burns battery + data.
- **Required tools:**
  - `winget` for the Windows install
  - For Acer: identical install. Both machines need to be reachable from each other on the same network at least once for initial pairing (Syncthing's relay servers can carry afterward, but pairing is faster on LAN).
- **API keys / external services:** none. Syncthing is fully self-contained.

## Install steps

### 1. Install on Lenovo

```powershell
winget install --id Syncthing.Syncthing
# Or, for the GUI-wrapped flavor with system-tray integration:
winget install --id Canonical.SyncTrayzor
```

**SyncTrayzor** is the recommended Windows wrapper — it manages the Syncthing service, exposes the web UI in a tray icon, and starts on login automatically. Use it on both Lenovo and Acer.

After install:

```powershell
# SyncTrayzor launches the web UI at http://localhost:8384
Start-Process "http://localhost:8384"
```

Note your **Lenovo Device ID** (Actions → Show ID). Save it — you will paste it on Acer.

### 2. Install on Acer

Same commands. Open the web UI. Note the **Acer Device ID**.

### 3. Pair the two machines

On **Lenovo's** web UI:
- Click **Add Remote Device**.
- Paste **Acer's Device ID**.
- Name it `Acer`.
- Save.

On **Acer's** web UI:
- A pairing prompt appears (or click **Add Remote Device**, paste Lenovo's ID).
- Accept.

Within 30-60 seconds the two devices show as `Connected` in each other's UI.

### 4. Install on phone

**Android:**
```
Play Store → search "Syncthing" → install official app (by The Syncthing Foundation)
```

**iOS:**
```
App Store → search "Möbius Sync" → install (Syncthing-compatible third-party)
```

Open the app, note the phone's Device ID, add Lenovo + Acer as remote devices on the phone, and accept the pairing prompts on Lenovo + Acer.

## Configuration

**Config file location:** `%LOCALAPPDATA%\Syncthing\config.xml` on Windows. Don't hand-edit; use the web UI. The UI persists changes to this file.

**Substrate-pinned folder set:**

The substrate ships **seven canonical folders** (per `MASSIVE_ACTION_PLAN.md` § 7). Each gets a fixed Syncthing **Folder ID** so the same folder has the same ID on every device — critical for conflict-free merging.

| Folder | Path on Lenovo / Acer | Folder ID | Sync to phone? | Notes |
|---|---|---|---|---|
| Starlight Intelligence System | `C:\Users\frank\Starlight-Intelligence-System` | `starlight-sis` | **No** (code only) | Code-only repo; Git is canonical. Syncthing is the working-state mirror between Lenovo + Acer only. |
| Arcanea wiki | `C:\Users\frank\Arcanea\wiki` | `arcanea-wiki` | **Yes** | The vault. Frank reads/edits on phone. |
| Arcanea internal | `C:\Users\frank\Arcanea\.arcanea` | `arcanea-private` | **No** | Private agent state; Lenovo + Acer only. |
| FrankX content | `C:\Users\frank\FrankX\content` | `frankx-content` | **Yes** | Drafts, scripts, content calendar. |
| FrankX data | `C:\Users\frank\FrankX\data` | `frankx-data` | **No** | Analytics, exports; too large for phone. |
| Business | `C:\Users\frank\Business` | `business-vault` | **Yes** | Contracts, proposals, BV docs. |
| Captures (selective) | `C:\Users\frank\captures` | `captures-selective` | **Partial** (briefs only) | See selective-sync notes below. |

**Selective sync for `~/captures/`:**

This is the critical config — captures contain raw audio/frames that must NEVER leave Lenovo by accident. Use Syncthing's **`.stignore`** file at `~/captures/.stignore`:

```
# ~/captures/.stignore
# DO NOT SYNC raw audio or screen frames
/screen/data
/screen/db
/audio/raw
/meetings/raw

# DO sync transcripts, summaries, briefs, ingested metadata
!/screen/db/index-only.json
!/meetings/transcripts
!/meetings/summaries
!/briefs

# Phone gets briefs + summaries only — enforce via separate folder ID below
```

**Per-device share rules:**
- `captures-selective` folder: shared between Lenovo (send-receive) and Acer (send-receive).
- Phone gets a **separate folder** `captures-briefs` pointing only to `~/captures/briefs/` and `~/captures/meetings/summaries/`. Different folder ID, different scope.

**Substrate-pinned settings (in web UI for each folder):**
- **Folder Type:** `Send & Receive` (default).
- **File Versioning:** `Staggered` — keeps history of overwritten files, prunes by age.
  - Max age: 30 days.
- **Ignore Permissions:** `true` (Windows ↔ Windows is fine; cross-OS would need this anyway).
- **Watch for Changes:** `true` (instant sync; default 10s scan as fallback).
- **Full Rescan Interval:** `3600s` (1 hour).

**Conflict resolution:**

Syncthing's default for conflict (same file edited on two devices before sync) is to keep both, naming the loser `filename.sync-conflict-YYYYMMDD-HHMMSS-<device>.md`. **Do not auto-merge Markdown** — let conflicts surface visibly. The `orchestrate-brain` weekly ritual is where conflicts get resolved.

**Disk + bandwidth limits (Lenovo, 16GB RAM, audited tight):**
- Set **Folder rescan interval** higher (1h not default 1m) to avoid disk thrashing.
- Set **Max upload speed** to ~80% of upstream bandwidth in Settings → Connections, so Syncthing doesn't choke calls.

## Smoke test

```powershell
# 1. Both Lenovo + Acer + phone show Connected status in each other's UI
Start-Process "http://localhost:8384"

# 2. On Lenovo, create a test file in arcanea-wiki
Set-Content -Path "$HOME\Arcanea\wiki\smoke-test-syncthing.md" -Value "Sync test from Lenovo at $(Get-Date)"

# 3. Wait 30 seconds, check Acer
# On Acer:
#   Get-Content "$HOME\Arcanea\wiki\smoke-test-syncthing.md"
# Expected: matching content

# 4. Edit on Acer, append a line
# 5. Wait 30 seconds, on Lenovo:
#   Get-Content "$HOME\Arcanea\wiki\smoke-test-syncthing.md"
# Expected: both lines present

# 6. Force a conflict — disable network on Acer, edit on both, re-enable
#    Expected: a sync-conflict-... file appears on both devices
```

If steps 1-5 succeed and step 6 produces an explicit conflict file (rather than silent overwrite), Syncthing is healthy.

**Phone smoke test:** open the Syncthing app on the phone, navigate to the synced `arcanea-wiki` folder, confirm `smoke-test-syncthing.md` is present and readable.

**Critical refusal verification:**

```powershell
# Confirm raw screen captures are NOT syncing
Get-Content "$HOME\captures\.stignore"
# Expected: /screen/data and /audio/raw lines present

# On Acer, confirm the captures-selective folder does NOT contain frames
Get-ChildItem "$HOME\captures\screen\data" -ErrorAction SilentlyContinue
# Expected: empty or path doesn't exist on Acer
```

If Acer ever shows a populated `~/captures/screen/data/`, the `.stignore` is misconfigured. Stop. Fix. Wipe the Acer copy. Re-verify. This is non-negotiable.

## Integration with the Starlight Orchestrator

Syncthing is **transport-only**. The Orchestrator never speaks Syncthing's API; it just reads files at the same paths on whichever machine it runs.

**Continuity guarantees:**

```
Lenovo (primary)
   ├── ~/Starlight-Intelligence-System/  ◄──┐
   ├── ~/Arcanea/wiki/                   ◄──┤
   ├── ~/captures/{briefs,meetings}/     ◄──┤  Syncthing (encrypted, P2P)
   └── ...                                  │
                                            ▼
Acer (hot mirror)                        Phone (subset)
   ├── ~/Starlight-Intelligence-System/     ├── ~/Arcanea/wiki/
   ├── ~/Arcanea/wiki/                      ├── ~/FrankX/content/
   ├── ~/captures/{briefs,meetings}/        ├── ~/Business/
   │   (NO raw frames or audio)             └── ~/captures/briefs/
   └── ...                                      (read-mostly)
```

**Failover behavior:**
- If Lenovo dies: Frank opens Acer, runs the Orchestrator there, reads/writes vault + briefs. screenpipe + meetscribe are paused (only one active recorder per meeting). Mem0 + Graphiti queries hit the same Supabase pgvector + Neo4j (cloud-side, accessible from both machines). Continuity is unbroken for the substrate; only continuous capture is degraded until Lenovo is back.
- If Acer dies: nothing changes operationally. Acer is the mirror, not the primary.
- If phone dies: nothing changes. Phone is read-mostly.

**Vault stays canonical** — Syncthing replicates the canonical Markdown vault byte-for-byte. The vault on Acer and phone is **the same vault**, not a copy. Edits anywhere become edits everywhere within seconds.

**Git interaction:**

The SIS repo is Syncthing-replicated *and* Git-tracked. This is intentional: Git is the canonical history; Syncthing is the working-state continuity. **Rule:** commit before switching machines. If you forget and the same uncommitted change exists on both, Syncthing produces a sync-conflict file rather than silent merge — surface, resolve, then commit.

## Refusal patterns

**Syncthing must never:**
- Sync raw screen frames or audio. `~/captures/screen/data/`, `~/captures/screen/db/`, `~/captures/audio/raw/`, `~/captures/meetings/raw/` are all in `.stignore`. Verify after every config change.
- Sync secrets. `~/.starlight/secrets/` is **not** a Syncthing folder. API keys propagate by manual paste, NEVER by sync. (Acer needs its own copy of `.env`, set up separately and once.)
- Sync the SIS repo's `node_modules/`, `.next/`, `dist/`, `.venv/` — add a top-level `.stignore` in the repo:
  ```
  // C:/Users/frank/Starlight-Intelligence-System/.stignore
  node_modules
  .next
  dist
  build
  .venv
  __pycache__
  *.pyc
  .DS_Store
  ```
- Be the canonical store for anything. Git is canonical for code. Vault is canonical for memory. Syncthing is **only transport**.
- Use Syncthing's hosted relay servers for sensitive folder transit when avoidable — for vault + business folders, prefer direct connection (LAN or QUIC). Relay is a fallback, not a default. Settings → Connections → review relay usage.

**This install does NOT:**
- Replace cloud backup. Syncthing is multi-device sync, not backup. **A separate weekly snapshot of `~/Arcanea/wiki/` and `~/Business/` to encrypted external drive is still required.** Backup ≠ sync.
- Provide encryption-at-rest on the device — files on Lenovo and Acer are stored unencrypted at the OS level. **BitLocker on both machines is required** (Settings → Privacy & security → Device encryption). This is a **prerequisite** not handled by this install.
- Sync to OneDrive, iCloud, Dropbox, Google Drive. Ever. The whole point is to avoid those.

## Troubleshooting

| Symptom | Likely cause | Remediation |
|---|---|---|
| Devices show `Disconnected` despite both being on | Firewall blocking Syncthing on TCP 22000 / UDP 22000 | Windows Defender → Allow app → add Syncthing.exe; verify both directions |
| Folder shows `Out of Sync` and stays there | Permission issue or path doesn't exist on remote | Check the remote device's folder path; create the directory if missing; run `chmod`-equivalent (Windows: take ownership) |
| Sync is slow on LAN | Syncthing using relay despite LAN being available | Settings → Connections → set `Listen address` to `tcp://0.0.0.0:22000`; verify both devices on same subnet; restart Syncthing |
| Phone burns battery | Constant scan + cellular sync | Enable `Run on Wi-Fi only` and `Run when charging` in the phone app; disable folders not needed mobile-side |
| Conflict files multiplying | Frank editing same file on Lenovo + Acer without committing/syncing first | Discipline issue: commit-and-pause-edits when machine-switching; weekly `orchestrate-brain` ritual resolves accumulated conflicts |
| Captures folder syncing raw frames despite `.stignore` | `.stignore` not at folder root or syntax wrong | Re-place at the exact folder root configured in Syncthing UI; restart Syncthing; re-verify paths |

## Phase 1 status after install

**Capability lit:**
- Lenovo + Acer + phone three-device ring with conflict-aware Markdown sync (Phase 1 § 1.6 ✓ once smoke + refusal-verification pass).
- Acer becomes the hot mirror — Risk Register § 12 single-point-of-failure mitigation is now real.
- Frank can edit the vault from any of three devices and the substrate stays consistent.

**Final Phase 1 step:** **first daily brief** (Phase 1 § 1.7). Now that Mem0 + Graphiti are live and Syncthing replicates the brief output to all devices, the daily brief script (lands in `core/orchestrator/briefs/daily_brief.py`) generates the first `~/captures/briefs/2026-04-27.md` and Syncthing pushes it to the phone before Frank wakes up.

**Phase 1 progression after this install:**
- 1.3 screenpipe ✓
- 1.4 meetscribe ✓
- 1.5 Mem0 + Graphiti ✓
- 1.6 Syncthing ✓ (this install)
- 1.7 First daily brief — **immediately unblocked** by completing this install. Run the daily-brief script once captures have at least 24h of ingested data on both sides.

**Phase 1 capture stack: complete after this install.**

---

**Built on SIP** — install playbook · v7.5
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty, transport]
- Phase: 1.6 (sync layer — closes Phase 1 capture stack)
- Generated: 2026-04-26
