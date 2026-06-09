#!/usr/bin/env bash
# tools/lib/paths.sh — single source of truth for SIS path constants (bash).
#
# Usage (source from bash scripts in tools/):
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/paths.sh"
#   root="$(get_sis_root)"
#
# Resolution order: env var -> ancestor walk for SIP.md marker -> hardcoded fallback.
# Idempotent. Re-source = same result.

get_sis_root() {
    if [ -n "${SIS_ROOT:-}" ] && [ -d "$SIS_ROOT" ]; then
        echo "$SIS_ROOT"
        return
    fi

    local here
    here="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
    local current="$here"
    while [ -n "$current" ] && [ "$current" != "/" ]; do
        if [ -f "$current/SIP.md" ]; then
            echo "$current"
            return
        fi
        current="$(dirname "$current")"
    done

    echo "/c/Users/frank/Starlight-Intelligence-System"
}

get_arcanea_root() {
    if [ -n "${ARCANEA_ROOT:-}" ] && [ -d "$ARCANEA_ROOT" ]; then
        echo "$ARCANEA_ROOT"
        return
    fi

    local candidate="/c/Users/frank/Arcanea"
    if [ -d "$candidate" ]; then
        echo "$candidate"
        return
    fi

    echo ""
}

get_pp_cli() {
    if [ -n "${PP_CLI:-}" ] && [ -f "$PP_CLI" ]; then
        echo "$PP_CLI"
        return
    fi

    local arcanea
    arcanea="$(get_arcanea_root)"
    if [ -n "$arcanea" ]; then
        local dist="$arcanea/packages/peak-performance/dist/cli.js"
        if [ -f "$dist" ]; then
            echo "$dist"
            return
        fi
    fi

    echo ""
}
