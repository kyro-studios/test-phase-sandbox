import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { requestTextLength } from "./requestTextLength";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestTextLength", () => {
  test("POST で JSON の text を送り、文字数を返す", async () => {
    fetchMock.mockResolvedValue(new Response('{"length":3}', { status: 200 }));

    const outcome = await requestTextLength(" あいう ");

    expect(fetchMock).toHaveBeenCalledWith("/api/text-length", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: " あいう " }),
    });
    expect(outcome).toEqual({ kind: "length", length: 3 });
  });

  test("400 の誤りの文言を返す", async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"文を入力してください"}', { status: 400 }));

    expect(await requestTextLength("")).toEqual({ kind: "error", text: "文を入力してください" });
  });

  test("500 は、取得の失敗を返す", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }));

    expect(await requestTextLength("あいう")).toEqual({ kind: "failed" });
  });

  test("接続に失敗しても例外を投げず、取得の失敗を返す", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestTextLength("あいう")).resolves.toEqual({ kind: "failed" });
  });
});
