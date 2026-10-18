package com.example.app.textlength;

/** 文を確かめ、文字数を数える。Javalin と Jackson と DB に依存せず、状態を持たない。 */
public final class TextLengthService {
  private static final int MAX_LENGTH = 200;
  private static final String EMPTY_ERROR = "文を入力してください";
  private static final String TOO_LONG_ERROR = "文は 200 文字以内で入力してください";

  /** 文は変換せず、前後の空白も除かずに数える。 */
  public TextLengthResult count(String text) {
    // 文字数は UTF-16 の長さではなく、コードポイントの数で数える
    int length = text.codePointCount(0, text.length());
    if (length == 0) {
      return new TextLengthResult.Rejected(EMPTY_ERROR);
    }
    if (length > MAX_LENGTH) {
      return new TextLengthResult.Rejected(TOO_LONG_ERROR);
    }
    return new TextLengthResult.Counted(length);
  }
}
