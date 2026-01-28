export type ConfidenceLevel = "high" | "medium" | "low";

export const confidenceLabel = (score: number): ConfidenceLevel => {
  if (score >= 0.8) return "high";
  if (score >= 0.6) return "medium";
  return "low";
};
