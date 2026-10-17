#!/usr/bin/env bash
# リポジトリのルートで実行する。ビルド、単体テスト、アーキテクチャのルールを実行する。
set -euo pipefail

cd "$(dirname "$0")/.."
root=$PWD

echo "== フロントエンド =="
(
  cd app/frontend
  npm ci
  npm run lint
  npm run format:check
  npm run build
  npm test
)

echo "== バックエンド =="
(
  cd app/backend
  ./gradlew --no-daemon build installDist
)

echo "== アーキテクチャのルール =="
(
  cd architecture-rules
  npm ci
)
e2e=()
[ -d app/frontend/e2e ] && e2e=(app/frontend/e2e)
architecture-rules/node_modules/.bin/depcruise \
  --config architecture-rules/dependency-cruiser.cjs app/frontend/src "${e2e[@]}"
(
  cd architecture-rules/archunit
  ./gradlew --no-daemon test -PclassesDir="$root/app/backend/build/classes/java/main"
)
