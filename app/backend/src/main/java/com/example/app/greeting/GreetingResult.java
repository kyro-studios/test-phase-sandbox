package com.example.app.greeting;

/** 挨拶の結果。挨拶の文か、名前の誤りのどちらか 1 つ。Javalin と Jackson に依存しない。 */
public sealed interface GreetingResult permits GreetingResult.Greeted, GreetingResult.Rejected {

  /** 挨拶の文を作れた。 */
  record Greeted(String greeting) implements GreetingResult {}

  /** 名前が受け付けられない。誤りの文言を持つ。 */
  record Rejected(String error) implements GreetingResult {}
}
