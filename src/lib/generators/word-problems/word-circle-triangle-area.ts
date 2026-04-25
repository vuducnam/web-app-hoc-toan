import "server-only";
// Word problem generator — area of triangle, trapezoid, circle in real-life contexts.
// g5-word-circle-triangle-area: bài toán diện tích tam giác/hình thang/hình tròn (lớp 5).
// D1: triangle (integer answer); D2: trapezoid (integer answer);
// D3: mix — includes circle with π=3.14 (decimal answer).
// answerFormat: numeric for D1/D2; decimal for D3 circle template.
// π = 3.14 per Vietnamese G5 curriculum.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question, AnswerFormat } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };
const PI = 3.14;

/** Round to 2 decimal places for circle results. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Bases and heights constrained to produce even × even so S = a×h/2 is integer
const TRIANGLE_BASES: Record<number, number[]> = {
  1: [4, 6, 8, 10, 12],
  2: [6, 8, 10, 12, 14, 16],
  3: [8, 10, 12, 14, 16, 18, 20],
};
const TRIANGLE_HEIGHTS: Record<number, number[]> = {
  1: [2, 4, 6, 8],
  2: [4, 6, 8, 10, 12],
  3: [4, 6, 8, 10, 12, 14],
};

// Trapezoid: (a + b) × h / 2 = integer → ensure (a+b) even, h any; or h even
const TRAP_A: Record<number, number[]> = {
  1: [6, 8, 10, 12],
  2: [8, 10, 12, 14, 16],
  3: [10, 12, 14, 16, 18, 20],
};
const TRAP_B: Record<number, number[]> = {
  1: [2, 4, 6],
  2: [4, 6, 8, 10],
  3: [4, 6, 8, 10, 12],
};
const TRAP_H: Record<number, number[]> = {
  1: [4, 6, 8],
  2: [4, 6, 8, 10],
  3: [4, 6, 8, 10, 12],
};

// Circle radii — for D3 only; r chosen so π×r² has at most 2 decimal places
// π=3.14, r²: 1→3.14, 2→12.56, 3→28.26, 4→50.24, 5→78.5, 6→113.04, 7→153.86, 8→200.96
const CIRCLE_RADII: number[] = [1, 2, 3, 4, 5];

// --- Template builders ---

function buildTriangle(a: number, h: number, d: number): {
  problemText: string; expectedAnswer: number; explanation: string; answerFormat: AnswerFormat;
} {
  const S = (a * h) / 2;
  const context = d === 1
    ? `Mảnh vườn hình tam giác có đáy ${a} m và chiều cao ${h} m. Tính diện tích mảnh vườn đó.`
    : `Miếng đất hình tam giác có đáy ${a} m, chiều cao tương ứng ${h} m. Diện tích miếng đất là bao nhiêu m²?`;
  return {
    problemText: context,
    expectedAnswer: S,
    answerFormat: "numeric",
    explanation:
      `**Bài giải:**\n\nDiện tích hình tam giác là:\n\n$S = \\dfrac{a \\times h}{2} = \\dfrac{${a} \\times ${h}}{2} = ${S}$ (m²).\n\n**Đáp số:** ${S} m².`,
  };
}

function buildTrapezoid(a: number, b: number, h: number): {
  problemText: string; expectedAnswer: number; explanation: string; answerFormat: AnswerFormat;
} {
  const S = ((a + b) * h) / 2;
  return {
    problemText: `Mảnh đất hình thang có đáy lớn ${a} m, đáy bé ${b} m và chiều cao ${h} m. Tính diện tích mảnh đất đó.`,
    expectedAnswer: S,
    answerFormat: "numeric",
    explanation:
      `**Bài giải:**\n\nDiện tích hình thang là:\n\n$S = \\dfrac{(a + b) \\times h}{2} = \\dfrac{(${a} + ${b}) \\times ${h}}{2} = \\dfrac{${a + b} \\times ${h}}{2} = ${S}$ (m²).\n\n**Đáp số:** ${S} m².`,
  };
}

function buildCircle(r: number): {
  problemText: string; expectedAnswer: number; explanation: string; answerFormat: AnswerFormat;
} {
  const S = round2(PI * r * r);
  const sStr = toVnFixed(S, 2);
  return {
    problemText: `Chiếc bánh hình tròn có bán kính ${r} cm. Tính diện tích mặt chiếc bánh đó (lấy $\\pi = 3{,}14$).`,
    expectedAnswer: S,
    answerFormat: "decimal",
    explanation:
      `**Bài giải:**\n\nDiện tích hình tròn là:\n\n$S = \\pi \\times r^2 = 3{,}14 \\times ${r}^2 = 3{,}14 \\times ${r * r} = ${sStr}$ (cm²).\n\n**Đáp số:** ${sStr} cm².`,
  };
}

export const wordCircleTriangleArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    let result: {
      problemText: string;
      expectedAnswer: number;
      explanation: string;
      answerFormat: AnswerFormat;
    };

    if (d === 1) {
      // D1: triangle only
      const a = rng.pick(TRIANGLE_BASES[d]);
      const h = rng.pick(TRIANGLE_HEIGHTS[d]);
      result = buildTriangle(a, h, d);
    } else if (d === 2) {
      // D2: triangle or trapezoid
      const useTriangle = rng.bool();
      if (useTriangle) {
        const a = rng.pick(TRIANGLE_BASES[d]);
        const h = rng.pick(TRIANGLE_HEIGHTS[d]);
        result = buildTriangle(a, h, d);
      } else {
        const a = rng.pick(TRAP_A[d]);
        const b = rng.pick(TRAP_B[d]);
        const h = rng.pick(TRAP_H[d]);
        result = buildTrapezoid(a, b, h);
      }
    } else {
      // D3: triangle, trapezoid, or circle
      const choice = rng.int(0, 2); // 0=triangle, 1=trap, 2=circle
      if (choice === 0) {
        const a = rng.pick(TRIANGLE_BASES[d]);
        const h = rng.pick(TRIANGLE_HEIGHTS[d]);
        result = buildTriangle(a, h, d);
      } else if (choice === 1) {
        const a = rng.pick(TRAP_A[d]);
        const b = rng.pick(TRAP_B[d]);
        const h = rng.pick(TRAP_H[d]);
        result = buildTrapezoid(a, b, h);
      } else {
        const r = rng.pick(CIRCLE_RADII);
        result = buildCircle(r);
      }
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: result.problemText,
      answerFormat: result.answerFormat,
      expectedAnswer: result.expectedAnswer,
      explanation: result.explanation,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
      },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    if (q.answerFormat === "decimal") {
      const n = parseVnDecimal(userAnswer);
      if (n === null) return false;
      return equalsWithTolerance(n, q.expectedAnswer);
    }
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
