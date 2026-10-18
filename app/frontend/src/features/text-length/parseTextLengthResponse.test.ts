import { describe, expect, test } from "vitest";
import { parseTextLengthResponse } from "./parseTextLengthResponse";

describe("parseTextLengthResponse", () => {
  test("200 で length が数なら、文字数として返す", () => {
    expect(parseTextLengthResponse(200, '{"length":3}')).toEqual({ kind: "length", length: 3 });
  });

  test("400 で error が文字列なら、誤りとして返す", () => {
    expect(parseTextLengthResponse(400, '{"error":"文を入力してください"}')).toEqual({
      kind: "error",
      text: "文を入力してください",
    });
  });

  test("200 で length が無ければ、取得の失敗にする", () => {
    expect(parseTextLengthResponse(200, '{"error":"文を入力してください"}')).toEqual({
      kind: "failed",
    });
  });

  test("200 で length が数でなければ、取得の失敗にする", () => {
    expect(parseTextLengthResponse(200, '{"length":"3"}')).toEqual({ kind: "failed" });
    expect(parseTextLengthResponse(200, '{"length":null}')).toEqual({ kind: "failed" });
  });

  test("400 で error が無ければ、取得の失敗にする", () => {
    expect(parseTextLengthResponse(400, '{"length":3}')).toEqual({ kind: "failed" });
  });

  test("400 で error が文字列でなければ、取得の失敗にする", () => {
    expect(parseTextLengthResponse(400, '{"error":1}')).toEqual({ kind: "failed" });
  });

  test("500 は、本文が誤りや文字数の形でも取得の失敗にする", () => {
    expect(parseTextLengthResponse(500, '{"error":"文を入力してください"}')).toEqual({
      kind: "failed",
    });
    expect(parseTextLengthResponse(500, '{"length":3}')).toEqual({ kind: "failed" });
    expect(parseTextLengthResponse(500, "")).toEqual({ kind: "failed" });
  });

  test("JSON として読めない本文は、取得の失敗にする", () => {
    expect(parseTextLengthResponse(200, "<html>3</html>")).toEqual({ kind: "failed" });
    expect(parseTextLengthResponse(400, "文を入力してください")).toEqual({ kind: "failed" });
  });

  test.each([["null"], ["[]"], ['"3"'], ["3"]])(
    "JSON のオブジェクトでない本文 (%s) は、取得の失敗にする",
    (body) => {
      expect(parseTextLengthResponse(200, body)).toEqual({ kind: "failed" });
    },
  );
});
