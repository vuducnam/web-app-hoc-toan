# Phase 01 — Tier 1: Number Sense + Big Arithmetic (Grade 4)

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md` §"Phase 13 Content Roadmap"
- Curriculum source: `prisma/seed-data/grade-4.ts:25-355` (skills with `generatorKey` in this tier)
- Exemplar generator: `src/lib/generators/arithmetic/add-sub-100k-carry.ts:1-91`
- Exemplar test: `tests/unit/generators/add-sub-100k-carry.test.ts:1-128`
- RNG helper: `src/lib/generators/seeded-rng.ts:1-43`
- Numeric parser: `src/lib/generators/normalize/numeric.ts:1-16`
- Registry: `src/lib/generators/registry.ts:28-84` (STUB_KEYS to migrate)

## Overview

- **Priority:** P1 (largest user-facing wedge — Grade 4 dashboard fully unlocked)
- **Status:** pending
- **Description:** Build 10 small, mostly arithmetic-shaped generators. All produce `numeric` answer (one MC). Easiest tier — fast wins.

## Key Insights

- All 10 are pure RNG + arithmetic; no schema changes, no new utilities required
- Vietnamese number formatting uses **non-breaking thin-space thousands separator** (e.g. `12 345`, not `12,345` and not `12.345` — comma reserved for decimal). Use plain space for KISS; matches `add-sub-100k-carry` exemplar (no separator at all). **Decision:** keep no thousand separator in problemText (matches existing live generators) — reduce ambiguity.
- `even-odd` is the only `multiple-choice` skill in this tier — must populate `choices` field
- `rounding` is potentially confusable with G5 `decimal-rounding` (Phase 02). Boundary: this skill rounds **integers**; decimal-rounding handles `1,234` → `1,2`.
- `multiply-divide-powers-10` overlap with `decimal-powers-10` (Phase 02). Boundary: this is **integer** × ÷ {10, 100, 1000}; decimal-powers-10 handles decimals × ÷ {10, 100, 0.1, 0.01}. Document at top-of-file comment.

## Requirements

### Functional

For each generator: `Generator<T>` interface (`generate` + `validate`). Three difficulty bands. Deterministic per seed. Vietnamese problemText.

### Non-functional

- File ≤200 lines, kebab-case, `import "server-only"`
- Test ≥95% line coverage on the file (matches add-sub-100k-carry baseline)
- No external deps (only `seeded-rng`, `normalize/numeric`, `types`)

## Architecture

### Data Flow (per generator)

```
GeneratorParams { seed, difficulty, skillKey }
  → makeRng(seed)
  → numeric construction (per skill)
  → Question { problemText (vi), expectedAnswer, answerFormat, metadata }
```

### File Layout

```
src/lib/generators/
├── number-sense/                       (NEW directory)
│   ├── numbers-to-100k.ts
│   ├── even-odd.ts
│   ├── 6-digit-numbers.ts
│   ├── place-value-6digit.ts
│   └── rounding.ts
└── arithmetic/                         (existing)
    ├── add-large-numbers.ts            (NEW)
    ├── sub-large-numbers.ts            (NEW)
    ├── multiply-1-digit.ts             (NEW)
    ├── divide-1-digit.ts               (NEW)
    └── multiply-divide-powers-10.ts    (NEW)
```

Tests mirror layout: `tests/unit/generators/{number-sense,arithmetic}/*.test.ts`.

## Generator Specs (10 total)

### G1.1 — `numbers-to-100k`

- **Skill key:** `g4-numbers-to-100k` | **answerFormat:** NUMERIC | **time:** 45s
- **Task:** Show number in words, ask for digits (or vice versa).
- **D1:** 3-4 digit numbers (100–9 999). **D2:** 5 digit (10 000–99 999). **D3:** exactly 100 000 boundary + edge cases (10 000, 50 000).
- **problemText:** `"Số 'mười hai nghìn ba trăm bốn mươi lăm' viết là ?"` (Vietnamese number-to-words)
- **expectedAnswer:** integer
- **Helper needed:** `numberToVietnameseWords(n: number): string` — small lookup table for 0-9, đơn vị, mươi/chục, trăm, nghìn. Co-locate in this file (under 200 lines), or extract `src/lib/generators/number-sense/vn-number-words.ts` if reused.
- **Risk:** Vietnamese number words have edge cases (linh, lẻ, mốt, lăm). Keep coverage simple: skip "mốt"/"lăm" variations in D1/D2 by avoiding numbers ending in 1 or 5 in tens position. Document in code comment.

### G1.2 — `even-odd`

- **Skill key:** `g4-even-odd` | **answerFormat:** MULTIPLE_CHOICE | **time:** 30s
- **Task:** Classify number as even or odd.
- **D1:** 1-2 digits. **D2:** 3-4 digits. **D3:** 5-6 digits.
- **problemText:** `"Số 1 234 là số chẵn hay số lẻ?"`
- **choices:** `["Số chẵn", "Số lẻ"]`
- **expectedAnswer:** the chosen string (must match exactly one of `choices`)
- **validate:** case-insensitive trim equality against expectedAnswer

### G1.3 — `6-digit-numbers`

- **Skill key:** `g4-6-digit-numbers` | **answerFormat:** NUMERIC | **time:** 45s
- **Task:** Read/write 6-digit numbers.
- **D1:** 100 000–199 999 (lead digit 1). **D2:** 100 000–999 999. **D3:** include zeros in middle positions (e.g. 405 020).
- **problemText:** alternating two prompts (rng.bool):
  - `"Viết số: bốn trăm linh năm nghìn không trăm hai mươi"` → expect 405 020
  - `"Đọc số: 234 567"` → use as MC? **Decision:** to avoid MC complexity in NUMERIC skill, always use "Viết số: <words>" prompt → student types digits. Keep deterministic.

### G1.4 — `place-value-6digit`

- **Skill key:** `g4-place-value-6digit` | **answerFormat:** NUMERIC | **time:** 45s
- **Task:** Identify place value of a digit.
- **D1:** asks "trăm" / "nghìn" / "chục nghìn" with 5-digit numbers. **D2:** 6-digit, includes "trăm nghìn". **D3:** mixed; ask "giá trị của chữ số X trong số Y" (= digit × place).
- **problemText:** `"Trong số 234 567, chữ số 5 có giá trị là ?"` → expect 500
- **expectedAnswer:** the place-value contribution (digit × 10^position)

### G1.5 — `rounding`

- **Skill key:** `g4-rounding` | **answerFormat:** NUMERIC | **time:** 45s
- **Task:** Round integer to given place.
- **D1:** round to nearest 10 (numbers 10–999). **D2:** to nearest 100 (100–9 999). **D3:** to nearest 1 000 (1 000–99 999).
- **problemText:** `"Làm tròn số 4 567 đến hàng trăm: ?"`
- **expectedAnswer:** rounded integer (`Math.round(n / k) * k`)
- **Edge case:** ties (4 550 → 4 600 with round-half-up). JS `Math.round(4.5)=5` ✓ ; verify in test for `n=15`, `k=10`.

### G1.6 — `add-large-numbers`

- **Skill key:** `g4-add-large-numbers` | **answerFormat:** NUMERIC | **time:** 60s
- **Task:** Addition of large operands. Extends `add-sub-100k-carry` to bigger range.
- **D1:** 5-digit + 5-digit. **D2:** 6-digit + 6-digit. **D3:** 7-digit + 5-digit (mismatched widths) — encourages column alignment.
- **problemText:** `"123 456 + 234 567 = ?"`
- **No carry enforcement** — random carries naturally; skill is positional addition, not carry detection.

### G1.7 — `sub-large-numbers`

- **Skill key:** `g4-sub-large-numbers` | **answerFormat:** NUMERIC | **time:** 60s
- **Task:** Subtraction of large operands. Always `a ≥ b` (no negatives at G4).
- **D1:** 5-digit − 5-digit. **D2:** 6-digit − 6-digit. **D3:** 7-digit − 6-digit, force borrow ≥1 column (similar pattern to `hasBorrow` in add-sub-100k-carry).

### G1.8 — `multiply-1-digit`

- **Skill key:** `g4-multiply-1-digit` | **answerFormat:** NUMERIC | **time:** 60s
- **Task:** multi-digit × 1-digit.
- **D1:** 2-digit × 1-digit (overlap w/ existing `multiply-2-digit` D1; OK because skill nameVi is "Nhân số có nhiều chữ số với số có 1 chữ số" — focus on positional multiplication). **D2:** 3-digit × 1-digit. **D3:** 4-digit × 1-digit.
- Constraint: 1-digit factor in [2,9] (avoid 0/1 trivial cases).

### G1.9 — `divide-1-digit`

- **Skill key:** `g4-divide-1-digit` | **answerFormat:** NUMERIC | **time:** 60s
- **Task:** multi-digit ÷ 1-digit. Use existing strategy: pick quotient + divisor, compute dividend.
- **D1:** 2-digit ÷ 1-digit, exact. **D2:** 3-digit ÷ 1-digit, exact. **D3:** 4-digit ÷ 1-digit **with remainder** — answer string format: `"<quotient> dư <remainder>"`. **Decision:** D3 stays NUMERIC; expectedAnswer = quotient (integer division), validate accepts `"123"` OR `"123 dư 4"`. Implement parser: extract quotient before `dư`. Document in file header.
- **Risk:** "dư" parsing ambiguity. Mitigation: regex `/^(\d+)(?:\s*dư\s*(\d+))?$/` — accept either form, validate quotient+remainder both match if remainder provided.

### G1.10 — `multiply-divide-powers-10`

- **Skill key:** `g4-multiply-divide-powers-10` | **answerFormat:** NUMERIC | **time:** 30s
- **Task:** integer × or ÷ by 10/100/1000.
- **D1:** × 10 or × 100, base in [2,99]. **D2:** × 1000 or ÷ 10, base in [10,9 999], exact division. **D3:** mixed × ÷ {10,100,1000}, base in [100,99 999], exact.
- **Boundary vs `decimal-powers-10` (Phase 02):** integer-only here. document at top of file.

## Related Code Files

### To create (10 src + 10 tests = 20 files)

```
src/lib/generators/number-sense/numbers-to-100k.ts
src/lib/generators/number-sense/even-odd.ts
src/lib/generators/number-sense/6-digit-numbers.ts
src/lib/generators/number-sense/place-value-6digit.ts
src/lib/generators/number-sense/rounding.ts
src/lib/generators/arithmetic/add-large-numbers.ts
src/lib/generators/arithmetic/sub-large-numbers.ts
src/lib/generators/arithmetic/multiply-1-digit.ts
src/lib/generators/arithmetic/divide-1-digit.ts
src/lib/generators/arithmetic/multiply-divide-powers-10.ts

tests/unit/generators/number-sense/numbers-to-100k.test.ts
tests/unit/generators/number-sense/even-odd.test.ts
tests/unit/generators/number-sense/6-digit-numbers.test.ts
tests/unit/generators/number-sense/place-value-6digit.test.ts
tests/unit/generators/number-sense/rounding.test.ts
tests/unit/generators/arithmetic/add-large-numbers.test.ts
tests/unit/generators/arithmetic/sub-large-numbers.test.ts
tests/unit/generators/arithmetic/multiply-1-digit.test.ts
tests/unit/generators/arithmetic/divide-1-digit.test.ts
tests/unit/generators/arithmetic/multiply-divide-powers-10.test.ts
```

### To modify

- `src/lib/generators/registry.ts` — for each new generator: add import, add to `liveGenerators` map, REMOVE from `STUB_KEYS` array. (10 keys to remove from STUB_KEYS lines 52-61.)

### To delete

None.

## Implementation Steps

1. Create `src/lib/generators/number-sense/` directory.
2. For each of the 10 generators:
   1. Copy `add-sub-100k-carry.ts` as template into new file path.
   2. Replace `Generator` body with skill-specific spec above.
   3. Write Vietnamese problemText (verify diacritics).
   4. Implement `validate` reusing `parseNumeric` (or custom for `divide-1-digit` D3 / `even-odd` MC).
   5. Run `pnpm typecheck` (file isolated; no registry change yet — file will lint clean alone).
3. After all 10 generator files compile:
   1. Update `src/lib/generators/registry.ts`:
      - Add 10 imports
      - Add 10 entries to `liveGenerators`
      - Remove 10 entries from `STUB_KEYS`
   2. Run `pnpm typecheck && pnpm lint`.
4. Copy `add-sub-100k-carry.test.ts` as template; create 10 test files following pattern:
   - `determinism` block (3 cases × difficulty)
   - `validation correctness` (correct, incorrect, garbage)
   - `difficulty constraints` (range invariants per D level — assert via regex on problemText)
   - `answer format` (assert format string + metadata fields)
5. Run `pnpm test:unit` — fix failures.
6. Run `pnpm test:cov` — ensure ≥90% on `src/lib/generators/`.

## Todo List

- [ ] Create `src/lib/generators/number-sense/` dir
- [ ] G1.1 numbers-to-100k.ts + test
- [ ] G1.2 even-odd.ts + test
- [ ] G1.3 6-digit-numbers.ts + test
- [ ] G1.4 place-value-6digit.ts + test
- [ ] G1.5 rounding.ts + test
- [ ] G1.6 add-large-numbers.ts + test
- [ ] G1.7 sub-large-numbers.ts + test
- [ ] G1.8 multiply-1-digit.ts + test
- [ ] G1.9 divide-1-digit.ts + test (with `dư` parser)
- [ ] G1.10 multiply-divide-powers-10.ts + test
- [ ] Update registry.ts (10 imports, 10 live entries, 10 STUB_KEYS removals)
- [ ] `pnpm typecheck && pnpm lint && pnpm test:unit` all green
- [ ] Coverage ≥90% on src/lib/generators/

## Success Criteria

- All 10 generators resolve from `getGenerator(key)` to live impl (not stub)
- 10 STUB_KEYS entries removed (lines 52-61 in registry.ts)
- All 10 unit-test files pass
- For each generator: same seed × same difficulty → identical Question (determinism)
- For each generator: range invariants enforced for D1/D2/D3 (verified by 20-iter loop in test)
- `pnpm test:cov` shows ≥90% on `src/lib/generators/`
- No regression in 161 existing tests

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Vietnamese number-words helper bugs (mốt/lăm/linh) | M × M | Avoid trigger digits in D1/D2 ranges; test asserts known words for fixed seeds |
| `divide-1-digit` D3 "dư" answer ambiguity | M × M | Regex parser; tests cover both `"123"` and `"123 dư 4"` paths |
| Range overflow on `add-large-numbers` D3 (7-digit + 5-digit ≥ 9 999 999 + 99 999 = JS-safe) | L × L | Max 16-digit safe; well under |
| Registry edits drift between phases (race) | L × M | Each phase removes only its own keys from STUB_KEYS — diff is non-overlapping |
| Confusion w/ existing `multiply-2-digit` (overlapping ranges) | L × L | Skill names differ; both can coexist as separate skills in DB |

## Security Considerations

- `import "server-only"` mandatory at top of each generator file (prevents `expectedAnswer` leak to client bundle)
- All generator files pure functions — no DB / fs / network access
- `validate()` must not return true for empty / NaN inputs — covered by existing `parseNumeric` returning `null`

## Next Steps

- Phase 02 (Tier 2) parallelizable — separate file paths, separate STUB_KEYS entries
- Phase 04 (composite reviews) consumes generators built here

## Locked Decisions (2026-04-25)

- **`numbers-to-100k` direction:** word → digit ONLY (NUMERIC). Vietnamese words prompt → student types digits. Confirmed by user.

## Unresolved Questions

- `place-value-6digit` D3: should it ask "tổng giá trị các chữ số" (sum of place values) for variation? Current plan: single-digit query only — keeps NUMERIC clean. Defer enhancement.
