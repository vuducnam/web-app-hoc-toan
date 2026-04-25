# Math SGK — Codebase Summary

> Complete codebase map for Vietnamese elementary math practice (grades 4-5). Stack: Next.js 16 App Router, TypeScript strict, Prisma 7, Auth.js v5, Tailwind v4, Postgres 16.

## Source Structure

```
src/
├── app/                    # Next.js 16 App Router (RSC + Server Actions)
│   ├── (auth)/            # Auth routes (signin, signout)
│   ├── (student)/         # Student layout + dashboard, practice, summary
│   ├── (parent)/          # Parent layout + dashboard, child detail
│   ├── actions/           # Server actions for practice, auth
│   ├── api/auth/          # NextAuth v5 API route handler
│   ├── globals.css        # Tailwind v4 @theme inline directives
│   ├── layout.tsx         # Root layout, load fonts
│   └── page.tsx           # Public landing page
│
├── auth.ts                # NextAuth v5 instance (Prisma adapter, JWT)
├── auth.config.ts         # Auth config (edge-safe, Credentials providers)
│
├── components/            # React components (TSX, Tailwind v4)
│   ├── auth/             # SignIn forms (student + parent)
│   ├── feedback/         # Correct/wrong/level-up overlays, confetti
│   ├── mimi/             # Mascot SVG + state machine
│   ├── parent/           # Parent dashboard widgets, charts (Recharts)
│   ├── practice/         # Practice session, input adapters, feedback
│   ├── student/          # Student dashboard, topic cards, CTAs
│   ├── summary/          # Post-practice summary, badge/XP display
│   └── ui/               # Base UI (button, card, progress, toast, etc.)
│
├── generated/            # Auto-generated files (Prisma client)
│   └── prisma/          # @prisma/client exports (ESM at src/generated/prisma)
│
├── lib/                  # Business logic (pure functions, no React)
│   ├── dashboard/        # Student/parent dashboard aggregation
│   │   ├── aggregate-topic-mastery.ts    # Compute topic progress
│   │   └── pick-continue-skill.ts        # Select next practice skill
│   │
│   ├── generators/       # Problem generation (10 live + 19 stub)
│   │   ├── arithmetic/   # add-sub-100k-carry, multiply-2-digit, divide-2-digit
│   │   ├── decimals/     # decimal-add, decimal-multiply
│   │   ├── fractions/    # fraction-add, fraction-subtract, simplify, common-denom
│   │   ├── percent/      # percent-of-whole
│   │   ├── normalize/    # numeric, fraction, decimal formatting
│   │   ├── registry.ts   # Lookup table: generatorKey → Generator instance
│   │   ├── seeded-rng.ts # seedrandom wrapper for determinism
│   │   ├── stub.ts       # NotImplementedError for unimplemented skills
│   │   └── types.ts      # Generator interface, question/answer types
│   │
│   ├── gamification/     # XP, badges, streaks, daily goals
│   │   ├── badge-criteria-types.ts      # Badge type defs
│   │   ├── compute-xp.ts                # XP formula (attempt count, mastery)
│   │   ├── evaluate-badges.ts           # Badge unlock logic
│   │   ├── daily-goal.ts                # 15-min target, timezone (Asia/Saigon)
│   │   ├── load-user-aggregates.ts      # User XP, streak, badges from DB
│   │   ├── update-streak.ts             # Daily streak counter
│   │   └── vietnam-today.ts             # Timezone-aware current date
│   │
│   ├── mastery/          # Mastery state machine (8-row transition table)
│   │   ├── evaluate-mastery.ts   # Pure function: progress + attempt → next level
│   │   ├── compute-next-review.ts # Spaced-repetition scheduling
│   │   ├── next-difficulty.ts    # Adjust difficulty based on performance
│   │   ├── strip-answer.ts       # Remove correctAnswer before wire (security)
│   │   └── types.ts              # MasteryLevel enum, SkillProgress type
│   │
│   ├── parent/           # Parent dashboard analytics
│   │   ├── compose-recommendations.ts  # Weak skill insights
│   │   ├── compute-composite-rating.ts # Overall child performance score
│   │   ├── compute-weak-skills.ts      # Identify skills <70% mastery
│   │   ├── compute-weekly-heatmap.ts   # Session frequency heatmap
│   │   └── load-child-dashboard-data.ts # Aggregate child data
│   │
│   ├── practice/         # Practice session utilities
│   │   ├── map-answer-format-to-input.ts # Format → input component lookup
│   │   └── random-session-id.ts         # Generate session UUID
│   │
│   ├── ui/               # UI helpers
│   │   ├── cn.ts         # clsx + tailwind-merge (Tailwind v4)
│   │   └── encouragement-pool.ts # Vietnamese encouragement phrases
│   │
│   ├── auth-hashing.ts   # bcryptjs for PIN/password hashing
│   ├── dal.ts            # Data access layer (verifyStudent/verifyParent + cache)
│   ├── prisma.ts         # Prisma client singleton
│   └── rate-limit.ts     # Simple in-memory rate limiting
│
├── stores/               # Zustand state (ephemeral client state only)
│   └── mascot-store.ts  # Mimi expression/animation state
│
└── types/                # TypeScript type definitions
    ├── auth.d.ts        # Augment NextAuth types (user role, avatarUrl)
    └── react-katex.d.ts # KaTeX type declarations
```

## Key Directories Explained

### `src/lib/generators/`
**Purpose:** Generate deterministic math problems.
- **Pattern:** Pure functions, kebab-case files, `import "server-only"` at top
- **Entry point:** `registry.ts` maps skill key → Generator function
- **Seeding:** `seedrandom` ensures same answer given same seed (enable client-side verification)
- **Answer format:** Numeric, Fraction, Decimal, Text, Multiple choice
- **Coverage:** 10 live generators (arithmetic, fractions, decimals, percents), 19 stub placeholders

### `src/lib/mastery/`
**Purpose:** Pure state-machine for skill progression.
- **Pattern:** No Prisma/Next.js imports; unit-testable pure functions
- **Core:** `evaluate-mastery.ts` — implements 8-row transition table (R1-R8)
- **Levels:** NOT_STARTED → FAMILIAR → PROFICIENT → MASTERED
- **Decay:** MASTERED decays after 30d inactivity; PROFICIENT after 7d

### `src/lib/gamification/`
**Purpose:** XP, badges, daily goals, streaks.
- **Pattern:** Pure helpers for scoring; write to DB in server actions
- **Timezone:** Asia/Saigon (Vietnam daily reset 00:00 SG time)
- **Daily goal:** 15 minutes practice = 1 full day
- **Badges:** 20+ unlockable (streak milestones, mastery completion, etc.)

### `src/lib/parent/`
**Purpose:** Parent dashboard aggregation.
- **Pattern:** Pure functions to compose insights from DB reads
- **Composite rating:** Weighted average across all child skills
- **Weak skills:** Identify mastery <70% for intervention
- **Heatmap:** Session frequency last 7 days

### `src/app/actions/`
**Purpose:** Server actions for practice, auth.
- **Org:** `practice.ts` (entry point), `practice-submit-core.ts` (transaction), `practice-helpers.ts` (utilities)
- **Flow:** User submits answer → validate → generate correct answer from seed → evaluate mastery → award XP/badges → return feedback
- **Security:** `expectedAnswer` never sent on wire; computed server-side at submit time

## Generated Files

### `src/generated/prisma/`
Auto-generated from Prisma schema.
- Prisma 7 now outputs ESM `@prisma/client` directly to this custom path
- Package.json config: `"generator prisma-client" { output = "src/generated/prisma" }`
- Requires runtime ESM import: `import { PrismaClient } from "@/generated/prisma"`

## Database Schema

**Key tables:**
- `User` — student (role=STUDENT, parentId=null) or parent (role=PARENT)
- `Grade` — G4, G5
- `Volume` — Volume 1-4 per grade
- `Topic` — topic within volume (e.g., "Phép cộng")
- `Lesson` — lesson within topic (e.g., "Cộng có nhớ")
- `Skill` — skill within lesson (key="add-sub-100k-carry", generatorKey, answerFormat)
- `SkillProgress` — student's current level, attempts, last review, next review date
- `PracticeSession` — one practice attempt (sessionId, skillKey, start/end, attempted/correct)
- `Badge`, `UserBadge` — earned badges
- `XPHistory` — XP ledger (immutable append-only)

## Routes

**Student (protected, role=STUDENT):**
- `/student` — dashboard (topics, continue CTA)
- `/student/topic/[id]` — topic detail (skills grid)
- `/student/practice/[skillKey]` — practice session (5-10 questions)
- `/student/summary` — post-practice recap (XP, badges, mastery diff)

**Parent (protected, role=PARENT):**
- `/parent` — dashboard (child selector, composite rating, recent sessions)
- `/parent/child/[id]` — child detail (topics table, weak skills, trend chart)

**Auth:**
- `/` — landing (role picker)
- `/(auth)/student/signin` — student PIN login
- `/(auth)/parent/signin` — parent credentials login
- `/api/auth/[...nextauth]` — NextAuth route handler

## Environment & Deployment

- **Database:** Postgres 16 (docker-compose up db)
- **Auth:** NextAuth v5 beta, dual Credentials providers
- **Frontend:** React 19, Server Components, Tailwind v4 (no config file, `@theme inline`)
- **Fonts:** Fredoka (display), Nunito (body), JetBrains Mono (math), loaded via `next/font/google`
- **Testing:** Vitest 4, 161 unit tests, ~94% coverage on core libs
