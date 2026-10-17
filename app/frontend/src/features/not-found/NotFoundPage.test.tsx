import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { NotFoundPage } from "./NotFoundPage";

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("NotFoundPage", () => {
  test("「ページが見つかりません」を、main の中に表示する", () => {
    render(<NotFoundPage />);

    expect(within(screen.getByRole("main")).getByText("ページが見つかりません")).toBeTruthy();
  });

  test("main のランドマークを 1 つだけ持つ", () => {
    render(<NotFoundPage />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  test("リンクとボタンを置かない", () => {
    render(<NotFoundPage />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
