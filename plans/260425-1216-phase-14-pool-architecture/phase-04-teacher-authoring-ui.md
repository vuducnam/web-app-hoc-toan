# Phase 04 — Teacher Authoring UI: Auth + Dashboard + CRUD

## Context Links

- Plan: [plan.md](./plan.md)
- Blocked by: [phase-02-schema-teacher-role.md](./phase-02-schema-teacher-role.md)
- Auth providers: `src/auth.config.ts:30-89` (parent-credentials provider)
- DAL: `src/lib/dal.ts:39-45` (verifyParent — pattern for verifyTeacher)
- Existing parent layout: `src/app/(parent)/layout.tsx` + `src/app/(parent)/parent/page.tsx`
- Practice UI components (reusable): `src/components/practice/question-card.tsx`, `MathDisplay`
- KaTeX render: existing component (locate during impl)
- Sign-in form pattern: `src/components/auth/` (parent + student forms)

## Overview

- **Priority:** P1
- **Status:** pending — BLOCKED by Phase 02
- **Effort:** ~8h
- **Description:** Build TEACHER-only `/teacher/*` route group: signin, dashboard listing pool skills, CRUD pages for problems. Reuse existing UI primitives (Button, Card, Input, MathDisplay).

## Key Insights

- Auth.js v5 multi-credentials requires unique `id`. Phase 02 left open: reuse `parent-credentials` (then role-check at sign-in callback) OR add a new `teacher-credentials` provider. **Decision: add new `teacher-credentials` provider** — keeps role boundary explicit; mirrors `student-pin` vs `parent-credentials` separation. ~25 lines code; follows exact pattern of parent provider.
- Teacher role is **global authorship only** in MVP. No per-class assignment, no student management. This keeps UI minimal.
- Parents authoring `PARENT_OVERRIDE` items is a Phase 17 feature — out of scope here. UI shows scope=GLOBAL only for TEACHER.
- File ownership: route group `src/app/(teacher)/` is fully new; zero overlap with student/parent groups.
- Server actions for CRUD: `src/app/actions/teacher-pool.ts` (new file, owned by Phase 04).
- Form validation: zod schemas mirroring ProblemPool columns; reused on both client (preview) and server (write).
- Live preview: render `problemText` + `problemLatex` via MathDisplay before save. Pure client-side React state.
- TEMPLATE editor: visible but disabled with "Sắp ra mắt" tooltip. Discriminator radio defaults to STATIC.

## Requirements

### Functional

1. `/teacher/signin` — TEACHER login form (email + password) → calls `signIn("teacher-credentials", ...)`
2. `/teacher` — dashboard listing 2 pool skills (`g4-data-collection`, `g5-data-tables-graphs`) with item count per skill (active items only)
3. `/teacher/pool/[skillKey]` — list page: table of all items for a skill (id, difficulty, problemText preview, active status, createdAt). Buttons: New, Edit, Deactivate
4. `/teacher/pool/[skillKey]/new` — create form
5. `/teacher/pool/[skillKey]/[id]/edit` — edit form (pre-populated)
6. Server actions: `createPoolItem`, `updatePoolItem`, `deactivatePoolItem`
7. All routes protected by `verifyTeacher()` (added in Phase 02)
8. Form fields: difficulty (1/2/3 radio), answerFormat (select), problemText (textarea), problemLatex (optional textarea), expectedAnswer (text), choices (multi-input — appears only when MULTIPLE_CHOICE)
9. Live preview panel — renders problemText + KaTeX-rendered problemLatex
10. Kind discriminator: STATIC (default) | TEMPLATE (disabled with "Sắp ra mắt")

### Non-functional

- File ≤200 lines per page component (split if needed)
- Server actions in single file `src/app/actions/teacher-pool.ts` (≤200 lines)
- Vietnamese UI copy
- Mobile-friendly but desktop-first (teachers will use laptops)
- Per-page test optional in MVP; integration test for server actions required

## Architecture

### Auth provider addition

**`src/auth.config.ts`** — add third Credentials provider:

```ts
Credentials({
  id: "teacher-credentials",
  name: "Teacher Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mật khẩu", type: "password" },
  },
  async authorize(credentials) {
    const parsed = parentSchema.safeParse(credentials);  // reuse schema
    if (!parsed.success) return null;
    const { prisma } = await import("@/lib/prisma");
    const { verifySecret } = await import("@/lib/auth-hashing");
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, role: true, name: true, passwordHash: true },
    });
    if (!user || user.role !== "TEACHER" || !user.passwordHash) return null;
    const valid = await verifySecret(parsed.data.password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, role: user.role, name: user.name };
  },
}),
```

### Route group layout

```
src/app/(teacher)/
├── layout.tsx                                      (NEW — teacher theme + nav)
├── teacher/
│   ├── page.tsx                                    (NEW — dashboard)
│   ├── signin/
│   │   └── page.tsx                                (NEW — signin form)
│   └── pool/
│       └── [skillKey]/
│           ├── page.tsx                            (NEW — list items)
│           ├── new/
│           │   └── page.tsx                        (NEW — create form)
│           └── [id]/
│               └── edit/
│                   └── page.tsx                    (NEW — edit form)
```

### Components

```
src/components/teacher/
├── pool-item-form.tsx                              (NEW — shared create/edit form)
├── pool-item-preview.tsx                           (NEW — live preview panel)
├── pool-item-list-row.tsx                          (NEW — table row)
└── teacher-signin-form.tsx                         (NEW — signin)
```

### Server actions

**`src/app/actions/teacher-pool.ts`** (NEW):

```ts
"use server";
import { verifyTeacher } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const poolItemSchema = z.object({
  skillKey: z.string().min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  answerFormat: z.enum(["NUMERIC", "FRACTION", "DECIMAL", "TEXT", "MULTIPLE_CHOICE"]),
  problemText: z.string().min(1).max(2000),
  problemLatex: z.string().max(2000).optional().nullable(),
  expectedAnswer: z.string().min(1).max(500),
  choices: z.array(z.string()).max(8).default([]),
});

export async function createPoolItem(input: z.input<typeof poolItemSchema>) {
  const teacher = await verifyTeacher();
  const parsed = poolItemSchema.parse(input);
  // Validate skill is poolKey-style
  const skill = await prisma.skill.findUnique({ where: { key: parsed.skillKey } });
  if (!skill || !skill.poolKey) throw new Error("Invalid skill");
  // MC must have ≥2 choices
  if (parsed.answerFormat === "MULTIPLE_CHOICE" && parsed.choices.length < 2) {
    throw new Error("MC items require ≥2 choices");
  }
  // expectedAnswer must be one of choices for MC
  if (parsed.answerFormat === "MULTIPLE_CHOICE" && !parsed.choices.includes(parsed.expectedAnswer)) {
    throw new Error("expectedAnswer must be one of choices");
  }
  // Format-specific parse check (reject malformed expectedAnswer)
  // ...delegated to parseNumeric/parseFraction/parseDecimal as appropriate

  await prisma.problemPool.create({
    data: {
      ...parsed,
      kind: "STATIC",
      scope: "GLOBAL",
      createdById: teacher.id,
    },
  });
  revalidatePath(`/teacher/pool/${parsed.skillKey}`);
}

export async function updatePoolItem(id: string, input: z.input<typeof poolItemSchema>) {
  const teacher = await verifyTeacher();
  const parsed = poolItemSchema.parse(input);
  const existing = await prisma.problemPool.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  // Ownership: any TEACHER can edit any GLOBAL item (MVP). Tighten to author-only Phase 17.
  await prisma.problemPool.update({ where: { id }, data: parsed });
  revalidatePath(`/teacher/pool/${parsed.skillKey}`);
}

export async function deactivatePoolItem(id: string) {
  await verifyTeacher();
  const existing = await prisma.problemPool.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  await prisma.problemPool.update({ where: { id }, data: { active: false } });
  revalidatePath(`/teacher/pool/${existing.skillKey}`);
}
```

### Layout (theme + role guard)

**`src/app/(teacher)/layout.tsx`**:
```tsx
import { verifyTeacher } from "@/lib/dal";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  // Allow signin page through — guard handled per-page
  // Pattern: layout calls verifyTeacher() unless route is /teacher/signin
  // Simpler: verifyTeacher() in every protected page; layout is theme-only
  return (
    <div className="theme-teacher min-h-screen bg-paper">
      <header>...</header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
```

**Note:** `theme-teacher` CSS class is new — Phase 04 ships minimal version (reuse parent palette). Full polish deferred.

### Dashboard data flow

**`src/app/(teacher)/teacher/page.tsx`**:
```tsx
export default async function TeacherDashboard() {
  await verifyTeacher();
  // Find skills with poolKey
  const skills = await prisma.skill.findMany({
    where: { poolKey: { not: null } },
    select: { key: true, nameVi: true, poolKey: true },
  });
  // Count items per skill
  const counts = await prisma.problemPool.groupBy({
    by: ["skillKey"],
    where: { active: true },
    _count: true,
  });
  // ... render
}
```

## Related Code Files

### To create (8 routes + 4 components + 1 action file = 13 files)

```
src/app/(teacher)/layout.tsx
src/app/(teacher)/teacher/page.tsx
src/app/(teacher)/teacher/signin/page.tsx
src/app/(teacher)/teacher/pool/[skillKey]/page.tsx
src/app/(teacher)/teacher/pool/[skillKey]/new/page.tsx
src/app/(teacher)/teacher/pool/[skillKey]/[id]/edit/page.tsx

src/components/teacher/teacher-signin-form.tsx
src/components/teacher/pool-item-form.tsx
src/components/teacher/pool-item-preview.tsx
src/components/teacher/pool-item-list-row.tsx

src/app/actions/teacher-pool.ts

tests/integration/teacher-pool-actions.test.ts
```

### To modify

- `src/auth.config.ts` — add `teacher-credentials` provider
- `src/components/auth/` — possibly add link to teacher signin from landing? (Out of MVP scope; teachers know URL)

### To delete

None.

## Implementation Steps

1. Wait for Phase 02 merge (Role.TEACHER + ProblemPool model + verifyTeacher).
2. Add `teacher-credentials` provider to `auth.config.ts`. Test sign-in via curl.
3. Create `src/app/(teacher)/layout.tsx` with minimal theme.
4. Build `/teacher/signin` page + form component (mirror parent signin).
5. Build `/teacher` dashboard (list 2 skills with item counts).
6. Build `src/app/actions/teacher-pool.ts` (3 server actions + zod schema).
7. Build `pool-item-form.tsx` (shared by new + edit pages):
   - Difficulty radio (1/2/3)
   - AnswerFormat select (5 options)
   - problemText textarea
   - problemLatex textarea (optional)
   - expectedAnswer text
   - choices repeater (visible only when MC)
   - Kind: STATIC (default), TEMPLATE (disabled "Sắp ra mắt")
   - Submit calls server action
8. Build `pool-item-preview.tsx` — render text + KaTeX (reuse `MathDisplay`).
9. Build `/teacher/pool/[skillKey]` list page (table + new button).
10. Build `/teacher/pool/[skillKey]/new` page (form, blank).
11. Build `/teacher/pool/[skillKey]/[id]/edit` page (form, pre-populated).
12. Integration test: `tests/integration/teacher-pool-actions.test.ts`
    - Auth: non-TEACHER cannot call any action (redirects)
    - Create: valid input creates row; invalid throws
    - Update: existing item updated; non-existent throws
    - Deactivate: sets active=false; runtime select-pool-item excludes
13. `pnpm typecheck && pnpm lint && pnpm build`.
14. Manual smoke: create TEACHER user, sign in, create item for `g4-data-collection`, verify it appears in student practice flow.

## Todo List

- [ ] Wait for Phase 02 merge
- [ ] Add teacher-credentials provider
- [ ] Layout (theme placeholder)
- [ ] /teacher/signin route + form
- [ ] /teacher dashboard
- [ ] teacher-pool.ts server actions (3 actions + zod)
- [ ] pool-item-form.tsx (shared form)
- [ ] pool-item-preview.tsx (KaTeX preview)
- [ ] pool-item-list-row.tsx
- [ ] /teacher/pool/[skillKey] list page
- [ ] /teacher/pool/[skillKey]/new page
- [ ] /teacher/pool/[skillKey]/[id]/edit page
- [ ] Integration test (auth + CRUD)
- [ ] Manual smoke: create real item, verify in student flow

## Success Criteria

- TEACHER user signs in via `/teacher/signin`
- `/teacher` shows 2 skills with current active item counts
- Create form: filling and submitting persists item; redirects to list
- Edit form: pre-populated; saves updates
- Deactivate: removes from list (active=false in DB)
- Live preview shows KaTeX-rendered formula correctly
- Non-TEACHER user accessing any `/teacher/*` route redirects to `/`
- 0 console errors / TypeScript errors / lint errors
- Integration test green: auth + CRUD all pass

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Auth provider conflict with parent (same email reused for TEACHER + PARENT) | M × M | Schema: `email` is `@unique`. Different roles per email impossible. Doc requirement: TEACHER uses distinct email |
| Form validation drift between client zod and server zod | M × M | Single zod schema imported by both; shared file `src/lib/pool/pool-item-schema.ts` |
| KaTeX preview crashes on malformed LaTeX | M × L | Wrap in try/catch; show "Lỗi LaTeX" message; existing MathDisplay likely handles |
| MC choices array UX (add/remove repeater) is complex | M × M | Use simple controlled-array state; max 4 choices to start; tests cover add/remove |
| Soft-delete confuses teacher ("where did my item go?") | M × L | Show "Inactive" badge; allow filter "Show inactive" toggle Phase 15 |
| Teacher edits item that's currently being practiced by a student | L × L | Acceptable — replay protection already prevents double-submit; new attempts use updated content |
| Race: two teachers edit same item simultaneously | L × L | Last-write-wins acceptable; add `updatedAt` optimistic check Phase 17 |
| Theme-teacher CSS not designed | M × L | Reuse theme-parent palette in MVP; design polish post-launch |
| `verifyTeacher` not run on every route → unauthorized access | L × CRITICAL | Layout-level guard option considered but signin needs to be in same group; safer: per-page `verifyTeacher()` call (matches student/parent pattern) |
| File >200 lines | M × M | pool-item-form.tsx most at risk; split MC choices into sub-component if needed |

## Security Considerations

- Every protected page calls `verifyTeacher()` first (RSC pattern, redirects on failure)
- Server actions ALL call `verifyTeacher()` first — never trust client-passed userId
- Zod schema rejects malformed input on both client and server
- `expectedAnswer` validated against `choices` array for MC (prevents typo errors that would always fail validation at submit)
- KaTeX rendering: trust LaTeX source from authenticated TEACHER role; not user-generated content from anonymous source
- React auto-escapes `problemText` in preview; KaTeX library handles `problemLatex` safely
- No raw HTML allowed in any field
- Sign-in throttling: rely on existing `rate-limit.ts` if applied to credentials providers; otherwise add Phase 17
- Audit trail: `createdById` recorded; `updatedAt` shows recency. No history table in MVP.

## Next Steps

- Phase 05 — seed initial 5-10 problems × 2 skills using these endpoints (script or manual via UI)
- Phase 17 — author-only edit, history audit, bulk import

## Unresolved Questions

- TEACHER signup flow: how do TEACHER users get created? Current plan: manual via `prisma studio` or one-off seed script in Phase 05. Self-signup deferred to Phase 17.
- Should teachers see attempt analytics per problem (was-answered, success rate)? Current plan: no, MVP defers analytics. Phase 17.
- Should we add a "test this problem" button that simulates student view? Current plan: live preview suffices for MVP. Defer.
- Theme-teacher CSS palette: reuse parent or design new? Current plan: reuse parent (gray + brand-700). Designer review post-MVP.
- Where should "Sign in as teacher" link appear on landing? Current plan: hidden URL only (security through obscurity is weak but minimal scope for MVP). Add link Phase 17.
