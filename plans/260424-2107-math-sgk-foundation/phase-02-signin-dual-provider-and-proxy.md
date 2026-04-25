---
title: "Phase 02 — Signin: Dual Provider + Proxy"
priority: P1
effort: 8h
status: completed
depends_on: [01]
completed: 2026-04-24
---

# Phase 02 — Signin: Dual Provider + Proxy

## Context Links
- Research: `docs/research/researcher-nextauth-v5-dual-provider.md` (full source of truth)
- Wireframes: `docs/wireframe/student-signin.html`, `docs/wireframe/parent-signin.html`
- Next.js 16 docs: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` (file must be `proxy.ts` not `middleware.ts`)
- Next.js 16 signin guide: `node_modules/next/dist/docs/01-app/02-guides/authentication.md` (DAL pattern)

## Overview
NextAuth v5 with two Credentials providers (student PIN, parent password). Split `auth.config.ts` (edge-safe) vs `auth.ts` (Prisma). `proxy.ts` does optimistic JWT role redirect only. Real enforcement lives in DAL + server actions. In-memory rate limit 5/15min.

## Key Insights
- **Multiple-Credentials bug in Auth.js v5:** each provider needs unique `id`; callers invoke `signIn("student-pin", ...)` vs `signIn("parent-credentials", ...)` — never bare `signIn`.
- **Next.js 16 rename:** `middleware.ts` → `proxy.ts`, same API, Node.js runtime. Research doc still says `middleware.ts`; override with `proxy.ts`.
- **JWT strategy required** because Credentials provider doesn't persist sessions via adapter.
- **DAL is the security layer.** Proxy is optimistic only (read cookie, redirect) — not a trust boundary.

## Requirements
**Functional:**
- `/student/signin` — username + 4-digit PIN keypad. Submit calls server action → `signIn("student-pin")`.
- `/parent/signin` — email + secret. Submit → `signIn("parent-credentials")`.
- Successful student signin redirects `/student`; parent → `/parent`.
- Proxy redirects: unauth hitting `/student/*` → `/student/signin`; unauth hitting `/parent/*` → `/parent/signin`. Wrong role → `/` landing with error toast.
- Signout via server action clears cookie.
- Rate limit: 5 failed attempts per (username|email) per 15 minutes → return generic "Sai thông tin đăng nhập".

**Non-functional:**
- Secrets hashed with **bcryptjs** (cost 10). YAGNI — Argon2 install is out of scope; schema fields `pinHash`/`passwordHash` store bcrypt strings; swap later is non-breaking.
- `AUTH_SECRET` from `.env` (32-char openssl random).
- Session cookie: httpOnly, secure in prod, sameSite=lax, 7-day expiry.
- Type-augment `Session` + `JWT` with `role` and `userId`.

## Architecture
```
Request → proxy.ts (optimistic JWT decode) → [redirect or pass] → page.tsx (RSC)
                                                                     |
                                                           verifySession() DAL
                                                                     |
                                                           [redirect to signin if no session]
```

**Files called by RSC pages:**
- `src/lib/dal.ts` exports `verifySession()` using React `cache` — dedupes per-render.

**Files called by server actions:**
- Actions re-run `verifySession()` (never trust proxy or client).

## Related Code Files
**Create:**
- `src/auth.config.ts` — providers array, no Prisma import (edge-safe)
- `src/auth.ts` — `NextAuth({...authConfig, adapter: PrismaAdapter(prisma), session: {strategy:"jwt"}})`. Exports `auth`, `handlers`, `signIn`, `signOut`.
- `src/app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`
- `proxy.ts` (project root, NOT in `src/`) — optimistic role redirect
- `src/lib/dal.ts` — `verifySession()` with `cache()`; `verifyStudent()` / `verifyParent()` convenience wrappers
- `src/lib/rate-limit.ts` — in-memory Map; exports `checkLoginRateLimit(key)`
- `src/lib/auth-hashing.ts` — `hashPin(plain)`, `verifyPin(plain, hash)`, `hashSecret`, `verifySecret` (all bcryptjs)
- `src/types/auth.d.ts` — module augmentation for `Session` + `JWT`
- `src/app/(auth)/student/signin/page.tsx` — server component renders client form
- `src/app/(auth)/parent/signin/page.tsx` — idem
- `src/components/auth/student-signin-form.tsx` — client, `useActionState`, PIN keypad
- `src/components/auth/parent-signin-form.tsx` — client
- `src/app/actions/auth-signin.ts` — `"use server"`; `signInStudent(formData)`, `signInParent(formData)`; wraps `signIn()` + `AuthError` catch
- `src/app/actions/auth-signout.ts` — `signOutUser()`

**Modify:**
- `.env.example` — add `AUTH_SECRET=`, `AUTH_URL=http://localhost:3000`
- `src/app/layout.tsx` — no change here; auth layout is a route group

## Implementation Steps
1. Install missing dep: nothing — `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter`, `bcryptjs` already in package.json.
2. Generate `AUTH_SECRET`: `openssl rand -base64 32`. Put in `.env`, placeholder in `.env.example`.
3. Write `src/lib/auth-hashing.ts` wrapping `bcryptjs` (keeps provider code clean, single place to swap to argon2 later).
4. Write `src/lib/rate-limit.ts` — Map keyed by `"student:" + username` or `"parent:" + email`.
5. Write `src/auth.config.ts`: two `Credentials()` with distinct ids `"student-pin"` + `"parent-credentials"`. `authorize` calls `prisma.user.findUnique`, checks role match, calls `verifyPin` / `verifySecret`, returns `{ id, role }` or `null`. Include `pages: { signIn: "/" }` placeholder — real redirect is per-role, handled in actions.
6. Write `src/auth.ts`: merge `authConfig`, add `PrismaAdapter(prisma)`, `session: { strategy: "jwt" }`, `callbacks: { jwt, session }` copying `role` + `userId` onto the token.
7. Write `src/types/auth.d.ts`:
   ```ts
   declare module "next-auth" { interface Session { user: { id: string; role: "STUDENT" | "PARENT"; name?: string|null } } }
   declare module "next-auth/jwt" { interface JWT { role: "STUDENT" | "PARENT"; userId: string } }
   ```
8. Write `src/app/api/auth/[...nextauth]/route.ts`: `export const { GET, POST } = handlers` (one-liner).
9. Write `proxy.ts` at project root:
   - Decode session via `auth()` helper (works in proxy in Next.js 16 Node runtime).
   - Branch: `/student/*` requires role STUDENT; `/parent/*` requires PARENT; signin pages redirect logged-in to their home.
   - `export const config = { matcher: ["/student/:path*", "/parent/:path*", "/(auth)/:path*"] }`.
10. Write `src/lib/dal.ts`:
    ```ts
    import "server-only"; import { cache } from "react"; import { redirect } from "next/navigation"; import { auth } from "@/auth";
    export const verifySession = cache(async () => { const s = await auth(); if (!s?.user) redirect("/"); return s.user; });
    export const verifyStudent = cache(async () => { const u = await verifySession(); if (u.role !== "STUDENT") redirect("/"); return u; });
    export const verifyParent = cache(async () => { const u = await verifySession(); if (u.role !== "PARENT") redirect("/"); return u; });
    ```
11. Write signin pages + forms. PIN keypad = 3x4 grid of buttons, backspace, 4-digit display. Form uses `useActionState` binding to the server action.
12. Write `src/app/actions/auth-signin.ts` — validate with zod, rate-limit, call `signIn("student-pin", { redirect: false, username, pin })`, on success `redirect("/student")`, on failure return `{ error: "..." }`. Identical shape for parent.
13. Typecheck + manual smoke: seed a test user via `prisma studio` (Phase 03 does full seed), log in.

## Todo List
- [x] `.env` + `.env.example` AUTH_SECRET / AUTH_URL
- [x] `src/lib/auth-hashing.ts`
- [x] `src/lib/rate-limit.ts`
- [x] `src/auth.config.ts` dual providers with unique ids
- [x] `src/auth.ts`
- [x] `src/types/auth.d.ts`
- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] `proxy.ts` (root)
- [x] `src/lib/dal.ts` verify* helpers
- [x] Student signin page + form + action
- [x] Parent signin page + form + action
- [x] Manual e2e: signin both roles, proxy redirect both directions

## Success Criteria
- [x] Visiting `/student` unauthenticated → redirect `/student/signin`
- [x] Visiting `/parent` as STUDENT → redirect `/` with error
- [x] Invalid PIN 5x → 6th attempt returns rate-limit message
- [x] `await auth()` in a RSC returns `{ user: { role, id } }`
- [x] Typecheck green; `role` typed on session everywhere

## Risk Assessment
**R1 — Multi-Credentials signIn bug (High/High):** Auth.js v5 historical bug where second Credentials provider breaks on import. *Mitigation:* Unique `id` per provider (research §3); always pass provider id to `signIn()`; separate route-group folders `/student/signin` vs `/parent/signin` so action code cannot mix them up.

**R2 — Proxy on Node runtime + Prisma (Medium/High):** In Next.js 16 proxy runs Node.js (per `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`), so `auth()` works — BUT the `auth()` helper may still pull `authConfig` that transitively imports Prisma. *Mitigation:* Never import `auth.ts` in `proxy.ts` — only import `authConfig` and call `NextAuth(authConfig).auth` inline (the split-config pattern from research §2). Verify no Prisma import in `auth.config.ts` with a grep in the phase exit check.

## Rollback Plan
Delete `proxy.ts` to disable route protection (pages still enforce via DAL). Revert `src/auth.ts` to uninstall adapter if session issues.

## Next Steps
Unblocks Phases 07, 08, 10 (all need signed-in user). Phase 05's server actions depend on `verifyStudent()`.

## Completion Note
Dual-provider auth (student PIN + parent credentials) live. Proxy.ts with 1px JWT redirect. DAL in `src/lib/dal.ts`. 14 files created. Rate-limit working (5/15min). All signin flows functional.
