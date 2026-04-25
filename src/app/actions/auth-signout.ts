"use server";
// Server action for signing out — clears the session cookie via NextAuth.
import { signOut } from "@/auth";

export async function signOutUser(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
