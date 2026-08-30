#!/usr/bin/env bash
# Vercel ignoreCommand for the /site project.
# Exit 0 skips; exit 1 builds. Uncertain states always build.

set +e

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "[should-deploy] production — build"
  exit 1
fi

if printf '%s' "${VERCEL_GIT_COMMIT_MESSAGE:-}" | grep -Fq "[agent-wip]"; then
  echo "[should-deploy] explicit agent WIP checkpoint — skip"
  exit 0
fi

if git log -1 --format=%B HEAD^ 2>/dev/null | grep -Fq "[agent-wip]"; then
  echo "[should-deploy] coherent checkpoint follows agent WIP — build"
  exit 1
fi

if [ -n "${VERCEL_GIT_PULL_REQUEST_ID:-}" ] &&
   [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] &&
   [ -n "${VERCEL_GIT_REPO_SLUG:-}" ]; then
  PR_JSON=$(curl -sf --max-time 5     "https://api.github.com/repos/${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}/pulls/${VERCEL_GIT_PULL_REQUEST_ID}" 2>/dev/null)
  if [ -n "$PR_JSON" ] &&
     printf '%s' "$PR_JSON" | grep -q '"draft"[[:space:]]*:[[:space:]]*true'; then
    echo "[should-deploy] draft PR #${VERCEL_GIT_PULL_REQUEST_ID} — skip"
    exit 0
  fi
fi

CURRENT_SHA="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null)}"
PREVIOUS_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [ -n "$PREVIOUS_SHA" ] && [ "$CURRENT_SHA" = "$PREVIOUS_SHA" ]; then
  echo "[should-deploy] explicit redeploy of same SHA — build"
  exit 1
fi

if [ -n "$PREVIOUS_SHA" ] && git cat-file -e "$PREVIOUS_SHA" 2>/dev/null; then
  BASE_SHA="$PREVIOUS_SHA"
elif git rev-parse HEAD^ >/dev/null 2>&1; then
  BASE_SHA="HEAD^"
else
  echo "[should-deploy] no safe diff base — build"
  exit 1
fi

git diff --quiet "$BASE_SHA" HEAD -- .
RC=$?
case "$RC" in
  0) echo "[should-deploy] no /site changes — skip"; exit 0 ;;
  1) echo "[should-deploy] /site changes — build"; exit 1 ;;
  *) echo "[should-deploy] diff error — build"; exit 1 ;;
esac
