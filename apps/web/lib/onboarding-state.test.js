import test from "node:test";
import assert from "node:assert/strict";
import { __resetKnowledgeStateForTests, listDocuments, reviewDocument, runIngestion } from "./knowledge-ingestion.js";
import { __resetOnboardingStateForTests, getOnboardingState, setGoLive, updateOnboarding } from "./onboarding-state.js";

const makeResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body
});

test("go live is blocked until checklist is complete", async () => {
  __resetOnboardingStateForTests();
  __resetKnowledgeStateForTests();

  updateOnboarding({
    venueId: "venue-x",
    patch: {
      profile: {
        name: "Venue X",
        address: "1 Main St",
        phone: "+123",
        languageDefault: "en"
      },
      allowedDomains: ["https://venuex.com"]
    }
  });

  assert.throws(() => setGoLive({ venueId: "venue-x", enabled: true }));

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (String(url).endsWith("/robots.txt")) return makeResponse(200, "User-agent: *\nDisallow:");
    if (String(url).endsWith("/")) return makeResponse(200, "<html><body>Hours and menu</body></html>");
    return makeResponse(404, "missing");
  };

  await runIngestion({ venueId: "venue-x", url: "https://venuex.com" });
  const pending = getOnboardingState("venue-x");
  const pendingDoc = pending.docs.pending;
  assert.equal(pendingDoc > 0, true);

  const docs = listDocuments({ venueId: "venue-x", status: "pending" });
  reviewDocument({ venueId: "venue-x", documentId: docs[0].documentId, status: "approved" });

  updateOnboarding({ venueId: "venue-x", patch: { escalationInboxEnabled: true } });
  const ready = getOnboardingState("venue-x");
  assert.equal(ready.canGoLive, true);

  setGoLive({ venueId: "venue-x", enabled: true });
  assert.equal(getOnboardingState("venue-x").venue.goLive, true);

  global.fetch = originalFetch;
});
