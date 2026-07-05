import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { serializeTrip } from "@/lib/serialize";

const delaySchema = z.object({
  delayMinutes: z.number().int(),
  reason: z.string().min(1)
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = delaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  // delayMinutes of 0 clears the delay and marks the trip back on time;
  // anything above 0 logs a new delay record and flips the trip status.
  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.delayMinutes > 0) {
      await tx.delay.create({
        data: {
          tripId: params.id,
          delayMinutes: parsed.data.delayMinutes,
          reason: parsed.data.reason
        }
      });
    }

    return tx.trip.update({
      where: { id: params.id },
      data: { status: parsed.data.delayMinutes > 0 ? "DELAYED" : "ON_TIME" },
      include: { route: true, delays: { orderBy: { reportedAt: "desc" } } }
    });
  });

  return NextResponse.json({ data: serializeTrip(updated) });
}
