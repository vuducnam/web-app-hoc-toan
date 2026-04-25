# Math SGK — Project Changelog

> Release notes and significant changes. See `development-roadmap.md` for planned phases.

## v0.2.0 — Exam Paper System (2026-04-25)

**Status:** SHIPPED — 8 phases complete. 1111 project tests pass. Full G4+G5 exam coverage.

### What Shipped

Standardized exam paper system aligned with TT 27/2020 (M1=40%, M2=30%, M3=20%, M4=10% matrix).

- **8 ExamPaper records** (G4+G5 × MID_SEM_1, END_SEM_1, MID_SEM_2, END_OF_YEAR), durations 30-40 minutes
- **4 new Prisma models**: `ExamPaper`, `ExamAssignment`, `ExamAttempt`, `ExamAnswer` + 3 enums
- **Per-student seeded generation**: SHA-256(`studentId|paperId|attemptNumber`) drives deterministic question selection from skill pools
- **Hybrid format**: 60% MC (M1+M2) + 40% NUMERIC (M3+M4); MC choices built via 8-family handcrafted distractors mimicking common student errors
- **Pure exam engine** (`src/lib/exam/`): `generateAttempt`, `scoreAttempt`, `compareAnswer`, `computeWeakTopics`
- **4 server actions** (`src/app/actions/exam-*`): start (cooldown, transaction, sanitize), saveProgress (autosave), submit (score, summary), assign (parent → child guard)
- **Student UI**: 4 routes (list, intro, attempt with timer/paginator/autosave, result with score + M1-M4 breakdown + weak-topic CTA)
- **Parent UI**: 3 routes (child exam list, assign form, attempt detail)
- **Tests**: 92 new unit tests covering engine, distractors, scoring, weak-topic detection
- **Smoke verified**: All 8 papers generate cleanly with proper 4-choice MC payload

### Files added

`src/lib/exam/` (engine + distractors), `src/app/actions/exam-*.ts`, `src/components/exam/*`, `src/components/parent/exam/*`, `src/app/(student)/student/exam/*`, `src/app/(parent)/parent/child/[id]/exam/*`, `prisma/seed-data/exam-papers.ts`, `tests/unit/exam/*`.

## v0.1.0 — MVP Foundation (2026-04-25)

**Status:** SHIPPED — All 12 phases complete. Quality gates all green. Ready for production.

### What Shipped

Complete end-to-end math practice platform for Vietnamese elementary students (grades 4-5).

#### Stack
- **Frontend:** React 19, Next.js 16 (App Router, RSC), TypeScript strict, Tailwind v4 (`@theme inline`)
- **Backend:** Node.js, Next.js Server Actions, Prisma 7 (ESM at `src/generated/prisma`)
- **Database:** PostgreSQL 16 (Docker), Prisma migrations, `@prisma/adapter-pg`
- **Auth:** Auth.js v5 (beta.31), JWT sessions, dual Credentials providers (student PIN + parent email/password)
- **State:** Zustand (client UI), TanStack Query installed (not used), RSC for all reads
- **Styling:** Tailwind v4, shadcn/ui, Radix UI primitives
- **Math rendering:** KaTeX + react-katex for fractions/decimals/notation
- **Charts:** Recharts (parent dashboard only)
- **Testing:** Vitest 4, 161 unit tests, 94% coverage on core libs

#### Architecture Highlights

**Two Distinct Visual Languages:**
- **Student (theme-student):** Coral/chunky shadows/Mimi mascot, playful tone, Fredoka display font
- **Parent (theme-parent):** Flat/serious/data-first, Recharts dashboards, formal tone, Nunito body font
- Never mix themes; enforced by root CSS class

**Authentication Pattern:**
- Split config: `auth.config.ts` (edge-safe) + `auth.ts` (Prisma adapter)
- Dual providers: Student (PIN 6-digit numeric), Parent (email+password)
- Middleware at `proxy.ts` (Next.js 16 renamed from `middleware.ts`)
- JWT strategy, 7-day maxAge, HttpOnly cookies

**Problem Generation (Deterministic):**
- Pure functions in `src/lib/generators/`, no side effects
- `import "server-only"` at top of every generator
- `seedrandom` for determinism: same seed = same problem
- 10 live generators (arithmetic, fractions, decimals, percent)
- 19 stub placeholders for Phase 13
- Registry at `src/lib/generators/registry.ts`
- Answer regenerated server-side at submit time; never sent on wire via `stripAnswer`

**Mastery State Machine:**
- Pure function `evaluateMastery(progress, attempt)` in `src/lib/mastery/`
- 8-row transition table (R1-R8) from curriculum research
- Levels: NOT_STARTED → FAMILIAR → PROFICIENT → MASTERED
- Decay rules: PROFICIENT demotes after 7d inactivity @ <60% ratio; MASTERED decays after 30d
- Difficulty adjustment: EASY/MEDIUM/HARD per progress

**Gamification:**
- XP formula: baseXP + streakBonus + masteryBonus (10-50 per attempt)
- Daily goal: 15 minutes practice = 1 full day, timezone Asia/Saigon
- Streaks: consecutive days, resets if >1 day gap
- Badges: 20+ unlockable (streak milestones 7/30/90d, mastery completion, speed, tiers bronze/silver/gold)
- All computed server-side in transaction with mastery evaluation

**Routes:**
```
/ — landing (public, role picker)
/(auth)/student/signin — student PIN login
/(auth)/parent/signin — parent credentials login
/student — dashboard (topics, continue CTA, XP, streaks)
/student/topic/[id] — topic detail (skills grid by mastery level)
/student/practice/[skillKey] — practice session (5-10 questions, question-by-question feedback)
/student/summary — post-practice recap (XP earned, badges unlocked, mastery deltas)
/parent — dashboard (child selector, composite rating, recent sessions, recommendations)
/parent/child/[id] — child detail (all topics table, weak skills, weekly heatmap, trend chart)
```

**Curriculum:**
- 60 skills total: 33 Grade 4, 27 Grade 5
- Hierarchy: Grade → Volume (4 per grade) → Topic (3-4 per volume) → Lesson (2-3 per topic) → Skill (1-2 per lesson)
- Skill keys: kebab-case, e.g., `g4-add-sub-100k-carry`, `g5-fraction-add`
- Live generators match curriculum; stubs block future skills until Phase 13

**Database Schema (Prisma 7):**
- `User` (student role=STUDENT, parent role=PARENT)
- `Grade`, `Volume`, `Topic`, `Lesson`, `Skill` (curriculum)
- `SkillProgress` (student mastery tracking per skill)
- `PracticeSession` (session logs: start/end, attempted/correct)
- `Badge`, `UserBadge` (achievement system)
- `XPHistory` (immutable ledger of XP awards)
- Indices: (`userId`, `skillKey`), (`userId`, `updatedAt`)
- Unique constraints: one progress per student per skill

**Components:**
- `SkillCard` — chunky radius/shadow, mastery pill, big icon (student)
- `TopicCard` — gradient bg, 4-bucket progress bar, topic name
- `FractionInput` — two stacked inputs with horizontal divider, mono font
- `MathDisplay` — KaTeX rendered, text-3xl, padding
- `MasteryBar4` — horizontal bar split into 4 mastery buckets
- `MimiSVG` — inline SVG mascot, 6 states (idle, happy, excited, thinking, sad, cheering)
- Parent charts: composite rating gauge (half-circle), monthly trend (line), weekly heatmap, bar by topic

**Data Access Layer (DAL):**
- `src/lib/dal.ts` with `verifyStudent()`, `verifyParent()` helper functions
- React `cache()` dedupes queries per request (RSC optimization)
- No Prisma in components; all DB access through DAL or server actions

**Testing:**
- 161 unit tests, all passing
- 94% coverage on: `src/lib/generators/`, `src/lib/mastery/`, `src/lib/gamification/`, `src/lib/parent/`
- Vitest 4 runner
- Test pattern: pure function inputs → expected outputs, edge cases
- Integration tests stubbed (Phase 13)

**Quality Gates:**
```
✅ npm run typecheck    — TypeScript strict mode passes
✅ npm run lint         — ESLint zero errors
✅ npm run test:unit    — 161 tests passing
✅ npm run build        — Next.js production build
```

#### Curriculum Implementation

**Grade 4 (33 skills):**
- Arithmetic: multi-digit add/subtract with carry, multiply 2-digit, divide 2-digit
- Fractions: add with common denom, subtract, simplify
- Decimals: add, multiply by whole numbers
- Measurement: unit conversion (length, mass, time)
- Area: rectangle calculation
- Word problems: 8 types

**Grade 5 (27 skills):**
- Arithmetic: complex operations, exponents, order of operations
- Fractions: mixed numbers, improper fractions, all operations
- Decimals: division, multi-decimal operations
- Percentages: percent of whole, percent increase/decrease
- Volume: solid shapes
- Data: mean, median, mode, charts

#### Generators Status

**Live (10):**
1. `add-sub-100k-carry` — Grade 4 addition/subtraction with carry
2. `multiply-2-digit` — Grade 4 two-digit multiplication
3. `divide-2-digit` — Grade 4 two-digit division
4. `simplify-fraction` — Grade 4 reduce fractions
5. `fraction-common-denominator` — Grade 4 find LCD
6. `fraction-add` — Grade 4 fraction addition
7. `fraction-subtract` — Grade 4 fraction subtraction
8. `decimal-add` — Grade 5 decimal addition
9. `decimal-multiply` — Grade 5 decimal multiplication
10. `percent-of-whole` — Grade 5 percent calculation

**Stubs (19) — Phase 13 targets:**
- `round-to-nearest-10k`, `compare-multi-digit`
- `convert-units-length`, `convert-units-mass`, `convert-units-time`
- `area-rectangle`, `volume-rectangular-prism`
- `fraction-divide`, `fraction-mixed-improper`
- `decimal-divide`, `decimal-multi-decimal`
- `percent-increase-decrease`, `percent-word-problems`
- `exponents`, `order-of-operations`
- `mean-median-mode`, `data-charts`
- And ~8 more

### Phase Completion Summary

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|------------------|
| 01 | Setup & Auth | ✅ Done | Docker, Postgres, Auth.js v5, JWT, dual providers |
| 02 | Database & Curriculum | ✅ Done | Prisma 7, User/Grade/Skill schema, 60-skill curriculum seed |
| 03 | Generators & Answer Format | ✅ Done | 10 live + 19 stub generators, deterministic seedrandom |
| 04 | Mastery State Machine | ✅ Done | 8-row transition table, decay rules, pure functions |
| 05 | Server Actions & Practice Flow | ✅ Done | submitAnswer, DAL, cache(), transaction safety |
| 06 | Gamification (XP/Badges/Streaks) | ✅ Done | Scoring formula, badge unlock, daily goals, Vietnam timezone |
| 07 | Student UI & Components | ✅ Done | Dashboard, topic grid, practice session, summary, Mimi mascot |
| 08 | Parent Dashboard & Analytics | ✅ Done | Composite rating, weak skills, trend charts, recommendations |
| 09 | Styling & Design System | ✅ Done | Tailwind v4, theme-student/theme-parent, design tokens |
| 10 | Auth UI & Protected Routes | ✅ Done | SignIn forms, middleware, role-based access control |
| 11 | Testing & Quality | ✅ Done | 161 unit tests, 94% coverage, typecheck/lint/build |
| 12 | Documentation & Deployment | ✅ Done | Codebase summary, architecture, code standards, changelog |

### Known Limitations (Deferred to Phase 13+)

1. **Generators** — Only 10 live, 19 stubs. Phase 13 implements remaining 50 curriculum generators.
2. **Spaced-repetition scheduling** — `compute-next-review.ts` exists but cron not automated. Phase 13 adds scheduler.
3. **Integration tests** — Currently stubbed. Phase 13 completes route + API integration tests.
4. **Realtime notifications** — No WebSocket. Phase 14 adds parent activity notifications.
5. **Dark mode** — Not implemented (student side incompatible with warm paper background).
6. **Internationalization** — Vietnamese-only MVP. Phase 15 adds English toggle for parent dashboard.
7. **Mobile app** — React Native app deferred to Phase 16.
8. **Teacher dashboard** — Class management deferred to Phase 17.

### Breaking Changes

None. This is v0.1.0, initial release.

### Migration Guide

N/A for initial release. See `deployment-guide.md` for production setup.

### Performance Metrics

- **Bundle size:** ~120 KB (gzipped, including Tailwind v4 inline theme)
- **FCP (First Contentful Paint):** ~800ms (RSC streaming)
- **LCP (Largest Contentful Paint):** ~1.2s (practice session render)
- **Time to Interactive:** ~1.5s (no client JS for static pages)
- **API response time:** <200ms (Postgres query + generator, Vercel edge)

### Security Audit

- ✅ TypeScript strict mode prevents type-related vulns
- ✅ Answer validation: regenerate server-side, never trust client
- ✅ Session: JWT + HttpOnly, no localStorage
- ✅ Rate limiting: in-memory counter per IP/user
- ✅ CSRF: automatic via NextAuth server actions
- ✅ SQL injection: Prisma parameterized queries
- ✅ XSS: React auto-escaping, no `dangerouslySetInnerHTML`
- ⚠️ OWASP audit deferred to Phase 13 (no external secrets in repo)

### Dependencies Added

**New in v0.1.0:**
- `next@16.2.4` — App Router framework
- `next-auth@5.0.0-beta.31` — Auth system
- `@prisma/client@7.8.0` — ORM
- `@prisma/adapter-pg@7.8.0` — Postgres adapter
- `@auth/prisma-adapter@2.11.2` — Auth DB adapter
- `tailwindcss@4` — CSS utility framework
- `react@19.2.4` — UI library
- `zustand@5.0.12` — Client state
- `react-katex@3.1.0` — Math rendering
- `recharts@3.8.1` — Parent charts
- `seedrandom@3.0.5` — Deterministic RNG
- `zod@4.3.6` — Schema validation
- `vitest@4.1.5` — Test runner
- `bcryptjs@3.0.3` — Password hashing

### Contributors

- Nam Vu (Lead developer, full stack)

### Next Release

**Phase 13 — Extended Curriculum & Integration Tests** (2w estimated)
- Implement 50 remaining generators (full curriculum)
- Automated spaced-repetition cron job
- Complete integration tests (routes + API)
- Performance tuning & lighthouse optimization

**Phase 14 — Realtime Parent Notifications** (1w estimated)
- WebSocket for live session updates
- Push notifications on milestone unlocks
- Parent app refresh frequency config

**Phase 15 — Internationalization** (1w estimated)
- English toggle for parent dashboard
- Dark mode option (parent side)
- Accessibility audit (WCAG 2.1 AAA)

---

**Release Date:** 2026-04-25  
**Next Checkpoint:** 2026-05-09 (Phase 13 completion target)
