import { mutation, query } from "convex/server";
import { v } from "convex/values";
import { cosineSimilarity, fakeEmbed } from "./ai";
import { requireVenueAccess } from "./access";

export const ingestDocument = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    title: v.string(),
    content: v.string(),
    source: v.string()
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "staff");

    const documentId = await ctx.db.insert("documents", {
      venueId: args.venueId,
      title: args.title,
      content: args.content,
      source: args.source,
      createdAt: Date.now()
    });
    const vector = fakeEmbed(`${args.title}\n${args.content}`);
    await ctx.db.insert("embeddings", {
      documentId,
      vector,
      createdAt: Date.now()
    });
    return documentId;
  }
});

export const searchDocuments = query({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "viewer");

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();
    const embeddings = await ctx.db.query("embeddings").collect();
    const queryVector = fakeEmbed(args.query);

    const scored = docs.map((doc) => {
      const embedding = embeddings.find((item) => item.documentId === doc._id);
      const score = embedding ? cosineSimilarity(queryVector, embedding.vector) : 0;
      return { doc, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit ?? 3)
      .map((item) => ({
        id: item.doc._id,
        title: item.doc.title,
        content: item.doc.content,
        score: item.score
      }));
  }
});
