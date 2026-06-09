#!/usr/bin/env bash
# tools/lib/run-ps.sh — bash wrapper for invoking PowerShell scripts cleanly.
#
# Why this exists:
#   The Bash tool on Windows defaults to git-bash. When you pass `-Command "...PS..."`,
#   bash performs its own variable expansion first, so `$d`, `$os`, `$_` are stripped
#   before powershell.exe ever sees them. Always use `-File` invocation instead.
#
# This wrapper enforces the convention: -NoProfile, -ExecutionPolicy Bypass, -File.
# Prefers pwsh (PowerShell 7+) if available, falls back to Windows PowerShell 5.
#
# Usage:
#   ./tools/lib/run-ps.sh path/to/script.ps1 [args...]
#
# Idempotent. Re-invocation = same result.

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "usage: run-ps.sh <script.ps1> [args...]" >&2
    exit 2
fi

SCRIPT="$1"
shift

if [ ! -f "$SCRIPT" ]; then
    echo "run-ps.sh: not found: $SCRIPT" >&2
    exit 2
fi

if command -v pwsh >/dev/null 2>&1; then
    exec pwsh -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" "$@"
else
    exec powershell -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT" "$@"
fi
