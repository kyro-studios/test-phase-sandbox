import { parseGreetingResponse, type GreetingOutcome } from "./parseGreetingResponse";

const GREETING_PATH = "/api/greeting";

/**
 * `POST /api/greeting` を呼び、結果を返す (アーキテクチャ設計 2.1)。
 * 例外は投げない。接続の失敗や本文の読み取りの失敗も `failed` にする。待ち時間の上限は設けない (仕様書 5.4)。
 * 名前は前後の空白を含んだまま送る。除去と確かめは API が行う (仕様書 5.2)。
 */
export async function requestGreeting(name: string): Promise<GreetingOutcome> {
  try {
    const response = await fetch(GREETING_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const body = await response.text();
    return parseGreetingResponse(response.status, body);
  } catch {
    return { kind: "failed" };
  }
}
