import { HealthCheckError, parseHealthResult, type HealthResult } from "./parseHealthResult";

const HEALTH_PATH = "/api/health";
// 仕様書 4.1 と 5: 5 秒を過ぎても応答が完了しなければ、取得を中断して失敗にする
const TIMEOUT_MS = 5000;

/**
 * 同じサーバーの `/api/health` を呼び、結果を返す。
 * 接続失敗、通信の切断、2xx 以外、不正な本文、5 秒の超過は、すべて HealthCheckError にまとめる。
 * `signal` が中断されたとき (アンマウントなど) も、要求を止めて HealthCheckError を投げる。
 */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResult> {
  const controller = new AbortController();
  // 本文の読み取りまで含めて 5 秒で打ち切るため、タイマーは finally で消す
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // 呼び出し元の中断を、この要求の中断に伝える
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  }
  signal?.addEventListener("abort", abortFromCaller);
  try {
    const response = await fetch(HEALTH_PATH, { signal: controller.signal });
    const body = await response.text();
    return parseHealthResult(response.status, body);
  } catch (error) {
    if (error instanceof HealthCheckError) {
      throw error;
    }
    throw new HealthCheckError("サーバーに接続できません", { cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
