import { NextResponse } from "next/server";
import { handleMessage } from "../../../../lib/decision-pipeline";
import {
  corsHeaders,
  enforceWidgetRateLimit,
  getRequestOrigin,
  isLikelyBotRequest,
  isOriginAllowed,
  verifyGuestToken,
  widgetApiSecurityHeaders
} from "../../../../lib/widget-security";
import { recordConversationAnalytics } from "../../../../lib/venue-analytics";

const jsonResponse = (origin: string, body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      ...widgetApiSecurityHeaders,
      ...corsHeaders(origin)
    }
  });

const getAuthToken = (request: Request) => {
  const directToken = request.headers.get("x-venna-token");
  if (directToken) return directToken;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return "";
};

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
  const startedAt = Date.now();
  const origin = getRequestOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Missing origin" }, { status: 400, headers: widgetApiSecurityHeaders });
  }

  const { venueId, conversationId, question } = (await request.json()) as {
    venueId?: string;
    conversationId?: string;
    question?: string;
  };
  if (!venueId || !conversationId || !question) {
    return jsonResponse(origin, { error: "Missing input" }, 400);
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

  const rateLimit = enforceWidgetRateLimit({ request, venueId, endpoint: "answer" });
  if (!rateLimit.ok) {
    return jsonResponse(origin, { error: "Rate limit exceeded" }, 429);
  }

  const token = getAuthToken(request);
  const verifiedToken = verifyGuestToken({ token, venueId, origin });
  if (!verifiedToken.ok) {
    return jsonResponse(origin, { error: `Unauthorized: ${verifiedToken.reason}` }, 401);
  }

  try {
    const result = handleMessage({ venueId, conversationId, text: question });
    recordConversationAnalytics({
      venueId,
      route: result.type === "escalation" ? "escalation" : "llm",
      question,
      responseLatencyMs: Date.now() - startedAt
    });
    return jsonResponse(origin, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse(origin, { error: message }, 400);
  }
}
