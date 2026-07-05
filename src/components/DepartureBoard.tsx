import { TripDTO } from "@/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusText(trip: TripDTO) {
  if (trip.status === "DELAYED") {
    const minutes = trip.delays?.[0]?.delayMinutes;
    return minutes ? `DELAYED +${minutes}m` : "DELAYED";
  }
  if (trip.status === "CANCELLED") return "CANCELLED";
  if (trip.status === "ON_TIME") return "ON TIME";
  return "SCHEDULED";
}

function statusColor(trip: TripDTO) {
  if (trip.status === "DELAYED" || trip.status === "CANCELLED") return "text-alert";
  if (trip.status === "ON_TIME") return "text-signal";
  return "text-amber";
}

export function DepartureBoard({ trips }: { trips: TripDTO[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-ink shadow-xl">
      <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3">
        <span className="font-board text-xs uppercase tracking-board text-amber">Next departures</span>
        <span className="font-board text-xs uppercase tracking-board text-paper/40">Live board</span>
      </div>

      <div className="divide-y divide-paper/10">
        {trips.length === 0 && (
          <div className="px-4 py-6 text-center font-board text-sm text-paper/50">No upcoming departures</div>
        )}

        {trips.map((trip) => (
          <div key={trip.id} className="board-row grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-6">
            <span className="board-flip font-board text-lg text-amber tabular-nums sm:text-xl">
              {formatTime(trip.departureTime)}
            </span>
            <span className="min-w-0 truncate font-board text-sm uppercase tracking-board text-paper">
              {trip.route ? `${trip.route.origin} → ${trip.route.destination}` : "—"}
            </span>
            <span className={`font-board text-xs uppercase tracking-board ${statusColor(trip)}`}>
              {statusText(trip)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
