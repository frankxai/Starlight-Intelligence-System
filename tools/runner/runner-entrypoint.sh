#!/usr/bin/env bash
# ==============================================================================
# Starlight Scale-to-Zero Runner Entrypoint
# Executes CI/CD validation, SAGE proving ground, and autonomous agent tasks.
# Security:
#   1. Mandatory dual-UID isolation (`starlight` supervisor -> `starlight-sandbox` executor)
#      with `env -i` scrubbed environments and explicit `starlight-sandbox` group staging (`2750`).
#   2. Zero secret exposure in process command lines (`/proc/<pid>/cmdline`):
#      - Git clone auth uses `GIT_CONFIG_COUNT`/`GIT_CONFIG_VALUE_0` environment config (never `-c` argv or `.git/config`).
#      - Callback HMAC-SHA256 signing & HTTPS delivery run inside Node.js reading the signing key over `stdin` (`fd 0`)
#        from bash builtin `printf`, never passing keys or signatures as CLI arguments.
#   3. Kernel process reaping (`kill -9 -1` as `starlight-sandbox`) + `/proc` verification terminates
#      all surviving background processes from untrusted repository scripts before supervisor signing.
# Built on SIP v1.1.1 — Sovereign Substrate
# ==============================================================================

set -eo pipefail

# Lock supervisor PATH to root-owned system directories and scrub loader/runtime hooks
# so sandbox-writable directories (e.g. /home/starlight-sandbox/.local/share/pnpm) can never hijack supervisor binaries.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
unset NODE_OPTIONS LD_PRELOAD LD_LIBRARY_PATH BASH_ENV ENV SHELLOPTS CDPATH PNPM_HOME

TRUSTED_NODE_BIN=""
for candidate_node in /usr/bin/node /usr/local/bin/node; do
  if [ -x "$candidate_node" ] && [ "$(stat -c '%u' "$candidate_node" 2>/dev/null || echo 0)" = "0" ]; then
    TRUSTED_NODE_BIN="$candidate_node"
    break
  fi
done

echo "=========================================================="
echo " Starlight Sovereign Runner — Initializing Scale-to-Zero Task"
echo " Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " Host: $(hostname)"
echo " Memory: $(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo unknown) kB"
echo " CPU: $(nproc 2>/dev/null || echo 1) vCPUs"
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
SANDBOX_GROUP="$(id -gn "$SANDBOX_USER")"
if [ "$SUPERVISOR_UID" = "$SANDBOX_UID" ]; then
  echo "Error: Supervisor UID ($SUPERVISOR_UID) matches sandbox UID; refusing same-user execution." >&2
  exit 1
fi

SANDBOX_HOME="$(getent passwd "$SANDBOX_USER" 2>/dev/null | cut -d: -f6 || true)"
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

reap_sandbox_processes() {
  "${SANDBOX_EXEC[@]}" /bin/bash -c 'kill -9 -1 2>/dev/null || true' >/dev/null 2>&1 || true
}

verify_no_surviving_sandbox_processes() {
  reap_sandbox_processes
  if [ ! -d /proc ]; then
    return 0
  fi
  local attempt=0
  while [ "$attempt" -lt 3 ]; do
    local found_live=0
    local status_file
    for status_file in /proc/[0-9]*/status; do
      [ -r "$status_file" ] || continue
      if awk -v target="$SANDBOX_UID" '
        /^State:/ { state = $2 }
        /^Uid:/ {
          if ($2 == target || $3 == target || $4 == target || $5 == target) {
            found = 1
          }
        }
        END { exit((found && state != "Z") ? 0 : 1) }
      ' "$status_file" 2>/dev/null; then
        found_live=1
        break
      fi
    done
    if [ "$found_live" -eq 0 ]; then
      return 0
    fi
    sleep 0.1
    reap_sandbox_processes
    attempt=$((attempt + 1))
  done
  echo "Error: Surviving sandbox process detected for UID ${SANDBOX_UID}; refusing privileged callback signing." >&2
  return 1
}

trap reap_sandbox_processes EXIT

STAGE_ROOT="${STARLIGHT_STAGE_DIR:-/work}"
mkdir -p "$STAGE_ROOT"
chgrp "$SANDBOX_GROUP" "$STAGE_ROOT"
chmod 2750 "$STAGE_ROOT"
rm -rf "${STAGE_ROOT}/source"

REPO_URL="https://github.com/${REPO}.git"
AUTH_B64=""
if [ -n "$LOCAL_GITHUB_TOKEN" ]; then
  AUTH_B64="$(printf 'x-access-token:%s' "$LOCAL_GITHUB_TOKEN" | base64 | tr -d '\r\n')"
fi

run_git_authenticated() {
  if [ -n "$AUTH_B64" ]; then
    GIT_TERMINAL_PROMPT=0 \
    GIT_CONFIG_COUNT=1 \
    GIT_CONFIG_KEY_0="http.https://github.com/.extraHeader" \
    GIT_CONFIG_VALUE_0="Authorization: Basic ${AUTH_B64}" \
    git "$@"
  else
    GIT_TERMINAL_PROMPT=0 git "$@"
  fi
}

echo " Cloning repository into supervisor staging: $REPO (ref: $REF${PR_NUMBER:+, pr: #$PR_NUMBER})..."
if [ -n "$PR_NUMBER" ]; then
  # Fetch base repository pull-request ref directly so fork or non-base branch names never fail clone.
  git init "${STAGE_ROOT}/source"
  git -C "${STAGE_ROOT}/source" remote add origin "$REPO_URL"
  run_git_authenticated -C "${STAGE_ROOT}/source" fetch --depth 50 origin "refs/pull/${PR_NUMBER}/head"
  git -C "${STAGE_ROOT}/source" checkout --detach FETCH_HEAD
else
  case "$REF" in
    refs/heads/*)
      NORMALIZED_REF="${REF#refs/heads/}"
      run_git_authenticated clone --depth 50 --branch "$NORMALIZED_REF" "$REPO_URL" "${STAGE_ROOT}/source"
      ;;
    refs/tags/*)
      NORMALIZED_REF="${REF#refs/tags/}"
      run_git_authenticated clone --depth 50 --branch "$NORMALIZED_REF" "$REPO_URL" "${STAGE_ROOT}/source"
      ;;
    refs/*)
      git init "${STAGE_ROOT}/source"
      git -C "${STAGE_ROOT}/source" remote add origin "$REPO_URL"
      run_git_authenticated -C "${STAGE_ROOT}/source" fetch --depth 50 origin "$REF"
      git -C "${STAGE_ROOT}/source" checkout --detach FETCH_HEAD
      ;;
    *)
      if printf '%s' "$REF" | grep -Eq '^[0-9a-fA-F]{40}$'; then
        echo "Error: Refusing unanchored raw commit SHA without an explicit repository ref." >&2
        exit 1
      else
        run_git_authenticated clone --depth 50 --branch "$REF" "$REPO_URL" "${STAGE_ROOT}/source"
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

# Purge ephemeral GitHub clone credentials from supervisor memory and assign sandbox group read/traverse permissions.
AUTH_B64=""
LOCAL_GITHUB_TOKEN=""
unset AUTH_B64 LOCAL_GITHUB_TOKEN
chgrp -R "$SANDBOX_GROUP" "${STAGE_ROOT}/source"
chmod -R u+rwX,g+rX,o-rwx "${STAGE_ROOT}/source"

SANDBOX_REPO="${SANDBOX_HOME}/workspace/repo"
"${SANDBOX_EXEC[@]}" /bin/bash -c '
  set -eo pipefail
  test -d "$2" && test -r "$2" && test -x "$2"
  rm -rf "$1"
  mkdir -p "$(dirname "$1")"
  cp -RPp "$2" "$1"
  chmod -R u+rwX "$1"
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
reap_sandbox_processes
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

# Reap any background processes spawned by repository scripts before signing completion receipt.
verify_no_surviving_sandbox_processes

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

  if [ -z "$TRUSTED_NODE_BIN" ]; then
    echo "Error: Trusted root-owned Node binary (/usr/bin/node or /usr/local/bin/node) not found; refusing callback signing." >&2
    exit 1
  fi

  # Sign and dispatch receipt inside root-owned TRUSTED_NODE_BIN reading LOCAL_CALLBACK_SECRET over stdin (fd 0)
  # from bash builtin `printf` so the secret never appears in any process argv (/proc/<pid>/cmdline).
  printf '%s' "$LOCAL_CALLBACK_SECRET" | "$TRUSTED_NODE_BIN" -e '
    const crypto = require("node:crypto");
    const fs = require("node:fs");
    const secret = fs.readFileSync(0, "utf8");
    const [
      callbackUrl,
      deliveryId,
      repo,
      ref,
      commitSha,
      status,
      durationSec,
      installDurationSec,
      exitCodeRaw,
      callbackTs,
    ] = process.argv.slice(1);
    const duration = Number(durationSec) || 0;
    const installDuration = Number(installDurationSec) || 0;
    const exitCode = Number(exitCodeRaw) || 0;
    const body = JSON.stringify({
      deliveryId,
      repo,
      ref,
      commitSha: commitSha || null,
      status,
      durationMs: duration * 1000,
      duration,
      installDuration,
      exitCode,
      timestamp: new Date(Number(callbackTs) * 1000).toISOString(),
    });
    const headers = {
      "Content-Type": "application/json",
      "Connection": "close",
      "X-Starlight-Timestamp": String(callbackTs),
    };
    if (secret.length > 0) {
      const sig = crypto
        .createHmac("sha256", secret)
        .update(`${callbackTs}.${body}`)
        .digest("hex");
      headers["X-Starlight-Signature"] = `v1=${sig}`;
    }
    fetch(callbackUrl, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {});
  ' -- \
    "$CALLBACK_URL" \
    "$DELIVERY_OR_RUN_ID" \
    "$REPO" \
    "$REF" \
    "${COMMIT_SHA:-}" \
    "$CALLBACK_STATUS" \
    "$DURATION" \
    "$INSTALL_DURATION" \
    "$EXIT_CODE" \
    "$CALLBACK_TS" || true
fi

LOCAL_CALLBACK_SECRET=""
unset LOCAL_CALLBACK_SECRET

exit "$EXIT_CODE"
