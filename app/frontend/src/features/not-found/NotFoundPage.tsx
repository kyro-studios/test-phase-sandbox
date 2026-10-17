/**
 * 存在しないパスを開いたときのエラーの画面 (仕様書 2.1、アーキテクチャ設計 2 章)。
 * 文言は固定する。リンクや操作できる部品は置かず、フッターは RootLayout だけが描画する。
 */
export function NotFoundPage() {
  return <main className="p-4">ページが見つかりません</main>;
}
