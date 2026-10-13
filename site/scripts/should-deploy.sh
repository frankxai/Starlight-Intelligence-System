#!/bin/sh
# Vercel ignoreCommand for the /site project.
# Exit 0 = skip the build, exit 1 = build. POSIX sh, no network calls.
#
# Policy (cost control; Build CPU is metered):
#   1. Production:
#      - builds on main;
#      - builds when VERCEL_GIT_COMMIT_REF is empty (CLI `vercel deploy --prod`,
#        the documented emergency path in .github/workflows/vercel-deploy.yml);
#      - skips any other Git branch.
#   2. Bot and agent preview branches are always skipped:
#      dependabot/*, agent/*, claude/*, codex/*, ccr-*, and anything containing "jules".
#   3. Canonical project only (VERCEL_PROJECT_ID = CANONICAL_PROJECT_ID below):
#      every other preview is skipped too, except branches named cto/* or preview/*.
#      Vercel doesn't expose whether a PR is a draft, so previews are opt-in by
#      branch name. Projects created through "Deploy with Vercel" have a different
#      project ID, so they keep normal Git previews for every non-bot branch.
#
# To build a skipped preview, push to cto/* or preview/*, or redeploy it from the
# Vercel dashboard and UNCHECK "Use project's Ignore Build Step" in the redeploy
# dialog. A plain redeploy runs this script again and is skipped again.

CANONICAL_PROJECT_ID="prj_wDNGrb1R1rB5PJOG9cUEICSER887"
ENV="${VERCEL_ENV:-}"
REF="${VERCEL_GIT_COMMIT_REF:-}"

if [ "$ENV" = "production" ]; then
  if [ "$REF" = "main" ]; then
    echo "[should-deploy] production on main - build"
    exit 1
  fi
  if [ -z "$REF" ]; then
    echo "[should-deploy] production with no Git ref (CLI deploy) - build"
    exit 1
  fi
  echo "[should-deploy] production env on non-main ref '$REF' - skip"
  exit 0
fi

case "$REF" in
  dependabot/*|agent/*|claude/*|codex/*|ccr-*|*jules*)
    echo "[should-deploy] bot/agent preview '$REF' - skip"
    exit 0 ;;
esac

if [ "${VERCEL_PROJECT_ID:-}" != "$CANONICAL_PROJECT_ID" ]; then
  echo "[should-deploy] non-canonical project - preview build"
  exit 1
fi

case "$REF" in
  cto/*|preview/*)
    echo "[should-deploy] opted-in preview '$REF' - build"
    exit 1 ;;
esac

echo "[should-deploy] preview '$REF' not opted in (use cto/* or preview/*) - skip"
exit 0
