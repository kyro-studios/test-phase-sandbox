import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { router } from "./router";

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
  vi.unstubAllGlobals();
});

test("ルートの経路が定義されている", () => {
  const memory = createMemoryRouter(router.routes, { initialEntries: ["/"] });
  render(<RouterProvider router={memory} />);
  expect(screen.getByText("アプリケーション")).toBeTruthy();
});

test("/health の経路が稼働状況の画面に結びついている", async () => {
  const fetchMock = vi.fn(
    async () => new Response('{"status":"ok","time":"2026-10-16T07:33:00Z"}', { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const memory = createMemoryRouter(router.routes, { initialEntries: ["/health"] });
  render(<RouterProvider router={memory} />);

  expect(screen.getByRole("heading", { name: "稼働状況" })).toBeTruthy();
  expect(await screen.findByText("2026-10-16T07:33:00Z")).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/health",
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});
