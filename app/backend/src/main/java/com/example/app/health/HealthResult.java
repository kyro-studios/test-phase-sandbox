package com.example.app.health;

/** 稼働状況の結果。項目は状態と時刻の 2 つだけ。 */
public record HealthResult(String status, String time) {}
