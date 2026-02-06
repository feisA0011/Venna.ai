export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Settings</h3>
      <div className="rounded-2xl border border-neutral-200 p-6">
        <p className="text-sm text-neutral-600">
          Configure confidence thresholds, escalation policies, and widget origin allowlist domains.
        </p>
      </div>
    </section>
  );
}
