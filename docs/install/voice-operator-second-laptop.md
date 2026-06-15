# Installing the Voice Operator / Jarvis stack on a second laptop

> Companion to `docs/specs/2026-06-15-voice-operator-v2-prd.md`. This is the **portability truth**: what `git clone`s
> cleanly, what needs a build step, and what is currently stranded. Verified 2026-06-15.

## TL;DR portability matrix

| Component | Clone-and-go? | Command |
|---|---|---|
| **starlight-voice** (voice runtime) | ✅ yes | `git clone https://github.com/frankxai/starlight-voice.git` |
| **Starlight-Intelligence-System** (specs, vaults, registry) | ✅ yes | `git clone …/Starlight-Intelligence-System.git` |
| **claude skills/commands** (`/arco`, `/ao`, queen) | ⚠️ diverged | see §3 — needs reconcile first |
| **awesome-jarvis** (research) | ✅ now (private) | `git clone …/awesome-jarvis.git` |
| **arco** (`@arcanea/orchestrator`) | ❌ build required | see §2 |
| **arcanea-opencode** | ❌ remote archived | un-archive or re-point remote |

## 1. starlight-voice (the engine) — clean

```powershell
git clone https://github.com/frankxai/starlight-voice.git C:\Users\<you>\starlight-voice
cd C:\Users\<you>\starlight-voice
cargo build --release -p starlight-voice-tauri      # Rust stable required
python -m pip install pytest
$env:PYTHONPATH = "sidecar/src"; python -m pytest sidecar/tests   # smoke
```
Pending live-voice deps (not yet pinned — tracked in PRD P1): `pipecat`, `faster-whisper`, TTS SDK, provider keys.

## 2. arco (Arcanea Orchestrator) — NOT one-command

`arco` is a global npm bin pointing at `@arcanea/orchestrator/dist/cli.js`, which on this machine is **npm-linked into
the Arcanea monorepo build** — it is not published to npm. To reproduce on a new machine:

```powershell
git clone https://github.com/frankxai/arcanea.git           # or your Arcanea monorepo remote
cd arcanea
# build the orchestrator package (path: packages/* — verify the orchestrator package dir)
pnpm install && pnpm --filter @arcanea/orchestrator build
npm link                                                     # exposes `arco` globally
arco --version                                               # verify
```
**Long-term fix (recommended):** publish `@arcanea/orchestrator` to a registry (npm or GitHub Packages) and
`npm i -g @arcanea/orchestrator`, removing the monorepo-build dependency. Tracked as a hardening task.

> Note: the `/arco` *Claude Code skill* is unrelated — it is "Arcanea **Onchain**" (contracts/NFT), and travels with
> the claude-code-config repo (§3). The CLI router command is `/ao`.

## 3. claude skills & commands (`~/.claude`) — reconcile before relying on it

`~/.claude` → `frankxai/claude-code-config`, currently **ahead 4 / behind 5** with live uncommitted edits and likely
merge conflicts on the starlight-arcanea command layer. Until reconciled, a fresh clone on laptop #2 will be **missing
your 4 local commits**. Do not blind-merge load-bearing config; reconcile deliberately, then both laptops `git pull`.

## 4. Known stranded / blocked

- **arcanea-opencode**: GitHub remote archived (read-only). Un-archive or add a new remote to push the 2 local commits.
- **GEMINI_API_KEY**: holds an OpenRouter-format key; rotate to a real Google `AIza…` key for any Gemini/NB2/Veo use.

---
*Built on SIP.*
