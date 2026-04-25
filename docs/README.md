# Math SGK Documentation

Complete documentation for the Vietnamese elementary math practice platform (grades 4-5).

## Quick Navigation

### For New Developers
Start here to understand the project:
1. **[Project Overview & PDR](./project-overview-pdr.md)** — Business objectives, functional requirements, success metrics
2. **[System Architecture](./system-architecture.md)** — Tech stack, data flow, deployment model
3. **[Codebase Summary](./codebase-summary.md)** — Directory structure, key modules, database schema

### For Implementation
Guides for writing code:
1. **[Code Standards](./code-standards.md)** — Naming conventions, TypeScript rules, patterns for generators/mastery/gamification
2. **[Design Guidelines](./design-guidelines.md)** — Visual language, component inventory, Tailwind v4 tokens
3. **[Project Changelog](./project-changelog.md)** — v0.1.0 MVP shipped, phases 1-12 complete, known limitations

### For Planning
Future roadmap and decisions:
1. **[Development Roadmap](./development-roadmap.md)** — Phase 13-17 planned work (if exists)

---

## Documentation Structure

```
docs/
├── README.md                    ← You are here
├── project-overview-pdr.md      ← Business + functional requirements
├── system-architecture.md       ← Tech stack + data flow
├── codebase-summary.md          ← Directory map + modules
├── code-standards.md            ← Implementation patterns
├── design-guidelines.md         ← Visual language + components
├── project-changelog.md         ← Release notes + phase status
├── design-guidelines.md         ← (design tokens, Mimi spec)
└── research/                    ← (research docs from planning phases)
    ├── researcher-curriculum-knt-k45.md
    ├── researcher-mastery-state-machine.md
    ├── researcher-nextauth-v5-dual-provider.md
    └── ...
```

---

## Key Facts at a Glance

### Stack
- **Frontend:** React 19, Next.js 16 App Router, TypeScript strict, Tailwind v4
- **Backend:** Node.js, Prisma 7, PostgreSQL 16
- **Auth:** Auth.js v5 (beta.31), JWT, dual Credentials providers
- **Testing:** Vitest 4, 161 unit tests, 94% coverage

### Curriculum
- **60 skills:** 33 Grade 4, 27 Grade 5
- **Skill hierarchy:** Grade → Volume → Topic → Lesson → Skill
- **Generators:** 10 live, 19 stubs (Phase 13 target: 50+ more)

### Features
- **Practice:** Deterministic problem generation (seedrandom), server-side answer validation
- **Mastery:** 4-level state machine (NOT_STARTED → FAMILIAR → PROFICIENT → MASTERED) with decay rules
- **Gamification:** XP (10-100/attempt), streaks (consecutive days), badges (20+), daily goal (15 min)
- **Analytics:** Student dashboard (XP, topics), parent dashboard (composite rating, weak skills, trends)

### Quality
- ✅ 161 unit tests passing (94% coverage on core libs)
- ✅ TypeScript strict mode
- ✅ ESLint zero errors
- ✅ Next.js production build passes
- ✅ Response time <200ms (Postgres + generator)
- ✅ Bundle <120KB gzipped

### Deployment
- **Development:** `docker compose up db` + `npm run dev`
- **Production:** Vercel (Next.js 16 optimized), Vercel Postgres, Auth.js hosted
- **Database:** Postgres 16, migrations via Prisma

---

## Common Workflows

### Adding a New Generator
1. Read [Code Standards § Generators](./code-standards.md#generators-srclibgenerators)
2. Create `src/lib/generators/{category}/{generator-key}.ts`
3. Implement pure function, use `SeededRNG`, return `{ questionText, expectedAnswer, answerFormat, difficulty }`
4. Register in `src/lib/generators/registry.ts`
5. Add unit tests to `tests/unit/generators/`
6. Run: `npm run test:unit` (161 tests must pass)

### Debugging Mastery Logic
1. Read [Code Standards § Mastery Logic](./code-standards.md#mastery-logic-srclibmastery)
2. Trace through `src/lib/mastery/evaluate-mastery.ts` (8-row table)
3. Check unit tests in `tests/unit/mastery/`
4. Remember: pure function (no DB calls) — test in isolation

### Understanding Parent Analytics
1. Read [System Architecture § Gamification System](./system-architecture.md#gamification-system)
2. Check `src/lib/parent/` functions (pure composition from pre-fetched data)
3. No DB calls inside parent lib; data fetched in server action first
4. Composite rating formula: `(Σ masteryScore) / (Σ skillCount) × 100`

### Implementing a New Feature
1. Check [Project Overview § Phase Roadmap](#) for priority
2. Read related doc section (e.g., FR-005 for gamification)
3. Write unit tests first (test-driven)
4. Implement per [Code Standards](./code-standards.md)
5. Run all quality gates: `npm run typecheck && npm run lint && npm run test:unit && npm run build`
6. Create PR with [conventional commit](./code-standards.md#quality-gates)

---

## Key Files to Know

| File | Purpose | Lines |
|------|---------|-------|
| `src/auth.ts` | NextAuth v5 instance (Prisma adapter) | 30 |
| `src/auth.config.ts` | Auth config (edge-safe) | 60 |
| `proxy.ts` | Middleware (role-based routing) | 50 |
| `src/lib/dal.ts` | Data access layer + cache() | 100 |
| `src/lib/generators/registry.ts` | Generator lookup table | 80 |
| `src/lib/mastery/evaluate-mastery.ts` | State machine (pure) | 200 |
| `src/lib/gamification/compute-xp.ts` | XP formula | 40 |
| `src/app/actions/practice.ts` | Practice server action entry | 80 |
| `src/app/actions/practice-submit-core.ts` | Transaction logic | 150 |
| `src/components/mimi/mimi-svg.tsx` | Mascot SVG (6 states) | 150 |
| `prisma/schema.prisma` | Database schema | 300 |

---

## Glossary

- **Mastery** — Skill proficiency (NOT_STARTED, FAMILIAR, PROFICIENT, MASTERED)
- **Generator** — Pure function: seed → problem + answer
- **Streak** — Consecutive days of practice (resets if >1 day gap)
- **XP** — Experience points (10-100 per correct attempt)
- **Badge** — Achievement (unlocked at threshold)
- **Composite rating** — Parent metric (weighted avg mastery across all skills)
- **RSC** — React Server Component (zero JS for static content)
- **DAL** — Data access layer (centralized DB + cache())
- **Answer format** — Response type (NUMERIC, FRACTION, DECIMAL, TEXT, MULTIPLE_CHOICE)

---

## Status

**MVP (v0.1.0):** SHIPPED  
**Quality gates:** All passing  
**Test coverage:** 161 tests, 94% on core libs  
**Next milestone:** Phase 13 (50+ additional generators, spaced-rep cron, integration tests)

---

**Last updated:** 2026-04-25  
**Maintained by:** Nam Vu  
**License:** Proprietary
