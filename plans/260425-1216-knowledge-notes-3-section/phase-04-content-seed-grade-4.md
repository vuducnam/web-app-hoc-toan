# Phase 04 — Content Seed: Grade 4 Knowledge Notes

## Context Links

- Seed file: `prisma/seed-data/grade-4.ts` (~32 lessons across 13 topics, 2 volumes)
- Seed types (after Phase 01): `prisma/seed-data/types.ts` w/ `KnowledgeNoteFields`
- Seed runner: `prisma/seed.ts:49-95` (upsertLesson + upsertSkill)
- Curriculum reference: Toán 4 — Kết Nối Tri Thức (KNT-K4)
- Phase 03 renderer (Markdown + KaTeX): `./phase-03-ui-card-and-drawer.md`

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~7h (32 lessons × ~13min average authoring)
- Author Vietnamese Markdown+KaTeX content for ~32 G4 lessons. Skill-level overrides only when lesson default insufficient.
- **Parallel with Phase 05** (Grade 5) — disjoint files, no merge conflict.

## Key Insights

- ~32 lessons span: arithmetic to 100k, angles, multi-digit numbers, length/mass/capacity, parallel/perpendicular, rhombus/parallelogram, fractions, decimals, area, statistics, semester reviews
- Each lesson maps to 1-2 skills typically; lesson-level note covers shared concept; skill override needed if skill is narrower (e.g. one-digit-divisor vs two-digit-divisor)
- Vietnamese tone: address student as **"em"**, encouraging, concrete examples
- LaTeX in Markdown: use `$inline$` for short formula, `$$display$$` for showcase
- Examples in **Ghi nhớ**, NOT in **Mở rộng**
- **Mở rộng** = brief link to higher-grade concept or real-life ("Lên lớp 5 em sẽ học…", "Áp dụng tính diện tích sân nhà…") — keep ≤2 sentences
- **Chú ý** = 1-2 bullet points for common mistakes (alignment, carry/borrow, unit conversion direction)
- **Allow Mở rộng to be null/empty for MVP** — not all lessons need extension
- Avoid escape headaches: in TS template literals, use raw `\\frac` carefully — prefer reading from a `.md` sibling file via `fs.readFileSync` if escape density too high; KISS approach is inline strings with explicit doubled backslash

## Requirements

### Functional
- Every G4 lesson populated with `knowledgeNoteRemember` (mandatory)
- `knowledgeNoteCaution` populated where lesson has known pitfalls (≥80% of lessons)
- `knowledgeNoteExtension` populated where natural extension exists (≥50% of lessons)
- Skill-level override populated only when lesson is too generic for the skill (estimate: 5-8 skills out of 33)

### Non-Functional
- Vietnamese accents preserved (file already uses UTF-8)
- KaTeX expressions render without warnings
- Each note ≤ 1500 characters per section (UI design limit)

## Architecture

### Authoring Workflow
```
Author drafts in Notion / Google Doc
  → Reviewer (Vietnamese math teacher) confirms accuracy
    → Paste into grade-4.ts under each lesson
      → npm run db:seed
        → spot-check rendering at /student/practice/{skillKey}
```

### Content Template per Lesson
```ts
{
  order: 1,
  nameVi: "Số tự nhiên đến 100 000",
  knowledgeNoteRemember: `### Số tự nhiên đến 100 000

Em đọc số từ trái sang phải, theo từng hàng:
- Hàng nghìn → hàng trăm → hàng chục → hàng đơn vị

Ví dụ: $45\\,678$ đọc là **bốn mươi lăm nghìn sáu trăm bảy mươi tám**.`,
  knowledgeNoteCaution: `- Đừng quên dấu cách giữa các nhóm chữ số (ví dụ $45\\,678$, không viết $45678$).
- Số $0$ ở giữa cũng phải đọc (ví dụ $40\\,005$ — bốn mươi nghìn không trăm linh năm).`,
  knowledgeNoteExtension: `Lên lớp 5 em sẽ học số đến hàng triệu, hàng tỉ — vẫn đọc theo cùng quy tắc nhóm 3 chữ số.`,
  skills: [/* … */],
}
```

### Topic-Lesson Map (G4)

Volume 1 (Topics 1-7):
1. Ôn tập và bổ sung — 3 lessons
2. Góc và đơn vị đo góc — 1 lesson (2 skills, may need skill override)
3. Số có nhiều chữ số — 3 lessons
4. Một số đơn vị đo đại lượng — 3 lessons
5. Phép cộng và phép trừ — 2 lessons
6. Đường thẳng vuông góc, song song — 2 lessons
7. Ôn tập học kì 1 — 1 lesson

Volume 2 (Topics 8-13):
8-13. Phép nhân, phép chia, phân số, ôn tập — verify exact count by reading file

**Action item Step 1:** read `grade-4.ts` end-to-end and produce a checklist of every `(volumeOrder, topicOrder, lessonOrder, lessonNameVi)` tuple before authoring.

## Related Code Files

### Modify
- `prisma/seed-data/grade-4.ts` — add note fields to each lesson (and select skills)

### Create
- `plans/260425-1216-knowledge-notes-3-section/content-checklist-g4.md` (working doc, not committed) — track lesson coverage

### Delete
- none

## Implementation Steps

1. Read `grade-4.ts` fully; produce lesson checklist (~32 rows: volume.order/topic.order/lesson.order/nameVi)
2. For each lesson, draft 3 sections in Vietnamese w/ KaTeX where formulas apply
3. Cross-reference Toán 4 KNT textbook for accuracy — escalate any uncertain content to a teacher reviewer
4. Insert content into `grade-4.ts` lesson objects (3 fields per lesson)
5. For lessons whose skills are notably narrower than lesson scope, add skill-level overrides (start with 0; add only if QA reveals mismatch)
6. Run `npm run db:seed` — verify zero errors
7. Run `npm run typecheck` (no string-escape syntax errors)
8. Manual spot-check: render 5 random lessons at `/student/practice/{skillKey}` — confirm formulas display, sections styled correctly
9. PR with content-only diff (cleanly separable from Phase 03 code)

## Todo List

- [ ] Build lesson checklist from grade-4.ts
- [ ] Draft 32 lessons × Ghi nhớ
- [ ] Draft 32 lessons × Chú ý (where applicable)
- [ ] Draft ~16 lessons × Mở rộng (where natural)
- [ ] Add 5-8 skill-level overrides as needed
- [ ] db:seed clean
- [ ] Spot-check 5 random lessons in browser
- [ ] Reviewer (teacher) sign-off

## Success Criteria

- 32/32 G4 lessons have non-null `knowledgeNoteRemember`
- ≥80% have non-null `knowledgeNoteCaution`
- ≥50% have non-null `knowledgeNoteExtension`
- All KaTeX expressions render without console errors
- No regression in `db:seed` row count assertions (`seed.ts:189-192` allows 50-65 skills)
- Reviewer sign-off recorded in PR description

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Authoring effort underestimated (32 × 3 sections) | High | High | Time-box: cap at 7h; allow Mở rộng to be empty for MVP; defer remaining authoring to Phase 15 |
| Pedagogical inaccuracy (formula wrong, terminology mismatched with KNT-K4) | Medium | High | Mandatory teacher review before merge; cite textbook chapter in PR |
| LaTeX escape errors break TS compilation | Medium | Low | Use raw template literals; `npm run typecheck` between batches |
| Vietnamese diacritic corruption from copy-paste | Low | Medium | UTF-8 only; spot-check `ó` etc. visually; CI lints encoding |
| Inconsistent voice across 32 lessons | Medium | Low | Single author for all G4; reviewer normalizes tone |
| Content drifts from sibling Phase 14 generator changes (skill renames) | Low | Medium | Phase 14 may convert poolKey→generatorKey but does NOT rename skill keys — note content keyed to lesson, not skill, so safe |

## Security Considerations

- All content authored in-repo; no user input → no XSS surface
- Markdown escapes raw HTML (Phase 03 `skipHtml`)
- No external image / link embeds in MVP

## Next Steps

- Phase 06 adds smoke test asserting "every lesson row has knowledgeNoteRemember non-null"
- Phase 15 may add Mở rộng coverage for remaining lessons
