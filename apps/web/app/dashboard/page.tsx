"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type AnalyticsPayload = {
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

function DashboardClient() {
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venueId") ?? "demo-venue";
  const userId = searchParams.get("userId") ?? "owner_multi";
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const response = await fetch(`/api/dashboard/analytics/roi?venueId=${venueId}&userId=${userId}`);
      if (!response.ok) return;
      const data = (await response.json()) as { analytics: AnalyticsPayload };
      setAnalytics(data.analytics);
    };

    void loadAnalytics();
  }, [venueId, userId]);

  const roiCards = useMemo(
    () => [
      { label: "Hours saved this month", value: analytics ? analytics.roi.hoursSavedThisMonth.toFixed(1) : "0.0" },
      { label: "Estimated € saved", value: analytics ? `€${analytics.roi.estimatedEurSavedThisMonth.toFixed(0)}` : "€0" },
      {
        label: "Escalation SLA met",
        value: analytics ? `${analytics.roi.escalationSlaPercent.toFixed(0)}% (${analytics.roi.resolvedEscalations} resolved)` : "0%"
      }
    ],
    [analytics]
  );

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="mt-2 text-sm text-neutral-600">Aggregated, privacy-safe ROI analytics from venue conversations (no raw user text).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roiCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 p-6">
        <h4 className="text-sm font-semibold">Conversation analytics</h4>
        <div className="mt-3 grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
          <p>Total conversations: {analytics?.totalConversations ?? 0}</p>
          <p>Auto-answered: {(analytics?.autoAnsweredPercent ?? 0).toFixed(1)}%</p>
          <p>Escalated: {(analytics?.escalatedPercent ?? 0).toFixed(1)}%</p>
          <p>Median response latency: {Math.round(analytics?.medianResponseLatencyMs ?? 0)} ms</p>
          <p>Estimated staff minutes saved: {Math.round(analytics?.estimatedStaffMinutesSaved ?? 0)} min</p>
          <p>Escalation SLA target: {analytics?.roi.escalationSlaTargetMinutes ?? 15} min</p>
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Top question topics</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-700">
            {(analytics?.topQuestionTopics ?? []).map((item) => <li key={item.topic}>{item.topic}: {item.count}</li>)}
            {(analytics?.topQuestionTopics ?? []).length === 0 ? <li>No data yet.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<section className="text-sm text-neutral-600">Loading overview…</section>}>
      <DashboardClient />
    </Suspense>
  );
}
