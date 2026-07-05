"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTripById, reportDelay } from "@/store/tripsSlice";
import { StatusBadge } from "@/components/StatusBadge";

export default function DelayUpdatePage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const trip = useAppSelector((s) => s.trips.selected);

  const [delayMinutes, setDelayMinutes] = useState("0");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTripById(params.id));
  }, [dispatch, params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const minutes = Number(delayMinutes);
    if (minutes > 0 && !reason.trim()) {
      setError("Give a reason for the delay so passengers know what happened.");
      setSubmitting(false);
      return;
    }

    const action = await dispatch(
      reportDelay({ tripId: params.id, delayMinutes: minutes, reason: reason || "Delay cleared" })
    );

    setSubmitting(false);

    if (action.meta.requestStatus === "rejected") {
      setError((action.payload as string) || "Something went wrong. Please try again.");
      return;
    }

    router.push("/admin/trips");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Update delay</h1>

      {trip && (
        <div className="mt-3 flex items-center gap-3 text-sm text-slate">
          <span>
            {trip.route?.origin} → {trip.route?.destination}
          </span>
          <StatusBadge status={trip.status} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Delay (minutes) — 0 clears the delay and marks the trip on time
          <input
            type="number"
            min="0"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(e.target.value)}
            className="rounded-md border border-ink/15 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Reason
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Road maintenance near Pinecrest"
            className="rounded-md border border-ink/15 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Update delay"}
        </button>
      </form>

      {trip && trip.delays && trip.delays.length > 0 && (
        <div className="mt-8">
          <h2 className="font-board text-xs uppercase tracking-board text-slate">History</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {trip.delays.map((d) => (
              <li key={d.id} className="rounded-md border border-ink/10 p-3">
                +{d.delayMinutes} min · {d.reason} · {new Date(d.reportedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
