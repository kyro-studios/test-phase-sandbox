import { describe, expect, test } from "vitest";
import { HealthCheckError, parseHealthResult } from "./parseHealthResult";

const validBody = '{"status":"ok","time":"2026-10-16T07:33:00Z"}';

describe("parseHealthResult", () => {
  test("正常な応答から、状態と時刻を返す", () => {
    expect(parseHealthResult(200, validBody)).toEqual({
      status: "ok",
      time: "2026-10-16T07:33:00Z",
    });
  });

  test("2xx の範囲は成功として扱う", () => {
    expect(parseHealthResult(299, validBody).status).toBe("ok");
  });

  test.each([199, 300, 404, 500])("2xx 以外の状態コード (%i) は失敗にする", (httpStatus) => {
    expect(() => parseHealthResult(httpStatus, validBody)).toThrow(HealthCheckError);
  });

  test.each([
    ["空の本文", ""],
    ["途中で切れた JSON", '{"status":'],
    ["JSON ではない本文", "<html>502 Bad Gateway</html>"],
    ["JSON の文字列", '"ok"'],
    ["JSON の null", "null"],
  ])("JSON として読めない本文 (%s) は失敗にする", (_, body) => {
    expect(() => parseHealthResult(200, body)).toThrow(HealthCheckError);
  });

  test.each([
    ["大文字の OK", '{"status":"OK","time":"2026-10-16T07:33:00Z"}'],
    ["前後に空白がある ok", '{"status":"ok ","time":"2026-10-16T07:33:00Z"}'],
    ["別の値", '{"status":"error","time":"2026-10-16T07:33:00Z"}'],
    ["status が無い", '{"time":"2026-10-16T07:33:00Z"}'],
    ["status が文字列ではない", '{"status":true,"time":"2026-10-16T07:33:00Z"}'],
  ])("status が ok でない (%s) は失敗にする", (_, body) => {
    expect(() => parseHealthResult(200, body)).toThrow(HealthCheckError);
  });

  test.each([
    ["小数秒がある", "2026-10-16T07:33:00.000Z"],
    ["UTC 以外のオフセット", "2026-10-16T16:33:00+09:00"],
    ["T の代わりに空白", "2026-10-16 07:33:00Z"],
    ["秒が無い", "2026-10-16T07:33Z"],
    ["末尾が Z ではない", "2026-10-16T07:33:00"],
    ["末尾に改行がある", "2026-10-16T07:33:00Z\n"],
    ["時刻が無い", undefined],
    ["数値", 1781595180],
  ])("time の形式が 2.2 に合わない (%s) は失敗にする", (_, time) => {
    const body = JSON.stringify({ status: "ok", time });
    expect(() => parseHealthResult(200, body)).toThrow(HealthCheckError);
  });

  test("失敗の理由を cause に残す (JSON の構文エラー)", () => {
    let caught: unknown;
    try {
      parseHealthResult(200, "{");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(HealthCheckError);
    expect((caught as Error).cause).toBeInstanceOf(SyntaxError);
  });
});
