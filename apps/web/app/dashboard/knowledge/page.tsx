"use client";

import { FormEvent, useEffect, useState } from "react";

type KnowledgeDocument = {
  documentId: string;
  sourceUrl: string;
  hash: string;
  extractedAt: number;
  status: "pending" | "approved" | "rejected";
};

type IngestionJob = {
  id: string;
  status: string;
  logs: string[];
  createdAt: number;
};

const VENUE_ID = "demo-venue";

export default function KnowledgePage() {
  const [url, setUrl] = useState("");
  const [pendingDocs, setPendingDocs] = useState<KnowledgeDocument[]>([]);
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPendingDocs = async () => {
    const response = await fetch(`/api/dashboard/knowledge/documents?venueId=${VENUE_ID}&status=pending`);
    const data = await response.json();
    setPendingDocs(data.documents);
  };

  useEffect(() => {
    void loadPendingDocs();
  }, []);

  const onStartIngestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    const response = await fetch("/api/dashboard/knowledge/ingestion/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, url })
    });
    const data = await response.json();
    setJobs((current) => [data.job, ...current]);
    setUrl("");
    setIsLoading(false);
    await loadPendingDocs();
  };

  const onReview = async (documentId: string, status: "approved" | "rejected") => {
    await fetch(`/api/dashboard/knowledge/documents/${documentId}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: VENUE_ID, status })
    });
    await loadPendingDocs();
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold">Ingestion Job</h3>
        <p className="mt-1 text-sm text-neutral-600">Paste a website URL to ingest pages into pending knowledge.</p>
        <form className="mt-4 flex gap-2" onSubmit={onStartIngestion}>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="https://venue.example"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Running..." : "Start ingestion"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold">Pending documents</div>
        {pendingDocs.length === 0 ? (
          <p className="px-4 py-3 text-sm text-neutral-600">No pending documents.</p>
        ) : (
          pendingDocs.map((doc) => (
            <div key={doc.documentId} className="space-y-2 border-b border-neutral-100 px-4 py-3 text-sm last:border-b-0">
              <p className="font-medium">{doc.sourceUrl}</p>
              <p className="text-xs text-neutral-500">hash: {doc.hash.slice(0, 12)} • {new Date(doc.extractedAt).toLocaleString()}</p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-green-700 px-2 py-1 text-xs text-green-700"
                  onClick={() => onReview(doc.documentId, "approved")}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="rounded-md border border-red-700 px-2 py-1 text-xs text-red-700"
                  onClick={() => onReview(doc.documentId, "rejected")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 p-4">
        <h4 className="text-sm font-semibold">Recent ingestion logs</h4>
        {jobs.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">No jobs yet.</p>
        ) : (
          <ul className="mt-2 space-y-3 text-xs text-neutral-600">
            {jobs.map((job) => (
              <li key={job.id}>
                <p className="font-medium text-neutral-800">{job.id} ({job.status})</p>
                <p>{job.logs[job.logs.length - 1]}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
