export function getClientIp(request: Request): string;
export function getRequestOrigin(request: Request): string;
export function getAllowedDomains(venueId: string): string[];
export function isOriginAllowed(input: { venueId: string; origin: string }): boolean;
export function issueGuestToken(input: { venueId: string; origin: string; now?: number }): string;
export function verifyGuestToken(input: {
  token: string;
  venueId: string;
  origin: string;
  now?: number;
}): { ok: boolean; reason?: string; payload?: { venueId: string; origin: string; exp: number; iat: number } };
export function isLikelyBotRequest(request: Request): boolean;
export function checkRateLimit(input: {
  key: string;
  limit: number;
  now?: number;
}): { ok: boolean; remaining: number; resetAt?: number };
export function enforceWidgetRateLimit(input: {
  request: Request;
  venueId: string;
  endpoint: "token" | "answer";
}): { ok: boolean; remaining: number; resetAt?: number };
export function corsHeaders(origin: string): Record<string, string>;
export const widgetApiSecurityHeaders: Record<string, string>;
export function __resetWidgetSecurityStateForTests(): void;
