# フロントエンドのイメージ。vite build の成果物を nginx で配信する (静的配信、SPA のフォールバック、/api/ の中継)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Cloud Run は PORT で待ち受けるポートを渡す。ローカルでの既定値
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
