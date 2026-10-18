#!/usr/bin/env bash
# Local frontend development without Docker.
#
#   ./scripts/dev.sh          UI on :3000, API proxied to the deployed backend (real data,
#                             real Firebase login, no local Google credentials needed)
#   ./scripts/dev.sh local    UI on :3000 plus Spring Boot on :8080 (needs Google ADC)
#
# The Vite dev server still owns :3000 and proxies /api to localhost:8080.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-remote}"
API_URL="${BONAFIDE_API_URL:-https://bonafide-api-199277557753.asia-southeast1.run.app}"
WEB_PORT="${BONAFIDE_WEB_PORT:-3000}"
PROXY_PORT="${BONAFIDE_PROXY_PORT:-8080}"
CHILD_PIDS=()

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

pick_web_port() {
  local port="$WEB_PORT"
  while port_in_use "$port"; do
    echo "Port $port is already in use; trying $((port + 1))." >&2
    port=$((port + 1))
    if [ "$port" -gt $((WEB_PORT + 20)) ]; then
      echo "No free port between $WEB_PORT and $((WEB_PORT + 20))." >&2
      exit 1
    fi
  done
  WEB_PORT="$port"
}

cleanup() {
  for pid in "${CHILD_PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

ensure_web_deps() {
  if [ ! -x "$ROOT/web/node_modules/.bin/vite" ]; then
    echo "Installing web dependencies…"
    (cd "$ROOT/web" && npm ci)
  fi
}

backend_healthy() {
  curl -fsS -m 2 "http://127.0.0.1:$PROXY_PORT/actuator/health" >/dev/null 2>&1
}

start_remote_proxy() {
  if lsof -nP -iTCP:"$PROXY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    if backend_healthy; then
      echo "Using the backend already listening on :$PROXY_PORT"
      return
    fi
    echo "Port $PROXY_PORT is taken by something that is not Bonafide. Free it and retry." >&2
    exit 1
  fi

  BONAFIDE_API_URL="$API_URL" BONAFIDE_PROXY_PORT="$PROXY_PORT" \
    node "$ROOT/scripts/dev-proxy.mjs" &
  CHILD_PIDS+=("$!")

  for _ in $(seq 1 40); do
    backend_healthy && return
    sleep 0.25
  done
  echo "The proxy to $API_URL did not become ready." >&2
  exit 1
}

start_local_backend() {
  if port_in_use "$PROXY_PORT"; then
    echo "Port $PROXY_PORT is already in use. Stop any running ./scripts/dev.sh first." >&2
    exit 1
  fi

  if [ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] \
    && [ ! -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    cat >&2 <<'MSG'
The local backend needs Google Cloud credentials (Firestore, Storage, Gemini).

  Option A — Application Default Credentials:
    brew install --cask google-cloud-sdk
    gcloud auth application-default login

  Option B — a service account key:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

Then rerun: ./scripts/dev.sh local
No credentials? Run ./scripts/dev.sh (default) — it uses the deployed backend and needs none.
MSG
    exit 2
  fi

  [ -f "$ROOT/backend/.env" ] || cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/backend/.env"
  set +a
  export BONAFIDE_SERVICE_URL="http://localhost:$PROXY_PORT"

  (cd "$ROOT/backend" && ./mvnw spring-boot:run) &
  BACKEND_PID=$!
  CHILD_PIDS+=("$BACKEND_PID")

  for _ in $(seq 1 240); do
    backend_healthy && return
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo "The backend exited before becoming healthy. See the log above." >&2
      exit 1
    fi
    sleep 1
  done
  echo "The backend did not become healthy within 4 minutes." >&2
  exit 1
}

case "$MODE" in
  remote) start_remote_proxy ;;
  local) start_local_backend ;;
  *)
    echo "usage: ./scripts/dev.sh [remote|local]" >&2
    exit 2
    ;;
esac

ensure_web_deps
unset VITE_MOCK
pick_web_port
echo
echo "Bonafide web app: http://localhost:$WEB_PORT"
echo "API:              http://localhost:$PROXY_PORT ($MODE)"
echo
cd "$ROOT/web"
npm run dev -- --port "$WEB_PORT" --strictPort
