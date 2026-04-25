# Procedural Math Question Generation: Grade 4-5 Elementary Framework

**Research Date:** 2026-04-24  
**Scope:** Elementary math (grade 4-5) procedural generation patterns from Khan Academy, IXL, K5 Learning  
**Focus:** TypeScript implementation patterns, server-side security, reproducibility

---

## 1. Generator Interface (TypeScript)

```typescript
interface GeneratorParams {
  seed: string;           // Deterministic RNG: use seedrandom
  difficulty: 1 | 2 | 3; // 1=intro, 2=standard, 3=advanced
  skillId: string;        // e.g., "add_within_100k_carry"
}

interface Question<T = number | Fraction | Decimal> {
  id: string;
  problemText: string;
  problemLatex?: string;
  expectedAnswer: T;      // NEVER send to client
  answerFormat: "numeric" | "fraction" | "decimal" | "text";
  metadata: {
    difficulty: number;
    seed: string;
    skillId: string;
    timeEstimate: number; // seconds
  };
}

interface Generator<P extends GeneratorParams, T> {
  generate(params: P): Question<T>;
  validate(answer: string | number, expected: T, format: string): boolean;
  normalize(answer: string): T;
}
```

**Key Principle:** expectedAnswer computed server-only. Client receives `problemText` + `answerFormat` only.

---

## 2. Question Type Taxonomy

**MVP Subset (Minimum for Grade 4-5):**
1. **Numeric Input** — Single number answer (e.g., "What is 2 + 3?") → input validation regex
2. **Fraction Input** — Numerator/denominator fields (e.g., "Simplify 4/8" → 1/2)
3. **Decimal Input** — Float with precision tolerance (e.g., 3.14 ±0.01)
4. **Multi-Step Input** — Intermediate answers + final (e.g., "Complete: 12 ÷ 3 = __; __ × 2 = __")
5. **Multiple Choice** — 4-5 options (avoid: answers derived from common errors only; use procedural distractors)
6. **Drag-and-Drop** — Match fractions to decimals, order by size (engagement, not cheating-prone)
7. **Text Input** — Unit answers (e.g., "25 cm²") with normalization (case/space insensitive)

**Out of MVP:** Graphing, coordinate input (higher implementation cost; lower ROI for grade 4-5).

---

## 3. Template Catalog (12 Grade 4-5 Skills)

| Skill | Difficulty Progression | Answer Type | Key Consideration |
|-------|------------------------|-------------|-------------------|
| **Add/Subtract ≤100k with carry/borrow** | D1: 2-digit (no carry) → D2: 3-4 digit (carry) → D3: 5-digit mixed | numeric | Ensure carry/borrow in ≥70% D2+D3 |
| **Multiply 2-3 digit numbers** | D1: single-digit × 2-digit → D2: 2-digit × 2-digit → D3: 3-digit × 2-digit | numeric | Partial products visible in hints |
| **Divide 2-3 digit numbers** | D1: no remainder → D2: with remainder → D3: quotient >10, remainder checked | numeric | Verify remainder < divisor |
| **Fraction simplification** | D1: GCF obvious (÷2) → D2: GCF=3,5 → D3: GCF=6,8,12 | fraction | Generate coprime output; validate |
| **Fraction common denominator** | D1: D2 ≤ 12 → D2: D2 ≤ 20 → D3: D2 ≤ 36 (LCM) | fraction | Pre-compute LCM; include distractors |
| **Fraction arithmetic (+, -, ×, ÷)** | D1: same denominator → D2: unlike; simplify → D3: mixed numbers | fraction | Handle mixed↔improper conversion |
| **Decimal read/write/compare** | D1: tenths/hundredths → D2: thousandths → D3: ordering 5+ decimals | decimal or text | Normalize trailing zeros |
| **Decimal arithmetic (+, -, ×, ÷)** | D1: 0.1–9.9 → D2: 10–99.99 → D3: 100+ with precision rules | decimal | Verify decimal places in product |
| **Unit conversion (area/volume)** | D1: cm²↔m² → D2: cm³↔m³ → D3: mixed units in word problem | text (unit+number) | Reject answers without units |
| **Percentage (grade 5)** | D1: 10%, 25%, 50% of whole → D2: any % of whole → D3: reverse (% given, find whole) | numeric | Accept ±1% for rounding |
| **Perimeter/Area (rect, square, triangle, circle)** | D1: given sides → D2: missing one side (rect) → D3: composite shapes | numeric | Provide formulas in problem; seed shapes |
| **Word problems (1-2 step)** | D1: 1-step, no extraneous info → D2: 1-step with distractor → D3: 2-step hidden relationship | numeric or text | Randomize names, values; validate setup |

---

## 4. Anti-Cheating Enforcement

**CRITICAL:** Never transmit `expectedAnswer` to client.

```typescript
// SERVER ONLY
async function verifyAnswer(
  userId: string,
  problemId: string,
  submittedAnswer: string,
  seed: string // client sends back for reproducibility
): Promise<boolean> {
  // 1. Regenerate expected answer server-side from seed
  const rng = seedrandom(seed);
  const expected = generateQuestion(rng, skill).expectedAnswer;
  
  // 2. Normalize both answers
  const normalized = normalize(submittedAnswer, answerFormat);
  
  // 3. Validate timing (>1s for non-trivial problems; flag <0.5s)
  const elapsed = Date.now() - startTime; // server-tracked
  if (elapsed < 500 && skill !== "single_digit_add") {
    flagForReview(userId, problemId, "suspiciously_fast");
  }
  
  // 4. Check for replay attacks
  if (await isAnswerResubmitted(userId, problemId, seed)) {
    flagForReview(userId, problemId, "replay_attack");
  }
  
  return isEqual(normalized, expected);
}
```

**Key Mitigations:**
- Server computes answers; never expose in source/localStorage
- Seed required on submit; regeneration proves legitimacy
- Timing anomalies (correct answer in <0.5s) → manual review flag
- Track unique (userId, problemId, seed) tuples; block repeats

---

## 5. Difficulty Progression Strategy

**Within-Skill Scaling:**
1. **Parameter ranges** — Expand numerator/denominator/multiplier sizes
2. **Constraint injection** — Force carry/borrow in arithmetic; require simplification in fractions
3. **Contextual complexity** — Move from bare numbers → units → word problems
4. **Error patterns** — D3 includes common-mistake distractors (e.g., forget to simplify)

**Cross-Skill:** Grade 4 → fractions (basics); Grade 5 → decimals + percentages + multi-step word problems.

---

## Recommendations (MVP Execution Order)

1. **Implement seedrandom integration** — Use `import seedrandom from "seedrandom"` (npm package)
2. **Build 3 core generators** — Add/subtract (carry), multiply (2-digit), fractions (simplify) as prototypes
3. **Establish normalization rules** — Write unit tests for each answer format (decimal tolerance ±0.01, fraction coprime check)
4. **Server verification endpoint** — POST `/verify/{skillId}` with seed; regenerate on backend only
5. **Flag suspicious patterns** — Log timing, attempt count, seed reuse

---

## Unresolved Questions

1. **Fraction display format:** Should `1/2` and `0.5` be equivalent for cross-format exercises? (Recommend: no; separate skills)
2. **Word problem randomization:** How many distinct templates per skill (4? 10?) to prevent memorization?
3. **Hint generation:** Should hints be deterministic from seed (reduce server load) or pre-stored?
4. **Accessibility:** How to read LaTeX problems aloud? Consider MathJax + screen-reader testing.

---

**Sources:**
- [Khan/khan-exercises GitHub](https://github.com/Khan/khan-exercises)
- [Khan/perseus: Exercise editor](https://github.com/Khan/perseus)
- [seedrandom library](https://github.com/davidbau/seedrandom)
- [prando: TypeScript PRNG](https://github.com/zeh/prando)
- [Server-side cheating prevention](https://joe-philleo.medium.com/how-to-create-math-tests-where-students-cant-cheat-910388d05cb6)
