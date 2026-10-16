package com.example.app.health;

import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.javalin.http.HandlerType;
import java.nio.charset.StandardCharsets;

/** 稼働状況の API の境界。GET は結果を JSON で返し、HEAD は GET と同じヘッダーで本文を付けない。 */
public final class HealthHandler implements Handler {
  private final HealthService service;

  public HealthHandler(HealthService service) {
    this.service = service;
  }

  @Override
  public void handle(Context ctx) {
    String json = toJson(service.check());
    ctx.contentType(ContentType.APPLICATION_JSON);
    if (ctx.method() == HandlerType.GET) {
      ctx.result(json);
    } else {
      // HEAD は本文を付けないが、Content-Length は GET の本文の長さにそろえる
      ctx.header("Content-Length", String.valueOf(json.getBytes(StandardCharsets.UTF_8).length));
    }
  }

  // 項目は 2 つだけで、値に JSON の特殊文字は含まれないため、書式で組み立てる
  private static String toJson(HealthResult result) {
    return "{\"status\":\"%s\",\"time\":\"%s\"}".formatted(result.status(), result.time());
  }
}
