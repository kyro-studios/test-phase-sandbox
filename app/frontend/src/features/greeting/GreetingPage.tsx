import { useGreeting } from "./useGreeting";

const FAILED_TEXT = "挨拶を取得できませんでした";

/**
 * 挨拶の画面 (仕様書 5 章、アーキテクチャ設計 2.1)。文言は仕様書のとおり固定する。
 * 結果は 1 つだけ描画する。挨拶は role="status"、誤りと取得失敗は role="alert" の <p> にする。
 * 取得中は「挨拶する」を押せないようにする。結果の文字列は、テキストとして描画する。
 */
export function GreetingPage() {
  const { name, setName, screen, greet } = useGreeting();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">挨拶</h1>
      <div className="flex flex-col gap-2">
        <label htmlFor="greeting-name" className="font-semibold">
          名前
        </label>
        <input
          id="greeting-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border border-slate-400 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        />
      </div>
      {/* Radix UI に Button の Primitive は無いため、標準の <button> を使う。<form> では囲まない (Enter で取得しないため) */}
      <button
        type="button"
        disabled={screen.state === "loading"}
        onClick={greet}
        className="self-start rounded border border-slate-400 bg-white px-4 py-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        挨拶する
      </button>
      {screen.state === "greeting" && (
        <p role="status" className="text-lg">
          {screen.text}
        </p>
      )}
      {screen.state === "error" && (
        <p role="alert" className="text-red-700">
          {screen.text}
        </p>
      )}
      {screen.state === "failed" && (
        <p role="alert" className="text-red-700">
          {FAILED_TEXT}
        </p>
      )}
    </main>
  );
}
