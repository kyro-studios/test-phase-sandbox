package com.example.app;

import static org.junit.jupiter.api.Assertions.assertEquals;

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

class TextLengthApiTest {
  private static final String EMPTY_ERROR = "{\"error\":\"文を入力してください\"}";
  private static final String TOO_LONG_ERROR = "{\"error\":\"文は 200 文字以内で入力してください\"}";

  @Test
  void 文を送ると200と文字数のJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length", builder -> builder.post(jsonBody("{\"text\": \"あいう\"}")));

          assertEquals(200, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals("{\"length\":3}", bodyOf(response));
        });
  }

  @Test
  void 前後の空白を除かずに数える() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length", builder -> builder.post(jsonBody("{\"text\": \" あ \"}")));

          assertEquals(200, response.code());
          assertEquals("{\"length\":3}", bodyOf(response));
        });
  }

  @Test
  void 空の文は400と空の誤りのJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length", builder -> builder.post(jsonBody("{\"text\": \"\"}")));

          assertEquals(400, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals(EMPTY_ERROR, bodyOf(response));
        });
  }

  @Test
  void 二百一文字の文は400と長すぎる誤りのJSONを返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length",
                  builder -> builder.post(jsonBody("{\"text\": \"" + "a".repeat(201) + "\"}")));

          assertEquals(400, response.code());
          assertEquals(TOO_LONG_ERROR, bodyOf(response));
        });
  }

  @Test
  void 二百文字の文は200を返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length",
                  builder -> builder.post(jsonBody("{\"text\": \"" + "a".repeat(200) + "\"}")));

          assertEquals(200, response.code());
          assertEquals("{\"length\":200}", bodyOf(response));
        });
  }

  @Test
  void 絵文字200個は200を返す() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length",
                  builder -> builder.post(jsonBody("{\"text\": \"" + "😀".repeat(200) + "\"}")));

          assertEquals(200, response.code());
          assertEquals("{\"length\":200}", bodyOf(response));
        });
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "{}",
        "{\"text\": null}",
        "{\"text\": 1}",
        "{\"text\": true}",
        "{\"text\": [\"あ\"]}",
        "{\"text\": {\"value\": \"あ\"}}",
        "{\"txt\": \"あ\"}",
        "[\"あ\"]",
        "\"あ\"",
        "{\"text\": ",
        "あ",
        "{\"text\": \"あ\"} x",
        ""
      })
  void 文の欠落や型の誤りや読めない本文は空の文として400を返す(String body) {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request("/api/text-length", builder -> builder.post(jsonBody(body)));

          assertEquals(400, response.code());
          assertEquals(EMPTY_ERROR, bodyOf(response));
        });
  }

  @Test
  void text以外の項目は無視する() {
    JavalinTest.test(
        Application.create(),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/text-length",
                  builder ->
                      builder.post(
                          jsonBody("{\"text\": \"あ\", \"length\": 99, \"error\": \"x\"}")));

          assertEquals(200, response.code());
          assertEquals("{\"length\":1}", bodyOf(response));
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
