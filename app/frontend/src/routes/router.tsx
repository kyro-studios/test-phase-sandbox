import { createBrowserRouter } from "react-router";
import { HealthPage } from "../features/health/HealthPage";
import { NotFoundPage } from "../features/not-found/NotFoundPage";
import { RootLayout } from "./RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <main className="p-4">アプリケーション</main> },
      { path: "/health", element: <HealthPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
