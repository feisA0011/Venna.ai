"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type OnboardingState = {
  venue: {
    venueId: string;
    profile: { name: string; address: string; phone: string; languageDefault: string };
    allowedDomains: string[];
    websiteUrl: string;
    escalationInboxEnabled: boolean;
    goLive: boolean;
  };
  steps: Array<{ id: number; label: string; complete: boolean }>;
  checklist: {
    knowledgeApproved: boolean;
    allowedDomainSet: boolean;
    escalationInboxEnabled: boolean;
  };
  canGoLive: boolean;
  docs: { approved: number; pending: number };
};

type PendingDoc = {
  documentId: string;
  sourceUrl: string;
  hash: string;
};

const VENUE_ID = "demo-venue";

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [websiteUrlInput, setWebsiteUrlInput] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    const [stateRes, docsRes] = await Promise.all([
      fetch(`/api/dashboard/onboarding?venueId=${VENUE_ID}`),
      fetch(`/api/dashboard/knowledge/documents?venueId=${VENUE_ID}&status=pending`)
    ]);
    const nextState = (await stateRes.json()) as OnboardingState;
    const docsData = (await docsRes.json()) as { documents: PendingDoc[] };
    setState(nextState);
    setPendingDocs(docsData.documents);
    setWebsiteUrlInput(nextState.venue.websiteUrl ?? "");
  };

  useEffect(() => {
    void refresh();
  }, []);

  const updateState = async (payload: Record<string, unknown>) => {
    await fetch("/api/dashboard/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, ...payload })
    });
    await refresh();
  };

  const onSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateState({
      profile: {
        name: String(formData.get("name") ?? ""),
        address: String(formData.get("address") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        languageDefault: String(formData.get("languageDefault") ?? "en")
      }
    });
    setMessage("Saved venue profile.");
  };

  const addDomain = async () => {
    if (!state) return;
    const next = domainInput.trim();
    if (!next) return;
    const deduped = Array.from(new Set([...state.venue.allowedDomains, next]));
    await updateState({ allowedDomains: deduped });
    setDomainInput("");
    setMessage("Allowed domains updated.");
  };

  const runIngestion = async () => {
    if (!websiteUrlInput.trim()) return;
    await updateState({ websiteUrl: websiteUrlInput });
    await fetch("/api/dashboard/knowledge/ingestion/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, url: websiteUrlInput })
    });
    await refresh();
    setMessage("Ingestion started and completed. Review pending docs.");
  };

  const reviewDoc = async (documentId: string, status: "approved" | "rejected") => {
    await fetch(`/api/dashboard/knowledge/documents/${documentId}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, status })
    });
    await refresh();
  };

  const embedSnippet = useMemo(() => {
    const domain = state?.venue.allowedDomains[0] ?? "https://your-venue.com";
    return `<script\n  src=\"https://widget.venna.ai/boot.js\"\n  data-venue-id=\"${VENUE_ID}\"\n  data-api-base=\"https://app.venna.ai\"\n  data-allowed-origin=\"${domain}\"\n  defer\n></script>`;
  }, [state]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setMessage("Embed snippet copied.");
  };

  const toggleGoLive = async (enabled: boolean) => {
    const response = await fetch("/api/dashboard/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, action: "setGoLive", enabled })
    });
    if (!response.ok) {
      const err = await response.json();
      setMessage(err.error ?? "Unable to set go live.");
      return;
    }
    await refresh();
  };

  if (!state) {
    return <section className="text-sm text-neutral-600">Loading onboarding…</section>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold">10-minute onboarding wizard</h3>
        <p className="mt-1 text-sm text-neutral-600">Progress is saved automatically and resumes on return.</p>
        <ul className="mt-3 space-y-1 text-sm">
          {state.steps.map((step) => (
            <li key={step.id}>
              {step.complete ? "✅" : "⬜"} Step {step.id}: {step.label}
            </li>
          ))}
        </ul>
      </div>

      <form className="rounded-2xl border border-neutral-200 p-4 space-y-2" onSubmit={onSaveProfile}>
        <h4 className="font-semibold">Step 1: Venue profile</h4>
        <input name="name" defaultValue={state.venue.profile.name} className="w-full rounded border px-2 py-1" placeholder="Venue name" />
        <input name="address" defaultValue={state.venue.profile.address} className="w-full rounded border px-2 py-1" placeholder="Address" />
        <input name="phone" defaultValue={state.venue.profile.phone} className="w-full rounded border px-2 py-1" placeholder="Phone" />
        <input name="languageDefault" defaultValue={state.venue.profile.languageDefault} className="w-full rounded border px-2 py-1" placeholder="Default language" />
        <button type="submit" className="rounded bg-neutral-900 px-3 py-1 text-white text-sm">Save profile</button>
      </form>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Step 2: Allowed domains</h4>
        <div className="flex gap-2">
          <input value={domainInput} onChange={(event) => setDomainInput(event.target.value)} className="w-full rounded border px-2 py-1" placeholder="https://www.yourvenue.com" />
          <button type="button" onClick={addDomain} className="rounded bg-neutral-900 px-3 py-1 text-white text-sm">Add</button>
        </div>
        <ul className="text-sm text-neutral-700">
          {state.venue.allowedDomains.length === 0 ? <li>No allowed domains yet.</li> : state.venue.allowedDomains.map((domain) => <li key={domain}>• {domain}</li>)}
        </ul>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Step 3: Ingest website</h4>
        <div className="flex gap-2">
          <input value={websiteUrlInput} onChange={(event) => setWebsiteUrlInput(event.target.value)} className="w-full rounded border px-2 py-1" placeholder="https://yourvenue.com" />
          <button type="button" onClick={runIngestion} className="rounded bg-neutral-900 px-3 py-1 text-white text-sm">Run ingestion</button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Step 4: Review knowledge docs</h4>
        <p className="text-sm text-neutral-600">Approved: {state.docs.approved} • Pending: {state.docs.pending}</p>
        {pendingDocs.length === 0 ? <p className="text-sm">No pending docs.</p> : pendingDocs.map((doc) => (
          <div key={doc.documentId} className="rounded border p-2 text-sm">
            <p>{doc.sourceUrl}</p>
            <p className="text-xs text-neutral-500">hash {doc.hash.slice(0, 12)}</p>
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => reviewDoc(doc.documentId, "approved")} className="rounded border border-green-700 px-2 py-1 text-xs text-green-700">Approve</button>
              <button type="button" onClick={() => reviewDoc(doc.documentId, "rejected")} className="rounded border border-red-700 px-2 py-1 text-xs text-red-700">Reject</button>
            </div>
          </div>
        ))}
        {!state.checklist.knowledgeApproved ? <p className="text-xs text-amber-700">Warning: no approved knowledge yet.</p> : null}
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Step 5: Embed snippet</h4>
        <pre className="overflow-x-auto rounded bg-neutral-100 p-2 text-xs">{embedSnippet}</pre>
        <button type="button" onClick={copySnippet} className="rounded bg-neutral-900 px-3 py-1 text-white text-sm">Copy snippet</button>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Step 6: Test widget</h4>
        <Link href={`/widget-test?venueId=${VENUE_ID}`} className="text-sm text-blue-700 underline">Open widget test page</Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4 space-y-2">
        <h4 className="font-semibold">Final checklist & Go Live</h4>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={state.venue.escalationInboxEnabled}
            onChange={(event) => {
              void updateState({ escalationInboxEnabled: event.target.checked });
            }}
          />
          Escalation inbox enabled
        </label>
        <ul className="text-sm">
          <li>{state.checklist.knowledgeApproved ? "✅" : "⬜"} Knowledge approved</li>
          <li>{state.checklist.allowedDomainSet ? "✅" : "⬜"} Allowed domain set</li>
          <li>{state.checklist.escalationInboxEnabled ? "✅" : "⬜"} Escalation inbox enabled</li>
        </ul>
        <button
          type="button"
          disabled={!state.canGoLive}
          onClick={() => {
            void toggleGoLive(!state.venue.goLive);
          }}
          className="rounded bg-emerald-700 px-3 py-1 text-white text-sm disabled:opacity-50"
        >
          {state.venue.goLive ? "Disable Go Live" : "Go Live"}
        </button>
        {!state.canGoLive ? <p className="text-xs text-amber-700">Complete checklist before going live.</p> : null}
      </div>

      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}
    </section>
  );
}
