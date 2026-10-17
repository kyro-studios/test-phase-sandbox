#!/usr/bin/env bash
# リポジトリのルートで、scripts/test.sh の後に実行する。環境変数 PORT で、画面と API を 1 つのオリジンで提供する。
# バックエンドを 8080 で起動し、フロントエンドの vite preview が PORT で配信して /api を中継する。
set -euo pipefail

cd "$(dirname "$0")/.."
port="${PORT:-4000}"

pids=()
cleanup() {
  trap - EXIT TERM INT
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap 'cleanup; exit 143' TERM INT
trap cleanup EXIT

PORT=8080 app/backend/build/install/backend/bin/backend &
pids+=($!)

(cd app/frontend && exec npx vite preview --host 127.0.0.1 --port "$port" --strictPort) &
pids+=($!)

# どちらかが終わったら、残りも止めて終わる
wait -n
