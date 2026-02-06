import { mutation } from "convex/server";
import { v } from "convex/values";
import { requireVenueAccess } from "./access";

export const createConversation = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues")
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const conversationId = await ctx.db.insert("conversations", {
      venueId: args.venueId,
      createdAt: Date.now(),
      status: "open"
    });
    return conversationId;
  }
});

export const addMessage = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    confidence: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.venueId !== args.venueId) {
      throw new Error("Conversation does not belong to venue");
    }

    await ctx.db.insert("messages", {
      venueId: args.venueId,
      conversationId: args.conversationId,
      sender: args.sender,
      content: args.content,
      confidence: args.confidence,
      createdAt: Date.now()
    });
    return { ok: true };
  }
});
