import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { venueId } = (await request.json()) as { venueId?: string };
  if (!venueId) {
    return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
  }
  const token = `guest_${venueId}_${Date.now()}`;
  return NextResponse.json({ token });
}
