import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { requestGreeting } from "./requestGreeting";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestGreeting", () => {
  test("POST で JSON の name を送り、挨拶を返す", async () => {
    fetchMock.mockResolvedValue(
      new Response('{"greeting":"こんにちは、山田 さん"}', { status: 200 }),
    );

    const outcome = await requestGreeting("  山田  ");

    expect(fetchMock).toHaveBeenCalledWith("/api/greeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "  山田  " }),
    });
    expect(outcome).toEqual({ kind: "greeting", text: "こんにちは、山田 さん" });
  });

  test("400 の誤りの文言を返す", async () => {
    fetchMock.mockResolvedValue(
      new Response('{"error":"名前を入力してください"}', { status: 400 }),
    );

    expect(await requestGreeting("")).toEqual({ kind: "error", text: "名前を入力してください" });
  });

  test("500 は、取得の失敗を返す", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 500 }));

    expect(await requestGreeting("山田")).toEqual({ kind: "failed" });
  });

  test("接続に失敗しても例外を投げず、取得の失敗を返す", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestGreeting("山田")).resolves.toEqual({ kind: "failed" });
  });
});
