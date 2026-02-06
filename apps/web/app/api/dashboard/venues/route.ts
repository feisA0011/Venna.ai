import { NextResponse } from "next/server";
import { getUserIdFromRequest, listUserVenues } from "../../../../lib/access-control";

export function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: missing user context" }, { status: 401 });
  }

  const venues = listUserVenues(userId);
  return NextResponse.json({ userId, venues });
}
