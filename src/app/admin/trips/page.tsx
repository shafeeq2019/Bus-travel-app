"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrips } from "@/store/tripsSlice";
import { fetchRoutes } from "@/store/routesSlice";
import { StatusBadge } from "@/components/StatusBadge";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminTripsPage() {
  return (
    <Suspense fallback={<p className="text-slate">Loading…</p>}>
      <AdminTripsContent />
    </Suspense>
  );
}

function AdminTripsContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? undefined;
  const { items, status, error } = useAppSelector((s) => s.trips);
  const routes = useAppSelector((s) => s.routes.items);

  useEffect(() => {
    dispatch(fetchTrips(undefined));
    dispatch(fetchRoutes(undefined));
  }, [dispatch]);

  const filtered = statusFilter ? items.filter((t) => t.status === statusFilter) : items;

  function routeLabel(routeId: string) {
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.origin} → ${route.destination}` : routeId;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">Trips &amp; delays</h1>
        <Link href="/admin/trips/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">
          + New trip
        </Link>
      </div>

      {statusFilter && (
        <p className="mt-3 text-sm text-slate">
          Filtered to <span className="font-semibold">{statusFilter}</span> ·{" "}
          <Link href="/admin/trips" className="underline">
            clear filter
          </Link>
        </p>
      )}

      {status === "loading" && <p className="mt-6 text-slate">Loading…</p>}
      {status === "failed" && <p className="mt-6 text-alert">{error}</p>}

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-slate">
            <th className="py-2 font-medium">Route</th>
            <th className="py-2 font-medium">Departs</th>
            <th className="py-2 font-medium">Arrives</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((trip) => (
            <tr key={trip.id} className="border-b border-ink/5">
              <td className="py-3 font-semibold">{trip.route ? `${trip.route.origin} → ${trip.route.destination}` : routeLabel(trip.routeId)}</td>
              <td className="py-3 tabular-nums">{formatDateTime(trip.departureTime)}</td>
              <td className="py-3 tabular-nums">{formatDateTime(trip.arrivalTime)}</td>
              <td className="py-3">
                <StatusBadge status={trip.status} />
              </td>
              <td className="py-3 text-right">
                <Link href={`/admin/trips/${trip.id}/edit`} className="mr-4 text-ink/70 hover:text-ink">
                  Edit
                </Link>
                <Link href={`/admin/trips/${trip.id}/delay`} className="text-ink/70 hover:text-ink">
                  Update delay
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {status === "succeeded" && filtered.length === 0 && <p className="mt-6 text-slate">No trips match.</p>}
    </div>
  );
}
