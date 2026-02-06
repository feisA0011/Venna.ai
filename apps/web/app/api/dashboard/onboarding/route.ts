import { NextResponse } from "next/server";
import { getOnboardingState, setGoLive, updateOnboarding } from "../../../../lib/onboarding-state";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? "demo-venue";
  return NextResponse.json(getOnboardingState(venueId));
}

export async function POST(request: Request) {
  const body = await request.json();
  const venueId = String(body.venueId ?? "demo-venue");
  const action = String(body.action ?? "patch");

  if (action === "setGoLive") {
    try {
      const venue = setGoLive({ venueId, enabled: Boolean(body.enabled) });
      return NextResponse.json({ venue, state: getOnboardingState(venueId) });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not update go live" },
        { status: 400 }
      );
    }
  }

  updateOnboarding({
    venueId,
    patch: {
      profile: body.profile,
      allowedDomains: Array.isArray(body.allowedDomains) ? body.allowedDomains : undefined,
      websiteUrl: typeof body.websiteUrl === "string" ? body.websiteUrl : undefined,
      escalationInboxEnabled:
        typeof body.escalationInboxEnabled === "boolean" ? body.escalationInboxEnabled : undefined
    }
  });

  return NextResponse.json(getOnboardingState(venueId));
}
