package com.example.app;

import com.example.app.greeting.GreetingHandler;
import com.example.app.greeting.GreetingService;
import com.example.app.health.HealthHandler;
import com.example.app.health.HealthService;
import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HandlerType;
import io.javalin.http.MethodNotAllowedResponse;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** 起動と組み立て。 */
public final class Application {
  private static final Logger LOG = LoggerFactory.getLogger(Application.class);
  private static final int DEFAULT_PORT = 8080;
  private static final String HEALTH_PATH = "/api/health";
  private static final String GREETING_PATH = "/api/greeting";

  private Application() {}

  static Javalin create() {
    return create(Clock.systemUTC());
  }

  static Javalin create(Clock clock) {
    HealthHandler health = new HealthHandler(new HealthService(clock));
    GreetingHandler greeting = new GreetingHandler(new GreetingService());
    return Javalin.create()
        .before(HEALTH_PATH, Application::rejectUnsupportedMethod)
        .get(HEALTH_PATH, health)
        .head(HEALTH_PATH, health)
        .post(GREETING_PATH, greeting)
        .exception(
            MethodNotAllowedResponse.class,
            (e, ctx) -> ctx.status(405).header("Allow", "GET, HEAD").result(""))
        .exception(Exception.class, Application::respondInternalError);
  }

  private static void rejectUnsupportedMethod(Context ctx) {
    if (ctx.method() != HandlerType.GET && ctx.method() != HandlerType.HEAD) {
      throw new MethodNotAllowedResponse();
    }
  }

  // 例外の内容は返さない。ログには要求の行だけを書く
  private static void respondInternalError(Exception e, Context ctx) {
    LOG.error("{} {} で予期しない例外が起きた", ctx.method(), ctx.path());
    ctx.status(500).result("");
  }

  public static void main(String[] args) {
    String port = System.getenv("PORT");
    create().start(port == null ? DEFAULT_PORT : Integer.parseInt(port));
  }
}
