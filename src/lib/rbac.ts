import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Resolves the current session and confirms the user has the ADMIN role.
 * Returns either `{ session }` on success or `{ error }` (a ready-to-return
 * NextResponse) on failure, so route handlers can do:
 *
 *   const { session, error } = await requireAdmin();
 *   if (error) return error;
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 })
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Admin role required." }, { status: 403 })
    };
  }

  return { session, error: null };
}
