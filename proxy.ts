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

export default auth(function proxy(req: NextAuthRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const role = req.auth?.user?.role;

  // --- Redirect already-authenticated users away from signin pages ---
  if (pathname.startsWith("/student/signin") && role === "STUDENT") {
    return NextResponse.redirect(new URL("/student", nextUrl));
  }
  if (pathname.startsWith("/parent/signin") && role === "PARENT") {
    return NextResponse.redirect(new URL("/parent", nextUrl));
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
    "/(auth)/:path*",
  ],
};
