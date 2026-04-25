// Edge-safe auth config — NO Prisma import allowed here.
// This file is imported by both src/auth.ts (Node) and proxy.ts (Node/Edge).
// Credentials authorize() runs in Node only (adapter-less path in proxy.ts skips it).
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const studentSchema = z.object({
  username: z.string().min(1).max(50),
  pin: z.string().length(4).regex(/^\d{4}$/),
});

const parentSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

// ---------------------------------------------------------------------------
// Auth config (providers only — adapter + callbacks in src/auth.ts)
// ---------------------------------------------------------------------------

export const authConfig: NextAuthConfig = {
  providers: [
    // Provider 1: student PIN login
    // IMPORTANT: unique id required — Auth.js v5 multi-credentials bug
    Credentials({
      id: "student-pin",
      name: "Student PIN",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        pin: { label: "Mã PIN", type: "password" },
      },
      async authorize(credentials) {
        // Validate shape first
        const parsed = studentSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Dynamic import keeps Prisma + bcryptjs out of Edge bundle.
        // This code path is only reached in the Node runtime (server actions).
        const { prisma } = await import("@/lib/prisma");
        const { verifyPin } = await import("@/lib/auth-hashing");

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          select: { id: true, role: true, name: true, pinHash: true },
        });

        if (!user || user.role !== "STUDENT" || !user.pinHash) return null;

        const valid = await verifyPin(parsed.data.pin, user.pinHash);
        if (!valid) return null;

        return { id: user.id, role: user.role, name: user.name };
      },
    }),

    // Provider 2: parent email + password login
    Credentials({
      id: "parent-credentials",
      name: "Parent Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const parsed = parentSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { prisma } = await import("@/lib/prisma");
        const { verifySecret } = await import("@/lib/auth-hashing");

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, role: true, name: true, passwordHash: true },
        });

        if (!user || user.role !== "PARENT" || !user.passwordHash) return null;

        const valid = await verifySecret(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, role: user.role, name: user.name };
      },
    }),
  ],

  // Signin page placeholder — real per-role redirects are handled in server actions.
  pages: { signIn: "/" },
};
