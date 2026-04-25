# Phase 05 — Content Seed: Grade 5 Knowledge Notes

## Context Links

- Seed file: `prisma/seed-data/grade-5.ts` (~24 lessons)
- Seed types (after Phase 01): `prisma/seed-data/types.ts`
- Seed runner: `prisma/seed.ts:49-95`
- Curriculum reference: Toán 5 — Kết Nối Tri Thức (KNT-K5)
- Phase 03 renderer: `./phase-03-ui-card-and-drawer.md`
- **Parallel sibling:** `./phase-04-content-seed-grade-4.md` — disjoint files

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~5h (24 lessons × ~12min average)
- Author Vietnamese Markdown+KaTeX content for ~24 G5 lessons.
- **Parallel with Phase 04** — separate seed file → no conflict.

## Key Insights

- ~24 lessons cover: extending decimals, percent, area, volume, ratios, shapes (triangle, trapezoid, circle), data tables/graphs, semester reviews
- G5 has more conceptual density per lesson than G4; expect longer **Ghi nhớ** sections (formulas + worked example)
- **Mở rộng** more natural here ("Áp dụng tính diện tích vườn nhà…", "Lên lớp 6 em sẽ học hình học phẳng tổng quát…")
- Several lessons need formulas in display KaTeX (area triangle, area trapezoid, volume rectangular prism, percent calculation)
- Sibling Phase 14 plan converts G5 poolKey skills (`g5-data-tables-graphs` etc.) to generators — does NOT rename keys → safe
- Allow ~3-5 skill-level overrides for skills like `g5-percent-of-whole` vs `g5-percent-find-base` where lesson default is too generic

## Requirements

### Functional
- Every G5 lesson populated with `knowledgeNoteRemember`
- `knowledgeNoteCaution` for ≥80% of lessons
- `knowledgeNoteExtension` for ≥60% of lessons (higher than G4 because curriculum naturally bridges to grade 6)

### Non-Functional
- Identical authoring guidelines as Phase 04 (em pronoun, encouraging tone, ≤1500 chars/section)

## Architecture

### Content Templates

#### Area-of-triangle lesson example
```ts
{
  order: X,
  nameVi: "Diện tích hình tam giác",
  knowledgeNoteRemember: `### Diện tích tam giác

Công thức tính diện tích hình tam giác:
$$S = \\frac{a \\times h}{2}$$

Trong đó:
- $a$ là độ dài đáy
- $h$ là chiều cao tương ứng với đáy

Ví dụ: tam giác có đáy $6\\,\\text{cm}$, chiều cao $4\\,\\text{cm}$.
Diện tích là $S = \\frac{6 \\times 4}{2} = 12\\,\\text{cm}^2$.`,
  knowledgeNoteCaution: `- Chiều cao $h$ phải vuông góc với đáy $a$ — không phải cạnh nào cũng là chiều cao.
- Đừng quên chia cho 2 ở cuối (đây là lỗi phổ biến nhất).`,
  knowledgeNoteExtension: `Áp dụng: tính diện tích mái nhà hình tam giác. Lên lớp 6 em sẽ học công thức Heron tính diện tích khi biết 3 cạnh.`,
  skills: [/* … */],
}
```

#### Percent lesson example
```ts
knowledgeNoteRemember: `### Tỉ số phần trăm

Phần trăm là cách viết phân số có mẫu số là $100$.
- $25\\% = \\frac{25}{100} = 0{,}25$
- Tìm a% của số $b$: $a\\% \\times b = \\frac{a \\times b}{100}$

Ví dụ: $30\\%$ của $200$ là $\\frac{30 \\times 200}{100} = 60$.`,
```

### Topic-Lesson Map (G5)

Read `grade-5.ts` Step 1 to extract exact lesson list. Approximate buckets:
- Ôn tập và bổ sung số tự nhiên/phân số/decimal
- Tỉ số, tỉ số phần trăm
- Diện tích các hình (tam giác, hình thang, hình tròn — chu vi/diện tích)
- Thể tích hình hộp chữ nhật, hình lập phương
- Vận tốc, quãng đường, thời gian
- Bảng và biểu đồ thống kê
- Ôn tập cuối kì + cuối năm

## Related Code Files

### Modify
- `prisma/seed-data/grade-5.ts`

### Create
- `plans/260425-1216-knowledge-notes-3-section/content-checklist-g5.md` (working doc, not committed)

### Delete
- none

## Implementation Steps

1. Read `grade-5.ts` end-to-end; produce lesson checklist
2. Draft 24 × 3 sections in Vietnamese; emphasize formulas in `Ghi nhớ`
3. Reviewer (teacher) verifies KNT-K5 alignment
4. Insert into `grade-5.ts`
5. Add 3-5 skill-level overrides where lesson default lacks specificity (especially percent and ratio sublessons)
6. `npm run db:seed` clean run
7. `npm run typecheck` clean
8. Spot-check 5 random lessons in browser

## Todo List

- [ ] Build lesson checklist from grade-5.ts
- [ ] Draft 24 lessons × Ghi nhớ (formula-heavy)
- [ ] Draft 24 lessons × Chú ý
- [ ] Draft ~15 lessons × Mở rộng
- [ ] Add 3-5 skill-level overrides
- [ ] db:seed clean
- [ ] Spot-check 5 random lessons
- [ ] Reviewer sign-off

## Success Criteria

- 24/24 G5 lessons have non-null `knowledgeNoteRemember`
- ≥80% have `knowledgeNoteCaution`
- ≥60% have `knowledgeNoteExtension`
- All KaTeX renders without console errors
- Reviewer sign-off recorded in PR description

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Formula authoring errors (e.g. wrong area formula for trapezoid) | Medium | High | Cross-reference KNT-K5 textbook; teacher review mandatory |
| Authoring takes longer than 5h due to formula density | High | Medium | Allow Mở rộng to be sparse; prioritize Ghi nhớ + Chú ý first |
| Skill-override count creeps (>10) → maintenance burden | Low | Low | Cap at 5; defer extras to Phase 15 |
| Long Ghi nhớ section pushes past 1500 char limit | Medium | Low | Split into multiple bullets; use display math sparingly |
| Vietnamese mathematical terminology drift (e.g. "đáy" vs "cạnh đáy") | Low | Medium | Reviewer normalizes against textbook glossary |

## Security Considerations

- Same as Phase 04: dev-authored, no user input

## Next Steps

- Phase 06 smoke test asserts every G5 lesson has `knowledgeNoteRemember` non-null
- Future: bilingual EN translations in Phase 15
