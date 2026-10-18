package com.example.app.textlength;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import java.nio.charset.StandardCharsets;

/** 文字数の API の境界。本文の `text` を読み、結果を JSON で返す。文や文字数はログに書かない。 */
public final class TextLengthHandler implements Handler {
  // JSON の後ろに余分な文字がある本文は、JSON として読めないものとして扱う
  private static final ObjectMapper MAPPER =
      new ObjectMapper().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

  private final TextLengthService service;

  public TextLengthHandler(TextLengthService service) {
    this.service = service;
  }

  @Override
  public void handle(Context ctx) {
    TextLengthResult result = service.count(readText(ctx));
    ctx.contentType(ContentType.APPLICATION_JSON);
    switch (result) {
      case TextLengthResult.Counted counted ->
          ctx.status(200)
              .result(MAPPER.createObjectNode().put("length", counted.length()).toString());
      case TextLengthResult.Rejected rejected ->
          ctx.status(400)
              .result(MAPPER.createObjectNode().put("error", rejected.error()).toString());
    }
  }

  // `text` が無い、文字列でない、本文が JSON として読めないときは、空の文として扱う
  private String readText(Context ctx) {
    String body = new String(ctx.bodyAsBytes(), StandardCharsets.UTF_8);
    try {
      String text = MAPPER.readTree(body).path("text").textValue();
      return text == null ? "" : text;
    } catch (JsonProcessingException e) {
      return "";
    }
  }
}
