package com.example.app;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.testtools.JavalinTest;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class GreetingApiTest {
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final String EMPTY_ERROR = "{\"error\":\"名前を入力してください\"}";

  @Test
  void 名前を送ると200と挨拶のJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting", builder -> builder.post(jsonBody("{\"name\": \"山田\"}")));

          assertEquals(200, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals("{\"greeting\":\"こんにちは、山田 さん\"}", bodyOf(response));
        });
  }

  @Test
  void 前後の空白を除いた名前で挨拶する() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting", builder -> builder.post(jsonBody("{\"name\": \"  山田  \"}")));

          assertEquals(200, response.code());
          assertEquals("{\"greeting\":\"こんにちは、山田 さん\"}", bodyOf(response));
        });
  }

  @Test
  void 空の名前は400と空の誤りのJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting", builder -> builder.post(jsonBody("{\"name\": \" 　 \"}")));

          assertEquals(400, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals(EMPTY_ERROR, bodyOf(response));
        });
  }

  @Test
  void 二十一文字の名前は400と長すぎる誤りのJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting",
                  builder -> builder.post(jsonBody("{\"name\": \"" + "a".repeat(21) + "\"}")));

          assertEquals(400, response.code());
          assertEquals("{\"error\":\"名前は 20 文字以内で入力してください\"}", bodyOf(response));
        });
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "{}",
        "{\"name\": null}",
        "{\"name\": 1}",
        "{\"name\": true}",
        "{\"name\": [\"山田\"]}",
        "{\"name\": {\"value\": \"山田\"}}",
        "{\"namae\": \"山田\"}",
        "[\"山田\"]",
        "\"山田\"",
        "{\"name\": ",
        "山田",
        "{\"name\": \"山田\"} x",
        ""
      })
  void 名前の欠落や型の誤りや読めない本文は空の名前として400を返す(String body) {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request("/api/greeting", builder -> builder.post(jsonBody(body)));

          assertEquals(400, response.code());
          assertEquals(EMPTY_ERROR, bodyOf(response));
        });
  }

  @Test
  void name以外の項目は無視する() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting",
                  builder ->
                      builder.post(
                          jsonBody(
                              "{\"name\": \"山田\", \"greeting\": \"x\", \"error\": \"x\", \"n\": 1}")));

          assertEquals(200, response.code());
          assertEquals("{\"greeting\":\"こんにちは、山田 さん\"}", bodyOf(response));
        });
  }

  @Test
  void 名前に引用符を含んでも有効なJSONを返す() throws IOException {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/greeting", builder -> builder.post(jsonBody("{\"name\": \"\\\"山田\\\"\"}")));

          assertEquals(200, response.code());
          String greeting = MAPPER.readTree(bodyOf(response)).get("greeting").asText();
          assertEquals("こんにちは、\"山田\" さん", greeting);
        });
  }

  private static RequestBody jsonBody(String json) {
    return RequestBody.create(
        json.getBytes(StandardCharsets.UTF_8), MediaType.get("application/json"));
  }

  private static String bodyOf(Response response) {
    try (response) {
      return response.body().string();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
