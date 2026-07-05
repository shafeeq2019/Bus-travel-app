"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRoutes } from "@/store/routesSlice";
import { createTrip, updateTrip } from "@/store/tripsSlice";
import { TripDTO } from "@/types";

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function TripForm({ initial }: { initial?: TripDTO }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const routes = useAppSelector((s) => s.routes.items);

  useEffect(() => {
    dispatch(fetchRoutes(undefined));
  }, [dispatch]);

  const [routeId, setRouteId] = useState(initial?.routeId ?? "");
  const [departureTime, setDepartureTime] = useState(toLocalInputValue(initial?.departureTime));
  const [arrivalTime, setArrivalTime] = useState(toLocalInputValue(initial?.arrivalTime));
  const [stops, setStops] = useState(initial?.stops.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      routeId,
      departureTime: new Date(departureTime).toISOString(),
      arrivalTime: new Date(arrivalTime).toISOString(),
      stops: stops
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    };

    const action = initial
      ? await dispatch(updateTrip({ id: initial.id, payload }))
      : await dispatch(createTrip(payload));

    setSubmitting(false);

    if (action.meta.requestStatus === "rejected") {
      setError((action.payload as string) || "Something went wrong. Please try again.");
      return;
    }

    router.push("/admin/trips");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Route
        <select
          required
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
        >
          <option value="" disabled>
            Select a route
          </option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.origin} → {r.destination})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Departure time
        <input
          type="datetime-local"
          required
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Arrival time
        <input
          type="datetime-local"
          required
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Stops (comma-separated)
        <input
          value={stops}
          onChange={(e) => setStops(e.target.value)}
          placeholder="Portside, Bay Junction, Harbor City"
          className="rounded-md border border-ink/15 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Create trip"}
      </button>
    </form>
  );
}
