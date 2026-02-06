import { NextResponse } from "next/server";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../../../lib/access-control";
import { replyToEscalation } from "../../../../../../lib/decision-pipeline";

type ReplyBody = {
  venueId?: string;
  message?: string;
  resolve?: boolean;
  verifiedAnswer?: boolean;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ escalationId: string }> }
) {
  const userId = getUserIdFromRequest(request);
  const body = (await request.json()) as ReplyBody;
  const venueId = body.venueId ?? "";

  try {
    assertVenueAccess({ userId, venueId, action: "write" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const { escalationId } = await params;
    const escalation = replyToEscalation({
      venueId,
      escalationId,
      userId,
      message: body.message,
      resolve: body.resolve === true,
      verifiedAnswer: body.verifiedAnswer === true
    });
    return NextResponse.json({ escalation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update escalation" },
      { status: 400 }
    );
  }
}
