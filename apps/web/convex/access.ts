import type { MutationCtx, QueryCtx } from "convex/server";
import { assertVenueMembership, type Role } from "./rbac";

const getMembership = async (
  ctx: QueryCtx | MutationCtx,
  userId: string,
  venueId: string
) => {
  return ctx.db
    .query("memberships")
    .withIndex("by_user_and_venue", (q) => q.eq("userId", userId).eq("venueId", venueId as never))
    .unique();
};

export const requireVenueAccess = async (
  ctx: QueryCtx | MutationCtx,
  args: {
    userId: string;
    venueId: string;
  },
  minimumRole: Role
) => {
  const membership = await getMembership(ctx, args.userId, args.venueId);
  return assertVenueMembership(
    membership
      ? { userId: membership.userId, venueId: membership.venueId as string, role: membership.role }
      : null,
    args.venueId,
    minimumRole
  );
};
