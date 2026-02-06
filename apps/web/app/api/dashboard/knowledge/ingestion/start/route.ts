import { NextResponse } from "next/server";
import { runIngestion } from "../../../../../../lib/knowledge-ingestion";

export async function POST(request: Request) {
  const body = await request.json();
  const venueId = String(body.venueId ?? "demo-venue");
  const url = String(body.url ?? "");

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const job = await runIngestion({ venueId, url });
  return NextResponse.json({ job });
}
