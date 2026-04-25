// Data Access Layer — session verification helpers.
// Import "server-only" prevents accidental use in Client Components.
// React cache() deduplicates auth() calls within a single render pass.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Verify that a valid session exists and return the session user.
 * Redirects to "/" if unauthenticated.
 * Deduplicated per render via React cache().
 */
export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  // After the guard, user is guaranteed non-null
  return session.user as { id: string; role: "STUDENT" | "PARENT"; name?: string | null };
});

/**
 * Verify session and assert the user is a STUDENT.
 * Redirects to "/" for unauthenticated or wrong-role requests.
 */
export const verifyStudent = cache(async () => {
  const user = await verifySession();
  if (user.role !== "STUDENT") {
    redirect("/");
  }
  return user;
});

/**
 * Verify session and assert the user is a PARENT.
 * Redirects to "/" for unauthenticated or wrong-role requests.
 */
export const verifyParent = cache(async () => {
  const user = await verifySession();
  if (user.role !== "PARENT") {
    redirect("/");
  }
  return user;
});
