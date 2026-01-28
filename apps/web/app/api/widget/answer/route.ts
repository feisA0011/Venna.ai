import { NextResponse } from "next/server";

const lowConfidenceTerms = ["allergen", "allergy", "shellfish", "gluten", "vegan"];

export async function POST(request: Request) {
  const { venueId, question } = (await request.json()) as {
    venueId?: string;
    question?: string;
  };
  if (!venueId || !question) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }
  const lowered = question.toLowerCase();
  const isLow = lowConfidenceTerms.some((term) => lowered.includes(term));
  const confidence = isLow ? 0.45 : 0.84;
  const answer = isLow
    ? "I want to confirm this with the venue staff to avoid mistakes."
    : "The venue is open today and can assist with reservations. For detailed updates, I can check with staff.";
  return NextResponse.json({ answer, confidence });
}
