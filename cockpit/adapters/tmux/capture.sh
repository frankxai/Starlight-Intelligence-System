#!/usr/bin/env bash
# cockpit/adapters/tmux/capture.sh
#
# Walks tmux's pane state via `tmux list-panes -a` and correlates each pane
# to a cockpit manifest row by pane PID.
#
# Output: a cockpit.snapshot/v1 JSON document on stdout.

set -uo pipefail

cockpit_home="${COCKPIT_HOME:-$HOME/.starlight/cockpit}"
manifest="$cockpit_home/sessions.jsonl"

if ! command -v tmux >/dev/null 2>&1; then
    printf '{"schema":"cockpit.snapshot/v1","snapshot_at":"%s","host":"%s","user":"%s","terminal":"tmux","windows":[],"error":"tmux not installed"}\n' \
        "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" "$(hostname)" "$(whoami)"
    exit 0
fi

# tmux not running?
if ! tmux list-sessions >/dev/null 2>&1; then
    printf '{"schema":"cockpit.snapshot/v1","snapshot_at":"%s","host":"%s","user":"%s","terminal":"tmux","windows":[]}\n' \
        "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" "$(hostname)" "$(whoami)"
    exit 0
fi

# Build PID -> session_id map from manifest (alive sessions only)
# We use a temp file because bash 3 (macOS default) lacks associative arrays
pid_map=$(mktemp 2>/dev/null || mktemp -t cockpit-pidmap)
trap 'rm -f "$pid_map"' EXIT

if [ -f "$manifest" ]; then
    if command -v jq >/dev/null 2>&1; then
        # Use jq for clean parsing
        # Latest event per session_id; only event=start with alive PID
        jq -s '
            group_by(.session_id) |
            map(sort_by(.ts) | last) |
            map(select(.event == "start" or .event == "heartbeat")) |
            .[] | "\(.pid)|\(.agent)|\(.session_id)|\(.cwd)|\(.project_key)"
        ' "$manifest" 2>/dev/null | tr -d '"' | while IFS='|' read -r pid agent sid cwd pkey; do
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                printf '%s\t%s\t%s\t%s\t%s\n' "$pid" "$agent" "$sid" "$cwd" "$pkey" >> "$pid_map"
            fi
        done
    fi
fi

# Get all tmux panes with their PIDs and metadata
# Format: session-id|window-id|window-index|pane-id|pane-index|pane-pid|pane-current-path|pane-current-command
tmux_panes=$(tmux list-panes -a -F '#{session_id}|#{window_id}|#{window_index}|#{pane_id}|#{pane_index}|#{pane_pid}|#{pane_current_path}|#{pane_current_command}' 2>/dev/null)

# Build snapshot JSON
ts=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
hostname_val=$(hostname)
user_val=$(whoami)

# Collect windows (group panes by session+window)
declare -a window_records=()
prev_window=""
panes_for_window=""

# We accumulate per-window pane JSON, then join into windows array.
# Bash 3 compat: write to temp file.
windows_tmp=$(mktemp 2>/dev/null || mktemp -t cockpit-windows)
trap 'rm -f "$pid_map" "$windows_tmp"' EXIT

current_window_key=""
current_panes_json=""

emit_window() {
    local key="$1"
    local panes="$2"
    [ -z "$panes" ] && return
    # key is session_id|window_id|window_index
    local win_idx
    win_idx=$(printf '%s' "$key" | awk -F'|' '{print $3}')
    local win_id
    win_id=$(printf '%s' "$key" | awk -F'|' '{print $2}')
    printf '{"guid":"%s","title":"tmux-window-%s","tabs":[{"index":%s,"title":"window-%s","active":false,"panes":[%s]}]}\n' \
        "$win_id" "$win_idx" "$win_idx" "$win_idx" "$panes" >> "$windows_tmp"
}

# Sort panes by session+window for grouping
sorted_panes=$(printf '%s\n' "$tmux_panes" | sort -t'|' -k1,1 -k3,3n -k5,5n)

while IFS='|' read -r sess wid widx pid pidx ppid cwd cmd; do
    [ -z "$sess" ] && continue
    win_key="$sess|$wid|$widx"

    # Look up agent in pid_map by pane PID OR descendant
    agent="null"
    sid="null"
    rehydrate_cmd="null"
    if [ -f "$pid_map" ]; then
        match=$(awk -F'\t' -v target="$ppid" '$1 == target { print; exit }' "$pid_map")
        if [ -z "$match" ]; then
            # Try to find descendants of $ppid that match
            for descendant in $(pgrep -P "$ppid" 2>/dev/null); do
                match=$(awk -F'\t' -v target="$descendant" '$1 == target { print; exit }' "$pid_map")
                [ -n "$match" ] && break
            done
        fi
        if [ -n "$match" ]; then
            agent=$(printf '%s' "$match" | cut -f2)
            sid=$(printf '%s' "$match" | cut -f3)
            agent="\"$agent\""
            sid="\"$sid\""
            rehydrate_cmd="\"claude --resume $(printf '%s' "$match" | cut -f3)\""
        fi
    fi

    cwd_esc=$(printf '%s' "$cwd" | sed 's/\\/\\\\/g; s/"/\\"/g')

    pane_json=$(printf '{"guid":"%s","cwd":"%s","agent":%s,"session_id":%s,"rehydrate_command":%s,"shell":"%s","alive":true}' \
        "$pid" "$cwd_esc" "$agent" "$sid" "$rehydrate_cmd" "$cmd")

    if [ "$win_key" != "$current_window_key" ]; then
        emit_window "$current_window_key" "$current_panes_json"
        current_window_key="$win_key"
        current_panes_json="$pane_json"
    else
        current_panes_json="$current_panes_json,$pane_json"
    fi
done <<< "$sorted_panes"
emit_window "$current_window_key" "$current_panes_json"

# Join windows
windows_json=$(paste -sd',' "$windows_tmp" 2>/dev/null || tr '\n' ',' < "$windows_tmp" | sed 's/,$//')

printf '{"schema":"cockpit.snapshot/v1","snapshot_at":"%s","host":"%s","user":"%s","terminal":"tmux","windows":[%s]}\n' \
    "$ts" "$hostname_val" "$user_val" "$windows_json"
