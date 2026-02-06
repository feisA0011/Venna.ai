import { mutation } from "convex/server";
import { v } from "convex/values";

export const createVenue = mutation({
  args: {
    name: v.string(),
    locale: v.string(),
    allowedDomains: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const venueId = await ctx.db.insert("venues", {
      name: args.name,
      locale: args.locale,
      allowedDomains: args.allowedDomains ?? [],
      minutesSavedPerAutoAnswer: 4,
      hourlyCostEur: 18,
      escalationSlaMinutes: 15,
      confidenceThreshold: 0.72
    });
    return venueId;
  }
});

export const upsertVenuePolicy = mutation({
  args: {
    venueId: v.id("venues"),
    policy: v.string(),
    confidenceThreshold: v.optional(v.number()),
    allowedDomains: v.optional(v.array(v.string())),
    minutesSavedPerAutoAnswer: v.optional(v.number()),
    hourlyCostEur: v.optional(v.number()),
    escalationSlaMinutes: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.venueId, {
      policy: args.policy,
      allowedDomains: args.allowedDomains,
      minutesSavedPerAutoAnswer: args.minutesSavedPerAutoAnswer,
      hourlyCostEur: args.hourlyCostEur,
      escalationSlaMinutes: args.escalationSlaMinutes,
      confidenceThreshold: args.confidenceThreshold ?? 0.72
    });
    return { ok: true };
  }
});
