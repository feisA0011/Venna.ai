import { NextResponse } from "next/server";
import { aggregateVenueAnalytics } from "../../../../../lib/venue-analytics";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "demo-venue";
  const analytics = aggregateVenueAnalytics({ venueId });
  return NextResponse.json({ analytics });
}
