import { NextResponse } from "next/server";
import { handleMessage } from "../../../../lib/decision-pipeline";

export async function POST(request: Request) {
  const { venueId, conversationId, question } = (await request.json()) as {
    venueId?: string;
    conversationId?: string;
    question?: string;
  };
  if (!venueId || !conversationId || !question) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }
  const token = request.headers.get("X-Venna-Token");
  if (!token || !token.includes(`_${venueId}_`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = handleMessage({ venueId, conversationId, text: question });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
