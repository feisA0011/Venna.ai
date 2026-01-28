export default function DashboardPage() {
  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Monitor confidence, escalations, and labor savings across all venues.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Confidence threshold", value: "0.72" },
          { label: "Escalation rate", value: "12%" },
          { label: "Hours saved", value: "138" }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
