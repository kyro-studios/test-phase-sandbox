import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { expect, test } from "vitest";
import { router } from "./router";

test("ルートの経路が定義されている", () => {
  const memory = createMemoryRouter(router.routes, { initialEntries: ["/"] });
  render(<RouterProvider router={memory} />);
  expect(screen.getByText("アプリケーション")).toBeTruthy();
});
