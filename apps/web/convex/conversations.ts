import { mutation } from "convex/server";
import { v } from "convex/values";

export const createConversation = mutation({
  args: {
    venueId: v.id("venues")
  },
  handler: async (ctx, args) => {
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
    conversationId: v.id("conversations"),
    sender: v.string(),
    content: v.string(),
    confidence: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: args.sender,
      content: args.content,
      confidence: args.confidence,
      createdAt: Date.now()
    });
    return { ok: true };
  }
});
