import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Middleware already redirects unauthenticated/non-admin traffic away
  // from /admin; this is a second, server-rendered check so the page
  // never briefly renders for the wrong role even if middleware is
  // bypassed or misconfigured.
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <aside className="sm:w-48 sm:shrink-0">
          <p className="font-board text-xs uppercase tracking-board text-slate">Admin</p>
          <nav className="mt-3 flex flex-row gap-4 sm:flex-col sm:gap-2">
            <Link href="/admin" className="text-sm text-ink/80 hover:text-ink">
              Overview
            </Link>
            <Link href="/admin/routes" className="text-sm text-ink/80 hover:text-ink">
              Routes
            </Link>
            <Link href="/admin/trips" className="text-sm text-ink/80 hover:text-ink">
              Trips &amp; delays
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
