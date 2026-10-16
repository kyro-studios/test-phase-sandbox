import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHealth } from "./fetchHealth";

/**
 * 画面が持つ状態 (仕様書 4.5)。`ok` は画面の状態であり、結果の `status` の値とは別に扱う (概念モデル C-11)。
 * 時刻は受け取った文字列のまま保持する (仕様書 4.1)。
 * 取得を始めると、前回の状態と時刻、エラーの表示は、すべて `checking` で置き換える。
 */
export type HealthScreenState =
  | { state: "checking" }
  | { state: "ok"; time: string }
  | { state: "unreachable" };

/**
 * 稼働状況の画面の状態と、「再読み込み」を提供する。
 * 画面を開いたときに 1 回だけ取得し、自動の取得 (ポーリング) はしない (仕様書 4.3)。
 */
export function useHealthCheck(): HealthScreenState & { reload: () => void } {
  const [screen, setScreen] = useState<HealthScreenState>({ state: "checking" });
  // 進行中の取得。null は取得していないことを表す。再描画を待たずに読めるよう state ではなく ref で持つ
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    // 取得中は新しい取得を始めない (仕様書 4.2、概念モデル C-12)
    if (inFlight.current !== null) {
      return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    setScreen({ state: "checking" });

    const finish = (next: HealthScreenState) => {
      // アンマウントで中断された取得の結果は、画面に反映しない
      if (controller.signal.aborted) {
        return;
      }
      inFlight.current = null;
      setScreen(next);
    };
    fetchHealth(controller.signal).then(
      (result) => finish({ state: "ok", time: result.time }),
      () => finish({ state: "unreachable" }),
    );
  }, []);

  useEffect(() => {
    load();
    return () => {
      // アンマウントで、進行中の取得を中断する
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [load]);

  return { ...screen, reload: load };
}
