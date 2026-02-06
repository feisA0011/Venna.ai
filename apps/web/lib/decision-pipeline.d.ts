export type DecisionResult = {
  type: "answer" | "escalation";
  message: string;
  confidence: number;
  sources: string[];
};

export type EscalationRecord = {
  id: string;
  venueId: string;
  conversationId: string;
  reason: string;
  userMessage: string;
  confidence: number;
  createdAt: number;
  status: string;
};

export type LogRecord = {
  venueId: string;
  conversationId: string;
  message: string;
  route: "cache" | "llm" | "escalation";
  confidence: number;
  createdAt: number;
};

export function handleMessage(input: {
  venueId: string;
  conversationId: string;
  text: string;
}): DecisionResult;

export function listEscalations(input: { venueId: string }): EscalationRecord[];
export function listLogs(input: { venueId: string }): LogRecord[];
export function __resetDecisionStateForTests(): void;
