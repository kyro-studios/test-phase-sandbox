import { useState } from "react";
import { formatCopyright } from "./formatCopyright";

/**
 * 著作権の表記のフッター (仕様書 2.4、3.4)。
 * 年は、マウントの時点の端末の日付で 1 回だけ決め、表示の間は変えない (仕様書 2.3)。
 * 操作できる部品は置かない。`<footer>` は本文の領域の外に置かれると contentinfo になる。
 */
export function CopyrightFooter() {
  const [year] = useState(() => new Date().getFullYear());
  return <footer className="p-4 text-center text-sm">{formatCopyright(year)}</footer>;
}
