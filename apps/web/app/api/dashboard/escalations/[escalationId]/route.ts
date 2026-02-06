import { NextResponse } from "next/server";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../../lib/access-control";
import { getEscalationById } from "../../../../../lib/decision-pipeline";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ escalationId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "";
  const userId = getUserIdFromRequest(request);

  try {
    assertVenueAccess({ userId, venueId, action: "read" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }

  try {
    const { escalationId } = await params;
    return NextResponse.json({ escalation: getEscalationById({ venueId, escalationId }) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Escalation not found" },
      { status: 404 }
    );
  }
}
