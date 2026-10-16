FROM eclipse-temurin:21-jdk-noble

# Node.js 22 (LTS)
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Docker の CLI (Testcontainers 用。デーモンはホストのものを使う)
COPY --from=docker:28-cli /usr/local/bin/docker /usr/local/bin/docker

# Playwright のブラウザー (acceptance/package.json の @playwright/test と同じバージョンにする)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx --yes playwright@1.64.1 install --with-deps chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm

ENV CI=true
