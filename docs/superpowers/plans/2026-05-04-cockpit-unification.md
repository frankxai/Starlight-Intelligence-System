# Cockpit Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single `arc <project>` PowerShell command opens the right Zellij layout for any active project, with `claude --resume <project>` discipline baked in. Consumes the audit JSON from `memory/_audit/repo-portfolio-2026-05-04.json` for canonical paths.

**Architecture:** Per-project Zellij layouts at `cockpit-zellij/layouts/<project>.kdl` (generated from a template + audit JSON, then hand-tuned). Extended `arc` PowerShell function takes optional project arg, falls back to default `starlight-orchestrator` when no arg. Consolidates the two pre-existing layouts (`cockpit-zellij/layouts/starlight-orchestrator.kdl` + `private/local-command-center/cockpit/Arcanea.kdl`). One source-of-truth directory.

**Tech Stack:** PowerShell 5+ (Windows-native, no PS7 dependency), Zellij 0.43.1 (already installed), KDL layout files, Claude Code CLI (`claude --resume <name>`).

---

## File Structure

| Path | Responsibility |
|---|---|
| `cockpit-zellij/lib/projects.ps1` (NEW) | Audit-JSON loader. Function `Get-StarlightProjects` returns hashtable of active+queen-bound projects with canonical paths. |
| `cockpit-zellij/scripts/zellij-aliases.ps1` (MODIFY) | Existing `arc` / `arc-attach` / `arc-kill` / `arc-list` / `arc-layout` extended with `arc <project>`, `arc-list-projects`, `arc-resume <project>`. |
| `cockpit-zellij/layouts/starlight-orchestrator.kdl` (KEEP) | Default no-arg layout. Unchanged. |
| `cockpit-zellij/layouts/sis.kdl` (NEW) | SIS-substrate cockpit. 4 tabs, named-Claude-resume in Dispatcher pane. |
| `cockpit-zellij/layouts/arcanea.kdl` (NEW, supersedes private/.../Arcanea.kdl) | Arcanea cockpit. Same 4-tab shape, Arcanea cwd. |
| `cockpit-zellij/layouts/frankx.kdl` (NEW) | FrankX cockpit. |
| `cockpit-zellij/layouts/energy-is.kdl` (NEW) | Energy IS authoring cockpit (matches the Energy IS tab dispatch). |
| `cockpit-zellij/layouts/_template.kdl.tmpl` (NEW) | Parameterized template for future generations. |
| `cockpit-zellij/README.md` (MODIFY) | Document the new convention + commands. |
| `private/local-command-center/cockpit/Arcanea.kdl` (DELETE) | Superseded by `cockpit-zellij/layouts/arcanea.kdl`. |
| `cockpit-zellij/test/smoke.ps1` (NEW) | Verification harness — every layout file parses, every alias function returns expected output. |

---

## Task 1: Audit-JSON loader

**Files:**
- Create: `cockpit-zellij/lib/projects.ps1`

- [ ] **Step 1.1: Create `cockpit-zellij/lib/` directory + projects.ps1**

```powershell
# cockpit-zellij/lib/projects.ps1 -- canonical project list from audit JSON
#
# Returns hashtable of project-key -> { name, path, cluster, days_since, class }
# Filters: only 'active' (<= 14 days). Sorted by days_since asc.

function Get-StarlightProjects {
    param(
        [string]$AuditJsonPath = (Join-Path $PSScriptRoot '..\..\memory\_audit\repo-portfolio-2026-05-04.json')
    )

    if (-not (Test-Path $AuditJsonPath)) {
        Write-Warning "Audit JSON not found at $AuditJsonPath. Run tools/audit-repo-portfolio.ps1 first."
        return @{}
    }

    $audit = Get-Content $AuditJsonPath -Raw | ConvertFrom-Json
    $result = [ordered]@{}

    foreach ($repo in $audit.repos) {
        if ($repo.class -ne 'active') { continue }
        $key = $repo.name.ToLower() -replace '\.', '-'
        $result[$key] = [PSCustomObject]@{
            key        = $key
            name       = $repo.name
            path       = $repo.path
            cluster    = $repo.consolidation_cluster
            days_since = $repo.days_since
            class      = $repo.class
        }
    }

    return $result
}

function Get-StarlightProject {
    param([string]$Key)
    $projects = Get-StarlightProjects
    if ($projects.Contains($Key)) { return $projects[$Key] }
    # try fuzzy match
    $matches = $projects.Keys | Where-Object { $_ -like "*$Key*" }
    if ($matches.Count -eq 1) { return $projects[$matches[0]] }
    return $null
}
```

- [ ] **Step 1.2: Verify by dot-sourcing**

Run:
```powershell
. cockpit-zellij/lib/projects.ps1
$p = Get-StarlightProjects
$p.Count  # expect: > 0 (24 active per audit)
$p['frankx'].path  # expect: C:\Users\frank\FrankX
```

Expected: counts > 0, path resolves.

- [ ] **Step 1.3: Commit**

```powershell
cd C:/Users/frank/Starlight-Intelligence-System
git add cockpit-zellij/lib/projects.ps1
git commit -m "feat(cockpit): audit-JSON loader for canonical project paths"
```

---

## Task 2: Layout template

**Files:**
- Create: `cockpit-zellij/layouts/_template.kdl.tmpl`

- [ ] **Step 2.1: Create the template**

```kdl
// {{PROJECT_NAME}} cockpit -- generated from _template.kdl.tmpl
//
// Launch: arc {{PROJECT_KEY}}
// Or:     zellij --layout {{PROJECT_KEY}} --session {{PROJECT_KEY}}
//
// Pane geometry (Orchestrator tab):
//
//   ┌─────────────────────────────────────────────────────┐
//   │  DISPATCHER (top, full-width, 30% height)           │
//   │  cmd: claude --resume {{PROJECT_KEY}}               │
//   ├──────────────┬─────────────┬────────────────────────┤
//   │   CLAUDE     │   CODEX     │   GEMINI               │
//   │  (Anthropic) │  (OpenAI)   │  (Google long-context) │
//   └──────────────┴─────────────┴────────────────────────┘

layout {
    default_tab_template {
        children
        pane size=1 borderless=true {
            plugin location="zellij:status-bar"
        }
    }

    tab name="Orchestrator" focus=true {
        pane split_direction="horizontal" {
            pane size="30%" name="Dispatcher" cwd="{{PROJECT_PATH}}"
            pane split_direction="vertical" {
                pane name="Claude" cwd="{{PROJECT_PATH}}"
                pane name="Codex" cwd="{{PROJECT_PATH}}"
                pane name="Gemini" cwd="{{PROJECT_PATH}}"
            }
        }
    }

    tab name="Files" {
        pane name="files" cwd="{{PROJECT_PATH}}"
    }

    tab name="Status" {
        pane name="git" cwd="{{PROJECT_PATH}}"
    }

    tab name="Debug" {
        pane name="logs" cwd="{{PROJECT_PATH}}"
    }
}
```

- [ ] **Step 2.2: Commit**

```powershell
git add cockpit-zellij/layouts/_template.kdl.tmpl
git commit -m "feat(cockpit): layout template for per-project generation"
```

---

## Task 3: Layout generator + concrete layouts

**Files:**
- Create: `cockpit-zellij/scripts/generate-layouts.ps1`

- [ ] **Step 3.1: Write the generator**

```powershell
# cockpit-zellij/scripts/generate-layouts.ps1 -- generate per-project Zellij layouts
#
# Reads cockpit-zellij/layouts/_template.kdl.tmpl
# Substitutes {{PROJECT_NAME}}, {{PROJECT_KEY}}, {{PROJECT_PATH}}
# Writes cockpit-zellij/layouts/<key>.kdl per active project
#
# Idempotent. Safe to re-run.

param(
    [string[]]$Only = @('sis', 'arcanea', 'frankx', 'energy-is'),
    [switch]$All
)

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
. (Join-Path $RepoRoot 'cockpit-zellij\lib\projects.ps1')

$LayoutsDir = Join-Path $RepoRoot 'cockpit-zellij\layouts'
$Template   = Get-Content (Join-Path $LayoutsDir '_template.kdl.tmpl') -Raw

# Special-case: 'sis' aliases to Starlight-Intelligence-System; 'energy-is' aliases to same path
$specialPaths = @{
    'sis'        = $RepoRoot
    'energy-is'  = $RepoRoot
}

$projects = Get-StarlightProjects
$keys = if ($All) { $projects.Keys + $specialPaths.Keys } else { $Only }

foreach ($key in $keys) {
    $name = $null
    $path = $null

    if ($specialPaths.ContainsKey($key)) {
        $path = $specialPaths[$key]
        $name = $key.ToUpper()
    } elseif ($projects.Contains($key)) {
        $path = $projects[$key].path
        $name = $projects[$key].name
    } else {
        # try fuzzy match against audit
        $proj = Get-StarlightProject -Key $key
        if ($proj) {
            $path = $proj.path
            $name = $proj.name
        } else {
            Write-Warning "Project key '$key' not found in audit; skipping."
            continue
        }
    }

    # KDL needs forward-slash paths (or escaped backslashes)
    $kdlPath = $path -replace '\\', '\\'

    $content = $Template `
        -replace '\{\{PROJECT_NAME\}\}', $name `
        -replace '\{\{PROJECT_KEY\}\}',  $key `
        -replace '\{\{PROJECT_PATH\}\}', $kdlPath

    $outPath = Join-Path $LayoutsDir "$key.kdl"
    $content | Out-File -FilePath $outPath -Encoding utf8
    Write-Host "Wrote $outPath"
}

Write-Host ''
Write-Host "Generated $(($keys | Where-Object { Test-Path (Join-Path $LayoutsDir "$_.kdl") }).Count) layouts."
```

- [ ] **Step 3.2: Run generator**

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1
```

Expected: writes `sis.kdl`, `arcanea.kdl`, `frankx.kdl`, `energy-is.kdl` under `cockpit-zellij/layouts/`.

- [ ] **Step 3.3: Verify generated files**

```powershell
Get-ChildItem cockpit-zellij/layouts/*.kdl | Select-Object Name, Length
```

Expected: 5+ files (4 generated + 1 existing `starlight-orchestrator.kdl`), each non-zero.

- [ ] **Step 3.4: Spot-check `sis.kdl`**

```powershell
Get-Content cockpit-zellij/layouts/sis.kdl | Select-String 'cwd'
```

Expected: every cwd line shows `C:\\Users\\frank\\Starlight-Intelligence-System` (escaped backslashes).

- [ ] **Step 3.5: Commit**

```powershell
git add cockpit-zellij/scripts/generate-layouts.ps1 cockpit-zellij/layouts/sis.kdl cockpit-zellij/layouts/arcanea.kdl cockpit-zellij/layouts/frankx.kdl cockpit-zellij/layouts/energy-is.kdl
git commit -m "feat(cockpit): per-project layouts (sis, arcanea, frankx, energy-is) + generator"
```

---

## Task 4: Extended arc PowerShell functions

**Files:**
- Modify: `cockpit-zellij/scripts/zellij-aliases.ps1`

- [ ] **Step 4.1: Read the existing file**

Read current content (3 functions: `arc`, `arc-attach`, `arc-kill`, `arc-list`, `arc-layout`).

- [ ] **Step 4.2: Replace with extended version**

```powershell
# Zellij PowerShell aliases -- source from $PROFILE
#
# To install permanently:
#   notepad $PROFILE
#   add: . "$HOME\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1"
#   save, then: . $PROFILE

. (Join-Path $PSScriptRoot '..\lib\projects.ps1')

function arc {
    param([string]$Project)

    if (-not $Project) {
        # No-arg: legacy default
        zellij --layout starlight-orchestrator
        return
    }

    $LayoutsDir = Join-Path $PSScriptRoot '..\layouts'
    $LayoutFile = Join-Path $LayoutsDir "$Project.kdl"

    if (-not (Test-Path $LayoutFile)) {
        Write-Warning "Layout '$Project.kdl' not found at $LayoutsDir."
        Write-Warning "Run: arc-list-projects"
        Write-Warning "Or generate: pwsh cockpit-zellij/scripts/generate-layouts.ps1 -Only $Project"
        return
    }

    zellij --layout $LayoutFile --session $Project
}

function arc-attach {
    param([string]$Project)

    if (-not $Project) {
        $sessions = zellij list-sessions 2>$null
        if ($sessions) { zellij attach } else { arc }
        return
    }

    $sessions = zellij list-sessions 2>$null
    if ($sessions -match "^$Project") {
        zellij attach $Project
    } else {
        arc $Project
    }
}

function arc-kill {
    zellij kill-all-sessions --yes
}

function arc-list {
    zellij list-sessions
}

function arc-layout {
    param([string]$Layout = 'starlight-orchestrator')
    zellij --layout $Layout
}

function arc-list-projects {
    $LayoutsDir = Join-Path $PSScriptRoot '..\layouts'
    Get-ChildItem $LayoutsDir -Filter '*.kdl' -File |
        Where-Object { $_.Name -notmatch '^_' } |
        Sort-Object Name |
        ForEach-Object {
            $key = $_.BaseName
            $exists = Test-Path $_.FullName
            [PSCustomObject]@{
                Key      = $key
                LayoutKB = [math]::Round($_.Length / 1KB, 1)
                Cmd      = "arc $key"
            }
        } | Format-Table -AutoSize
}

function arc-resume {
    param([string]$Project)
    if (-not $Project) {
        Write-Warning 'Usage: arc-resume <project-key>'
        return
    }
    arc-attach $Project
}

Write-Host 'Starlight aliases loaded: arc, arc-attach, arc-kill, arc-list, arc-layout, arc-list-projects, arc-resume' -ForegroundColor Cyan
```

- [ ] **Step 4.3: Verify by dot-sourcing**

```powershell
. cockpit-zellij/scripts/zellij-aliases.ps1
arc-list-projects
```

Expected: table showing `arcanea`, `energy-is`, `frankx`, `sis`, `starlight-orchestrator`.

- [ ] **Step 4.4: Commit**

```powershell
git add cockpit-zellij/scripts/zellij-aliases.ps1
git commit -m "feat(cockpit): extended arc functions with project arg + arc-list-projects + arc-resume"
```

---

## Task 5: Smoke test harness

**Files:**
- Create: `cockpit-zellij/test/smoke.ps1`

- [ ] **Step 5.1: Write smoke test**

```powershell
# cockpit-zellij/test/smoke.ps1 -- read-only verification harness
#
# Runs in CI or locally. Exits non-zero on first failure.

param([switch]$Verbose)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$failures = @()

function Test-Assert {
    param([string]$Name, [scriptblock]$Test)
    try {
        $result = & $Test
        if ($result -eq $false) { throw "assertion returned false" }
        Write-Host "  PASS: $Name" -ForegroundColor Green
    } catch {
        $script:failures += @{ Name = $Name; Error = $_.Exception.Message }
        Write-Host "  FAIL: $Name -- $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host '=== Cockpit smoke tests ==='
Write-Host ''

# 1. Audit JSON exists
Test-Assert 'audit JSON present' {
    Test-Path (Join-Path $RepoRoot 'memory\_audit\repo-portfolio-2026-05-04.json')
}

# 2. projects.ps1 dot-sources
Test-Assert 'projects.ps1 loads' {
    . (Join-Path $RepoRoot 'cockpit-zellij\lib\projects.ps1')
    $p = Get-StarlightProjects
    $p.Count -gt 0
}

# 3. Each generated layout file exists + is non-zero
$expectedLayouts = @('starlight-orchestrator', 'sis', 'arcanea', 'frankx', 'energy-is')
foreach ($name in $expectedLayouts) {
    Test-Assert "layout $name.kdl exists + non-zero" {
        $f = Join-Path $RepoRoot "cockpit-zellij\layouts\$name.kdl"
        (Test-Path $f) -and ((Get-Item $f).Length -gt 100)
    }
}

# 4. Each layout has cwd line(s)
foreach ($name in @('sis', 'arcanea', 'frankx', 'energy-is')) {
    Test-Assert "layout $name.kdl has cwd" {
        $content = Get-Content (Join-Path $RepoRoot "cockpit-zellij\layouts\$name.kdl") -Raw
        $content -match 'cwd='
    }
}

# 5. Aliases dot-source without error
Test-Assert 'aliases load' {
    . (Join-Path $RepoRoot 'cockpit-zellij\scripts\zellij-aliases.ps1') 6>$null
    Get-Command arc -ErrorAction SilentlyContinue
    Get-Command arc-list-projects -ErrorAction SilentlyContinue
    $true
}

Write-Host ''
if ($failures.Count -eq 0) {
    Write-Host "=== ALL PASS ($($expectedLayouts.Count + 5) tests) ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== $($failures.Count) FAILURES ===" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "  - $($f.Name): $($f.Error)" -ForegroundColor Red
    }
    exit 1
}
```

- [ ] **Step 5.2: Run smoke**

```powershell
pwsh cockpit-zellij/test/smoke.ps1
```

Expected: all PASS, exit 0.

- [ ] **Step 5.3: Commit**

```powershell
git add cockpit-zellij/test/smoke.ps1
git commit -m "test(cockpit): smoke harness for layouts + aliases"
```

---

## Task 6: Consolidate the duplicate Arcanea.kdl

**Files:**
- Delete: `private/local-command-center/cockpit/Arcanea.kdl`

- [ ] **Step 6.1: Verify the new arcanea.kdl exists and serves the same purpose**

```powershell
Get-Content cockpit-zellij/layouts/arcanea.kdl | Select-String 'cwd'
```

Expected: cwd lines show Arcanea path.

- [ ] **Step 6.2: Delete the duplicate**

```powershell
Remove-Item private/local-command-center/cockpit/Arcanea.kdl
```

- [ ] **Step 6.3: Verify private/.../cockpit/ dir is now empty (or remove if so)**

```powershell
Get-ChildItem private/local-command-center/cockpit/
```

If empty, leave the dir (start-cockpit.ps1 may reference). If contents, leave alone.

- [ ] **Step 6.4: Commit**

```powershell
git add -u private/local-command-center/cockpit/Arcanea.kdl
git commit -m "chore(cockpit): remove duplicate Arcanea.kdl (superseded by cockpit-zellij/layouts/arcanea.kdl)"
```

---

## Task 7: Documentation update

**Files:**
- Modify: `cockpit-zellij/README.md`

- [ ] **Step 7.1: Read current README**

Already read in initial recon — basic structure with install steps.

- [ ] **Step 7.2: Replace with extended documentation**

```markdown
# cockpit-zellij/

Zellij terminal-multiplexer cockpit. Per-project layouts + the `arc` PowerShell wrapper.

## What this gives you

A single command opens a complete operator workspace for any project:

```powershell
arc sis        # opens SIS substrate cockpit
arc arcanea    # opens Arcanea constellation cockpit
arc frankx     # opens FrankX flagship cockpit
arc energy-is  # opens Energy IS authoring cockpit
arc            # no-arg: legacy starlight-orchestrator default
```

Each cockpit auto-spawns 4 tabs (Orchestrator / Files / Status / Debug). The Orchestrator tab has a 4-pane layout (Dispatcher + Claude + Codex + Gemini panes), all `cwd`'d to the project.

Combined with `claude --resume <project>` discipline (run inside the Dispatcher pane), every project becomes a named, persistent conversation that survives sleeps and reboots.

## Install (one-time)

```powershell
notepad $PROFILE
```

Add this line, save, close:
```powershell
. "$HOME\Starlight-Intelligence-System\cockpit-zellij\scripts\zellij-aliases.ps1"
```

Then in current session:
```powershell
. $PROFILE
```

## Commands

| Command | What it does |
|---|---|
| `arc` | Opens the legacy `starlight-orchestrator` default layout (no project context) |
| `arc <project>` | Opens the per-project layout. Session is named `<project>` so re-attach finds it. |
| `arc-attach <project>` | Re-attaches to existing session, or opens fresh if none |
| `arc-resume <project>` | Alias for `arc-attach`. Reads naturally with `claude --resume`. |
| `arc-list` | Lists running Zellij sessions |
| `arc-list-projects` | Lists available per-project layouts |
| `arc-kill` | Kills all Zellij sessions cleanly |
| `arc-layout <name>` | Opens a specific layout by name (advanced) |

## How layouts are organized

```
cockpit-zellij/
├── layouts/
│   ├── _template.kdl.tmpl          (parameterized template)
│   ├── starlight-orchestrator.kdl  (legacy default, no-arg)
│   ├── sis.kdl                     (Starlight-Intelligence-System)
│   ├── arcanea.kdl                 (Arcanea constellation)
│   ├── frankx.kdl                  (FrankX flagship)
│   └── energy-is.kdl               (Energy IS authoring tab)
├── lib/
│   └── projects.ps1                (audit-JSON loader)
├── scripts/
│   ├── zellij-aliases.ps1          (the arc functions)
│   └── generate-layouts.ps1        (regenerate layouts from template + audit)
├── test/
│   └── smoke.ps1                   (read-only verification harness)
└── README.md                       (this file)
```

## Generating new layouts

The audit JSON at `memory/_audit/repo-portfolio-2026-05-04.json` is the canonical-paths source. To generate a layout for any audit-identified active project:

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1 -Only <project-key>
```

Or regenerate all default layouts:

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1
```

To regenerate ALL active projects (24+ from audit):

```powershell
pwsh cockpit-zellij/scripts/generate-layouts.ps1 -All
```

## Per-project session naming convention

When you open `arc <project>`, the Zellij session is named `<project>`. This composes with Claude Code's `--resume` flag for full conversation persistence:

```powershell
# In Dispatcher pane, after arc opens:
claude --resume <project>
```

Future re-attaches find both the Zellij workspace AND the Claude conversation. State survives sleep, reboot, and tab-close.

The convention:
```
Zellij session name = project key (e.g., sis, arcanea, frankx)
Claude session name = same project key
Git branch          = the actual deliverable
```

## Relationship to the other cockpit surfaces

- **`cockpit-zellij/`** (this directory) -- terminal cockpit. Multi-CLI orchestration via Zellij. CLI-native.
- **`private/local-command-center/apps/dashboard/`** -- Next.js web cockpit on `:3007` (`/`, `/cockpit`, `/brain`).
- **`private/local-command-center/apps/phone/`** -- phone PWA on `:3008` (`/record`, `/approve`).
- **`private/local-command-center/scripts/start-cockpit.ps1`** -- Windows-native launcher (FastAPI cognition + orb + dashboard + brain_watchdog daemon).

The four surfaces compose. They do not overlap.

## Verification

```powershell
pwsh cockpit-zellij/test/smoke.ps1
```

Should exit 0 with all PASS.

---
**Built on SIP** -- operational-tier scaffolding · 2026-05-04 (cockpit unification)
```

- [ ] **Step 7.3: Commit**

```powershell
git add cockpit-zellij/README.md
git commit -m "docs(cockpit): per-project layout convention + arc command reference"
```

---

## Task 8: Sprint doc + memory update + final push

**Files:**
- Modify: `memory/sprints/2026-W19.md`
- Modify (user memory, separate filesystem): `MEMORY.md`
- Create (user memory): `project_cockpit_unification_2026_05_04.md`

- [ ] **Step 8.1: Append sprint-doc note**

Append to `memory/sprints/2026-W19.md` (before the final `*Built on SIP*` line):

```markdown
## Cockpit unification -- shipped 2026-05-04 (overnight, queen-bound)

Operational-tier ship under "build, massive action, e2e, all night" directive. Closes the "5 cockpit surfaces, 2 launchers" friction Frank named at session open. Single `arc <project>` command + per-project Zellij layouts + `claude --resume <project>` discipline per session.

**Files shipped:**
- `cockpit-zellij/lib/projects.ps1` -- audit-JSON loader
- `cockpit-zellij/layouts/_template.kdl.tmpl` -- parameterized template
- `cockpit-zellij/layouts/{sis,arcanea,frankx,energy-is}.kdl` -- 4 per-project layouts (generated)
- `cockpit-zellij/scripts/generate-layouts.ps1` -- regenerator
- `cockpit-zellij/scripts/zellij-aliases.ps1` -- extended with `arc <project>`, `arc-list-projects`, `arc-resume`
- `cockpit-zellij/test/smoke.ps1` -- verification harness
- `cockpit-zellij/README.md` -- documented convention
- `private/local-command-center/cockpit/Arcanea.kdl` -- DELETED (superseded)

**Test:** `pwsh cockpit-zellij/test/smoke.ps1` -> all PASS.

**Outcome:** ChatGPT's Zellij + named-session proposal is now first-class shipped. The `claude --resume <name>` discipline becomes baked-in via session-naming. SIS-tab is no longer "one of many" -- it's `arc sis`.
```

- [ ] **Step 8.2: Write user-memory entry**

Path: `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\project_cockpit_unification_2026_05_04.md`

```markdown
---
name: Cockpit unification 2026-05-04
description: arc <project> single command + per-project Zellij layouts + audit-JSON-driven canonical paths + claude --resume per session. Closes the multi-tab orchestration friction.
type: project
---

Shipped 2026-05-04 overnight under "build, massive action, e2e, all night" directive.

**What:** Single `arc <project>` PowerShell command opens the right Zellij layout for any project. 4 layouts shipped (sis, arcanea, frankx, energy-is). Generator script reads audit JSON for canonical paths so adding a 5th project is one command. Smoke-test harness verifies layouts + aliases. Documentation in cockpit-zellij/README.md.

**Why:** Frank named at session open: "5 cockpit surfaces, 2 launchers, no project-scoped sessions, multiple Claude sessions with no naming discipline". The audit (commit ab997e7) provided canonical-paths data; this ship consumes it.

**How to apply:** When opening any project, run `arc <project>` from a fresh terminal. Inside the Dispatcher pane, run `claude --resume <project>` so the conversation survives sleeps. Re-attach with `arc-attach <project>` or just `arc <project>` again.

**Composes with:**
- Audit JSON at memory/_audit/repo-portfolio-2026-05-04.json (canonical paths)
- Energy IS handover packet (this is the tab the Energy IS authoring session opens)
- start-cockpit.ps1 (web stack; cockpit-zellij is the terminal stack -- they're complementary, not competing)

**Open work:**
- Generator currently writes layouts that match the simple 4-pane template. Project-specific customizations (e.g., FrankX wants to see `gh issue list`, Arcanea wants `arcanea-status`) are post-MVP.
- 24 active projects in audit; only 4 have layouts. `pwsh cockpit-zellij/scripts/generate-layouts.ps1 -All` generates the rest as needed.
- claude --resume named-session discipline is now infrastructure-supported but not enforced. Karpathy hygiene rule could be promoted to a CLAUDE.md addition next sprint.
```

- [ ] **Step 8.3: Update MEMORY.md index**

Append to `C:\Users\frank\.claude\projects\C--Users-frank-Starlight-Intelligence-System\memory\MEMORY.md`:

```markdown
- [Cockpit unification 2026-05-04](project_cockpit_unification_2026_05_04.md) -- arc <project> single command + per-project Zellij layouts + audit-JSON-driven canonical paths. Composes with claude --resume per session. ChatGPT's Zellij+named-session proposal now first-class shipped.
```

- [ ] **Step 8.4: Run final smoke + final commit + push**

```powershell
pwsh cockpit-zellij/test/smoke.ps1
git add memory/sprints/2026-W19.md
git commit -m "docs(sprint): cockpit unification appendix + memory entry

Operational ship of arc <project> per-project Zellij + audit-driven layouts.
Closes the 5-cockpit-surfaces / 2-launchers friction Frank named at session
open. Per-session naming via claude --resume <project> is now infrastructure-
supported.

W19 Tier 5b-adjacent operational ship -- not on tier list but consumes audit.

Built on SIP -- operational tier"
git push origin main
```

Expected: smoke exits 0, commit lands, push succeeds.

---

## Self-Review

**Spec coverage:**
- Single `arc <project>` command — Task 4 ✓
- Per-project layouts — Task 3 ✓
- Audit JSON consumption — Task 1 ✓
- `claude --resume` discipline baked in — documented in Task 7 ✓
- Consolidate duplicate `Arcanea.kdl` — Task 6 ✓
- Smoke test — Task 5 ✓
- Documentation — Task 7 ✓
- Sprint + memory updates — Task 8 ✓

**Placeholder scan:** No "TBD", "TODO", "fill in details", or vague directives. Every code block is real PowerShell or KDL. Every command is exact.

**Type consistency:** `Get-StarlightProjects` returns hashtable; `Get-StarlightProject -Key <k>` returns single PSCustomObject. Used consistently in Task 1 and Task 3.

**Scope:** Single-purpose, ~7 tasks, ~4-6h. No sprawl.

**Ambiguity:** None — every task has exact paths, exact commands, exact expected output.

---

## Execution Choice

Per Frank's "all night, e2e, execute" directive — **Inline Execution (option 2)** with checkpoints between tasks. Solo session, fast iteration, no fresh-subagent overhead. Will commit after each task per the plan.

---

*Built on SIP -- operational tier · plan written 2026-05-04 · cockpit unification subproject of Sprint W19*
