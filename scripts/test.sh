#!/usr/bin/env bash
# リポジトリのルートで実行する。ビルド、単体テスト、アーキテクチャのルール、受け入れテストを実行する。
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

echo "== 受け入れテスト =="
ids=()
shopt -s nullglob
for f in scripts/enabled-tests/*.txt; do
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [ -n "$line" ] && ids+=("$line")
  done <"$f"
done
if [ "${#ids[@]}" -eq 0 ]; then
  echo "有効なテストが無いため、受け入れテストは実行しない"
else
  # "@T12-3" が "@T12-30" に当てはまらないように、タグの前後を空白か端で区切る
  alternatives=""
  for id in "${ids[@]}"; do
    id="${id#@}"
    escaped=$(printf '%s' "$id" | sed -e 's/[][\.*^$+?(){}|/]/\\&/g')
    alternatives+="${alternatives:+|}$escaped"
  done
  (
    cd acceptance
    npm ci
    # アプリケーションは、Playwright の webServer が起動し、終了時に止める
    npx playwright test --grep "(^|\\s)@(${alternatives})(\\s|\$)"
  )
fi
