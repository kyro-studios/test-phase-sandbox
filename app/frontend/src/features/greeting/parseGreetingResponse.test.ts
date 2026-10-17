import { describe, expect, test } from "vitest";
import { parseGreetingResponse } from "./parseGreetingResponse";

describe("parseGreetingResponse", () => {
  test("200 で greeting が文字列なら、挨拶として返す", () => {
    expect(parseGreetingResponse(200, '{"greeting":"こんにちは、山田 さん"}')).toEqual({
      kind: "greeting",
      text: "こんにちは、山田 さん",
    });
  });

  test("400 で error が文字列なら、誤りとして返す", () => {
    expect(parseGreetingResponse(400, '{"error":"名前を入力してください"}')).toEqual({
      kind: "error",
      text: "名前を入力してください",
    });
  });

  test("200 で greeting が無ければ、取得の失敗にする", () => {
    expect(parseGreetingResponse(200, '{"error":"名前を入力してください"}')).toEqual({
      kind: "failed",
    });
  });

  test("200 で greeting が文字列でなければ、取得の失敗にする", () => {
    expect(parseGreetingResponse(200, '{"greeting":null}')).toEqual({ kind: "failed" });
  });

  test("400 で error が無ければ、取得の失敗にする", () => {
    expect(parseGreetingResponse(400, '{"greeting":"こんにちは、山田 さん"}')).toEqual({
      kind: "failed",
    });
  });

  test("500 は、本文が誤りの形でも取得の失敗にする", () => {
    expect(parseGreetingResponse(500, '{"error":"名前を入力してください"}')).toEqual({
      kind: "failed",
    });
    expect(parseGreetingResponse(500, "")).toEqual({ kind: "failed" });
  });

  test("JSON として読めない本文は、取得の失敗にする", () => {
    expect(parseGreetingResponse(200, "<html>こんにちは、山田 さん</html>")).toEqual({
      kind: "failed",
    });
    expect(parseGreetingResponse(400, "名前を入力してください")).toEqual({ kind: "failed" });
  });

  test.each([["null"], ["[]"], ['"こんにちは"'], ["1"]])(
    "JSON のオブジェクトでない本文 (%s) は、取得の失敗にする",
    (body) => {
      expect(parseGreetingResponse(200, body)).toEqual({ kind: "failed" });
    },
  );
});
