package com.example.app;

import io.javalin.Javalin;

/** 起動と組み立て。 */
public final class Application {
  private static final int DEFAULT_PORT = 8080;

  private Application() {}

  static Javalin create() {
    return Javalin.create();
  }

  public static void main(String[] args) {
    String port = System.getenv("PORT");
    create().start(port == null ? DEFAULT_PORT : Integer.parseInt(port));
  }
}
