# Phase 04 — Tier 4: Composite Reviews

## Context Links

- Plan: [plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260425-1113-exercise-generation-rootcause-and-roadmap.md` §"Phase 13 Content Roadmap" Tier 4
- Curriculum source:
  - `prisma/seed-data/grade-4.ts:262-275, 521-553` (semester1 + year reviews G4)
  - `prisma/seed-data/grade-5.ts:241-260, 437-456` (semester1 + year-comprehensive G5)
- Composite pattern reference (within phase): G2.5 `fractions-review`, G2.12 `natural-numbers-review` from Phase 02
- Registry: `src/lib/generators/registry.ts:79-84` (5 STUB_KEYS to migrate)

## Overview

- **Priority:** P2 (textbook review/recap skills — used as topic-end checkpoints)
- **Status:** pending — **BLOCKED until Phases 01, 02, 03 ship** (composite imports require sub-generators)
- **Description:** 5 composite generators that pull deterministically from sub-generators across previous tiers.

## Key Insights

- All 5 follow same pattern: `pick sub-generator(rng) → delegate generate()`. Only the **subset of sub-generators** differs.
- **Anti-pattern:** importing `registry.ts` would create circular import (registry imports composites → composites import registry). Mitigation: import sub-generators **directly by file path**.
- Difficulty pass-through: parent `difficulty` flows to sub-gen unchanged.
- Seed derivation: `subSeed = ${seed}-${subSkillKey}` ensures same parent seed always picks same sub + sub-question.
- `metadata.composedFrom` field — useful for telemetry / debug, but not in current `Question.metadata` shape. **Decision:** skip metadata change in this phase; debug-only via problemText prefix `"[composite] "` if needed (NO — clutters UX). Just trust determinism. Defer telemetry.

## Requirements

### Functional

5 composite generators delegating to existing live generators across tiers. answerFormat must match seed (varies per skill).

### Non-functional

- File ≤200 lines (will be small — mostly delegation)
- `import "server-only"`
- Direct file imports — no `getGenerator()` calls

## Architecture

### Shared Pattern

```ts
// src/lib/generators/reviews/<review-name>.ts
import "server-only";
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";
// Direct imports of sub-generators (NOT registry):
import { addSub100kCarry } from "../arithmetic/add-sub-100k-carry";
// ...

const SUB_GENERATORS = [...] as const;

export const <reviewName>: Generator = {
  generate(p: GeneratorParams): Question {
    const rng = makeRng(p.seed);
    const sub = rng.pick(SUB_GENERATORS);
    // Sub-seed: append sub key for deterministic isolation
    return sub.generate({ ...p, seed: `${p.seed}-${sub.key}` });
  },
  validate(userAnswer: string, q: Question): boolean {
    // Routing on q.skillKey/answerFormat to right sub.validate
    // OR: store sub.key inside q.metadata.composedFrom (requires types.ts extension)
    // Simpler approach: regenerate from seed, find which sub matches q.problemText, delegate.
    // Even simpler: q.skillKey is the SUB skill key — caller already routes correctly.
    // PROBLEM: practice flow uses skill.generatorKey from DB to pick generator;
    //   composite delegates with the SAME parent skillKey,
    //   so validate is called on PARENT generator (this file).
    // Solution: encode sub-key in problemText via prefix? Hacky.
    //
    // KISS solution: composite returns Question with skillKey=parent (so practice
    //   page renders nothing wrong), but expectedAnswer is the SUB's answer.
    //   validate() must independently re-derive which sub was used:
    //
    //   const rng = makeRng(seed);
    //   const sub = rng.pick(SUB_GENERATORS);
    //   return sub.validate(userAnswer, q);
    //
    // BUT validate doesn't get seed — only `q`. Add seed to q.metadata? Yes, already there: q.metadata.seed.
    const rng = makeRng(q.metadata.seed);
    const sub = rng.pick(SUB_GENERATORS);
    return sub.validate(userAnswer, q);
  },
};
```

**KEY DECISION (architectural):** validate replays seed to determine which sub was picked, then delegates. This is deterministic + safe. Document at file header.

### File Layout

```
src/lib/generators/reviews/                       (NEW directory)
├── semester1-review-arithmetic.ts                (NEW)
├── semester1-review-decimals.ts                  (NEW)
├── year-review-arithmetic.ts                     (NEW)
├── year-review-fractions.ts                      (NEW)
└── year-review-comprehensive.ts                  (NEW)
```

## Generator Specs (5 total)

### G4.1 — `semester1-review-arithmetic`

- **Skill key:** `g4-semester1-review-arithmetic` | **answerFormat:** NUMERIC | **time:** 90s
- **Sub-generators:** `add-sub-100k-carry`, `add-large-numbers`, `sub-large-numbers`, `numbers-to-100k`, `place-value-6digit`, `rounding`
- **Constraint:** all subs return NUMERIC ✓
- Pulls from G4 semester 1 arithmetic + number-sense topics.

### G4.2 — `semester1-review-decimals`

- **Skill key:** `g5-semester1-review` | **answerFormat:** DECIMAL | **time:** 90s
- **Sub-generators:** `decimal-add`, `decimal-subtract`, `decimal-multiply`, `decimal-divide`, `decimal-rounding`, `decimal-powers-10`
- **Constraint:** all subs return DECIMAL ✓
- Note: `decimal-compare` excluded (MULTIPLE_CHOICE — format mismatch).
- Note: `decimal-concept` excluded if its prompt format doesn't match a "review of operations" theme. **Decision:** include — fits "review of decimal" umbrella. Coordinator: confirm with PO.

### G4.3 — `year-review-arithmetic`

- **Skill key:** `g4-year-review-arithmetic` | **answerFormat:** NUMERIC | **time:** 90s
- **Sub-generators:** all NUMERIC G4 arithmetic + number-sense:
  - `add-sub-100k-carry`, `add-large-numbers`, `sub-large-numbers`
  - `multiply-1-digit`, `multiply-2-digit`, `divide-1-digit`, `divide-2-digit`
  - `multiply-divide-powers-10`
  - `numbers-to-100k`, `place-value-6digit`, `rounding`
- Broader than G4.1.

### G4.4 — `year-review-fractions`

- **Skill key:** `g4-year-review-fractions` | **answerFormat:** FRACTION | **time:** 90s
- **Sub-generators:** all FRACTION generators:
  - `simplify-fraction`, `fraction-common-denominator`
  - `fraction-add`, `fraction-subtract`
  - `fraction-multiply`, `fraction-divide`
  - `fraction-concept`
- Note: `fraction-compare` excluded (MULTIPLE_CHOICE).

### G4.5 — `year-review-comprehensive`

- **Skill key:** `g5-year-review-comprehensive` | **answerFormat:** NUMERIC | **time:** 90s
- **Sub-generators (NUMERIC only — strict format):**
  - all G4.3 subs
  - `length-conversion`, `mass-conversion`, `capacity-conversion`, `area-unit-conversion`, `volume-units`
  - `rectangular-prism-volume`, `time-measurement`
- **Constraint:** ALL subs MUST emit NUMERIC. Fraction/decimal/MC sub-generators EXCLUDED.
- Largest pool — most variety.

## Related Code Files

### To create (5 src + 5 tests = 10 files)

```
src/lib/generators/reviews/semester1-review-arithmetic.ts
src/lib/generators/reviews/semester1-review-decimals.ts
src/lib/generators/reviews/year-review-arithmetic.ts
src/lib/generators/reviews/year-review-fractions.ts
src/lib/generators/reviews/year-review-comprehensive.ts

tests/unit/generators/reviews/semester1-review-arithmetic.test.ts
tests/unit/generators/reviews/semester1-review-decimals.test.ts
tests/unit/generators/reviews/year-review-arithmetic.test.ts
tests/unit/generators/reviews/year-review-fractions.test.ts
tests/unit/generators/reviews/year-review-comprehensive.test.ts
```

### To modify

- `src/lib/generators/registry.ts`:
  - Add 5 imports
  - Add 5 entries to `liveGenerators`
  - Remove 5 keys from STUB_KEYS (lines 79-83)

### To delete

None.

## Implementation Steps

1. **Confirm Phases 01, 02, 03 merged** — composite generators import from those files.
2. Create `src/lib/generators/reviews/` directory.
3. Implement G4.1 first (smallest sub-pool):
   - Define `SUB_GENERATORS` const with `key` + `gen` tuple shape
   - Implement `generate` (delegate)
   - Implement `validate` (replay seed → identify sub → delegate)
4. Implement G4.2, G4.3, G4.4, G4.5 following same pattern.
5. Update `registry.ts`.
6. Write 5 test files; each must assert:
   - Determinism: same seed → same sub picked → same Q (verify via problemText match)
   - Sub-distribution: 100 random seeds yield ≥3 distinct sub-generators selected (proves uniform pick)
   - validate routing: correct answer for sub generator validates true; wrong answer false
   - format constraint: all 100 random samples emit declared `answerFormat`
7. `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm test:cov`.

## Todo List

- [ ] Verify Phases 01–03 merged (no missing sub-imports)
- [ ] Create `src/lib/generators/reviews/` dir
- [ ] G4.1 semester1-review-arithmetic.ts + test
- [ ] G4.2 semester1-review-decimals.ts + test
- [ ] G4.3 year-review-arithmetic.ts + test
- [ ] G4.4 year-review-fractions.ts + test
- [ ] G4.5 year-review-comprehensive.ts + test
- [ ] Update registry.ts (5 imports/entries; 5 STUB_KEYS removals)
- [ ] All test files green; coverage ≥90%
- [ ] `pnpm typecheck && pnpm lint` clean

## Success Criteria

- 5 STUB_KEYS removed from registry (lines 79-83)
- 5 composite generators resolve through `getGenerator()` to live impl
- For each: 100 random seeds produce only sub-generators from the declared whitelist (no leak)
- `validate` correctly delegates — seeded RNG replay matches generation
- All declared answerFormats consistent across all 100 samples (no DECIMAL leaking into NUMERIC review)
- No regressions in 161 existing tests + ~28 tests added by Phases 01–03

## Risk Assessment

| Risk | P × I | Mitigation |
|---|---|---|
| Sub-generator answerFormat mismatch (e.g. NUMERIC review pulls FRACTION sub) | M × H | Whitelist enforced by SUB_GENERATORS const + test that scans 100 samples for answerFormat |
| Circular import via registry | L × H | Direct file imports only; no `getGenerator()` calls inside reviews |
| `validate` seed-replay drift if RNG state advanced before pick | L × H | Composite calls `rng.pick` IMMEDIATELY after `makeRng(seed)` — no other RNG calls before pick. Tests assert validate(answer)=true on correct answer for 50 samples |
| Phase 01/02/03 not merged when implementing | H × H | Sequence enforced in plan.md; this phase blocked |
| Reviews too repetitive (uniform pick) | L × L | Acceptable for MVP; weighting deferred |
| `metadata.composedFrom` not tracked → harder debug | L × L | Accept; add later if needed |

## Security Considerations

- `import "server-only"` mandatory
- Composite `validate` replays RNG with seed from `q.metadata.seed` — seed is server-side computed, not user-supplied. Safe.
- No new attack surface; sub-generators already audited (server-only, pure)

## Next Steps

- Phase 05: registry hygiene + integration test that exercises composite path end-to-end via `practice.ts` flow

## Locked Decisions (2026-04-25)

- **`year-review-comprehensive` scope:** user intent = "include all G4+G5 implementable generators". Hard constraint: seed mandates `answerFormat=NUMERIC` per skill, and current UI selects ONE input adapter per skill. → Implementation: pull from EVERY sub-generator whose output is NUMERIC (G4 number sense, all arithmetic, measurement, geometry, percent-of-whole). FRACTION/DECIMAL subs EXCLUDED until Phase 14 introduces mixed-format input adapter. This satisfies user intent within MVP constraints.

## Unresolved Questions

- Should `semester1-review-decimals` include `decimal-concept` (curriculum maps it to "Khái niệm số thập phân", not "Phép tính") — schema/PO question. Current plan: include. Validate with PO post-launch.
- Sub-generator weight: uniform vs scaled by curriculum coverage. Current plan: uniform — KISS.
- Should `year-review-comprehensive` ALSO include G5 decimals (the seed labels it g5)? Current plan: NUMERIC-only filter EXCLUDES decimals → unsatisfying. **Open question — recommend revisit:** create a NUMERIC-formatted decimal-derived sub (e.g. ratio answers) OR change skill answerFormat in seed to allow DECIMAL. Defer to PO. **Risk if not resolved:** g5-year-review-comprehensive feels too G4-heavy.
