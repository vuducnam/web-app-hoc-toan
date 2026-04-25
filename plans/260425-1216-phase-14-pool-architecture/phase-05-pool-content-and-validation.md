# Phase 05 — Pool Content Seed + Integration Tests + Security Audit

## Context Links

- Plan: [plan.md](./plan.md)
- Blockers: Phases 01, 02, 03, 04 (all)
- Pool runtime: `src/lib/pool/select-pool-item.ts`, `validate-pool-answer.ts`, `pool-item-to-safe-question.ts` (Phase 03)
- Teacher actions: `src/app/actions/teacher-pool.ts` (Phase 04)
- Existing seed: `prisma/seed-data/grade-4.ts:373` (data-collection), `grade-5.ts:429` (data-tables-graphs)
- Seed runner: `prisma/seed.ts` (verify path during impl)
- Skill rows targeted: `g4-data-collection`, `g5-data-tables-graphs`

## Overview

- **Priority:** P1
- **Status:** pending — BLOCKED by 01–04
- **Effort:** ~4h
- **Description:** Seed initial 5–10 sample problems per pool skill (10–20 total). Add integration tests for full student-pool-flow. Run security audit checklist. Update docs.

## Key Insights

- Sample problems must be hand-crafted Vietnamese pedagogical content; NOT procedural. The whole point of using pool for these 2 skills is curated quality.
- Seed script must be **idempotent** — run multiple times without duplicating items. Use `upsert` keyed on something stable (e.g., `(skillKey, problemText)`) OR add an `externalKey` field. **Decision:** add a deterministic key by hashing problemText; insert only if no row matches. Avoid schema change — use `findFirst({ where: { skillKey, problemText: ... } })` then create if absent.
- TEACHER user must exist before pool seed runs. Add a `seed-teacher.ts` step that creates a single dev TEACHER (`teacher@dev.local` / fixed password).
- Integration tests need a clean DB or transactional rollback. Existing test setup pattern (verify in `tests/integration/` for examples, e.g., `tests/integration/practice-flow.test.ts` if exists) — Phase 03 lays groundwork.
- Security audit checklist: STRIDE-style on the new attack surface (pool injection, scope leak, auth bypass, XSS via problemText/Latex). Items mostly mitigated by Phase 02–04 design; Phase 05 verifies and documents.
- Docs sync: update `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/project-changelog.md`. Roadmap entry for Phase 14 completion.

## Requirements

### Functional

1. Seed script creates 1 TEACHER dev user (idempotent)
2. Seed script creates 5–10 STATIC GLOBAL ProblemPool rows for `g4-data-collection`
3. Seed script creates 5–10 STATIC GLOBAL ProblemPool rows for `g5-data-tables-graphs`
4. All sample items balanced across difficulty (≥1 of each D1/D2/D3)
5. Integration test suite covering:
   - Student practices pool skill → gets random item → submits correct → records progress
   - Same skill, different students, different items returned over multiple calls
   - PARENT_OVERRIDE filtering: student A (parent X) sees X's overrides; student B (parent Y) does not
   - Tampering: client sends seed for different skill → rejected
   - Empty pool: returns stub error gracefully
   - TEMPLATE row exists → runtime treats as stub (not crash)
6. Security audit checklist documented in `docs/security-audit-phase-14.md` (or appended to existing security doc)

### Non-functional

- Seed completes in <5s
- Integration tests <30s total
- Test fixtures use isolated DB transactions (Vitest + `prisma.$transaction` rollback) OR test DB
- All new docs in `docs/` follow existing structure

## Architecture

### Seed file additions

```
prisma/seed-data/
├── teacher-user.ts                  (NEW — single dev TEACHER)
└── pool-items/
    ├── g4-data-collection.ts        (NEW — 5-10 sample items)
    └── g5-data-tables-graphs.ts     (NEW — 5-10 sample items)
```

**`prisma/seed-data/teacher-user.ts`** sketch:
```ts
import { hashSecret } from "@/lib/auth-hashing";

export async function seedTeacherUser(prisma: PrismaClient) {
  const passwordHash = await hashSecret("teacher-dev-2026");
  await prisma.user.upsert({
    where: { email: "teacher@dev.local" },
    create: {
      email: "teacher@dev.local",
      role: "TEACHER",
      name: "Cô Mai (dev)",
      passwordHash,
    },
    update: { passwordHash, role: "TEACHER" },
  });
}
```

**`prisma/seed-data/pool-items/g4-data-collection.ts`** sketch (data-collection = read frequency tables):
```ts
export const g4DataCollectionItems = [
  {
    difficulty: 1,
    answerFormat: "NUMERIC" as const,
    problemText:
      "Bảng thống kê môn thể thao yêu thích của lớp 4A:\n" +
      "- Bóng đá: 12\n- Cầu lông: 8\n- Bơi: 5\n- Khác: 5\n\n" +
      "Có bao nhiêu học sinh thích bóng đá?",
    expectedAnswer: "12",
    choices: [],
  },
  // ... 4-9 more items varied across difficulty
] as const;
```

**`prisma/seed-data/pool-items/g5-data-tables-graphs.ts`** sketch (data-tables-graphs = read column charts):
```ts
export const g5DataTablesGraphsItems = [
  {
    difficulty: 1,
    answerFormat: "NUMERIC" as const,
    problemText:
      "Biểu đồ cột thể hiện điểm kiểm tra của 4 bạn:\n" +
      "An: 8 điểm | Bình: 7 điểm | Châu: 9 điểm | Dũng: 6 điểm.\n\n" +
      "Bạn nào có điểm cao nhất? Nhập điểm của bạn đó.",
    expectedAnswer: "9",
    choices: [],
  },
  // ... etc
] as const;
```

### Seed runner integration

Modify `prisma/seed.ts` (or whatever the runner is) to:
1. Call existing curriculum seed (grades, volumes, topics, lessons, skills)
2. Call existing badge seed
3. Call new `seedTeacherUser`
4. Call new `seedPoolItems` (loops the two arrays, idempotent insert)

Idempotent insert pattern:
```ts
for (const item of g4DataCollectionItems) {
  const existing = await prisma.problemPool.findFirst({
    where: { skillKey: "g4-data-collection", problemText: item.problemText },
  });
  if (!existing) {
    await prisma.problemPool.create({
      data: {
        ...item,
        skillKey: "g4-data-collection",
        kind: "STATIC",
        scope: "GLOBAL",
        createdById: teacher.id,
      },
    });
  }
}
```

### Integration test structure

**`tests/integration/pool-end-to-end-flow.test.ts`** (NEW):
```ts
describe("Pool E2E flow", () => {
  beforeAll(async () => {
    // Run pool seed in test DB
  });

  it("student gets random item and submits correctly", async () => {
    // 1. Find pool skill
    // 2. Call getNextQuestion via direct server action import
    // 3. Look up expected answer in DB (test-only — bypasses security guard)
    // 4. Call submitAnswerCore with correct answer
    // 5. Assert correct=true, attempt logged
  });

  it("returns different items on consecutive calls", async () => { ... });

  it("PARENT_OVERRIDE filters by student's parent", async () => {
    // Create 2 parents, 2 students, 2 override items each
    // Each student sees only their parent's overrides + globals
  });

  it("rejects tampered seed (cross-skill)", async () => { ... });

  it("empty pool returns stub error", async () => { ... });

  it("TEMPLATE row → stub error (not crash)", async () => { ... });
});
```

**`tests/integration/registry-coverage.test.ts`** — extend existing (if exists):
- Assert all 60 skills resolve via either generator or pool path
- Assert exactly 2 skills have poolKey
- Assert exactly 58 skills have generatorKey

### Security audit checklist

**`docs/security-audit-phase-14.md`** (NEW):

| Threat | Vector | Mitigation | Status |
|---|---|---|---|
| Auth bypass: student accesses /teacher/* | Direct URL | `verifyTeacher()` per page + per server action | ✓ tested |
| Pool tampering: client submits fake seed | Modify network payload | `item.skillKey === skillKey` guard; replay protection | ✓ tested |
| Cross-scope leak: student sees other parent's overrides | Crafted parentId | Query filters `parentId = studentParentId` | ✓ tested |
| XSS via problemText | Author injects `<script>` | React auto-escape; teacher role trusted | ✓ verified |
| XSS via problemLatex | Malformed LaTeX → DOM injection | KaTeX renderer (not innerHTML); existing component used | ✓ verified |
| SQL injection via $queryRaw | Pool selection raw query | Parameterized via Prisma tagged template | ✓ verified |
| Answer leak | expectedAnswer sent to client | Pool path uses stripAnswer-equivalent (no expectedAnswer in SafeQuestion); item id used as seed | ✓ tested |
| TEACHER privilege escalation | TEACHER edits scope=PARENT_OVERRIDE | createPoolItem hard-codes scope=GLOBAL for TEACHER | ✓ verified |
| Mass-deactivation by malicious TEACHER | All TEACHERs share write rights | Author-only edit deferred to Phase 17; MVP accepts trusted-teacher model | accept |
| TEMPLATE injection | TEMPLATE columns set to malicious payload | Runtime throws NotImplemented before render; never serialized to client | ✓ verified |
| Replay attack on pool item | Resubmit same seed | Existing Attempt(userId, skillKey, seed) unique constraint | ✓ tested |

## Related Code Files

### To create

```
prisma/seed-data/teacher-user.ts
prisma/seed-data/pool-items/g4-data-collection.ts
prisma/seed-data/pool-items/g5-data-tables-graphs.ts

tests/integration/pool-end-to-end-flow.test.ts

docs/security-audit-phase-14.md
```

### To modify

- `prisma/seed.ts` (seed runner) — invoke new seed functions
- `tests/integration/registry-coverage.test.ts` (if exists) — assert 58/2 split
- `docs/codebase-summary.md` — add `src/lib/pool/`, `src/app/(teacher)/`, ProblemPool model
- `docs/system-architecture.md` — pool selection flow, scope semantics
- `docs/project-changelog.md` — Phase 14 entry
- `docs/development-roadmap.md` — mark Phase 14 complete; remove pool from "future"
- `docs/project-overview-pdr.md` — update FR-008 (curriculum) to mention pool, add new FR for TEACHER role

### To delete

None.

## Implementation Steps

1. Wait for Phases 01, 02, 03, 04 to merge.
2. Run Phase 01 conversion → confirm 14 skills now show `generatorKey != null`.
3. Author 5–10 sample problems per pool skill (collaborate with PO if Vietnamese pedagogy review needed).
4. Implement `seed-data/teacher-user.ts` + `pool-items/*.ts`.
5. Wire into `prisma/seed.ts` runner.
6. Run `pnpm prisma:seed` — verify TEACHER + ~15 pool rows created. Re-run; verify idempotent (no duplicates).
7. Implement integration test file. Run `pnpm test:integration`.
8. Run security audit checklist; check each row; document evidence in `docs/security-audit-phase-14.md`.
9. Update docs (codebase-summary, system-architecture, changelog, roadmap, PDR).
10. Final smoke:
    - Login as TEACHER → see 2 skills + counts
    - Login as student → practice both pool skills → real questions appear
    - Login as parent → no /teacher access
    - Login as student → no /teacher access
11. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green.

## Todo List

- [ ] Wait for Phases 01–04 merged
- [ ] Author 5–10 G4 data-collection items (Vietnamese)
- [ ] Author 5–10 G5 data-tables-graphs items (Vietnamese)
- [ ] seed-data/teacher-user.ts (idempotent upsert)
- [ ] seed-data/pool-items/g4-data-collection.ts
- [ ] seed-data/pool-items/g5-data-tables-graphs.ts
- [ ] Update prisma/seed.ts runner
- [ ] Run seed, verify idempotency
- [ ] Integration test: pool E2E flow (6 cases)
- [ ] Update registry-coverage test (58/2 split)
- [ ] Security audit checklist (11 rows verified)
- [ ] docs/codebase-summary.md updates
- [ ] docs/system-architecture.md updates
- [ ] docs/project-changelog.md Phase 14 entry
- [ ] docs/development-roadmap.md Phase 14 marked complete
- [ ] docs/project-overview-pdr.md FR updates
- [ ] Final smoke: 4 personas (teacher/student/parent/anon)
- [ ] All quality gates green

## Success Criteria

- 60/60 skills resolve to functional questions (58 generator + 2 pool)
- Pool skills serve real curated problems from DB
- Re-running seed produces same row count (idempotent)
- Integration test 6/6 cases pass
- Security audit doc shows all rows verified or explicitly accepted
- Docs updated in 5 files
- 0 regressions; 161+ existing tests still green
- `pnpm build` succeeds; bundle size unchanged for student/parent flows (teacher routes are separate chunks)

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Seed not idempotent → duplicate items on re-run | M × M | findFirst-then-create pattern; tested by running seed twice |
| Sample problem quality insufficient (PO rejects pedagogy) | M × M | Pre-write 10 items, expect to discard 30%; user-acceptance review with PO before merge |
| Integration test pollutes shared DB | M × M | Use transaction rollback or per-test cleanup; document setup in test file header |
| Security audit reveals unmitigated threat | L × CRITICAL | Block Phase 14 release until mitigation added |
| Docs drift between Phase 14 reality and ./docs | M × L | All updates committed in same PR as code; PR description checklist references doc files |
| Test DB lacks teacher seed → integration tests fail | M × M | Test setup runs `seedTeacherUser` in beforeAll |
| `Cô Mai (dev)` test password committed if real prod env shares DB | L × CRITICAL | Document: dev seed must NOT run in prod; gate with NODE_ENV check |
| Vietnamese content has typos / pedagogical errors | M × M | PO review before commit; flag for native speaker proofread |
| `findFirst` on `problemText` fails for items with whitespace differences | L × L | Trim before compare; or use a stable hash field (defer if not needed) |
| Empty pool fallback (Phase 03) hides bug "did seed run?" | M × L | Integration test asserts ≥5 items per pool skill before running E2E test |

## Security Considerations

- TEACHER dev user password seeded only in dev (gated by NODE_ENV); document this rule
- Seed runner should refuse to run in production unless explicit `--allow-prod` flag
- Pool item content is teacher-authored — assume trusted role boundary; XSS mitigations are defense-in-depth
- Integration tests must NOT log expectedAnswer values to console (avoid leaking via test output if CI logs are public)
- Audit document `docs/security-audit-phase-14.md` is the single source of mitigation truth — keep updated as new attack surfaces emerge

## Next Steps

- Phase 15 — TEMPLATE pool items, "avoid recently shown" selection, bulk import CSV
- Phase 17 — Author-only edit, history audit, classroom assignment, TEACHER signup flow

## Unresolved Questions

- Pedagogical authority: who provides the canonical 5–10 sample items per pool skill? Current plan: dev drafts, PO reviews. Block merge if PO unavailable.
- Should test DB be a separate Postgres instance or transaction-rollback against dev DB? Current plan: align with existing test setup (verify during impl).
- Is `Cô Mai (dev)` test password OK to commit? Current plan: yes — dev-only, NODE_ENV gated. Confirm with security review.
- Should seed clear all pool items before running (destructive idempotent) vs find-then-create (preservative idempotent)? Current plan: preservative — teacher-created items via UI must survive seed re-runs. Lock this.
- Phase 14 marks "MVP complete on curriculum coverage" — should we tag a release? Defer to project-manager / user.
