import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type RequireSessionResult =
  | { session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>; error: null }
  | { session: null; error: NextResponse };

/**
 * Resolves the current session for a route handler, or hands back a
 * ready-to-return 401 response. Centralizes the auth check so every
 * protected API route does the same thing the same way instead of
 * re-checking `session?.user` and hand-rolling the error response inline.
 *
 * Usage:
 *   const { session, error } = await requireSession(req);
 *   if (error) return error;
 *   // session.user is guaranteed non-null past this point
 */
export async function requireSession(req: NextRequest): Promise<RequireSessionResult> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}
