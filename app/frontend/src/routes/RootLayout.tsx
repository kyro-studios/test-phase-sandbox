import { Outlet, useLocation } from "react-router";
import { CopyrightFooter } from "../features/copyright-footer/CopyrightFooter";

/**
 * 全画面共通の枠 (アーキテクチャ設計 2 章)。画面の内容とフッターを縦に並べ、フッターの位置は CSS だけで決める (仕様書 3.5)。
 * フッターは、ここだけで描画する。画面を切り替えるたびに作り直し、年を決め直す (仕様書 2.3)。
 */
export function RootLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <CopyrightFooter key={location.key} />
    </div>
  );
}
