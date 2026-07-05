import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeRoute } from "@/lib/serialize";
import { RouteForm } from "@/components/RouteForm";

export const dynamic = "force-dynamic";

export default async function EditRoutePage({ params }: { params: { id: string } }) {
  const route = await prisma.route.findUnique({ where: { id: params.id } });
  if (!route) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Edit route</h1>
      <RouteForm initial={serializeRoute(route)} />
    </div>
  );
}
