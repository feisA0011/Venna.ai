"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function WidgetTestClient() {
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venueId") ?? "demo-venue";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "http://localhost:3001/boot.js";
    script.async = true;
    script.dataset.venueId = venueId;
    script.dataset.apiBase = "http://localhost:3002";

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [venueId]);

  return (
    <div style={{ minHeight: "200vh", padding: 40 }}>
      <h1>Venna Widget Test</h1>
      <p>Venue ID: {venueId}</p>
      <p>Widget should appear bottom-right after you click anywhere.</p>
    </div>
  );
}

export default function WidgetTestPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading widget test…</div>}>
      <WidgetTestClient />
    </Suspense>
  );
}
