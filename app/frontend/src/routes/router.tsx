import { createBrowserRouter } from "react-router";
import { GreetingPage } from "../features/greeting/GreetingPage";
import { HealthPage } from "../features/health/HealthPage";
import { NotFoundPage } from "../features/not-found/NotFoundPage";
import { TextLengthPage } from "../features/text-length/TextLengthPage";
import { RootLayout } from "./RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <main className="p-4">アプリケーション</main> },
      { path: "/health", element: <HealthPage /> },
      { path: "/greeting", element: <GreetingPage /> },
      { path: "/text-length", element: <TextLengthPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
