import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const backendUrl = "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 同じ origin で /api を中継するため CORS は不要。Vite が OPTIONS に 204 を返すと、中継先の 405 が届かなくなる
  server: { port: 5173, cors: false, proxy: { "/api": backendUrl } },
  preview: { port: 5173, proxy: { "/api": backendUrl } },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"] },
});
