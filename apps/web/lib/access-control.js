const membershipState = globalThis.__vennaMembershipState ?? {
  memberships: [
    { userId: "owner_demo", venueId: "demo-venue", role: "owner" },
    { userId: "owner_multi", venueId: "demo-venue", role: "owner" },
    { userId: "owner_multi", venueId: "venue-b", role: "owner" },
    { userId: "manager_demo", venueId: "demo-venue", role: "manager" },
    { userId: "staff_demo", venueId: "demo-venue", role: "staff" },
    { userId: "viewer_demo", venueId: "demo-venue", role: "viewer" },
    { userId: "owner_b", venueId: "venue-b", role: "owner" }
  ]
};

globalThis.__vennaMembershipState = membershipState;

const permissionsByRole = {
  owner: new Set(["read", "write", "settings", "billing"]),
  manager: new Set(["read", "write", "settings"]),
  staff: new Set(["read", "write"]),
  viewer: new Set(["read"])
};

export const getUserIdFromRequest = (request) => {
  const headerUserId = request.headers.get("x-venna-user-id");
  if (headerUserId) return headerUserId;
  const { searchParams } = new URL(request.url);
  return searchParams.get("userId") ?? "";
};

export const getMembership = ({ userId, venueId }) =>
  membershipState.memberships.find(
    (membership) => membership.userId === userId && membership.venueId === venueId
  ) ?? null;

export const assertVenueAccess = ({ userId, venueId, action }) => {
  if (!userId) {
    throw new Error("Unauthorized: missing user context");
  }
  if (!venueId) {
    throw new Error("venueId is required");
  }

  const membership = getMembership({ userId, venueId });
  if (!membership) {
    throw new Error("Forbidden: user is not a member of this venue");
  }

  const allowedActions = permissionsByRole[membership.role] ?? new Set();
  if (!allowedActions.has(action)) {
    throw new Error(`Forbidden: role ${membership.role} cannot perform ${action}`);
  }

  return membership;
};

export const listUserVenues = (userId) =>
  membershipState.memberships.filter((membership) => membership.userId === userId);

export const __resetMembershipStateForTests = () => {
  membershipState.memberships = [];
};

export const __setMembershipsForTests = (memberships) => {
  membershipState.memberships = memberships;
};
