import { parseTextLengthResponse, type TextLengthOutcome } from "./parseTextLengthResponse";

const TEXT_LENGTH_PATH = "/api/text-length";

/**
 * `POST /api/text-length` を呼び、結果を返す (アーキテクチャ設計 2.1)。
 * 例外は投げない。接続の失敗や本文の読み取りの失敗も `failed` にする。待ち時間の上限は設けない (仕様書 5.4)。
 * 文は前後の空白を含んだまま送る。変換と確かめは API が行う (仕様書 5.2)。
 */
export async function requestTextLength(text: string): Promise<TextLengthOutcome> {
  try {
    const response = await fetch(TEXT_LENGTH_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const body = await response.text();
    return parseTextLengthResponse(response.status, body);
  } catch {
    return { kind: "failed" };
  }
}
