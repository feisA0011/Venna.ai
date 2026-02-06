import { NextResponse } from "next/server";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../lib/access-control";

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  const body = await request.json();
  const venueId = String(body.venueId ?? "");
  const action = String(body.action ?? "settings");

  try {
    assertVenueAccess({
      userId,
      venueId,
      action: action === "billing" ? "billing" : "settings"
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
