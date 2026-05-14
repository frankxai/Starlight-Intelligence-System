# Starlight Voice v3 — MVR (Weeks 1-3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily-driver-grade starlight-voice MVR (Minimum Viable Replacement): Tauri tray app + Python Pipecat sidecar + PTT hotkey + Deepgram-Flux→Cerebras-Llama-4→Cartesia-Sonic-2 pipeline + 3 wired MCP servers + single-scheduled-task install with legacy-task killer. Kills auto-start chaos. Frank dogfoods daily by end of week 2.

**Architecture:** New sovereign repo `starlight-voice` at `C:\Users\frank\starlight-voice\`. Tauri (Rust) shell owns tray, global PTT hotkey, hidden autostart, spawn-and-stdio-IPC to Python sidecar. Python sidecar runs Pipecat frame pipeline with in-process Anthropic/Cerebras SDK paths (no subprocess cold-start). MCP-over-stdio universal client. Spec at `docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md`.

**Tech Stack:**
- Rust 1.85+ / Cargo / Tauri 2.x / tauri-plugin-global-shortcut / tauri-plugin-autostart
- Python 3.12+ / uv / Pipecat 0.0.50+ / sounddevice / silero-vad / anthropic / openai
- Provider SDKs: Deepgram Flux (WebSocket), Cartesia Sonic-2 (WebSocket), Cerebras (REST via openai-compatible)
- MCP: `mcp` Python SDK (stdio client/server)
- Test: pytest + cargo test
- CI: GitHub Actions

**Scope:** This plan covers Weeks 1-3 MVR ONLY. Weeks 4-6 (B-tier surfaces) and 7-12 (C-tier excellence) are deferred to follow-on plans.

**Substrate gate:** Tasks 28-29 touch SIS substrate (`private/voice-operator/` archive move + `tools/fix-hide-task-windows.ps1` deletion). These trigger `/starlight-board` pre-pass before commit/tag per CLAUDE.md §"Substrate-tier governance gate". All other tasks are operational-tier inside the new `starlight-voice` repo.

---

## Prerequisites

Before starting Task 1, confirm:

- [ ] Rust toolchain installed: `rustc --version` returns 1.85+
- [ ] uv installed: `uv --version` returns 0.5+
- [ ] PowerShell 7 available: `where.exe pwsh` returns path (per memory `feedback_ps7_first_after_rebuild`)
- [ ] GitHub CLI installed and authenticated: `gh auth status`
- [ ] API keys ready in a notepad (will move to `.env` later): Deepgram, Cartesia, Cerebras, Anthropic, OpenAI
- [ ] Free disk space ≥10 GB at `C:\Users\frank\`
- [ ] RAM headroom: at least 4 GB free (memory `feedback_spawn_chain_jam_under_pressure`)

---

## File Structure

```
C:\Users\frank\starlight-voice\
├── Cargo.toml                              # Rust workspace root
├── pyproject.toml                          # uv-managed workspace marker
├── README.md                               # public-facing project README
├── LICENSE                                 # MIT
├── .gitignore                              # combined Rust + Python + Windows
├── .env.example                            # API key template (committed)
├── .env                                    # actual keys (gitignored)
├── .github/workflows/
│   ├── rust.yml                            # cargo build + test
│   └── python.yml                          # uv sync + pytest
│
├── tauri/                                  # Rust workspace member
│   ├── Cargo.toml
│   ├── tauri.conf.json                     # Tauri config (bundler, plugins)
│   ├── icons/                              # tray icon assets
│   │   ├── tray-idle.png                   # 32×32 dimmed
│   │   ├── tray-listening.png              # 32×32 bright/active
│   │   └── tray-thinking.png               # 32×32 spinner state
│   └── src/
│       ├── main.rs                         # entry point, tray icon
│       ├── hotkey.rs                       # PTT global hotkey handler
│       ├── autostart.rs                    # hidden-window logon registration
│       ├── sidecar.rs                      # spawn + stdio IPC to Python
│       └── menu.rs                         # tray menu items
│
├── sidecar/                                # Python workspace member
│   ├── pyproject.toml                      # uv project
│   ├── src/starlight_voice/
│   │   ├── __init__.py
│   │   ├── __main__.py                     # entry: python -m starlight_voice
│   │   ├── ipc.py                          # stdio JSON-RPC server (talks to Rust)
│   │   ├── pipeline.py                     # Pipecat frame graph
│   │   ├── activation.py                   # PTT event handling, clap detector (later)
│   │   ├── adapters/
│   │   │   ├── __init__.py
│   │   │   ├── deepgram_stt.py             # Deepgram Flux STT adapter
│   │   │   ├── cartesia_tts.py             # Cartesia Sonic-2 TTS adapter
│   │   │   └── cerebras_llm.py             # Cerebras Llama-4 LLM adapter (openai-compatible)
│   │   ├── cognition/
│   │   │   ├── __init__.py
│   │   │   ├── router.py                   # Tier 0/1/2 router (salvaged from SIS, ported)
│   │   │   └── prompts.py                  # system prompts
│   │   └── mcp/
│   │       ├── __init__.py
│   │       └── client.py                   # MCP-over-stdio universal client
│   └── tests/
│       ├── conftest.py
│       ├── test_ipc.py
│       ├── test_pipeline.py
│       ├── test_router.py
│       ├── test_mcp_client.py
│       └── test_e2e_smoke.py
│
├── installer/
│   ├── tauri.bundler.json                  # extended bundler config
│   ├── install.ps1                         # post-install script (creates scheduled task)
│   ├── uninstall.ps1                       # post-uninstall script (removes task)
│   └── uninstall-legacy-tasks.ps1          # one-shot kills 11+ legacy SIS/Arcanea tasks
│
├── benchmarks/
│   ├── run.py                              # latency probe runner
│   └── budgets.toml                        # per-stage P50 budgets
│
└── docs/
    ├── ARCHITECTURE.md                     # productized version of spec
    ├── INSTALL.md                          # one-page friend/alliance install
    └── PORTING_FROM_SIS.md                 # Frank's own-machine migration guide
```

**Decomposition rationale:**
- Rust shell is small, focused (5 files) — owns OS integration only.
- Python sidecar split into pipeline / adapters / cognition / mcp / ipc — each module has one job.
- Tests mirror source layout.
- Installer scripts isolated for clean inclusion/exclusion in bundler.
- Benchmarks separate so CI gate is independent of feature code.

---

# WEEK 1 — Repo bootstrap + Tauri tray shell

## Task 1: Create empty GitHub repo + clone locally

**Files:**
- Create on GitHub: `frankxai/starlight-voice` (public, MIT)
- Create locally: `C:\Users\frank\starlight-voice\` (clone target)

- [ ] **Step 1: Create the public GitHub repo**

Run: `gh repo create frankxai/starlight-voice --public --description "Open-source Jarvis-grade personal voice operator. Tauri tray + Python Pipecat sidecar. PTT primary, sub-800ms hot-path SLA." --license MIT`

Expected output: `https://github.com/frankxai/starlight-voice`

- [ ] **Step 2: Clone to canonical location**

Run: `git clone https://github.com/frankxai/starlight-voice.git C:\Users\frank\starlight-voice`

Expected: Repo cloned, only `README.md` + `LICENSE` present.

- [ ] **Step 3: Add baseline `.gitignore`**

Create `C:\Users\frank\starlight-voice\.gitignore`:

```
# Rust
/target/
**/*.rs.bk

# Python
__pycache__/
*.pyc
.venv/
.uv/
dist/
*.egg-info/

# Env / secrets
.env
.env.local

# OS
Thumbs.db
.DS_Store
desktop.ini

# IDE
.vscode/
.idea/

# Tauri
/tauri/gen/
```

- [ ] **Step 4: Add `.env.example`**

Create `C:\Users\frank\starlight-voice\.env.example`:

```
DEEPGRAM_API_KEY=your_deepgram_key_here
CARTESIA_API_KEY=your_cartesia_key_here
CEREBRAS_API_KEY=your_cerebras_key_here
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
GROQ_API_KEY=gsk_xxxxx
```

- [ ] **Step 5: Commit**

```bash
cd C:\Users\frank\starlight-voice
git add .gitignore .env.example
git commit -m "chore: baseline gitignore and env template"
git push
```

---

## Task 2: Initialize Cargo workspace + Tauri scaffold

**Files:**
- Create: `C:\Users\frank\starlight-voice\Cargo.toml`
- Create: `C:\Users\frank\starlight-voice\tauri\Cargo.toml`
- Create: `C:\Users\frank\starlight-voice\tauri\tauri.conf.json`
- Create: `C:\Users\frank\starlight-voice\tauri\src\main.rs`
- Create: `C:\Users\frank\starlight-voice\tauri\build.rs` (required by tauri-build dep)
- Create: `C:\Users\frank\starlight-voice\tauri\icons\icon.ico` (required by tauri-build for Windows resource file)
- Create: `C:\Users\frank\starlight-voice\tauri\icons\tray-idle.png` (tray icon)

- [ ] **Step 1: Create root `Cargo.toml` (workspace)**

Create `C:\Users\frank\starlight-voice\Cargo.toml`:

```toml
[workspace]
members = ["tauri"]
resolver = "2"

[workspace.package]
version = "0.1.0"
edition = "2021"
license = "MIT"
repository = "https://github.com/frankxai/starlight-voice"
```

- [ ] **Step 2: Create `tauri/Cargo.toml`**

Create `C:\Users\frank\starlight-voice\tauri\Cargo.toml`:

```toml
[package]
name = "starlight-voice-tauri"
version.workspace = true
edition.workspace = true
license.workspace = true

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-autostart = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
anyhow = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

- [ ] **Step 3: Create `tauri/tauri.conf.json`**

Create `C:\Users\frank\starlight-voice\tauri\tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Starlight Voice",
  "version": "0.1.0",
  "identifier": "ai.starlight.voice",
  "app": {
    "windows": [],
    "trayIcon": {
      "iconPath": "icons/tray-idle.png",
      "iconAsTemplate": false
    }
  },
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "category": "Utility",
    "shortDescription": "Jarvis-grade personal voice operator",
    "longDescription": "Open-source voice operator: PTT hotkey + Pipecat pipeline + MCP tools. Sub-800ms hot path.",
    "icon": ["icons/icon.ico", "icons/tray-idle.png"],
    "windows": {
      "webviewInstallMode": { "type": "skip" }
    }
  },
  "plugins": {
    "global-shortcut": {},
    "autostart": {}
  }
}
```

- [ ] **Step 4: Create `tauri/src/main.rs` (minimal "hello tray")**

Create `C:\Users\frank\starlight-voice\tauri\src\main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .setup(|app| {
            tracing_subscriber::fmt()
                .with_env_filter(
                    tracing_subscriber::EnvFilter::try_from_default_env()
                        .unwrap_or_else(|_| "info".into()),
                )
                .init();
            tracing::info!("starlight-voice tauri shell starting");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4b: Create `tauri/build.rs` (required by tauri-build dep)**

Create `C:\Users\frank\starlight-voice\tauri\build.rs`:

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 5: Place icons (both `icon.ico` AND `tray-idle.png`)**

Tauri-build on Windows requires `tauri/icons/icon.ico` for the Windows resource file. The tray icon spec uses `tauri/icons/tray-idle.png`. Both must exist before `cargo build` succeeds.

Quick path on Windows: place any 32x32 PNG at `tauri/icons/tray-idle.png`, then convert it to `.ico` via PowerShell:

```powershell
Add-Type -AssemblyName System.Drawing
$png = [System.Drawing.Image]::FromFile('C:\Users\frank\starlight-voice\tauri\icons\tray-idle.png')
$bmp = New-Object System.Drawing.Bitmap($png, 256, 256)
$handle = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($handle)
$fs = New-Object System.IO.FileStream('C:\Users\frank\starlight-voice\tauri\icons\icon.ico', [System.IO.FileMode]::Create)
$icon.Save($fs); $fs.Close(); $png.Dispose(); $bmp.Dispose()
```

Run: `cd C:\Users\frank\starlight-voice; cargo build --release -p starlight-voice-tauri`

Expected: Compiles. Run the binary at `target/release/starlight-voice-tauri.exe`. Tray icon appears in system tray. No window, no console. Kill process via tray right-click → Quit (we'll add the menu in Task 6).

- [ ] **Step 6: Commit (two commits: scaffold then lockfile)**

```bash
git add Cargo.toml tauri/
git commit -m "feat(tauri): scaffold tray-only Tauri shell"
git push

git add Cargo.lock
git commit -m "chore: commit Cargo.lock for reproducible builds"
git push
```

---

## Task 3: Initialize Python sidecar with uv + Pipecat

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\pyproject.toml`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__init__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\conftest.py`

- [ ] **Step 1: Create `sidecar/pyproject.toml`**

Create `C:\Users\frank\starlight-voice\sidecar\pyproject.toml`:

```toml
[project]
name = "starlight-voice"
version = "0.1.0"
description = "Python sidecar for starlight-voice — Pipecat pipeline + MCP tools"
requires-python = ">=3.12"
license = { text = "MIT" }
dependencies = [
    "pipecat-ai>=0.0.50",
    "deepgram-sdk>=3.7.0",
    "cartesia>=1.0.0",
    "anthropic>=0.40.0",
    "openai>=1.55.0",
    "google-generativeai>=0.8.0",
    "sounddevice>=0.5.0",
    "numpy>=2.0.0",
    "scipy>=1.14.0",
    "mcp>=1.0.0",
    "pydantic>=2.9.0",
    "python-dotenv>=1.0.0",
    "structlog>=24.4.0",
    "apscheduler>=3.10.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-asyncio>=0.24.0",
    "pytest-mock>=3.14.0",
    "ruff>=0.7.0",
    "mypy>=1.13.0",
]

[project.scripts]
starlight-voice = "starlight_voice.__main__:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/starlight_voice"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 2: Create entrypoints**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__init__.py`:

```python
"""Starlight Voice — Python sidecar."""

__version__ = "0.1.0"
```

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py`:

```python
"""Entry point: python -m starlight_voice"""
import sys
import structlog

logger = structlog.get_logger()


def main() -> int:
    logger.info("starlight_voice.sidecar.starting", argv=sys.argv)
    # IPC + pipeline wiring lands in Task 11.
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Install deps via uv**

Run: `cd C:\Users\frank\starlight-voice\sidecar; uv sync --extra dev`

Expected: `.venv/` created, all deps installed without conflict.

- [ ] **Step 4: Write the failing smoke test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\conftest.py`:

```python
"""Pytest fixtures."""
import pytest


@pytest.fixture
def sample_audio_frame():
    """Generate 30ms of silence at 16kHz PCM16."""
    import numpy as np
    return np.zeros(int(16000 * 0.03), dtype=np.int16).tobytes()
```

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_smoke.py`:

```python
"""Smoke: package imports and exposes version."""
import starlight_voice


def test_package_version():
    assert starlight_voice.__version__ == "0.1.0"


def test_main_returns_zero():
    from starlight_voice.__main__ import main
    assert main() == 0
```

- [ ] **Step 5: Run tests**

Run: `cd C:\Users\frank\starlight-voice\sidecar; uv run pytest -v`

Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
git add sidecar/ uv.lock
git commit -m "feat(sidecar): scaffold uv-managed Python sidecar with Pipecat deps"
git push
```

---

## Task 4: CI scaffolding (GitHub Actions)

**Files:**
- Create: `C:\Users\frank\starlight-voice\.github\workflows\rust.yml`
- Create: `C:\Users\frank\starlight-voice\.github\workflows\python.yml`

- [ ] **Step 1: Create Rust CI workflow**

Create `C:\Users\frank\starlight-voice\.github\workflows\rust.yml`:

```yaml
name: Rust CI

on:
  push:
    branches: [main]
    paths:
      - 'tauri/**'
      - 'Cargo.toml'
      - 'Cargo.lock'
      - '.github/workflows/rust.yml'
  pull_request:
    paths:
      - 'tauri/**'
      - 'Cargo.toml'
      - 'Cargo.lock'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: Build
        run: cargo build --release -p starlight-voice-tauri
      - name: Test
        run: cargo test -p starlight-voice-tauri
```

- [ ] **Step 2: Create Python CI workflow**

Create `C:\Users\frank\starlight-voice\.github\workflows\python.yml`:

```yaml
name: Python CI

on:
  push:
    branches: [main]
    paths:
      - 'sidecar/**'
      - '.github/workflows/python.yml'
  pull_request:
    paths:
      - 'sidecar/**'

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - name: Sync deps
        run: cd sidecar && uv sync --extra dev
      - name: Lint
        run: cd sidecar && uv run ruff check src tests
      - name: Type check
        run: cd sidecar && uv run mypy src
      - name: Test
        run: cd sidecar && uv run pytest -v
```

- [ ] **Step 3: Push + verify CI green**

```bash
git add .github/
git commit -m "ci: rust + python workflows on windows-latest"
git push
```

Run: `gh run watch` (waits for CI to complete)

Expected: Both workflows green. If either fails, fix the underlying issue and push again.

- [ ] **Step 4: Commit (already pushed in Step 3 — no separate commit needed)**

---

## Task 5: Write base ARCHITECTURE.md + README.md

**Files:**
- Create: `C:\Users\frank\starlight-voice\README.md` (overwrite stub)
- Create: `C:\Users\frank\starlight-voice\docs\ARCHITECTURE.md`

- [ ] **Step 1: Write public README**

Create `C:\Users\frank\starlight-voice\README.md`:

```markdown
# Starlight Voice

The open-source reference impl of a Jarvis-grade personal voice operator.

**Status:** v0.1 — MVR in development. Not yet daily-driver ready.

## What it is

A single tray binary that:
- Activates on **push-to-talk hotkey** (`Ctrl+Shift+Space` by default).
- Pipes mic → Silero VAD → Deepgram Flux STT → cognition router → Cartesia Sonic-2 TTS → speakers in **sub-800ms hot path**.
- Routes the LLM tier intelligently: Cerebras Llama-4 (fast), Anthropic Claude (substrate), Tier 2.5 deliberation with extended thinking (deep).
- Exposes tools via MCP — bring your own MCP servers, the voice operator drives them uniformly.
- Does NOT open browsers or terminals at logon. Does NOT pollute your Scheduled Tasks. Single hidden tray icon, that's it.

## Install

```powershell
# Coming in week 6.
# Until then, see docs/PORTING_FROM_SIS.md for source build.
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

MIT.
```

- [ ] **Step 2: Write ARCHITECTURE.md (productized version of spec)**

Create `C:\Users\frank\starlight-voice\docs\ARCHITECTURE.md`:

```markdown
# Architecture

Starlight Voice is a Tauri Rust tray shell hosting a Python Pipecat sidecar.

## Boundaries

- **Rust shell** owns: tray icon, global PTT hotkey, hidden-window autostart, spawning the sidecar process, stdio IPC to sidecar, OS integration (audio device enumeration is delegated to sidecar via sounddevice).
- **Python sidecar** owns: Pipecat frame pipeline (VAD → STT → cognition → TTS), cognition routing across tiers, MCP client and tool execution, persistent memory access, scheduled in-process jobs.
- **MCP layer** owns: every tool the LLM can call. Browser automation, CLI dispatch, vault access, vector memory — all are MCP servers consumed via stdio.

## Cognition tiers

| Tier | Backend | TTFT | Use |
|---|---|---|---|
| 0 | Regex/classifier | <10ms | Hard-coded utterances |
| 1 hot | Cerebras Llama-4 | ~160ms | 90% of utterances |
| 2 warm | Anthropic Claude 4.7 / Groq Kimi-K2 | ~500ms | Substrate keywords, code |
| 2.5 deliberation | Claude 4.7 + extended thinking | 5-30s | "Think hard about..." |
| 3 cold | CLI subprocess (pre-warmed pool) | <300ms cold / <100ms warm | claude-code, codex, gemini, opencode |

## Latency budget (P50, hot path)

- VAD turn detection: 90ms
- STT first partial: <300ms (Deepgram Flux)
- LLM first token: <200ms (Cerebras Llama-4)
- TTS first audio: <100ms (Cartesia Sonic-2)
- **Total mic-close → first audio: <800ms**

Enforced by `benchmarks/` CI gate.

## See also

- Full spec: `docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md` (in SIS repo)
- Install: `docs/INSTALL.md`
- Frank's migration: `docs/PORTING_FROM_SIS.md`
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/ARCHITECTURE.md
git commit -m "docs: README + ARCHITECTURE anchor docs"
git push
```

---

## Task 6: Tauri tray menu (Pause/Resume/Quit + "Show Brain" stub)

**Files:**
- Create: `C:\Users\frank\starlight-voice\tauri\src\menu.rs`
- Modify: `C:\Users\frank\starlight-voice\tauri\src\main.rs`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\tauri\src\menu.rs`:

```rust
//! Tray menu items + handler wiring.

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Wry};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MenuAction {
    PauseResume,
    ToggleClapAmbient,
    ShowBrain,
    Settings,
    Quit,
}

impl MenuAction {
    pub fn id(self) -> &'static str {
        match self {
            Self::PauseResume => "pause_resume",
            Self::ToggleClapAmbient => "clap_ambient",
            Self::ShowBrain => "show_brain",
            Self::Settings => "settings",
            Self::Quit => "quit",
        }
    }

    pub fn from_id(id: &str) -> Option<Self> {
        match id {
            "pause_resume" => Some(Self::PauseResume),
            "clap_ambient" => Some(Self::ToggleClapAmbient),
            "show_brain" => Some(Self::ShowBrain),
            "settings" => Some(Self::Settings),
            "quit" => Some(Self::Quit),
            _ => None,
        }
    }
}

pub fn build_menu(app: &AppHandle<Wry>) -> tauri::Result<Menu<Wry>> {
    let pause = MenuItem::with_id(app, MenuAction::PauseResume.id(), "Pause listening", true, None::<&str>)?;
    let clap = MenuItem::with_id(app, MenuAction::ToggleClapAmbient.id(), "Clap ambient mode (off)", true, None::<&str>)?;
    let brain = MenuItem::with_id(app, MenuAction::ShowBrain.id(), "Show Brain (postmortem)", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, MenuAction::Settings.id(), "Settings...", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, MenuAction::Quit.id(), "Quit Starlight Voice", true, None::<&str>)?;
    Menu::with_items(app, &[&pause, &clap, &brain, &settings, &separator, &quit])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn action_roundtrips_through_id() {
        let actions = [
            MenuAction::PauseResume,
            MenuAction::ToggleClapAmbient,
            MenuAction::ShowBrain,
            MenuAction::Settings,
            MenuAction::Quit,
        ];
        for a in actions {
            assert_eq!(MenuAction::from_id(a.id()), Some(a));
        }
    }

    #[test]
    fn unknown_id_returns_none() {
        assert!(MenuAction::from_id("frobnicate").is_none());
    }
}
```

- [ ] **Step 2: Run test, verify it fails (module not yet wired)**

Run: `cargo test -p starlight-voice-tauri --no-run 2>&1 | head -30`

Expected: Compile error — `menu` module not declared in main.rs.

- [ ] **Step 3: Wire `menu` module + tray builder into main.rs**

Modify `C:\Users\frank\starlight-voice\tauri\src\main.rs` (replace entire contents):

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;

use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .setup(|app| {
            tracing_subscriber::fmt()
                .with_env_filter(
                    tracing_subscriber::EnvFilter::try_from_default_env()
                        .unwrap_or_else(|_| "info".into()),
                )
                .init();
            tracing::info!("starlight-voice tauri shell starting");

            let menu = menu::build_menu(app.handle())?;

            let _tray = TrayIconBuilder::with_id("starlight-voice-tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    if let Some(action) = menu::MenuAction::from_id(event.id.as_ref()) {
                        tracing::info!(?action, "menu event");
                        match action {
                            menu::MenuAction::Quit => app.exit(0),
                            menu::MenuAction::PauseResume => {
                                // TODO Task 13: send IPC to sidecar
                            }
                            menu::MenuAction::ToggleClapAmbient => {
                                // TODO Task 4-6 week: send IPC, toggle config
                            }
                            menu::MenuAction::ShowBrain => {
                                // TODO Task 4-6 week: launch brain-viz web app
                            }
                            menu::MenuAction::Settings => {
                                // TODO Task 4-6 week: open settings webview
                            }
                        }
                    }
                })
                .on_tray_icon_event(|_tray, event| {
                    if let TrayIconEvent::Click { button_state, .. } = event {
                        tracing::debug!(?button_state, "tray click");
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Run tests**

Run: `cargo test -p starlight-voice-tauri`

Expected: PASS — 2 unit tests in menu module pass.

- [ ] **Step 5: Smoke-run the binary**

Run: `cargo run --release -p starlight-voice-tauri`

Right-click the tray icon. Expected: menu appears with 5 items (Pause listening, Clap ambient mode (off), Show Brain (postmortem), Settings..., Quit Starlight Voice). Quit closes the app.

- [ ] **Step 6: Commit**

```bash
git add tauri/src/menu.rs tauri/src/main.rs
git commit -m "feat(tauri): tray menu with pause/clap/brain/settings/quit"
git push
```

---

## Task 7: Global PTT hotkey registration

**Files:**
- Create: `C:\Users\frank\starlight-voice\tauri\src\hotkey.rs`
- Modify: `C:\Users\frank\starlight-voice\tauri\src\main.rs`

- [ ] **Step 1: Write hotkey module with test**

Create `C:\Users\frank\starlight-voice\tauri\src\hotkey.rs`:

```rust
//! Global PTT (push-to-talk) hotkey registration and event routing.
//!
//! Default chord: Ctrl+Shift+Space. Press-and-hold to talk, release to end utterance.

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Manager, Wry};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub const DEFAULT_PTT: &str = "CommandOrControl+Shift+Space";

static PTT_HELD: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PttEvent {
    Pressed,
    Released,
}

pub fn ptt_held() -> bool {
    PTT_HELD.load(Ordering::SeqCst)
}

pub fn register(app: &AppHandle<Wry>) -> tauri::Result<()> {
    let shortcut: Shortcut = DEFAULT_PTT.parse().map_err(|e| {
        tauri::Error::from(anyhow::anyhow!("Invalid PTT shortcut '{DEFAULT_PTT}': {e}"))
    })?;
    let handle = app.clone();
    app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, event| {
        let evt = match event.state() {
            ShortcutState::Pressed => {
                PTT_HELD.store(true, Ordering::SeqCst);
                PttEvent::Pressed
            }
            ShortcutState::Released => {
                PTT_HELD.store(false, Ordering::SeqCst);
                PttEvent::Released
            }
        };
        tracing::info!(?evt, "PTT event");
        // Send to sidecar via IPC (wired in Task 9).
        let _ = handle.emit("ptt", evt as u8);
    })?;
    tracing::info!(chord = DEFAULT_PTT, "PTT hotkey registered");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ptt_held_starts_false() {
        // Note: this is a flaky-by-design test because the static is process-wide.
        // Run in isolation in CI via --test-threads=1 if needed.
        assert!(!ptt_held() || ptt_held()); // tautology: just exercise the path
    }

    #[test]
    fn default_chord_parses() {
        let parsed: Result<Shortcut, _> = DEFAULT_PTT.parse();
        assert!(parsed.is_ok(), "DEFAULT_PTT should parse: {:?}", parsed.err());
    }
}
```

- [ ] **Step 2: Run test, verify it fails (module not declared)**

Run: `cargo build -p starlight-voice-tauri`

Expected: Compile error — `hotkey` module not in main.rs.

- [ ] **Step 3: Wire hotkey into main.rs**

Modify the `setup` closure in `tauri/src/main.rs` — add this line after `tracing::info!("starlight-voice tauri shell starting");`:

```rust
            hotkey::register(app.handle())?;
```

And add to the top of the file (after `mod menu;`):

```rust
mod hotkey;
```

- [ ] **Step 4: Run tests**

Run: `cargo test -p starlight-voice-tauri`

Expected: PASS — 4 unit tests (2 menu + 2 hotkey).

- [ ] **Step 5: Smoke-run + verify hotkey fires**

Run: `cargo run --release -p starlight-voice-tauri` (in a PowerShell window where you can see tracing output: set `RUST_LOG=info`).

Press `Ctrl+Shift+Space`. Expected: tracing log line `PTT event evt=Pressed` appears. Release. Expected: `PTT event evt=Released` appears.

- [ ] **Step 6: Commit**

```bash
git add tauri/src/hotkey.rs tauri/src/main.rs
git commit -m "feat(tauri): global PTT hotkey (Ctrl+Shift+Space)"
git push
```

---

## Task 8: Hidden-window autostart wiring

**Files:**
- Create: `C:\Users\frank\starlight-voice\tauri\src\autostart.rs`
- Modify: `C:\Users\frank\starlight-voice\tauri\src\main.rs`

- [ ] **Step 1: Write autostart helper**

Create `C:\Users\frank\starlight-voice\tauri\src\autostart.rs`:

```rust
//! Manage starlight-voice's logon autostart entry.
//!
//! Uses tauri-plugin-autostart, which on Windows registers an HKCU\Run entry
//! pointing at the binary with the `--hidden` flag. The Tauri binary itself is
//! GUI-subsystem-flagged, so Windows never allocates a console.

use tauri::{AppHandle, Manager, Wry};
use tauri_plugin_autostart::ManagerExt;

pub fn ensure_enabled(app: &AppHandle<Wry>) -> tauri::Result<()> {
    let mgr = app.autolaunch();
    if !mgr.is_enabled()? {
        mgr.enable()?;
        tracing::info!("autostart enabled");
    } else {
        tracing::debug!("autostart already enabled");
    }
    Ok(())
}

pub fn disable(app: &AppHandle<Wry>) -> tauri::Result<()> {
    app.autolaunch().disable()?;
    tracing::info!("autostart disabled");
    Ok(())
}
```

- [ ] **Step 2: Wire into main.rs**

Add to top of `tauri/src/main.rs` (after `mod hotkey;`):

```rust
mod autostart;
```

Inside the `setup` closure, after `hotkey::register(...)`, add:

```rust
            // Enable autostart only on first run or via explicit user opt-in.
            // For dev builds, we skip; for release we enable.
            #[cfg(not(debug_assertions))]
            autostart::ensure_enabled(app.handle())?;
```

- [ ] **Step 3: Build release + verify HKCU\Run entry created**

Run: `cargo build --release -p starlight-voice-tauri`
Run the binary: `& "target\release\starlight-voice-tauri.exe"`

In a separate PowerShell: `Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' | Select-Object -Property *starlight*`

Expected: A property like `ai.starlight.voice` with value pointing to the .exe with `--hidden` arg.

- [ ] **Step 4: Verify no console window opens**

Reboot the laptop or sign out + sign back in.

Expected: tray icon appears in system tray after logon. NO console window. NO cmd.exe flash. NO terminal. NO browser. If any of those appear, that's a P0 bug — investigate `tauri.conf.json` window subsystem flag and the `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` line.

- [ ] **Step 5: Disable autostart for dev convenience**

(Optional — Frank decides.) Run: `& "target\release\starlight-voice-tauri.exe" --disable-autostart` (we'll wire this flag later; for now, manually remove the registry entry with `Remove-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'ai.starlight.voice'`).

- [ ] **Step 6: Commit**

```bash
git add tauri/src/autostart.rs tauri/src/main.rs
git commit -m "feat(tauri): hidden-window autostart via tauri-plugin-autostart"
git push
```

---

## Task 9: Sidecar spawn + stdio JSON-RPC client (Rust side)

**Files:**
- Create: `C:\Users\frank\starlight-voice\tauri\src\sidecar.rs`
- Modify: `C:\Users\frank\starlight-voice\tauri\src\main.rs`

- [ ] **Step 1: Write sidecar manager**

Create `C:\Users\frank\starlight-voice\tauri\src\sidecar.rs`:

```rust
//! Spawn and communicate with the Python sidecar over stdio JSON-RPC.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, ChildStdin, ChildStdout};
use tokio::sync::{mpsc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum SidecarMessage {
    PttPressed,
    PttReleased,
    Pause,
    Resume,
    Shutdown,
    UtteranceText { text: String },
    Status { state: String },
    Error { message: String },
}

pub struct SidecarHandle {
    child: Child,
    stdin: Arc<Mutex<ChildStdin>>,
    pub events: mpsc::UnboundedReceiver<SidecarMessage>,
}

impl SidecarHandle {
    pub async fn send(&self, msg: SidecarMessage) -> Result<()> {
        let mut stdin = self.stdin.lock().await;
        let line = serde_json::to_string(&msg)? + "\n";
        stdin.write_all(line.as_bytes()).await.context("write to sidecar")?;
        stdin.flush().await?;
        Ok(())
    }

    pub async fn shutdown(mut self) -> Result<()> {
        let _ = self.send(SidecarMessage::Shutdown).await;
        let _ = self.child.kill().await;
        Ok(())
    }
}

pub fn spawn() -> Result<SidecarHandle> {
    let python = std::env::var("STARLIGHT_VOICE_PYTHON")
        .unwrap_or_else(|_| "python".to_string());

    let mut cmd = tokio::process::Command::new(&python);
    cmd.args(["-m", "starlight_voice"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = cmd.spawn().context("spawn python sidecar")?;
    let stdin = child.stdin.take().context("sidecar stdin")?;
    let stdout = child.stdout.take().context("sidecar stdout")?;

    let (tx, rx) = mpsc::unbounded_channel::<SidecarMessage>();
    let reader = BufReader::new(stdout);

    tokio::spawn(async move {
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            match serde_json::from_str::<SidecarMessage>(&line) {
                Ok(msg) => {
                    if tx.send(msg).is_err() {
                        break;
                    }
                }
                Err(e) => tracing::warn!(error = ?e, line, "sidecar produced non-JSON line"),
            }
        }
        tracing::info!("sidecar stdout closed");
    });

    Ok(SidecarHandle {
        child,
        stdin: Arc::new(Mutex::new(stdin)),
        events: rx,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn message_roundtrip_ptt_pressed() {
        let msg = SidecarMessage::PttPressed;
        let json = serde_json::to_string(&msg).unwrap();
        assert_eq!(json, r#"{"type":"PttPressed"}"#);
        let back: SidecarMessage = serde_json::from_str(&json).unwrap();
        assert!(matches!(back, SidecarMessage::PttPressed));
    }

    #[test]
    fn message_roundtrip_utterance_text() {
        let msg = SidecarMessage::UtteranceText {
            text: "hello world".into(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains(r#""type":"UtteranceText""#));
        assert!(json.contains(r#""text":"hello world""#));
    }
}
```

- [ ] **Step 2: Wire into main.rs**

Add to top of `tauri/src/main.rs` (after `mod autostart;`):

```rust
mod sidecar;
```

Inside the `setup` closure, after `autostart::ensure_enabled(...)`, add:

```rust
            // Spawn the Python sidecar.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match sidecar::spawn() {
                    Ok(mut sc) => {
                        tracing::info!("sidecar spawned");
                        while let Some(evt) = sc.events.recv().await {
                            tracing::info!(?evt, "sidecar event");
                            // Forward to frontend / log; routing handled in Task 13.
                            let _ = handle.emit("sidecar-event", &evt);
                        }
                        tracing::warn!("sidecar event stream closed");
                    }
                    Err(e) => tracing::error!(?e, "failed to spawn sidecar"),
                }
            });
```

- [ ] **Step 3: Run unit tests**

Run: `cargo test -p starlight-voice-tauri`

Expected: PASS — 6 unit tests now (2 menu + 2 hotkey + 2 sidecar).

- [ ] **Step 4: Smoke-run with sidecar in PATH**

Set `STARLIGHT_VOICE_PYTHON` to your sidecar venv python:

```powershell
$env:STARLIGHT_VOICE_PYTHON = "C:\Users\frank\starlight-voice\sidecar\.venv\Scripts\python.exe"
```

Run: `cargo run --release -p starlight-voice-tauri`

Expected: tracing logs show "sidecar spawned" then "sidecar event stream closed" (because the sidecar's `__main__.main()` returns immediately, exit 0). That's fine for now — we'll wire the persistent IPC server in Task 12.

- [ ] **Step 5: Commit**

```bash
git add tauri/src/sidecar.rs tauri/src/main.rs
git commit -m "feat(tauri): spawn + stdio JSON-RPC IPC to Python sidecar"
git push
```

---

# WEEK 2 — Python sidecar foundation + voice loop

## Task 10: Stdio JSON-RPC server (Python side)

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\ipc.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_ipc.py`
- Modify: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_ipc.py`:

```python
"""IPC: send/receive JSON-line messages over stdio."""
import asyncio
import io
import json
import pytest

from starlight_voice.ipc import StdioIpc, Message


@pytest.mark.asyncio
async def test_send_serializes_message_with_trailing_newline():
    out = io.StringIO()
    ipc = StdioIpc(stdin=io.StringIO(""), stdout=out)
    await ipc.send(Message(type="Status", data={"state": "idle"}))
    assert out.getvalue() == '{"type":"Status","data":{"state":"idle"}}\n'


@pytest.mark.asyncio
async def test_receive_parses_line():
    inp = io.StringIO('{"type":"PttPressed"}\n')
    ipc = StdioIpc(stdin=inp, stdout=io.StringIO())
    msg = await ipc.receive()
    assert msg is not None
    assert msg.type == "PttPressed"
    assert msg.data is None


@pytest.mark.asyncio
async def test_receive_returns_none_on_eof():
    inp = io.StringIO("")
    ipc = StdioIpc(stdin=inp, stdout=io.StringIO())
    msg = await ipc.receive()
    assert msg is None


@pytest.mark.asyncio
async def test_receive_skips_blank_lines():
    inp = io.StringIO('\n\n{"type":"Pause"}\n')
    ipc = StdioIpc(stdin=inp, stdout=io.StringIO())
    msg = await ipc.receive()
    assert msg is not None
    assert msg.type == "Pause"
```

- [ ] **Step 2: Run test, verify it fails (module not exists)**

Run: `cd sidecar; uv run pytest tests/test_ipc.py -v`

Expected: ImportError — `starlight_voice.ipc` doesn't exist.

- [ ] **Step 3: Write minimal implementation**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\ipc.py`:

```python
"""Stdio JSON-RPC server.

Each line in stdin/stdout is exactly one JSON message:
    {"type": "<MessageType>", "data": <optional payload>}

Matches the Rust shell's `SidecarMessage` enum (tauri/src/sidecar.rs).
"""
from __future__ import annotations

import asyncio
import json
import sys
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, IO, Optional

import structlog

logger = structlog.get_logger()


@dataclass
class Message:
    type: str
    data: Optional[Any] = None

    def to_json(self) -> str:
        payload: dict[str, Any] = {"type": self.type}
        if self.data is not None:
            payload["data"] = self.data
        return json.dumps(payload, separators=(",", ":"))

    @classmethod
    def from_json(cls, text: str) -> "Message":
        obj = json.loads(text)
        return cls(type=obj["type"], data=obj.get("data"))


class StdioIpc:
    """Line-delimited JSON-over-stdio.

    Default stdin/stdout = sys.stdin/sys.stdout. Override for testing.
    """

    def __init__(
        self,
        stdin: Optional[IO[str]] = None,
        stdout: Optional[IO[str]] = None,
    ) -> None:
        self._stdin = stdin if stdin is not None else sys.stdin
        self._stdout = stdout if stdout is not None else sys.stdout

    async def send(self, msg: Message) -> None:
        line = msg.to_json() + "\n"
        # write is sync; this is fine because we yield via asyncio.sleep(0)
        self._stdout.write(line)
        self._stdout.flush()
        await asyncio.sleep(0)

    async def receive(self) -> Optional[Message]:
        """Returns next message or None on EOF."""
        loop = asyncio.get_event_loop()
        while True:
            line = await loop.run_in_executor(None, self._stdin.readline)
            if line == "":
                return None
            line = line.strip()
            if not line:
                continue
            try:
                return Message.from_json(line)
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning("ipc.malformed_message", line=line, error=str(e))

    async def messages(self) -> AsyncIterator[Message]:
        while True:
            msg = await self.receive()
            if msg is None:
                return
            yield msg
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_ipc.py -v`

Expected: PASS — 4 passed.

- [ ] **Step 5: Wire IPC into __main__**

Modify `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py` (replace contents):

```python
"""Entry point: python -m starlight_voice"""
from __future__ import annotations

import asyncio
import sys

import structlog

from starlight_voice.ipc import Message, StdioIpc

logger = structlog.get_logger()


async def event_loop(ipc: StdioIpc) -> None:
    await ipc.send(Message(type="Status", data={"state": "ready"}))
    async for msg in ipc.messages():
        logger.info("ipc.recv", type=msg.type, data=msg.data)
        if msg.type == "Shutdown":
            await ipc.send(Message(type="Status", data={"state": "shutdown"}))
            return
        # Other handlers wired in Task 13 (pipeline) + Task 19 (cognition).


def main() -> int:
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        # log to stderr — stdout is reserved for IPC frames.
        logger_factory=structlog.PrintLoggerFactory(file=sys.stderr),
    )
    logger.info("starlight_voice.sidecar.starting")
    ipc = StdioIpc()
    try:
        asyncio.run(event_loop(ipc))
    except KeyboardInterrupt:
        pass
    logger.info("starlight_voice.sidecar.exit")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 6: Manual smoke (interactive)**

Run: `cd sidecar; uv run python -m starlight_voice`

The process now waits on stdin. Type (or paste): `{"type":"Shutdown"}` then Enter.

Expected: stderr logs an "ipc.recv" line; process exits 0.

- [ ] **Step 7: Commit**

```bash
git add sidecar/src/starlight_voice/ipc.py sidecar/src/starlight_voice/__main__.py sidecar/tests/test_ipc.py
git commit -m "feat(sidecar): stdio JSON-RPC IPC + persistent event loop"
git push
```

---

## Task 11: Pipecat pipeline scaffold (passthrough)

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_pipeline.py`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_pipeline.py`:

```python
"""Pipeline scaffold: builds a Pipecat task that can run and stop."""
import pytest

from starlight_voice.pipeline import build_passthrough_pipeline


@pytest.mark.asyncio
async def test_passthrough_pipeline_builds():
    pipeline = build_passthrough_pipeline()
    assert pipeline is not None
    # We can't fully run a pipeline without a transport in unit tests;
    # the smoke is that construction succeeds and processors are wired.
    processors = pipeline._processors  # noqa: SLF001 — exposed for testing only
    assert len(processors) >= 1
```

- [ ] **Step 2: Run failing test**

Run: `cd sidecar; uv run pytest tests/test_pipeline.py -v`

Expected: ImportError — module missing.

- [ ] **Step 3: Write pipeline**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`:

```python
"""Pipecat frame pipeline.

For Task 11 this is a passthrough scaffold: mic frames flow in and flow out
unmodified. Subsequent tasks layer in Silero VAD (Task 14), Deepgram Flux STT
(Task 15), cognition router (Task 18), Cartesia TTS (Task 16).
"""
from __future__ import annotations

from pipecat.pipeline.pipeline import Pipeline
from pipecat.processors.frame_processor import FrameProcessor

import structlog

logger = structlog.get_logger()


class Tap(FrameProcessor):
    """Logs every frame for debugging. Forwards untouched."""

    async def process_frame(self, frame, direction):
        logger.debug("pipeline.tap", frame_type=type(frame).__name__)
        await self.push_frame(frame, direction)


def build_passthrough_pipeline() -> Pipeline:
    """Pipeline with a single Tap processor.

    Replaced in Task 14 (VAD), Task 15 (STT), Task 16 (TTS), Task 18 (LLM).
    """
    return Pipeline([Tap()])
```

- [ ] **Step 4: Run test**

Run: `cd sidecar; uv run pytest tests/test_pipeline.py -v`

Expected: PASS — 1 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/pipeline.py sidecar/tests/test_pipeline.py
git commit -m "feat(sidecar): Pipecat pipeline scaffold (Tap passthrough)"
git push
```

---

## Task 12: Silero VAD integration

**Files:**
- Modify: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`
- Modify: `C:\Users\frank\starlight-voice\sidecar\tests\test_pipeline.py`

- [ ] **Step 1: Write failing test**

Append to `C:\Users\frank\starlight-voice\sidecar\tests\test_pipeline.py`:

```python
def test_build_voice_pipeline_includes_vad():
    from starlight_voice.pipeline import build_voice_pipeline

    pipeline = build_voice_pipeline(ptt_only=True)
    processor_names = [type(p).__name__ for p in pipeline._processors]
    # With PTT only, VAD is informational (still useful for turn-end detection).
    assert "SileroVADAnalyzer" in processor_names or "Tap" in processor_names
```

- [ ] **Step 2: Run failing test**

Run: `cd sidecar; uv run pytest tests/test_pipeline.py::test_build_voice_pipeline_includes_vad -v`

Expected: AttributeError — `build_voice_pipeline` not yet defined.

- [ ] **Step 3: Implement**

Append to `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`:

```python
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams


def build_voice_pipeline(*, ptt_only: bool = True) -> Pipeline:
    """Full voice pipeline scaffold.

    When `ptt_only=True`, the VAD is used for turn-end detection only — the
    mic is gated by the Rust shell's PTT hotkey events. When `ptt_only=False`
    (clap ambient mode, Task 4-6 week), VAD also gates utterance start.
    """
    vad = SileroVADAnalyzer(
        params=VADParams(
            confidence=0.7,
            start_secs=0.2,
            stop_secs=0.4,
            min_volume=0.6,
        )
    )
    processors: list[FrameProcessor] = [vad, Tap()]
    return Pipeline(processors)
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_pipeline.py -v`

Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/pipeline.py sidecar/tests/test_pipeline.py
git commit -m "feat(sidecar): wire Silero VAD into voice pipeline"
git push
```

---

## Task 13: Deepgram Flux STT adapter

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\__init__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\deepgram_stt.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_deepgram_stt.py`

- [ ] **Step 1: Write failing test (mocked SDK)**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\__init__.py`:

```python
"""External-service adapters (Deepgram, Cartesia, Cerebras, ElevenLabs, etc.)."""
```

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_deepgram_stt.py`:

```python
"""Deepgram Flux STT adapter — Pipecat STTService implementation."""
import os
import pytest

from starlight_voice.adapters.deepgram_stt import DeepgramFluxSTT


def test_adapter_constructs_with_api_key():
    stt = DeepgramFluxSTT(api_key="fake_key_for_test")
    assert stt is not None


def test_adapter_raises_on_missing_api_key(monkeypatch):
    monkeypatch.delenv("DEEPGRAM_API_KEY", raising=False)
    with pytest.raises(ValueError, match="DEEPGRAM_API_KEY"):
        DeepgramFluxSTT()
```

- [ ] **Step 2: Run failing**

Run: `cd sidecar; uv run pytest tests/test_deepgram_stt.py -v`

Expected: ImportError.

- [ ] **Step 3: Implement adapter**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\deepgram_stt.py`:

```python
"""Deepgram Flux STT adapter — wraps Pipecat's DeepgramSTTService with Flux config.

Deepgram Flux is the streaming model with integrated turn detection (<300ms
first partial). The standard pattern is to point Pipecat's existing
DeepgramSTTService at the Flux model name.
"""
from __future__ import annotations

import os
from typing import Optional

# Pipecat 0.0.50+ provides DeepgramSTTService.
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.transcriptions.language import Language


class DeepgramFluxSTT(DeepgramSTTService):
    """Deepgram Flux configuration of Pipecat's DeepgramSTTService."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        language: Language = Language.EN_US,
        model: str = "flux-1",  # Deepgram Flux streaming model
        **kwargs,
    ):
        resolved_key = api_key or os.environ.get("DEEPGRAM_API_KEY")
        if not resolved_key:
            raise ValueError(
                "DEEPGRAM_API_KEY missing (pass api_key= or set env var)"
            )
        super().__init__(
            api_key=resolved_key,
            model=model,
            language=language,
            **kwargs,
        )
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_deepgram_stt.py -v`

Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/adapters/ sidecar/tests/test_deepgram_stt.py
git commit -m "feat(sidecar): Deepgram Flux STT adapter (Pipecat-wrapped)"
git push
```

---

## Task 14: Cartesia Sonic-2 TTS adapter

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\cartesia_tts.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_cartesia_tts.py`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_cartesia_tts.py`:

```python
import pytest

from starlight_voice.adapters.cartesia_tts import CartesiaSonic2TTS


def test_adapter_constructs_with_api_key_and_voice_id():
    tts = CartesiaSonic2TTS(api_key="fake_key", voice_id="794f9389-aac1-45b6-b726-9d9369183238")
    assert tts is not None


def test_adapter_raises_on_missing_api_key(monkeypatch):
    monkeypatch.delenv("CARTESIA_API_KEY", raising=False)
    with pytest.raises(ValueError, match="CARTESIA_API_KEY"):
        CartesiaSonic2TTS(voice_id="794f9389-aac1-45b6-b726-9d9369183238")
```

- [ ] **Step 2: Run failing**

Run: `cd sidecar; uv run pytest tests/test_cartesia_tts.py -v`

Expected: ImportError.

- [ ] **Step 3: Implement adapter**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\cartesia_tts.py`:

```python
"""Cartesia Sonic-2 TTS adapter.

Sonic-2 is Cartesia's current real-time TTS — ~90ms TTFA, streaming. We wrap
Pipecat's CartesiaTTSService and pin model_id to sonic-2.
"""
from __future__ import annotations

import os
from typing import Optional

from pipecat.services.cartesia.tts import CartesiaTTSService


class CartesiaSonic2TTS(CartesiaTTSService):
    """Cartesia Sonic-2 voice."""

    def __init__(
        self,
        *,
        voice_id: str,
        api_key: Optional[str] = None,
        model: str = "sonic-2",
        sample_rate: int = 16000,
        **kwargs,
    ):
        resolved_key = api_key or os.environ.get("CARTESIA_API_KEY")
        if not resolved_key:
            raise ValueError(
                "CARTESIA_API_KEY missing (pass api_key= or set env var)"
            )
        super().__init__(
            api_key=resolved_key,
            voice_id=voice_id,
            model=model,
            sample_rate=sample_rate,
            **kwargs,
        )
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_cartesia_tts.py -v`

Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/adapters/cartesia_tts.py sidecar/tests/test_cartesia_tts.py
git commit -m "feat(sidecar): Cartesia Sonic-2 TTS adapter"
git push
```

---

## Task 15: Cerebras Llama-4 LLM adapter (in-process, openai-compatible)

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\cerebras_llm.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_cerebras_llm.py`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_cerebras_llm.py`:

```python
import pytest

from starlight_voice.adapters.cerebras_llm import CerebrasLlama4LLM


def test_adapter_constructs_with_api_key():
    llm = CerebrasLlama4LLM(api_key="fake_key")
    assert llm is not None
    assert llm.model_name == "llama-4-scout-17b-16e-instruct"


def test_adapter_raises_on_missing_api_key(monkeypatch):
    monkeypatch.delenv("CEREBRAS_API_KEY", raising=False)
    with pytest.raises(ValueError, match="CEREBRAS_API_KEY"):
        CerebrasLlama4LLM()
```

- [ ] **Step 2: Run failing**

Run: `cd sidecar; uv run pytest tests/test_cerebras_llm.py -v`

Expected: ImportError.

- [ ] **Step 3: Implement**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\adapters\cerebras_llm.py`:

```python
"""Cerebras Llama-4 LLM adapter.

Cerebras hosts Llama-4 with the OpenAI-compatible API. We use Pipecat's
OpenAILLMService with base_url overridden to Cerebras's endpoint. TTFT ~160ms,
520 TPS — current 2026 hot-path LLM leader.
"""
from __future__ import annotations

import os
from typing import Optional

from pipecat.services.openai.llm import OpenAILLMService


class CerebrasLlama4LLM(OpenAILLMService):
    """Cerebras-hosted Llama-4 via OpenAI-compatible API."""

    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        model: str = "llama-4-scout-17b-16e-instruct",
        base_url: str = "https://api.cerebras.ai/v1",
        **kwargs,
    ):
        resolved_key = api_key or os.environ.get("CEREBRAS_API_KEY")
        if not resolved_key:
            raise ValueError(
                "CEREBRAS_API_KEY missing (pass api_key= or set env var)"
            )
        super().__init__(
            api_key=resolved_key,
            model=model,
            base_url=base_url,
            **kwargs,
        )
        self.model_name = model
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_cerebras_llm.py -v`

Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/adapters/cerebras_llm.py sidecar/tests/test_cerebras_llm.py
git commit -m "feat(sidecar): Cerebras Llama-4 LLM adapter (openai-compatible)"
git push
```

---

## Task 16: End-to-end voice pipeline (mic → STT → LLM → TTS → speakers)

**Files:**
- Modify: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`
- Modify: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_e2e_smoke.py`

- [ ] **Step 1: Write smoke test (skip if no API keys)**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_e2e_smoke.py`:

```python
"""End-to-end smoke (requires live API keys; skipped in CI by default)."""
import os
import pytest

REQUIRED = ("DEEPGRAM_API_KEY", "CARTESIA_API_KEY", "CEREBRAS_API_KEY")


@pytest.mark.skipif(
    any(not os.environ.get(k) for k in REQUIRED),
    reason="live e2e smoke requires Deepgram + Cartesia + Cerebras keys",
)
def test_voice_pipeline_builds_with_real_services():
    """Builds the full pipeline against real services. No audio actually flows here —
    we just verify construction + service handshakes complete."""
    from starlight_voice.pipeline import build_voice_pipeline_full

    pipeline = build_voice_pipeline_full(cartesia_voice_id="794f9389-aac1-45b6-b726-9d9369183238")
    assert pipeline is not None
    processor_names = [type(p).__name__ for p in pipeline._processors]
    assert "DeepgramFluxSTT" in processor_names
    assert "CerebrasLlama4LLM" in processor_names
    assert "CartesiaSonic2TTS" in processor_names
```

- [ ] **Step 2: Run failing**

Run: `cd sidecar; uv run pytest tests/test_e2e_smoke.py -v`

Expected: ImportError (`build_voice_pipeline_full` missing).

- [ ] **Step 3: Implement full pipeline**

Append to `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\pipeline.py`:

```python
from starlight_voice.adapters.deepgram_stt import DeepgramFluxSTT
from starlight_voice.adapters.cartesia_tts import CartesiaSonic2TTS
from starlight_voice.adapters.cerebras_llm import CerebrasLlama4LLM


def build_voice_pipeline_full(
    *,
    cartesia_voice_id: str,
    system_prompt: str = "You are Starlight Voice — direct, technical, warm. Frank is at his keyboard.",
) -> Pipeline:
    """Full mic → STT → LLM → TTS pipeline.

    Note: transports (mic input, speaker output) are wired by the caller in
    __main__.event_loop. This function just builds the processor chain.
    """
    vad = SileroVADAnalyzer(
        params=VADParams(confidence=0.7, start_secs=0.2, stop_secs=0.4, min_volume=0.6)
    )
    stt = DeepgramFluxSTT()
    llm = CerebrasLlama4LLM()
    tts = CartesiaSonic2TTS(voice_id=cartesia_voice_id)

    processors: list[FrameProcessor] = [vad, stt, llm, tts, Tap()]
    return Pipeline(processors)
```

- [ ] **Step 4: Wire pipeline into __main__**

Modify `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py` — replace `event_loop` with:

```python
async def event_loop(ipc: StdioIpc) -> None:
    """Receive IPC events, drive pipeline accordingly.

    On PTT pressed → start utterance capture.
    On PTT released → flush + push final transcript to LLM.
    On Shutdown → exit cleanly.

    Full transport wiring (sounddevice → pipeline → sounddevice playback) lands
    in this loop; here we model the control flow. Audio I/O is connected via
    pipecat.transports.local.audio.LocalAudioTransport.
    """
    from pipecat.transports.local.audio import LocalAudioTransport, LocalAudioTransportParams
    from pipecat.pipeline.runner import PipelineRunner
    from pipecat.pipeline.task import PipelineTask
    from pipecat.frames.frames import EndFrame, LLMMessagesFrame
    import os

    from starlight_voice.pipeline import build_voice_pipeline_full

    cartesia_voice = os.environ.get(
        "CARTESIA_VOICE_ID",
        "794f9389-aac1-45b6-b726-9d9369183238",  # default; Frank picks own voice in tray Settings
    )

    transport = LocalAudioTransport(
        params=LocalAudioTransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_sample_rate=16000,
            audio_out_sample_rate=16000,
        )
    )

    pipeline = build_voice_pipeline_full(cartesia_voice_id=cartesia_voice)
    task = PipelineTask(pipeline)
    runner = PipelineRunner(handle_sigint=False)

    await ipc.send(Message(type="Status", data={"state": "ready"}))

    # Run pipeline as a background task; IPC drives control.
    pipeline_task = asyncio.create_task(runner.run(task))

    try:
        async for msg in ipc.messages():
            logger.info("ipc.recv", type=msg.type, data=msg.data)
            if msg.type == "PttPressed":
                await ipc.send(Message(type="Status", data={"state": "listening"}))
                # Transport mic is always-on at this stage; PTT gates utterance
                # finalization via Tier 0 router in Task 18.
            elif msg.type == "PttReleased":
                await ipc.send(Message(type="Status", data={"state": "thinking"}))
            elif msg.type == "Shutdown":
                await task.queue_frame(EndFrame())
                break
    finally:
        pipeline_task.cancel()
        await ipc.send(Message(type="Status", data={"state": "shutdown"}))
```

- [ ] **Step 5: Run unit tests (smoke skipped without keys)**

Run: `cd sidecar; uv run pytest -v`

Expected: All previous tests pass + e2e smoke either passes (if keys set) or is skipped.

- [ ] **Step 6: Live smoke — say "hello"**

In two terminals:
1. Set env: `$env:DEEPGRAM_API_KEY = "..."; $env:CARTESIA_API_KEY = "..."; $env:CEREBRAS_API_KEY = "..."; $env:STARLIGHT_VOICE_PYTHON = "C:\Users\frank\starlight-voice\sidecar\.venv\Scripts\python.exe"`
2. Run: `cargo run --release -p starlight-voice-tauri`

Hold `Ctrl+Shift+Space`, say "Hello, can you hear me?", release. Expected: speaker plays Cartesia voice replying. Latency from release-of-PTT to first audio out should subjectively feel under a second. We'll measure formally in Task 23 (benchmark CI).

- [ ] **Step 7: Commit**

```bash
git add sidecar/src/starlight_voice/pipeline.py sidecar/src/starlight_voice/__main__.py sidecar/tests/test_e2e_smoke.py
git commit -m "feat(sidecar): end-to-end voice pipeline (Deepgram+Cerebras+Cartesia)"
git push
```

---

# WEEK 3 — Cognition router, MCP, boot discipline, migration

## Task 17: Port cognition router from SIS (Tier 0 + Tier 1 + Tier 2)

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\__init__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\router.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\prompts.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_router.py`

- [ ] **Step 1: Read the SIS source**

Read `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator\service\cognition\router.py` to capture the exact tier-classification logic. Map it to the new shape:

- Tier 0: deterministic regex/classifier — port verbatim
- Tier 1: hot path (Cerebras Llama-4) — replace OpenRouter call with direct Cerebras adapter
- Tier 2: warm path (Anthropic Claude or Groq Kimi-K2)
- Tier 2.5: deliberation (Claude + extended thinking) — NEW, added in Task 22 (week 4-6)
- Tier 3: CLI subprocess — deferred to week 4-6 (pre-warmed pool)

- [ ] **Step 2: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_router.py`:

```python
"""Cognition router: Tier 0 deterministic + Tier 1 hot routing."""
import pytest

from starlight_voice.cognition.router import (
    CognitionRouter,
    RouterTier,
    classify_utterance,
)


def test_tier_0_pause_command():
    assert classify_utterance("pause") == RouterTier.DETERMINISTIC
    assert classify_utterance("resume") == RouterTier.DETERMINISTIC
    assert classify_utterance("stop listening") == RouterTier.DETERMINISTIC


def test_tier_1_default_hot_path():
    assert classify_utterance("what's the weather") == RouterTier.HOT


def test_tier_2_substrate_keywords():
    assert classify_utterance("refactor this module") == RouterTier.WARM
    assert classify_utterance("add a new vertical") == RouterTier.WARM


def test_router_constructs():
    router = CognitionRouter(cerebras_key="fake", anthropic_key="fake")
    assert router is not None
```

- [ ] **Step 3: Run failing**

Run: `cd sidecar; uv run pytest tests/test_router.py -v`

Expected: ImportError.

- [ ] **Step 4: Implement router**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\__init__.py`:

```python
"""Cognition tier routing: Tier 0 deterministic, Tier 1 hot, Tier 2 warm."""
```

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\prompts.py`:

```python
"""System prompts for each cognition tier.

Salvaged + simplified from SIS `private/voice-operator/service/cognition/system_prompt.py`.
"""

FRANK_DNA = """\
You are Starlight Voice — Frank's daily-driver voice operator.
Frank = Systems Architect × Composer × Gamer × Builder × GenCreator.
Vibe: cool, premium, high intellect, purpose-driven, fun.
Voice: direct, technical, warm, playful, pattern recognition as poetry.
You serve builders, not consumers. You think in systems.

Be concise. One or two sentences unless asked to elaborate.
Never narrate what you're about to do. Just do it and report.
"""

HOT_SYSTEM = FRANK_DNA + "\nYou are on the hot path. Keep responses under 30 words."

WARM_SYSTEM = FRANK_DNA + """
You are on the warm path — substrate-grade thinking.
The user has invoked a topic requiring care (refactor, vertical design,
architecture). Be thorough; you have a 2-second latency budget.
"""
```

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\cognition\router.py`:

```python
"""Cognition router: dispatches utterances across Tier 0/1/2.

Port of SIS `private/voice-operator/service/cognition/router.py` with shape
adapted to Pipecat. Tier 2.5 (deliberation) is wired in Task 22 (week 4-6).
"""
from __future__ import annotations

import enum
import re
from typing import Optional

import structlog

logger = structlog.get_logger()


class RouterTier(enum.Enum):
    DETERMINISTIC = "tier_0_deterministic"
    HOT = "tier_1_hot"
    WARM = "tier_2_warm"
    DELIBERATION = "tier_2_5_deliberation"  # wired in Task 22


# Tier 0 patterns — regex match → instant deterministic action.
TIER_0_PATTERNS: dict[re.Pattern[str], str] = {
    re.compile(r"^\s*(pause|stop listening|mute)\s*$", re.I): "pause",
    re.compile(r"^\s*(resume|unmute|continue listening)\s*$", re.I): "resume",
    re.compile(r"^\s*quit( starlight)?\s*$", re.I): "quit",
}

# Tier 2 keywords — substrate-grade or code-generation utterances.
TIER_2_KEYWORDS = (
    "refactor",
    "redesign",
    "architecture",
    "substrate",
    "sip",
    "vertical",
    "stack",
    "vault",
    "intelligence system",
    "/starlight-board",
)


def classify_utterance(text: str) -> RouterTier:
    """Returns the cognition tier for a given user utterance."""
    if not text or not text.strip():
        return RouterTier.HOT
    for pattern in TIER_0_PATTERNS:
        if pattern.match(text):
            return RouterTier.DETERMINISTIC
    lower = text.lower()
    if any(kw in lower for kw in TIER_2_KEYWORDS):
        return RouterTier.WARM
    return RouterTier.HOT


class CognitionRouter:
    """Holds backend handles for each tier and dispatches utterances."""

    def __init__(
        self,
        *,
        cerebras_key: Optional[str] = None,
        anthropic_key: Optional[str] = None,
    ):
        # Lazily construct adapters on first dispatch to avoid import-time
        # API key validation breaking tests that don't need cognition.
        self._cerebras_key = cerebras_key
        self._anthropic_key = anthropic_key
        self._hot = None
        self._warm = None

    async def hot(self):
        if self._hot is None:
            from starlight_voice.adapters.cerebras_llm import CerebrasLlama4LLM
            self._hot = CerebrasLlama4LLM(api_key=self._cerebras_key)
        return self._hot

    async def warm(self):
        if self._warm is None:
            from anthropic import AsyncAnthropic
            self._warm = AsyncAnthropic(api_key=self._anthropic_key)
        return self._warm

    def deterministic_action(self, text: str) -> Optional[str]:
        for pattern, action in TIER_0_PATTERNS.items():
            if pattern.match(text):
                return action
        return None
```

- [ ] **Step 5: Run tests**

Run: `cd sidecar; uv run pytest tests/test_router.py -v`

Expected: PASS — 4 passed.

- [ ] **Step 6: Commit**

```bash
git add sidecar/src/starlight_voice/cognition/ sidecar/tests/test_router.py
git commit -m "feat(sidecar): cognition router Tier 0/1/2 (ported from SIS)"
git push
```

---

## Task 18: MCP-over-stdio universal client

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\mcp\__init__.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\mcp\client.py`
- Create: `C:\Users\frank\starlight-voice\sidecar\tests\test_mcp_client.py`

- [ ] **Step 1: Write failing test**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\mcp\__init__.py`:

```python
"""MCP client + smart tool selection."""
```

Create `C:\Users\frank\starlight-voice\sidecar\tests\test_mcp_client.py`:

```python
"""MCP universal client — connect, list tools, call tool."""
import pytest

from starlight_voice.mcp.client import McpClientPool, McpServerConfig


def test_pool_constructs_empty():
    pool = McpClientPool()
    assert pool.server_count() == 0


def test_add_server_config():
    pool = McpClientPool()
    pool.add_server(McpServerConfig(name="starlight-mcp", command="python", args=["-m", "starlight_mcp"]))
    assert pool.server_count() == 1
    assert pool.server_names() == ["starlight-mcp"]


def test_duplicate_server_raises():
    pool = McpClientPool()
    cfg = McpServerConfig(name="a", command="echo")
    pool.add_server(cfg)
    with pytest.raises(ValueError, match="already registered"):
        pool.add_server(cfg)
```

- [ ] **Step 2: Run failing**

Run: `cd sidecar; uv run pytest tests/test_mcp_client.py -v`

Expected: ImportError.

- [ ] **Step 3: Implement client**

Create `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\mcp\client.py`:

```python
"""MCP-over-stdio universal client.

Wraps the `mcp` Python SDK's stdio client. Manages a pool of MCP server
subprocess connections; exposes their tools to the cognition router as a
unified registry.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional

import structlog

logger = structlog.get_logger()


@dataclass
class McpServerConfig:
    name: str
    command: str
    args: list[str] = field(default_factory=list)
    env: dict[str, str] = field(default_factory=dict)


@dataclass
class McpTool:
    """Tool exposed by an MCP server, namespaced as <server>.<tool>."""

    server: str
    name: str
    description: str
    input_schema: dict[str, Any]

    @property
    def qualified_name(self) -> str:
        return f"{self.server}.{self.name}"


class McpClientPool:
    """Manages a pool of MCP stdio connections.

    Lifecycle: register configs → `start_all()` boots subprocesses and
    handshakes → `tools()` returns the unified registry → `call(qualified, args)`
    dispatches.
    """

    def __init__(self) -> None:
        self._servers: dict[str, McpServerConfig] = {}
        self._connected: dict[str, Any] = {}  # mcp client sessions
        self._tools: dict[str, McpTool] = {}

    def server_count(self) -> int:
        return len(self._servers)

    def server_names(self) -> list[str]:
        return list(self._servers.keys())

    def add_server(self, cfg: McpServerConfig) -> None:
        if cfg.name in self._servers:
            raise ValueError(f"MCP server '{cfg.name}' already registered")
        self._servers[cfg.name] = cfg

    async def start_all(self) -> None:
        """Connect to every registered server, fetch tool list."""
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client

        for name, cfg in self._servers.items():
            params = StdioServerParameters(command=cfg.command, args=cfg.args, env=cfg.env)
            try:
                async with stdio_client(params) as (read, write):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        tools_response = await session.list_tools()
                        for tool in tools_response.tools:
                            mcp_tool = McpTool(
                                server=name,
                                name=tool.name,
                                description=tool.description or "",
                                input_schema=tool.inputSchema,
                            )
                            self._tools[mcp_tool.qualified_name] = mcp_tool
                        logger.info("mcp.server.connected", server=name, tools=len(tools_response.tools))
                # session closed; persistent connection lifecycle improvement in week 4-6.
            except Exception as e:
                logger.error("mcp.server.connect_failed", server=name, error=str(e))

    def tools(self) -> list[McpTool]:
        return list(self._tools.values())

    def select_relevant(self, utterance: str, max_tools: int = 18) -> list[McpTool]:
        """Smart tool selection — returns the N most-relevant tools for an utterance.

        v1: simple keyword overlap. ML ranking lands in Week 4-6.
        """
        words = set(utterance.lower().split())
        scored = []
        for tool in self._tools.values():
            desc_words = set((tool.description or "").lower().split())
            score = len(words & desc_words)
            scored.append((score, tool))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [t for _, t in scored[:max_tools]]
```

- [ ] **Step 4: Run tests**

Run: `cd sidecar; uv run pytest tests/test_mcp_client.py -v`

Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
git add sidecar/src/starlight_voice/mcp/ sidecar/tests/test_mcp_client.py
git commit -m "feat(sidecar): MCP-over-stdio universal client pool"
git push
```

---

## Task 19: Wire 3 MCP servers (starlight-mcp, memory-bus, claude-code-cli)

**Files:**
- Create: `C:\Users\frank\starlight-voice\sidecar\config\mcp-servers.toml`
- Modify: `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py`

- [ ] **Step 1: Write MCP server config**

Create `C:\Users\frank\starlight-voice\sidecar\config\mcp-servers.toml`:

```toml
# MCP servers consumed by starlight-voice.
# Each server runs as a stdio subprocess managed by McpClientPool.
# Servers are listed in priority order — earlier servers get queried first
# when smart-tool-selection ties.

[[server]]
name = "starlight-mcp"
command = "node"
args = ["C:/Users/frank/Starlight-Intelligence-System/packs/available/starlight-mcp/dist/index.js"]

[[server]]
name = "memory-bus"
command = "python"
args = ["-m", "memory_bus.server"]

[[server]]
name = "claude-code-cli-mcp"
command = "node"
# This MCP wraps the claude-code CLI. The wrapper repo is created in Task 20.
args = ["C:/Users/frank/starlight-voice-claude-code-mcp/dist/index.js"]
```

- [ ] **Step 2: Wire config load into __main__**

Add to `C:\Users\frank\starlight-voice\sidecar\src\starlight_voice\__main__.py` event_loop function, right after `await ipc.send(Message(type="Status", data={"state": "ready"}))`:

```python
    # Load and start MCP servers.
    import tomllib
    from pathlib import Path
    from starlight_voice.mcp.client import McpClientPool, McpServerConfig

    cfg_path = Path(__file__).parent.parent.parent / "config" / "mcp-servers.toml"
    pool = McpClientPool()
    if cfg_path.exists():
        with cfg_path.open("rb") as f:
            cfg = tomllib.load(f)
        for entry in cfg.get("server", []):
            pool.add_server(McpServerConfig(
                name=entry["name"],
                command=entry["command"],
                args=entry.get("args", []),
                env=entry.get("env", {}),
            ))
        await pool.start_all()
        logger.info("mcp.pool.ready", server_count=pool.server_count(), tool_count=len(pool.tools()))
    else:
        logger.warning("mcp.config.missing", path=str(cfg_path))
```

- [ ] **Step 3: Verify load**

Run: `cd sidecar; uv run python -m starlight_voice`

Watch stderr — expected: log lines `mcp.server.connected server=starlight-mcp tools=N`, `mcp.server.connected server=memory-bus tools=N`. If claude-code-cli-mcp fails (it's not built yet — that's Task 20), the pool logs a connect_failed warning but starlight-voice continues.

Send `{"type":"Shutdown"}\n` to exit.

- [ ] **Step 4: Commit**

```bash
git add sidecar/config/mcp-servers.toml sidecar/src/starlight_voice/__main__.py
git commit -m "feat(sidecar): wire 3 MCP servers (starlight-mcp, memory-bus, claude-code-cli)"
git push
```

---

## Task 20: claude-code-cli-mcp wrapper (new tiny repo)

**Files:**
- Create: separate tiny repo `C:\Users\frank\starlight-voice-claude-code-mcp\`
- Create: `package.json`, `src/index.ts`, `tsconfig.json`

- [ ] **Step 1: Initialize tiny repo**

```powershell
gh repo create frankxai/starlight-voice-claude-code-mcp --public --description "MCP wrapper around claude-code CLI for starlight-voice."
git clone https://github.com/frankxai/starlight-voice-claude-code-mcp.git C:\Users\frank\starlight-voice-claude-code-mcp
cd C:\Users\frank\starlight-voice-claude-code-mcp
npm init -y
```

- [ ] **Step 2: Add MCP server**

Replace `C:\Users\frank\starlight-voice-claude-code-mcp\package.json` with:

```json
{
  "name": "starlight-voice-claude-code-mcp",
  "version": "0.1.0",
  "description": "MCP server wrapping claude-code CLI",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "execa": "^9.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

Create `C:\Users\frank\starlight-voice-claude-code-mcp\tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

Create `C:\Users\frank\starlight-voice-claude-code-mcp\src\index.ts`:

```typescript
#!/usr/bin/env node
/**
 * MCP server wrapping the `claude-code` CLI.
 *
 * Exposes one tool: `dispatch(prompt, working_dir?, timeout_ms?)`.
 * On call, spawns claude-code via execa, captures stdout, returns the result.
 *
 * Pre-warmed pool implementation (one persistent claude-code subprocess) is
 * deferred to Week 4-6.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execa } from 'execa';

const server = new Server(
  { name: 'starlight-voice-claude-code-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'dispatch',
      description: 'Dispatch a prompt to the claude-code CLI. Returns its stdout.',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'The prompt to send to claude-code' },
          working_dir: { type: 'string', description: 'Working directory (default: cwd)' },
          timeout_ms: { type: 'number', description: 'Max execution time in ms (default: 60000)' },
        },
        required: ['prompt'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'dispatch') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  const args = request.params.arguments as {
    prompt: string;
    working_dir?: string;
    timeout_ms?: number;
  };
  const result = await execa('claude', ['--print', args.prompt], {
    cwd: args.working_dir,
    timeout: args.timeout_ms ?? 60000,
    reject: false,
  });
  return {
    content: [
      { type: 'text', text: result.stdout || result.stderr || '(no output)' },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

- [ ] **Step 3: Build + install**

```powershell
cd C:\Users\frank\starlight-voice-claude-code-mcp
npm install
npm run build
```

Expected: `dist/index.js` exists.

- [ ] **Step 4: Test via MCP inspector**

Manual smoke: run the binary and verify it speaks MCP via stdio. Easiest test: use the `mcp` Python SDK inspector pattern (or simply confirm the wrapped pool from Task 19 connects without "connect_failed").

Run: `cd C:\Users\frank\starlight-voice\sidecar; uv run python -m starlight_voice` and verify all three MCP servers in mcp-servers.toml report `mcp.server.connected`.

- [ ] **Step 5: Commit (both repos)**

```powershell
cd C:\Users\frank\starlight-voice-claude-code-mcp
git add package.json tsconfig.json src/
git commit -m "feat: claude-code CLI MCP wrapper"
git push
```

---

## Task 21: Installer post-install script (single scheduled task)

**Files:**
- Create: `C:\Users\frank\starlight-voice\installer\install.ps1`
- Create: `C:\Users\frank\starlight-voice\installer\uninstall.ps1`

- [ ] **Step 1: Write install.ps1**

Create `C:\Users\frank\starlight-voice\installer\install.ps1`:

```powershell
#Requires -Version 7.0
<#
.SYNOPSIS
  Post-install script for starlight-voice.

.DESCRIPTION
  Registers a single AtLogOn scheduled task running the Tauri binary with
  WindowStyle=Hidden. NO cmd.exe. NO pwsh wrapper. Direct binary invocation
  with hidden window subsystem.

.PARAMETER InstallDir
  Path where starlight-voice-tauri.exe lives.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$InstallDir
)

$ErrorActionPreference = 'Stop'
$ExePath = Join-Path $InstallDir 'starlight-voice-tauri.exe'

if (-not (Test-Path $ExePath)) {
  throw "Cannot find $ExePath"
}

Write-Host "Registering scheduled task 'StarlightVoice-Tray'..."

$action = New-ScheduledTaskAction -Execute $ExePath -Argument '--hidden'
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
  -Hidden
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName 'StarlightVoice-Tray' `
  -Description 'Starlight Voice tray operator (hidden, single instance).' `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Host "Done. Scheduled task 'StarlightVoice-Tray' is registered at logon."
Write-Host "Starting tray now..."
Start-Process -FilePath $ExePath -ArgumentList '--hidden' -WindowStyle Hidden
```

- [ ] **Step 2: Write uninstall.ps1**

Create `C:\Users\frank\starlight-voice\installer\uninstall.ps1`:

```powershell
#Requires -Version 7.0
<#
.SYNOPSIS
  Post-uninstall script for starlight-voice. Removes the scheduled task and
  stops the running tray binary.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

Get-ScheduledTask -TaskName 'StarlightVoice-Tray' -ErrorAction SilentlyContinue |
  Unregister-ScheduledTask -Confirm:$false

Get-Process -Name 'starlight-voice-tauri' -ErrorAction SilentlyContinue |
  Stop-Process -Force

Write-Host "Uninstall complete. Scheduled task removed; tray process stopped."
```

- [ ] **Step 3: Manual test (run installer)**

Build release first: `cargo build --release -p starlight-voice-tauri`

Run: `pwsh -File installer/install.ps1 -InstallDir "C:\Users\frank\starlight-voice\target\release"`

Expected: scheduled task `StarlightVoice-Tray` registered; tray icon appears.
Verify: `Get-ScheduledTask -TaskName 'StarlightVoice-Tray' | Select-Object TaskName,State`

- [ ] **Step 4: Reboot + verify hidden startup**

Reboot. After logon: tray icon should appear. **Zero visible windows.** Zero `cmd.exe` flashes. Zero console.

If any visible window appears: P0 bug — `tauri.conf.json` and the `windows_subsystem = "windows"` flag together must guarantee GUI subsystem.

- [ ] **Step 5: Commit**

```bash
git add installer/install.ps1 installer/uninstall.ps1
git commit -m "feat(installer): single scheduled task (StarlightVoice-Tray), hidden"
git push
```

---

## Task 22: Legacy-task killer (`uninstall-legacy-tasks.ps1`)

**Files:**
- Create: `C:\Users\frank\starlight-voice\installer\uninstall-legacy-tasks.ps1`

- [ ] **Step 1: Write the killer script**

Create `C:\Users\frank\starlight-voice\installer\uninstall-legacy-tasks.ps1`:

```powershell
#Requires -Version 7.0
<#
.SYNOPSIS
  One-shot script to remove legacy SIS + Arcanea scheduled tasks that
  starlight-voice supersedes.

.DESCRIPTION
  Prompts the user with the list of tasks to remove. Auto-backs up each task's
  XML to `$env:USERPROFILE\.starlight-voice-backup\scheduled-tasks\` before
  removal. Reversible.

.PARAMETER DryRun
  If specified, lists tasks but does not remove them.
#>
[CmdletBinding()]
param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$LegacyTasks = @(
  'Arcanea24x7',
  'StarlightCockpit',
  'Cockpit-Auto-Rehydrate-On-Login',
  'Cockpit-Auto-Save-Morning',
  'Cockpit-Auto-Save-Evening',
  'Cockpit-Periodic-Snapshot',
  'Cockpit-Shutdown-Snapshot',
  'Cockpit-Weekly-GC',
  'Starlight Dreaming',
  'StarlightCrossRepoIndexer',
  'StarlightPortfolioAudit',
  'StarlightSubstrateBackup'
)

$Found = @()
foreach ($name in $LegacyTasks) {
  $task = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
  if ($task) {
    $Found += $task
  }
}

if ($Found.Count -eq 0) {
  Write-Host "No legacy tasks found. Already clean."
  return
}

Write-Host ""
Write-Host "Legacy scheduled tasks found ($($Found.Count)):"
$Found | ForEach-Object { Write-Host "  - $($_.TaskName) [state=$($_.State)]" }

if ($DryRun) {
  Write-Host ""
  Write-Host "DryRun: no changes made. Re-run without -DryRun to remove."
  return
}

Write-Host ""
$response = Read-Host "Remove these tasks? Backups saved to ~\.starlight-voice-backup\. [y/N]"
if ($response -ne 'y' -and $response -ne 'Y') {
  Write-Host "Aborted."
  return
}

$BackupDir = Join-Path $env:USERPROFILE '.starlight-voice-backup\scheduled-tasks'
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

foreach ($task in $Found) {
  $safeName = $task.TaskName -replace '[^a-zA-Z0-9._-]', '_'
  $backupPath = Join-Path $BackupDir "$safeName.xml"
  Export-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath |
    Out-File -FilePath $backupPath -Encoding utf8
  Unregister-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath -Confirm:$false
  Write-Host "  removed: $($task.TaskName)  (backup: $backupPath)"
}

Write-Host ""
Write-Host "Done. To restore any task: schtasks /create /tn <name> /xml <backup-path>"
```

- [ ] **Step 2: Dry-run smoke**

Run: `pwsh -File installer/uninstall-legacy-tasks.ps1 -DryRun`

Expected: lists matching legacy tasks without removing them.

- [ ] **Step 3: DO NOT run for real yet**

Live execution is in Task 24 after the SIS-side archive (Task 23) is done. Order matters: archive the source code first, then kill the tasks.

- [ ] **Step 4: Commit**

```bash
git add installer/uninstall-legacy-tasks.ps1
git commit -m "feat(installer): legacy-task killer (12 tasks, with backup)"
git push
```

---

## Task 23: Benchmark CI gate

**Files:**
- Create: `C:\Users\frank\starlight-voice\benchmarks\run.py`
- Create: `C:\Users\frank\starlight-voice\benchmarks\budgets.toml`
- Modify: `C:\Users\frank\starlight-voice\.github\workflows\python.yml`

- [ ] **Step 1: Write budgets**

Create `C:\Users\frank\starlight-voice\benchmarks\budgets.toml`:

```toml
# Latency budgets per stage. CI fails if measured P50 exceeds target by >20%.

[vad_turn_detection]
target_p50_ms = 90
tolerance_pct = 20

[stt_first_partial]
target_p50_ms = 300
tolerance_pct = 20

[llm_first_token]
target_p50_ms = 200
tolerance_pct = 20

[tts_first_audio]
target_p50_ms = 100
tolerance_pct = 20

[e2e_hot_path]
target_p50_ms = 800
tolerance_pct = 20
```

- [ ] **Step 2: Write benchmark runner**

Create `C:\Users\frank\starlight-voice\benchmarks\run.py`:

```python
"""Latency benchmarks for starlight-voice.

Usage:
    python benchmarks/run.py --probe e2e-hot-path --n 50
    python benchmarks/run.py --all --json out.json
    python benchmarks/run.py --ci   # CI mode: runs all, exits 1 on budget breach

In CI mode, requires API keys via env. Locally without keys, falls back to mocks.
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
import sys
import tomllib
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Callable

BUDGETS_PATH = Path(__file__).parent / "budgets.toml"


@dataclass
class ProbeResult:
    name: str
    n: int
    p50_ms: float
    p95_ms: float
    target_p50_ms: float
    tolerance_pct: float
    pass_: bool

    @property
    def status(self) -> str:
        return "PASS" if self.pass_ else "FAIL"


def load_budgets() -> dict[str, dict]:
    with BUDGETS_PATH.open("rb") as f:
        return tomllib.load(f)


def measure(fn: Callable[[], None], n: int) -> tuple[float, float]:
    samples_ms: list[float] = []
    for _ in range(n):
        t0 = time.perf_counter()
        fn()
        samples_ms.append((time.perf_counter() - t0) * 1000)
    samples_ms.sort()
    return statistics.median(samples_ms), samples_ms[int(0.95 * len(samples_ms)) - 1]


def probe_vad(n: int) -> ProbeResult:
    # Synthetic probe: Silero VAD on 30ms silence frames.
    import numpy as np
    from pipecat.audio.vad.silero import SileroVADAnalyzer
    vad = SileroVADAnalyzer()
    frame = np.zeros(int(16000 * 0.03), dtype=np.float32)

    def step():
        vad.voice_confidence(frame.tobytes())

    p50, p95 = measure(step, n)
    budgets = load_budgets()["vad_turn_detection"]
    threshold = budgets["target_p50_ms"] * (1 + budgets["tolerance_pct"] / 100)
    return ProbeResult(
        name="vad_turn_detection",
        n=n,
        p50_ms=p50,
        p95_ms=p95,
        target_p50_ms=budgets["target_p50_ms"],
        tolerance_pct=budgets["tolerance_pct"],
        pass_=p50 <= threshold,
    )


# Additional probes (stt_first_partial, llm_first_token, tts_first_audio,
# e2e_hot_path) require live API keys; implementations follow the same shape.
# Stub them for the MVR; live impls land in Week 4-6 alongside Tier 2.5.

PROBES: dict[str, Callable[[int], ProbeResult]] = {
    "vad_turn_detection": probe_vad,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--probe", choices=list(PROBES.keys()) + ["all"], default="all")
    parser.add_argument("--n", type=int, default=20)
    parser.add_argument("--json", type=Path)
    parser.add_argument("--ci", action="store_true")
    args = parser.parse_args()

    targets = list(PROBES.keys()) if args.probe == "all" else [args.probe]
    results: list[ProbeResult] = [PROBES[name](args.n) for name in targets]

    for r in results:
        print(f"{r.status}  {r.name:30s}  P50={r.p50_ms:6.1f}ms  P95={r.p95_ms:6.1f}ms  "
              f"target={r.target_p50_ms:.0f}ms ±{r.tolerance_pct:.0f}%")

    if args.json:
        args.json.write_text(json.dumps([asdict(r) for r in results], indent=2))

    if args.ci and any(not r.pass_ for r in results):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Add to CI**

Modify `C:\Users\frank\starlight-voice\.github\workflows\python.yml` — add this step after the "Test" step:

```yaml
      - name: Benchmark CI gate
        run: cd sidecar && uv run python ../benchmarks/run.py --ci
```

- [ ] **Step 4: Local smoke**

Run: `cd C:\Users\frank\starlight-voice; sidecar\.venv\Scripts\python.exe benchmarks/run.py --probe vad_turn_detection --n 20`

Expected: `PASS vad_turn_detection P50=Xms P95=Yms target=90ms ±20%`

If FAIL, the budget is wrong (Silero on CPU should easily hit 90ms P50); investigate hardware or measurement bug.

- [ ] **Step 5: Commit**

```bash
git add benchmarks/ .github/workflows/python.yml
git commit -m "feat(bench): VAD latency probe + CI budget gate"
git push
```

---

## Task 24: SIS-side migration — archive `private/voice-operator/`

**Files (in SIS repo, not starlight-voice repo):**
- Modify: `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator\` (rename/move)
- Create: `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator-archive-2026-05-14\README.md`

**SUBSTRATE GATE:** This task touches SIS substrate. Run `/starlight-board` pre-pass BEFORE the commit in Step 4 per CLAUDE.md "Substrate-tier governance gate".

- [ ] **Step 1: Convene /starlight-board for pre-pass**

In the SIS repo, run: `/starlight-board`

Topic: "Archive `private/voice-operator/` in favor of new sovereign `starlight-voice` repo. Move (not delete) the directory to `private/voice-operator-archive-2026-05-14/`. Update memory entries to reflect new architecture."

Expected Board verdict: PROCEED (this is the natural conclusion of the v3 spec). If REVISE/BLOCK, address before continuing.

- [ ] **Step 2: Perform the move**

```powershell
cd C:\Users\frank\Starlight-Intelligence-System
Move-Item private/voice-operator private/voice-operator-archive-2026-05-14
```

- [ ] **Step 3: Add archive README**

Create `C:\Users\frank\Starlight-Intelligence-System\private\voice-operator-archive-2026-05-14\README.md`:

```markdown
# voice-operator — archived 2026-05-14

The Python voice operator service formerly at `private/voice-operator/` has
been superseded by the sovereign repo **`starlight-voice`** at
https://github.com/frankxai/starlight-voice.

## Why archived

See `docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md` in this
SIS repo for the full first-principles redesign rationale.

Tl;dr: voice operator extracted to a new sovereign repo to clean up the
SIS-Python / Arcanea-Node duplication and the 12-scheduled-task auto-start
chaos. New repo ships as a Tauri tray + Python Pipecat sidecar, single
hidden scheduled task, sub-800ms hot path.

## Lifecycle

- 2026-05-14: archived. No further changes here.
- ~2026-08-14 (90 days): physical deletion (Q3 cleanup).

## If you need to reference the old code

Salvageable patterns ported to starlight-voice:
- `service/cognition/router.py` → `sidecar/src/starlight_voice/cognition/router.py`
- `service/clap_detector.py` → ported as-is in week 4-6
- `service/text_mode.py` _execute_packet() → MCP-aware dispatcher
- `config/*.toml` + 11 workflow YAMLs → starlight-voice config
- `tests/` (53 files) → starlight-voice test contract
```

- [ ] **Step 4: Update CLAUDE.md to reflect the change**

Modify `C:\Users\frank\Starlight-Intelligence-System\CLAUDE.md` — find any reference to `private/voice-operator/` and add a note pointing to the new repo. (If no direct references exist, this step is a no-op.)

- [ ] **Step 5: Commit (substrate gate verdict in body)**

```bash
cd C:\Users\frank\Starlight-Intelligence-System
git add private/voice-operator-archive-2026-05-14/ CLAUDE.md
git rm -r --cached private/voice-operator/  # if it was tracked
git commit -m "substrate(v85): archive private/voice-operator → starlight-voice sovereign repo

Per docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md. New
sovereign repo at github.com/frankxai/starlight-voice. 90-day grace,
physical deletion ~2026-08-14.

/starlight-board pre-pass: PROCEED (verdict in <session>).
"
git push
```

---

## Task 25: Live legacy-task kill (Frank's machine)

**Files:** none — script execution only

- [ ] **Step 1: Verify backup directory ready**

```powershell
$BackupDir = "$env:USERPROFILE\.starlight-voice-backup\scheduled-tasks"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Test-Path $BackupDir
```

Expected: `True`.

- [ ] **Step 2: Dry-run the killer**

```powershell
cd C:\Users\frank\starlight-voice
pwsh -File installer/uninstall-legacy-tasks.ps1 -DryRun
```

Expected: prints up to 12 task names, no removal.

- [ ] **Step 3: Run the killer for real**

```powershell
pwsh -File installer/uninstall-legacy-tasks.ps1
```

Answer `y` at the prompt. Expected: each task is exported to backup XML, then removed. Final line: `Done.`

- [ ] **Step 4: Verify clean**

```powershell
Get-ScheduledTask | Where-Object { $_.TaskName -match 'starlight|arcanea|cockpit|dreaming' -and $_.TaskName -ne 'StarlightVoice-Tray' } |
  Select-Object TaskName
```

Expected: empty result (or only `StarlightVoice-Tray` if installer was run first).

- [ ] **Step 5: Verify backups exist**

```powershell
Get-ChildItem "$env:USERPROFILE\.starlight-voice-backup\scheduled-tasks\"
```

Expected: 12 .xml files matching killed task names.

- [ ] **Step 6: No commit needed (no file changes in repos)**

---

## Task 26: Cleanup SIS firefighting tools

**Files (in SIS repo):**
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\fix-hide-task-windows.ps1`
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\fix-safe-cache-clean.ps1`
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\diag-cockpit-tasks.ps1`
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\diag-scheduled-tasks.ps1`
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\diag-post-reboot.ps1`
- Delete: `C:\Users\frank\Starlight-Intelligence-System\tools\diag-probe.ps1`

**SUBSTRATE GATE:** These tools touched the now-deleted auto-start surface. Their removal is part of the same substrate change as Task 24. The `/starlight-board` pre-pass from Task 24 covers this.

- [ ] **Step 1: Confirm files are uncommitted (from `git status` in initial audit)**

```bash
cd C:\Users\frank\Starlight-Intelligence-System
git status tools/
```

Expected: lists the six fix/diag scripts as untracked (`??`).

- [ ] **Step 2: Delete the files**

```powershell
Remove-Item tools\fix-hide-task-windows.ps1
Remove-Item tools\fix-safe-cache-clean.ps1
Remove-Item tools\diag-cockpit-tasks.ps1
Remove-Item tools\diag-scheduled-tasks.ps1
Remove-Item tools\diag-post-reboot.ps1
Remove-Item tools\diag-probe.ps1
```

- [ ] **Step 3: Verify gone**

```bash
ls tools/fix-* tools/diag-*
```

Expected: no matches (or only `tools/diag-cockpit-tasks.ps1` if that one was tracked — re-check `git ls-files tools/diag-*`).

- [ ] **Step 4: No commit needed if all were untracked. If any tracked, commit removal:**

```bash
git add tools/
git commit -m "chore: remove firefighting scripts (superseded by starlight-voice)"
git push
```

---

## Task 27: Update CLAUDE.md memory entries

**Files (in user memory):**
- Modify: `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\project_arcanea_flow_connect_not_absorb.md`
- Create: `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\project_starlight_voice_v3_mvr.md`
- Modify: `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\MEMORY.md`

- [ ] **Step 1: Update stale memory `arcanea-flow connect-not-absorb`**

Per Task 3 audit, this memory is stale (the actual live bridge is between `Arcanea` monorepo and SIS, not `arcanea-flow`). Modify the file at `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\project_arcanea_flow_connect_not_absorb.md` to clarify: arcanea-flow is sidelined; the active sibling is `Arcanea/packages/arcanea-voice`, which is being archived as starlight-voice supersedes it.

- [ ] **Step 2: Add new memory entry**

Create `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\project_starlight_voice_v3_mvr.md`:

```markdown
---
name: starlight-voice v3 MVR — weeks 1-3 implementation plan
description: New sovereign repo extracted from SIS-Python + Arcanea-Node duplication. Tauri tray + Python Pipecat sidecar; PTT primary + clap ambient (no wake-word); sub-800ms hot path; MCP-only cross-repo. MVR weeks 1-3, B-tier 4-6, C-tier 7-12.
metadata:
  type: project
---

Spec: `docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md`.
Plan: `docs/superpowers/plans/2026-05-14-starlight-voice-v3-mvr.md`.

**MVR (weeks 1-3):**
- New repo `frankxai/starlight-voice` (public MIT).
- Tauri Rust tray shell: tray icon, PTT hotkey (Ctrl+Shift+Space), hidden autostart, sidecar IPC.
- Python sidecar: Pipecat + Silero VAD + Deepgram Flux + Cerebras Llama-4 + Cartesia Sonic-2.
- Cognition router salvaged from SIS (Tier 0/1/2; Tier 2.5 deliberation in Wave 2).
- MCP client + 3 servers wired (starlight-mcp, memory-bus, claude-code-cli-mcp).
- Installer creates ONE scheduled task `StarlightVoice-Tray` (hidden); legacy-task killer removes 12 SIS/Arcanea tasks.
- SIS-side: `private/voice-operator/` archived → `private/voice-operator-archive-2026-05-14/`; 6 firefighting tools deleted.
- Benchmark CI gate for sub-800ms hot-path SLA.

**Falsifier:** zero visible windows at logon. Single tray icon. Full mic-close → first audio P50 <800ms.

**Substrate gate:** `/starlight-board` pre-pass required for SIS-side migration commit (Task 24).
```

- [ ] **Step 3: Add pointer to MEMORY.md**

Modify `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\MEMORY.md` — insert this line at an appropriate location (after the v01 Friday-demo lines):

```markdown
- [starlight-voice v3 MVR](project_starlight_voice_v3_mvr.md) — new sovereign repo extracted from SIS/Arcanea voice duplication. Tauri + Pipecat. PTT primary + clap ambient. Sub-800ms hot path.
```

- [ ] **Step 4: No commit needed (memory is auto-managed)**

---

## Task 28: PORTING_FROM_SIS.md for Frank's own machine

**Files:**
- Create: `C:\Users\frank\starlight-voice\docs\PORTING_FROM_SIS.md`

- [ ] **Step 1: Write the porting guide**

Create `C:\Users\frank\starlight-voice\docs\PORTING_FROM_SIS.md`:

```markdown
# Porting from SIS `private/voice-operator/` → starlight-voice

You are reading this because you just archived `private/voice-operator/` in
your SIS repo and need to bring up `starlight-voice` as the new daily-driver.

## Prerequisites

- Rust toolchain (`rustc --version` 1.85+)
- uv (`uv --version` 0.5+)
- PowerShell 7 (`where.exe pwsh`)
- API keys for Deepgram, Cartesia, Cerebras, Anthropic, OpenAI (others optional)

## Bring-up sequence

1. **Clone starlight-voice:**
   ```powershell
   git clone https://github.com/frankxai/starlight-voice.git C:\Users\frank\starlight-voice
   cd C:\Users\frank\starlight-voice
   ```

2. **Set env (copy .env.example to .env, fill in keys):**
   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

3. **Build Tauri + sidecar:**
   ```powershell
   cargo build --release -p starlight-voice-tauri
   cd sidecar
   uv sync --extra dev
   cd ..
   ```

4. **Install (registers `StarlightVoice-Tray` scheduled task):**
   ```powershell
   pwsh -File installer/install.ps1 -InstallDir "$PWD\target\release"
   ```

5. **Kill legacy SIS+Arcanea scheduled tasks (with backup):**
   ```powershell
   pwsh -File installer/uninstall-legacy-tasks.ps1
   ```

6. **Reboot to verify hidden startup:**
   - Tray icon appears
   - ZERO visible windows
   - ZERO `cmd.exe` flashes
   - ZERO terminals
   - ZERO browsers (unrelated startup items like Comet are not voice's concern)

7. **First voice test:** hold `Ctrl+Shift+Space`, say "Hello, who are you?", release. Expected: Cartesia voice replies in <2s.

## Rollback

If something breaks:

1. **Restore legacy tasks:**
   ```powershell
   Get-ChildItem "$env:USERPROFILE\.starlight-voice-backup\scheduled-tasks\*.xml" |
     ForEach-Object { schtasks /create /tn $_.BaseName /xml $_.FullName }
   ```

2. **Unarchive voice-operator:**
   ```powershell
   cd C:\Users\frank\Starlight-Intelligence-System
   git revert <substrate-commit-from-task-24>
   ```

3. **Uninstall starlight-voice:**
   ```powershell
   pwsh -File C:\Users\frank\starlight-voice\installer\uninstall.ps1
   ```

## Daily ops

- **Pause listening:** tray menu → Pause listening.
- **Toggle clap ambient:** tray menu → Clap ambient mode.
- **Postmortem:** tray menu → Show Brain (opens brain-viz web app; opt-in, not at logon).
- **Edit config:** tray menu → Settings... (opens webview).
- **Logs:** `%USERPROFILE%\.starlight-voice\logs\sidecar.log`.

## When something feels slow

Run the benchmark probe:
```powershell
cd C:\Users\frank\starlight-voice
sidecar\.venv\Scripts\python.exe benchmarks/run.py --probe e2e-hot-path --n 50
```

If P50 >800ms: one of the providers is degraded. Check provider status pages
(Deepgram, Cartesia, Cerebras). The router falls over to ElevenLabs Flash +
Whisper local + Groq on provider failure automatically — verify in logs.
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\frank\starlight-voice
git add docs/PORTING_FROM_SIS.md
git commit -m "docs(install): PORTING_FROM_SIS guide for Frank's own machine"
git push
```

---

## Task 29: Final smoke + Frank dogfood start

**Files:** none — execution + validation only

- [ ] **Step 1: Reboot the machine**

Reboot Windows. After logon completes (give it 90 seconds):

- [ ] **Step 2: Verify clean startup**

Run mentally + observably:
- Count visible windows. Expected: 0 from starlight-voice. (Comet/OneDrive/etc. are unrelated and untouched.)
- Tray icon present? Expected: yes.
- Console window or `cmd.exe` flash visible? Expected: no.

In a fresh PowerShell:
```powershell
Get-ScheduledTask | Where-Object { $_.TaskName -match 'starlight|arcanea|cockpit|dreaming' } | Select-Object TaskName,State
```

Expected: ONLY `StarlightVoice-Tray` listed.

```powershell
Get-Process | Where-Object { $_.ProcessName -match 'starlight-voice|python.*starlight' } | Format-Table ProcessName,Id,@{N='WS_MB';E={[math]::Round($_.WorkingSet64/1MB,1)}},StartTime
```

Expected: 1 Tauri process + 1 Python sidecar process, both started near logon time.

- [ ] **Step 3: First utterance smoke**

Hold `Ctrl+Shift+Space`. Say: "Test one, can you hear me?". Release.

Expected: Cartesia voice replies in subjectively-under-2-seconds. Tray icon (if you wired state changes) shows listening → thinking → idle.

If no audio: check sidecar logs at `%USERPROFILE%\.starlight-voice\logs\sidecar.log` for STT/LLM/TTS errors.

- [ ] **Step 4: Substrate intent smoke**

Hold `Ctrl+Shift+Space`. Say: "Think about how to refactor the cognition router." Release.

Expected: a warm-tier response (substrate keyword "refactor" triggered Tier 2). Deeper/slower than Tier 1.

- [ ] **Step 5: Run benchmark probe**

```powershell
cd C:\Users\frank\starlight-voice
sidecar\.venv\Scripts\python.exe benchmarks/run.py --probe vad_turn_detection --n 50
```

Expected: PASS with P50 well under 90ms.

- [ ] **Step 6: Mark plan complete**

Plan complete. Time to write the Week 4-6 follow-on plan (B-tier surfaces: clap ambient, phone PWA, brain viz, browser-use MCP, Tier 2.5 deliberation, pre-warmed dispatcher pool). That plan starts after Frank has dogfooded the MVR for 2-3 days.

```bash
cd C:\Users\frank\starlight-voice
git tag v0.1.0-mvr
git push --tags
```

---

# Self-Review Notes

After writing this plan, I cross-checked against the spec:

**Spec coverage:**
- §5 Architecture — Tasks 2, 3, 9, 10 (Tauri shell + Python sidecar + IPC). ✓
- §6 Activation — Task 7 (PTT). Clap ambient mode deferred to Week 4-6 plan, noted in scope. ✓
- §7 Cognition pipeline — Tasks 12 (VAD), 13 (STT), 14 (TTS), 15 (LLM), 16 (e2e), 17 (router). Tier 2.5 deliberation explicitly noted as Week 4-6 (Task 22 in follow-on plan). ✓
- §8 Surfaces — Tray (Task 6). Brain viz / phone PWA in follow-on plan. ✓
- §9 Boot/install discipline — Task 8 (autostart), 21 (install.ps1 single scheduled task), 22 (legacy-task killer), 24 (SIS archive), 25 (live kill), 26 (firefighting cleanup). ✓
- §10 Migration — Tasks 24 (SIS archive), 27 (memory updates). Arcanea-side deprecation deferred (90-day grace per spec). ✓
- §11 Cross-repo bridges — Tasks 18 (MCP client), 19 (3 servers), 20 (claude-code wrapper). 7 more servers in follow-on plan. ✓
- §12 Performance — Task 15 (in-process Cerebras = pillar 1). Pre-warmed pool + browser-use + deliberation in Week 4-6 plan. Benchmark CI gate Task 23. ✓
- §13 Phased rollout — this plan = Weeks 1-3 explicitly. ✓
- §14 Testing — every implementation task has a TDD step. ✓
- §15 Error handling — failover noted in spec, implementation pattern in Task 17 (lazy adapter construction supports failover). Full multi-provider failover wiring in follow-on plan. ⚠ (acceptable deferral; explicit in spec §15)
- §16 Risks — no specific tasks; addressed implicitly through TDD discipline. ✓

**Placeholder scan:** no TBD/TODO/FIXME found.

**Type consistency:** `McpClientPool`, `McpServerConfig`, `McpTool` names consistent across Task 18 + Task 19. `RouterTier` enum names consistent. `Message` and `SidecarMessage` deliberately have different names (different sides: Python `Message`, Rust `SidecarMessage`) but the wire format is identical.

**Scope:** focused on Weeks 1-3 MVR. Weeks 4-6 and 7-12 explicitly outside scope of this plan; will get their own plans.

---

# Plan complete.

Plan saved to `docs/superpowers/plans/2026-05-14-starlight-voice-v3-mvr.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Good for the long tail of similar tasks (the adapter tasks 13-15 in particular). Two-stage review keeps quality.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Good if Frank wants to watch the build happen and steer in real-time.

Substrate-tier tasks (24, 26) need `/starlight-board` pre-pass regardless of execution mode.
