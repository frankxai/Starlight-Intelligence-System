#!/usr/bin/env bash
# cockpit/hooks/claude-session-stop.sh -- POSIX hook script for Linux/macOS
# Mirrors claude-session-stop.ps1: appends a session-stop row to sessions.jsonl.

trap 'exit 0' ERR EXIT

cockpit_home="${COCKPIT_HOME:-$HOME/.starlight/cockpit}"
mkdir -p "$cockpit_home" 2>/dev/null

manifest="$cockpit_home/sessions.jsonl"
error_log="$cockpit_home/hook-errors.log"

stdin_data=""
if [ ! -t 0 ]; then
    stdin_data=$(cat)
fi

session_id=""
cwd=""
if command -v jq >/dev/null 2>&1 && [ -n "$stdin_data" ]; then
    session_id=$(printf '%s' "$stdin_data" | jq -r '.session_id // empty' 2>/dev/null || true)
    cwd=$(printf '%s' "$stdin_data" | jq -r '.cwd // empty' 2>/dev/null || true)
elif [ -n "$stdin_data" ]; then
    session_id=$(printf '%s' "$stdin_data" | grep -oP '"session_id"\s*:\s*"\K[^"]+' 2>/dev/null || true)
    cwd=$(printf '%s' "$stdin_data" | grep -oP '"cwd"\s*:\s*"\K[^"]+' 2>/dev/null || true)
fi

[ -z "$session_id" ] && session_id="unknown-$$-$RANDOM"
[ -z "$cwd" ] && cwd=$(pwd)

hook_pid=$$
claude_pid=$(ps -p "$hook_pid" -o ppid= 2>/dev/null | tr -d ' ' || echo "$hook_pid")
[ -z "$claude_pid" ] && claude_pid=$hook_pid

ts=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%S.000Z")
hostname_val=$(hostname 2>/dev/null || echo "unknown")
user_val=$(whoami 2>/dev/null || echo "unknown")
project_key=$(basename "$cwd" | tr '[:upper:]' '[:lower:]')
cwd_escaped=$(printf '%s' "$cwd" | sed 's/\\/\\\\/g; s/"/\\"/g')

tmux_pane="${TMUX_PANE:-null}"
[ "$tmux_pane" != "null" ] && tmux_pane="\"$tmux_pane\""

row=$(printf '{"schema":"cockpit.session/v1","ts":"%s","event":"stop","agent":"claude","session_id":"%s","cwd":"%s","wt_session":null,"wt_window":null,"wt_pane":null,"tmux_pane":%s,"pid":%s,"parent_pid":%s,"ppid_chain":[%s],"host":"%s","user":"%s","project_key":"%s","cockpit_version":"0.2.0"}' \
    "$ts" "$session_id" "$cwd_escaped" "$tmux_pane" "$claude_pid" "$claude_pid" "$claude_pid" "$hostname_val" "$user_val" "$project_key")

printf '%s\n' "$row" >> "$manifest" 2>/dev/null || true

exit 0
