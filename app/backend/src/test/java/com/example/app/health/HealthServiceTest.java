package com.example.app.health;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class HealthServiceTest {
  @Test
  void 結果の状態は常にokになる() {
    HealthService service = new HealthService(fixedAt("2026-10-16T07:33:00Z", "UTC"));

    assertEquals("ok", service.check().status());
  }

  @Test
  void 時刻は20文字で小数秒が無くZで終わる() {
    HealthService service = new HealthService(fixedAt("2026-10-16T07:33:00.123456789Z", "UTC"));

    String time = service.check().time();

    assertEquals(20, time.length());
    assertFalse(time.contains("."));
    assertTrue(time.endsWith("Z"));
  }

  @Test
  void 時刻は秒に切り捨てられる() {
    HealthService service = new HealthService(fixedAt("2026-10-16T07:33:00.999Z", "UTC"));

    assertEquals("2026-10-16T07:33:00Z", service.check().time());
  }

  @Test
  void 時刻はUTCで表す() {
    // 東京の時刻 (16:33 JST) で持つ Clock でも、UTC の 07:33 で表す
    HealthService service = new HealthService(fixedAt("2026-10-16T07:33:00Z", "Asia/Tokyo"));

    assertEquals("2026-10-16T07:33:00Z", service.check().time());
  }

  private static Clock fixedAt(String instant, String zone) {
    return Clock.fixed(Instant.parse(instant), ZoneId.of(zone));
  }
}
