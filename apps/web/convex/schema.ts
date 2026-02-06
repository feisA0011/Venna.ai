import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string()
  }).index("by_clerk_id", ["clerkId"]),
  venues: defineTable({
    name: v.string(),
    locale: v.string(),
    policy: v.optional(v.string()),
    confidenceThreshold: v.number(),
    billingEmail: v.optional(v.string())
  }),
  memberships: defineTable({
    userId: v.string(),
    venueId: v.id("venues"),
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("staff"), v.literal("viewer"))
  })
    .index("by_user", ["userId"])
    .index("by_venue", ["venueId"])
    .index("by_user_and_venue", ["userId", "venueId"]),
  conversations: defineTable({
    venueId: v.id("venues"),
    createdAt: v.number(),
    status: v.string()
  }).index("by_venue", ["venueId"]),
  messages: defineTable({
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    createdAt: v.number(),
    confidence: v.optional(v.number())
  })
    .index("by_conversation", ["conversationId"])
    .index("by_venue", ["venueId"]),
  documents: defineTable({
    venueId: v.id("venues"),
    title: v.string(),
    content: v.string(),
    source: v.string(),
    createdAt: v.number()
  }).index("by_venue", ["venueId"]),
  embeddings: defineTable({
    documentId: v.id("documents"),
    vector: v.array(v.number()),
    createdAt: v.number()
  }).index("by_document", ["documentId"]),
  escalations: defineTable({
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    reason: v.string(),
    status: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number())
  }).index("by_venue", ["venueId"]),
  outcomes: defineTable({
    venueId: v.id("venues"),
    escalationId: v.id("escalations"),
    resolution: v.string(),
    verified: v.boolean(),
    createdAt: v.number()
  })
    .index("by_escalation", ["escalationId"])
    .index("by_venue", ["venueId"]),
  metrics: defineTable({
    venueId: v.id("venues"),
    key: v.string(),
    value: v.number(),
    recordedAt: v.number()
  }).index("by_venue", ["venueId"])
});
