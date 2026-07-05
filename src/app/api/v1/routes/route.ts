import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { serializeRoute } from "@/lib/serialize";

// Every /api/v1 endpoint returns { data } or { error } so the same
// contract can be consumed by the web client today and an Android
// client later without any endpoint-specific parsing logic.

const createRouteSchema = z.object({
  name: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  distanceKm: z.number().positive().optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const includeInactive = searchParams.get("includeInactive") === "true";

  const routes = await prisma.route.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { origin: { contains: q, mode: "insensitive" } },
              { destination: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ data: routes.map(serializeRoute), meta: { total: routes.length } });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = createRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }

  const route = await prisma.route.create({ data: parsed.data });
  return NextResponse.json({ data: serializeRoute(route) }, { status: 201 });
}
