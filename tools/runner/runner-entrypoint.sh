#!/usr/bin/env bash
# ==============================================================================
# Starlight Scale-to-Zero Runner Entrypoint
# Executes CI/CD validation, SAGE proving ground, and autonomous agent tasks.
# Built on SIP v1.1.1 — Sovereign Substrate
# ==============================================================================

set -eo pipefail

echo "=========================================================="
echo " Starlight Sovereign Runner — Initializing Scale-to-Zero Task"
echo " Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " Host: $(hostname)"
echo " Memory: $(grep MemTotal /proc/meminfo | awk '{print $2}') kB"
echo " CPU: $(nproc) vCPUs"
echo "=========================================================="

REPO="${STARLIGHT_REPO:-${REPO:-$1}}"
REF="${STARLIGHT_REF:-${GIT_REF:-${2:-main}}}"
COMMAND="${STARLIGHT_COMMAND:-${3:-npm test}}"
CALLBACK_URL="${STARLIGHT_CALLBACK_URL:-${CALLBACK_URL:-$4}}"
PR_NUMBER="${STARLIGHT_PR_NUMBER:-${PR_NUMBER:-}}"

# Isolate runner credentials from exported child environments before untrusted repo steps run.
LOCAL_GITHUB_TOKEN="${GITHUB_TOKEN:-}"
LOCAL_CALLBACK_SECRET="${STARLIGHT_RUNNER_SECRET:-${RUNNER_CALLBACK_SECRET:-}}"
unset GITHUB_TOKEN STARLIGHT_RUNNER_SECRET RUNNER_CALLBACK_SECRET GCP_SERVICE_ACCOUNT_TOKEN

if [ -z "$REPO" ]; then
  echo "Error: No repository specified. Pass via STARLIGHT_REPO env or argument 1."
  exit 1
fi

WORKSPACE_DIR="/home/starlight/workspace"
cd "$WORKSPACE_DIR"

REPO_URL="https://github.com/${REPO}.git"
GIT_AUTH_ARGS=()
if [ -n "$LOCAL_GITHUB_TOKEN" ]; then
  AUTH_B64=$(printf 'x-access-token:%s' "$LOCAL_GITHUB_TOKEN" | base64 | tr -d '\r\n')
  GIT_AUTH_ARGS=(-c "http.https://github.com/.extraHeader=Authorization: Basic ${AUTH_B64}")
fi

echo " Cloning repository: $REPO (ref: $REF${PR_NUMBER:+, pr: #$PR_NUMBER})..."
if [ -n "$PR_NUMBER" ]; then
  # Fetch base repository pull-request ref directly so fork or non-base branch names never fail clone.
  git init repo
  git -C repo remote add origin "$REPO_URL"
  git "${GIT_AUTH_ARGS[@]}" -C repo fetch --depth 1 origin "refs/pull/${PR_NUMBER}/head"
  git -C repo checkout --detach FETCH_HEAD
else
  case "$REF" in
    refs/heads/*)
      NORMALIZED_REF="${REF#refs/heads/}"
      git "${GIT_AUTH_ARGS[@]}" clone --depth 1 --branch "$NORMALIZED_REF" "$REPO_URL" repo
      ;;
    refs/tags/*)
      NORMALIZED_REF="${REF#refs/tags/}"
      git "${GIT_AUTH_ARGS[@]}" clone --depth 1 --branch "$NORMALIZED_REF" "$REPO_URL" repo
      ;;
    refs/*)
      git init repo
      git -C repo remote add origin "$REPO_URL"
      git "${GIT_AUTH_ARGS[@]}" -C repo fetch --depth 1 origin "$REF"
      git -C repo checkout --detach FETCH_HEAD
      ;;
    *)
      if printf '%s' "$REF" | grep -Eq '^[0-9a-fA-F]{40}$'; then
        git init repo
        git -C repo remote add origin "$REPO_URL"
        git "${GIT_AUTH_ARGS[@]}" -C repo fetch --depth 1 origin "$REF"
        git -C repo checkout --detach FETCH_HEAD
      else
        git "${GIT_AUTH_ARGS[@]}" clone --depth 1 --branch "$REF" "$REPO_URL" repo
      fi
      ;;
  esac
fi

cd repo

if [ -n "${COMMIT_SHA:-}" ] && ! printf '%s' "$COMMIT_SHA" | grep -Eq '^0+$' && [ "$(git rev-parse HEAD)" != "$COMMIT_SHA" ]; then
  echo " Pinning workspace to exact commit SHA: $COMMIT_SHA..."
  git "${GIT_AUTH_ARGS[@]}" fetch --depth 1 origin "$COMMIT_SHA"
  git checkout --detach "$COMMIT_SHA"
fi

# Purge ephemeral GitHub clone credentials from shell memory before running repository code.
GIT_AUTH_ARGS=()
AUTH_B64=""
LOCAL_GITHUB_TOKEN=""
unset GIT_AUTH_ARGS AUTH_B64 LOCAL_GITHUB_TOKEN

echo " Configuring dependency cache..."
if [ -d "/cache/pnpm" ] && [ -w "/cache/pnpm" ]; then
  echo " Using mounted persistent cache volume at /cache/pnpm"
  pnpm config set store-dir /cache/pnpm/store
elif [ -d "/home/starlight/.local/share/pnpm/store/v3" ]; then
  echo " Using pre-warmed image store cache"
  pnpm config set store-dir /home/starlight/.local/share/pnpm/store/v3
fi

# Drop privileges to an isolated runner user if present so untrusted commands cannot inspect parent shell memory.
RUN_PREFIX=()
if id -u starlight-sandbox >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
  chown -R starlight-sandbox:starlight-sandbox "$WORKSPACE_DIR/repo"
  RUN_PREFIX=(su -s /bin/bash starlight-sandbox -c)
fi

run_untrusted() {
  local cmd="$1"
  if [ "${#RUN_PREFIX[@]}" -gt 0 ]; then
    "${RUN_PREFIX[@]}" "$cmd"
  else
    env -u GITHUB_TOKEN -u STARLIGHT_RUNNER_SECRET -u RUNNER_CALLBACK_SECRET -u GCP_SERVICE_ACCOUNT_TOKEN bash -c "$cmd"
  fi
}

echo " Installing dependencies..."
INSTALL_START=$(date +%s)
if [ -f "pnpm-lock.yaml" ]; then
  run_untrusted "pnpm install --frozen-lockfile --prefer-offline || pnpm install"
elif [ -f "package-lock.json" ]; then
  run_untrusted "npm ci --prefer-offline || npm install"
else
  run_untrusted "npm install"
fi
INSTALL_DURATION=$(( $(date +%s) - INSTALL_START ))
echo " Dependency install finished in ${INSTALL_DURATION}s"

echo " Executing Verification Command: $COMMAND"
TASK_TIMEOUT="${STARLIGHT_TIMEOUT:-300s}"
START_TIME=$(date +%s)
EXIT_CODE=0

# Execute with process timeout protection to prevent runaway job costs
if [ "${#RUN_PREFIX[@]}" -gt 0 ]; then
  if timeout -k 10s "$TASK_TIMEOUT" "${RUN_PREFIX[@]}" "$COMMAND"; then
    echo " Verification PASSED"
    STATUS="pass"
  else
    EXIT_CODE=$?
    echo " Verification FAILED with exit code: $EXIT_CODE"
    STATUS="fail"
  fi
else
  if env -u GITHUB_TOKEN -u STARLIGHT_RUNNER_SECRET -u RUNNER_CALLBACK_SECRET -u GCP_SERVICE_ACCOUNT_TOKEN timeout -k 10s "$TASK_TIMEOUT" bash -c "$COMMAND"; then
    echo " Verification PASSED"
    STATUS="pass"
  else
    EXIT_CODE=$?
    echo " Verification FAILED with exit code: $EXIT_CODE"
    STATUS="fail"
  fi
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo " Run duration: ${DURATION}s"

if [ -n "$CALLBACK_URL" ]; then
  echo " Posting execution receipt to callback: $CALLBACK_URL"
  CALLBACK_TS=$(date +%s)
  DELIVERY_OR_RUN_ID="${DELIVERY_ID:-${STARLIGHT_DELIVERY_ID:-run-${CALLBACK_TS}}}"
  CALLBACK_STATUS="failed"
  if [ "$STATUS" = "pass" ]; then
    CALLBACK_STATUS="succeeded"
  fi
  PAYLOAD=$(jq -n \
    --arg deliveryId "$DELIVERY_OR_RUN_ID" \
    --arg repo "$REPO" \
    --arg ref "$REF" \
    --arg commitSha "${COMMIT_SHA:-}" \
    --arg status "$CALLBACK_STATUS" \
    --arg durationMs "$((DURATION * 1000))" \
    --arg duration "$DURATION" \
    --arg installDuration "$INSTALL_DURATION" \
    --arg exitCode "$EXIT_CODE" \
    '{deliveryId: $deliveryId, repo: $repo, ref: $ref, commitSha: (if $commitSha == "" then null else $commitSha end), status: $status, durationMs: ($durationMs|tonumber), duration: ($duration|tonumber), installDuration: ($installDuration|tonumber), exitCode: ($exitCode|tonumber), timestamp: (now|todate)}')

  CURL_ARGS=(-s -X POST "$CALLBACK_URL" -H "Content-Type: application/json" -H "X-Starlight-Timestamp: $CALLBACK_TS")

  # Authenticate receipt with timestamped HMAC-SHA256 signature (`v1=hmac(timestamp.body)`)
  if [ -n "$LOCAL_CALLBACK_SECRET" ]; then
    SIG=$(printf '%s.%s' "$CALLBACK_TS" "$PAYLOAD" | openssl dgst -sha256 -hmac "$LOCAL_CALLBACK_SECRET" | awk '{print $2}')
    CURL_ARGS+=(-H "X-Starlight-Signature: v1=$SIG")
  fi

  curl "${CURL_ARGS[@]}" -d "$PAYLOAD" || true
fi

exit "$EXIT_CODE"
