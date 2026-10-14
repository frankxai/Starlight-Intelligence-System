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

REPO="${STARLIGHT_REPO:-$1}"
REF="${STARLIGHT_REF:-${2:-main}}"
COMMAND="${STARLIGHT_COMMAND:-${3:-npm test}}"
CALLBACK_URL="${STARLIGHT_CALLBACK_URL:-$4}"

if [ -z "$REPO" ]; then
  echo "Error: No repository specified. Pass via STARLIGHT_REPO env or argument 1."
  exit 1
fi

WORKSPACE_DIR="/home/starlight/workspace"
cd "$WORKSPACE_DIR"

echo " Cloning repository: $REPO (ref: $REF)..."
if [ -n "$GITHUB_TOKEN" ]; then
  git clone --depth 1 --branch "$REF" "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git" repo
else
  git clone --depth 1 --branch "$REF" "https://github.com/${REPO}.git" repo
fi

cd repo

echo " Configuring dependency cache..."
if [ -d "/cache/pnpm" ] && [ -w "/cache/pnpm" ]; then
  echo " Using mounted persistent cache volume at /cache/pnpm"
  pnpm config set store-dir /cache/pnpm/store
elif [ -d "/home/starlight/.local/share/pnpm/store/v3" ]; then
  echo " Using pre-warmed image store cache"
  pnpm config set store-dir /home/starlight/.local/share/pnpm/store/v3
fi

echo " Installing dependencies..."
INSTALL_START=$(date +%s)
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile --prefer-offline || pnpm install
elif [ -f "package-lock.json" ]; then
  npm ci --prefer-offline || npm install
else
  npm install
fi
INSTALL_DURATION=$(( $(date +%s) - INSTALL_START ))
echo " Dependency install finished in ${INSTALL_DURATION}s"

echo " Executing Verification Command: $COMMAND"
TASK_TIMEOUT="${STARLIGHT_TIMEOUT:-300s}"
START_TIME=$(date +%s)
EXIT_CODE=0

# Execute with process timeout protection to prevent runaway job costs
if timeout -k 10s "$TASK_TIMEOUT" bash -c "$COMMAND"; then
  echo " Verification PASSED"
  STATUS="pass"
else
  EXIT_CODE=$?
  echo " Verification FAILED with exit code: $EXIT_CODE"
  STATUS="fail"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo " Run duration: ${DURATION}s"

if [ -n "$CALLBACK_URL" ]; then
  echo " Posting execution receipt to callback: $CALLBACK_URL"
  PAYLOAD=$(jq -n \
    --arg repo "$REPO" \
    --arg ref "$REF" \
    --arg status "$STATUS" \
    --arg duration "$DURATION" \
    --arg installDuration "$INSTALL_DURATION" \
    --arg exitCode "$EXIT_CODE" \
    '{repo: $repo, ref: $ref, status: $status, duration: ($duration|tonumber), installDuration: ($installDuration|tonumber), exitCode: ($exitCode|tonumber), timestamp: (now|todate)}')
  
  CURL_ARGS=(-s -X POST "$CALLBACK_URL" -H "Content-Type: application/json")

  # Authenticate receipt with HMAC-SHA256 signature if runner secret is provided
  if [ -n "$STARLIGHT_RUNNER_SECRET" ]; then
    SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$STARLIGHT_RUNNER_SECRET" | awk '{print $2}')
    CURL_ARGS+=(-H "X-Starlight-Signature: sha256=$SIG")
  fi

  curl "${CURL_ARGS[@]}" -d "$PAYLOAD" || true
fi

exit "$EXIT_CODE"

