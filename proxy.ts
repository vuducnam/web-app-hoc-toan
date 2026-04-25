// Next.js 16 proxy (renamed from middleware.ts).
// Runs in Node.js runtime. Performs OPTIMISTIC JWT role redirect only —
// not a trust boundary. Real enforcement lives in DAL + server actions.
//
// IMPORTANT: Import only authConfig here, never src/auth.ts.
// src/auth.ts pulls in PrismaAdapter which couples to Prisma at module init.
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

// Lightweight auth helper — edge-safe config only, no adapter.
const { auth } = NextAuth(authConfig);

// Public auth routes — accessible WITHOUT a session.
// Anything else under /student/* or /parent/* requires the matching role.
const PUBLIC_AUTH_PATHS = [
  "/student/signin",
  "/parent/signin",
  "/parent/signup",
];

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default auth(function proxy(req: NextAuthRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const role = req.auth?.user?.role;

  // --- Redirect already-authenticated users away from auth pages ---
  // Includes signup so a logged-in parent visiting /parent/signup goes home.
  if (
    role === "STUDENT" &&
    (pathname === "/student/signin" || pathname.startsWith("/student/signin/"))
  ) {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }
  if (
    role === "PARENT" &&
    (pathname === "/parent/signin" ||
      pathname === "/parent/signup" ||
      pathname.startsWith("/parent/signin/") ||
      pathname.startsWith("/parent/signup/"))
  ) {
    return NextResponse.redirect(new URL("/parent", nextUrl));
  }

  // --- Public auth routes are always reachable ---
  if (isPublicAuthPath(pathname)) {
    return NextResponse.next();
  }

  // --- Protect /student/* routes ---
  if (pathname.startsWith("/student")) {
    if (!role) {
      return NextResponse.redirect(new URL("/student/signin", nextUrl));
    }
    if (role !== "STUDENT") {
      // Wrong role — send to landing with an error query param
      return NextResponse.redirect(new URL("/?error=unauthorized", nextUrl));
    }
  }

  // --- Protect /parent/* routes ---
  if (pathname.startsWith("/parent")) {
    if (!role) {
      return NextResponse.redirect(new URL("/parent/signin", nextUrl));
    }
    if (role !== "PARENT") {
      return NextResponse.redirect(new URL("/?error=unauthorized", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/student/:path*",
    "/parent/:path*",
  ],
};
