# Phase 02 — Schema Migration: TEACHER Role + ProblemPool Table

## Context Links

- Plan: [plan.md](./plan.md)
- Schema: `prisma/schema.prisma:20-23,38-44,50-80,171-189`
- Auth config: `src/auth.config.ts:30-89`
- Auth callbacks: `src/auth.ts:26-50` (jwt + session typing — Role union literal)
- DAL: `src/lib/dal.ts:14-45`
- Type augmentation: `src/types/auth.d.ts`
- Generated client: `src/generated/prisma/` (output of `prisma generate`)

## Overview

- **Priority:** P1
- **Status:** pending
- **Effort:** ~3h
- **Description:** Add `TEACHER` to `Role` enum. Add `ProblemPool` model + 3 supporting enums. Run migration. Update Auth.js typing for the new role.

## Key Insights

- Postgres enum value addition is a single `ALTER TYPE ... ADD VALUE` migration — no data migration. Safe.
- `ProblemPool` is append-only style (soft-delete via `active=false`) — simpler than hard delete + maintains attempt history if Attempt ever logs poolItemId (Phase 15 maybe).
- `expectedAnswer` stored as `String` because answer types vary (NUMERIC int, FRACTION "3/4", DECIMAL "3.14", TEXT, MC choice key). Parsing is delegated to runtime per `answerFormat` (same approach as `Attempt.submittedAnswer`).
- `choices` stored as `String[]` (Postgres native array) — only used when `answerFormat = MULTIPLE_CHOICE`.
- `kind` discriminator (STATIC vs TEMPLATE) lets us define columns now but ship STATIC only. Adding TEMPLATE columns later means another migration; cheaper to add nullable now and not use them.
- `Role` is currently a union literal in TypeScript callbacks (`"STUDENT" | "PARENT"` at `auth.ts:31,47`). Adding TEACHER requires updating the literal in 3 places: `auth.ts`, `auth.config.ts` (return type implicit), `types/auth.d.ts`.
- DAL needs new `verifyTeacher()` mirror of `verifyParent()` — Phase 04 needs this.

## Requirements

### Functional

1. New enum value: `Role.TEACHER`
2. New enum: `PoolScope { GLOBAL, PARENT_OVERRIDE }`
3. New enum: `PoolItemKind { STATIC, TEMPLATE }`
4. New table `ProblemPool` (see schema below)
5. Auth.js typing accepts `TEACHER` role end-to-end
6. DAL exports `verifyTeacher` (used by Phase 04)

### Non-functional

- Migration name: `20260425_add_teacher_role_and_problem_pool` (or whatever Prisma generates)
- Migration is reversible (down: drop table + remove enum value if Postgres version allows; otherwise leave enum value — harmless)
- Index hot path: `(skillKey, scope, active, difficulty)` for pool selection query
- Index for teacher dashboard: `(createdById, createdAt)` for "my problems"

## Architecture

### Schema additions (prisma/schema.prisma)

```prisma
enum Role {
  STUDENT
  PARENT
  TEACHER     // NEW
}

enum PoolScope {
  GLOBAL
  PARENT_OVERRIDE
}

enum PoolItemKind {
  STATIC
  TEMPLATE
}

model ProblemPool {
  id              String        @id @default(cuid())

  // Skill linkage — denormalized slug, FK to Skill.key (mirrors SkillProgress pattern)
  skillKey        String

  // Scope
  scope           PoolScope     @default(GLOBAL)
  // Required when scope = PARENT_OVERRIDE; null when GLOBAL
  parentId        String?

  // Discriminator — STATIC ships in MVP; TEMPLATE columns exist but unused
  kind            PoolItemKind  @default(STATIC)

  // Difficulty (1=D1, 2=D2, 3=D3) — matches Generator difficulty
  difficulty      Int

  // Answer shape — matches AnswerFormat enum used by Skill
  answerFormat    AnswerFormat

  // STATIC fields (required when kind=STATIC; nullable to allow TEMPLATE rows)
  problemText     String?
  problemLatex    String?
  expectedAnswer  String?       // parsed at runtime per answerFormat
  choices         String[]      @default([])  // empty unless MULTIPLE_CHOICE

  // TEMPLATE fields (Phase 15+; all nullable)
  templateText    String?
  templateLatex   String?
  variableSpec    Json?         // { vars: [{name,min,max,type}], constraints: [...] }
  expectedFormula String?

  // Authorship
  createdById     String        // FK → User; must be TEACHER, or PARENT for PARENT_OVERRIDE scope
  createdBy       User          @relation("ProblemPoolAuthor", fields: [createdById], references: [id], onDelete: Restrict)

  // Soft-delete
  active          Boolean       @default(true)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Skill relation — mirrors SkillProgress (FK to key)
  skill           Skill         @relation(fields: [skillKey], references: [key])

  // Indexes
  @@index([skillKey, scope, active, difficulty])  // hot path: pool selection
  @@index([createdById, createdAt])               // teacher "my problems"
  @@index([parentId])                             // override scope filter
}
```

### User model relation

```prisma
model User {
  // existing fields ...
  problemPoolItems ProblemPool[] @relation("ProblemPoolAuthor")
}
```

### Skill model relation

```prisma
model Skill {
  // existing fields ...
  poolItems ProblemPool[]
}
```

### Auth typing updates

**`src/auth.ts:31`** — change literal:
```ts
token.role = (user.role ?? "STUDENT") as "STUDENT" | "PARENT" | "TEACHER";
```

**`src/auth.ts:47`** — change literal:
```ts
session.user.role = t.role as "STUDENT" | "PARENT" | "TEACHER";
```

**`src/types/auth.d.ts`** — extend Role union (verify current contents).

### DAL extension

**`src/lib/dal.ts`** — add:
```ts
export const verifyTeacher = cache(async () => {
  const user = await verifySession();
  if (user.role !== "TEACHER") {
    redirect("/");
  }
  return user;
});
```

Update `verifySession` return type literal to include `"TEACHER"`.

## Related Code Files

### To create

- `prisma/migrations/<timestamp>_add_teacher_role_and_problem_pool/migration.sql` (auto-generated)

### To modify

- `prisma/schema.prisma` — add enum value, 2 enums, 1 model, relations on User + Skill
- `src/auth.ts` — Role literal in jwt + session callbacks
- `src/auth.config.ts` — implicit return type from authorize() (no change needed if `user.role` is `string`; verify)
- `src/types/auth.d.ts` — Role union extension
- `src/lib/dal.ts` — add `verifyTeacher`; widen `verifySession` literal

### To delete

None.

## Implementation Steps

1. Edit `prisma/schema.prisma`:
   - Add `TEACHER` to `Role` enum
   - Add `PoolScope`, `PoolItemKind` enums
   - Add `ProblemPool` model
   - Add `problemPoolItems` relation to `User`
   - Add `poolItems` relation to `Skill`
2. Run `pnpm prisma migrate dev --name add_teacher_role_and_problem_pool`.
3. Verify generated SQL: enum value addition, table creation, indexes.
4. Run `pnpm prisma generate` — confirms `src/generated/prisma/` includes new types.
5. Update `src/auth.ts:31,47` — Role literal extended.
6. Update `src/types/auth.d.ts` — Role union extended.
7. Update `src/lib/dal.ts` — add `verifyTeacher`; widen `verifySession` return type.
8. `pnpm typecheck` — must pass; if fails, narrow other Role consumers.
9. Smoke test: create a TEACHER user via `prisma studio` or a one-off seed script; sign in (Phase 04 handles UI).

## Todo List

- [ ] Edit schema.prisma — Role.TEACHER + 2 enums + ProblemPool model + 2 relations
- [ ] Run `prisma migrate dev`
- [ ] Run `prisma generate`
- [ ] Verify migration SQL idempotent
- [ ] Update auth.ts Role literal (2 sites)
- [ ] Update types/auth.d.ts Role union
- [ ] Add `verifyTeacher` to dal.ts
- [ ] Widen `verifySession` return literal
- [ ] `pnpm typecheck` clean
- [ ] Manual: create test TEACHER row in DB

## Success Criteria

- `pnpm prisma migrate status` shows applied migration
- New columns visible in `\d "ProblemPool"` (psql)
- `prisma.user.create({ data: { role: "TEACHER", ... } })` succeeds
- `verifyTeacher` redirects non-TEACHER users to `/`
- TypeScript compiles with new Role literal everywhere
- 0 schema lint errors

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Existing user rows incompatible with new enum value | L × L | Postgres enum ADD VALUE is non-destructive; existing STUDENT/PARENT untouched |
| `Restrict` onDelete causes dev-DB cleanup issues | M × L | Document: if you need to delete a TEACHER user with pool items, soft-delete pool items first |
| Auth.js callback Role literal narrowing fails downstream consumers | M × M | Search-and-update all `"STUDENT" \| "PARENT"` literals; CI typecheck catches misses |
| `String[]` choices array on Postgres requires Postgres-specific Prisma feature | L × L | Already in use elsewhere? Check Prisma docs — supported via `String[]` type natively on Postgres |
| Migration rollback in production loses data | L × H | Phase 14 is pre-launch; production migrations gated; document down-migration in PR |
| `expectedAnswer String` loses type safety vs `Json` | L × M | Acceptable: validation happens at runtime against `answerFormat`. Same pattern as `Attempt.submittedAnswer` |
| `ProblemPool.parentId` FK to User without explicit `User` relation field declared on User | L × M | Add explicit relation field if Prisma errors; otherwise rely on implicit |

## Security Considerations

- `createdById` `onDelete: Restrict` — prevents accidental cascade-deletion of authored content
- DAL `verifyTeacher` guards every `/teacher/*` route in Phase 04
- Pool authoring endpoints (Phase 03/04) MUST verify role + scope:
  - Only TEACHER can create scope=GLOBAL
  - Only PARENT can create scope=PARENT_OVERRIDE for their own parentId
  - Anyone trying to set scope mismatch is rejected
- `parentId` FK — only relevant for PARENT_OVERRIDE; runtime guard in Phase 03 query
- `variableSpec Json` — never echoed raw to client without sanitization (Phase 15 concern, not MVP)

## Next Steps

- Phase 03 — implement pool runtime using new schema
- Phase 04 — TEACHER auth + UI dependent on `verifyTeacher`
- Phase 05 — seed sample TEACHER user + sample problems for tests

## Unresolved Questions

- Should TEACHER users have `email + password` (parent-style) or PIN (student-style) login? Current plan: email + password (reuse `parent-credentials` provider with role check, OR add a new `teacher-credentials` provider). Phase 04 to lock.
- TEMPLATE column nullability: if we never ship TEMPLATE in MVP, why add columns now? Tradeoff: avoid future migration. Current plan: ship the columns now (cheap; 4 nullable cols), defer logic. Reject if PO prefers minimal schema.
- Should `parentId` cascade delete pool items when parent deleted? Current plan: no (Restrict via createdBy already protects); orphaned PARENT_OVERRIDE rows are cosmetically wrong but harmless. Revisit Phase 17.
