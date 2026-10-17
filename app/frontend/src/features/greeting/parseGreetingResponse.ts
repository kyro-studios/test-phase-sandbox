/**
 * API の応答を、画面が扱う結果にする (アーキテクチャ設計 2.1、仕様書 5.2)。
 * `greeting` は挨拶の文、`error` は API が返した誤りの文言。`failed` は取得の失敗にまとめる。
 */
export type GreetingOutcome =
  | { kind: "greeting"; text: string }
  | { kind: "error"; text: string }
  | { kind: "failed" };

/** 本文を JSON のオブジェクトとして読む。読めない、またはオブジェクトでなければ null */
function readObject(body: string): Record<string, unknown> | null {
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return null;
  }
  return typeof json === "object" && json !== null && !Array.isArray(json)
    ? (json as Record<string, unknown>)
    : null;
}

/**
 * 状態コードと本文から結果を決める。判定は仕様書 5.2 の 4 のとおり。
 * 200 で `greeting` が文字列なら挨拶、400 で `error` が文字列なら誤り、それ以外はすべて `failed`。
 */
export function parseGreetingResponse(httpStatus: number, body: string): GreetingOutcome {
  const json = readObject(body);
  const greeting = json?.greeting;
  const error = json?.error;

  if (httpStatus === 200 && typeof greeting === "string") {
    return { kind: "greeting", text: greeting };
  }
  if (httpStatus === 400 && typeof error === "string") {
    return { kind: "error", text: error };
  }
  return { kind: "failed" };
}
