import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [routeCount, tripCount, delayedCount] = await Promise.all([
    prisma.route.count({ where: { isActive: true } }),
    prisma.trip.count({ where: { isActive: true } }),
    prisma.trip.count({ where: { isActive: true, status: "DELAYED" } })
  ]);

  const cards = [
    { label: "Active routes", value: routeCount, href: "/admin/routes" },
    { label: "Active trips", value: tripCount, href: "/admin/trips" },
    { label: "Currently delayed", value: delayedCount, href: "/admin/trips?status=DELAYED" }
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Overview</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-ink/10 bg-white p-5 hover:border-ink/25"
          >
            <p className="font-board text-3xl font-bold tabular-nums">{card.value}</p>
            <p className="mt-1 text-sm text-slate">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/admin/routes/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">
          + New route
        </Link>
        <Link href="/admin/trips/new" className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold">
          + New trip
        </Link>
      </div>
    </div>
  );
}
