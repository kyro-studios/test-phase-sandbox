import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CopyrightFooter } from "./CopyrightFooter";

beforeEach(() => {
  // Date だけを偽物にし、タイマーは本物のまま動かす
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
  vi.useRealTimers();
});

describe("CopyrightFooter", () => {
  test("端末の日付の年で、著作権の表記を表示する", () => {
    vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));

    render(<CopyrightFooter />);

    expect(screen.getByText("© 2026 Kyro Studios")).toBeTruthy();
  });

  test("footer を 1 つ描画し、contentinfo として取れる", () => {
    vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));

    const { container } = render(<CopyrightFooter />);

    expect(container.querySelectorAll("footer")).toHaveLength(1);
    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName).toBe("FOOTER");
    expect(footer.textContent).toBe("© 2026 Kyro Studios");
  });

  test("リンクとボタンが無く、フォーカスも受けない", () => {
    vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));

    render(<CopyrightFooter />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("contentinfo").hasAttribute("tabindex")).toBe(false);
  });

  test("時刻を進めて再描画しても、年は変わらない", () => {
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 59));
    const { rerender } = render(<CopyrightFooter />);

    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));
    rerender(<CopyrightFooter />);

    expect(screen.getByText("© 2026 Kyro Studios")).toBeTruthy();
    expect(screen.queryByText("© 2027 Kyro Studios")).toBeNull();
  });
});
