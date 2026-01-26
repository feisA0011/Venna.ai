import { mutation } from "convex/server";
import { v } from "convex/values";

export const createVenue = mutation({
  args: {
    name: v.string(),
    locale: v.string()
  },
  handler: async (ctx, args) => {
    const venueId = await ctx.db.insert("venues", {
      name: args.name,
      locale: args.locale,
      confidenceThreshold: 0.72
    });
    return venueId;
  }
});

export const upsertVenuePolicy = mutation({
  args: {
    venueId: v.id("venues"),
    policy: v.string(),
    confidenceThreshold: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.venueId, {
      policy: args.policy,
      confidenceThreshold: args.confidenceThreshold ?? 0.72
    });
    return { ok: true };
  }
});
