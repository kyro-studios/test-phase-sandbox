package com.example.app;

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.javalin.testtools.JavalinTest;
import org.junit.jupiter.api.Test;

class ApplicationTest {
  @Test
  void 経路が無い要求には404を返す() {
    JavalinTest.test(
        Application.create(), (server, client) -> assertEquals(404, client.get("/").code()));
  }
}
