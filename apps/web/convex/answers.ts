import { mutation } from "convex/server";
import { v } from "convex/values";
import { cosineSimilarity, fakeEmbed } from "./ai";

type Citation = {
  documentId: string;
  title: string;
  source: string;
};

const buildAnswer = (question: string, context: string[], citations: Citation[]) => {
  const contextText = context.join(" ");
  const citationLines = citations
    .map((citation) => `- ${citation.title} (${citation.source})`)
    .join("\n");
  return [
    `Based on approved venue knowledge: ${contextText}`,
    `Question: ${question}`,
    "Sources:",
    citationLines
  ].join("\n\n");
};

export const answerQuestion = mutation({
  args: {
    venueId: v.id("venues"),
    conversationId: v.id("conversations"),
    question: v.string()
  },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.venueId !== args.venueId) {
      throw new Error("Conversation not found for venue");
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_venue_status", (q) => q.eq("venueId", args.venueId).eq("status", "approved"))
      .collect();
    const embeddings = await ctx.db
      .query("embeddings")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();
    const embeddingByDocument = new Map(
      embeddings.map((item) => [item.documentId, item])
    );

    const queryVector = fakeEmbed(args.question);

    const ranked = documents
      .map((doc) => {
        const embedding = embeddingByDocument.get(doc._id);
        const score = embedding ? cosineSimilarity(queryVector, embedding.vector) : 0;
        return { doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topScore = ranked[0]?.score ?? 0;
    const confidence = Math.max(0, Math.min(1, topScore));
    const citations = ranked
      .filter((item) => item.score > 0)
      .map((item) => ({
        documentId: item.doc._id,
        title: item.doc.title,
        source: item.doc.source
      }));
    const hasApprovedKnowledge = citations.length > 0;
    const allowAnswer = confidence >= venue.confidenceThreshold && hasApprovedKnowledge;
    const answer = allowAnswer
      ? buildAnswer(
          args.question,
          ranked.map((item) => item.doc.content),
          citations
        )
      : "I want to double-check with the venue staff before answering.";

    await ctx.db.insert("messages", {
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
      escalationId,
      citations
    };
  }
});
