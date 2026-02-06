export type DecisionResult = {
  type: "answer" | "escalation";
  message: string;
  confidence: number;
  sources: string[];
};

export type EscalationThreadMessage = {
  id: string;
  role: "guest" | "staff";
  message: string;
  createdAt: number;
  userId?: string;
  verifiedAnswer?: boolean;
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
  resolvedAt?: number;
  thread: EscalationThreadMessage[];
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

export function listEscalations(input: { venueId: string; status?: "open" | "resolved" | null }): EscalationRecord[];
export function getEscalationById(input: { venueId: string; escalationId: string }): EscalationRecord;
export function replyToEscalation(input: {
  venueId: string;
  escalationId: string;
  userId: string;
  message: string;
  verifiedAnswer?: boolean;
  resolve?: boolean;
}): EscalationRecord;
export function listLogs(input: { venueId: string }): LogRecord[];
export function __resetDecisionStateForTests(): void;
