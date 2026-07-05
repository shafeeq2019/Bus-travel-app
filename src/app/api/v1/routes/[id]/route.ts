import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { serializeRoute } from "@/lib/serialize";

const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
  origin: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  distanceKm: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional()
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const route = await prisma.route.findUnique({ where: { id: params.id } });
  if (!route) {
    return NextResponse.json({ error: "Route not found." }, { status: 404 });
  }
  return NextResponse.json({ data: serializeRoute(route) });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = updateRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const existing = await prisma.route.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Route not found." }, { status: 404 });
  }

  const route = await prisma.route.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ data: serializeRoute(route) });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const existing = await prisma.route.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Route not found." }, { status: 404 });
  }

  // Soft delete (deactivate) is the default so historical trips stay
  // intact for reporting; a hard delete cascades trips + delays.
  await prisma.route.update({ where: { id: params.id }, data: { isActive: false } });

  return NextResponse.json({ data: { id: params.id } });
}
