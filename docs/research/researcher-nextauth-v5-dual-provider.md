# NextAuth v5 (Auth.js) Dual Credentials Provider Research

**Date:** 2026-04-24 | **Target:** Next.js 16 App Router + Prisma + JWT

---

## 1. Package & Versioning

**Package name:** `next-auth` (Auth.js is the new namespace)  
**Latest version (Apr 2026):** `next-auth@5.0.0-beta.26` (stable v5 not yet released)  
**Adapter:** `@auth/prisma-adapter`  
**Status:** Production-ready core APIs; beta tag retained for compatibility guarantees.

---

## 2. File Structure

```
src/
├── auth.config.ts          # Common config (no DB dependency)
├── auth.ts                 # Main config + PrismaAdapter + JWT
├── middleware.ts           # Route protection with role checks
└── app/api/auth/[...nextauth]/route.ts
```

**Key:** Split config so middleware doesn't trigger database access in edge contexts.

---

## 3. Dual Credentials Providers

**⚠️ Known Limitation:** Auth.js v5 has a bug where multiple Credentials providers may break `signIn()` server function. **Workaround:** Use unique `id` for each provider and explicitly call `signIn(providerId)` from client/server.

### auth.config.ts
```typescript
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    Credentials({
      id: "student-pin",
      name: "Student Login",
      credentials: {
        username: { label: "Username", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.pin) return null;
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user || user.role !== "STUDENT") return null;
        const valid = await verifyPin(credentials.pin, user.pinHash);
        return valid ? { id: user.id, name: user.username, role: "STUDENT" } : null;
      },
    }),
    Credentials({
      id: "parent-credentials",
      name: "Parent Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || user.role !== "PARENT") return null;
        const valid = await verify(credentials.password, user.passwordHash);
        return valid ? { id: user.id, email: user.email, role: "PARENT" } : null;
      },
    }),
  ],
};
```

---

## 4. Session Strategy & Type Augmentation

### auth.ts (JWT Strategy)
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      session.user.userId = token.userId as string;
      return session;
    },
  },
});
```

### types/auth.d.ts (Type Augmentation)
```typescript
import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      role: "STUDENT" | "PARENT";
      userId: string;
    };
  }
  interface JWT extends DefaultJWT {
    role: "STUDENT" | "PARENT";
    userId: string;
  }
}
```

---

## 5. Middleware & Route Protection

```typescript
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const userRole = req.auth?.user?.role;

  // Student-only routes
  if (pathname.startsWith("/student") && userRole !== "STUDENT") {
    return Response.redirect(new URL("/auth/signin", req.url));
  }
  // Parent-only routes
  if (pathname.startsWith("/parent") && userRole !== "PARENT") {
    return Response.redirect(new URL("/auth/signin", req.url));
  }
});

export const config = { matcher: ["/student/:path*", "/parent/:path*"] };
```

**Next.js 16 Note:** `middleware.ts` now runs on Node.js runtime (formerly `proxy.ts`); Prisma edge compatibility no longer required.

---

## 6. PIN Security

**Recommendation:** Use **Argon2id** (OWASP recommendation) over bcrypt for 4-digit PINs.  
**Why:** Bcrypt has 72-byte limit; Argon2id resists GPU/timing attacks better. Use `node-argon2` or Node.js 24.7.0+ crypto.scrypt.

### PIN Hashing (Argon2)
```typescript
import { hash, verify } from "argon2";

// Hash at user creation
const pinHash = await hash("1234", { type: argon2id });

// Verify at login
const valid = await verify(pinHash, "1234");
```

---

## 7. Rate Limiting (MVP Approach)

**Auth.js v5 has no built-in rate limiting for Credentials.** Implement at application level:

### In-Memory Store (Development)
```typescript
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  
  if (!record || record.resetAt < now) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 5) return false; // 5 attempts per 15 min
  record.count++;
  return true;
}
```

**Production:** Use Postgres table or Redis. Track by `username + IP`. Throttle after 5 failed attempts per 15 minutes.

---

## 8. Common Gotchas (Next.js 16 + Auth.js v5)

1. **Multiple Credentials Bug:** Always use unique `id` and explicit `signIn("provider-id")` calls.
2. **Edge Runtime:** Next.js 16 proxy runs on Node.js; Prisma edge adapter no longer needed.
3. **Type Errors:** Module augmentation must be in `.d.ts` file in `src/` (checked by tsconfig).
4. **Adapter Session:** If using `session: "database"`, Credentials provider won't auto-create sessions—use JWT.
5. **Middleware URL Encoding:** Ensure `req.auth` is hydrated before checking role (it is).

---

## Unresolved Questions

1. Does your Prisma schema already include `User` model with `role`, `username`, `email` fields?
2. Will you need "forgot PIN" flow for students (requires email/verification)?
3. Should failed logins be logged to database for audit trail, or in-memory suffices for MVP?
4. Is Next.js 16 already in use, or upgrading from v15? (Changes edge runtime behavior.)

---

## Sources

- [Auth.js Credentials Documentation](https://authjs.dev/getting-started/providers/credentials)
- [Auth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [Auth.js Role-Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [Auth.js Type Extensions](https://authjs.dev/guides/extending-the-session)
- [Multiple Credentials Providers Issue #9673](https://github.com/nextauthjs/next-auth/issues/9673)
- [Next.js 16 Middleware Edge Runtime Changes](https://github.com/nextauthjs/next-auth/discussions/13252)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Node Argon2 Library](https://github.com/ranisalt/node-argon2)
