import { mutation, query } from "convex/server";
import { v } from "convex/values";
import { requireVenueAccess } from "./access";

export const createVenue = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    locale: v.string()
  },
  handler: async (ctx, args) => {
    const venueId = await ctx.db.insert("venues", {
      name: args.name,
      locale: args.locale,
      confidenceThreshold: 0.72
    });

    await ctx.db.insert("memberships", {
      userId: args.userId,
      venueId,
      role: "owner"
    });

    return venueId;
  }
});

export const upsertVenuePolicy = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    policy: v.string(),
    confidenceThreshold: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "manager");

    await ctx.db.patch(args.venueId, {
      policy: args.policy,
      confidenceThreshold: args.confidenceThreshold ?? 0.72
    });
    return { ok: true };
  }
});

export const updateVenueBilling = mutation({
  args: {
    userId: v.string(),
    venueId: v.id("venues"),
    billingEmail: v.string()
  },
  handler: async (ctx, args) => {
    await requireVenueAccess(ctx, args, "owner");

    await ctx.db.patch(args.venueId, {
      billingEmail: args.billingEmail
    });
    return { ok: true };
  }
});

export const listUserVenues = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const venues = await Promise.all(
      memberships.map(async (membership) => {
        const venue = await ctx.db.get(membership.venueId);
        return venue
          ? {
              venueId: venue._id,
              name: venue.name,
              role: membership.role
            }
          : null;
      })
    );

    return venues.filter((item): item is NonNullable<typeof item> => item !== null);
  }
});
