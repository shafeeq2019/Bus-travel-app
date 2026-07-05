import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const route = await prisma.route.findUnique({
    where: { id: params.id },
    include: {
      trips: {
        orderBy: { departureTime: "asc" },
        include: { delays: { orderBy: { reportedAt: "desc" }, take: 1 } }
      }
    }
  });

  if (!route) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/routes" className="font-board text-xs uppercase tracking-board text-slate hover:text-ink">
        ← All routes
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{route.name}</h1>
      <p className="mt-1 text-slate">
        {route.origin} → {route.destination}
        {route.distanceKm ? ` · ${route.distanceKm} km` : ""}
        {!route.isActive && <span className="ml-2 text-alert">(inactive)</span>}
      </p>

      <h2 className="mt-8 font-board text-xs uppercase tracking-board text-slate">Scheduled trips</h2>

      {route.trips.length === 0 && <p className="mt-4 text-slate">No trips scheduled on this route yet.</p>}

      <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {route.trips.map((trip) => (
          <li key={trip.id}>
            <Link href={`/trips/${trip.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-ink/[0.03]">
              <div>
                <p className="font-board text-sm tabular-nums">
                  {formatDateTime(trip.departureTime)} → {formatDateTime(trip.arrivalTime)}
                </p>
                {trip.delays[0] && (
                  <p className="mt-1 text-xs text-alert">
                    +{trip.delays[0].delayMinutes} min · {trip.delays[0].reason}
                  </p>
                )}
              </div>
              <StatusBadge status={trip.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
