#!/usr/bin/env bash
# ==============================================================================
# Starlight Scale-to-Zero Runner Entrypoint
# Executes CI/CD validation, SAGE proving ground, and autonomous agent tasks.
# Security: Enforces mandatory dual-UID isolation (`starlight` -> `starlight-sandbox`)
# with `env -i` scrubbed environments so repository code cannot inspect supervisor
# `/proc/<pid>/environ`, `/proc/<pid>/mem`, or callback signing keys.
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
SANDBOX_USER="${STARLIGHT_SANDBOX_USER:-starlight-sandbox}"

# Capture supervisor-only credentials into unexported shell variables and scrub exported env.
LOCAL_GITHUB_TOKEN="${GITHUB_TOKEN:-}"
LOCAL_CALLBACK_SECRET="${STARLIGHT_RUNNER_SECRET:-${RUNNER_CALLBACK_SECRET:-}}"
unset GITHUB_TOKEN STARLIGHT_RUNNER_SECRET RUNNER_CALLBACK_SECRET GCP_SERVICE_ACCOUNT_TOKEN

if [ -z "$REPO" ]; then
  echo "Error: No repository specified. Pass via STARLIGHT_REPO env or argument 1." >&2
  exit 1
fi

# Enforce mandatory distinct-UID sandbox isolation (FAIL CLOSED — never fall back to supervisor UID).
if ! id -u "$SANDBOX_USER" >/dev/null 2>&1; then
  echo "Error: Isolated sandbox user '$SANDBOX_USER' does not exist; refusing fail-open execution." >&2
  exit 1
fi

SUPERVISOR_UID="$(id -u)"
SANDBOX_UID="$(id -u "$SANDBOX_USER")"
if [ "$SUPERVISOR_UID" = "$SANDBOX_UID" ]; then
  echo "Error: Supervisor UID ($SUPERVISOR_UID) matches sandbox UID; refusing same-user execution." >&2
  exit 1
fi

SANDBOX_HOME="$(getent passwd "$SANDBOX_USER" | cut -d: -f6)"
if [ -z "$SANDBOX_HOME" ]; then
  SANDBOX_HOME="/home/${SANDBOX_USER}"
fi
SANDBOX_PATH="${SANDBOX_HOME}/.local/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

SANDBOX_EXEC=()
if [ "$SUPERVISOR_UID" -eq 0 ] && command -v runuser >/dev/null 2>&1; then
  SANDBOX_EXEC=(runuser -u "$SANDBOX_USER" -- /usr/bin/env -i "HOME=${SANDBOX_HOME}" "USER=${SANDBOX_USER}" "LOGNAME=${SANDBOX_USER}" "PATH=${SANDBOX_PATH}" "PNPM_HOME=${SANDBOX_HOME}/.local/share/pnpm" "CI=true" "NODE_ENV=production" "STARLIGHT_SUBSTRATE=true")
elif command -v sudo >/dev/null 2>&1; then
  SANDBOX_EXEC=(sudo -n -u "$SANDBOX_USER" -- /usr/bin/env -i "HOME=${SANDBOX_HOME}" "USER=${SANDBOX_USER}" "LOGNAME=${SANDBOX_USER}" "PATH=${SANDBOX_PATH}" "PNPM_HOME=${SANDBOX_HOME}/.local/share/pnpm" "CI=true" "NODE_ENV=production" "STARLIGHT_SUBSTRATE=true")
else
  echo "Error: Neither runuser nor passwordless sudo available to enter '$SANDBOX_USER'; refusing execution." >&2
  exit 1
fi

# Preflight check that UID transition succeeds with a clean environment before cloning.
if ! "${SANDBOX_EXEC[@]}" /bin/bash -c 'test "$(id -u)" = "$1"' _ "$SANDBOX_UID"; then
  echo "Error: Sandbox UID transition verification failed; refusing execution." >&2
  exit 1
fi

STAGE_ROOT="${STARLIGHT_STAGE_DIR:-/work}"
mkdir -p "$STAGE_ROOT"
rm -rf "${STAGE_ROOT}/source"

REPO_URL="https://github.com/${REPO}.git"
GIT_AUTH_ARGS=()
if [ -n "$LOCAL_GITHUB_TOKEN" ]; then
  AUTH_B64=$(printf 'x-access-token:%s' "$LOCAL_GITHUB_TOKEN" | base64 | tr -d '\r\n')
  GIT_AUTH_ARGS=(-c "http.https://github.com/.extraHeader=Authorization: Basic ${AUTH_B64}")
fi

echo " Cloning repository into supervisor staging: $REPO (ref: $REF${PR_NUMBER:+, pr: #$PR_NUMBER})..."
if [ -n "$PR_NUMBER" ]; then
  # Fetch base repository pull-request ref directly so fork or non-base branch names never fail clone.
  git init "${STAGE_ROOT}/source"
  git -C "${STAGE_ROOT}/source" remote add origin "$REPO_URL"
  git "${GIT_AUTH_ARGS[@]}" -C "${STAGE_ROOT}/source" fetch --depth 50 origin "refs/pull/${PR_NUMBER}/head"
  git -C "${STAGE_ROOT}/source" checkout --detach FETCH_HEAD
else
  case "$REF" in
    refs/heads/*)
      NORMALIZED_REF="${REF#refs/heads/}"
      git "${GIT_AUTH_ARGS[@]}" clone --depth 50 --branch "$NORMALIZED_REF" "$REPO_URL" "${STAGE_ROOT}/source"
      ;;
    refs/tags/*)
      NORMALIZED_REF="${REF#refs/tags/}"
      git "${GIT_AUTH_ARGS[@]}" clone --depth 50 --branch "$NORMALIZED_REF" "$REPO_URL" "${STAGE_ROOT}/source"
      ;;
    refs/*)
      git init "${STAGE_ROOT}/source"
      git -C "${STAGE_ROOT}/source" remote add origin "$REPO_URL"
      git "${GIT_AUTH_ARGS[@]}" -C "${STAGE_ROOT}/source" fetch --depth 50 origin "$REF"
      git -C "${STAGE_ROOT}/source" checkout --detach FETCH_HEAD
      ;;
    *)
      if printf '%s' "$REF" | grep -Eq '^[0-9a-fA-F]{40}$'; then
        echo "Error: Refusing unanchored raw commit SHA without an explicit repository ref." >&2
        exit 1
      else
        git "${GIT_AUTH_ARGS[@]}" clone --depth 50 --branch "$REF" "$REPO_URL" "${STAGE_ROOT}/source"
      fi
      ;;
  esac
fi

if [ -n "${COMMIT_SHA:-}" ] && ! printf '%s' "$COMMIT_SHA" | grep -Eq '^0+$' && [ "$(git -C "${STAGE_ROOT}/source" rev-parse HEAD)" != "$COMMIT_SHA" ]; then
  # Verify COMMIT_SHA is already reachable in the fetched base-repo ref history — NEVER fetch arbitrary unreferenced fork SHAs!
  if ! git -C "${STAGE_ROOT}/source" cat-file -e "${COMMIT_SHA}^{commit}" 2>/dev/null || ! git -C "${STAGE_ROOT}/source" merge-base --is-ancestor "$COMMIT_SHA" HEAD; then
    echo "Error: COMMIT_SHA ($COMMIT_SHA) is not an ancestor of fetched ref ($REF). Refusing untrusted object checkout." >&2
    exit 1
  fi
  echo " Pinning workspace to verified ancestor commit SHA: $COMMIT_SHA..."
  git -C "${STAGE_ROOT}/source" checkout --detach "$COMMIT_SHA"
fi

# Purge ephemeral GitHub clone credentials from supervisor memory and expose read-only staging to sandbox group.
GIT_AUTH_ARGS=()
AUTH_B64=""
LOCAL_GITHUB_TOKEN=""
unset GIT_AUTH_ARGS AUTH_B64 LOCAL_GITHUB_TOKEN
chmod -R u+rwX,g+rX,o-rwx "${STAGE_ROOT}/source"

SANDBOX_REPO="${SANDBOX_HOME}/workspace/repo"
"${SANDBOX_EXEC[@]}" /bin/bash -c '
  set -eo pipefail
  rm -rf "$1"
  mkdir -p "$(dirname "$1")"
  cp -a "$2" "$1"
  if [ -d "/cache/pnpm" ] && [ -w "/cache/pnpm" ]; then
    pnpm config set store-dir /cache/pnpm/store
  elif [ -d "$HOME/.local/share/pnpm/store/v3" ]; then
    pnpm config set store-dir "$HOME/.local/share/pnpm/store/v3"
  fi
' _ "$SANDBOX_REPO" "${STAGE_ROOT}/source"

# Remove supervisor staging tree before running untrusted dependency lifecycle scripts.
rm -rf "${STAGE_ROOT}/source"

echo " Installing dependencies inside isolated '$SANDBOX_USER' sandbox..."
INSTALL_START=$(date +%s)
"${SANDBOX_EXEC[@]}" /bin/bash -c '
  set -eo pipefail
  cd "$1"
  if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile --prefer-offline || pnpm install
  elif [ -f "package-lock.json" ]; then
    npm ci --prefer-offline || npm install
  else
    npm install
  fi
' _ "$SANDBOX_REPO"
INSTALL_DURATION=$(( $(date +%s) - INSTALL_START ))
echo " Dependency install finished in ${INSTALL_DURATION}s"

echo " Executing Verification Command inside '$SANDBOX_USER': $COMMAND"
TASK_TIMEOUT="${STARLIGHT_TIMEOUT:-300s}"
START_TIME=$(date +%s)
EXIT_CODE=0

# Execute with process timeout protection inside the unprivileged sandbox identity
if timeout -k 10s "$TASK_TIMEOUT" "${SANDBOX_EXEC[@]}" /bin/bash -c 'cd "$1" && eval "$2"' _ "$SANDBOX_REPO" "$COMMAND"; then
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
