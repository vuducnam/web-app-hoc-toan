# Phase 03 — Tier 3: Geometry + Measurement

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md` §"Phase 13 Content Roadmap" Tier 3
- Curriculum source:
  - `prisma/seed-data/grade-4.ts:140-185` (length, mass, capacity)
  - `prisma/seed-data/grade-5.ts:107-126, 313-345, 380-413` (area, volume, time)
- Exemplar: `src/lib/generators/arithmetic/add-sub-100k-carry.ts` (template)
- Numeric parser: `src/lib/generators/normalize/numeric.ts:1-16`
- Decimal parser: `src/lib/generators/normalize/decimal.ts:1-46`
- Registry: `src/lib/generators/registry.ts` (7 STUB_KEYS to migrate: lines 63-65, 75-78)

## Overview

- **Priority:** P2 (smaller user-facing wedge than Tiers 1/2; unblocks measurement & geometry topics)
- **Status:** pending
- **Description:** Build 7 generators for unit conversion + volume formula. Mostly table-driven; deterministic.

## Key Insights

- All 5 conversion skills follow IDENTICAL shape: pick from-unit, pick to-unit, pick value, multiply by ratio. Suggest **one shared helper** but **separate generator files** (DRY through helper, file ownership preserved).
- `rectangular-prism-volume` is formula-application only: V = a·b·c. Trivial.
- `time-measurement` is time-arithmetic, not unit-conversion (mostly): operands like "2 giờ 15 phút + 1 giờ 50 phút". Complex problemText; needs custom parser/format.
- All conversion generators answer in NUMERIC (integer ratio multiplications); volume answers NUMERIC; time answers NUMERIC (minutes or seconds, not "2h15m" string).

## Requirements

### Functional

7 generators + 7 unit-test files. NUMERIC answer format. D1/D2/D3 difficulty bands.

### Non-functional

- File ≤200 lines
- Shared helper at `src/lib/generators/measurement/unit-conversion-helper.ts` (allowed — DRY across 5 conversion gens)
- `import "server-only"`

## Architecture

### Shared Helper

```ts
// src/lib/generators/measurement/unit-conversion-helper.ts
export interface UnitTable {
  /** ordered largest → smallest, ratios relative to base unit */
  units: Array<{ name: string; ratio: number }>;
}

export function generateConversion(
  rng: SeededRng,
  table: UnitTable,
  difficulty: 1 | 2 | 3,
  promptVerb: string  // e.g. "Đổi"
): { problemText: string; expectedAnswer: number; from: string; to: string; value: number };
```

D1: adjacent units only, value ∈ [1,10]. D2: skip 1 unit, value ∈ [1,99]. D3: any pair, value ∈ [1,999].

### File Layout

```
src/lib/generators/measurement/                 (NEW directory)
├── unit-conversion-helper.ts                   (shared helper)
├── length-conversion.ts                        (NEW)
├── mass-conversion.ts                          (NEW)
├── capacity-conversion.ts                      (NEW)
├── area-unit-conversion.ts                     (NEW)
├── volume-units.ts                             (NEW)
├── rectangular-prism-volume.ts                 (NEW)
└── time-measurement.ts                         (NEW — does NOT use helper)
```

## Generator Specs (7 total)

### G3.1 — `length-conversion`

- **Skill key:** `g4-length-conversion` | **answerFormat:** NUMERIC | **time:** 60s
- **Units:** `[{ "km", 1_000_000 }, { "m", 1000 }, { "dm", 100 }, { "cm", 10 }, { "mm", 1 }]` (base = mm)
- **D1:** adjacent (m↔cm, cm↔mm), value 1-10. **D2:** skip-1 (km↔m, m↔mm), value 1-99. **D3:** any pair + reverse direction, value 1-999.
- **problemText:** `"Đổi: 5 m = ? cm"` → expectedAnswer 500
- Edge: avoid generating fractional results (only large→small in D1/D2; D3 may go small→large only when divisible).

### G3.2 — `mass-conversion`

- **Skill key:** `g4-mass-conversion` | **answerFormat:** NUMERIC | **time:** 60s
- **Units:** `[{ "tấn", 1_000_000 }, { "tạ", 100_000 }, { "yến", 10_000 }, { "kg", 1000 }, { "hg", 100 }, { "dag", 10 }, { "g", 1 }]`
- **D1:** kg↔g, tấn↔kg adjacent. **D2:** skip 1-2 levels. **D3:** any pair.
- **problemText:** `"Đổi: 3 tấn = ? kg"` → 3000

### G3.3 — `capacity-conversion`

- **Skill key:** `g4-capacity-conversion` | **answerFormat:** NUMERIC | **time:** 60s
- **Units:** `[{ "l", 1000 }, { "ml", 1 }]` only 2 units in Vietnamese G4 curriculum.
- **D1:** value 1-10 l→ml. **D2:** value 100-9000 ml→l (must be multiple of 1000). **D3:** mixed direction + larger.
- **Note:** only 2 units → "skip" tiers don't apply. Use value-magnitude bands instead.

### G3.4 — `area-unit-conversion`

- **Skill key:** `g5-area-unit-conversion` | **answerFormat:** NUMERIC | **time:** 60s
- **Units:** `[{ "km²", 1_000_000 }, { "ha", 10_000 }, { "dam²"=a, 100 }, { "m²", 1 }]` (Vietnamese curriculum often uses `ha` and `km²`).
- **D1:** ha↔m² adjacent, value 1-10. **D2:** km²↔ha. **D3:** km²↔m² (factor 1 000 000).
- **problemText:** `"Đổi: 2 km² = ? ha"` → 200
- **Note:** dm², cm² not in primary curriculum focus; can skip.

### G3.5 — `volume-units`

- **Skill key:** `g5-volume-units` | **answerFormat:** NUMERIC | **time:** 45s
- **Units:** `[{ "m³", 1_000_000 }, { "dm³", 1000 }, { "cm³", 1 }]`. (Note: 1 dm³ = 1 l, but treat as separate cluster.)
- **D1:** dm³↔cm³ adjacent. **D2:** m³↔dm³. **D3:** m³↔cm³ (factor 1 000 000).
- **problemText:** `"Đổi: 5 dm³ = ? cm³"` → 5000

### G3.6 — `rectangular-prism-volume`

- **Skill key:** `g5-rectangular-prism-volume` | **answerFormat:** NUMERIC | **time:** 75s
- **Task:** V = a × b × c (cm³).
- **D1:** a,b,c ∈ [2,9]. **D2:** [5,15]. **D3:** [10,25].
- **problemText:** `"Tính thể tích hình hộp chữ nhật có chiều dài 5 cm, chiều rộng 3 cm, chiều cao 4 cm. V = ? cm³"`
- **expectedAnswer:** integer cm³.

### G3.7 — `time-measurement`

- **Skill key:** `g5-time-measurement` | **answerFormat:** NUMERIC | **time:** 60s
- **Task:** Time-unit conversion + simple time arithmetic.
- **D1:** giờ↔phút conversion (e.g. `"2 giờ = ? phút"` → 120, `"180 phút = ? giờ"` → 3 — only divisible cases)
- **D2:** phút↔giây conversion + ngày↔giờ. (`"5 phút 30 giây = ? giây"` → 330)
- **D3:** time arithmetic — sum or diff of two times, answer in minutes only:
  - `"1 giờ 45 phút + 2 giờ 30 phút = ? phút"` → 255
  - **Alternate format prompt avoided** (would conflict with NUMERIC). Stick to "answer in minutes" or "answer in seconds" depending on operands.
- **Risk:** problemText parsing complexity. Mitigation: top-of-file comment defines the 3 templates explicitly; tests assert template variants per difficulty.

## Related Code Files

### To create (8 src + 7 tests = 15 files)

```
src/lib/generators/measurement/unit-conversion-helper.ts
src/lib/generators/measurement/length-conversion.ts
src/lib/generators/measurement/mass-conversion.ts
src/lib/generators/measurement/capacity-conversion.ts
src/lib/generators/measurement/area-unit-conversion.ts
src/lib/generators/measurement/volume-units.ts
src/lib/generators/measurement/rectangular-prism-volume.ts
src/lib/generators/measurement/time-measurement.ts

tests/unit/generators/measurement/length-conversion.test.ts
tests/unit/generators/measurement/mass-conversion.test.ts
tests/unit/generators/measurement/capacity-conversion.test.ts
tests/unit/generators/measurement/area-unit-conversion.test.ts
tests/unit/generators/measurement/volume-units.test.ts
tests/unit/generators/measurement/rectangular-prism-volume.test.ts
tests/unit/generators/measurement/time-measurement.test.ts
```

(Helper not separately tested — exercised through 5 conversion-gen tests.)

### To modify

- `src/lib/generators/registry.ts`:
  - Add 7 imports
  - Add 7 entries to `liveGenerators`
  - Remove 7 keys from STUB_KEYS (lines 63-65, 75-78)
- **Optional cleanup:** lines 32-34 of registry.ts contain old aliases `convert-units-length`, `convert-units-mass`, `convert-units-time`. These are NOT in seed → safe to **delete** for hygiene. Track in Phase 05.

### To delete

None in this phase (alias cleanup deferred to Phase 05).

## Implementation Steps

1. Create `src/lib/generators/measurement/` directory.
2. Write `unit-conversion-helper.ts` first (shared logic).
3. Implement G3.1–G3.5 using helper (length, mass, capacity, area, volume-units).
4. Implement G3.6 (`rectangular-prism-volume`) — standalone, simple.
5. Implement G3.7 (`time-measurement`) — standalone, custom logic.
6. Update `registry.ts`.
7. Write 7 test files; ensure each generator's test asserts:
   - Determinism (same seed → same Q)
   - Range invariants (per D level)
   - Validation (correct, incorrect, garbage)
   - For conversions: every emitted answer is integer (no fractional artifacts)
8. `pnpm typecheck && pnpm lint && pnpm test:unit`.

## Todo List

- [ ] Create `src/lib/generators/measurement/` dir
- [ ] unit-conversion-helper.ts
- [ ] G3.1 length-conversion.ts + test
- [ ] G3.2 mass-conversion.ts + test
- [ ] G3.3 capacity-conversion.ts + test
- [ ] G3.4 area-unit-conversion.ts + test
- [ ] G3.5 volume-units.ts + test
- [ ] G3.6 rectangular-prism-volume.ts + test
- [ ] G3.7 time-measurement.ts + test (3 templates)
- [ ] Update registry.ts (7 imports/entries; 7 STUB_KEYS removals)
- [ ] `pnpm test:unit` green; coverage ≥90%

## Success Criteria

- 7 STUB_KEYS removed from registry
- 7 new live generators resolvable via `getGenerator(key)`
- All 7 test files pass
- For conversion gens: assertion that all 20 random samples per D level produce integer answers (no float artifacts)
- For `time-measurement` D3: assert problemText matches one of 2 templates per branch (sum/diff)

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Conversion gens emit non-integer answers (fractional) | M × M | Helper enforces value chosen as multiple of ratio for small→large; large→small always integer |
| Vietnamese unit name diacritics ("tạ", "tấn") wrong in source | L × M | Use exact strings from seed-data files; reviewer cross-checks |
| `time-measurement` ambiguous problemText | M × M | Explicit 3-template comment; tests pin templates to seeds |
| Helper grows beyond 200 lines | L × L | Move tables to per-file constants if so |
| `convert-units-{length,mass,time}` legacy aliases never removed | M × L | Phase 05 cleanup task |

## Security Considerations

- `import "server-only"` mandatory
- All values come from seeded RNG — no user input flows into problem construction
- `validate` reuses `parseNumeric` — rejects non-integer inputs

## Next Steps

- Phase 05 cleanup will remove legacy aliases `convert-units-length`, `convert-units-mass`, `convert-units-time` from STUB_KEYS
- Phase 14 may add area/volume word-problem variants via poolKey

## Unresolved Questions

- `time-measurement` answerFormat: NUMERIC or TEXT? Seed says NUMERIC. **Current plan:** NUMERIC, answer in unified unit (smallest of operands). Confirm acceptable for graders.
- Should `area-unit-conversion` include `dm²`, `cm²`? Curriculum focuses km²/ha/m². **Current plan:** skip dm²/cm² for KISS.
- Will `rectangular-prism-volume` ever need decimal sides? Seed says NUMERIC. **Current plan:** integer-only sides.
