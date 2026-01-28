import { mutation } from "convex/server";
import { v } from "convex/values";

export const createEscalation = mutation({
  args: {
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const escalationId = await ctx.db.insert("escalations", {
      venueId: args.venueId,
      conversationId: args.conversationId,
      reason: args.reason,
      status: "open",
      createdAt: Date.now()
    });
    return escalationId;
  }
});

export const resolveEscalation = mutation({
  args: {
    escalationId: v.id("escalations"),
    resolution: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.escalationId, {
      status: "resolved",
      resolvedAt: Date.now()
    });
    await ctx.db.insert("outcomes", {
      escalationId: args.escalationId,
      resolution: args.resolution,
      verified: true,
      createdAt: Date.now()
    });
    return { ok: true };
  }
});
