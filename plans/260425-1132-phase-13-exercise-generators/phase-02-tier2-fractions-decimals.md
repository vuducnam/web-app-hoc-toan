# Phase 02 — Tier 2: Fractions + Decimals Extensions (Grade 5)

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md` §"Phase 13 Content Roadmap" Tier 2
- Curriculum source: `prisma/seed-data/grade-5.ts:25-105, 130-195` and `grade-4.ts:393-450, 487-520` (fraction skills)
- Exemplar fraction generator: `src/lib/generators/fractions/fraction-add.ts:1-69`
- Exemplar decimal generator: `src/lib/generators/decimals/decimal-add.ts:1-53` and `decimal-multiply.ts`
- Fraction normalize: `src/lib/generators/normalize/fraction.ts:1-50`
- Decimal normalize: `src/lib/generators/normalize/decimal.ts:1-46`
- Registry: `src/lib/generators/registry.ts:28-84` (12 STUB_KEYS to migrate)

## Overview

- **Priority:** P1 (unlocks Grade 5 dashboard fully — currently 0 G5 advanced skills work)
- **Status:** pending
- **Description:** Build 12 generators across fractions and decimals. Includes 6 reclassified keys (already in `STUB_KEYS` since Phase 03; now promote to live).

## Reclassified vs New

| # | Generator | Source |
|---|---|---|
| Reclassified (currently STUB_KEYS lines 38-43) | `fraction-multiply`, `fraction-divide`, `fraction-compare`, `decimal-subtract`, `decimal-divide`, `decimal-compare` | Old Phase 03 stubs |
| New (currently STUB_KEYS lines 65-72) | `fraction-concept`, `decimal-concept`, `decimal-rounding`, `decimal-powers-10`, `natural-numbers-review`, `fractions-review` | Phase 12.5 catch-all |

Total: **12 live by phase end**.

## Key Insights

- All 6 reclassified stubs are **real production work** — they were never live, just declared in registry. No prior implementation to reference except sibling generators.
- `fraction-concept` & `decimal-concept` may want visual representation (bar/circle for fractions, place-value table for decimals). **Decision (KISS):** text-only prompts in this phase. Visual upgrade tracked in Phase 15. See "Risks".
- `natural-numbers-review` and `fractions-review` are **lightweight composite generators** — pull a sub-generator deterministically based on seed, delegate. Pattern shared with Phase 04 (Tier 4) but smaller scope (single-cluster review).
- Vietnamese decimal convention: comma `,` as separator (e.g. `3,5`); existing `normalize/decimal.ts` already handles both `,` and `.`.

## Requirements

### Functional

12 `Generator` implementations + 12 unit-test files. Determinism + validation + range invariants. answerFormat per seed (FRACTION, DECIMAL, NUMERIC, MULTIPLE_CHOICE).

### Non-functional

- File ≤200 lines
- `import "server-only"`
- `parseFraction` / `parseVnDecimal` reuse — no new normalize utilities unless absolutely needed

## Architecture

### File Layout

```
src/lib/generators/
├── fractions/
│   ├── fraction-multiply.ts            (NEW)
│   ├── fraction-divide.ts              (NEW)
│   ├── fraction-compare.ts             (NEW)
│   ├── fraction-concept.ts             (NEW)
│   └── fractions-review.ts             (NEW — composite within fractions)
├── decimals/
│   ├── decimal-subtract.ts             (NEW)
│   ├── decimal-divide.ts               (NEW)
│   ├── decimal-compare.ts              (NEW)
│   ├── decimal-concept.ts              (NEW)
│   ├── decimal-rounding.ts             (NEW)
│   └── decimal-powers-10.ts            (NEW)
└── number-sense/
    └── natural-numbers-review.ts       (NEW — composite within G4 number sense)
```

## Generator Specs (12 total)

### G2.1 — `fraction-multiply` (reclassified)

- **answerFormat:** FRACTION | **time:** 60s
- **Task:** Multiply two fractions.
- **D1:** both proper (n<d), den ≤ 8. **D2:** den ≤ 15, may need simplification. **D3:** mixed numbers / improper × proper, den ≤ 12.
- **Algorithm:** `(n1*n2)/(d1*d2)` then `simplify`.
- **problemText (KaTeX):** `"\\frac{2}{3} × \\frac{4}{5} = ?"`
- **expectedAnswer:** `Fraction` (simplified)
- **validate:** `equivalent(parsed, expected)`

### G2.2 — `fraction-divide` (reclassified)

- **answerFormat:** FRACTION | **time:** 60s
- **Task:** Divide two fractions (multiply by reciprocal).
- Difficulty bands mirror G2.1.
- **problemText:** `"\\frac{2}{3} ÷ \\frac{4}{5} = ?"`
- **Edge case:** dividend with num=0 disallowed; ensure rng.int(1, d-1) for n2 to keep reciprocal valid.

### G2.3 — `fraction-compare` (reclassified)

- **answerFormat:** MULTIPLE_CHOICE | **time:** 60s
- **Task:** Compare two fractions; pick `<`, `>`, or `=`.
- **D1:** same denominator (numeric compare on numerators). **D2:** unlike denominators ≤ 12 (cross-multiply). **D3:** include `=` case (equivalent fractions like 2/4 vs 1/2) + unlike den ≤ 20.
- **problemText:** `"So sánh: \\frac{2}{3} ___ \\frac{3}{5}"` (or `"\\frac{2}{3} ? \\frac{3}{5}"`)
- **choices:** `["<", "=", ">"]`
- **expectedAnswer:** the chosen string
- **validate:** trim equality

### G2.4 — `fraction-concept` (new)

- **answerFormat:** FRACTION | **time:** 45s
- **Task:** Convert division expression to fraction.
- **D1:** prompt `"3 : 5"` → expect `\frac{3}{5}` (typed `3/5`). Whole-number divisions only.
- **D2:** prompt `"7 : 4"` → improper fraction `7/4`.
- **D3:** prompt `"Một cái bánh chia đều cho 4 người, mỗi người được mấy phần?"` → `1/4`. (Single fixed wording template; numbers vary.)
- **expectedAnswer:** Fraction (not necessarily simplified — accept either form via `equivalent`)
- **No visual** in this phase. Document deferral.

### G2.5 — `fractions-review` (new, composite)

- **answerFormat:** FRACTION | **time:** 60s
- **Task:** Random pull from {`simplify-fraction`, `fraction-add`, `fraction-subtract`, `fraction-multiply`, `fraction-divide`} based on seed.
- **Pattern:**
  ```ts
  const subGenerators = [...] as const;
  const choice = rng.pick(subGenerators);
  return choice.generate({ seed: `${seed}-sub`, difficulty, skillKey });
  ```
- Critical: derive sub-seed deterministically from input seed; record `metadata.composedFrom: <subSkillKey>` for debug.
- **Risk:** circular import if review depends on `registry.ts`. Mitigation: import sub-generators directly (not through registry).

### G2.6 — `decimal-subtract` (reclassified)

- **answerFormat:** DECIMAL | **time:** 60s
- **Task:** mirror of `decimal-add.ts` (constants flipped to subtraction).
- **D1:** 1 dp. **D2:** 2 dp. **D3:** 3 dp. Always `a ≥ b`.
- **problemText:** `"3,5 − 1,2 = ?"`

### G2.7 — `decimal-divide` (reclassified)

- **answerFormat:** DECIMAL | **time:** 90s
- **Task:** Decimal ÷ integer (D1) or decimal ÷ decimal (D2/D3).
- **D1:** decimal ÷ small natural ([2,9]), exact (no rounding).
- **D2:** decimal ÷ decimal, 1 dp result.
- **D3:** decimal ÷ decimal, 2 dp result.
- Strategy: pick quotient + divisor first, compute dividend = q × divisor (mirrors `divide-2-digit.ts`). Avoids floating-point divergence.
- **Tolerance:** existing `equalsWithTolerance(0.01)` adequate.

### G2.8 — `decimal-compare` (reclassified)

- **answerFormat:** MULTIPLE_CHOICE | **time:** 45s
- **Task:** Compare two decimals.
- **D1:** same dp count. **D2:** different dp count (test recognising `0,5 = 0,50`). **D3:** include `=` boundary + 3 dp.
- **choices:** `["<", "=", ">"]`

### G2.9 — `decimal-concept` (new)

- **answerFormat:** DECIMAL | **time:** 45s
- **Task:** Convert mixed prompt to decimal.
- **D1:** `"5/10 = ?"` → `0,5` (fraction-with-power-of-10 → decimal)
- **D2:** `"3/100 = ?"` → `0,03`
- **D3:** mixed forms `"2 và 3/10 = ?"` → `2,3`
- **expectedAnswer:** number; validate via `parseVnDecimal` + `equalsWithTolerance`

### G2.10 — `decimal-rounding` (new)

- **answerFormat:** DECIMAL | **time:** 45s
- **Task:** Round decimal to specified place.
- **D1:** round to nearest integer (1 dp source). **D2:** to 1 dp (2 dp source). **D3:** to 2 dp (3 dp source).
- **problemText:** `"Làm tròn 4,567 đến hàng phần mười: ?"`
- **expectedAnswer:** rounded number (use `Math.round(n * 10^k) / 10^k`)

### G2.11 — `decimal-powers-10` (new)

- **answerFormat:** DECIMAL | **time:** 30s
- **Task:** Decimal × or ÷ {10, 100, 0,1, 0,01}.
- **D1:** × 10 or × 100 with 1-2 dp source. **D2:** ÷ 10 or ÷ 100. **D3:** include × 0,1 / × 0,01 (= ÷ 10/100 alt notation) + ÷ 1000.
- **Boundary vs Phase 01 `multiply-divide-powers-10`:** documented in file header — that handles integers.

### G2.12 — `natural-numbers-review` (new, composite)

- **answerFormat:** NUMERIC | **time:** 60s
- **Task:** Pull random from {`numbers-to-100k`, `6-digit-numbers`, `place-value-6digit`, `rounding`, `add-large-numbers`, `sub-large-numbers`, `multiply-1-digit`, `divide-1-digit`} (Phase 01 outputs).
- **Pattern:** identical to G2.5; weight: uniform; same difficulty as input.
- **Dependency:** Phase 01 must be merged before this generator can compile (imports from `number-sense/` + `arithmetic/`). Sequencing addressed in plan.md.

## Related Code Files

### To create (12 src + 12 tests = 24 files)

```
src/lib/generators/fractions/fraction-multiply.ts
src/lib/generators/fractions/fraction-divide.ts
src/lib/generators/fractions/fraction-compare.ts
src/lib/generators/fractions/fraction-concept.ts
src/lib/generators/fractions/fractions-review.ts
src/lib/generators/decimals/decimal-subtract.ts
src/lib/generators/decimals/decimal-divide.ts
src/lib/generators/decimals/decimal-compare.ts
src/lib/generators/decimals/decimal-concept.ts
src/lib/generators/decimals/decimal-rounding.ts
src/lib/generators/decimals/decimal-powers-10.ts
src/lib/generators/number-sense/natural-numbers-review.ts

tests/unit/generators/fractions/fraction-multiply.test.ts
tests/unit/generators/fractions/fraction-divide.test.ts
tests/unit/generators/fractions/fraction-compare.test.ts
tests/unit/generators/fractions/fraction-concept.test.ts
tests/unit/generators/fractions/fractions-review.test.ts
tests/unit/generators/decimals/decimal-subtract.test.ts
tests/unit/generators/decimals/decimal-divide.test.ts
tests/unit/generators/decimals/decimal-compare.test.ts
tests/unit/generators/decimals/decimal-concept.test.ts
tests/unit/generators/decimals/decimal-rounding.test.ts
tests/unit/generators/decimals/decimal-powers-10.test.ts
tests/unit/generators/number-sense/natural-numbers-review.test.ts
```

### To modify

- `src/lib/generators/registry.ts`:
  - Add 12 imports
  - Add 12 entries to `liveGenerators`
  - Remove 12 keys from STUB_KEYS (lines 38-43, 65-67, 70-72)

### To delete

None.

## Implementation Steps

1. Implement G2.1–G2.4 (fractions excluding review): pure logic, no cross-deps.
2. Implement G2.6–G2.11 (decimals excluding concept-edge): pure logic.
3. Implement G2.5 (`fractions-review`) — depends on G2.1, G2.2, G2.3 + existing `fraction-add`, `fraction-subtract`, `simplify-fraction` (already live).
4. Implement G2.12 (`natural-numbers-review`) — **must wait for Phase 01 merge** OR import lazily at generate() time (no, must import at module load for type safety). Sequencing: complete Phase 01 before G2.12.
5. Update `registry.ts` (12 entries; 12 STUB_KEYS removals).
6. Write tests; run `pnpm test:unit && pnpm test:cov`.

## Todo List

- [ ] G2.1 fraction-multiply.ts + test
- [ ] G2.2 fraction-divide.ts + test
- [ ] G2.3 fraction-compare.ts + test
- [ ] G2.4 fraction-concept.ts + test
- [ ] G2.6 decimal-subtract.ts + test
- [ ] G2.7 decimal-divide.ts + test
- [ ] G2.8 decimal-compare.ts + test
- [ ] G2.9 decimal-concept.ts + test
- [ ] G2.10 decimal-rounding.ts + test
- [ ] G2.11 decimal-powers-10.ts + test
- [ ] G2.5 fractions-review.ts + test (after 2.1–2.3)
- [ ] G2.12 natural-numbers-review.ts + test (after Phase 01)
- [ ] Update registry.ts (12 imports + entries; 12 STUB_KEYS removals)
- [ ] `pnpm typecheck && pnpm lint && pnpm test:unit` green
- [ ] Coverage ≥90% on src/lib/generators/

## Success Criteria

- 12 STUB_KEYS entries removed (lines 38-43 + 65-67 + 70-72 in registry.ts)
- All 12 generator+test files pass
- Composite generators (`fractions-review`, `natural-numbers-review`) deterministic — same seed produces same sub-pick + same sub-question
- For multiple-choice (compare skills), `choices` always populated, `expectedAnswer` ∈ `choices`
- No regressions

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| `fraction-concept` / `decimal-concept` text-only feels weak vs textbook (uses pictures) | M × L | Document deferral in code header; track Phase 15 visual upgrade |
| Composite generators cause circular imports if they go through `registry.ts` | M × M | Import sub-generators DIRECTLY by path; never import registry |
| `fraction-divide` answer = num/0 edge | L × H | rng.int(1, d2-1) ensures n2 > 0 |
| `decimal-divide` floating-point drift | M × M | Quotient-first construction (mirror existing divide-2-digit pattern); `equalsWithTolerance` |
| `=` choice in compare skills never triggers due to RNG | M × L | D3 explicitly seeds equivalent pairs (e.g. `(2,4) → 1/2 = 2/4`) |
| Phase 01 not done when G2.12 implemented | H × H | Sequencing: G2.12 last; or stub imports until Phase 01 merges |

## Security Considerations

- `import "server-only"` mandatory
- `validate` on MC: trim + exact match (case-insensitive optional). Reject empty.
- Composite generators must NOT call `getGenerator` at runtime — direct imports only (no registry lookup loop)

## Next Steps

- Phase 04 reuses these generators for cross-tier reviews
- Phase 15 considers visual upgrades for `fraction-concept` / `decimal-concept`

## Locked Decisions (2026-04-25)

- **`fraction-concept` & `decimal-concept`:** text-only for MVP. Visual representations (bar/circle/place-value table) deferred to Phase 15. Confirmed by user.

## Unresolved Questions

- `fraction-concept` D3 word-problem template: stick with single template or add 2–3 variations? Current plan: single template — KISS.
- Should compare generators offer 2-choice or 3-choice (`<`, `>` only vs `<`, `=`, `>`)? Current plan: 3-choice for instructional value (textbook teaches all 3 cases). Re-evaluate post-launch if students confused.
- `natural-numbers-review` weighting: should harder skills (multi-digit divide) appear less often at D1? Current plan: uniform — KISS. Iterate after telemetry.
