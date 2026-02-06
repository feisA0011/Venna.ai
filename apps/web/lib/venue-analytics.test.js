import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetVenueAnalyticsStateForTests,
  aggregateVenueAnalytics,
  configureVenueAnalytics,
  markEscalationResolved,
  recordConversationAnalytics
} from "./venue-analytics.js";

test("aggregates conversation stats and ROI correctly", () => {
  __resetVenueAnalyticsStateForTests();
  configureVenueAnalytics({
    venueId: "venue-a",
    minutesSavedPerAutoAnswer: 6,
    hourlyCostEur: 24,
    escalationSlaMinutes: 20
  });

  const base = 1_000_000;
  recordConversationAnalytics({
    venueId: "venue-a",
    route: "llm",
    question: "What time do you open?",
    responseLatencyMs: 300,
    createdAt: base
  });
  recordConversationAnalytics({
    venueId: "venue-a",
    route: "llm",
    question: "Do you have vegan menu items?",
    responseLatencyMs: 500,
    createdAt: base + 1_000
  });
  recordConversationAnalytics({
    venueId: "venue-a",
    route: "escalation",
    question: "Can I cancel my reservation?",
    responseLatencyMs: 900,
    createdAt: base + 2_000
  });

  markEscalationResolved({
    venueId: "venue-a",
    createdAt: base + 2_000,
    resolvedAt: base + 2_000 + 10 * 60 * 1000
  });

  const metrics = aggregateVenueAnalytics({ venueId: "venue-a", now: base + 5_000 });
  assert.equal(metrics.totalConversations, 3);
  assert.equal(Number(metrics.autoAnsweredPercent.toFixed(1)), 66.7);
  assert.equal(Number(metrics.escalatedPercent.toFixed(1)), 33.3);
  assert.equal(metrics.medianResponseLatencyMs, 500);

  assert.equal(metrics.topQuestionTopics[0].topic, "hours");
  assert.equal(metrics.topQuestionTopics[1].topic, "menu");
  assert.equal(metrics.topQuestionTopics[2].topic, "booking");

  assert.equal(metrics.estimatedStaffMinutesSaved, 12);
  assert.equal(metrics.roi.hoursSavedThisMonth, 0.2);
  assert.equal(Number(metrics.roi.estimatedEurSavedThisMonth.toFixed(1)), 4.8);
  assert.equal(metrics.roi.escalationSlaPercent, 100);
});

test("filters out events outside monthly window", () => {
  __resetVenueAnalyticsStateForTests();
  const now = 10_000_000;

  recordConversationAnalytics({
    venueId: "demo-venue",
    route: "llm",
    question: "What are your hours?",
    responseLatencyMs: 200,
    createdAt: now - 40 * 24 * 60 * 60 * 1000
  });

  const metrics = aggregateVenueAnalytics({ venueId: "demo-venue", now });
  assert.equal(metrics.totalConversations, 0);
  assert.equal(metrics.estimatedStaffMinutesSaved, 0);
});
