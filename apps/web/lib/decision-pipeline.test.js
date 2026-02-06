import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetDecisionStateForTests,
  handleMessage,
  listEscalations,
  listLogs
} from "./decision-pipeline.js";

test("returns cached answer for similar verified question", () => {
  __resetDecisionStateForTests();
  const result = handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_1",
    text: "What time do you close"
  });

  assert.equal(result.type, "answer");
  assert.match(result.message, /10pm/);

  const logs = listLogs({ venueId: "demo-venue" });
  assert.equal(logs[0].route, "cache");
});

test("escalates when no citations are found", () => {
  __resetDecisionStateForTests();
  const result = handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_2",
    text: "Can you explain quantum entanglement?"
  });

  assert.equal(result.type, "escalation");

  const escalations = listEscalations({ venueId: "demo-venue" });
  assert.equal(escalations.length, 1);
  assert.equal(escalations[0].conversationId, "conv_2");
});
