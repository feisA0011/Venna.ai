const state = globalThis.__vennaAnalyticsState ?? {
  events: [],
  venueConfig: {
    "demo-venue": {
      minutesSavedPerAutoAnswer: 4,
      hourlyCostEur: 18,
      escalationSlaMinutes: 15
    }
  }
};

globalThis.__vennaAnalyticsState = state;

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const normalizeTopic = (question) => {
  const text = question.toLowerCase();
  if (/(hour|open|close|time)/.test(text)) return "hours";
  if (/(menu|dish|food|drink|allergen|vegan)/.test(text)) return "menu";
  if (/(book|reservation|table|cancel)/.test(text)) return "booking";
  if (/(address|where|location|parking|contact|phone)/.test(text)) return "contact";
  if (/(price|cost|fee|charge)/.test(text)) return "pricing";
  return "general";
};

export const configureVenueAnalytics = ({
  venueId,
  minutesSavedPerAutoAnswer,
  hourlyCostEur,
  escalationSlaMinutes
}) => {
  state.venueConfig[venueId] = {
    minutesSavedPerAutoAnswer,
    hourlyCostEur,
    escalationSlaMinutes
  };
};

export const recordConversationAnalytics = ({
  venueId,
  route,
  question,
  responseLatencyMs,
  createdAt = Date.now()
}) => {
  state.events.push({
    venueId,
    route,
    topic: normalizeTopic(question),
    responseLatencyMs,
    createdAt,
    escalationResolvedAt: null
  });
};

export const markEscalationResolved = ({ venueId, createdAt, resolvedAt }) => {
  const openEscalation = state.events.find(
    (item) =>
      item.venueId === venueId &&
      item.route === "escalation" &&
      item.createdAt === createdAt &&
      item.escalationResolvedAt == null
  );
  if (openEscalation) {
    openEscalation.escalationResolvedAt = resolvedAt;
  }
};

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

export const aggregateVenueAnalytics = ({ venueId, now = Date.now() }) => {
  const config =
    state.venueConfig[venueId] ??
    state.venueConfig["demo-venue"] ?? {
      minutesSavedPerAutoAnswer: 4,
      hourlyCostEur: 18,
      escalationSlaMinutes: 15
    };

  const monthStart = now - MONTH_MS;
  const monthlyEvents = state.events.filter(
    (item) => item.venueId === venueId && item.createdAt >= monthStart
  );
  const totalConversations = monthlyEvents.length;
  const autoAnswered = monthlyEvents.filter((item) => item.route !== "escalation").length;
  const escalated = monthlyEvents.filter((item) => item.route === "escalation").length;

  const autoAnsweredPercent = totalConversations === 0 ? 0 : (autoAnswered / totalConversations) * 100;
  const escalatedPercent = totalConversations === 0 ? 0 : (escalated / totalConversations) * 100;

  const medianResponseLatencyMs = median(monthlyEvents.map((item) => item.responseLatencyMs));

  const topicCounts = monthlyEvents.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] ?? 0) + 1;
    return acc;
  }, {});

  const topQuestionTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const minutesSaved = autoAnswered * config.minutesSavedPerAutoAnswer;
  const hoursSaved = minutesSaved / 60;
  const eurosSaved = hoursSaved * config.hourlyCostEur;

  const resolvedEscalations = monthlyEvents.filter(
    (item) => item.route === "escalation" && item.escalationResolvedAt != null
  );
  const escalationSlaMet = resolvedEscalations.filter(
    (item) => item.escalationResolvedAt - item.createdAt <= config.escalationSlaMinutes * 60 * 1000
  ).length;
  const escalationSlaPercent =
    resolvedEscalations.length === 0 ? 0 : (escalationSlaMet / resolvedEscalations.length) * 100;

  return {
    totalConversations,
    autoAnsweredPercent,
    escalatedPercent,
    medianResponseLatencyMs,
    topQuestionTopics,
    estimatedStaffMinutesSaved: minutesSaved,
    roi: {
      hoursSavedThisMonth: hoursSaved,
      estimatedEurSavedThisMonth: eurosSaved,
      escalationSlaPercent,
      resolvedEscalations: resolvedEscalations.length,
      escalationSlaTargetMinutes: config.escalationSlaMinutes
    }
  };
};

export const __resetVenueAnalyticsStateForTests = () => {
  state.events = [];
  state.venueConfig = {
    "demo-venue": {
      minutesSavedPerAutoAnswer: 4,
      hourlyCostEur: 18,
      escalationSlaMinutes: 15
    }
  };
};
