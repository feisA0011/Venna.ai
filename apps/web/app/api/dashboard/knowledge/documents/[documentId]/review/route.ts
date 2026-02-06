import { NextResponse } from "next/server";
import { reviewDocument } from "../../../../../../../lib/knowledge-ingestion";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../../../../lib/access-control";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const body = await request.json();
  const venueId = String(body.venueId ?? "");
  const userId = getUserIdFromRequest(request);
  const status = body.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { documentId } = await params;
  try {
    assertVenueAccess({ userId, venueId, action: "write" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }
  const document = reviewDocument({ venueId, documentId, status });
  return NextResponse.json({ document });
}
