export type VenueRole = "owner" | "manager" | "staff" | "viewer";

export function getUserIdFromRequest(request: Request): string;
export function getMembership(input: { userId: string; venueId: string }): {
  userId: string;
  venueId: string;
  role: VenueRole;
} | null;
export function assertVenueAccess(input: {
  userId: string;
  venueId: string;
  action: "read" | "write" | "settings" | "billing";
}): {
  userId: string;
  venueId: string;
  role: VenueRole;
};
export function listUserVenues(userId: string): Array<{
  userId: string;
  venueId: string;
  role: VenueRole;
}>;
export function __resetMembershipStateForTests(): void;
export function __setMembershipsForTests(
  memberships: Array<{ userId: string; venueId: string; role: VenueRole }>
): void;
