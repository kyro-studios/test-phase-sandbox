package com.example.app.health;

import java.time.Clock;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/** 稼働状況の結果を作る。Javalin と DB に依存しない。 */
public final class HealthService {
  private static final DateTimeFormatter TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

  private final Clock clock;

  public HealthService(Clock clock) {
    this.clock = clock;
  }

  /** 現在時刻を秒に切り捨て、UTC の ISO 8601 形式で返す。 */
  public HealthResult check() {
    String time = TIME_FORMAT.format(clock.instant().truncatedTo(ChronoUnit.SECONDS));
    return new HealthResult("ok", time);
  }
}
