"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRoutes, deleteRoute } from "@/store/routesSlice";

export default function AdminRoutesPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.routes);

  useEffect(() => {
    dispatch(fetchRoutes(undefined));
  }, [dispatch]);

  async function handleDeactivate(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"? It will stop showing to passengers but trip history is kept.`)) return;
    await dispatch(deleteRoute(id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">Routes</h1>
        <Link href="/admin/routes/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">
          + New route
        </Link>
      </div>

      {status === "loading" && <p className="mt-6 text-slate">Loading…</p>}
      {status === "failed" && <p className="mt-6 text-alert">{error}</p>}

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-slate">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Origin</th>
            <th className="py-2 font-medium">Destination</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((route) => (
            <tr key={route.id} className="border-b border-ink/5">
              <td className="py-3 font-semibold">{route.name}</td>
              <td className="py-3">{route.origin}</td>
              <td className="py-3">{route.destination}</td>
              <td className="py-3">{route.isActive ? "Active" : "Inactive"}</td>
              <td className="py-3 text-right">
                <Link href={`/admin/routes/${route.id}/edit`} className="mr-4 text-ink/70 hover:text-ink">
                  Edit
                </Link>
                <button onClick={() => handleDeactivate(route.id, route.name)} className="text-alert hover:underline">
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {status === "succeeded" && items.length === 0 && <p className="mt-6 text-slate">No routes yet.</p>}
    </div>
  );
}
