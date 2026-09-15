#!/usr/bin/env bash
# Starlight Operator launcher (C940)
# Starts Console (:3001) + optional Voice status server (:8765) and opens Operator.

set -euo pipefail

SIS_ROOT="${STARLIGHT_SIS_ROOT:-$HOME/Starlight-Intelligence-System}"
VOICE_ROOT="${STARLIGHT_VOICE_ROOT:-$HOME/starlight-voice}"
CONSOLE_URL="${STARLIGHT_OPERATOR_URL:-http://127.0.0.1:3001/operator}"
VOICE_URL="http://127.0.0.1:8765/status"

echo "[starlight-operator] SIS_ROOT=$SIS_ROOT"

is_up() {
  local url="$1"
  curl -sf -o /dev/null --max-time 2 "$url" 2>/dev/null
}

start_console() {
  if is_up "http://127.0.0.1:3001/"; then
    echo "[starlight-operator] console already up on :3001"
    return 0
  fi
  if [[ ! -d "$SIS_ROOT/console" ]]; then
    echo "[starlight-operator] missing $SIS_ROOT/console" >&2
    return 1
  fi
  echo "[starlight-operator] starting console pnpm dev on :3001"
  (
    cd "$SIS_ROOT/console"
    # Windows-friendly background
    if command -v pnpm >/dev/null 2>&1; then
      pnpm dev >/tmp/starlight-console.log 2>&1 &
    else
      npm run dev >/tmp/starlight-console.log 2>&1 &
    fi
    echo $! >/tmp/starlight-console.pid
  )
  for i in $(seq 1 30); do
    if is_up "http://127.0.0.1:3001/"; then
      echo "[starlight-operator] console ready"
      return 0
    fi
    sleep 1
  done
  echo "[starlight-operator] console did not become ready; see /tmp/starlight-console.log" >&2
  return 1
}

start_voice() {
  if is_up "$VOICE_URL"; then
    echo "[starlight-operator] voice status already up on :8765"
    return 0
  fi
  if [[ ! -f "$VOICE_ROOT/dashboard/server.py" ]]; then
    echo "[starlight-operator] voice repo not found — Operator will show voice down (ok)"
    return 0
  fi
  echo "[starlight-operator] starting voice dashboard on :8765"
  (
    cd "$VOICE_ROOT"
    PYTHONPATH=sidecar/src python dashboard/server.py >/tmp/starlight-voice.log 2>&1 &
    echo $! >/tmp/starlight-voice.pid
  )
  sleep 1
}

open_browser() {
  local url="$1"
  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Start-Process '$url'" >/dev/null 2>&1 || true
  elif command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe //c start "" "$url" >/dev/null 2>&1 || true
  else
    echo "[starlight-operator] open: $url"
  fi
}

start_console
start_voice
open_browser "$CONSOLE_URL"
echo "[starlight-operator] Operator → $CONSOLE_URL"
