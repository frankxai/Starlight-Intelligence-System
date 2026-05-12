# Visual Cockpit Options — Research + Recommendations

> 2026-05-12 · Honest comparison of terminal aesthetics + IDE composition
> for Frank's operator workflow. Triggered by "the whole thing is still not
> very visual right very terminal."

## The actual question, decomposed

You asked three different things:

1. **Make the terminal cockpit prettier** (liquid glass / blur / premium aesthetic)
2. **Connect IDEs (Cursor / Antigravity) to each cockpit pane**
3. **Research better approaches overall**

These map to three different layers — answering each separately.

---

## Layer 1: Terminal aesthetic — where "glass" lives

`Zellij` is a TUI. It cannot draw transparency, blur, or glass effects. The **terminal emulator** that hosts Zellij does. So the visual upgrade happens in the emulator, not the multiplexer.

### Windows Terminal + acrylic (SHIPPED today)

```
useAcrylic:    true            ← native Windows blur (acrylic material)
opacity:       88              ← 88% opaque, 12% see-through
colorScheme:   Arcanea         ← matches Zellij theme
cursorShape:   filledBox       ← premium block cursor
font:          Cascadia Code 11pt
padding:       12, 12, 12, 12  ← breathing room
```

Result: real glassmorphism. The desktop wallpaper subtly bleeds through. Pane borders feel etched. The whole cockpit reads like a workstation, not a console.

**Install**: `pwsh scripts/install-glass-cockpit.ps1` (already run today, backup written).
**Revert**: copy the `.bak-*` file back over `settings.json`.

### Warp — different beauty, different trade

Warp's "block-based output" is its premium aesthetic. Each command + result is a card. Beautiful, but:
- **Not a multiplexer** — doesn't compose with Zellij's pane layouts
- **Cloud-first by default** — at odds with your sovereign-substrate posture
- **AI suggestions** can interfere with your multi-CLI orchestration

Use Warp for *single-pane interactive work* (one-off ops, learning new commands). Keep Windows Terminal + Zellij for the 5-pane cockpit. Both can coexist.

### WezTerm — declarative + GPU but no Windows blur

WezTerm is excellent but its Windows port doesn't do acrylic blur (only opacity, which looks flat). It would replace Windows Terminal as the host. Skip unless you specifically want Lua config + GPU rendering — Windows Terminal already gives you both blur AND speed.

### Ghostty — watch list

Mitchell Hashimoto's terminal. Fastest, gorgeous, Windows port still maturing late 2026. Re-evaluate Q4 if Windows builds get production-ready.

### Verdict

**Stay on Windows Terminal acrylic + Zellij + pwsh.** That's the current setup, now prettier. Try Warp separately for one-off work.

---

## Layer 2: IDE composition — the right architecture

Putting an IDE *inside* a Zellij pane is a category error. Panes are terminal surfaces. IDEs are graphical applications with their own window management.

The **right architecture**: separate windows, shared substrate.

### Currently installed IDEs on your machine

```
cursor                 ✓ on PATH (verified yesterday)
antigravity-adapter    ✓ .antigravity/ adapter dir exists in SIS
warp                   ✓ C:\Program Files\Warp\bin\warp.cmd
windows-terminal       ✓ default host for pwsh + Zellij
```

### Connect each to the same MCP servers

Your Memory Bus (singleton stdio MCP at `private/memory-bus/server.py`) is reachable by ANY MCP client. Currently configured for:
- Claude Code (`~/.claude/settings.json`)
- Gemini CLI (`~/.gemini/settings.json`)
- Codex (`~/.codex/config.toml`)

To add Cursor:

```json
// ~/.cursor/mcp.json (create if absent)
{
  "mcpServers": {
    "starlight-substrate": {
      "command": "node",
      "args": ["C:\\Users\\frank\\Starlight-Intelligence-System\\dist\\starlight-mcp.js"]
    },
    "memory-bus": {
      "command": "C:\\Python313\\python.exe",
      "args": ["C:\\Users\\frank\\Starlight-Intelligence-System\\private\\memory-bus\\server.py"]
    }
  }
}
```

Same shape for VS Code (extension `Continue` or `Cline` or `Roo Cline`), Antigravity, JetBrains Junie.

### Workflow pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  Windows Terminal (glass) + Zellij cockpit  ← OPERATOR surface  │
│    arc sis: 5 CLI panes orchestrating agents                    │
│    Audit tab tails memory/_audit/<today>.jsonl                  │
└────────────────────────────────────┬────────────────────────────┘
                                     │ shared MCP substrate
                                     ↓
                ┌────────────────────┴────────────────────┐
                │                                          │
┌───────────────▼──────────────┐         ┌─────────────────▼───────┐
│  Cursor (or Antigravity)     │         │  Web Dashboard :3007    │
│  ← CODE EDITING surface      │         │  ← VISUAL surface       │
│  Connected to:               │         │  /fleet event strip     │
│   • starlight-substrate MCP  │         │  /brain 3D scene        │
│   • memory-bus MCP           │         │  /cockpit live HUD      │
│  Same context, different     │         │  Real-time SSE feeds    │
│  modality                    │         └─────────────────────────┘
└──────────────────────────────┘
```

Three surfaces, one substrate. Each surface is best at its modality:
- **Cockpit terminal**: fast operator commands, agent orchestration
- **IDE (Cursor / Antigravity)**: code edits with AI assistance
- **Web dashboard**: visual observability, real-time feeds, rich UI

---

## Layer 3: What other approaches could you take

Honest options ranked by leverage:

### A. Invest more in the dashboard (highest leverage)

The `/fleet` route already shows 73 audit ops/day, live cross-agent feed, machine widgets. Real visual investment goes here:
- 3D Three.js scenes (you have `/brain` already with r3f)
- Sparkline charts for daily ops volume per CLI
- Heatmap of which repos saw activity when
- Live commit graph
- Per-agent activity timeline

The terminal stays operator-fast; the web stays beautiful. Don't fight that split.

### B. Replace Zellij with a custom Electron cockpit (high cost, real reward)

If you really want a fully visual cockpit, build it in Electron / Tauri:
- Each pane is a real `<iframe>` or `xterm.js` instance
- Drag-and-drop pane rearrangement
- Click-to-spawn-new-CLI
- Inline charts/visualizations between panes
- Full glassmorphism via CSS

This is a 2-4 week project. Tauri (Rust-based) would compose well with your existing stack. **Park this** — not worth doing until the substrate hits a stability ceiling.

### C. Add tmux-like session sharing with multiple devices (medium)

Run `zellij` on a server (e.g., Tailscale-meshed Linux box) and attach from multiple devices. Then your phone PWA can attach to a running cockpit session. Composes with your Voice Operator vision. Park until cross-device cockpit is a real need.

### D. Visual layer in the terminal itself (low leverage, fun)

Tools like `glow` (markdown TUI), `frogmouth` (rich TUI), `gum` (interactive TUI prompts), `lf` (file manager TUI) can be added per-pane for richer terminal UIs. Won't get you to "liquid glass" but adds polish.

### Verdict

**Do A. Polish the dashboard.** It's the surface where rich visuals naturally compose. The terminal is fine — now glassmorphed via Windows Terminal acrylic. Don't try to make the terminal something it's not.

---

## What to test tonight

```powershell
# 1. Open a brand-new Windows Terminal tab — acrylic blur should be visible
#    on opening (the desktop wallpaper bleeds through)

# 2. Run:
arc sis    # cockpit through the glass

# 3. Open Cursor on the SIS folder — same MCP substrate
#    (after adding ~/.cursor/mcp.json per Layer 2 above)

# 4. Open the dashboard in a browser:
http://localhost:3007/fleet
```

Three windows, one substrate. The operator window has glass, the editor has IntelliSense, the dashboard has live charts. Each is best at its job.

---

## What I'd build next if you say go

1. **Cursor MCP config** — write `~/.cursor/mcp.json` pointing at starlight-substrate + memory-bus. (5 min, 1 file)
2. **`/fleet` chart enrichment** — add sparkline for daily ops volume, repo-cluster pie chart, agent-activity bar. (30 min, frontend-design)
3. **Glow / rich-cli for the Audit pane** — currently tails JSONL raw; could render with color + alignment via a small pwsh formatter. (15 min)
4. **Document this Visual-Cockpit-Options doc itself as the canonical "how to be pretty"** so the next agent session doesn't propose another multiplexer.

Pick one or say "all four" and I'll execute.

---

Built on SIP — operational-tier · visual-cockpit research + recommendations
