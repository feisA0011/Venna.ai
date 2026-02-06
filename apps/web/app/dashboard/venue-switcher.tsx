"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type VenueMembership = { venueId: string; role: string };

export function VenueSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") ?? "owner_multi";
  const selectedVenue = searchParams.get("venueId") ?? "demo-venue";
  const [venues, setVenues] = useState<VenueMembership[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/dashboard/venues?userId=${userId}`);
      const data = (await response.json()) as { venues: VenueMembership[] };
      setVenues(data.venues ?? []);
    };
    void load();
  }, [userId]);

  if (venues.length <= 1) {
    return null;
  }

  return (
    <select
      className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs"
      value={selectedVenue}
      onChange={(event) => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("venueId", event.target.value);
        next.set("userId", userId);
        router.push(`${pathname}?${next.toString()}` as never);
      }}
    >
      {venues.map((venue) => (
        <option key={venue.venueId} value={venue.venueId}>
          {venue.venueId} ({venue.role})
        </option>
      ))}
    </select>
  );
}
