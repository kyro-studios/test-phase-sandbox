import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchHealth } from "./fetchHealth";
import { HealthPage } from "./HealthPage";
import { HealthCheckError, type HealthResult } from "./parseHealthResult";

vi.mock("./fetchHealth", () => ({ fetchHealth: vi.fn() }));

const fetchHealthMock = vi.mocked(fetchHealth);

const FIRST_TIME = "2026-10-16T07:33:00Z";
const SECOND_TIME = "2026-10-16T07:34:00Z";

function okResult(time: string): HealthResult {
  return { status: "ok", time };
}

/** テストの側で、取得が完了する時点を決めるための Promise */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function reloadButton() {
  return screen.getByRole("button", { name: "再読み込み" });
}

beforeEach(() => {
  fetchHealthMock.mockReset();
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("HealthPage", () => {
  test("見出しと「再読み込み」ボタンを表示する", () => {
    fetchHealthMock.mockReturnValue(deferred<HealthResult>().promise);

    render(<HealthPage />);

    expect(screen.getByRole("heading", { name: "稼働状況" })).toBeTruthy();
    expect(reloadButton()).toBeTruthy();
  });

  test("取得中は「確認中」を表示し、状態と時刻は表示しない", () => {
    fetchHealthMock.mockReturnValue(deferred<HealthResult>().promise);

    render(<HealthPage />);

    expect(screen.getByText("確認中")).toBeTruthy();
    expect(screen.queryByText("状態")).toBeNull();
    expect(screen.queryByText("時刻")).toBeNull();
  });

  test("正常な結果は、状態と時刻を表示し、確認中の表示は消す", async () => {
    fetchHealthMock.mockResolvedValue(okResult(FIRST_TIME));

    render(<HealthPage />);

    expect(await screen.findByText(FIRST_TIME)).toBeTruthy();
    expect(screen.getByText("状態")).toBeTruthy();
    expect(screen.getByText("ok")).toBeTruthy();
    expect(screen.getByText("時刻")).toBeTruthy();
    expect(screen.queryByText("確認中")).toBeNull();
  });

  test("失敗したら、エラーの文言だけを表示する", async () => {
    fetchHealthMock.mockRejectedValue(new HealthCheckError("サーバーに接続できません"));

    render(<HealthPage />);

    expect(await screen.findByText("サーバーに接続できません")).toBeTruthy();
    expect(screen.queryByText("状態")).toBeNull();
    expect(screen.queryByText("時刻")).toBeNull();
    expect(screen.queryByText("確認中")).toBeNull();
  });

  test("「再読み込み」で取得し直し、表示を更新する", async () => {
    const next = deferred<HealthResult>();
    fetchHealthMock.mockResolvedValueOnce(okResult(FIRST_TIME)).mockReturnValueOnce(next.promise);
    render(<HealthPage />);
    await screen.findByText(FIRST_TIME);

    fireEvent.click(reloadButton());

    // 取得を始めた時点で、前回の時刻を消して「確認中」にする
    expect(screen.getByText("確認中")).toBeTruthy();
    expect(screen.queryByText(FIRST_TIME)).toBeNull();

    await act(async () => {
      next.resolve(okResult(SECOND_TIME));
    });
    expect(await screen.findByText(SECOND_TIME)).toBeTruthy();
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  test("前回が正常でも、「再読み込み」の結果が失敗なら、エラーの文言だけを表示する", async () => {
    fetchHealthMock
      .mockResolvedValueOnce(okResult(FIRST_TIME))
      .mockRejectedValueOnce(new HealthCheckError("サーバーに接続できません"));
    render(<HealthPage />);
    await screen.findByText(FIRST_TIME);

    fireEvent.click(reloadButton());

    expect(await screen.findByText("サーバーに接続できません")).toBeTruthy();
    expect(screen.queryByText(FIRST_TIME)).toBeNull();
    expect(screen.queryByText("状態")).toBeNull();
    expect(screen.queryByText("時刻")).toBeNull();
  });

  test("確認中に「再読み込み」を押しても、新しい取得は始めず、進行中の結果を表示する", async () => {
    const pending = deferred<HealthResult>();
    fetchHealthMock.mockReturnValue(pending.promise);
    render(<HealthPage />);

    expect(reloadButton().getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(reloadButton());
    fireEvent.click(reloadButton());

    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("確認中")).toBeTruthy();

    await act(async () => {
      pending.resolve(okResult(FIRST_TIME));
    });
    expect(await screen.findByText(FIRST_TIME)).toBeTruthy();
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });
});
