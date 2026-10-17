import { describe, expect, test } from "vitest";
import { formatCopyright } from "./formatCopyright";

describe("formatCopyright", () => {
  test.each([
    [5, "© 0005 Kyro Studios"],
    [999, "© 0999 Kyro Studios"],
    [1000, "© 1000 Kyro Studios"],
    [2026, "© 2026 Kyro Studios"],
    [9999, "© 9999 Kyro Studios"],
    // 4 桁に切り詰めない (仕様書 5 章)
    [10000, "© 10000 Kyro Studios"],
  ])("年 %i は %s になる", (year, expected) => {
    expect(formatCopyright(year)).toBe(expected);
  });

  test("©、年、著作権者の間は半角スペースを 1 つずつ入れる", () => {
    expect(formatCopyright(2026).split(" ")).toEqual(["©", "2026", "Kyro", "Studios"]);
  });
});
