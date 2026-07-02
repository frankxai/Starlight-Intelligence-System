#!/usr/bin/env bash
# scripts/cron/posix/dreaming.sh — nightly dreaming consolidation entry for Linux/Mac.
#
# POSIX equivalent of scripts/dreaming-cron.ps1 (Windows scheduled task wrapper).
# Wire via crontab: 0 4 * * * /path/to/SIS/scripts/cron/posix/dreaming.sh
#
# Runs the dreaming pass — insight extraction, cross-vault Wisdom promotion,
# contradiction detection, decay sweep — and persists the result to the vault
# store. Logs append to memory/_audit/dreaming/_cron.log

set -uo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SIS_ROOT="$(cd -- "$SCRIPT_DIR/../../.." &> /dev/null && pwd)"
cd "$SIS_ROOT" || exit 1

DREAM_DIR="$SIS_ROOT/memory/_audit/dreaming"
mkdir -p "$DREAM_DIR"

LOG_PATH="$DREAM_DIR/_cron.log"
TS="$(date '+%Y-%m-%d %H:%M:%S')"

echo "[$TS] === dreaming starting ===" >> "$LOG_PATH"

if output="$(node --import tsx scripts/dreaming-run.ts 2>&1)"; then
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: 0 ===" >> "$LOG_PATH"
    exit 0
else
    EXIT_CODE=$?
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: $EXIT_CODE ===" >> "$LOG_PATH"
    exit "$EXIT_CODE"
fi
