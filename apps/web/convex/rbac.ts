export const roles = ["owner", "manager", "staff", "viewer"] as const;

export type Role = (typeof roles)[number];

type Membership = {
  userId: string;
  venueId: string;
  role: Role;
};

const roleRank: Record<Role, number> = {
  viewer: 0,
  staff: 1,
  manager: 2,
  owner: 3
};

export const hasMinimumRole = (role: Role, minimumRole: Role): boolean =>
  roleRank[role] >= roleRank[minimumRole];

export const canReadVenue = (role: Role): boolean => hasMinimumRole(role, "viewer");

export const canWriteVenue = (role: Role): boolean => hasMinimumRole(role, "staff");

export const canManageSettings = (role: Role): boolean => hasMinimumRole(role, "manager");

export const canManageBilling = (role: Role): boolean => role === "owner";

export const assertVenueMembership = (
  membership: Membership | null,
  venueId: string,
  minimumRole: Role
): Membership => {
  if (!membership || membership.venueId !== venueId) {
    throw new Error("Forbidden: venue access denied");
  }

  if (!hasMinimumRole(membership.role, minimumRole)) {
    throw new Error("Forbidden: role does not permit this action");
  }

  return membership;
};
