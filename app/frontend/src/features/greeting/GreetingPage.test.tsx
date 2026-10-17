import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { GreetingOutcome } from "./parseGreetingResponse";
import { requestGreeting } from "./requestGreeting";
import { GreetingPage } from "./GreetingPage";

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

function nameInput() {
  return screen.getByRole("textbox", { name: "名前" }) as HTMLInputElement;
}

function greetButton() {
  return screen.getByRole("button", { name: "挨拶する" }) as HTMLButtonElement;
}

beforeEach(() => {
  requestGreetingMock.mockReset();
});

afterEach(() => {
  // Vitest の globals を使わないため、RTL の自動の後片付けは働かない
  cleanup();
});

describe("GreetingPage", () => {
  test("初期は、見出し、ラベルの付いた空の入力欄、押せるボタンを表示し、結果は表示しない", () => {
    render(<GreetingPage />);

    expect(screen.getByRole("heading", { level: 1, name: "挨拶" })).toBeTruthy();
    expect(nameInput().value).toBe("");
    expect(greetButton().disabled).toBe(false);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(requestGreetingMock).not.toHaveBeenCalled();
  });

  test("入力欄は maxLength を持たず、文字列の入力を受け付ける", () => {
    render(<GreetingPage />);

    fireEvent.change(nameInput(), { target: { value: "a".repeat(21) } });

    expect(nameInput().maxLength).toBe(-1);
    expect(nameInput().value).toBe("a".repeat(21));
  });

  test("取得中はボタンを無効にし、結果は表示しない", () => {
    requestGreetingMock.mockReturnValue(deferred<GreetingOutcome>().promise);
    render(<GreetingPage />);

    fireEvent.click(greetButton());

    expect(greetButton().disabled).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("挨拶は role=status の要素に表示し、入力欄の値は残る", async () => {
    requestGreetingMock.mockResolvedValue({ kind: "greeting", text: "こんにちは、山田 さん" });
    render(<GreetingPage />);
    fireEvent.change(nameInput(), { target: { value: "山田" } });

    fireEvent.click(greetButton());

    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      "こんにちは、山田 さん",
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(greetButton().disabled).toBe(false);
    expect(nameInput().value).toBe("山田");
  });

  test("誤りは role=alert の要素に、API の文言のまま表示する", async () => {
    requestGreetingMock.mockResolvedValue({ kind: "error", text: "名前を入力してください" });
    render(<GreetingPage />);

    fireEvent.click(greetButton());

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "名前を入力してください",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("取得の失敗は role=alert の要素に、固定の文言を表示する", async () => {
    requestGreetingMock.mockResolvedValue({ kind: "failed" });
    render(<GreetingPage />);

    fireEvent.click(greetButton());

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "挨拶を取得できませんでした",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("新しい結果は、前の結果を置き換え、表示は 1 つだけになる", async () => {
    requestGreetingMock
      .mockResolvedValueOnce({ kind: "greeting", text: "こんにちは、山田 さん" })
      .mockResolvedValueOnce({ kind: "error", text: "名前を入力してください" });
    render(<GreetingPage />);
    fireEvent.change(nameInput(), { target: { value: "山田" } });
    fireEvent.click(greetButton());
    await screen.findByRole("status");

    fireEvent.change(nameInput(), { target: { value: "" } });
    fireEvent.click(greetButton());

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "名前を入力してください",
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("こんにちは、山田 さん")).toBeNull();
  });

  test("取得の途中で押し直しても、新しい取得は始めない", async () => {
    const pending = deferred<GreetingOutcome>();
    requestGreetingMock.mockReturnValue(pending.promise);
    render(<GreetingPage />);

    fireEvent.click(greetButton());
    fireEvent.click(greetButton());

    expect(requestGreetingMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve({ kind: "failed" });
    });
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "挨拶を取得できませんでした",
    );
  });

  test("結果の文字列は HTML として解釈せず、テキストとして表示する", async () => {
    requestGreetingMock.mockResolvedValue({
      kind: "greeting",
      text: "こんにちは、<b>太字</b> さん",
    });
    const { container } = render(<GreetingPage />);

    fireEvent.click(greetButton());

    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      "こんにちは、<b>太字</b> さん",
    );
    expect(container.querySelector("b")).toBeNull();
  });
});
