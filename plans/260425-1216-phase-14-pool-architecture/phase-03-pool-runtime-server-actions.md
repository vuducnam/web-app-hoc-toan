# Phase 03 — Pool Runtime: Server Actions, Selection, Validation

## Context Links

- Plan: [plan.md](./plan.md)
- Blocked by: [phase-02-schema-teacher-role.md](./phase-02-schema-teacher-role.md)
- Existing runtime:
  - `src/app/actions/practice.ts:45-81` (getNextQuestion)
  - `src/app/actions/practice.ts:91-96` (submitAnswer)
  - `src/app/actions/practice-submit-core.ts:32-200` (core logic)
  - `src/app/actions/practice-client-actions.ts:16-47` (client-callable variant)
  - `src/app/actions/practice-helpers.ts:21-59` (loadProgress)
- Practice page: `src/app/(student)/student/practice/[skillKey]/page.tsx:22-56`
- SafeQuestion shape: `src/lib/mastery/strip-answer.ts:11`
- DAL: `src/lib/dal.ts:27-33` (verifyStudent)
- Types: `src/app/actions/practice-types.ts`

## Overview

- **Priority:** P1
- **Status:** pending — BLOCKED by Phase 02 (needs ProblemPool model)
- **Effort:** ~5h
- **Description:** Add pool branch to `getNextQuestion` and `submitAnswer`. Implement scope-aware random selection (GLOBAL ∪ PARENT_OVERRIDE-for-student's-parent). Re-fetch by id at submit; never trust client expectedAnswer.

## Key Insights

- `practice.ts` and `practice-client-actions.ts` are **two separate files** with duplicated logic (pre-existing — see practice-client-actions.ts:15 comment "duplicated from practice.ts to avoid circular proxy chain"). Both must be updated symmetrically. **File ownership trap.**
- Pool branch must produce the **same SafeQuestion shape** so `practice-session.tsx` (UI) needs zero changes.
- The pool item's `id` (cuid) must be passed back as the `seed` field to the client, so submit can re-fetch the exact item. **Reusing `seed` field is KISS** — avoids new field on SubmitAnswerInput.
- For pool items, `difficulty` echoed back to client is the row's `difficulty` (1|2|3) — same shape as generator difficulty.
- Student → parent lookup needed: `prisma.user.findUnique({ where: { id: studentId }, select: { parentId: true } })` — once per `getNextQuestion`. Cache via React `cache()` if hot.
- Replay protection: existing `Attempt` index on `(userId, skillKey, seed)` continues to work — `seed` is now the pool item's cuid, still unique-per-user-per-skill.
- Daily-goal/XP/badge logic in `practice-submit-core.ts:84-184` is **agnostic to source** of the question — it operates on `correct` boolean and skill metadata. Zero changes needed there.
- The hot path query has 4-column composite index from Phase 02: `(skillKey, scope, active, difficulty)`. Random pick via `ORDER BY RANDOM() LIMIT 1` is fine for <10K rows per skill (MVP scale).

## Requirements

### Functional

1. `getNextQuestion(skillKey)`:
   - If `skill.generatorKey` set: existing path (unchanged)
   - Else if `skill.poolKey` set: pool path
     - Determine difficulty from mastery (existing `nextDifficulty()`)
     - Determine student's parent via DB lookup
     - Select random `ProblemPool` row matching `(skillKey, difficulty, active=true, scope=GLOBAL OR (scope=PARENT_OVERRIDE AND parentId=studentParent))`
     - If no row matches: fallback to any difficulty (or return `{error: "stub"}`)
     - Build `SafeQuestion` shape from row (problemText, problemLatex?, answerFormat lowercased, choices?)
     - Return with `seed = row.id`, `difficulty = row.difficulty`
2. `submitAnswer(input)`:
   - Replay check unchanged (Attempt index handles it)
   - Determine pool vs generator branch (same as getNextQuestion)
   - Pool branch: `prisma.problemPool.findUnique({ where: { id: seed } })` → if not found → `{error:"not-found"}`
   - Validate per `answerFormat`: NUMERIC/DECIMAL via `parseNumeric`/`parseDecimal`; FRACTION via `parseFraction`; TEXT via trimmed equality; MC via choice key equality
   - Continue with mastery + XP + badges (unchanged)
3. Client cannot bypass: changing `seed` to a different pool id changes the validation target → still safe.

### Non-functional

- Pool query latency <50ms P95 (single indexed SELECT + ORDER BY RANDOM())
- No new client-facing types; reuse `SafeQuestion`, `SubmitAnswerInput`, `SubmitAnswerResult`
- File ownership: modifications confined to `src/app/actions/*.ts` + 1 new helper `src/lib/pool/select-pool-item.ts`

## Architecture

### New helper file

**`src/lib/pool/select-pool-item.ts`** (NEW, ~80 lines):
```ts
import "server-only";
import { prisma } from "@/lib/prisma";

export interface PoolSelectionInput {
  skillKey: string;
  difficulty: 1 | 2 | 3;
  studentParentId: string | null;
}

export async function selectRandomPoolItem(input: PoolSelectionInput) {
  const { skillKey, difficulty, studentParentId } = input;

  // Build scope filter — GLOBAL always, PARENT_OVERRIDE only if student has parent
  const scopeFilter = studentParentId
    ? {
        OR: [
          { scope: "GLOBAL" as const },
          { scope: "PARENT_OVERRIDE" as const, parentId: studentParentId },
        ],
      }
    : { scope: "GLOBAL" as const };

  // Try exact difficulty
  const exact = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "ProblemPool"
    WHERE "skillKey" = ${skillKey}
      AND "active" = true
      AND "difficulty" = ${difficulty}
      AND "kind" = 'STATIC'
      AND (
        "scope" = 'GLOBAL'
        OR ("scope" = 'PARENT_OVERRIDE' AND "parentId" = ${studentParentId})
      )
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (exact.length > 0) {
    return prisma.problemPool.findUnique({ where: { id: exact[0].id } });
  }

  // Fallback: any difficulty (small pools shouldn't fail)
  const fallback = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "ProblemPool"
    WHERE "skillKey" = ${skillKey}
      AND "active" = true
      AND "kind" = 'STATIC'
      AND (
        "scope" = 'GLOBAL'
        OR ("scope" = 'PARENT_OVERRIDE' AND "parentId" = ${studentParentId})
      )
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (fallback.length === 0) return null;
  return prisma.problemPool.findUnique({ where: { id: fallback[0].id } });
}
```

**Why `$queryRaw`:** Prisma doesn't support `ORDER BY RANDOM()` natively. The two-step pattern (raw query for ID, typed findUnique for full row) keeps type safety while leveraging Postgres random.

### New helper for pool→SafeQuestion adaptation

**`src/lib/pool/pool-item-to-safe-question.ts`** (NEW, ~50 lines):
```ts
import "server-only";
import type { ProblemPool } from "@/generated/prisma";
import type { SafeQuestion } from "@/lib/mastery/strip-answer";

const FORMAT_MAP: Record<string, string> = {
  NUMERIC: "numeric",
  FRACTION: "fraction",
  DECIMAL: "decimal",
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple-choice",
};

export function poolItemToSafeQuestion(item: ProblemPool, skillKey: string): SafeQuestion {
  if (item.kind === "TEMPLATE") {
    throw new Error("NotImplemented: TEMPLATE pool items not yet supported");
  }
  if (!item.problemText) {
    throw new Error(`Pool item ${item.id} has no problemText`);
  }

  return {
    id: `pool-${item.id}`,
    skillKey,
    problemText: item.problemText,
    problemLatex: item.problemLatex ?? undefined,
    answerFormat: FORMAT_MAP[item.answerFormat] as SafeQuestion["answerFormat"],
    choices: item.choices.length > 0 ? item.choices : undefined,
    metadata: {
      difficulty: item.difficulty as 1 | 2 | 3,
      seed: item.id,            // re-used as seed for replay protection
      skillKey,
      timeEstimateSec: 60,      // pulled from Skill.timeEstimateSec by caller
    },
  };
}
```

### New helper for pool answer validation

**`src/lib/pool/validate-pool-answer.ts`** (NEW, ~60 lines):
```ts
import "server-only";
import type { ProblemPool, AnswerFormat } from "@/generated/prisma";
import { parseNumeric } from "@/lib/generators/normalize/numeric";
import { parseFraction } from "@/lib/generators/normalize/fraction";
import { parseDecimal } from "@/lib/generators/normalize/decimal";

const DECIMAL_TOL = 1e-2;

export function validatePoolAnswer(item: ProblemPool, userAnswer: string): boolean {
  if (item.kind === "TEMPLATE") {
    throw new Error("NotImplemented: TEMPLATE validation not yet supported");
  }
  if (item.expectedAnswer === null) return false;

  switch (item.answerFormat) {
    case "NUMERIC": {
      const u = parseNumeric(userAnswer);
      const e = parseNumeric(item.expectedAnswer);
      return u !== null && e !== null && u === e;
    }
    case "DECIMAL": {
      const u = parseDecimal(userAnswer);
      const e = parseDecimal(item.expectedAnswer);
      return u !== null && e !== null && Math.abs(u - e) < DECIMAL_TOL;
    }
    case "FRACTION": {
      const u = parseFraction(userAnswer);
      const e = parseFraction(item.expectedAnswer);
      return u !== null && e !== null && u.num * e.den === e.num * u.den;
    }
    case "TEXT":
      return userAnswer.trim().toLowerCase() === item.expectedAnswer.trim().toLowerCase();
    case "MULTIPLE_CHOICE":
      return userAnswer === item.expectedAnswer;
    default:
      return false;
  }
}
```

### Modifications to `getNextQuestion`

Both `practice.ts:45-81` and `practice-client-actions.ts:16-39` get the same patch:

```ts
export async function getNextQuestion(skillKey: string) {
  const user = await verifyStudent();
  const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
  if (!skill) return { error: "not-found" };

  const progress = await loadProgress(user.id, skillKey);
  const difficulty = nextDifficulty(progress.masteryLevel);

  // Branch: pool vs generator
  if (skill.poolKey) {
    const studentRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { parentId: true },
    });
    const item = await selectRandomPoolItem({
      skillKey,
      difficulty,
      studentParentId: studentRow?.parentId ?? null,
    });
    if (!item) return { error: "stub", message: "Bài đang được chuẩn bị" };

    try {
      const safe = poolItemToSafeQuestion(item, skillKey);
      return { ...safe, seed: item.id, difficulty };
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("NotImplemented")) {
        return { error: "stub", message: "Bài đang được chuẩn bị" };
      }
      return { error: "unknown", message: "Pool error" };
    }
  }

  // Generator branch (existing logic) ...
}
```

### Modifications to `submitAnswerCore`

In `practice-submit-core.ts:49-68`:

```ts
// Replace lines 49-68:
const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
if (!skill) return { error: "not-found" };

let correct: boolean;
if (skill.poolKey) {
  // Pool branch — re-fetch by id, never trust client expectedAnswer
  const item = await prisma.problemPool.findUnique({ where: { id: seed } });
  if (!item || !item.active) return { error: "not-found" };
  if (item.skillKey !== skillKey) return { error: "not-found" };  // tampering guard
  try {
    correct = validatePoolAnswer(item, userAnswer);
  } catch {
    return { error: "stub", message: "Bài đang được chuẩn bị" };
  }
} else if (skill.generatorKey) {
  // Generator branch (existing)
  try {
    const generator = getGenerator(skill.generatorKey);
    const q = generator.generate({ seed, difficulty, skillKey });
    correct = generator.validate(userAnswer, q);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("NotImplemented")) {
      return { error: "stub", message: "Bài đang được chuẩn bị" };
    }
    return { error: "unknown", message: "Generator error" };
  }
} else {
  return { error: "stub", message: "Bài đang được chuẩn bị" };
}

// Mastery + XP + badges path unchanged (operates on `correct` only) ...
```

## Related Code Files

### To create

- `src/lib/pool/select-pool-item.ts` (~80 lines)
- `src/lib/pool/pool-item-to-safe-question.ts` (~50 lines)
- `src/lib/pool/validate-pool-answer.ts` (~60 lines)
- `tests/unit/pool/select-pool-item.test.ts`
- `tests/unit/pool/pool-item-to-safe-question.test.ts`
- `tests/unit/pool/validate-pool-answer.test.ts`

### To modify

- `src/app/actions/practice.ts` — add pool branch in `getNextQuestion`
- `src/app/actions/practice-client-actions.ts` — same patch (file duplication is pre-existing)
- `src/app/actions/practice-submit-core.ts:49-68` — add pool branch in `submitAnswerCore`

### To delete

None.

## Implementation Steps

1. Wait for Phase 02 merge.
2. Create `src/lib/pool/` directory.
3. Implement `select-pool-item.ts` with `$queryRaw` two-step pattern.
4. Implement `pool-item-to-safe-question.ts` (STATIC kind only; throw on TEMPLATE).
5. Implement `validate-pool-answer.ts` (5 answerFormat cases).
6. Patch `practice.ts:getNextQuestion` — add pool branch above generator branch.
7. Patch `practice-client-actions.ts:getNextQuestion` — same patch (file ownership note: this duplication is intentional per existing comment).
8. Patch `practice-submit-core.ts:submitAnswerCore` — add pool/generator/stub three-way branch.
9. Write 3 unit tests:
   - `select-pool-item`: scope filtering correctness, fallback path, empty pool returns null
   - `pool-item-to-safe-question`: STATIC happy path, TEMPLATE throws, missing fields throw
   - `validate-pool-answer`: each answerFormat with correct + wrong samples; TEMPLATE throws
10. Write 1 integration test: `tests/integration/pool-submit-flow.test.ts`:
    - Create test student + parent + global pool item + override pool item
    - Call `submitAnswerCore` with correct answer → expect `correct: true`
    - Call again with same seed → expect `error: "replay"`
    - Call with wrong answer → expect `correct: false`
    - Tamper test: call with seed pointing to different skill's item → expect `error: "not-found"`
11. `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm test:integration`.

## Todo List

- [ ] Wait for Phase 02 merge (ProblemPool model exists)
- [ ] Create `src/lib/pool/` directory
- [ ] Implement select-pool-item.ts
- [ ] Implement pool-item-to-safe-question.ts
- [ ] Implement validate-pool-answer.ts
- [ ] Patch practice.ts (pool branch)
- [ ] Patch practice-client-actions.ts (same)
- [ ] Patch practice-submit-core.ts (3-way branch)
- [ ] Unit tests x 3
- [ ] Integration test: pool submit flow
- [ ] Smoke: 2 pool skills render via real DB query
- [ ] All tests green

## Success Criteria

- `getNextQuestion("g4-data-collection")` returns SafeQuestion sourced from DB pool (with sample data seeded by Phase 05)
- Same call returns different items across multiple invocations (RANDOM() works)
- `submitAnswer` validates correctly per `answerFormat`
- Client cannot tamper: changing `seed` to a different skill's pool item → `{error:"not-found"}`
- TEMPLATE pool items throw "NotImplemented" cleanly → user sees "Bài đang được chuẩn bị"
- Empty pool returns `{error:"stub"}`
- 0 regressions in 161+ existing tests; new tests ≥90% coverage

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| `ORDER BY RANDOM()` slow at scale (>100K rows) | L × M | MVP <5K rows; add tablesample optimization Phase 17 |
| `$queryRaw` SQL injection | L × CRITICAL | Use Prisma tagged template literal `$queryRaw\`...\`` (parameterized); never concat strings |
| File ownership conflict: practice.ts ↔ practice-client-actions.ts duplication | M × M | Apply identical patch to both in same commit; CI runs full test suite |
| Pool tampering: client sends seed for different skill | M × H | Guard `item.skillKey !== skillKey` → reject |
| TEMPLATE leak: someone seeds TEMPLATE row, runtime throws unhelpful error | L × M | `pool-item-to-safe-question` throws explicit `NotImplemented:` prefix → caller maps to stub |
| Empty pool for a skill → user sees stub forever | M × M | Phase 05 seeds ≥5 items per skill; teacher dashboard shows count |
| Decimal tolerance too strict (1e-2) breaks legitimate answers | M × M | Curriculum convention is 2dp; tolerance matches. Test 100 samples |
| `selectRandomPoolItem` parent lookup adds DB roundtrip | L × L | Cache student→parentId via React `cache()` if profiling shows hot |
| Override scope leak: PARENT_OVERRIDE rows visible to wrong student | L × CRITICAL | Query enforces `parentId = studentParentId`; integration test asserts this |

## Security Considerations

- **Server re-fetch by id at submit time**: identical security posture to generator branch (regenerate from seed). Client cannot inject expectedAnswer.
- **`item.skillKey !== skillKey` guard**: prevents cross-skill tampering — student practising skill A cannot submit a seed pointing to easier skill B's pool.
- **`item.active === false` filter**: soft-deleted items invisible at runtime even if seed is leaked.
- **Scope enforcement at query level**: PARENT_OVERRIDE rows filtered by `parentId = studentParentId` in raw SQL; cannot leak across families.
- **Active session required**: `verifyStudent()` runs before any pool query (no anonymous access).
- **Replay protection**: existing `Attempt(userId, skillKey, seed)` index covers pool items (seed = pool item id).
- **XSS via `problemText`**: React auto-escapes; KaTeX rendering of `problemLatex` is via library — Phase 04 must use existing `MathDisplay` component which handles this safely.
- **`$queryRaw` parameterization**: enforced by Prisma tagged template; never use `$queryRawUnsafe`.

## Next Steps

- Phase 04 — TEACHER UI for authoring pool items (depends on these helpers)
- Phase 05 — seed pool data + integration tests using these endpoints

## Unresolved Questions

- Fallback when no item matches difficulty: pick any difficulty? Current plan: yes (fallback query). Alternative: return stub. PO confirm — current bias toward "always serve something" for UX.
- Should we cache the parent lookup per student session? Current plan: defer; profile first.
- Should `metadata.timeEstimateSec` come from `Skill.timeEstimateSec` or be hard-coded 60? Current plan: hard-coded 60 in helper; pull from skill if profiling shows it matters. (Current generator code mostly hard-codes too — see rectangular-prism-volume.ts:39.)
