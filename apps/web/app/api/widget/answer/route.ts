import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { venueId, question } = (await request.json()) as {
    venueId?: string;
    question?: string;
  };
  if (!venueId || !question) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }
  const token = request.headers.get("X-Venna-Token");
  if (!token || !token.includes(`_${venueId}_`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const confidence = 0.0;
  const answer =
    "I don't have approved venue knowledge for that yet, so I'll check with staff to confirm.";
  return NextResponse.json({ answer, confidence });
}
