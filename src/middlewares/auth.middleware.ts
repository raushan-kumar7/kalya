// import { getSessionCookie } from "better-auth/cookies";
// import { NextRequest, NextResponse } from "next/server";

// const PROTECTED_ROUTES = ["/dashboard"];
// const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

// export const authMiddleware = (request: NextRequest) => {
//   const { pathname } = request.nextUrl;

//   const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

//   const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

//   if (!isProtected && !isAuthRoute) {
//     return NextResponse.next();
//   }

//   const sessionCookie = getSessionCookie(request);

//   if (isProtected && !sessionCookie) {
//     const signInUrl = new URL("/auth/sign-in", request.url);
//     signInUrl.searchParams.set("redirectTo", pathname);
//     return NextResponse.redirect(signInUrl);
//   }

//   if (isAuthRoute && sessionCookie) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// };

import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

export const authMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const sessionCookie = getSessionCookie(request);

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
};
