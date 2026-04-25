// Module augmentation — extends NextAuth's built-in types with role + userId.
// This file is picked up by TypeScript automatically (no import needed).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "PARENT";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  // Extend the User returned by authorize() so callbacks can read role
  interface User {
    role?: "STUDENT" | "PARENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "STUDENT" | "PARENT";
    userId: string;
  }
}
