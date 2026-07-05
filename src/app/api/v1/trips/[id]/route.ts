import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { serializeTrip } from "@/lib/serialize";

const updateTripSchema = z.object({
  routeId: z.string().min(1).optional(),
  departureTime: z.string().datetime().optional(),
  arrivalTime: z.string().datetime().optional(),
  stops: z.array(z.string()).optional(),
  status: z.enum(["SCHEDULED", "ON_TIME", "DELAYED", "CANCELLED", "COMPLETED"]).optional(),
  isActive: z.boolean().optional()
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: { route: true, delays: { orderBy: { reportedAt: "desc" } } }
  });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }
  return NextResponse.json({ data: serializeTrip(trip) });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = updateTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const existing = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const { departureTime, arrivalTime, ...rest } = parsed.data;

  const trip = await prisma.trip.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(departureTime ? { departureTime: new Date(departureTime) } : {}),
      ...(arrivalTime ? { arrivalTime: new Date(arrivalTime) } : {})
    },
    include: { route: true, delays: { orderBy: { reportedAt: "desc" } } }
  });

  return NextResponse.json({ data: serializeTrip(trip) });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  // Soft delete so past trips remain visible in historical schedules/reports.
  await prisma.trip.update({ where: { id: params.id }, data: { isActive: false, status: "CANCELLED" } });

  return NextResponse.json({ data: { id: params.id } });
}
