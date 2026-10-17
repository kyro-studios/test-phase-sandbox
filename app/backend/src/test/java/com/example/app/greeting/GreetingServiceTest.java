package com.example.app.greeting;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class GreetingServiceTest {
  private final GreetingService service = new GreetingService();

  // 半角スペース、全角スペース、タブ、LF、CR
  @ParameterizedTest
  @ValueSource(strings = {" ", "　", "\t", "\n", "\r"})
  void 前後の空白の4種類を除く(String space) {
    assertEquals(new GreetingResult.Greeted("こんにちは、山田 さん"), service.greet(space + "山田" + space));
  }

  @Test
  void 空白が複数並んでいても前後をすべて除く() {
    assertEquals(new GreetingResult.Greeted("こんにちは、山田 さん"), service.greet(" 　\t\r\n山田\n\r\t 　"));
  }

  @Test
  void 間の空白は除かずに残す() {
    assertEquals(new GreetingResult.Greeted("こんにちは、山田 太郎 さん"), service.greet("山田 太郎"));
  }

  @Test
  void 前後の空白以外の文字は除かない() {
    // 改行以外の制御文字と、NO-BREAK SPACE (U+00A0) は空白として扱わない
    assertEquals(new GreetingResult.Greeted("こんにちは、 \u000B山田 さん"), service.greet(" \u000B山田"));
  }

  @Test
  void 空白だけの名前は空の誤りになる() {
    assertEquals(new GreetingResult.Rejected("名前を入力してください"), service.greet(""));
    assertEquals(new GreetingResult.Rejected("名前を入力してください"), service.greet(" 　\t\n\r"));
  }

  @Test
  void 一文字の名前は受け付ける() {
    assertEquals(new GreetingResult.Greeted("こんにちは、山 さん"), service.greet("山"));
  }

  @Test
  void 二十文字の名前は受け付ける() {
    String name = "a".repeat(20);

    assertEquals(new GreetingResult.Greeted("こんにちは、" + name + " さん"), service.greet(name));
  }

  @Test
  void 二十一文字の名前は長すぎる誤りになる() {
    assertEquals(
        new GreetingResult.Rejected("名前は 20 文字以内で入力してください"), service.greet("a".repeat(21)));
  }

  @Test
  void 前後の空白を除いた後の文字数で判定する() {
    String name = "   " + "a".repeat(20) + "   ";

    assertEquals(
        new GreetingResult.Greeted("こんにちは、" + "a".repeat(20) + " さん"), service.greet(name));
  }

  @Test
  void 絵文字は1文字として数え20個は受け付ける() {
    String emoji = "😀".repeat(20);

    assertEquals(new GreetingResult.Greeted("こんにちは、" + emoji + " さん"), service.greet(emoji));
  }

  @Test
  void 絵文字21個は長すぎる誤りになる() {
    assertEquals(
        new GreetingResult.Rejected("名前は 20 文字以内で入力してください"), service.greet("😀".repeat(21)));
  }
}
