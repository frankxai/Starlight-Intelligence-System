#!/bin/sh
# Vercel ignoreCommand for the /site project (prj_wDNGrb1R1rB5PJOG9cUEICSER887).
# Exit 0 = skip the build, exit 1 = build. POSIX sh, no network calls.
#
# Policy (cost control; Build CPU is metered):
#   1. Production builds only from main.
#   2. Bot and agent preview branches are always skipped:
#      dependabot/*, agent/*, claude/*, codex/*, ccr-*, and anything containing "jules".
#   3. Every other preview is skipped too, except branches named cto/* or preview/*.
#      Vercel exposes VERCEL_GIT_PULL_REQUEST_ID but not whether the PR is a draft,
#      so we don't try to detect drafts. Instead, to get a preview, push to a
#      cto/* or preview/* branch, or redeploy by hand from the Vercel dashboard.

ENV="${VERCEL_ENV:-}"
REF="${VERCEL_GIT_COMMIT_REF:-}"

if [ "$ENV" = "production" ]; then
  if [ "$REF" = "main" ]; then
    echo "[should-deploy] production on main - build"
    exit 1
  fi
  echo "[should-deploy] production env on non-main ref '$REF' - skip"
  exit 0
fi

case "$REF" in
  dependabot/*|agent/*|claude/*|codex/*|ccr-*|*jules*)
    echo "[should-deploy] bot/agent preview '$REF' - skip"
    exit 0 ;;
  cto/*|preview/*)
    echo "[should-deploy] opted-in preview '$REF' - build"
    exit 1 ;;
esac

echo "[should-deploy] preview '$REF' not opted in (use cto/* or preview/*) - skip"
exit 0
