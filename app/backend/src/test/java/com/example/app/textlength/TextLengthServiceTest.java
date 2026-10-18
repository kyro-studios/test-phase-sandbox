package com.example.app.textlength;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class TextLengthServiceTest {
  private static final String EMPTY_ERROR = "文を入力してください";
  private static final String TOO_LONG_ERROR = "文は 200 文字以内で入力してください";

  private final TextLengthService service = new TextLengthService();

  @Test
  void 空の文は空の誤りになる() {
    assertEquals(new TextLengthResult.Rejected(EMPTY_ERROR), service.count(""));
  }

  @Test
  void 一文字の文は1を返す() {
    assertEquals(new TextLengthResult.Counted(1), service.count("あ"));
  }

  @Test
  void 二百文字の文は200を返す() {
    assertEquals(new TextLengthResult.Counted(200), service.count("a".repeat(200)));
  }

  @Test
  void 二百一文字の文は長すぎる誤りになる() {
    assertEquals(new TextLengthResult.Rejected(TOO_LONG_ERROR), service.count("a".repeat(201)));
  }

  @Test
  void 前後の半角スペースを除かずに数える() {
    assertEquals(new TextLengthResult.Counted(3), service.count(" あ "));
  }

  // 半角スペース、全角スペース、タブ、LF、CR のどれも、ほかの文字と同じく1文字
  @ParameterizedTest
  @ValueSource(strings = {" ", "　", "\t", "\n", "\r"})
  void 空白は1文字ずつ数える(String space) {
    assertEquals(new TextLengthResult.Counted(3), service.count(space + "あ" + space));
  }

  @Test
  void 空白だけの文は空とみなさず空白の数を返す() {
    assertEquals(new TextLengthResult.Counted(3), service.count("   "));
  }

  @Test
  void 絵文字1個は1文字として数える() {
    assertEquals(new TextLengthResult.Counted(1), service.count("😀"));
  }

  @Test
  void 絵文字200個は200を返す() {
    assertEquals(new TextLengthResult.Counted(200), service.count("😀".repeat(200)));
  }

  @Test
  void 絵文字201個は長すぎる誤りになる() {
    assertEquals(new TextLengthResult.Rejected(TOO_LONG_ERROR), service.count("😀".repeat(201)));
  }
}
