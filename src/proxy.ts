import { NextRequest } from "next/server";
import { authMiddleware } from "./middlewares";

export default async function proxy(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/sign-in", "/auth/sign-up"],
};
