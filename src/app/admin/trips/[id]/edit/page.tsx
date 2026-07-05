import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeTrip } from "@/lib/serialize";
import { TripForm } from "@/components/TripForm";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { route: true, delays: true }
  });
  if (!trip) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Edit trip</h1>
      <TripForm initial={serializeTrip(trip)} />
    </div>
  );
}
