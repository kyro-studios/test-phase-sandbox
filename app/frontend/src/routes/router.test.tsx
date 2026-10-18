import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { router } from "./router";

const HEALTH_TIME = "2026-10-16T07:33:00Z";
const fetchMock = vi.fn(
  async () => new Response(`{"status":"ok","time":"${HEALTH_TIME}"}`, { status: 200 }),
);

beforeEach(() => {
  // Date だけを偽物にし、タイマーは本物のまま動かす
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function renderAt(path: string) {
  const memory = createMemoryRouter(router.routes, { initialEntries: [path] });
  render(<RouterProvider router={memory} />);
  return memory;
}

/** アプリ内の遷移を、描画の完了まで待つ */
async function navigate(memory: ReturnType<typeof createMemoryRouter>, to: string) {
  await act(async () => {
    await memory.navigate(to);
  });
}

/** ブラウザーの戻る (-1) を、描画の完了まで待つ */
async function goBack(memory: ReturnType<typeof createMemoryRouter>) {
  await act(async () => {
    await memory.navigate(-1);
  });
}

test("ルートの経路が定義されている", () => {
  renderAt("/");
  expect(screen.getByText("アプリケーション")).toBeTruthy();
});

test("/health の経路が稼働状況の画面に結びついている", async () => {
  renderAt("/health");

  expect(screen.getByRole("heading", { name: "稼働状況" })).toBeTruthy();
  expect(await screen.findByText(HEALTH_TIME)).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/health",
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});

test("/greeting の経路が挨拶の画面に結びついている", () => {
  renderAt("/greeting");

  expect(screen.getByRole("heading", { name: "挨拶" })).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("/text-length の経路が文字数の画面に結びついている", () => {
  renderAt("/text-length");

  expect(screen.getByRole("heading", { name: "文字数" })).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
});

describe("全画面共通の枠 (RootLayout)", () => {
  test.each([
    ["/", "アプリケーション"],
    ["/health", "稼働状況"],
    ["/greeting", "挨拶"],
    ["/text-length", "文字数"],
    ["/存在しないパス", "ページが見つかりません"],
  ])("%s で、フッターの領域が 1 つあり、年の表記を含む", async (path, heading) => {
    renderAt(path);

    expect(await screen.findByText(heading)).toBeTruthy();
    const footers = screen.getAllByRole("contentinfo");
    expect(footers).toHaveLength(1);
    expect(footers[0].tagName).toBe("FOOTER");
    expect(within(footers[0]).getByText("© 2026 Kyro Studios")).toBeTruthy();
  });

  test.each([["/"], ["/health"], ["/greeting"], ["/text-length"], ["/存在しないパス"]])(
    "%s で、フッターは <main> の外にある",
    (path) => {
      renderAt(path);

      expect(screen.getByRole("contentinfo").closest("main")).toBeNull();
    },
  );

  test("存在しないパスでは、NotFoundPage を表示する", () => {
    renderAt("/no-such-page");

    expect(within(screen.getByRole("main")).getByText("ページが見つかりません")).toBeTruthy();
  });

  test("画面を切り替えると、年を読み直す", async () => {
    const memory = renderAt("/");
    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));

    await navigate(memory, "/health");

    expect(await screen.findByText(HEALTH_TIME)).toBeTruthy();
    expect(screen.getByText("© 2027 Kyro Studios")).toBeTruthy();
    expect(screen.queryByText("© 2026 Kyro Studios")).toBeNull();
  });

  test("戻る・進むでも、年を読み直す", async () => {
    const memory = renderAt("/");
    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));
    await navigate(memory, "/health");
    await screen.findByText(HEALTH_TIME);

    vi.setSystemTime(new Date(2028, 0, 1, 0, 0, 0));
    await goBack(memory);

    expect(screen.getByText("アプリケーション")).toBeTruthy();
    expect(screen.getByText("© 2028 Kyro Studios")).toBeTruthy();
  });

  test("同じ画面へ遷移し直しても、年を読み直す", async () => {
    const memory = renderAt("/");
    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));

    await navigate(memory, "/");

    expect(screen.getByText("© 2027 Kyro Studios")).toBeTruthy();
    expect(screen.queryByText("© 2026 Kyro Studios")).toBeNull();
  });

  test("/health の「再読み込み」を押しても、年は変わらない", async () => {
    renderAt("/health");
    await screen.findByText(HEALTH_TIME);

    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0));
    fireEvent.click(screen.getByRole("button", { name: "再読み込み" }));

    expect(await screen.findByText(HEALTH_TIME)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("© 2026 Kyro Studios")).toBeTruthy();
    expect(screen.queryByText("© 2027 Kyro Studios")).toBeNull();
  });
});
