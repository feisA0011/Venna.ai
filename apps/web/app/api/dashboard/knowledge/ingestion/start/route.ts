import { NextResponse } from "next/server";
import { runIngestion } from "../../../../../../lib/knowledge-ingestion";
import { assertVenueAccess, getUserIdFromRequest } from "../../../../../../lib/access-control";

export async function POST(request: Request) {
  const body = await request.json();
  const venueId = String(body.venueId ?? "");
  const url = String(body.url ?? "");
  const userId = getUserIdFromRequest(request);

  try {
    assertVenueAccess({ userId, venueId, action: "write" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const job = await runIngestion({ venueId, url });
  return NextResponse.json({ job });
}
