#!/usr/bin/env bash
# scripts/cron/posix/daily-revenue-snapshot.sh — daily revenue snapshot entry for Linux/Mac.
#
# POSIX equivalent of scripts/cron/daily-revenue-snapshot.ps1.
# Wire via crontab: 35 2 * * * /path/to/SIS/scripts/cron/posix/daily-revenue-snapshot.sh
# (5 min after daily-cost-snapshot at 02:30)
#
# Logs append to memory/_audit/finance/_cron.log

set -uo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SIS_ROOT="$(cd -- "$SCRIPT_DIR/../../.." &> /dev/null && pwd)"
cd "$SIS_ROOT" || exit 1

FIN_DIR="$SIS_ROOT/memory/_audit/finance"
mkdir -p "$FIN_DIR"

LOG_PATH="$FIN_DIR/_cron.log"
TS="$(date '+%Y-%m-%d %H:%M:%S')"

echo "[$TS] === daily-revenue-snapshot starting ===" >> "$LOG_PATH"

if output="$(npx tsx 'src/finance/revenue-snapshot.ts' 2>&1)"; then
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: 0 ===" >> "$LOG_PATH"
    exit 0
else
    EXIT_CODE=$?
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: $EXIT_CODE ===" >> "$LOG_PATH"
    exit "$EXIT_CODE"
fi
