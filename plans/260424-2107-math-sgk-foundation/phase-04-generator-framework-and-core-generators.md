---
title: "Phase 04 — Generator Framework + 10 Core Generators"
priority: P1
effort: 10h
status: completed
depends_on: [01]
completed: 2026-04-24
---

# Phase 04 — Generator Framework + 10 Core Generators

## Context Links
- Research: `docs/research/researcher-procedural-generators.md` — interface, taxonomy, anti-cheating (§4)
- Research: `docs/research/researcher-math-rendering.md` §5 — Vietnamese comma decimals
- Curriculum research: `docs/research/researcher-curriculum-knt-k45.md` — which skills are `[gen]`

## Overview
Pure-function generator framework. 10 live generators across arithmetic/fractions/decimals/percent. ~50 remaining skills registered as `NotImplementedError` stubs — cooked in future work. Server-only. Client never sees `expectedAnswer`.

## Key Insights
- **Interface from research §1** is canonical. Same shape for live and stub generators.
- **Determinism:** same `(seed, difficulty, skillKey)` → same `Question`. Enables server-side answer verification without DB storage of the answer.
- **seedrandom** not yet installed — add to deps. Alternative is writing a 30-line mulberry32 PRNG (YAGNI: use the library, 4KB gzip).
- **Vietnamese decimals:** store internally `.`, render `,`. Normalize input both ways.

## Requirements
**Functional:**
- Canonical `Generator` interface exported from `src/lib/generators/types.ts`.
- Registry `src/lib/generators/registry.ts` maps `generatorKey` → `Generator`. Every `Skill.generatorKey` in DB has a registry entry (live or stub).
- 10 live generators, each with ≥3 difficulty variants (D1, D2, D3):
  1. `add-sub-100k-carry` (add/sub ≤ 100k with carry/borrow)
  2. `multiply-2-digit`
  3. `divide-2-digit`
  4. `simplify-fraction`
  5. `fraction-common-denominator`
  6. `fraction-add`
  7. `fraction-subtract`
  8. `decimal-add`
  9. `decimal-multiply`
  10. `percent-of-whole`
- Stub generators throw `NotImplementedError(key)` — deliberate so UI surfaces missing content clearly.
- `validate(answer, expected, format)` per format: NUMERIC (int/exact), FRACTION (coprime canonical + equivalent), DECIMAL (±0.01 tolerance), TEXT (normalize case+whitespace), MULTIPLE_CHOICE (string equality).

**Non-functional:**
- Zero DB access in generators. Pure functions.
- `"server-only"` import at module top of every generator file — prevent accidental bundling.
- Each generator ≤150 lines.

## Architecture
```
src/lib/generators/
├── types.ts               # Generator, Question, GeneratorParams, AnswerFormat, Difficulty
├── seeded-rng.ts          # wraps seedrandom; exports makeRng(seed)
├── registry.ts            # Map<string, Generator>
├── stub.ts                # makeStub(key) -> Generator that throws
├── normalize/
│   ├── numeric.ts
│   ├── fraction.ts        # gcd, simplify, equivalence
│   └── decimal.ts         # vietnamese comma handling
├── arithmetic/
│   ├── add-sub-100k-carry.ts
│   ├── multiply-2-digit.ts
│   └── divide-2-digit.ts
├── fractions/
│   ├── simplify-fraction.ts
│   ├── fraction-common-denominator.ts
│   ├── fraction-add.ts
│   └── fraction-subtract.ts
├── decimals/
│   ├── decimal-add.ts
│   └── decimal-multiply.ts
└── percent/
    └── percent-of-whole.ts
```

**Interface (from research §1 with small tweaks):**
```ts
export type Difficulty = 1 | 2 | 3;
export type AnswerFormat = "numeric" | "fraction" | "decimal" | "text" | "multiple-choice";
export interface Fraction { num: number; den: number }
export interface GeneratorParams { seed: string; difficulty: Difficulty; skillKey: string }
export interface Question<T = number | Fraction | string> {
  id: string; // hash(seed + skillKey)
  skillKey: string;
  problemText: string;       // vietnamese, may include KaTeX \frac{}{}
  problemLatex?: string;     // optional full-formula form
  answerFormat: AnswerFormat;
  choices?: string[];        // only for multiple-choice
  expectedAnswer: T;         // SERVER ONLY - Phase 05 strips before send
  metadata: { difficulty: Difficulty; seed: string; skillKey: string; timeEstimateSec: number };
}
export interface Generator<T = unknown> {
  generate(p: GeneratorParams): Question<T>;
  validate(userAnswer: string, q: Question<T>): boolean;
}
```

## Related Code Files
**Create:**
- `src/lib/generators/types.ts`
- `src/lib/generators/seeded-rng.ts`
- `src/lib/generators/stub.ts`
- `src/lib/generators/registry.ts`
- `src/lib/generators/normalize/{numeric,fraction,decimal}.ts`
- 10 generator files (paths above)

**Modify:**
- `package.json` — `npm i seedrandom @types/seedrandom`

## Implementation Steps
1. `npm i seedrandom @types/seedrandom`.
2. Write `types.ts` with interfaces above.
3. Write `seeded-rng.ts`: `export function makeRng(seed: string) { const s = seedrandom(seed); return { int: (min,max)=>..., pick: <T>(arr:T[])=>..., bool: ()=>... } }`.
4. Write `normalize/fraction.ts`: `gcd`, `simplify({num,den})`, `equivalent(a,b)` via `a.num*b.den === b.num*a.den`.
5. Write `normalize/decimal.ts`: `parse(input)` (swap `,` for `.`), `equalsWithTolerance(a,b,tol=0.01)`.
6. Write `normalize/numeric.ts`: `parseInt` with leading-sign, strip whitespace.
7. Write `stub.ts`: `export function makeStub(key: string): Generator { return { generate: () => { throw new Error(`NotImplemented: ${key}`); }, validate: () => false }; }`.
8. Write 10 live generators. Each file pattern:
   ```ts
   import "server-only";
   import { makeRng } from "../seeded-rng";
   export const addSub100kCarry: Generator<number> = {
     generate({ seed, difficulty, skillKey }) {
       const rng = makeRng(seed);
       // difficulty-gated number ranges; ensure carry/borrow per research §3
       const a = rng.int(...); const b = rng.int(...);
       return { id: hash(seed), skillKey, problemText: `${a} + ${b} = ?`, answerFormat: "numeric", expectedAnswer: a+b, metadata:{...} };
     },
     validate(input, q) { return parseInt(input,10) === q.expectedAnswer; }
   };
   ```
9. Write `registry.ts`:
   ```ts
   import { addSub100kCarry } from "./arithmetic/add-sub-100k-carry";
   // ...9 more live imports
   import { makeStub } from "./stub";
   export const GENERATORS: Record<string, Generator> = {
     "add-sub-100k-carry": addSub100kCarry,
     // ... 9 more
     "round-to-nearest-10k": makeStub("round-to-nearest-10k"),
     // ... every other key from seed-data grade-4/5 that is [gen]
   };
   export function getGenerator(key: string): Generator { const g = GENERATORS[key]; if (!g) throw new Error(`Unknown generator: ${key}`); return g; }
   ```
10. Write `ALL_GENERATOR_KEYS` const string array in registry. Phase 12 test asserts superset of DB keys.
11. Smoke-test one generator from a scratch script; verify deterministic output (same seed → same `expectedAnswer`).

## Todo List
- [x] Install seedrandom
- [x] types.ts with Generator + Question
- [x] seeded-rng.ts
- [x] normalize/{numeric,fraction,decimal}.ts
- [x] 10 live generators with 3 difficulty tiers each
- [x] stub.ts factory
- [x] registry.ts covering all generator keys from seed
- [x] Deterministic output verified manually

## Success Criteria
- [x] `getGenerator("add-sub-100k-carry").generate({seed:"x",difficulty:2,skillKey:"..."}).expectedAnswer` is number
- [x] Two calls with same seed → identical question object
- [x] `validate("12", q)` returns `true` when `q.expectedAnswer === 12`
- [x] Every `Skill.generatorKey` in seeded DB exists in `GENERATORS`
- [x] `import "server-only"` is first line of every generator file
- [x] `npm run typecheck` green

## Risk Assessment
**R1 — Carry/borrow not actually enforced (Medium/Medium):** Research §3 requires ≥70% of D2+D3 problems to include carry. Naive RNG won't guarantee this. *Mitigation:* Each generator's D2/D3 path retries RNG until carry detected; cap 5 retries, fall back to forced digits. Unit test in Phase 12 samples 100 seeds and asserts ≥70% have carry.

**R2 — Registry drift from schema (High/High):** A skill added to seed without matching registry entry bricks its practice page. *Mitigation:* Phase 12 integration test loads all skills from DB and asserts `registry.getGenerator(s.generatorKey)` returns without throwing (stub counts as pass because it throws at `generate`, not at lookup — but this test catches the *missing* case).

## Rollback Plan
Generator files are pure; deleting one just breaks its skill. No cascading damage. Drop the import from registry and the skill renders "coming soon" via Phase 08 UI fallback.

## Next Steps
Unblocks Phase 05 (`submitAnswer` uses `getGenerator`), Phase 08 (practice page renders `problemText`).

## Completion Note
10 live generators + 19 stubs in `src/lib/generators/`. Deterministic per seed. Server-only with "server-only" guard. seedrandom installed. Registry covers all skills.
