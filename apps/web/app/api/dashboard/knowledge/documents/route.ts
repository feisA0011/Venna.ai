import { NextResponse } from "next/server";
import { listDocuments } from "../../../../../lib/knowledge-ingestion";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "demo-venue";
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "pending" || statusParam === "approved" || statusParam === "rejected"
      ? statusParam
      : undefined;

  return NextResponse.json({ documents: listDocuments({ venueId, status }) });
}
