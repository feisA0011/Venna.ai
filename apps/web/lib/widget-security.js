import { createHmac, timingSafeEqual } from "node:crypto";
import { getAllowedDomainsForVenue } from "./onboarding-state.js";

const TOKEN_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const TOKEN_LIMIT_PER_WINDOW = 25;
const ANSWER_LIMIT_PER_WINDOW = 60;

const rateState = globalThis.__vennaWidgetRateState ?? new Map();
globalThis.__vennaWidgetRateState = rateState;

const normalizeDomain = (value) => value.trim().toLowerCase();

const venueOriginConfig = {
  "demo-venue": ["http://localhost:3000", "http://localhost:3002", "http://127.0.0.1:3002"]
};

const envConfig = process.env.VENNA_ALLOWED_ORIGINS_JSON;
if (envConfig) {
  try {
    const parsed = JSON.parse(envConfig);
    if (parsed && typeof parsed === "object") {
      for (const [venueId, domains] of Object.entries(parsed)) {
        if (Array.isArray(domains)) {
          venueOriginConfig[venueId] = domains.map((domain) => normalizeDomain(String(domain)));
        }
      }
    }
  } catch {
    // ignore invalid env config
  }
}

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

const signingSecret = () => process.env.WIDGET_TOKEN_SECRET ?? "venna-dev-widget-secret-change-me";

export const getClientIp = (request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
};

export const getRequestOrigin = (request) => request.headers.get("origin")?.toLowerCase() ?? "";

export const getAllowedDomains = (venueId) => venueOriginConfig[venueId] ?? [];

const resolveAllowedDomains = (venueId) => {
  const onboardingDomains = getAllowedDomainsForVenue(venueId);
  if (onboardingDomains.length > 0) {
    return onboardingDomains.map((domain) => normalizeDomain(domain));
  }
  return getAllowedDomains(venueId).map((domain) => normalizeDomain(domain));
};

export const isOriginAllowed = ({ venueId, origin }) => {
  if (!origin) return false;
  const allowedDomains = resolveAllowedDomains(venueId);
  return allowedDomains.includes(normalizeDomain(origin));
};

const signPayload = (payload) =>
  createHmac("sha256", signingSecret()).update(payload).digest("base64url");

export const issueGuestToken = ({ venueId, origin, now = Date.now() }) => {
  const payload = {
    venueId,
    origin: normalizeDomain(origin),
    exp: now + TOKEN_TTL_MS,
    iat: now
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyGuestToken = ({ token, venueId, origin, now = Date.now() }) => {
  if (!token || !token.includes(".")) return { ok: false, reason: "malformed" };
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return { ok: false, reason: "malformed" };

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "invalid_signature" };
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (payload.exp <= now) return { ok: false, reason: "expired" };
  if (payload.venueId !== venueId) return { ok: false, reason: "venue_mismatch" };
  if (normalizeDomain(payload.origin) !== normalizeDomain(origin)) {
    return { ok: false, reason: "origin_mismatch" };
  }

  return { ok: true, payload };
};

export const isLikelyBotRequest = (request) => {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";
  if (!userAgent) return true;
  if (["bot", "spider", "crawler", "curl", "wget", "python", "postman"].some((token) => userAgent.includes(token))) {
    return true;
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (!secFetchSite) return true;
  return false;
};

export const checkRateLimit = ({ key, limit, now = Date.now() }) => {
  const current = rateState.get(key);
  if (!current || current.resetAt <= now) {
    rateState.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count };
};

export const enforceWidgetRateLimit = ({ request, venueId, endpoint }) => {
  const ip = getClientIp(request);
  const limit = endpoint === "token" ? TOKEN_LIMIT_PER_WINDOW : ANSWER_LIMIT_PER_WINDOW;
  return checkRateLimit({ key: `${endpoint}:${venueId}:${ip}`, limit });
};

export const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-venna-token, authorization",
  "Access-Control-Max-Age": "300",
  Vary: "Origin"
});

export const widgetApiSecurityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};

export const __resetWidgetSecurityStateForTests = () => {
  rateState.clear();
};
