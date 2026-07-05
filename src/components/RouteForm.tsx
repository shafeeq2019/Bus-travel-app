"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { createRoute, updateRoute } from "@/store/routesSlice";
import { RouteDTO } from "@/types";

export function RouteForm({ initial }: { initial?: RouteDTO }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [distanceKm, setDistanceKm] = useState(initial?.distanceKm?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      origin,
      destination,
      distanceKm: distanceKm ? Number(distanceKm) : undefined
    };

    const action = initial
      ? await dispatch(updateRoute({ id: initial.id, payload }))
      : await dispatch(createRoute(payload));

    setSubmitting(false);

    if (action.meta.requestStatus === "rejected") {
      setError((action.payload as string) || "Something went wrong. Please try again.");
      return;
    }

    router.push("/admin/routes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Route name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
          placeholder="Coastal Express"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Origin
        <input
          required
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
          placeholder="Portside"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Destination
        <input
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
          placeholder="Harbor City"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Distance (km, optional)
        <input
          type="number"
          min="0"
          step="0.1"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          className="rounded-md border border-ink/15 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Create route"}
      </button>
    </form>
  );
}
