import { Toolbar } from "radix-ui";
import { useHealthCheck } from "./useHealthCheck";

/**
 * 稼働状況の画面 (仕様書 4.1、4.2)。文言は仕様書 7 章のとおり固定する。
 * 失敗のときは、エラーの文言だけを表示し、状態と時刻は出さない (FR-5)。
 * 「確認中」の間の「再読み込み」は、押下を無視する (仕様書 4.2)。
 */
export function HealthPage() {
  const health = useHealthCheck();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">稼働状況</h1>
      <div role="status">
        {health.state === "checking" && <p>確認中</p>}
        {health.state === "ok" && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="font-semibold">状態</dt>
            <dd>ok</dd>
            <dt className="font-semibold">時刻</dt>
            <dd>{health.time}</dd>
          </dl>
        )}
        {health.state === "unreachable" && <p className="text-red-700">サーバーに接続できません</p>}
      </div>
      {/* Radix UI に Button の Primitive は無いため、Toolbar.Button で <button> を描画する */}
      <Toolbar.Root>
        <Toolbar.Button
          aria-disabled={health.state === "checking"}
          onClick={health.reload}
          className="rounded border border-slate-400 bg-white px-4 py-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          再読み込み
        </Toolbar.Button>
      </Toolbar.Root>
    </main>
  );
}
