import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

const nav: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/conversations", label: "Conversations" },
  { href: "/dashboard/escalations", label: "Escalations" },
  { href: "/dashboard/knowledge", label: "Knowledge" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/widget-test", label: "Widget" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Venue Console
            </p>
            <h2 className="text-lg font-semibold">Venna Dashboard</h2>
          </div>
          <nav className="flex gap-3 text-sm text-neutral-600">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
