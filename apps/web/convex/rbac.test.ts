import { describe, expect, it } from "vitest";
import {
  assertVenueMembership,
  canManageBilling,
  canManageSettings,
  canWriteVenue
} from "./rbac";

describe("venue isolation + role access", () => {
  it("blocks user from venue A accessing venue B", () => {
    const membership = {
      userId: "user_1",
      venueId: "venue_A",
      role: "owner" as const
    };

    expect(() => assertVenueMembership(membership, "venue_B", "viewer")).toThrow(
      "Forbidden: venue access denied"
    );
  });

  it("prevents staff from managing billing/settings", () => {
    expect(canManageSettings("staff")).toBe(false);
    expect(canManageBilling("staff")).toBe(false);
  });

  it("enforces viewer as read-only", () => {
    expect(canWriteVenue("viewer")).toBe(false);
    expect(canManageSettings("viewer")).toBe(false);
    expect(canManageBilling("viewer")).toBe(false);
  });
});
