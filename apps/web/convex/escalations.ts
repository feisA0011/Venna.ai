import { mutation } from "convex/server";
import { v } from "convex/values";
import { requireVenueAccess } from "./access";

export const createEscalation = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.venueId !== args.venueId) {
      throw new Error("Conversation does not belong to venue");
    }

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
    userId: v.string(),
    venueId: v.id("venues"),
    escalationId: v.id("escalations"),
    resolution: v.string()
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const escalation = await ctx.db.get(args.escalationId);
    if (!escalation || escalation.venueId !== args.venueId) {
      throw new Error("Escalation does not belong to venue");
    }

    await ctx.db.patch(args.escalationId, {
      status: "resolved",
      resolvedAt: Date.now()
    });
    await ctx.db.insert("outcomes", {
      venueId: args.venueId,
      escalationId: args.escalationId,
      resolution: args.resolution,
      verified: true,
      createdAt: Date.now()
    });
    return { ok: true };
  }
});
