import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetDecisionStateForTests,
  getEscalationById,
  handleMessage,
  listEscalations,
  listLogs,
  replyToEscalation
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
  assert.equal(escalations[0].thread.length, 1);
});

test("ignores pending documents and escalates when only pending doc matches", () => {
  __resetDecisionStateForTests();
  const result = handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_3",
    text: "How can I change my reservation?"
  });

  assert.equal(result.type, "escalation");
  assert.equal(result.sources.includes("ops/reservations.md"), false);
});

test("staff can reply, resolve escalation, and store a verified answer", () => {
  __resetDecisionStateForTests();
  handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_4",
    text: "Do you have vegan options tonight?"
  });

  const [escalation] = listEscalations({ venueId: "demo-venue" });
  const updated = replyToEscalation({
    venueId: "demo-venue",
    escalationId: escalation.id,
    userId: "staff_demo",
    message: "Yes, we have two vegan mains and one starter.",
    resolve: true,
    verifiedAnswer: true
  });

  assert.equal(updated.status, "resolved");
  assert.equal(updated.thread.length, 2);
  assert.equal(updated.thread[1].verifiedAnswer, true);

  const followUp = handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_5",
    text: "Do you have vegan options?"
  });
  assert.equal(followUp.type, "answer");
  assert.match(followUp.message, /vegan mains/);

  const fetched = getEscalationById({ venueId: "demo-venue", escalationId: escalation.id });
  assert.equal(fetched.status, "resolved");
});


test("cannot reply to an escalation after it is resolved", () => {
  __resetDecisionStateForTests();
  handleMessage({
    venueId: "demo-venue",
    conversationId: "conv_6",
    text: "Can we bring a birthday cake?"
  });

  const [escalation] = listEscalations({ venueId: "demo-venue" });
  replyToEscalation({
    venueId: "demo-venue",
    escalationId: escalation.id,
    userId: "staff_demo",
    message: "Yes, service fee applies.",
    resolve: true
  });

  assert.throws(() =>
    replyToEscalation({
      venueId: "demo-venue",
      escalationId: escalation.id,
      userId: "staff_demo",
      message: "Additional note"
    })
  );
});
