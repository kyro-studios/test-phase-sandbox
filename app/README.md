# アプリケーション

構成は [`docs/architecture.md`](../docs/architecture.md) に従う。

- `frontend/`: React、Vite の SPA (npm)。`npm run dev` で開発サーバーを起動する。`/api` は `http://localhost:8080` へ中継される
- `backend/`: Java 21、Javalin の API (Gradle)。`./gradlew run` で起動する。ポートは環境変数 `PORT` (既定 8080)

## コマンド

| 対象 | コマンド |
| --- | --- |
| フロントエンドの単体テスト | `cd frontend && npm test` |
| フロントエンドの Linting と整形の検査 | `cd frontend && npm run lint && npm run format:check` |
| バックエンドのビルドと単体テスト (Spotless を含む) | `cd backend && ./gradlew build` |
| バックエンドの整形 | `cd backend && ./gradlew spotlessApply` |

すべてのテストは、リポジトリのルートの `scripts/test.sh` で実行する (`scripts/test.Dockerfile` のコンテナの中)。
