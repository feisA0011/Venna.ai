import { NextResponse } from "next/server";
import { reviewDocument } from "../../../../../../../lib/knowledge-ingestion";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const body = await request.json();
  const venueId = String(body.venueId ?? "demo-venue");
  const status = body.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { documentId } = await params;
  const document = reviewDocument({ venueId, documentId, status });
  return NextResponse.json({ document });
}
