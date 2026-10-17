package com.example.app.greeting;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import java.nio.charset.StandardCharsets;

/** 挨拶の API の境界。本文の `name` を読み、結果を JSON で返す。名前や挨拶はログに書かない。 */
public final class GreetingHandler implements Handler {
  // JSON の後ろに余分な文字がある本文は、JSON として読めないものとして扱う
  private static final ObjectMapper MAPPER =
      new ObjectMapper().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

  private final GreetingService service;

  public GreetingHandler(GreetingService service) {
    this.service = service;
  }

  @Override
  public void handle(Context ctx) {
    GreetingResult result = service.greet(readName(ctx));
    ctx.contentType(ContentType.APPLICATION_JSON);
    switch (result) {
      case GreetingResult.Greeted greeted ->
          ctx.status(200).result(toJson("greeting", greeted.greeting()));
      case GreetingResult.Rejected rejected ->
          ctx.status(400).result(toJson("error", rejected.error()));
    }
  }

  // `name` が無い、文字列でない、本文が JSON として読めないときは、空の名前として扱う
  private String readName(Context ctx) {
    String body = new String(ctx.bodyAsBytes(), StandardCharsets.UTF_8);
    try {
      String name = MAPPER.readTree(body).path("name").textValue();
      return name == null ? "" : name;
    } catch (JsonProcessingException e) {
      return "";
    }
  }

  // 名前に含まれる `"` や `\` は、ObjectMapper がエスケープする
  private static String toJson(String key, String value) {
    return MAPPER.createObjectNode().put(key, value).toString();
  }
}
