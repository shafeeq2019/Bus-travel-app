import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DepartureBoard } from "@/components/DepartureBoard";
import { TripDTO } from "@/types";

export const dynamic = "force-dynamic";

async function getUpcomingTrips(): Promise<TripDTO[]> {
  const trips = await prisma.trip.findMany({
    where: { isActive: true, departureTime: { gte: new Date() } },
    orderBy: { departureTime: "asc" },
    take: 6,
    include: { route: true, delays: { orderBy: { reportedAt: "desc" }, take: 1 } }
  });

  return trips.map((t) => ({
    id: t.id,
    routeId: t.routeId,
    departureTime: t.departureTime.toISOString(),
    arrivalTime: t.arrivalTime.toISOString(),
    stops: t.stops,
    status: t.status,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    route: t.route
      ? {
          id: t.route.id,
          name: t.route.name,
          origin: t.route.origin,
          destination: t.route.destination,
          distanceKm: t.route.distanceKm,
          isActive: t.route.isActive,
          createdAt: t.route.createdAt.toISOString(),
          updatedAt: t.route.updatedAt.toISOString()
        }
      : undefined,
    delays: t.delays.map((d) => ({
      id: d.id,
      tripId: d.tripId,
      delayMinutes: d.delayMinutes,
      reason: d.reason,
      reportedAt: d.reportedAt.toISOString()
    }))
  }));
}

export default async function HomePage() {
  const trips = await getUpcomingTrips();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <p className="font-board text-xs uppercase tracking-board text-slate">Since the first coastal run</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Every route, every delay,
            <br /> called out plainly.
          </h1>
          <p className="mt-4 max-w-md text-slate">
            Transit Line publishes real schedules and real delay reports — no guessing whether the 6:40 is
            actually running on time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/routes"
              className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90"
            >
              Browse routes
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink/30"
            >
              Admin sign in
            </Link>
          </div>
        </div>

        <DepartureBoard trips={trips} />
      </div>
    </div>
  );
}
