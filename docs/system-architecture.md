# Math SGK — System Architecture

> Vietnamese elementary math practice platform (grades 4-5). Real-time practice, mastery tracking, gamification, parent insights. MVP foundation shipped with quality gates (typecheck, lint, 161 tests, build).

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.4 | UI framework, Server Components (RSC) |
| **Framework** | Next.js | 16.2.4 | App Router, Server Actions, API routes |
| **Language** | TypeScript | ^5 | Strict mode, end-to-end type safety |
| **Styling** | Tailwind CSS | ^4 | Utility-first, v4 `@theme inline` (no config file) |
| **Component Lib** | shadcn/ui + Radix | latest | Unstyled primitives (avatar, dialog, dropdown, toast, etc.) |
| **Database** | PostgreSQL | 16 | Docker container, persistent volumes |
| **ORM** | Prisma | 7.8.0 | Migrations, adapter-pg for native Postgres |
| **Auth** | Auth.js (NextAuth) | 5.0.0-beta.31 | JWT sessions, Credentials providers, Prisma adapter |
| **State (client)** | Zustand | 5.0.12 | Ephemeral UI state (mascot animations) |
| **Query (installed)** | TanStack Query | 5.100.1 | Installed, not used (server actions called directly) |
| **Math rendering** | KaTeX + react-katex | 0.16.45 | Display fractions, decimals, notation |
| **Charts (parent)** | Recharts | 3.8.1 | Parent dashboard: bar, line, heatmap |
| **Animations** | Framer Motion | 12.38.0 | Smooth transitions, celebration sequences |
| **Confetti** | canvas-confetti | 1.9.4 | Celebration effect on correct answers |
| **RNG** | seedrandom | 3.0.5 | Deterministic random (same seed = same problem) |
| **Testing** | Vitest | 4.1.5 | Unit tests, 161 tests passing |
| **Linting** | ESLint | 9 | Code quality checks |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                          │
│  (Student: theme-student | Parent: theme-parent)          │
└────────────┬────────────────────────────────┬──────────────┘
             │                                │
             ▼ RSC Fetch                      ▼ Server Action
    ┌────────────────────┐          ┌──────────────────────────┐
    │   Next.js 16 App   │          │   Server Actions Layer   │
    │      Router        │          │  (practice.ts, auth*.ts) │
    │                    │          │                          │
    │ - RSC (layouts)    │          │ - Form submission        │
    │ - Pages (client)   │          │ - DB transactions        │
    │ - Streaming        │          │ - Mastery evaluation     │
    └────────┬───────────┘          │ - XP/badge awards       │
             │                       │ - Session validation     │
             │                       └──────────┬───────────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            │ Request/Response (JSON)
                            ▼
        ┌──────────────────────────────────────────┐
        │    Middleware (proxy.ts)                 │
        │  - Route protection (student/parent)     │
        │  - Auth check (req.auth from JWT)       │
        │  - Role-based access                    │
        └────────────┬─────────────────────────────┘
                     │
        ┌────────────▼─────────────────────────┐
        │     Prisma ORM + Postgres Adapter    │
        │  - Schema: User, Skill, Progress,    │
        │    Badge, Session, XP history        │
        │  - Migrations: 20260424234643_init   │
        │  - Adapter: @prisma/adapter-pg       │
        └────────────┬─────────────────────────┘
                     │
        ┌────────────▼─────────────────────────┐
        │    PostgreSQL 16 (Docker)            │
        │  Container: mathsgk-db               │
        │  Port: 5432                          │
        │  Vol: mathsgk_pgdata                 │
        └──────────────────────────────────────┘
```

## Data Flow: Practice Session

```
Student → Practice Page → Practice Session Component
             │
             ├─ RSC: Fetch skill, current progress
             │        Load curriculum (Topic→Lesson→Skill)
             │        Load last attempt data
             │
             ├─ Client: Render question card
             │          Mimi mascot (state="thinking")
             │          Input (numeric, fraction, decimal, etc.)
             │
             └─ On Submit (Server Action: submitAnswer)
                │
                ├─ Validate: student exists, skill valid, no rate limit
                │
                ├─ Server Logic (practice-submit-core.ts)
                │  │
                │  ├─ Generate answer: call generator(skill, seed)
                │  │  [seedrandom ensures determinism: same seed = same answer]
                │  │
                │  ├─ Compare: userAnswer vs correctAnswer (type-safe)
                │  │
                │  ├─ Evaluate Mastery: evaluateMastery(progress, attempt)
                │  │  ├─ Input: current level, streak, ratio, recency
                │  │  └─ Output: new level, new streak, new difficulty
                │  │
                │  ├─ Compute XP: computeXP(mastery, difficulty)
                │  │  └─ Award 10-50 XP based on performance
                │  │
                │  ├─ Evaluate Badges: evaluateBadges(user, progress)
                │  │  ├─ Streak milestones (7, 30 days)
                │  │  ├─ Mastery completion (all skills L4)
                │  │  └─ Tier unlocks (bronze, silver, gold)
                │  │
                │  ├─ DB Transaction (atomic):
                │  │  ├─ Update SkillProgress (level, streak, last reviewed)
                │  │  ├─ Insert PracticeSession (session log)
                │  │  ├─ Insert XPHistory (immutable ledger)
                │  │  ├─ Insert/Update Badge (if unlocked)
                │  │  └─ Commit or rollback
                │  │
                │  └─ Return Feedback
                │     ├─ isCorrect (boolean)
                │     ├─ correctAnswer (for learning, not checking)
                │     ├─ xpAwarded
                │     ├─ nextMasteryLevel
                │     ├─ badgesUnlocked
                │     └─ streak
                │
                └─ Client: Render feedback overlay
                   ├─ Correct: celebration animation + Mimi.cheering
                   ├─ Wrong: shake + Mimi.sad + hint
                   └─ CTA: next question OR summary
```

## Auth Flow

```
┌─────────────────────────────────────────────┐
│  Landing (/) — Role Picker                  │
│  "Student" or "Parent"                      │
└────────┬──────────────────────┬─────────────┘
         │                      │
   ┌─────▼──────────┐      ┌────▼───────────┐
   │ Student SignIn │      │ Parent SignIn  │
   │  (PIN 6-digit) │      │  (credentials) │
   │                │      │                │
   │ POST /auth/    │      │ POST /auth/    │
   │ callback/      │      │ callback/      │
   │ credentials?   │      │ credentials?   │
   │ username=PIN   │      │ email,pass     │
   └────────┬───────┘      └────┬───────────┘
            │                   │
            ▼                   ▼
   ┌──────────────────────────────────────┐
   │ NextAuth.js v5 Credentials Provider  │
   │ (auth.config.ts)                     │
   │                                      │
   │ - student: lookup User by PIN hash   │
   │ - parent: lookup User by email hash  │
   │ - if match: return { id, role }      │
   │ - if not: throw "Invalid creds"      │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ JWT Encode (auth.ts)                 │
   │ - strategy: "jwt"                    │
   │ - maxAge: 7 days                     │
   │ - payload: { id, role, username }    │
   │ - Set-Cookie: next-auth.session-token│
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ middleware (proxy.ts → auth.config)  │
   │ On every request:                    │
   │ - Extract JWT from cookie            │
   │ - Attach req.auth = decoded JWT      │
   │ - Verify expiry                      │
   │ - Route protection (roles)           │
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ Protected Routes                     │
   │ /student/* → role === "STUDENT"      │
   │ /parent/*  → role === "PARENT"       │
   │ others → /signin redirect            │
   └──────────────────────────────────────┘
```

## Mastery State Machine

```
┌─────────────────────────────────────────────────────────┐
│  Current Level + Attempt + Recency                      │
│  → evaluateMastery() [pure function]                    │
│  → Next Level + Streak + Difficulty                     │
└─────────────────────────────────────────────────────────┘

NOT_STARTED
    │ ├─ First correct? → FAMILIAR
    │ └─ 3rd+ wrong?    → FAMILIAR
    │
    └─→ FAMILIAR
        │ ├─ 5 consecutive correct?    → PROFICIENT (R2)
        │ ├─ ≥5 attempts & ratio≥65%?  → PROFICIENT (R3)
        │ └─ Failed attempts continue  → stay FAMILIAR
        │
        └─→ PROFICIENT
            │ ├─ 8 consecutive correct on HARD?  → MASTERED (R4)
            │ ├─ ≥15 attempts & ratio≥90%?       → MASTERED (R5)
            │ ├─ Ratio < 60% & 7+ days inactive? → back to FAMILIAR (R6)
            │ └─ Attempts continue             → stay PROFICIENT
            │
            └─→ MASTERED
                ├─ 30+ days inactive? → decay to PROFICIENT (R7)
                └─ Continued practice → stay MASTERED (R8)
```

## Gamification System

**XP Formula:**
```
baseXP = difficulty level (1-3)
streak bonus = +5 per day (up to 50)
mastery bonus = +10-20 per level gain
total = baseXP + streak + mastery
```

**Badges (20+):**
- Streaks: 7 day, 30 day, 90 day
- Mastery: Complete G4, Complete G5, Master one topic
- Speed: 10 correct in 5 minutes
- Tiers: Bronze (all lvl1), Silver (10 lvl3), Gold (30 lvl3)

**Daily Goal:**
- 15 minutes practice = 1 full day
- Timezone: Asia/Saigon (UTC+7)
- Resets at 00:00 SG time
- Visible on student dashboard

## Security & Validation

| Component | Pattern | Notes |
|-----------|---------|-------|
| **Passwords** | bcryptjs | Student PIN (6), parent password hashed |
| **Sessions** | JWT | NextAuth v5, maxAge 7d, HttpOnly cookie |
| **Answer Validation** | Server-side regeneration | Seed stored, answer never on wire |
| **Rate Limiting** | In-memory counter | Prevent brute-force attempts |
| **Role-based Access** | Middleware check | `req.auth.role` verified per route |
| **CORS** | Not needed | SPA + SSR, same-origin requests |
| **CSRF** | Built-in NextAuth | Automatic via server actions |
| **XSS** | React/TypeScript | Auto-escaping, no dangerouslySetInnerHTML |

## Deployment Architecture

```
┌─────────────────────────────────────┐
│  Development (docker-compose)       │
├─────────────────────────────────────┤
│ Next.js dev server (port 3000)      │
│ Postgres 16 (port 5432)             │
│ node_modules cached                 │
│ Hot reload enabled                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Production (Vercel or self-hosted) │
├─────────────────────────────────────┤
│ Next.js build output (.next)        │
│ Managed Postgres (Vercel Postgres)  │
│ Environment vars (DATABASE_URL)     │
│ Automatic deployments (git push)    │
│ SSL/TLS (Vercel managed)            │
└─────────────────────────────────────┘
```

## Performance Optimizations

| Area | Technique | Benefit |
|------|-----------|---------|
| **Fonts** | `next/font/google` with `preload` | No layout shift, Vietnamese subset |
| **Images** | Lucide icons (no bitmap assets) | Tiny bundle, instant render |
| **RSC** | Server-side rendering layouts | No JS for static nav, dashboard headers |
| **Caching** | React `cache()` in DAL | Deduped DB queries per request |
| **Streaming** | Next.js `@suspense` boundaries | Progressive render, fast FCP |
| **Bundle** | Code-split per route | Smaller initial load |
| **Tailwind v4** | `@theme inline` (no config file) | Zero runtime overhead |

## Testing Strategy

- **Unit tests (161)** — Pure functions in generators, mastery, gamification, parent lib
- **Integration stubs** — Routes + API handlers (Phase 13)
- **Coverage target** — 94% on core libs (src/lib/{generators,mastery,gamification,parent})
- **Test framework** — Vitest 4 with v8 coverage

## Known Limits & Tech Debt

1. **Generators** — Only 10 live, 19 stub. Phase 13 implements remaining 50.
2. **Spaced repetition cron** — Not yet automated. Phase 13 adds scheduler.
3. **Integration tests** — Stubbed, Phase 13 completes.
4. **Realtime** — No WebSocket. Phase 14 adds parent notifications.
5. **Dark mode** — Not implemented (student side incompatible with paper warmth).
6. **Internationalization** — Vietnamese-only MVP. Phase 15 adds English toggle.

## Next Milestones (Post-MVP)

| Phase | Focus | Est. Effort |
|-------|-------|------------|
| **13** | 50 remaining generators + spaced-rep cron + integration tests | 2w |
| **14** | Realtime parent notifications + session webhook | 1w |
| **15** | Bilingual toggle (parent English) + dark mode audit | 1w |
| **16** | Mobile app (React Native) + offline practice | 3w |
| **17** | Teacher dashboard + class management | 2w |
