import { TripStatus } from "@/types";

const STYLES: Record<TripStatus, string> = {
  SCHEDULED: "bg-slate/10 text-slate",
  ON_TIME: "bg-signal/10 text-signal",
  DELAYED: "bg-alert/10 text-alert",
  CANCELLED: "bg-alert/10 text-alert",
  COMPLETED: "bg-slate/10 text-slate"
};

const LABELS: Record<TripStatus, string> = {
  SCHEDULED: "Scheduled",
  ON_TIME: "On time",
  DELAYED: "Delayed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed"
};

export function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
