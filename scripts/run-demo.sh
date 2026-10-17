#!/usr/bin/env bash
# Runs Bonafide with rich dummy data (No Java, Docker, or Cloud credentials required)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/web"

NODE_BIN="$(which node || echo "/opt/homebrew/bin/node")"

echo "=========================================================="
echo " Starting Bonafide Showcase with Dummy/Demo Data"
echo " (No Java 25 or Docker required)"
echo " Local UI: http://localhost:3000"
echo "=========================================================="

export VITE_MOCK=true
exec "$NODE_BIN" ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 3000
