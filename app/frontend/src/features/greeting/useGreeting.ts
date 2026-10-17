import { useCallback, useEffect, useRef, useState } from "react";
import { requestGreeting } from "./requestGreeting";

/**
 * 画面が持つ状態 (仕様書 7 章、アーキテクチャ設計 2.1)。
 * 挨拶と誤りの文言は、API の応答の文字列をそのまま持つ。取得失敗の文言は画面が固定で持つ。
 */
export type GreetingScreenState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "greeting"; text: string }
  | { state: "error"; text: string }
  | { state: "failed" };

/**
 * 挨拶の画面の状態と、入力欄の値、「挨拶する」の処理を提供する。
 * 入力欄の値は、どの結果でも消さない。取得を始める時に、前の結果は消す (仕様書 5.2)。
 * 状態は useState だけで持つ。保存先には書かない (仕様書 5.3、NFR-1)。
 */
export function useGreeting() {
  const [name, setName] = useState("");
  const [screen, setScreen] = useState<GreetingScreenState>({ state: "idle" });
  // 取得中は true。再描画を待たずに読めるよう state ではなく ref で持つ
  const loading = useRef(false);
  // アンマウント後の応答は、画面に反映しない
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const greet = useCallback(() => {
    // 取得中は新しい取得を始めない (仕様書 5.4)
    if (loading.current) {
      return;
    }
    loading.current = true;
    setScreen({ state: "loading" });

    requestGreeting(name).then((outcome) => {
      loading.current = false;
      if (!mounted.current) {
        return;
      }
      setScreen(
        outcome.kind === "failed"
          ? { state: "failed" }
          : { state: outcome.kind, text: outcome.text },
      );
    });
  }, [name]);

  return { name, setName, screen, greet };
}
