package com.example.app;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.javalin.testtools.JavalinTest;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class HealthApiTest {
  private static final Clock FIXED_CLOCK =
      Clock.fixed(Instant.parse("2026-10-16T07:33:00Z"), ZoneOffset.UTC);
  private static final String EXPECTED_JSON =
      "{\"status\":\"ok\",\"time\":\"2026-10-16T07:33:00Z\"}";

  @Test
  void GETは200と状態と時刻のJSONを返す() {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          Response response = client.get("/api/health");

          assertEquals(200, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals(EXPECTED_JSON, bodyOf(response));
        });
  }

  @Test
  void HEADは同じ状態コードとヘッダーを返し本文は無い() {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          Response response = client.request("/api/health", builder -> builder.head());

          assertEquals(200, response.code());
          assertEquals("application/json", response.header("Content-Type"));
          assertEquals(String.valueOf(EXPECTED_JSON.length()), response.header("Content-Length"));
          assertEquals("", bodyOf(response));
        });
  }

  @ParameterizedTest
  @ValueSource(strings = {"POST", "PUT", "PATCH", "DELETE", "OPTIONS", "TRACE"})
  void GETとHEAD以外は405とAllowを返し本文は空になる(String method) {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          Response response =
              client.request(
                  "/api/health", builder -> builder.method(method, emptyBodyFor(method)));

          assertEquals(405, response.code());
          assertEquals("GET, HEAD", response.header("Allow"));
          assertEquals("", bodyOf(response));
        });
  }

  @Test
  void クエリ文字列を無視して200を返す() {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          Response response = client.get("/api/health?status=ng&time=1999&x=%ZZ");

          assertEquals(200, response.code());
          assertEquals(EXPECTED_JSON, bodyOf(response));
        });
  }

  @Test
  void GETの本文を無視して200を返す() throws Exception {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          // OkHttp は GET に本文を付けられないため、java.net.http で送る
          HttpRequest request =
              HttpRequest.newBuilder(URI.create(client.getOrigin() + "/api/health"))
                  .method("GET", HttpRequest.BodyPublishers.ofString("{\"status\":\"ng\"}"))
                  .build();

          HttpResponse<String> response = sendRaw(request);

          assertEquals(200, response.statusCode());
          assertEquals(EXPECTED_JSON, response.body());
        });
  }

  @Test
  void 予期しない例外は500で本文を空にし例外の内容を返さない() {
    JavalinTest.test(
        Application.create(brokenClock()),
        (server, client) -> {
          Response response = client.get("/api/health");

          assertEquals(500, response.code());
          assertEquals("", bodyOf(response));
        });
  }

  @Test
  void 応答は1秒以内に完了する() {
    JavalinTest.test(
        Application.create(FIXED_CLOCK),
        (server, client) -> {
          long start = System.nanoTime();
          client.get("/api/health");
          long elapsedMillis = (System.nanoTime() - start) / 1_000_000;

          assertTrue(elapsedMillis < 1000, "応答に " + elapsedMillis + " ミリ秒かかった");
        });
  }

  private static HttpResponse<String> sendRaw(HttpRequest request) throws Exception {
    return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
  }

  // OkHttp は POST などに本文を要求するため、空の本文を付ける
  private static RequestBody emptyBodyFor(String method) {
    boolean requiresBody = method.equals("POST") || method.equals("PUT") || method.equals("PATCH");
    return requiresBody ? RequestBody.create(new byte[0]) : null;
  }

  private static String bodyOf(Response response) {
    try (response) {
      return response.body().string();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  // 時刻を取得するときに、例外を投げる Clock
  private static Clock brokenClock() {
    return new Clock() {
      @Override
      public ZoneId getZone() {
        return ZoneOffset.UTC;
      }

      @Override
      public Clock withZone(ZoneId zone) {
        return this;
      }

      @Override
      public Instant instant() {
        throw new IllegalStateException("時刻を取得できない");
      }
    };
  }
}
