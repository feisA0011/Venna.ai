import { createHash } from "node:crypto";

const INGEST_PATHS = ["", "/menu", "/contact", "/booking", "/faq"];
const FETCH_TIMEOUT_MS = 7_000;

const state = globalThis.__vennaKnowledgeState ?? {
  jobs: [],
  documents: []
};

globalThis.__vennaKnowledgeState = state;

const normalizeBaseUrl = (value) => {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
};

const cleanTextFromHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hashContent = (value) => createHash("sha256").update(value).digest("hex");

const fetchWithTimeout = async (url) =>
  fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "user-agent": "VennaBot/1.0 (+https://venna.ai)" }
  });

const parseDisallowRules = (robotsText) =>
  robotsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().startsWith("disallow:"))
    .map((line) => line.split(":")[1]?.trim())
    .filter(Boolean);

const pathBlockedByRobots = (path, disallowRules) =>
  disallowRules.some((rule) => rule !== "/" && path.startsWith(rule));

export const runIngestion = async ({ venueId, url }) => {
  const baseUrl = normalizeBaseUrl(url);
  const job = {
    id: `job_${Date.now()}`,
    venueId,
    url: baseUrl,
    status: "running",
    logs: ["Starting ingestion"],
    createdAt: Date.now()
  };
  state.jobs.unshift(job);

  try {
    let disallowRules = [];
    try {
      const robotsUrl = new URL("/robots.txt", baseUrl).toString();
      const robotsResponse = await fetchWithTimeout(robotsUrl);
      if (robotsResponse.ok) {
        disallowRules = parseDisallowRules(await robotsResponse.text());
        job.logs.push(`Loaded robots.txt from ${robotsUrl}`);
      }
    } catch {
      job.logs.push("robots.txt unavailable; default allow");
    }

    for (const path of INGEST_PATHS) {
      const pageUrl = new URL(path || "/", baseUrl).toString();
      if (pathBlockedByRobots(new URL(pageUrl).pathname, disallowRules)) {
        job.logs.push(`Skipped ${pageUrl} due to robots.txt`);
        continue;
      }

      try {
        const response = await fetchWithTimeout(pageUrl);
        if (!response.ok) {
          job.logs.push(`Skipped ${pageUrl}; HTTP ${response.status}`);
          continue;
        }
        const html = await response.text();
        const content = cleanTextFromHtml(html);
        if (!content) {
          job.logs.push(`Skipped ${pageUrl}; no extractable text`);
          continue;
        }

        const contentHash = hashContent(content);
        const existing = state.documents.find(
          (doc) => doc.venueId === venueId && doc.sourceUrl === pageUrl
        );

        if (existing && existing.hash === contentHash) {
          existing.extractedAt = Date.now();
          job.logs.push(`No changes detected for ${pageUrl}`);
          continue;
        }

        if (existing) {
          existing.content = content;
          existing.hash = contentHash;
          existing.extractedAt = Date.now();
          existing.status = "pending";
          job.logs.push(`Updated document ${existing.documentId} from ${pageUrl}`);
          continue;
        }

        const documentId = `doc_${Math.random().toString(36).slice(2, 10)}`;
        state.documents.unshift({
          documentId,
          venueId,
          sourceUrl: pageUrl,
          content,
          extractedAt: Date.now(),
          hash: contentHash,
          status: "pending"
        });
        job.logs.push(`Created document ${documentId} from ${pageUrl}`);
      } catch {
        job.logs.push(`Failed to fetch ${pageUrl}`);
      }
    }

    job.status = "completed";
    job.logs.push("Ingestion completed");
    return job;
  } catch (error) {
    job.status = "failed";
    job.logs.push(`Ingestion failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return job;
  }
};

export const listDocuments = ({ venueId, status }) =>
  state.documents.filter((doc) => doc.venueId === venueId && (!status || doc.status === status));

export const reviewDocument = ({ venueId, documentId, status }) => {
  const document = state.documents.find(
    (item) => item.venueId === venueId && item.documentId === documentId
  );
  if (!document) throw new Error("Document not found");
  document.status = status;
  return document;
};

export const getApprovedDocumentsForAnswering = (venueId) =>
  state.documents.filter((doc) => doc.venueId === venueId && doc.status === "approved");

export const __resetKnowledgeStateForTests = () => {
  state.jobs = [];
  state.documents = [];
};
