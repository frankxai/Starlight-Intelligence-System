#!/usr/bin/env bash
# scripts/cron/posix/daily-cost-snapshot.sh — daily cost snapshot entry for Linux/Mac.
#
# POSIX equivalent of scripts/cron/daily-cost-snapshot.ps1.
# Wire via crontab: 30 2 * * * /path/to/SIS/scripts/cron/posix/daily-cost-snapshot.sh
#
# Logs append to memory/_audit/cost/_cron.log

set -uo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SIS_ROOT="$(cd -- "$SCRIPT_DIR/../../.." &> /dev/null && pwd)"
cd "$SIS_ROOT" || exit 1

COST_DIR="$SIS_ROOT/memory/_audit/cost"
mkdir -p "$COST_DIR"

LOG_PATH="$COST_DIR/_cron.log"
TS="$(date '+%Y-%m-%d %H:%M:%S')"

echo "[$TS] === daily-cost-snapshot starting ===" >> "$LOG_PATH"

if output="$(npx tsx 'src/infra/cost-snapshot.ts' 2>&1)"; then
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: 0 ===" >> "$LOG_PATH"
    exit 0
else
    EXIT_CODE=$?
    echo "$output" >> "$LOG_PATH"
    echo "[$TS] === exit code: $EXIT_CODE ===" >> "$LOG_PATH"
    exit "$EXIT_CODE"
fi
