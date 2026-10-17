package com.example.app.greeting;

/** 名前を確かめ、挨拶の文を作る。Javalin と Jackson と DB に依存せず、状態を持たない。 */
public final class GreetingService {
  private static final int MAX_LENGTH = 20;
  private static final String EMPTY_ERROR = "名前を入力してください";
  private static final String TOO_LONG_ERROR = "名前は 20 文字以内で入力してください";

  /** 前後から除く空白は、仕様書 3.1 の 4 種類 (半角スペース、全角スペース、タブ、LF、CR) に限る。 */
  public GreetingResult greet(String rawName) {
    String name = trimSpaces(rawName);
    if (name.isEmpty()) {
      return new GreetingResult.Rejected(EMPTY_ERROR);
    }
    // 文字数は UTF-16 の長さではなく、コードポイントの数で数える
    if (name.codePointCount(0, name.length()) > MAX_LENGTH) {
      return new GreetingResult.Rejected(TOO_LONG_ERROR);
    }
    return new GreetingResult.Greeted("こんにちは、" + name + " さん");
  }

  // strip() と trim() は除く空白の種類が違うため使わない。間の空白は残す
  private static String trimSpaces(String raw) {
    int start = 0;
    int end = raw.length();
    while (start < end && isSpace(raw.charAt(start))) {
      start++;
    }
    while (end > start && isSpace(raw.charAt(end - 1))) {
      end--;
    }
    return raw.substring(start, end);
  }

  // 4 種類はいずれも BMP の 1 文字なので、サロゲートペアの途中で切れることはない
  private static boolean isSpace(char c) {
    return c == ' ' || c == '　' || c == '\t' || c == '\n' || c == '\r';
  }
}
