// Main NextAuth v5 config — Node runtime only (imports Prisma + adapter).
// proxy.ts must NOT import this file; it uses authConfig directly.
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,

  // Adapter enables user lookup but JWT strategy is required for Credentials providers
  // because Credentials sessions are never persisted in the database.
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    /**
     * Runs when a JWT is created or updated.
     * On sign-in `user` is populated — copy id + role onto the token.
     * On subsequent requests only `token` is available.
     */
    async jwt({ token, user }) {
      if (user) {
        // user.id and user.role come from authorize() return value.
        // Cast through unknown because the base User type has id?: string.
        token.userId = (user.id ?? "") as string;
        token.role = (user.role ?? "STUDENT") as "STUDENT" | "PARENT";
      }
      return token;
    },

    /**
     * Runs when session is accessed (e.g. auth() in RSC or server actions).
     * Copies token fields onto session.user so the app can read them.
     */
    async session({ session, token }) {
      if (session.user) {
        // token fields are `unknown` inside the narrow callback type even with augmentation;
        // safe to cast here because jwt() callback guarantees these are set on sign-in.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = token as any;
        session.user.id = t.userId as string;
        session.user.role = t.role as "STUDENT" | "PARENT";
      }
      return session;
    },
  },

  // Trust the host header set by the reverse proxy (set AUTH_TRUST_HOST=true in .env)
  trustHost: true,
});
