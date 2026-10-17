import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { requestGreeting } from "./requestGreeting";
import type { GreetingOutcome } from "./parseGreetingResponse";
import { useGreeting } from "./useGreeting";

vi.mock("./requestGreeting", () => ({ requestGreeting: vi.fn() }));

const requestGreetingMock = vi.mocked(requestGreeting);

/** テストの側で、取得が完了する時点を決めるための Promise */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  requestGreetingMock.mockReset();
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("useGreeting", () => {
  test("初期は idle で、入力欄は空", () => {
    const { result } = renderHook(() => useGreeting());

    expect(result.current.screen).toEqual({ state: "idle" });
    expect(result.current.name).toBe("");
  });

  test("挨拶の結果を、そのまま挨拶の状態にする", async () => {
    requestGreetingMock.mockResolvedValue({ kind: "greeting", text: "こんにちは、山田 さん" });
    const { result } = renderHook(() => useGreeting());
    act(() => result.current.setName("山田"));

    await act(async () => result.current.greet());

    expect(requestGreetingMock).toHaveBeenCalledWith("山田");
    expect(result.current.screen).toEqual({ state: "greeting", text: "こんにちは、山田 さん" });
  });

  test("誤りと取得の失敗を、対応する状態にする", async () => {
    requestGreetingMock.mockResolvedValueOnce({ kind: "error", text: "名前を入力してください" });
    const { result } = renderHook(() => useGreeting());
    await act(async () => result.current.greet());
    expect(result.current.screen).toEqual({ state: "error", text: "名前を入力してください" });

    requestGreetingMock.mockResolvedValueOnce({ kind: "failed" });
    await act(async () => result.current.greet());
    expect(result.current.screen).toEqual({ state: "failed" });
  });

  test("取得を始めると loading になり、前の結果は消える", async () => {
    requestGreetingMock.mockResolvedValueOnce({ kind: "greeting", text: "こんにちは、山田 さん" });
    const next = deferred<GreetingOutcome>();
    requestGreetingMock.mockReturnValueOnce(next.promise);
    const { result } = renderHook(() => useGreeting());
    await act(async () => result.current.greet());

    act(() => result.current.greet());

    expect(result.current.screen).toEqual({ state: "loading" });
  });

  test("取得中は新しい取得を始めない", async () => {
    requestGreetingMock.mockReturnValue(deferred<GreetingOutcome>().promise);
    const { result } = renderHook(() => useGreeting());

    act(() => result.current.greet());
    act(() => result.current.greet());

    expect(requestGreetingMock).toHaveBeenCalledTimes(1);
  });

  test("結果が返ると、前の結果を新しい結果で置き換える", async () => {
    requestGreetingMock
      .mockResolvedValueOnce({ kind: "error", text: "名前を入力してください" })
      .mockResolvedValueOnce({ kind: "greeting", text: "こんにちは、山田 さん" });
    const { result } = renderHook(() => useGreeting());
    await act(async () => result.current.greet());

    act(() => result.current.setName("山田"));
    await act(async () => result.current.greet());

    expect(result.current.screen).toEqual({ state: "greeting", text: "こんにちは、山田 さん" });
  });

  test("どの結果でも、入力欄の値は消さない", async () => {
    requestGreetingMock.mockResolvedValue({ kind: "failed" });
    const { result } = renderHook(() => useGreeting());
    act(() => result.current.setName("山田"));

    await act(async () => result.current.greet());

    expect(result.current.screen).toEqual({ state: "failed" });
    expect(result.current.name).toBe("山田");
  });

  test("アンマウントの後に届いた応答は、画面に反映しない", async () => {
    const pending = deferred<GreetingOutcome>();
    requestGreetingMock.mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() => useGreeting());
    act(() => result.current.greet());

    unmount();
    await act(async () => {
      pending.resolve({ kind: "greeting", text: "こんにちは、山田 さん" });
    });

    expect(result.current.screen).toEqual({ state: "loading" });
  });
});
