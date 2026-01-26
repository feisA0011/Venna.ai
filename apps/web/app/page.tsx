import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Venna.ai</p>
        <h1 className="text-4xl font-semibold text-ink md:text-5xl">
          Trust-first AI receptionist for Danish hospitality.
        </h1>
        <p className="max-w-2xl text-lg text-neutral-600">
          Venna answers guest questions using verified venue knowledge and escalates to staff
          whenever confidence is low.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Confidence engine with no-guessing rules",
          "Human handoff and escalation tracking",
          "Memory that only learns from verified outcomes"
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-700">{item}</p>
          </div>
        ))}
      </section>
      <div>
        <Link
          className="inline-flex items-center rounded-full border border-neutral-900 px-5 py-2 text-sm font-medium"
          href="/dashboard"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
