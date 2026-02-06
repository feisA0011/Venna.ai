export function configureVenueAnalytics(input: {
  venueId: string;
  minutesSavedPerAutoAnswer: number;
  hourlyCostEur: number;
  escalationSlaMinutes: number;
}): void;

export function recordConversationAnalytics(input: {
  venueId: string;
  route: "cache" | "llm" | "escalation";
  question: string;
  responseLatencyMs: number;
  createdAt?: number;
}): void;

export function markEscalationResolved(input: {
  venueId: string;
  createdAt: number;
  resolvedAt: number;
}): void;

export function aggregateVenueAnalytics(input: {
  venueId: string;
  now?: number;
}): {
  totalConversations: number;
  autoAnsweredPercent: number;
  escalatedPercent: number;
  medianResponseLatencyMs: number;
  topQuestionTopics: Array<{ topic: string; count: number }>;
  estimatedStaffMinutesSaved: number;
  roi: {
    hoursSavedThisMonth: number;
    estimatedEurSavedThisMonth: number;
    escalationSlaPercent: number;
    resolvedEscalations: number;
    escalationSlaTargetMinutes: number;
  };
};

export function __resetVenueAnalyticsStateForTests(): void;
