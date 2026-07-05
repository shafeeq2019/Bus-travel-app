"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight">Transit Line</span>
          <span className="hidden font-board text-[10px] uppercase tracking-board text-slate sm:inline">
            routes &amp; schedules
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/routes" className="text-ink/80 hover:text-ink">
            Routes
          </Link>

          {status === "authenticated" && session.user.role === "ADMIN" && (
            <Link href="/admin" className="text-ink/80 hover:text-ink">
              Admin dashboard
            </Link>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md border border-ink/15 px-3 py-1.5 text-ink/80 hover:border-ink/30 hover:text-ink"
            >
              Sign out
            </button>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="rounded-md bg-ink px-3 py-1.5 text-paper hover:bg-ink/90"
            >
              Sign in
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
