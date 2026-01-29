import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  venues: defineTable({
    name: v.string(),
    locale: v.string(),
    policy: v.optional(v.string()),
    confidenceThreshold: v.number()
  }),
  conversations: defineTable({
    venueId: v.id("venues"),
    createdAt: v.number(),
    status: v.string()
  }).index("by_venue", ["venueId"]),
  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    createdAt: v.number(),
    confidence: v.optional(v.number())
  }).index("by_conversation", ["conversationId"]),
  documents: defineTable({
    venueId: v.id("venues"),
    title: v.string(),
    content: v.string(),
    source: v.string(),
    createdAt: v.number()
  }).index("by_venue", ["venueId"]),
  embeddings: defineTable({
    documentId: v.id("documents"),
    venueId: v.id("venues"),
    vector: v.array(v.number()),
    createdAt: v.number()
  })
    .index("by_document", ["documentId"])
    .index("by_venue", ["venueId"]),
  escalations: defineTable({
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    reason: v.string(),
    status: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number())
  }).index("by_venue", ["venueId"]),
  outcomes: defineTable({
    escalationId: v.id("escalations"),
    resolution: v.string(),
    verified: v.boolean(),
    createdAt: v.number()
  }).index("by_escalation", ["escalationId"]),
  metrics: defineTable({
    venueId: v.id("venues"),
    key: v.string(),
    value: v.number(),
    recordedAt: v.number()
  }).index("by_venue", ["venueId"])
});
