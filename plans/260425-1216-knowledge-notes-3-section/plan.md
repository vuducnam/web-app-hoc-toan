---
title: "Knowledge Notes — Pre-Exercise 3-Section Reference Card"
description: "Show 'Ghi nhớ / Chú ý / Mở rộng' before each practice; toggle drawer inside session. Lesson-default + skill-override Markdown+KaTeX."
status: pending
priority: P2
effort: ~26h
branch: main
tags: [ui, practice, curriculum, content, prisma, markdown, katex]
created: 2026-04-25
---

## Goal

Show a 3-section knowledge-recall card ("Kiến thức cần nhớ") before each practice session and as a toggle drawer inside the session. Sections: **Ghi nhớ** (core knowledge), **Chú ý** (caution/common mistakes), **Mở rộng** (extension/related). Content authored as Markdown + KaTeX, stored on `Lesson` (default) with optional `Skill`-level override.

## Source of Truth

- User requirement (locked 2026-04-25): "kiến thức cần nhớ trước mỗi bài tập, để học sinh khi làm có thể nhớ và tổng hợp ngay"
- Schema: `prisma/schema.prisma:160-189` (Lesson + Skill)
- Practice entry: `src/app/(student)/student/practice/[skillKey]/page.tsx:15-56`
- Practice session: `src/components/practice/practice-session.tsx`
- KaTeX renderer: `src/components/ui/math-display.tsx`, KaTeX CSS imported in `src/app/layout.tsx:3`
- Seed types: `prisma/seed-data/types.ts`, seeders `grade-4.ts` (~32 lessons) + `grade-5.ts` (~24 lessons) = **~56 lessons**
- Sibling plan (parallel, non-blocking): `plans/260425-1216-phase-14-pool-architecture/plan.md`

## Locked Decisions (2026-04-25)

- 3 sections per note: **Ghi nhớ / Chú ý / Mở rộng**
- Storage: 6 nullable Markdown columns (3 on Lesson, 3 on Skill); skill overrides per-section
- Resolution: `skill.X ?? lesson.X ?? null`; skip card when all 3 null
- Display: full pre-session card with "Bắt đầu" CTA, plus inline drawer "Xem kiến thức" inside session
- Content format: Markdown + KaTeX (`$inline$`, `$$block$$`)
- Renderer chain: `react-markdown` + `remark-math` + `rehype-katex` (new deps)
- Initial scope: lesson-level baseline notes for ALL 56 lessons; skill overrides only when needed
- No "seen state" tracking in MVP — card shown every session

## Phases

| # | Phase | Status | Effort | Blockers | Parallel |
|---|---|---|---|---|---|
| 01 | Schema migration + types (6 columns + TS) | pending | 2h | none | with 03 only on UI scaffold |
| 02 | Runtime resolution + practice page integration | pending | 3h | 01 | sequential |
| 03 | UI: pre-session card + drawer + Markdown+KaTeX renderer | pending | 6h | 01 | 03 UI scaffold parallel with 02 |
| 04 | Content seed — Grade 4 (~32 lessons × 3 sections) | pending | 7h | 01,02,03 | with 05 |
| 05 | Content seed — Grade 5 (~24 lessons × 3 sections) | pending | 5h | 01,02,03 | with 04 |
| 06 | Tests + a11y validation | pending | 3h | 01–05 | sequential |

**Parallelization:** 04 ‖ 05 after 03 lands. UI scaffold work in 03 can run concurrently with 02 if the resolver type is pre-agreed.

## Phase Files

- [phase-01-schema-and-types.md](./phase-01-schema-and-types.md) — Prisma migration + TS types
- [phase-02-runtime-resolution.md](./phase-02-runtime-resolution.md) — `resolveKnowledgeNote()` + page wiring
- [phase-03-ui-card-and-drawer.md](./phase-03-ui-card-and-drawer.md) — components, Markdown+KaTeX renderer, theming
- [phase-04-content-seed-grade-4.md](./phase-04-content-seed-grade-4.md) — author 32 G4 lesson notes
- [phase-05-content-seed-grade-5.md](./phase-05-content-seed-grade-5.md) — author 24 G5 lesson notes
- [phase-06-validation-tests.md](./phase-06-validation-tests.md) — unit, snapshot, integration, a11y

## Key Dependencies

- New npm deps: `react-markdown`, `remark-math`, `rehype-katex` (KaTeX + react-katex already present)
- Existing: `@radix-ui/react-dialog` (used for drawer)
- Reuse `MathDisplay` token styles for KaTeX visual parity

## Out of Scope (deferred)

- "Seen-state" tracking per (user, lesson) → Phase 15 enhancement
- Teacher-authored note CRUD UI → folds into Phase 14 teacher role work
- Translation toggle (en) → Phase 15
- Image embeds in Markdown → not required for elementary math notes

## Success Criteria

- All 56 lessons have at least `knowledgeNoteRemember` non-null
- Pre-session card renders before first question when note is non-null
- Drawer toggle works inside practice (open via button, close via ESC, X, or auto-close on first input)
- LaTeX in notes renders identically to existing `MathDisplay`
- Lighthouse a11y score on practice page unchanged or improved (baseline established in 06)
- All existing 161+ tests still pass; new tests cover resolver, renderer, drawer focus trap
