import "server-only";
// G4 word problem generator — bài toán diện tích/chu vi hình chữ nhật (g4-word-rectangle-area).
// 5 templates: area of rectangle, perimeter of rectangle, find width from perimeter,
//              area of square, perimeter of square. Integer answers guaranteed.
// D1: small dimensions (≤ 20); D2: medium (≤ 50); D3: larger (≤ 100).
// answerFormat: numeric.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question, FigureSpec } from "../types";

const TIME_SEC: Record<number, number> = { 1: 60, 2: 75, 3: 90 };

type TemplateId = "T1" | "T2" | "T3" | "T4" | "T5";
const ALL_TEMPLATES: TemplateId[] = ["T1", "T2", "T3", "T4", "T5"];

interface Built {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
  figure: FigureSpec;
  solutionFigure: FigureSpec;
}

// Dimension ranges per difficulty
const DIM_MAX: Record<number, number> = { 1: 20, 2: 50, 3: 100 };
const DIM_MIN = 2;

function buildTemplate(tpl: TemplateId, rng: ReturnType<typeof makeRng>, d: 1 | 2 | 3): Built {
  const max = DIM_MAX[d];

  switch (tpl) {
    case "T1": {
      // Area of rectangle: S = a × b
      const a = rng.int(DIM_MIN, max);
      const b = rng.int(DIM_MIN, max);
      const area = a * b;
      return {
        problemText:
          `Hình chữ nhật có chiều dài $${a}$ m và chiều rộng $${b}$ m. Tính diện tích hình chữ nhật đó.`,
        expectedAnswer: area,
        explanation:
          `**Bài giải:**\n\nDiện tích hình chữ nhật là:\n\n$S = ${a} \\times ${b} = ${area}$ (m²).\n\n**Đáp số:** ${area} m².`,
        figure: { kind: "rectangle", width: a, height: b, unit: "m" },
        solutionFigure: { kind: "rectangle", width: a, height: b, unit: "m", shaded: true },
      };
    }
    case "T2": {
      // Perimeter of rectangle: P = 2 × (a + b)
      const a = rng.int(DIM_MIN, max);
      const b = rng.int(DIM_MIN, max);
      const perim = 2 * (a + b);
      return {
        problemText:
          `Mảnh đất hình chữ nhật có chiều dài $${a}$ m và chiều rộng $${b}$ m. Tính chu vi mảnh đất đó.`,
        expectedAnswer: perim,
        explanation:
          `**Bài giải:**\n\nChu vi mảnh đất hình chữ nhật là:\n\n$C = 2 \\times (${a} + ${b}) = 2 \\times ${a + b} = ${perim}$ (m).\n\n**Đáp số:** ${perim} m.`,
        figure: { kind: "rectangle", width: a, height: b, unit: "m" },
        solutionFigure: { kind: "rectangle", width: a, height: b, unit: "m" },
      };
    }
    case "T3": {
      // Find width given length and perimeter: b = P/2 - a
      // Ensure result is positive integer: pick b first, compute P
      const b = rng.int(DIM_MIN, Math.floor(max / 2));
      const a = rng.int(b + 1, max); // length > width
      const perim = 2 * (a + b);
      return {
        problemText:
          `Sân vườn hình chữ nhật có chiều dài $${a}$ m và chu vi $${perim}$ m. Tính chiều rộng sân vườn đó.`,
        expectedAnswer: b,
        explanation:
          `**Bài giải:**\n\nNửa chu vi hình chữ nhật là:\n\n$${perim} \\div 2 = ${perim / 2}$ (m).\n\n` +
          `Chiều rộng sân vườn là:\n\n$${perim / 2} - ${a} = ${b}$ (m).\n\n**Đáp số:** ${b} m.`,
        // Show all given info: length on the bottom edge, "?" on the side, perimeter as caption above.
        figure: { kind: "rectangle", width: a, height: "?", unit: "m", perimeter: perim },
        solutionFigure: { kind: "rectangle", width: a, height: b, unit: "m", perimeter: perim, shaded: true },
      };
    }
    case "T4": {
      // Area of square: S = s × s
      const s = rng.int(DIM_MIN, max);
      const area = s * s;
      return {
        problemText:
          `Sân trường hình vuông có cạnh $${s}$ m. Tính diện tích sân trường đó.`,
        expectedAnswer: area,
        explanation:
          `**Bài giải:**\n\nDiện tích sân trường hình vuông là:\n\n$S = ${s} \\times ${s} = ${area}$ (m²).\n\n**Đáp số:** ${area} m².`,
        figure: { kind: "rectangle", width: s, height: s, unit: "m", isSquare: true },
        solutionFigure: { kind: "rectangle", width: s, height: s, unit: "m", isSquare: true, shaded: true },
      };
    }
    case "T5": {
      // Perimeter of square: P = 4 × s
      const s = rng.int(DIM_MIN, max);
      const perim = 4 * s;
      return {
        problemText:
          `Mảnh vườn hình vuông có cạnh $${s}$ m. Tính chu vi mảnh vườn đó.`,
        expectedAnswer: perim,
        explanation:
          `**Bài giải:**\n\nChu vi mảnh vườn hình vuông là:\n\n$C = 4 \\times ${s} = ${perim}$ (m).\n\n**Đáp số:** ${perim} m.`,
        figure: { kind: "rectangle", width: s, height: s, unit: "m", isSquare: true },
        solutionFigure: { kind: "rectangle", width: s, height: s, unit: "m", isSquare: true },
      };
    }
  }
}

export const wordRectangleArea: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const tpl = rng.pick(ALL_TEMPLATES);
    const built = buildTemplate(tpl, rng, d);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: built.problemText,
      answerFormat: "numeric",
      expectedAnswer: built.expectedAnswer,
      explanation: built.explanation,
      figure: built.figure,
      solutionFigure: built.solutionFigure,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
      },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};
