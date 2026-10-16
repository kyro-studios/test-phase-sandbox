import { createBrowserRouter } from "react-router";
import { HealthPage } from "../features/health/HealthPage";

export const router = createBrowserRouter([
  { path: "/", element: <p className="p-4">アプリケーション</p> },
  { path: "/health", element: <HealthPage /> },
]);
