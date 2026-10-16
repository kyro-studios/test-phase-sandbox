# バックエンドのイメージ。installDist の成果物を JRE で起動する
FROM eclipse-temurin:21-jdk-noble AS build
WORKDIR /app
COPY . .
RUN ./gradlew --no-daemon installDist

FROM eclipse-temurin:21-jre-noble
WORKDIR /app
COPY --from=build /app/build/install/backend/ /app/
# 環境変数 PORT (Cloud Run が渡す。既定 8080) で待ち受ける
ENTRYPOINT ["/app/bin/backend"]
