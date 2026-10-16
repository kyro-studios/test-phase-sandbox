import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fetchHealth } from "./fetchHealth";
import { HealthCheckError, type HealthResult } from "./parseHealthResult";
import { useHealthCheck } from "./useHealthCheck";

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

beforeEach(() => {
  fetchHealthMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useHealthCheck", () => {
  test("画面を開くと 1 回取得し、正常の状態と時刻を表示する", async () => {
    fetchHealthMock.mockResolvedValue(okResult(FIRST_TIME));

    const { result } = renderHook(() => useHealthCheck());
    expect(result.current.state).toBe("checking");

    await waitFor(() => expect(result.current.state).toBe("ok"));
    expect(result.current).toMatchObject({ state: "ok", time: FIRST_TIME });
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });

  test("取得に失敗したら、接続できない状態にし、時刻を持たない", async () => {
    fetchHealthMock.mockRejectedValue(new HealthCheckError("サーバーに接続できません"));

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => expect(result.current.state).toBe("unreachable"));
    expect(result.current).not.toHaveProperty("time");
  });

  test("自動の取得 (ポーリング) はせず、開いたときの 1 回だけ取得する", async () => {
    vi.useFakeTimers();
    fetchHealthMock.mockResolvedValue(okResult(FIRST_TIME));

    const { result } = renderHook(() => useHealthCheck());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(result.current.state).toBe("ok");
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });

  test("取得中に reload を呼んでも、新しい取得を始めず、進行中の結果を表示する", async () => {
    const pending = deferred<HealthResult>();
    fetchHealthMock.mockReturnValue(pending.promise);

    const { result } = renderHook(() => useHealthCheck());
    act(() => {
      result.current.reload();
    });

    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe("checking");

    await act(async () => {
      pending.resolve(okResult(FIRST_TIME));
    });
    expect(result.current).toMatchObject({ state: "ok", time: FIRST_TIME });
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });

  test("reload で前回の結果を消して確認中にし、取得後に表示を更新する", async () => {
    fetchHealthMock.mockResolvedValueOnce(okResult(FIRST_TIME));
    const { result } = renderHook(() => useHealthCheck());
    await waitFor(() => expect(result.current).toMatchObject({ state: "ok", time: FIRST_TIME }));

    const next = deferred<HealthResult>();
    fetchHealthMock.mockReturnValueOnce(next.promise);
    act(() => {
      result.current.reload();
    });

    // 取得を始めた時点で、前回の状態と時刻を消す
    expect(result.current).toEqual({ state: "checking", reload: expect.any(Function) });

    await act(async () => {
      next.resolve(okResult(SECOND_TIME));
    });
    expect(result.current).toMatchObject({ state: "ok", time: SECOND_TIME });
    expect(fetchHealthMock).toHaveBeenCalledTimes(2);
  });

  test("前回が正常でも、reload の結果が失敗なら接続できない状態になり、前回の時刻を残さない", async () => {
    fetchHealthMock
      .mockResolvedValueOnce(okResult(FIRST_TIME))
      .mockRejectedValueOnce(new HealthCheckError("サーバーに接続できません"));
    const { result } = renderHook(() => useHealthCheck());
    await waitFor(() => expect(result.current.state).toBe("ok"));

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.state).toBe("unreachable"));
    expect(result.current).toEqual({ state: "unreachable", reload: expect.any(Function) });
  });

  test("アンマウントすると、進行中の取得を中断する", async () => {
    fetchHealthMock.mockReturnValue(deferred<HealthResult>().promise);

    const { unmount } = renderHook(() => useHealthCheck());
    const signal = fetchHealthMock.mock.calls[0][0];
    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
