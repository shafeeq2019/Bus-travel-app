import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { route: true, delays: { orderBy: { reportedAt: "desc" } } }
  });

  if (!trip) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={`/routes/${trip.routeId}`}
        className="font-board text-xs uppercase tracking-board text-slate hover:text-ink"
      >
        ← {trip.route.name}
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {trip.route.origin} → {trip.route.destination}
        </h1>
        <StatusBadge status={trip.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 rounded-lg border border-ink/10 bg-white p-5">
        <div>
          <p className="font-board text-xs uppercase tracking-board text-slate">Departs</p>
          <p className="mt-1 font-board text-lg tabular-nums">{formatDateTime(trip.departureTime)}</p>
        </div>
        <div>
          <p className="font-board text-xs uppercase tracking-board text-slate">Arrives</p>
          <p className="mt-1 font-board text-lg tabular-nums">{formatDateTime(trip.arrivalTime)}</p>
        </div>
      </div>

      {trip.stops.length > 0 && (
        <div className="mt-8">
          <h2 className="font-board text-xs uppercase tracking-board text-slate">Stops</h2>
          <ol className="mt-3 space-y-2 border-l-2 border-ink/10 pl-4">
            {trip.stops.map((stop, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-ink/30" />
                {stop}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-board text-xs uppercase tracking-board text-slate">Delay reports</h2>
        {trip.delays.length === 0 ? (
          <p className="mt-3 text-sm text-slate">No delays reported for this trip.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {trip.delays.map((delay) => (
              <li key={delay.id} className="rounded-md border border-alert/20 bg-alert/5 p-3 text-sm">
                <p className="font-semibold text-alert">+{delay.delayMinutes} minutes</p>
                <p className="mt-0.5 text-ink/80">{delay.reason}</p>
                <p className="mt-1 text-xs text-slate">{formatDateTime(delay.reportedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
