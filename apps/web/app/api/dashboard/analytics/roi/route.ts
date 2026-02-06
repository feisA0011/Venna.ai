import { NextResponse } from "next/server";
import { aggregateVenueAnalytics } from "../../../../../lib/venue-analytics";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../../lib/access-control";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "";
  const userId = getUserIdFromRequest(request);
  try {
    assertVenueAccess({ userId, venueId, action: "read" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }
  const analytics = aggregateVenueAnalytics({ venueId });
  return NextResponse.json({ analytics });
}
