#!/usr/bin/env bash
# Fixed Node verification profile. Admission occurs before this process starts.
set -euo pipefail
umask 077

REPO="${STARLIGHT_REPO:-}"
COMMIT="${STARLIGHT_COMMIT_SHA:-}"
DURATION="${STARLIGHT_TIMEOUT_SECONDS:-}"
if [[ ! "$REPO" =~ ^[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}$ ]] \
  || [[ ! "$COMMIT" =~ ^[0-9a-f]{40}$ || "$COMMIT" =~ ^0+$ ]] \
  || [[ ! "$DURATION" =~ ^[1-9][0-9]{0,2}$ ]] || (( DURATION > 900 )); then
  echo 'Runner refused: exact repository, commit and bounded timeout are required.' >&2
  exit 64
fi
if (( $# != 0 )) || [[ -n "${STARLIGHT_COMMAND:-}${STARLIGHT_REF:-}${STARLIGHT_CALLBACK_URL:-}${CALLBACK_URL:-}" ]]; then
  echo 'Runner refused: command, ref, argument and callback overrides are unsupported.' >&2
  exit 64
fi

WORKSPACE=$(mktemp -d "${TMPDIR:-/tmp}/starlight-runner.XXXXXXXX")
SOURCE_VERIFIED=false
finish() {
  local code=$?
  trap - EXIT
  printf 'STARLIGHT_RUNNER_RECEIPT {"repository":"%s","commit":"%s","source_verified":%s,"exit_code":%s,"customer_accepted":false}\n' \
    "$REPO" "$COMMIT" "$SOURCE_VERIFIED" "$code"
  rm -rf -- "$WORKSPACE"
  exit "$code"
}
trap finish EXIT
mkdir -p "$WORKSPACE/home" "$WORKSPACE/repo"
DEADLINE=$(( SECONDS + DURATION ))
run_timed() {
  local remaining=$(( DEADLINE - SECONDS ))
  if (( remaining <= 0 )); then return 124; fi
  timeout --kill-after=5s "${remaining}s" "$@"
}

# Prevent inherited Git settings, tracing, URL rewrites and credential helpers.
GIT_ENV=(env -i "PATH=$PATH" "HOME=$WORKSPACE/home" GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_TERMINAL_PROMPT=0)
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH=$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')
  GIT_ENV+=(GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=http.https://github.com/.extraheader "GIT_CONFIG_VALUE_0=AUTHORIZATION: basic $AUTH")
fi
run_git() {
  run_timed "${GIT_ENV[@]}" git -c credential.helper= -c core.hooksPath=/dev/null -c http.followRedirects=false "$@"
}
run_git init --quiet "$WORKSPACE/repo"
run_git -C "$WORKSPACE/repo" remote add origin "https://github.com/$REPO.git"
run_git -C "$WORKSPACE/repo" fetch --quiet --no-tags --depth 1 origin "$COMMIT"
run_git -C "$WORKSPACE/repo" checkout --quiet --detach FETCH_HEAD
ACTUAL=$(run_git -C "$WORKSPACE/repo" rev-parse HEAD)
if [[ "$ACTUAL" != "$COMMIT" ]]; then
  echo 'Runner refused: checkout does not match the admitted commit.' >&2
  exit 65
fi
SOURCE_VERIFIED=true
unset GITHUB_TOKEN GH_TOKEN AUTH GIT_ENV
cd "$WORKSPACE/repo"

# Clean child environment; this is not a sandbox or a network/metadata boundary.
TASK_ENV=(env -i "PATH=$PATH" "HOME=$WORKSPACE/home" CI=true LANG=C.UTF-8 \
  GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_TERMINAL_PROMPT=0)
if [[ -f pnpm-lock.yaml ]]; then
  run_timed "${TASK_ENV[@]}" pnpm install --frozen-lockfile --ignore-scripts
  run_timed "${TASK_ENV[@]}" pnpm test
elif [[ -f package-lock.json ]]; then
  run_timed "${TASK_ENV[@]}" npm ci --ignore-scripts --include=dev
  run_timed "${TASK_ENV[@]}" npm test --ignore-scripts
else
  echo 'Runner refused: a supported reviewed lockfile is required.' >&2
  exit 66
fi
