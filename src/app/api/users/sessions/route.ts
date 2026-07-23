// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { auth } from "@/lib/auth";
// import { requireSession } from "@/lib/require-session";
// import { getLocationFromIp, parseDevice } from "@/utils/request-info";

// export async function GET(req: NextRequest) {
//   const { session, error } = await requireSession(req);
//   if (error) return error;

//   const sessions = await auth.api.listSessions({ headers: req.headers });

//   const enriched = await Promise.all(
//     sessions.map(async (s) => {
//       const { browser, os } = parseDevice(s.userAgent);
//       const { label: location } = await getLocationFromIp(s.ipAddress ?? undefined);

//       return {
//         id: s.id,
//         ipAddress: s.ipAddress,
//         userAgent: s.userAgent,
//         createdAt: s.createdAt,
//         updatedAt: s.updatedAt,
//         device: browser && os ? `${browser} on ${os}` : "Unknown device",
//         os: os ?? "Unknown OS",
//         browser: browser ?? "Unknown browser",
//         location,
//         current: s.token === session.session.token,
//       };
//     })
//   );

//   enriched.sort((a, b) => Number(b.current) - Number(a.current));
//   return NextResponse.json({ sessions: enriched });
// }

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { requireSession } from "@/lib/require-session";
// import { APIError } from "better-auth/api";

// export async function GET(req: NextRequest) {
//   const { session, error } = await requireSession(req);
//   if (error) return error;

//   try {
//     const sessions = await auth.api.listSessions({ headers: req.headers });
//     return NextResponse.json({ sessions });
//   } catch (err) {
//     if (err instanceof APIError && err.body?.code === "SESSION_NOT_FRESH") {
//       // Not a server error — the caller just needs to re-authenticate.
//       return NextResponse.json(
//         { error: "Please sign in again to manage your sessions.", code: "SESSION_NOT_FRESH" },
//         { status: 403 }
//       );
//     }
//     console.error("Failed to list sessions:", err);
//     return NextResponse.json({ error: "Could not load sessions." }, { status: 500 });
//   }
// }

// src/app/api/users/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/require-session";
import { parseDevice, getLocationFromIp } from "@/utils/request-info";
import { APIError } from "better-auth/api";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession(req);
  if (error) return error;

  try {
    const rawSessions = await auth.api.listSessions({ headers: req.headers });

    const sessions = await Promise.all(
      rawSessions.map(async (s) => {
        const { browser, os } = parseDevice(s.userAgent ?? undefined);
        const { label: location } = await getLocationFromIp(s.ipAddress ?? "");

        return {
          id: s.id,
          device: os ?? "Unknown device", // <-- this is what was missing
          browser: browser ?? "Unknown browser",
          location,
          ipAddress: s.ipAddress ?? "Unknown",
          updatedAt: s.updatedAt,
          current: s.id === session.session.id, // compare to the requester's own session id
        };
      })
    );

    return NextResponse.json({ sessions });
  } catch (err) {
    if (err instanceof APIError && err.body?.code === "SESSION_NOT_FRESH") {
      return NextResponse.json(
        { error: "Please sign in again to manage your sessions.", code: "SESSION_NOT_FRESH" },
        { status: 403 }
      );
    }
    console.error("Failed to list sessions:", err);
    return NextResponse.json({ error: "Could not load sessions." }, { status: 500 });
  }
}
