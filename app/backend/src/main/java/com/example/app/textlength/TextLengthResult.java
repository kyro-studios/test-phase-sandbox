package com.example.app.textlength;

/** 文字数の結果。文字数か、文の誤りのどちらか 1 つ。Javalin と Jackson に依存しない。 */
public sealed interface TextLengthResult
    permits TextLengthResult.Counted, TextLengthResult.Rejected {

  /** 文字数を数えた。 */
  record Counted(int length) implements TextLengthResult {}

  /** 文が受け付けられない。誤りの文言を持つ。 */
  record Rejected(String error) implements TextLengthResult {}
}
