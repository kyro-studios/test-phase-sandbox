import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchHealth } from "./fetchHealth";
import { HealthCheckError } from "./parseHealthResult";

const validBody = '{"status":"ok","time":"2026-10-16T07:33:00Z"}';

/** fetch をスタブに置き換え、呼び出しを返す */
function stubFetch(impl: (init: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => impl(init ?? {}));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** 中断 (AbortSignal) が来るまで完了しない Promise を返す */
function hangUntilAborted(signal: AbortSignal | undefined): Promise<never> {
  return new Promise((_, reject) => {
    signal?.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted.", "AbortError")),
    );
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchHealth", () => {
  test("/api/health を呼び、正常な結果を返す", async () => {
    const fetchMock = stubFetch(async () => new Response(validBody, { status: 200 }));

    await expect(fetchHealth()).resolves.toEqual({
      status: "ok",
      time: "2026-10-16T07:33:00Z",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("2xx 以外の応答は失敗にする", async () => {
    stubFetch(async () => new Response(validBody, { status: 503 }));

    await expect(fetchHealth()).rejects.toThrow(HealthCheckError);
  });

  test("不正な JSON の応答は失敗にする", async () => {
    stubFetch(async () => new Response("not json", { status: 200 }));

    await expect(fetchHealth()).rejects.toThrow(HealthCheckError);
  });

  test("不正な status の応答は失敗にする", async () => {
    stubFetch(
      async () => new Response('{"status":"OK","time":"2026-10-16T07:33:00Z"}', { status: 200 }),
    );

    await expect(fetchHealth()).rejects.toThrow(HealthCheckError);
  });

  test("不正な time の応答は失敗にする", async () => {
    stubFetch(
      async () =>
        new Response('{"status":"ok","time":"2026-10-16T07:33:00.000Z"}', { status: 200 }),
    );

    await expect(fetchHealth()).rejects.toThrow(HealthCheckError);
  });

  test("接続に失敗したら、失敗として集約する", async () => {
    stubFetch(() => Promise.reject(new TypeError("Failed to fetch")));

    const error = await fetchHealth().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HealthCheckError);
    expect((error as Error).cause).toBeInstanceOf(TypeError);
  });

  test("本文の読み取り中に切断されたら、失敗として集約する", async () => {
    const response = new Response(validBody, { status: 200 });
    vi.spyOn(response, "text").mockRejectedValue(new TypeError("network error"));
    stubFetch(async () => response);

    await expect(fetchHealth()).rejects.toThrow(HealthCheckError);
  });

  test("5 秒を過ぎても応答が完了しなければ、中断して失敗にする", async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetch((init) => hangUntilAborted(init.signal ?? undefined));

    const result = fetchHealth();
    const signal = fetchMock.mock.calls[0][1]?.signal;
    const assertion = expect(result).rejects.toThrow(HealthCheckError);

    await vi.advanceTimersByTimeAsync(4999);
    expect(signal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(signal?.aborted).toBe(true);
    await assertion;
  });

  test("5 秒を過ぎても本文の読み取りが完了しなければ、中断して失敗にする", async () => {
    vi.useFakeTimers();
    stubFetch(async (init) => {
      const response = new Response(validBody, { status: 200 });
      vi.spyOn(response, "text").mockImplementation(() =>
        hangUntilAborted(init.signal ?? undefined),
      );
      return response;
    });

    const assertion = expect(fetchHealth()).rejects.toThrow(HealthCheckError);
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  test("5 秒以内に応答が完了すれば、正常な結果を返す", async () => {
    vi.useFakeTimers();
    stubFetch(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve(new Response(validBody, { status: 200 })), 4999),
        ),
    );

    const result = fetchHealth();
    await vi.advanceTimersByTimeAsync(4999);
    await expect(result).resolves.toEqual({ status: "ok", time: "2026-10-16T07:33:00Z" });
  });
});
