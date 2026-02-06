import { NextResponse } from "next/server";
import {
  corsHeaders,
  enforceWidgetRateLimit,
  getRequestOrigin,
  isLikelyBotRequest,
  isOriginAllowed,
  issueGuestToken,
  widgetApiSecurityHeaders
} from "../../../../lib/widget-security";

const jsonResponse = (origin: string, body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      ...widgetApiSecurityHeaders,
      ...corsHeaders(origin)
    }
  });

export async function OPTIONS(request: Request) {
  const origin = getRequestOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400, headers: widgetApiSecurityHeaders });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...widgetApiSecurityHeaders,
      ...corsHeaders(origin)
    }
  });
}

export async function POST(request: Request) {
  const origin = getRequestOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400, headers: widgetApiSecurityHeaders });
  }

  const { venueId } = (await request.json()) as { venueId?: string };
  if (!venueId) {
    return jsonResponse(origin, { error: "Missing venueId" }, 400);
  }

  if (!isOriginAllowed({ venueId, origin })) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403, headers: widgetApiSecurityHeaders }
    );
  }

  if (isLikelyBotRequest(request)) {
    return jsonResponse(origin, { error: "Bot-like traffic rejected" }, 403);
  }

  const rateLimit = enforceWidgetRateLimit({ request, venueId, endpoint: "token" });
  if (!rateLimit.ok) {
    return jsonResponse(origin, { error: "Rate limit exceeded" }, 429);
  }

  const token = issueGuestToken({ venueId, origin });
  return jsonResponse(origin, { token, expiresInSeconds: 900 });
}
