# Cockpit Profiles

Per-repo cockpit customization. Each active repo can declare a `cockpit-profile.json`
in its root; the layout generator reads it and substitutes per-pane launch commands,
arguments, and model selections into the per-project Zellij layout.

## Why this exists

Default template gives every repo the same 5-tab layout. But a content-heavy repo
(FrankX) wants different CLIs and models than a substrate repo (SIS) or a Next.js
production site (frankx.ai-vercel-website). Profiles let each repo pick its own
shape without forking the template.

## File location (resolution order)

The generator checks two locations and uses the first match:

```
1. <repo-root>/cockpit-profile.json           (repo-owned, repo-tracked)
2. cockpit-zellij/profiles/<key>.json         (SIS-tracked fallback)
```

The repo-owned location lets each project own its profile in its own git
history. The SIS fallback lets SIS ship bootstrap profiles for repos that
haven't adopted the file yet. Both are valid; the repo-owned wins when both
exist.

If neither file exists, the layout uses template defaults.

## Schema

```json
{
  "version": 1,
  "name": "Human-readable label",
  "panes": {
    "dispatcher": { "command": "claude",   "args": ["--resume", "<key>"] },
    "claude":     { "command": "claude",   "args": ["--model", "claude-opus-4-7"] },
    "codex":      { "command": "codex",    "args": ["--model", "gpt-5"] },
    "gemini":     { "command": "gemini",   "args": ["--yolo", "-m", "gemini-2.5-pro"] },
    "opencode":   { "command": "opencode", "args": ["run", "--format", "json"] }
  },
  "team": {
    "agents": ["author-team", "frankx-ai-pipeline"],
    "skills": ["frankx-ai", "brand-voice"]
  }
}
```

### Field reference

| Field | Required | Behavior |
|---|---|---|
| `version` | yes | Must be `1`. Reserved for future schema migrations. |
| `name` | no | Human label; informational. Falls back to repo name. |
| `panes.<key>` | no | Per-pane launch override. Missing pane = template default (shell or auto-launch from template). |
| `panes.<key>.command` | yes if pane given | Executable name or absolute path. |
| `panes.<key>.args` | no | Array of string arguments. |
| `team.agents` | no | List of agent names this repo's work primarily activates. Informational today; may auto-prime in future. |
| `team.skills` | no | List of skill names this repo prioritizes. Informational today. |

### Pane keys

- **dispatcher** — top pane (30% height, full width). Default: shell. Recommended override: `claude --resume <key>` for persistent named conversation.
- **claude** — bottom-row worker pane. Default: shell. Override for model selection.
- **codex** — bottom-row worker pane. Default: shell.
- **gemini** — bottom-row worker pane. Default: auto-launches `gemini --yolo` (set in template).
- **opencode** — bottom-row worker pane. Default: auto-launches `opencode` (set in template).

## Example: FrankX profile

```json
{
  "version": 1,
  "name": "FrankX flagship",
  "panes": {
    "dispatcher": { "command": "claude", "args": ["--resume", "frankx"] },
    "claude":     { "command": "claude", "args": ["--model", "claude-opus-4-7"] },
    "codex":      { "command": "codex" },
    "gemini":     { "command": "gemini", "args": ["--yolo", "-m", "gemini-2.5-pro"] },
    "opencode":   { "command": "opencode" }
  },
  "team": {
    "agents": ["FrankX Content Creator", "content-polisher", "social-content-generator"],
    "skills": ["frankx-ai-blog", "brand-voice", "content-strategy"]
  }
}
```

## How the generator uses profiles

```
generate-layouts.ps1
  for each project in -Only or -All:
    1. Resolve canonical path (audit JSON or special-case alias)
    2. Look for <path>/cockpit-profile.json
    3. If present: build per-pane launch blocks from profile.panes
    4. If absent:  use template-default launch blocks
    5. Substitute into template, write <key>.kdl
```

Launch block format (Zellij KDL):
```kdl
pane name="Claude" cwd="<path>" {
    command "claude"
    args "--model" "claude-opus-4-7"
}
```

Or, if no command specified, just:
```kdl
pane name="Claude" cwd="<path>"
```

## Adding a profile to an existing repo

```powershell
# 1. Drop cockpit-profile.json at <repo-root>
# 2. Regenerate that repo's layout:
pwsh cockpit-zellij/scripts/generate-layouts.ps1 -Only <key>

# 3. Open it:
arc <key>
```

## Built on SIP — operational tier · cockpit profile system v1
