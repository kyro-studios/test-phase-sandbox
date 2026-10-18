import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { TextLengthOutcome } from "./parseTextLengthResponse";
import { requestTextLength } from "./requestTextLength";
import { useTextLength } from "./useTextLength";

vi.mock("./requestTextLength", () => ({ requestTextLength: vi.fn() }));

const requestTextLengthMock = vi.mocked(requestTextLength);

/** テストの側で、取得が完了する時点を決めるための Promise */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  requestTextLengthMock.mockReset();
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("useTextLength", () => {
  test("初期は idle で、入力欄は空", () => {
    const { result } = renderHook(() => useTextLength());

    expect(result.current.screen).toEqual({ state: "idle" });
    expect(result.current.text).toBe("");
  });

  test("文字数の結果を、そのまま文字数の状態にする", async () => {
    requestTextLengthMock.mockResolvedValue({ kind: "length", length: 3 });
    const { result } = renderHook(() => useTextLength());
    act(() => result.current.setText("あいう"));

    await act(async () => result.current.count());

    expect(requestTextLengthMock).toHaveBeenCalledWith("あいう");
    expect(result.current.screen).toEqual({ state: "length", length: 3 });
  });

  test("誤りと取得の失敗を、対応する状態にする", async () => {
    requestTextLengthMock.mockResolvedValueOnce({ kind: "error", text: "文を入力してください" });
    const { result } = renderHook(() => useTextLength());
    await act(async () => result.current.count());
    expect(result.current.screen).toEqual({ state: "error", message: "文を入力してください" });

    requestTextLengthMock.mockResolvedValueOnce({ kind: "failed" });
    await act(async () => result.current.count());
    expect(result.current.screen).toEqual({ state: "failed" });
  });

  test("取得を始めると loading になり、前の結果は消える", async () => {
    requestTextLengthMock.mockResolvedValueOnce({ kind: "length", length: 3 });
    requestTextLengthMock.mockReturnValueOnce(deferred<TextLengthOutcome>().promise);
    const { result } = renderHook(() => useTextLength());
    await act(async () => result.current.count());

    act(() => result.current.count());

    expect(result.current.screen).toEqual({ state: "loading" });
  });

  test("取得中は新しい取得を始めない", async () => {
    requestTextLengthMock.mockReturnValue(deferred<TextLengthOutcome>().promise);
    const { result } = renderHook(() => useTextLength());

    act(() => result.current.count());
    act(() => result.current.count());

    expect(requestTextLengthMock).toHaveBeenCalledTimes(1);
  });

  test("結果が返ると、前の結果を新しい結果で置き換える", async () => {
    requestTextLengthMock
      .mockResolvedValueOnce({ kind: "error", text: "文を入力してください" })
      .mockResolvedValueOnce({ kind: "length", length: 3 });
    const { result } = renderHook(() => useTextLength());
    await act(async () => result.current.count());

    act(() => result.current.setText("あいう"));
    await act(async () => result.current.count());

    expect(result.current.screen).toEqual({ state: "length", length: 3 });
  });

  test("どの結果でも、入力欄の値は消さない", async () => {
    requestTextLengthMock.mockResolvedValue({ kind: "failed" });
    const { result } = renderHook(() => useTextLength());
    act(() => result.current.setText("あいう"));

    await act(async () => result.current.count());

    expect(result.current.screen).toEqual({ state: "failed" });
    expect(result.current.text).toBe("あいう");
  });

  test("アンマウントの後に届いた応答は、画面に反映しない", async () => {
    const pending = deferred<TextLengthOutcome>();
    requestTextLengthMock.mockReturnValue(pending.promise);
    const { result, unmount } = renderHook(() => useTextLength());
    act(() => result.current.count());

    unmount();
    await act(async () => {
      pending.resolve({ kind: "length", length: 3 });
    });

    expect(result.current.screen).toEqual({ state: "loading" });
  });
});
