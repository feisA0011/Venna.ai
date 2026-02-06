import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetWidgetSecurityStateForTests,
  enforceWidgetRateLimit,
  issueGuestToken,
  isOriginAllowed,
  verifyGuestToken
} from "./widget-security.js";

const makeRequest = ({ origin = "http://localhost:3002", ip = "1.2.3.4", userAgent = "Mozilla/5.0", secFetchSite = "cross-site" } = {}) =>
  new Request("https://venna.test/api/widget/token", {
    method: "POST",
    headers: {
      origin,
      "x-forwarded-for": ip,
      "user-agent": userAgent,
      "sec-fetch-site": secFetchSite
    }
  });

test("origin mismatch fails", () => {
  __resetWidgetSecurityStateForTests();
  assert.equal(isOriginAllowed({ venueId: "demo-venue", origin: "https://evil.test" }), false);

  const token = issueGuestToken({ venueId: "demo-venue", origin: "http://localhost:3002", now: 1_000 });
  const verified = verifyGuestToken({
    token,
    venueId: "demo-venue",
    origin: "https://evil.test",
    now: 2_000
  });
  assert.equal(verified.ok, false);
  assert.equal(verified.reason, "origin_mismatch");
});

test("expired token fails", () => {
  const token = issueGuestToken({ venueId: "demo-venue", origin: "http://localhost:3002", now: 1_000 });
  const verified = verifyGuestToken({
    token,
    venueId: "demo-venue",
    origin: "http://localhost:3002",
    now: 1_000 + 15 * 60 * 1000 + 1
  });
  assert.equal(verified.ok, false);
  assert.equal(verified.reason, "expired");
});

test("token cannot be used for other venue", () => {
  const token = issueGuestToken({ venueId: "demo-venue", origin: "http://localhost:3002", now: 1_000 });
  const verified = verifyGuestToken({
    token,
    venueId: "other-venue",
    origin: "http://localhost:3002",
    now: 2_000
  });
  assert.equal(verified.ok, false);
  assert.equal(verified.reason, "venue_mismatch");
});

test("rate limit applies per ip and venue", () => {
  __resetWidgetSecurityStateForTests();
  const request = makeRequest();

  let blocked = false;
  for (let i = 0; i < 70; i += 1) {
    const result = enforceWidgetRateLimit({ request, venueId: "demo-venue", endpoint: "answer" });
    if (!result.ok) {
      blocked = true;
      break;
    }
  }

  assert.equal(blocked, true);
});
