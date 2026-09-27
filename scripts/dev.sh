#!/usr/bin/env bash
# Start the API (port 8000) and the web app (port 3000) together. Ctrl+C stops both.
set -euo pipefail
cd "$(dirname "$0")/.."

(cd backend && uv run uvicorn app.main:app --reload --port 8000) &
api=$!
trap 'kill $api 2>/dev/null' EXIT

cd frontend
[ -d node_modules ] || npm install
npm run dev
