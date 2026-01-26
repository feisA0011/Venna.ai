const escalations = [
  {
    id: "esc_01",
    reason: "Low confidence on allergen request",
    priority: "High",
    status: "Open"
  },
  {
    id: "esc_02",
    reason: "Reservation change request",
    priority: "Medium",
    status: "Resolved"
  }
];

export default function EscalationsPage() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Escalations</h3>
      <div className="rounded-2xl border border-neutral-200">
        <div className="grid grid-cols-4 gap-4 border-b border-neutral-200 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>ID</span>
          <span>Reason</span>
          <span>Priority</span>
          <span>Status</span>
        </div>
        {escalations.map((esc) => (
          <div key={esc.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
            <span>{esc.id}</span>
            <span>{esc.reason}</span>
            <span>{esc.priority}</span>
            <span>{esc.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
