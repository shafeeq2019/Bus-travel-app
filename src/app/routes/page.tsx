"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRoutes, setSearchTerm } from "@/store/routesSlice";

export default function RoutesPage() {
  const dispatch = useAppDispatch();
  const { items, status, error, searchTerm } = useAppSelector((s) => s.routes);
  const [query, setQuery] = useState(searchTerm);

  useEffect(() => {
    dispatch(fetchRoutes(undefined));
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setSearchTerm(query));
      dispatch(fetchRoutes(query || undefined));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-board text-xs uppercase tracking-board text-slate">All service</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Routes &amp; schedules</h1>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, origin, or destination"
          className="w-full rounded-md border border-ink/15 bg-white px-4 py-2 text-sm sm:w-80"
        />
      </div>

      {status === "loading" && <p className="mt-8 text-slate">Loading routes…</p>}
      {status === "failed" && <p className="mt-8 text-alert">{error}</p>}

      {status === "succeeded" && items.length === 0 && (
        <p className="mt-8 text-slate">No routes match that search.</p>
      )}

      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {items.map((route) => (
          <li key={route.id}>
            <Link
              href={`/routes/${route.id}`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-ink/[0.03]"
            >
              <div>
                <p className="font-display text-lg font-semibold">{route.name}</p>
                <p className="text-sm text-slate">
                  {route.origin} → {route.destination}
                  {route.distanceKm ? ` · ${route.distanceKm} km` : ""}
                </p>
              </div>
              <span className="font-board text-xs uppercase tracking-board text-slate">View trips →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
