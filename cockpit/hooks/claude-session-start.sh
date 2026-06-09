#!/usr/bin/env bash
# cockpit/hooks/claude-session-start.sh -- POSIX hook script for Linux/macOS
#
# Mirrors claude-session-start.ps1: appends a session-start row to sessions.jsonl.
#
# HARD CONTRACT (CONTRACTS.md section 7):
#   - MUST exit 0 within 5000ms regardless of internal failure
#   - MUST NOT block, prompt, or output to stdout
#   - All errors -> error log only

# Always exit 0
trap 'exit 0' ERR EXIT

cockpit_home="${COCKPIT_HOME:-$HOME/.starlight/cockpit}"
mkdir -p "$cockpit_home" 2>/dev/null

manifest="$cockpit_home/sessions.jsonl"
error_log="$cockpit_home/hook-errors.log"
event_log="$cockpit_home/events.log"

log_error() {
    local source="$1"
    local message="$2"
    local ts
    ts=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    printf '[%s] %s: %s\n' "$ts" "$source" "$message" >> "$error_log" 2>/dev/null || true
}

# Read JSON envelope from stdin
stdin_data=""
if [ ! -t 0 ]; then
    stdin_data=$(cat)
fi

# Parse session_id and cwd via jq if available, otherwise grep
session_id=""
cwd=""
if command -v jq >/dev/null 2>&1 && [ -n "$stdin_data" ]; then
    session_id=$(printf '%s' "$stdin_data" | jq -r '.session_id // empty' 2>/dev/null || true)
    cwd=$(printf '%s' "$stdin_data" | jq -r '.cwd // empty' 2>/dev/null || true)
elif [ -n "$stdin_data" ]; then
    session_id=$(printf '%s' "$stdin_data" | grep -oP '"session_id"\s*:\s*"\K[^"]+' 2>/dev/null || true)
    cwd=$(printf '%s' "$stdin_data" | grep -oP '"cwd"\s*:\s*"\K[^"]+' 2>/dev/null || true)
fi

# Fallbacks
[ -z "$session_id" ] && session_id="unknown-$$-$RANDOM"
[ -z "$cwd" ] && cwd=$(pwd)

# Determine PID -- claude is our parent (the hook runs as a child of claude)
hook_pid=$$
claude_pid=$(ps -p "$hook_pid" -o ppid= 2>/dev/null | tr -d ' ' || echo "$hook_pid")
[ -z "$claude_pid" ] && claude_pid=$hook_pid

# Build ppid_chain
chain="[$claude_pid"
current_pid=$claude_pid
for i in 1 2 3 4 5 6 7 8 9 10; do
    parent=$(ps -p "$current_pid" -o ppid= 2>/dev/null | tr -d ' ' || true)
    if [ -z "$parent" ] || [ "$parent" = "0" ] || [ "$parent" = "1" ]; then
        break
    fi
    chain="$chain,$parent"
    current_pid=$parent
done
chain="$chain]"

ts=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%S.000Z")
hostname_val=$(hostname 2>/dev/null || echo "unknown")
user_val=$(whoami 2>/dev/null || echo "unknown")
project_key=$(basename "$cwd" | tr '[:upper:]' '[:lower:]')

# JSON-escape cwd
cwd_escaped=$(printf '%s' "$cwd" | sed 's/\\/\\\\/g; s/"/\\"/g')

# Detect tmux pane
tmux_pane="${TMUX_PANE:-null}"
if [ "$tmux_pane" != "null" ]; then
    tmux_pane="\"$tmux_pane\""
fi

row=$(printf '{"schema":"cockpit.session/v1","ts":"%s","event":"start","agent":"claude","session_id":"%s","cwd":"%s","wt_session":null,"wt_window":null,"wt_pane":null,"tmux_pane":%s,"pid":%s,"parent_pid":%s,"ppid_chain":%s,"host":"%s","user":"%s","project_key":"%s","cockpit_version":"0.2.0"}' \
    "$ts" "$session_id" "$cwd_escaped" "$tmux_pane" "$claude_pid" "$claude_pid" "$chain" "$hostname_val" "$user_val" "$project_key")

# Atomic append
printf '%s\n' "$row" >> "$manifest" 2>/dev/null || log_error "claude-session-start" "manifest write failed"

# Structured event log
event_row=$(printf '{"ts":"%s","kind":"session.event","status":"ok","host":"%s","user":"%s","cockpit_version":"0.2.0","agent":"claude","event":"start","session_id":"%s","project_key":"%s"}' \
    "$ts" "$hostname_val" "$user_val" "$session_id" "$project_key")
printf '%s\n' "$event_row" >> "$event_log" 2>/dev/null || true

exit 0
