const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const similarity = (a, b) => {
  const aTokens = new Set(normalize(a));
  const bTokens = new Set(normalize(b));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(aTokens.size, bTokens.size);
};

const defaultVenueData = {
  "demo-venue": {
    confidenceThreshold: 0.72,
    docs: [
      {
        id: "doc_hours",
        title: "Opening Hours",
        source: "ops/venue-handbook.md",
        status: "approved",
        content: "We are open every day from 8am to 10pm. Kitchen closes at 9:30pm."
      },
      {
        id: "doc_allergens",
        title: "Allergen Policy",
        source: "ops/allergen-policy.md",
        status: "approved",
        content:
          "For allergen requests staff must verify current ingredients. Menu can change daily and guest safety is priority."
      },
      {
        id: "doc_reservations",
        title: "Reservation Policy",
        source: "ops/reservations.md",
        status: "pending",
        content: "Reservations may be changed up to 2 hours before booking time, subject to availability."
      }
    ],
    verifiedMemory: [
      {
        question: "What time do you close?",
        answer: "We are open daily until 10pm, and the kitchen closes at 9:30pm.",
        confidence: 0.97,
        sources: ["ops/venue-handbook.md"],
        verified: true
      }
    ]
  }
};

const state = globalThis.__vennaDecisionState ?? {
  venues: structuredClone(defaultVenueData),
  logs: [],
  escalations: []
};

globalThis.__vennaDecisionState = state;

const draftAnswer = ({ docs }) => {
  const citations = docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    source: doc.source
  }));
  const context = docs.map((doc) => doc.content).join(" ");
  const confidenceBase = docs[0]?.score ?? 0;
  const confidence = Math.max(0, Math.min(1, 0.55 + confidenceBase * 0.45));
  return {
    message: `Based on verified venue docs: ${context}`,
    confidence,
    sources: citations
  };
};

const ensureVenue = (venueId) => {
  const venue = state.venues[venueId];
  if (!venue) {
    throw new Error(`Unknown venue: ${venueId}`);
  }
  return venue;
};

export const handleMessage = ({ venueId, conversationId, text }) => {
  const venue = ensureVenue(venueId);

  const cacheHit = venue.verifiedMemory
    .filter((entry) => entry.verified)
    .map((entry) => ({ entry, score: similarity(text, entry.question) }))
    .sort((a, b) => b.score - a.score)[0];

  if (cacheHit && cacheHit.score >= 0.82) {
    const result = {
      type: "answer",
      message: cacheHit.entry.answer,
      confidence: Math.max(cacheHit.entry.confidence, cacheHit.score),
      sources: cacheHit.entry.sources
    };
    state.logs.push({
      venueId,
      conversationId,
      message: text,
      route: "cache",
      confidence: result.confidence,
      createdAt: Date.now()
    });
    return result;
  }

  const rankedDocs = venue.docs
    .filter((doc) => doc.status === "approved")
    .map((doc) => ({ doc, score: similarity(text, doc.content) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((item) => item.score > 0);

  const llmDraft = draftAnswer({
    docs: rankedDocs.map((item) => ({ ...item.doc, score: item.score }))
  });
  const hasCitations = llmDraft.sources.length > 0;
  const shouldEscalate = llmDraft.confidence < venue.confidenceThreshold || !hasCitations;

  if (shouldEscalate) {
    const escalation = {
      id: `esc_${Date.now()}`,
      venueId,
      conversationId,
      reason: !hasCitations ? "No supporting citations" : "Low model confidence",
      userMessage: text,
      confidence: llmDraft.confidence,
      createdAt: Date.now(),
      status: "open"
    };
    state.escalations.push(escalation);
    state.logs.push({
      venueId,
      conversationId,
      message: text,
      route: "escalation",
      confidence: llmDraft.confidence,
      createdAt: Date.now()
    });
    return {
      type: "escalation",
      message: "I want to verify this with venue staff before I answer.",
      confidence: llmDraft.confidence,
      sources: llmDraft.sources.map((source) => source.source)
    };
  }

  state.logs.push({
    venueId,
    conversationId,
    message: text,
    route: "llm",
    confidence: llmDraft.confidence,
    createdAt: Date.now()
  });

  venue.verifiedMemory.push({
    question: text,
    answer: llmDraft.message,
    confidence: llmDraft.confidence,
    sources: llmDraft.sources.map((source) => source.source),
    verified: true
  });

  return {
    type: "answer",
    message: llmDraft.message,
    confidence: llmDraft.confidence,
    sources: llmDraft.sources.map((source) => source.source)
  };
};

export const listEscalations = ({ venueId }) =>
  state.escalations.filter((item) => item.venueId === venueId).sort((a, b) => b.createdAt - a.createdAt);

export const listLogs = ({ venueId }) =>
  state.logs.filter((item) => item.venueId === venueId).sort((a, b) => b.createdAt - a.createdAt);

export const __resetDecisionStateForTests = () => {
  state.venues = structuredClone(defaultVenueData);
  state.logs = [];
  state.escalations = [];
};
