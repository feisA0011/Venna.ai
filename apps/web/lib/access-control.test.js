import test from "node:test";
import assert from "node:assert/strict";
import {
  __setMembershipsForTests,
  assertVenueAccess,
  listUserVenues
} from "./access-control.js";

test("user from venue A cannot access venue B data", () => {
  __setMembershipsForTests([
    { userId: "user-a", venueId: "venue-a", role: "owner" },
    { userId: "user-b", venueId: "venue-b", role: "owner" }
  ]);

  assert.throws(() =>
    assertVenueAccess({ userId: "user-a", venueId: "venue-b", action: "read" })
  );
});

test("staff cannot change billing or settings", () => {
  __setMembershipsForTests([{ userId: "staff-a", venueId: "venue-a", role: "staff" }]);

  assert.throws(() =>
    assertVenueAccess({ userId: "staff-a", venueId: "venue-a", action: "settings" })
  );
  assert.throws(() =>
    assertVenueAccess({ userId: "staff-a", venueId: "venue-a", action: "billing" })
  );
});

test("viewer is read-only", () => {
  __setMembershipsForTests([{ userId: "viewer-a", venueId: "venue-a", role: "viewer" }]);

  assert.doesNotThrow(() =>
    assertVenueAccess({ userId: "viewer-a", venueId: "venue-a", action: "read" })
  );
  assert.throws(() =>
    assertVenueAccess({ userId: "viewer-a", venueId: "venue-a", action: "write" })
  );
});

test("multi-venue owner can list and switch eligible venues", () => {
  __setMembershipsForTests([
    { userId: "owner-multi", venueId: "venue-a", role: "owner" },
    { userId: "owner-multi", venueId: "venue-b", role: "owner" }
  ]);

  const venues = listUserVenues("owner-multi");
  assert.equal(venues.length, 2);
  assert.deepEqual(
    venues.map((v) => v.venueId).sort(),
    ["venue-a", "venue-b"]
  );
});
