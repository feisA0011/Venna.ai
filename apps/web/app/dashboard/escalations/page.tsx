import { listEscalations } from "../../../lib/decision-pipeline";

export default function EscalationsPage() {
  const escalations = listEscalations({ venueId: "demo-venue" });

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Escalations</h3>
      <div className="rounded-2xl border border-neutral-200">
        <div className="grid grid-cols-5 gap-4 border-b border-neutral-200 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>ID</span>
          <span>Reason</span>
          <span>User message</span>
          <span>Confidence</span>
          <span>Status</span>
        </div>
        {escalations.length === 0 ? (
          <div className="px-4 py-3 text-sm text-neutral-600">No escalations yet.</div>
        ) : (
          escalations.map((esc) => (
            <div key={esc.id} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm">
              <span>{esc.id}</span>
              <span>{esc.reason}</span>
              <span>{esc.userMessage}</span>
              <span>{esc.confidence.toFixed(2)}</span>
              <span className="capitalize">{esc.status}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
