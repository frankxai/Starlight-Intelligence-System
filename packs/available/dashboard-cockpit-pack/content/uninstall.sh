#!/usr/bin/env bash
set -euo pipefail

PURGE=0
for arg in "$@"; do
  [[ "$arg" == "--purge" ]] && PURGE=1
done

case "$(uname -s)" in
  Darwin)
    PLIST="${HOME}/Library/LaunchAgents/dev.starlight.cockpit.plist"
    if [[ -f "$PLIST" ]]; then
      launchctl unload "$PLIST" 2>/dev/null || true
      rm "$PLIST"
      echo "[ok] launchd agent removed"
    fi
    ;;
  Linux)
    if systemctl --user is-enabled starlight-cockpit.service >/dev/null 2>&1; then
      systemctl --user disable --now starlight-cockpit.service
    fi
    rm -f "${HOME}/.config/systemd/user/starlight-cockpit.service"
    ;;
esac

if [[ $PURGE -eq 1 ]]; then
  rm -rf "${HOME}/.starlight/cockpit"
  echo "[ok] removed ${HOME}/.starlight/cockpit"
fi

echo "dashboard-cockpit-pack uninstalled."
