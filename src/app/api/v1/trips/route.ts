import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { serializeTrip } from "@/lib/serialize";

const createTripSchema = z
  .object({
    routeId: z.string().min(1),
    departureTime: z.string().datetime(),
    arrivalTime: z.string().datetime(),
    stops: z.array(z.string()).optional(),
    status: z.enum(["SCHEDULED", "ON_TIME", "DELAYED", "CANCELLED", "COMPLETED"]).optional()
  })
  .refine((data) => new Date(data.arrivalTime) > new Date(data.departureTime), {
    message: "arrivalTime must be after departureTime",
    path: ["arrivalTime"]
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const routeId = searchParams.get("routeId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const trips = await prisma.trip.findMany({
    where: {
      isActive: true,
      ...(routeId ? { routeId } : {}),
      ...(status ? { status: status as any } : {}),
      ...(from || to
        ? {
            departureTime: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {})
            }
          }
        : {})
    },
    orderBy: { departureTime: "asc" },
    include: { route: true, delays: { orderBy: { reportedAt: "desc" }, take: 1 } }
  });

  return NextResponse.json({ data: trips.map(serializeTrip), meta: { total: trips.length } });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const route = await prisma.route.findUnique({ where: { id: parsed.data.routeId } });
  if (!route) {
    return NextResponse.json({ error: "That route does not exist." }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      routeId: parsed.data.routeId,
      departureTime: new Date(parsed.data.departureTime),
      arrivalTime: new Date(parsed.data.arrivalTime),
      stops: parsed.data.stops ?? [],
      status: parsed.data.status ?? "SCHEDULED"
    },
    include: { route: true, delays: true }
  });

  return NextResponse.json({ data: serializeTrip(trip) }, { status: 201 });
}
