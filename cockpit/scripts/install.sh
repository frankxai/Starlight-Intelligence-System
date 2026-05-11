#!/usr/bin/env bash
# cockpit/scripts/install.sh -- POSIX installer for Linux/macOS
#
# Mirrors install.ps1 for non-Windows platforms.
# Idempotent: safe to re-run.

set -euo pipefail

cockpit_root="$(cd "$(dirname "$0")/.." && pwd)"
cockpit_home="${COCKPIT_HOME:-$HOME/.starlight/cockpit}"
mkdir -p "$cockpit_home"
mkdir -p "$cockpit_home/workspaces"
mkdir -p "$cockpit_home/snapshots"

echo "=== Cockpit Continuity install (POSIX) ==="
echo "  cockpit_root: $cockpit_root"
echo "  cockpit_home: $cockpit_home"
echo ""

# 1. Default config
config_path="$cockpit_home/config.json"
if [ ! -f "$config_path" ]; then
    cp "$cockpit_root/config/default.json" "$config_path"
    echo "[OK] default config -> $config_path"
else
    echo "[OK] config exists"
fi

# 2. Hook scripts -> chmod +x
chmod +x "$cockpit_root/hooks/claude-session-start.sh" 2>/dev/null || true
chmod +x "$cockpit_root/hooks/claude-session-stop.sh" 2>/dev/null || true
chmod +x "$cockpit_root/adapters/tmux/capture.sh" 2>/dev/null || true
chmod +x "$cockpit_root/adapters/tmux/emit.sh" 2>/dev/null || true
chmod +x "$cockpit_root/scripts/install.sh" 2>/dev/null || true
echo "[OK] hook scripts marked executable"

# 3. Claude Code hooks in ~/.claude/settings.json
settings_path="$HOME/.claude/settings.json"
if [ ! -f "$settings_path" ]; then
    echo "[SKIP] $settings_path not found -- run Claude Code first to create it"
else
    if ! command -v jq >/dev/null 2>&1; then
        echo "[WARN] jq not found -- skipping settings.json patch"
        echo "       Install jq, or manually add to settings.json hooks.SessionStart:"
        echo "         { \"type\": \"command\", \"command\": \"$cockpit_root/hooks/claude-session-start.sh\", \"timeout\": 5000 }"
    else
        start_cmd="$cockpit_root/hooks/claude-session-start.sh"
        stop_cmd="$cockpit_root/hooks/claude-session-stop.sh"

        # Backup
        cp "$settings_path" "$settings_path.bak-$(date +%s)"

        # Add SessionStart hook if not present
        if ! jq -e ".hooks.SessionStart // [] | flatten | map(.command? // \"\") | any(. == \"$start_cmd\")" "$settings_path" > /dev/null 2>&1; then
            jq --arg cmd "$start_cmd" '
                .hooks //= {} |
                .hooks.SessionStart //= [] |
                .hooks.SessionStart += [{
                    hooks: [{ type: "command", command: $cmd, timeout: 5000 }]
                }]
            ' "$settings_path" > "$settings_path.tmp" && mv "$settings_path.tmp" "$settings_path"
            echo "[OK] added SessionStart hook"
        else
            echo "[OK] SessionStart hook already present"
        fi

        # Add Stop hook if not present
        if ! jq -e ".hooks.Stop // [] | flatten | map(.command? // \"\") | any(. == \"$stop_cmd\")" "$settings_path" > /dev/null 2>&1; then
            jq --arg cmd "$stop_cmd" '
                .hooks //= {} |
                .hooks.Stop //= [] |
                .hooks.Stop += [{
                    hooks: [{ type: "command", command: $cmd, timeout: 5000 }]
                }]
            ' "$settings_path" > "$settings_path.tmp" && mv "$settings_path.tmp" "$settings_path"
            echo "[OK] added Stop hook"
        else
            echo "[OK] Stop hook already present"
        fi
    fi
fi

# 4. Shell profile patch
shell_name="${SHELL##*/}"
profile_path=""
case "$shell_name" in
    bash) profile_path="$HOME/.bashrc" ;;
    zsh)  profile_path="$HOME/.zshrc" ;;
    *)    profile_path="$HOME/.profile" ;;
esac

aliases_block_marker="# Cockpit Continuity"
if [ -f "$profile_path" ] && grep -q "$aliases_block_marker" "$profile_path"; then
    echo "[OK] $profile_path already has cockpit block"
else
    {
        echo ""
        echo "$aliases_block_marker"
        echo "alias arc-status='cat $cockpit_home/sessions.jsonl | jq .'"
        echo "alias arc-snapshot='bash $cockpit_root/adapters/tmux/capture.sh > $cockpit_home/last-snapshot.json && echo Snapshot written'"
        echo "alias arc-rehydrate='bash $cockpit_root/adapters/tmux/emit.sh'"
        echo "alias arc-events='tail -f $cockpit_home/events.log'"
        echo "export COCKPIT_HOME=\"$cockpit_home\""
    } >> "$profile_path"
    echo "[OK] patched $profile_path"
    echo "    -> source it or open a new shell"
fi

# 5. Optional: install MCP server
if command -v node >/dev/null 2>&1 && [ -d "$cockpit_root/mcp" ]; then
    echo ""
    echo "Installing MCP server dependencies..."
    (cd "$cockpit_root/mcp" && npm install --silent 2>&1 | tail -5) || echo "[WARN] npm install failed -- run manually if you need MCP"
fi

echo ""
echo "=== install complete ==="
echo "Try:"
echo "  bash $cockpit_root/test/smoke.sh    # verify"
echo "  bash $cockpit_root/adapters/tmux/capture.sh > $cockpit_home/last-snapshot.json"
echo "  bash $cockpit_root/adapters/tmux/emit.sh --dry-run"
