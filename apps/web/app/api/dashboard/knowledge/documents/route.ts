import { NextResponse } from "next/server";
import { listDocuments } from "../../../../../lib/knowledge-ingestion";
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

  const statusParam = searchParams.get("status");
  const status =
    statusParam === "pending" || statusParam === "approved" || statusParam === "rejected"
      ? statusParam
      : undefined;

  return NextResponse.json({ documents: listDocuments({ venueId, status }) });
}
