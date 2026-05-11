#!/usr/bin/env bash
# dashboard-cockpit-pack — POSIX installer (macOS / Linux)
#
# Lays down ~/.starlight/cockpit/, registers a launchd plist (macOS) or
# systemd --user unit (Linux), and optionally wires the `arc` shell alias.
#
# Permissions required (declared in manifest.json):
#   fs:read:HOME/.claude
#   fs:write:HOME/.starlight/cockpit
#   task-scheduler:register

set -euo pipefail

ENABLE_ALIAS=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --enable-alias) ENABLE_ALIAS=1 ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "unknown arg: $arg" >&2; exit 1 ;;
  esac
done

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COCKPIT_DIR="${HOME}/.starlight/cockpit"

if [[ $DRY_RUN -eq 1 ]]; then
  echo "[dry-run] would create $COCKPIT_DIR"
else
  mkdir -p "$COCKPIT_DIR"
  cp -R "$HERE/cockpit-layouts/." "$COCKPIT_DIR/"
  echo "[ok] cockpit layouts copied to $COCKPIT_DIR"
fi

uname_s="$(uname -s)"
case "$uname_s" in
  Darwin)
    PLIST="${HOME}/Library/LaunchAgents/dev.starlight.cockpit.plist"
    if [[ $DRY_RUN -eq 1 ]]; then
      echo "[dry-run] would write launchd plist $PLIST"
    else
      cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>dev.starlight.cockpit</string>
  <key>ProgramArguments</key><array><string>${HERE}/arc.sh</string><string>--default</string></array>
  <key>RunAtLoad</key><true/>
</dict></plist>
EOF
      launchctl unload "$PLIST" 2>/dev/null || true
      launchctl load "$PLIST"
      echo "[ok] launchd agent loaded: dev.starlight.cockpit"
    fi
    ;;
  Linux)
    UNIT="${HOME}/.config/systemd/user/starlight-cockpit.service"
    if [[ $DRY_RUN -eq 1 ]]; then
      echo "[dry-run] would write systemd unit $UNIT"
    else
      mkdir -p "$(dirname "$UNIT")"
      cat > "$UNIT" <<EOF
[Unit]
Description=Starlight Cockpit

[Service]
ExecStart=${HERE}/arc.sh --default
Restart=on-failure

[Install]
WantedBy=default.target
EOF
      systemctl --user daemon-reload
      systemctl --user enable --now starlight-cockpit.service
      echo "[ok] systemd --user unit enabled: starlight-cockpit.service"
    fi
    ;;
  *)
    echo "[warn] unknown OS '$uname_s' — skipping auto-start registration"
    ;;
esac

if [[ $ENABLE_ALIAS -eq 1 && $DRY_RUN -eq 0 ]]; then
  for rc in "${HOME}/.zshrc" "${HOME}/.bashrc"; do
    if [[ -f "$rc" ]] && ! grep -q "alias arc=" "$rc"; then
      echo "alias arc='${HERE}/arc.sh'" >> "$rc"
      echo "[ok] arc alias added to $rc"
    fi
  done
fi

echo ""
echo "dashboard-cockpit-pack installed. Restart your shell then run 'arc <project>'."
