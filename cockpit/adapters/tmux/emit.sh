#!/usr/bin/env bash
# cockpit/adapters/tmux/emit.sh
#
# Reads a cockpit snapshot from $1 and rebuilds the tmux topology:
# new-session for each "window" in the snapshot, new-window for each tab,
# split-window for each pane after the first.
#
# Usage: emit.sh [snapshot-path] [--dry-run]
# If snapshot-path omitted, uses ~/.starlight/cockpit/last-snapshot.json

set -uo pipefail

cockpit_home="${COCKPIT_HOME:-$HOME/.starlight/cockpit}"
snapshot_path="${1:-$cockpit_home/last-snapshot.json}"
dry_run=0
[ "${2:-}" = "--dry-run" ] && dry_run=1

if [ ! -f "$snapshot_path" ]; then
    echo "ERROR: snapshot not found at $snapshot_path" >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "ERROR: tmux emit requires jq (https://stedolan.github.io/jq/)" >&2
    exit 1
fi

if ! command -v tmux >/dev/null 2>&1; then
    echo "ERROR: tmux not installed" >&2
    exit 1
fi

terminal=$(jq -r '.terminal' "$snapshot_path")
if [ "$terminal" != "tmux" ] && [ "$terminal" != "both" ]; then
    echo "WARN: snapshot terminal is '$terminal', not 'tmux'. Continuing anyway." >&2
fi

spawned=0
session_name="cockpit-$(date +%s)"

window_count=$(jq '.windows | length' "$snapshot_path")
[ "$window_count" -eq 0 ] && { echo "(no panes in snapshot)"; exit 0; }

# Iterate windows -> tabs -> panes
for win_idx in $(seq 0 $((window_count - 1))); do
    tab_count=$(jq ".windows[$win_idx].tabs | length" "$snapshot_path")
    for tab_idx in $(seq 0 $((tab_count - 1))); do
        pane_count=$(jq ".windows[$win_idx].tabs[$tab_idx].panes | length" "$snapshot_path")
        tab_title=$(jq -r ".windows[$win_idx].tabs[$tab_idx].title // \"tab-$tab_idx\"" "$snapshot_path")

        for pane_idx in $(seq 0 $((pane_count - 1))); do
            cwd=$(jq -r ".windows[$win_idx].tabs[$tab_idx].panes[$pane_idx].cwd // \"$HOME\"" "$snapshot_path")
            cmd=$(jq -r ".windows[$win_idx].tabs[$tab_idx].panes[$pane_idx].rehydrate_command // \"\"" "$snapshot_path")
            alive=$(jq -r ".windows[$win_idx].tabs[$tab_idx].panes[$pane_idx].alive" "$snapshot_path")

            [ "$alive" != "true" ] && continue

            send_command=""
            [ -n "$cmd" ] && [ "$cmd" != "null" ] && send_command="$cmd"

            if [ "$dry_run" -eq 1 ]; then
                printf 'DRY-RUN: tmux new-window/split for cwd=%s command=%s\n' "$cwd" "$send_command"
                spawned=$((spawned + 1))
                continue
            fi

            if [ "$spawned" -eq 0 ]; then
                # First pane: create the cockpit session
                tmux new-session -d -s "$session_name" -n "$tab_title" -c "$cwd"
                if [ -n "$send_command" ]; then
                    tmux send-keys -t "$session_name:0" "$send_command" C-m
                fi
            elif [ "$pane_idx" -eq 0 ]; then
                # New window for new tab
                tmux new-window -t "$session_name" -n "$tab_title" -c "$cwd"
                if [ -n "$send_command" ]; then
                    tmux send-keys -t "$session_name" "$send_command" C-m
                fi
            else
                # Split pane within window
                tmux split-window -t "$session_name" -c "$cwd"
                if [ -n "$send_command" ]; then
                    tmux send-keys -t "$session_name" "$send_command" C-m
                fi
            fi
            spawned=$((spawned + 1))
        done
    done
done

if [ "$dry_run" -eq 0 ]; then
    echo "Rehydrated $spawned panes into tmux session: $session_name"
    echo "Attach with: tmux attach -t $session_name"
else
    echo "DRY-RUN: would rehydrate $spawned panes into new session"
fi
