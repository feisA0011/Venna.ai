"use client"; // Add this if you're using Next.js App Router

import { useEffect } from "react";

declare global {
  interface Window {
    VennaWidget?: {
      init: (config: { venueId: string; apiBase: string }) => void;
    };
  }
}

export default function WidgetTest() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement("script");
    script.src = "http://localhost:3001/boot.js";
    script.async = true;

    script.onload = () => {
      if (window.VennaWidget) {
        window.VennaWidget.init({
          venueId: "demo-venue",
          apiBase: "http://localhost:3002",
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ minHeight: "200vh", padding: 40 }}>
      <h1>Venna Widget Test</h1>
      <p>Widget should appear bottom-right after you click anywhere.</p>
    </div>
  );
}
