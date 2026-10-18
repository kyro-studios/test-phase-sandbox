package com.example.app;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

/** 仕組みの動作確認 (Merge Queue の CI の失敗) のため、文字数の画面と組み合わせると失敗させる。確認が終わったら消す。 */
class CiBreakerTest {
  private static final Path PAGE =
      Path.of("../frontend/src/features/text-length/TextLengthPage.tsx");

  @Test
  void failsTogetherWithTheTextLengthPage() {
    assertFalse(Files.exists(PAGE), "動作確認のため、わざと失敗させています");
  }
}
