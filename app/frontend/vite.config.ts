import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const backendUrl = "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { "/api": backendUrl } },
  preview: { port: 5173, proxy: { "/api": backendUrl } },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"] },
});
