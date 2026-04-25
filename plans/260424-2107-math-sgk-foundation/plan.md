---
title: "Math SGK Foundation"
description: "Bootstrap Vietnamese elementary math practice app (grades 4-5): schema, auth, generators, mastery, UI shells, gamification."
status: completed
priority: P1
effort: 78h
branch: main
tags: [bootstrap, nextjs16, prisma7, auth-js-v5, curriculum, student-ui, parent-ui]
created: 2026-04-24
completed: 2026-04-25
---

# Math SGK Foundation

End-to-end scaffold: Postgres schema → dual Credentials auth → 60-skill curriculum seed → generator registry (10 live, 50 stub) → mastery engine → design system → student flow (dashboard/practice/feedback/summary) → parent dashboard + child detail → badges/XP/streak → tests.

## Phases

| # | Phase | Priority | Effort | Deps | Status |
|---|---|---|---|---|---|
| 01 | Infrastructure & DB schema | P1 | 6h | — | completed |
| 02 | Signin (dual provider + proxy) | P1 | 8h | 01 | completed |
| 03 | Curriculum seed (Gr4 + Gr5, 60 skills) | P1 | 6h | 01 | completed |
| 04 | Generator framework + 10 core generators | P1 | 10h | 01 | completed |
| 05 | Mastery engine + server actions | P1 | 7h | 03, 04 | completed |
| 06 | Design system tokens + primitives | P2 | 8h | 01 | completed |
| 07 | Student shell + dashboard | P2 | 6h | 02, 03, 06 | completed |
| 08 | Student practice flow | P2 | 8h | 04, 05, 06, 07 | completed |
| 09 | Student feedback + summary | P2 | 4h | 06, 08 | completed |
| 10 | Parent dashboard + child detail | P2 | 8h | 02, 05, 06 | completed |
| 11 | Badge/XP/streak engine | P3 | 4h | 05 | completed |
| 12 | Testing + quality gates | P3 | 3h | 04, 05, 11 | completed |

**Total:** 78h. Critical path 01 → 02/03/04 → 05 → 07/08/09 → 10 → 11 → 12.

## Key Dependencies
- Phases 01-05 gate everything; 06 can start in parallel once 01 lands (tokens only need Tailwind/globals).
- 07-09 are student flow; 10 is parent flow; independent once 05/06 done.
- 11 extends 05 (badge/XP on submit); 12 tests 04/05/11.

## Decision Architecture (non-negotiable)
- `correctAnswer` NEVER on wire. Server regenerates from `(skillKey, seed, difficulty)` on submit.
- Generator-first. Pools only for word/geometry problems explicitly tagged `[pool]` in research.
- Mastery = pure function `evaluateMastery(progress, attempt) → newProgress` — no side effects.
- Zustand = ephemeral client UI state (Mimi emotion, toast). TanStack Query = server mutations. RSC = all reads.
- `proxy.ts` = optimistic JWT role redirect only. Real enforcement in RSC + server actions via DAL `verifySession()`.
- Password hashing = **bcryptjs** (already installed, KISS). Research recommends Argon2id; tradeoff noted in Phase 02.

## File Ownership Map
| Phase | Owns |
|---|---|
| 01 | `prisma/schema.prisma`, `prisma/migrations/*`, `src/lib/prisma.ts`, `.env.example` |
| 02 | `src/auth.config.ts`, `src/auth.ts`, `proxy.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/dal.ts`, `src/lib/rate-limit.ts`, `src/types/auth.d.ts`, `src/app/(auth)/**` |
| 03 | `prisma/seed.ts`, `prisma/seed-data/**` |
| 04 | `src/lib/generators/**` |
| 05 | `src/lib/mastery/**`, `src/app/actions/practice.ts` |
| 06 | `src/app/globals.css`, `src/components/ui/**`, `src/components/mimi/**` |
| 07 | `src/app/(student)/student/page.tsx`, `src/app/(student)/layout.tsx`, `src/components/student/**` |
| 08 | `src/app/(student)/student/practice/[skillKey]/**`, `src/components/practice/**` |
| 09 | `src/app/(student)/student/summary/page.tsx`, `src/components/feedback/**` |
| 10 | `src/app/(parent)/parent/**`, `src/components/parent/**` |
| 11 | `src/lib/gamification/**` (badges, XP, streak) |
| 12 | `tests/**`, `vitest.config.ts` |

No two phases write the same file. Phase 06 lands `globals.css` first; all later phases only add classes.

## Success Criteria (whole plan)
- `npm run typecheck` green.
- `npm run lint` green.
- `npm run db:migrate && npm run db:seed` idempotent, 60 skills seeded.
- Student can sign in with PIN, answer 5 questions, see mastery bucket change.
- Parent can sign in and see composite rating + weak-skills list for linked child.
- Unit tests: generators deterministic per seed; mastery transitions match table.

## Completion Summary (2026-04-25)

**Status:** All 12 phases completed end-to-end.

**Implementation shipped:**
- Phase 01: Postgres 16 + full 16-table Prisma schema + migrations applied. Prisma 7 ESM client at `src/generated/prisma`, re-exported via `src/lib/prisma.ts`.
- Phase 02: NextAuth v5 dual-provider (student PIN + parent credentials). Proxy.ts JWT redirect. DAL in `src/lib/dal.ts`. 14 new files. Rate-limit + 1px redirect.
- Phase 03: Idempotent seed: 60 skills (33 Grade 4, 27 Grade 5), 16 badges. All skills have one of generatorKey/poolKey (no null).
- Phase 04: 10 live generators (addition, subtraction, multiplication, etc.) + 19 stubs. Server-only, deterministic per seed. seedrandom installed.
- Phase 05: Pure mastery state machine (8 transition rules). getNextQuestion/submitAnswer with stripAnswer. Atomic transactions. No side effects in state logic.
- Phase 06: Tailwind v4 tokens. Vietnamese fonts (Fredoka + Nunito + JetBrains Mono). Mimi 6-state mascot. Full primitive UI components. lucide-react@1.9.0 left as-is (1.x is correct for this version).
- Phase 07: Student layout + dashboard + topic page. Zustand mascot store. 12 files.
- Phase 08: Practice flow at `/student/practice/[skillKey]`. useReducer session. 5 input adapters. Thin feedback overlay (replaced by Phase 09).
- Phase 09: Full feedback overlay with confetti + level-up banner. Summary page at `/student/summary`.
- Phase 10: Parent dashboard + child detail. Composite rating. Weekly heatmap (SVG). Monthly trend with Recharts + dynamic SSR guard. Cross-child leak protection.
- Phase 11: Pure XP/streak/badge helpers. Extended submitAnswer with gamification. Badge criteria adapted to match seeded shapes.
- Phase 12: Vitest installed. 161 unit tests passing across 15 files (generators, mastery, gamification, parent compute). Integration tests stubbed for Phase 13.

**Quality gates (all green):**
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors, 0 warnings
- `npm run test:unit`: 161/161 passing (341ms)
- `npm run build`: succeeds, 11 routes
- `npm run db:seed`: idempotent

**Deliverables:**
- 60 skills + 16 badges + 10 live generators + 19 stubs
- Full student flow (signin → dashboard → practice → feedback → summary)
- Parent flow (signin → child dashboard + detail + trends)
- Mastery transitions + badge/XP/streak logic
- Comprehensive unit test coverage

**Deferred to Phase 13:**
- Integration tests (e2e auth, practice flow, gamification chains)
- Spaced-repetition cron scheduler
- Parent-child M:N multi-link (MVP uses 1:N)

## Unresolved Questions
1. Parent-child link: 1:N in MVP. Revisit if multi-parent needed.
2. Argon2id vs bcryptjs: bcryptjs chosen for KISS. Swap-in-place if needed later.
3. lucide-react ^1.9.0: verified correct for this bundle version.
4. Vietnamese fonts: Fredoka + Nunito + JetBrains Mono loaded via next/font/google. Confirm subset support in production.
5. Spaced-repetition decay: `nextReviewAt` column exists. Cron job deferred to Phase 13.
6. Badge evaluation: synchronous inside `submitAnswer`. Async job queue optional if latency issue arises.
