# Math SGK — Code Standards & Conventions

> Implementation patterns, naming conventions, and quality gates for Math SGK codebase. Enforced via TypeScript strict mode, ESLint, Vitest, and code review.

## File Organization

### Naming Conventions

| Category | Convention | Example | Notes |
|----------|-----------|---------|-------|
| **Directories** | kebab-case | `src/lib/gamification/`, `src/components/practice/` | Group by domain, lowercase |
| **React components** | PascalCase.tsx | `StudentHeader.tsx`, `PracticeSession.tsx` | Export as named export |
| **Utilities/functions** | camelCase.ts | `evaluate-mastery.ts`, `compute-xp.ts` | Pure functions, no side effects |
| **Stores** | camelCase.ts | `mascot-store.ts` | Zustand stores, client-side only |
| **Server actions** | camelCase.ts | `practice.ts`, `auth-signin.ts` | "use server" at top |
| **Types** | camelCase.d.ts or inline | `auth.d.ts` (Augmentation), `types.ts` (new types) | `d.ts` for ambient, export type from modules |
| **Constants** | UPPER_SNAKE_CASE | `PROFICIENT_STREAK_THRESHOLD = 5` | At top of file |

### Directory Structure Rules

- **Max 200 lines per file** — Split if exceeds (split by function group, not line count alone)
- **One responsibility per directory** — `src/lib/generators/` = generators only, not mastery
- **Index files** — Rarely used; prefer direct imports from module
- **Shared utils** — `src/lib/ui/` for component helpers, `src/lib/` for domain logic

## Code Style

### TypeScript

```typescript
// ✅ GOOD: Strict mode, explicit types
export function evaluateMastery(
  progress: SkillProgressShape,
  attempt: AttemptInput
): MasteryEvalResult {
  // ...
}

// ❌ BAD: Implicit any, loose types
export function evaluateMastery(progress, attempt) {
  // ...
}
```

**Rules:**
- `tsconfig.json` enforces `strict: true`
- No `any` types unless absolutely necessary (comment why)
- All function params and returns must be typed
- Use `Readonly<T>` for immutable arrays
- Discriminated unions for state (not optional booleans)

### React Components

```typescript
// ✅ GOOD: RSC by default, strict props, no prop-drilling
export default async function TopicPage({ params }: { params: { topicId: string } }) {
  const user = await verifyStudent();
  const topic = await db.topic.findUnique({ where: { id: params.topicId } });
  return <TopicView topic={topic} user={user} />;
}

// ❌ BAD: Mixing client/server, loose context, missing types
export function TopicPage() {
  const [topic, setTopic] = useState(null);
  useEffect(() => { fetchTopic(); }, []);
  // ...
}
```

**Rules:**
- RSC by default (async, no "use client")
- Client components at leaf level only (inputs, animations, toast)
- Props fully typed (no `any`, no spreading `...rest` untyped)
- No prop-drilling; pass data directly to RSC
- One component per file (unless it's a private subcomponent <50 lines)

### Server Actions

```typescript
// ✅ GOOD: "use server" at top, async, typed, error handling
"use server";

import "server-only"; // Additional safety marker

export async function submitAnswer(formData: FormData): Promise<SubmitResponse> {
  try {
    const user = await verifyStudent();
    if (!user) throw new Error("Unauthorized");
    
    const { skill, answer } = Object.fromEntries(formData);
    const result = await submitAnswerCore(user.id, skill, answer);
    return result;
  } catch (error) {
    console.error("submitAnswer failed:", error);
    return { error: "Failed to submit" };
  }
}

// ❌ BAD: Mixed client/server, no error handling
export async function submitAnswer(skill, answer) {
  return submitAnswerCore(skill, answer);
}
```

**Rules:**
- `"use server"` at very top of file or function
- `import "server-only"` in all generators and DAL
- All params and return types must be serializable (JSON-safe)
- Async/await, never Promises without try-catch
- Never use React context or client state
- Error handling required (try-catch + logging)

### Generators (src/lib/generators/)

```typescript
// ✅ GOOD: Pure function, seeded RNG, deterministic
import "server-only";
import type { Generator, NumericQuestion } from "./types";
import { SeededRNG } from "./seeded-rng";

export const addSub100kCarry: Generator<NumericQuestion> = {
  generate(seed: number): NumericQuestion {
    const rng = new SeededRNG(seed);
    const a = rng.nextInt(10000, 99999);
    const b = rng.nextInt(10000, 99999);
    const answer = a + b;
    return {
      questionText: `${a} + ${b} = ?`,
      expectedAnswer: answer,
      answerFormat: "NUMERIC",
      difficulty: "EASY",
    };
  },
};

// ❌ BAD: Global state, non-deterministic
let questionCache = {};
export function addSub100k(seed) {
  const a = Math.random() * 100000; // ❌ Not deterministic
  return { questionText: `${a} + ...` };
}
```

**Rules:**
- Pure functions only (no side effects, no DB calls)
- `import "server-only"` at top
- Use `SeededRNG(seed)` for all randomness
- Return `{ questionText, expectedAnswer, answerFormat, difficulty }`
- `expectedAnswer` must match the type in schema (no null/undefined)
- Test edge cases: boundary values, carry propagation, etc.
- 10 live generators (arithmetic, fractions, decimals, percent), 19 stubs

### Mastery Logic (src/lib/mastery/)

```typescript
// ✅ GOOD: Pure state-machine, no DB imports, unit-testable
export function evaluateMastery(
  progress: SkillProgressShape,
  attempt: AttemptInput
): MasteryEvalResult {
  const isCorrect = attempt.isCorrect;
  const currentLevel = progress.masteryLevel;
  
  if (currentLevel === "NOT_STARTED") {
    if (isCorrect) {
      return { nextLevel: "FAMILIAR", newStreak: 1 };
    } else {
      const fails = (progress.totalAttempts || 0) + 1;
      if (fails >= 3) return { nextLevel: "FAMILIAR", newStreak: 0 };
    }
  }
  // ... more rows
}

// ❌ BAD: Fetching from DB inside logic
export async function evaluateMastery(progress, attempt) {
  const allProgress = await db.skillProgress.findMany(); // ❌ DB in logic
  // ...
}
```

**Rules:**
- Zero Prisma/database imports
- Zero Next.js imports
- Pure functions only (inputs → outputs)
- Implements 8-row transition table (R1-R8) from research
- Return type: `{ nextLevel, newStreak, newDifficulty }`
- All thresholds as named constants at top of file

### Parent Analytics (src/lib/parent/)

```typescript
// ✅ GOOD: Compose insights from pre-fetched data
export function computeWeakSkills(
  allProgress: SkillProgressShape[]
): WeakSkill[] {
  return allProgress
    .filter(p => p.masteryLevel !== "MASTERED" && p.masteryLevel !== "PROFICIENT")
    .map(p => ({
      skillKey: p.skillKey,
      masteryLevel: p.masteryLevel,
      correctRatio: p.correctAttempts / (p.totalAttempts || 1),
    }))
    .sort((a, b) => a.correctRatio - b.correctRatio)
    .slice(0, 10);
}

// ❌ BAD: Querying DB directly inside analytics
export async function computeWeakSkills(userId) {
  const progress = await db.skillProgress.findMany({ where: { userId } }); // ❌
  // ...
}
```

**Rules:**
- Composition functions, not DB queries
- Input: pre-fetched data (array of objects)
- Output: insights (weak skills, recommendations, composite rating)
- No async, no Prisma
- Pure, side-effect free

### Gamification (src/lib/gamification/)

```typescript
// ✅ GOOD: Pure helpers, timezone-aware
import { vietnamToday } from "./vietnam-today";

export function updateStreak(lastReviewDate: Date | null, today: Date): number {
  if (!lastReviewDate) return 0;
  const daysSince = Math.floor((today.getTime() - lastReviewDate.getTime()) / 86400000);
  if (daysSince === 0) return 1; // Same day, streak continues
  if (daysSince === 1) return 1; // Next day, reset to 1
  return 0; // More than 1 day, streak broken
}

// ❌ BAD: Non-deterministic timezone
export function updateStreak(lastReviewDate) {
  const today = new Date(); // ❌ Wrong timezone
  // ...
}
```

**Rules:**
- All date logic uses Asia/Saigon timezone (vietnamToday())
- Pure helpers (input → output, no side effects)
- XP formula: baseXP + streakBonus + masteryBonus
- Daily goal target: 15 minutes
- Badge evaluation: unlock on threshold, not on every attempt

## API & Type Contracts

### Database Schema (Prisma)

```prisma
// ✅ GOOD: Explicit, indexed, timestamped
model SkillProgress {
  id                String @id @default(cuid())
  studentId         String
  skillKey          String // kebab-case from curriculum
  masteryLevel      MasteryLevel @default(NOT_STARTED)
  correctAttempts   Int @default(0)
  totalAttempts     Int @default(0)
  currentStreak     Int @default(0)
  lastReviewedAt    DateTime?
  nextReviewAt      DateTime?
  lastDifficultyAt  DateTime?
  currentDifficulty Difficulty @default(EASY)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([studentId, skillKey]) // Only one progress per student per skill
  @@index([studentId, updatedAt]) // Fast dashboard queries
}

// ❌ BAD: Missing indices, ambiguous naming
model Progress {
  id          String @id
  userId      String
  skill       String // Ambiguous: key or name?
  level       Int // Magic numbers, not enum
  reviewDate  DateTime? // Single date, no "next review"
}
```

**Rules:**
- All models have `id`, `createdAt`, `updatedAt`
- Enums for state (MasteryLevel, Difficulty, Role, AnswerFormat)
- Foreign keys: explicit relations
- Indices on: userId, skill lookup patterns
- Unique constraints: prevent duplicates
- No soft deletes (archive elsewhere if needed)

### Server Action Responses

```typescript
// ✅ GOOD: Discriminated union, no null ambiguity
export type SubmitResponse = 
  | { 
      success: true;
      isCorrect: boolean;
      xpAwarded: number;
      nextMasteryLevel: MasteryLevel;
      badgesUnlocked: Badge[];
    }
  | {
      success: false;
      error: string;
      code: "UNAUTHORIZED" | "RATE_LIMITED" | "INVALID_SKILL";
    };

// ❌ BAD: Null/undefined mixing, unclear error
export type SubmitResponse = {
  success?: boolean;
  error?: string;
  data?: { xp: number; level: string };
  // What if both data and error are present?
};
```

**Rules:**
- Discriminated unions (`success: true | false`) not optional fields
- All error codes as enum/literal union
- No `null` or `undefined` in responses (use union types)
- Client must handle every branch

## Security Patterns

### Answer Validation

```typescript
// ✅ GOOD: Regenerate server-side, strip before wire
export async function submitAnswer(sessionId: string, userAnswer: string) {
  const session = await db.practiceSession.findUnique({ where: { sessionId } });
  
  // Regenerate expected answer from seed (never trust client)
  const skill = getGeneratorByKey(session.skillKey);
  const question = skill.generate(session.seed);
  const correctAnswer = question.expectedAnswer; // ✅ Server-side only
  
  const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
  
  // Return feedback WITHOUT expectedAnswer on wire
  return stripAnswer({
    isCorrect,
    earnedXP: 25,
    nextMasteryLevel: "PROFICIENT",
  });
}

// ❌ BAD: Trust client, send answer on wire
export async function submitAnswer(sessionId, userAnswer, correctAnswer) {
  // ❌ Client controls correctAnswer!
  const isCorrect = userAnswer === correctAnswer;
  return { isCorrect, correctAnswer }; // ❌ Leaks answer
}
```

**Rules:**
- Never trust client-sent correctAnswer
- Always regenerate from skill + seed server-side
- Strip answer from response (use stripAnswer utility)
- Seed stored in DB, answer recomputed at submit time

### Role-Based Access

```typescript
// ✅ GOOD: Verify role before sensitive operations
export async function loadChildProgress(childId: string) {
  const parent = await verifyParent(); // ✅ Check role
  if (!parent) throw new Error("UNAUTHORIZED");
  
  // Check parent owns this child
  const child = await db.user.findUnique({ where: { id: childId } });
  if (child?.parentId !== parent.id) throw new Error("FORBIDDEN");
  
  return db.skillProgress.findMany({ where: { studentId: childId } });
}

// ❌ BAD: Missing role check
export async function loadChildProgress(childId) {
  return db.skillProgress.findMany({ where: { studentId: childId } });
  // Any parent can access any child!
}
```

**Rules:**
- All protected actions call `verifyStudent()` or `verifyParent()`
- Check ownership before returning data (child.parentId === parent.id)
- Return 401 for missing auth, 403 for insufficient permissions
- Log failed access attempts

## Testing

### Unit Test Pattern

```typescript
// ✅ GOOD: Pure function, clear inputs/outputs, edge cases
import { describe, it, expect } from "vitest";
import { evaluateMastery } from "./evaluate-mastery";

describe("evaluateMastery", () => {
  it("NOT_STARTED + first correct → FAMILIAR", () => {
    const result = evaluateMastery(
      {
        masteryLevel: "NOT_STARTED",
        totalAttempts: 0,
        correctAttempts: 0,
      },
      { isCorrect: true }
    );
    expect(result.nextLevel).toBe("FAMILIAR");
    expect(result.newStreak).toBe(1);
  });

  it("PROFICIENT + 3rd wrong in 7 days → stays PROFICIENT", () => {
    const now = new Date();
    const sixDaysAgo = new Date(now.getTime() - 6 * 86400000);
    const result = evaluateMastery(
      {
        masteryLevel: "PROFICIENT",
        totalAttempts: 10,
        correctAttempts: 7,
        lastReviewedAt: sixDaysAgo,
      },
      { isCorrect: false }
    );
    expect(result.nextLevel).toBe("PROFICIENT");
  });
});

// ❌ BAD: Testing implementation details, mocking reality
describe("evaluateMastery", () => {
  it("calls updateDB", () => {
    const mockDB = jest.fn();
    // Testing that a function calls something is fragile
  });
});
```

**Rules:**
- Test behavior, not implementation
- Test edge cases: boundaries, empty inputs, state transitions
- One assertion per test (or closely related assertions)
- No mocks unless testing integration (prefer pure functions)
- Target 94% coverage on generators, mastery, gamification, parent libs

### Integration Test Stub

```typescript
// Phase 13: Integration tests (currently stubbed)
// Example pattern (not yet implemented):
describe("/student/practice/[skillKey]", () => {
  it("should render practice page with 5 questions", async () => {
    const response = await fetch("/student/practice/add-sub-100k-carry");
    expect(response.status).toBe(200);
    // Parse HTML, verify 5 question cards
  });

  it("should submit answer and return feedback", async () => {
    const response = await fetch("/api/practice/submit", {
      method: "POST",
      body: JSON.stringify({ sessionId: "...", answer: "150000" }),
    });
    expect(response.status).toBe(200);
    const { isCorrect, xpAwarded } = await response.json();
    expect(typeof isCorrect).toBe("boolean");
  });
});
```

## Documentation in Code

### Comments

```typescript
// ✅ GOOD: Why, not what
// PROFICIENT demotion logic (research §2 row 6):
// If success ratio drops below 60% AND 7+ days since last review,
// student likely forgot the skill; demote back to FAMILIAR.
if (successRatio < PROFICIENT_DEMOTE_RATIO && daysSince > 7) {
  return { nextLevel: "FAMILIAR" };
}

// ❌ BAD: What (code already says this)
// Check if ratio is less than 0.6 and days is greater than 7
if (ratio < 0.6 && days > 7) { ... }
```

**Rules:**
- Comment the "why", not the "what"
- Link to research docs where applicable
- Explain magic numbers (thresholds, constants)
- Avoid comments for obvious code

### Type Documentation

```typescript
// ✅ GOOD: JSDoc on exported types
/**
 * Student skill progress tracking.
 * 
 * @example
 * const progress = await db.skillProgress.findUnique({
 *   where: { studentId_skillKey: { studentId: "...", skillKey: "add-sub-100k" } }
 * });
 */
export type SkillProgressShape = {
  masteryLevel: MasteryLevel; // One of NOT_STARTED, FAMILIAR, PROFICIENT, MASTERED
  lastReviewedAt: Date | null; // Null if never attempted
  correctAttempts: number; // Cumulative correct submissions
  totalAttempts: number; // Cumulative attempts (correct + wrong)
};

// ❌ BAD: No documentation
export type SkillProgress = {
  level: string;
  reviewed: Date;
  correct: number;
  total: number;
};
```

**Rules:**
- Export types must have JSDoc
- Ambiguous fields should have comments (what does null mean?)
- Include example usage if complex
- Enum values documented at definition

## Quality Gates

**Before commit:**
```bash
npm run typecheck   # TypeScript strict mode
npm run lint        # ESLint
npm run test:unit   # 161 tests passing
npm run build       # Next.js production build
```

**CI/CD:**
- All gates must pass
- No TypeScript errors
- No ESLint warnings in src/
- Test coverage ≥94% on core libs
- Build artifact <5 MB gzipped

## Common Pitfalls

| Pitfall | ❌ Bad | ✅ Good |
|---------|--------|--------|
| **Loose types** | `const data: any = ...` | `const data: SkillProgress = ...` |
| **Mixed RSC/Client** | Async component with "use client" | Keep RSC, move interactive to child |
| **DB in business logic** | `evaluateMastery(await db.fetch())` | `evaluateMastery(data)`, DB in action |
| **Missing error handling** | `await submitAnswer()` | `try { } catch (e) { log(e) }` |
| **Leaking secrets** | `expectedAnswer` in response | Strip before return |
| **Non-deterministic tests** | `Math.random()` in test | Use SeededRNG or fixed values |
| **Prop drilling** | Pass data 5 levels deep | Use RSC to fetch directly |
| **Unindexed queries** | `findMany({ where: { userId, createdAt } })` | Add index in schema |

## Glossary

- **RSC** — React Server Component; default, zero JS sent to browser for static content
- **DAL** — Data access layer; `src/lib/dal.ts`, uses React `cache()` to dedupe queries
- **Generator** — Problem factory; pure function, seeded RNG, returns `{ questionText, expectedAnswer }`
- **Mastery** — Skill proficiency level (NOT_STARTED, FAMILIAR, PROFICIENT, MASTERED)
- **Difficulty** — Question hard (EASY, MEDIUM, HARD); adjusted per mastery progress
- **Streak** — Consecutive days of practice; resets if skipped >1 day
- **XP** — Experience points; earned per correct attempt, tied to difficulty and mastery
- **Badge** — Achievement unlocked at threshold (streak, mastery, speed, etc.)
- **Composite rating** — Parent dashboard metric; weighted average of child's all skill mastery levels
