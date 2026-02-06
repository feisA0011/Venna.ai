import { NextResponse } from "next/server";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../lib/access-control";
import { listEscalations } from "../../../../lib/decision-pipeline";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "";
  const userId = getUserIdFromRequest(request);

  try {
    assertVenueAccess({ userId, venueId, action: "read" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }

  const statusParam = searchParams.get("status");
  const status = statusParam === "resolved" ? "resolved" : "open";

  return NextResponse.json({ escalations: listEscalations({ venueId, status }) });
}
