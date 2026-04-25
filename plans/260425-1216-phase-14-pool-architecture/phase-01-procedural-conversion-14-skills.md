# Phase 01 — Procedural Conversion: 14 Skills (poolKey → generatorKey)

## Context Links

- Plan: [plan.md](./plan.md)
- Predecessor (template): `plans/260425-1132-phase-13-exercise-generators/phase-04-tier4-composite-reviews.md`
- Generator exemplar: `src/lib/generators/measurement/rectangular-prism-volume.ts:1-48`
- Composite exemplar: `src/lib/generators/reviews/year-review-comprehensive.ts`
- Registry: `src/lib/generators/registry.ts:62,71,76,137,154`
- Seed: `prisma/seed-data/grade-4.ts:80,87,236,249,386` + `grade-5.ts:53,209,222,235,286,306,361,374,408`
- Schema discriminated union: `prisma/seed-data/types.ts:11-28`

## Overview

- **Priority:** P1
- **Status:** pending
- **Effort:** ~12h
- **Description:** Implement 14 procedural generators currently using `poolKey` (no procedural code path). Update seed: switch 14 skills `poolKey:"X"` → `generatorKey:"X"`. Re-run seed (idempotent). Two skills (`data-collection`, `data-tables-graphs`) remain on poolKey — handled by Phase 03–05.

## Key Insights

- Seed type is **discriminated union** (XOR) — switching `poolKey` to `generatorKey` requires both removing one key and adding the other. TypeScript will fail compile if both/neither set.
- `g5-geometry-review` is a **composite** that pulls from triangle/trapezoid/box/cylinder/circle. It must import generators directly (no registry circular import) — same pattern as Phase 13 Tier 4 reviews.
- DB seeded with `prisma db seed` is idempotent via upsert (verify in `prisma/seed.ts` — file `Skill.upsert` keys on `key`, NOT poolKey). Switching `poolKey → generatorKey` for an existing row should "just work" via upsert update path. Verify before merge.
- Existing user data: `SkillProgress.skillKey` references `Skill.key` (FK), unaffected by generatorKey/poolKey swap. Zero data migration risk.
- 9 NUMERIC/DECIMAL formula generators: trivial (formula + RNG range table). 4 MC concept generators: harder (need quality distractors), still tractable.
- Composite `g5-geometry-review` must declare `answerFormat: "NUMERIC"` only — exclude `circle-circumference-area` (DECIMAL) and `cylinder-volume` (DECIMAL). Pull only from `triangle-area`, `trapezoid-area`, `box-surface-area`. Document this constraint in the file header.

## Requirements

### Functional

14 generators implementing the curriculum semantics declared in the seed `nameVi` strings. Each must support D1/D2/D3 with sensible difficulty progression. answerFormat must match the Skill.answerFormat in seed.

### Non-functional

- File ≤200 lines per generator (split helpers if needed)
- `import "server-only"` mandatory
- One unit test per generator (determinism + range invariants + format)
- Coverage on `src/lib/generators/` maintained ≥90%
- Vietnamese problem text; KaTeX accepted in `problemLatex` for formulas

## Architecture

### Directory layout

```
src/lib/generators/
├── geometry/                              (NEW dir)
│   ├── triangle-area.ts                   (NEW)
│   ├── trapezoid-area.ts                  (NEW)
│   ├── box-surface-area.ts                (NEW)
│   ├── cylinder-volume.ts                 (NEW)
│   ├── circle-circumference-area.ts       (NEW)
│   ├── angle-measure.ts                   (NEW)
│   ├── angle-classify.ts                  (NEW)
│   ├── parallel-perpendicular.ts          (NEW)
│   └── parallelogram-rhombus.ts           (NEW)
├── word-problems/                         (NEW dir)
│   ├── speed-distance-time.ts             (NEW)
│   ├── ratio-concept.ts                   (NEW)
│   └── ratio-word-problems.ts             (NEW)
├── concepts/                              (NEW dir)
│   └── probability-intro.ts               (NEW)
└── reviews/
    └── geometry-review.ts                 (NEW — composite)
```

### Per-generator template (from rectangular-prism-volume.ts)

```ts
import "server-only";
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric"; // or fraction/decimal
import type { Generator, GeneratorParams, Question } from "../types";

const RANGES: Record<number, [number, number]> = { 1: [.,.], 2: [.,.], 3: [.,.] };
const TIME_SEC: Record<number, number> = { 1: ..., 2: ..., 3: ... };

export const xxx: Generator<number> = {
  generate(p): Question<number> { ... },
  validate(userAnswer, q): boolean { ... },
};
```

## Generator Specs (14 total)

### Group A — NUMERIC/DECIMAL formula (9)

| # | Skill key | answerFormat | Formula | D1/D2/D3 ranges |
|---|---|---|---|---|
| A1 | `g4-angle-measure` (key `angle-measure`) | NUMERIC | "góc abc° đo bằng?" | reads angle → integer 0-180 |
| A2 | `g5-triangle-area` (key `triangle-area`) | NUMERIC | A = (a × h) / 2 | a,h ∈ {even nums} so A is integer |
| A3 | `g5-trapezoid-area` (key `trapezoid-area`) | NUMERIC | A = ((a+b) × h) / 2 | constrain (a+b)×h even |
| A4 | `g5-box-surface-area` (key `box-surface-area`) | NUMERIC | S = 2(ab+bc+ac) | sides 2-25 |
| A5 | `g5-cylinder-volume` (key `cylinder-volume`) | DECIMAL | V = π × r² × h, π=3.14 | r,h small; round to 2dp |
| A6 | `g5-circle-circumference-area` (key `circle-circumference-area`) | DECIMAL | C=2πr or A=πr² | π=3.14; alternate prompt |
| A7 | `g5-speed-distance-time` (key `speed-distance-time`) | NUMERIC | v=s/t, s=v·t, t=s/v | divisible pairs |
| A8 | `g5-ratio-concept` (key `ratio-concept`) | NUMERIC | "tỉ số a:b rút gọn?" | gcd-based |
| A9 | `g5-ratio-word-problems` (key `ratio-word-problems`) | NUMERIC | "tổng=S, tỉ a:b → tìm số lớn/nhỏ" | template prompts |

**A1 angle-measure note:** Procedural representation of an angle is tricky without an SVG. KISS: emit text-only prompt: "Một góc có hai tia tạo với nhau ở mức X% của 180°. Số đo góc là?" → answer is the integer. Or simpler: directly state two numbers and ask for sum/difference relating to angle complement (90°−x, 180°−x). Document chosen approach in file header.

**A5/A6 DECIMAL:** Use `parseDecimal` from `normalize/decimal.ts`; answer rounded to 2dp consistent with curriculum convention.

### Group B — MULTIPLE_CHOICE concept (4)

| # | Skill key | answerFormat | Choices | Logic |
|---|---|---|---|---|
| B1 | `g4-angle-classify` (`angle-classify`) | MC | nhọn / vuông / tù / bẹt | RNG int 1-179, classify by range |
| B2 | `g4-parallel-perpendicular` (`parallel-perpendicular`) | MC | song song / vuông góc / cắt nhau | encode line slopes as (m1,m2) tuples |
| B3 | `g4-parallelogram-rhombus` (`parallelogram-rhombus`) | MC | hình bình hành / hình thoi / hình chữ nhật / hình vuông | property table → match |
| B4 | `g4-probability-intro` (`probability-intro`) | MC | chắc chắn / có thể / không thể / ít có khả năng | curated event templates |

**B-group seed strategy:** Hard-coded array of (problemText, correctChoice) tuples per difficulty tier; RNG picks one. NOT an external pool — this is still procedural (small in-file array). Distractors generated by removing correct from full enum.

**B3 hardness:** Defining "hình thoi" vs "hình bình hành" needs property descriptions ("4 cạnh bằng nhau", "2 cặp cạnh đối song song"). Hard-code 6-10 templated prompts per difficulty. Acceptable — matches Phase 13 `decimal-compare` pattern.

### Group C — Composite (1)

#### C1 — `g5-geometry-review` (`geometry-review`)

- answerFormat: NUMERIC (per seed)
- Sub-generators (NUMERIC only): `triangle-area`, `trapezoid-area`, `box-surface-area`, `rectangular-prism-volume`
- **EXCLUDE:** `cylinder-volume` (DECIMAL), `circle-circumference-area` (DECIMAL)
- Pattern identical to Phase 13 Tier 4 composites — see `year-review-comprehensive.ts`
- `validate` replays seed → identifies sub → delegates

## Related Code Files

### To create (14 src + 14 tests = 28 files)

```
src/lib/generators/geometry/triangle-area.ts
src/lib/generators/geometry/trapezoid-area.ts
src/lib/generators/geometry/box-surface-area.ts
src/lib/generators/geometry/cylinder-volume.ts
src/lib/generators/geometry/circle-circumference-area.ts
src/lib/generators/geometry/angle-measure.ts
src/lib/generators/geometry/angle-classify.ts
src/lib/generators/geometry/parallel-perpendicular.ts
src/lib/generators/geometry/parallelogram-rhombus.ts
src/lib/generators/word-problems/speed-distance-time.ts
src/lib/generators/word-problems/ratio-concept.ts
src/lib/generators/word-problems/ratio-word-problems.ts
src/lib/generators/concepts/probability-intro.ts
src/lib/generators/reviews/geometry-review.ts

tests/unit/generators/geometry/*.test.ts            (9)
tests/unit/generators/word-problems/*.test.ts       (3)
tests/unit/generators/concepts/probability-intro.test.ts (1)
tests/unit/generators/reviews/geometry-review.test.ts (1)
```

### To modify

- `src/lib/generators/registry.ts` — add 14 imports + 14 entries to `liveGenerators`
- `prisma/seed-data/grade-4.ts` — 6 skills: switch `poolKey → generatorKey` (lines 80, 87, 236, 249, 386 — leave `data-collection` line 373)
- `prisma/seed-data/grade-5.ts` — 8 skills: switch `poolKey → generatorKey` (lines 53, 209, 222, 235, 286, 306, 361, 374, 408 — leave `data-tables-graphs` line 429)

### To delete

None.

## Implementation Steps

1. Create directories: `geometry/`, `word-problems/`, `concepts/`.
2. Implement 9 Group-A formula generators (1-2h each):
   - Decide RNG ranges per difficulty
   - Write `generate` + `validate`
   - Cap file ≤100 lines (most will be <60)
3. Implement 4 Group-B MC generators:
   - Hard-code `(problemText, correct)` arrays per difficulty
   - `validate` does string equality on choice key
4. Implement composite `geometry-review.ts`:
   - Direct imports of 4 NUMERIC sub-generators
   - `validate` replays `q.metadata.seed` → identifies sub → delegates (per Phase 13 pattern)
5. Write 14 unit tests:
   - Determinism: same seed → identical Q (10 samples)
   - Format: 100 random samples emit declared answerFormat
   - Validate: correct answer returns true, wrong returns false (5 samples)
   - Range: outputs within declared range (Group A only)
   - Composite: 100 samples touch ≥3 sub-generators (B1)
6. Update `registry.ts`: add 14 imports + 14 entries (sorted into existing tier blocks).
7. Update `grade-4.ts` (6 skills) and `grade-5.ts` (8 skills): swap `poolKey:"X"` → `generatorKey:"X"`.
8. Run `pnpm prisma:seed` (or whatever script) — verify upsert path updates Skill rows in place.
9. `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm test:cov`.
10. Smoke: login student → click each of 14 converted skills → expect real question rendering.

## Todo List

- [ ] Create `geometry/`, `word-problems/`, `concepts/` directories
- [ ] A1 angle-measure.ts + test
- [ ] A2 triangle-area.ts + test
- [ ] A3 trapezoid-area.ts + test
- [ ] A4 box-surface-area.ts + test
- [ ] A5 cylinder-volume.ts + test
- [ ] A6 circle-circumference-area.ts + test
- [ ] A7 speed-distance-time.ts + test
- [ ] A8 ratio-concept.ts + test
- [ ] A9 ratio-word-problems.ts + test
- [ ] B1 angle-classify.ts + test
- [ ] B2 parallel-perpendicular.ts + test
- [ ] B3 parallelogram-rhombus.ts + test
- [ ] B4 probability-intro.ts + test
- [ ] C1 geometry-review.ts + test (composite)
- [ ] Update registry.ts (14 imports/entries)
- [ ] Update grade-4.ts seed (6 swaps)
- [ ] Update grade-5.ts seed (8 swaps)
- [ ] Run seed; verify Skill table updated
- [ ] All tests green; coverage ≥90%
- [ ] Smoke: 14 skills render real questions

## Success Criteria

- 14 new generators in `liveGenerators` map; `LIVE_GENERATOR_KEYS` size 44 → 58
- 14 Skill rows in DB now have `generatorKey != null && poolKey == null`
- 2 Skill rows (data-collection, data-tables-graphs) still have `poolKey != null && generatorKey == null`
- Per-generator unit tests pass; coverage ≥90% on new files
- 100-sample run for composite `geometry-review` shows ≥3 distinct sub-generators
- Practice page renders real questions for all 14 (no placeholder)
- No regressions in 161+ existing tests

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| MC distractor quality (B-group too easy or ambiguous) | M × M | Curate 6-10 prompts per difficulty; PO review post-merge |
| Decimal rounding inconsistency in A5/A6 | M × H | Use `parseDecimal` + tolerance `Math.abs(a-b) < 1e-2`; test 100 samples |
| `g5-geometry-review` answerFormat mismatch (NUMERIC review pulls DECIMAL sub) | L × H | Whitelist enforced by SUB_GENERATORS const + 100-sample format test |
| Seed upsert misbehaves on `poolKey:null + generatorKey:"x"` update | L × M | Manual verify after first seed run; rollback via `prisma migrate reset` if dev-only |
| Group A range produces non-integer when answerFormat=NUMERIC | M × H | Constrain RNG (e.g., even base+height for triangle) so divisibility holds |
| Angle-measure procedural representation feels artificial | M × M | Document chosen text format in file header; PO review |
| File >200 lines | L × M | Helpers extracted (e.g., choice-builder for MC group) |

## Security Considerations

- All generators `import "server-only"` — no leak to client bundle
- `expectedAnswer` always stripped via `stripAnswer()` before wire (existing guarantee)
- Composite `validate` replays seed from `q.metadata.seed` (server-computed, not client-supplied) — same trust model as Phase 13 reviews
- No new attack surface introduced

## Next Steps

- After Phase 01 merges, Phase 03 pool runtime can ignore the converted 14 skills entirely.
- Phase 05 integration tests will assert all 60 skills resolve (58 procedural + 2 pool).

## Unresolved Questions

- A1 angle-measure: should we ship a real SVG-based protractor in MVP? Current plan: no, text-only for KISS. Confirm with PO.
- B1-B4 MC distractor curation: who reviews the Vietnamese pedagogical correctness? Currently dev writes. PO/teacher review post-merge.
- A6 circle-circumference-area emits TWO prompt types (C and A). Should this be split into 2 skills? Current plan: keep one skill, alternate via RNG (matches seed `nameVi` "Tính chu vi và diện tích hình tròn"). PO confirm.
