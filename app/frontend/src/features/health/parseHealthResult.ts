/** 稼働状況の結果。`status` は常に `ok` (仕様書 3.1、概念モデル C-2) */
export type HealthResult = { status: "ok"; time: string };

/** 取得に失敗したことを表す。失敗の理由は cause に残す */
export class HealthCheckError extends Error {}

// 仕様書 2.2 の時刻の形式: YYYY-MM-DDTHH:mm:ssZ (秒まで、小数秒なし、末尾は Z)
const TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/**
 * API の応答 (状態コードと本文) を検証し、結果を返す。想定と違えば HealthCheckError を投げる。
 * 項目が余分に付いていても、`status` と `time` が正しければ受け付ける。
 */
export function parseHealthResult(httpStatus: number, body: string): HealthResult {
  if (httpStatus < 200 || httpStatus > 299) {
    throw new HealthCheckError(`状態コードが 2xx ではありません: ${httpStatus}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch (error) {
    throw new HealthCheckError("本文が JSON として読めません", { cause: error });
  }
  if (typeof json !== "object" || json === null) {
    throw new HealthCheckError("本文が JSON のオブジェクトではありません");
  }

  const { status, time } = json as { status?: unknown; time?: unknown };
  // 大文字と小文字を区別する
  if (status !== "ok") {
    throw new HealthCheckError(`status が ok ではありません: ${String(status)}`);
  }
  if (typeof time !== "string" || !TIME_PATTERN.test(time)) {
    throw new HealthCheckError(`time の形式が想定と違います: ${String(time)}`);
  }

  return { status: "ok", time };
}
