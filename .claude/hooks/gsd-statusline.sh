#!/bin/bash
# gsd-statusline.sh
# Shim for ACOS gsd-statusline.js (ported) - statusline event
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true
log_hook_activation "gsd-statusline" "Status" 2>/dev/null || true
if [ -f "$SCRIPT_DIR/gsd-statusline.cjs" ]; then cat | node "$SCRIPT_DIR/gsd-statusline.cjs"; else echo "GSD:${PROJECT_NAME:-?}"; fi
