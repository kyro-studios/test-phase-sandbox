/** 著作権者の名前 (仕様書 2.2、概念モデル 2 章)。設定や環境変数にはしない */
const COPYRIGHT_HOLDER = "Kyro Studios";

/**
 * 著作権の表記 `© <年> Kyro Studios` を作る (仕様書 2.2、5 章)。
 * 年は 4 桁になるように先頭を 0 で埋める。10000 以上は切り詰めず、桁数のまま表す。
 */
export function formatCopyright(year: number): string {
  return `© ${String(year).padStart(4, "0")} ${COPYRIGHT_HOLDER}`;
}
