import { mutation } from "convex/server";
import { v } from "convex/values";
import { cosineSimilarity, fakeEmbed } from "./ai";
import { requireVenueAccess } from "./access";

const buildAnswer = (question: string, context: string[]) => {
  const contextText = context.join(" ");
  return `Based on the venue knowledge: ${contextText}\n\nQuestion: ${question}`;
};

export const answerQuestion = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    question: v.string()
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.venueId !== args.venueId) {
      throw new Error("Conversation does not belong to venue");
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();
    const embeddings = await ctx.db.query("embeddings").collect();

    const queryVector = fakeEmbed(args.question);

    const ranked = documents
      .map((doc) => {
        const embedding = embeddings.find((item) => item.documentId === doc._id);
        const score = embedding ? cosineSimilarity(queryVector, embedding.vector) : 0;
        return { doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topScore = ranked[0]?.score ?? 0;
    const confidence = Math.max(0, Math.min(1, topScore));
    const answer =
      confidence >= venue.confidenceThreshold
        ? buildAnswer(args.question, ranked.map((item) => item.doc.content))
        : "I want to double-check with the venue staff before answering.";

    await ctx.db.insert("messages", {
      venueId: args.venueId,
      conversationId: args.conversationId,
      sender: "assistant",
      content: answer,
      confidence,
      createdAt: Date.now()
    });

    let escalationId: string | null = null;
    if (confidence < venue.confidenceThreshold) {
      const escalation = await ctx.db.insert("escalations", {
        venueId: args.venueId,
        conversationId: args.conversationId,
        reason: "Low confidence on automated response",
        status: "open",
        createdAt: Date.now()
      });
      escalationId = escalation;
    }

    return {
      answer,
      confidence,
      escalationId
    };
  }
});
