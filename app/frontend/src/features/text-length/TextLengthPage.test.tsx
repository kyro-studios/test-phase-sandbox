import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { TextLengthOutcome } from "./parseTextLengthResponse";
import { requestTextLength } from "./requestTextLength";
import { TextLengthPage } from "./TextLengthPage";

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

function textInput() {
  return screen.getByRole("textbox", { name: "文" }) as HTMLInputElement;
}

function countButton() {
  return screen.getByRole("button", { name: "数える" }) as HTMLButtonElement;
}

beforeEach(() => {
  requestTextLengthMock.mockReset();
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("TextLengthPage", () => {
  test("初期は、見出し、ラベルの付いた空の入力欄、押せるボタンを表示し、結果は表示しない", () => {
    render(<TextLengthPage />);

    expect(screen.getByRole("heading", { level: 1, name: "文字数" })).toBeTruthy();
    expect(textInput().value).toBe("");
    expect(countButton().disabled).toBe(false);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(requestTextLengthMock).not.toHaveBeenCalled();
  });

  test("入力欄は maxLength を持たず、文字列の入力を受け付ける", () => {
    render(<TextLengthPage />);

    fireEvent.change(textInput(), { target: { value: "a".repeat(201) } });

    expect(textInput().maxLength).toBe(-1);
    expect(textInput().value).toBe("a".repeat(201));
  });

  test("取得中はボタンを無効にし、結果は表示しない", () => {
    requestTextLengthMock.mockReturnValue(deferred<TextLengthOutcome>().promise);
    render(<TextLengthPage />);

    fireEvent.click(countButton());

    expect(countButton().disabled).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("文字数は role=status の要素に、<文字数> 文字 の形で表示し、入力欄の値は残る", async () => {
    requestTextLengthMock.mockResolvedValue({ kind: "length", length: 3 });
    render(<TextLengthPage />);
    fireEvent.change(textInput(), { target: { value: "あいう" } });

    fireEvent.click(countButton());

    expect(await screen.findByRole("status")).toHaveProperty("textContent", "3 文字");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(countButton().disabled).toBe(false);
    expect(textInput().value).toBe("あいう");
  });

  test("誤りは role=alert の要素に、API の文言のまま表示する", async () => {
    requestTextLengthMock.mockResolvedValue({ kind: "error", text: "文を入力してください" });
    render(<TextLengthPage />);

    fireEvent.click(countButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "文を入力してください");
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("取得の失敗は role=alert の要素に、固定の文言を表示する", async () => {
    requestTextLengthMock.mockResolvedValue({ kind: "failed" });
    render(<TextLengthPage />);

    fireEvent.click(countButton());

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "文字数を取得できませんでした",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("新しい結果は、前の結果を置き換え、表示は 1 つだけになる", async () => {
    requestTextLengthMock
      .mockResolvedValueOnce({ kind: "error", text: "文を入力してください" })
      .mockResolvedValueOnce({ kind: "length", length: 3 });
    render(<TextLengthPage />);
    fireEvent.click(countButton());
    await screen.findByRole("alert");

    fireEvent.change(textInput(), { target: { value: "あいう" } });
    fireEvent.click(countButton());

    expect(await screen.findByRole("status")).toHaveProperty("textContent", "3 文字");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("文を入力してください")).toBeNull();
  });

  test("取得の途中で押し直しても、新しい取得は始めない", async () => {
    const pending = deferred<TextLengthOutcome>();
    requestTextLengthMock.mockReturnValue(pending.promise);
    render(<TextLengthPage />);

    fireEvent.click(countButton());
    fireEvent.click(countButton());

    expect(requestTextLengthMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve({ kind: "failed" });
    });
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "文字数を取得できませんでした",
    );
  });
});
