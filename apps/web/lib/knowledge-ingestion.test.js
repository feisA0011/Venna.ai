import test from "node:test";
import assert from "node:assert/strict";
import {
  __resetKnowledgeStateForTests,
  getApprovedDocumentsForAnswering,
  listDocuments,
  reviewDocument,
  runIngestion
} from "./knowledge-ingestion.js";

const makeResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body
});

test("re-run ingestion updates changed docs by hash and resets to pending", async () => {
  __resetKnowledgeStateForTests();
  const originalFetch = global.fetch;
  let homepage = "<html><body>Alpha</body></html>";

  global.fetch = async (url) => {
    if (String(url).endsWith("/robots.txt")) return makeResponse(200, "User-agent: *\nDisallow:");
    if (String(url).endsWith("/")) return makeResponse(200, homepage);
    return makeResponse(404, "missing");
  };

  await runIngestion({ venueId: "demo-venue", url: "https://venue.test" });
  const [initialDoc] = listDocuments({ venueId: "demo-venue", status: "pending" });
  assert.ok(initialDoc);
  const initialHash = initialDoc.hash;

  reviewDocument({ venueId: "demo-venue", documentId: initialDoc.documentId, status: "approved" });
  assert.equal(getApprovedDocumentsForAnswering("demo-venue").length, 1);

  homepage = "<html><body>Bravo updated</body></html>";
  await runIngestion({ venueId: "demo-venue", url: "https://venue.test" });

  const [updatedDoc] = listDocuments({ venueId: "demo-venue", status: "pending" });
  assert.equal(updatedDoc.documentId, initialDoc.documentId);
  assert.notEqual(updatedDoc.hash, initialHash);

  global.fetch = originalFetch;
});
